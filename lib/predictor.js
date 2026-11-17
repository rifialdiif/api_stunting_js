const fs = require('fs');
const path = require('path');

// Muat model pohon keputusan dari file JSON
const modelPath = path.join(__dirname, 'model_tree.json');
const treeData = JSON.parse(fs.readFileSync(modelPath, 'utf8'));

const { left, right, feature, threshold, values, classes } = treeData;

/**
 * Normalisasi input jenis kelamin
 * Menerima angka (0/1) atau teks ('laki-laki', 'perempuan', 'male', 'female', dll)
 */
function normalizeGender(input) {
  if (input === 0 || input === '0') return { encoded: 0, label: 'laki-laki' };
  if (input === 1 || input === '1') return { encoded: 1, label: 'perempuan' };

  if (typeof input === 'string') {
    const lower = input.trim().toLowerCase();
    if (['laki-laki', 'laki', 'pria', 'cowok', 'male', 'l', 'm'].includes(lower)) {
      return { encoded: 0, label: 'laki-laki' };
    }
    if (['perempuan', 'wanita', 'cewek', 'female', 'p', 'f'].includes(lower)) {
      return { encoded: 1, label: 'perempuan' };
    }
  }

  return null;
}

/**
 * Prediksi status gizi balita menggunakan Decision Tree
 * @param {number} umur_bulan - Usia dalam bulan (contoh: 30)
 * @param {number} tinggi_badan_cm - Tinggi badan dalam cm (contoh: 85.0)
 * @param {number|string} jenis_kelamin - 0/1 atau 'laki-laki'/'perempuan'
 */
function predictStunting(umur_bulan, tinggi_badan_cm, jenis_kelamin) {
  const genderInfo = normalizeGender(jenis_kelamin);
  if (genderInfo === null) {
    throw new Error("Jenis kelamin tidak valid. Gunakan 0 / 'laki-laki' atau 1 / 'perempuan'.");
  }

  const umur = parseFloat(umur_bulan);
  const tinggi = parseFloat(tinggi_badan_cm);

  if (isNaN(umur) || umur < 0) {
    throw new Error('Umur (bulan) harus berupa angka positif.');
  }

  if (isNaN(tinggi) || tinggi <= 0) {
    throw new Error('Tinggi badan (cm) harus berupa angka positif.');
  }

  const features = [umur, tinggi, genderInfo.encoded];

  // Penelusuran pohon keputusan (Decision Tree Traversal)
  let curr = 0;
  while (left[curr] !== -1) {
    const featIdx = feature[curr];
    const threshVal = threshold[curr];
    if (features[featIdx] <= threshVal) {
      curr = left[curr];
    } else {
      curr = right[curr];
    }
  }

  const leafValues = values[curr];

  // Cari kelas dengan probabilitas tertinggi
  let maxIdx = 0;
  let maxScore = leafValues[0];
  for (let i = 1; i < leafValues.length; i++) {
    if (leafValues[i] > maxScore) {
      maxScore = leafValues[i];
      maxIdx = i;
    }
  }

  const predictionLabel = classes[maxIdx];

  // Buat objek probabilitas per kelas
  const probabilities = {};
  for (let i = 0; i < classes.length; i++) {
    probabilities[classes[i]] = leafValues[i];
  }

  return {
    prediction_label: predictionLabel,
    confidence_score: maxScore,
    probabilities: probabilities,
    input: {
      umur_bulan: umur,
      tinggi_badan_cm: tinggi,
      jenis_kelamin_encoded: genderInfo.encoded,
      jenis_kelamin_label: genderInfo.label
    }
  };
}

/**
 * Prediksi batch (banyak data sekaligus, misal untuk data Posyandu)
 * @param {Array<Object>} items - Array of data balita
 */
function predictBatch(items) {
  if (!Array.isArray(items)) {
    throw new Error('Input batch harus berupa array.');
  }

  return items.map((item, idx) => {
    try {
      const umur = item.umur_bulan !== undefined ? item.umur_bulan : item.umur;
      const tinggi = item.tinggi_badan_cm !== undefined ? item.tinggi_badan_cm : (item.tinggi_badan || item.tinggi);
      const gender = item.jenis_kelamin_encoded !== undefined 
        ? item.jenis_kelamin_encoded 
        : (item.jenis_kelamin !== undefined ? item.jenis_kelamin : item.gender);

      const res = predictStunting(umur, tinggi, gender);
      return {
        id: item.id !== undefined ? item.id : idx + 1,
        success: true,
        ...res
      };
    } catch (err) {
      return {
        id: item.id !== undefined ? item.id : idx + 1,
        success: false,
        error: err.message
      };
    }
  });
}

module.exports = {
  predictStunting,
  predictBatch,
  normalizeGender,
  classes
};

