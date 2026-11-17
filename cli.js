const readline = require('readline');
const { predictStunting } = require('./lib/predictor');

function printResult(result) {
  console.log('\n================ HASIL PREDIKSI ================');
  console.log(`Input Data         : Umur ${result.input.umur_bulan} bln, TB ${result.input.tinggi_badan_cm} cm, ${result.input.jenis_kelamin_label}`);
  console.log(`Status Gizi        : ${result.prediction_label.toUpperCase()}`);
  console.log(`Confidence Score   : ${(result.confidence_score * 100).toFixed(1)}%`);
  console.log('Probabilitas Kelas :');
  for (const [cls, prob] of Object.entries(result.probabilities)) {
    const bar = '█'.repeat(Math.round(prob * 20));
    console.log(`  - ${cls.padEnd(16)}: ${(prob * 100).toFixed(1)}% \t${bar}`);
  }
  console.log('================================================\n');
}

async function main() {
  const args = process.argv.slice(2);

  // Jika argumen diberikan lewat CLI: node cli.js <umur> <tinggi> <gender>
  if (args.length >= 3) {
    const umur = parseFloat(args[0]);
    const tinggi = parseFloat(args[1]);
    const gender = args[2];
    try {
      const result = predictStunting(umur, tinggi, gender);
      printResult(result);
    } catch (err) {
      console.error('\n❌ Error:', err.message);
    }
    return;
  }

  // Jika tanpa argumen, jalankan mode tanya-jawab interaktif
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

  console.log('========================================================');
  console.log('       TEST MANUAL PREDIKSI STUNTING (CLI)');
  console.log('========================================================\n');

  try {
    const umurStr = await ask('1. Masukkan Umur balita dalam bulan (misal: 30): ');
    const tinggiStr = await ask('2. Masukkan Tinggi Badan dalam cm (misal: 85.0): ');
    console.log('\nPilihan Jenis Kelamin:');
    console.log('  [0] Laki-laki');
    console.log('  [1] Perempuan');
    const genderInput = await ask('3. Masukkan Jenis Kelamin (0 atau 1): ');

    const result = predictStunting(parseFloat(umurStr), parseFloat(tinggiStr), genderInput.trim());
    printResult(result);
  } catch (err) {
    console.error('\n❌ Terjadi Kesalahan:', err.message);
  } finally {
    rl.close();
  }
}

main();
