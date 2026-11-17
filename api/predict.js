const { predictStunting } = require('../lib/predictor');

/**
 * Helper CORS headers untuk akses public gratis dari browser/frontend/mobile app
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

/**
 * Serverless function handler untuk Vercel
 */
module.exports = async (req, res) => {
  setCorsHeaders(res);

  // Tangani preflight OPTIONS request dari browser
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Jika diakses dengan GET, tampilkan panduan penggunaan endpoint
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Gunakan method POST untuk melakukan prediksi status gizi stunting.',
      endpoint: '/api/predict',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      example_body: {
        umur_bulan: 30,
        tinggi_badan_cm: 85.0,
        jenis_kelamin_encoded: 0
      },
      keterangan_jenis_kelamin: {
        "0": "laki-laki",
        "1": "perempuan",
        "catatan": "Bisa juga mengirimkan string 'laki-laki' atau 'perempuan' pada field jenis_kelamin."
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: `Method ${req.method} tidak didukung. Gunakan POST.`
    });
  }

  try {
    // Vercel otomatis mem-parsing req.body jika JSON, namun kita beri fallback jika raw string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (err) {
        return res.status(400).json({ error: 'Format JSON body tidak valid.' });
      }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        error: 'Request body kosong atau tidak valid. Kirimkan JSON object dengan atribut umur_bulan, tinggi_badan_cm, dan jenis_kelamin_encoded.'
      });
    }

    // Ambil field dengan dukungan berbagai alias penamaan
    const umur = body.umur_bulan !== undefined ? body.umur_bulan : body.umur;
    const tinggi = body.tinggi_badan_cm !== undefined ? body.tinggi_badan_cm : (body.tinggi_badan || body.tinggi);
    const gender = body.jenis_kelamin_encoded !== undefined 
      ? body.jenis_kelamin_encoded 
      : (body.jenis_kelamin !== undefined ? body.jenis_kelamin : body.gender);

    if (umur === undefined || tinggi === undefined || gender === undefined) {
      return res.status(400).json({
        error: 'Data input belum lengkap. Field wajib: umur_bulan, tinggi_badan_cm, jenis_kelamin_encoded.',
        received: body
      });
    }

    // Eksekusi prediksi menggunakan model Decision Tree JavaScript
    const result = predictStunting(umur, tinggi, gender);

    // Format response kompatibel 100% dengan FastAPI sebelumnya + data tambahan
    return res.status(200).json({
      prediction_label: result.prediction_label,
      confidence_score: result.confidence_score,
      probabilities: result.probabilities,
      input: result.input
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message || 'Terjadi kesalahan saat memproses prediksi.'
    });
  }
};

