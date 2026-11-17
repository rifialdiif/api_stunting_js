function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'online',
    service: 'API Deteksi Stunting (JavaScript / Vercel Serverless)',
    version: '2.0.0',
    description: 'API publik berbasis Machine Learning (Decision Tree) untuk memprediksi status gizi balita dengan cepat, akurat, dan gratis.',
    endpoints: {
      predict: {
        path: '/api/predict',
        method: 'POST',
        content_type: 'application/json',
        body_example: {
          umur_bulan: 30,
          tinggi_badan_cm: 85.0,
          jenis_kelamin_encoded: 0
        }
      },
      health: {
        path: '/api',
        method: 'GET'
      }
    },
    documentation: 'Buka URL utama di browser untuk tampilan interaktif web UI testing.'
  });
};

