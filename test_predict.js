const { predictStunting, classes } = require('./lib/predictor');

console.log('--- MENJALANKAN TEST UNIT PREDIKSI STUNTING (JAVASCRIPT) ---\n');

const testCases = [
  { umur: 30, tinggi: 85.0, gender: 0, expected: 'stunted', desc: 'Balita 30 bln, TB 85cm, Laki-laki' },
  { umur: 10, tinggi: 60.0, gender: 1, expected: 'severely stunted', desc: 'Balita 10 bln, TB 60cm, Perempuan' },
  { umur: 45, tinggi: 105.0, gender: 0, expected: 'normal', desc: 'Balita 45 bln, TB 105cm, Laki-laki' },
  { umur: 12, tinggi: 75.0, gender: 'laki-laki', expected: 'normal', desc: 'Balita 12 bln, TB 75cm, teks "laki-laki"' },
  { umur: 0, tinggi: 57.0, gender: 'laki-laki', expected: 'tinggi', desc: 'Balita 0 bln, TB 57cm, teks "laki-laki"' }
];

let passed = 0;
testCases.forEach((tc, idx) => {
  const result = predictStunting(tc.umur, tc.tinggi, tc.gender);
  const isMatch = result.prediction_label === tc.expected;
  if (isMatch) passed++;

  console.log(`[Test ${idx + 1}] ${tc.desc}`);
  console.log(`  -> Hasil Prediksi : ${result.prediction_label} (Confidence: ${(result.confidence_score * 100).toFixed(0)}%)`);
  console.log(`  -> Ekspektasi     : ${tc.expected}`);
  console.log(`  -> Status         : ${isMatch ? '✅ PASSED' : '❌ FAILED'}\n`);
});

console.log(`Hasil Pengujian: ${passed}/${testCases.length} Passed!`);
if (passed === testCases.length) {
  console.log('Semua unit test berhasil dengan 100% akurasi!');
} else {
  process.exit(1);
}
