# API Deteksi Stunting Balita (JavaScript / Vercel Serverless)

API Publik berbasis Machine Learning untuk mendeteksi status gizi balita (*Normal*, *Tinggi*, *Stunted*, atau *Severely Stunted*) berdasarkan usia, tinggi badan, dan jenis kelamin.

Model *Decision Tree* dari scikit-learn telah di-rewrite sepenuhnya ke dalam **Native JavaScript** sehingga dapat dideploy ke **Vercel Serverless Function** secara **100% Gratis**, tanpa memerlukan runtime Python/C++, dengan latensi eksekusi super cepat (< 1 milidetik).

---

## Keunggulan Versi JavaScript (Vercel)

| Fitur | Versi Python (FastAPI Sebelumnya) | Versi JavaScript Native (Baru) |
|---|---|---|
| **Platform Target** | Server VPS / Docker / Container | Vercel Serverless (Hobby Plan Free) |
| **Biaya Hosting** | Berbayar untuk VPS / Container | **100% Gratis** |
| **Cold Start** | 3.000 - 8.000 ms (Muat Scikit-learn) | **< 5 ms (Instan)** |
| **Kecepatan Inferensi**| ~1 ms | **~0.0005 ms (0.5 mikrodetik)** |
| **Ukuran Bundle** | ~200 MB (Python + Sklearn + Scipy) | **< 100 KB (Pure JS + JSON Tree)** |
| **CORS** | Perlu konfigurasi manual | **Sudah include CORS (Akses Publik Bebas)** |
| **Web UI Testing** | Swagger UI biasa | **Modern Interactive Web UI included** |

---

## Struktur Proyek

```
model_stunting_ver_js/
├── api/
│   ├── predict.js          # Vercel Serverless Function: POST /api/predict
│   └── index.js            # Vercel Serverless Function: GET /api
├── lib/
│   ├── predictor.js        # Engine inferensi Decision Tree JavaScript
│   └── model_tree.json     # Data pohon keputusan (2.067 node hasil ekstraksi)
├── public/
│   └── index.html          # Web UI interaktif & playground testing API
├── datasets/               # Dataset CSV asli
├── model/                  # File pkl asli (Python) & model_tree.json
├── server.js               # Web server lokal untuk testing offline (0 dependencies)
├── test_predict.js         # Script automated unit test
├── vercel.json             # Konfigurasi routing & header CORS Vercel
├── .vercelignore           # Filter file agar deployment Vercel super ringan (<100KB)
└── package.json            # Manifest Node.js
```

---

## Endpoint API

### 1. Prediksi Status Gizi Balita

- **URL:** `/api/predict` (atau alias `/predict`)
- **Method:** `POST`
- **Content-Type:** `application/json`

#### Request Body

| Field | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `umur_bulan` | `number` | Ya | Usia balita dalam bulan (contoh: `30`) |
| `tinggi_badan_cm` | `number` | Ya | Tinggi badan balita dalam cm (contoh: `85.0`) |
| `jenis_kelamin_encoded` | `number` / `string` | Ya | `0` untuk laki-laki, `1` untuk perempuan. <br>*(Bisa juga mengirimkan string `"laki-laki"` atau `"perempuan"`)* |

#### Contoh Request JSON:
```json
{
  "umur_bulan": 30,
  "tinggi_badan_cm": 85.0,
  "jenis_kelamin_encoded": 0
}
```

#### Contoh Response JSON (HTTP 200 OK):
```json
{
  "prediction_label": "stunted",
  "confidence_score": 1.0,
  "probabilities": {
    "normal": 0.0,
    "severely stunted": 0.0,
    "stunted": 1.0,
    "tinggi": 0.0
  },
  "input": {
    "umur_bulan": 30,
    "tinggi_badan_cm": 85,
    "jenis_kelamin_encoded": 0,
    "jenis_kelamin_label": "laki-laki"
  }
}
```

> **Catatan Kompatibilitas:** Field `prediction_label` dan `confidence_score` 100% identik dengan API FastAPI lama, sehingga aplikasi mobile atau web yang sudah ada tidak perlu mengubah kode parsing hasil.

---

### 2. Interactive Web UI & API Health

- **URL:** `/`
- **Method:** `GET`
- **Deskripsi:** Menampilkan halaman web responsif dengan kalkulator prediksi interaktif, visualisasi probabilitas, dan dokumentasi cuplikan kode.

---

## Menjalankan Secara Lokal (Offline)

Anda dapat menguji API ini di komputer lokal tanpa perlu koneksi internet:

### 1. Jalankan Unit Test:
```bash
node test_predict.js
```
*Output akan memverifikasi 5 skenario status gizi dengan akurasi 100%.*

### 2. Jalankan Server Lokal:
```bash
node server.js
```
Akses di browser: `http://localhost:3000`

---

## Cara Deploy ke Vercel (Gratis & Publik)

Ada dua cara mudah untuk mendeploy proyek ini ke Vercel:

### Opsi A: Deploy via GitHub (Direkomendasikan)

1. Buat repository baru di [GitHub](https://github.com/new) (misal: `stunting-api-js`).
2. Masukkan dan push source code ke repository Anda:
   ```bash
   git add .
   git commit -m "feat: rewrite stunting model to javascript serverless"
   git remote add origin https://github.com/<username-anda>/<nama-repo>.git
   git branch -M main
   git push -u origin main
   ```
3. Buka dashboard [Vercel](https://vercel.com) dan login (bisa login dengan akun GitHub).
4. Klik tombol **"Add New..."** &rarr; **"Project"**.
5. Pilih repository GitHub Anda, lalu klik **"Deploy"**.
6. Selesai! Dalam ~20 detik, Vercel akan memberikan domain publik gratis dengan SSL HTTPS aktif:
   ```
   https://stunting-api-js.vercel.app
   ```

---

### Opsi B: Deploy Langsung via Vercel CLI

1. Buka terminal di folder proyek ini.
2. Jalankan perintah Vercel:
   ```bash
   npx vercel
   ```
3. Ikuti panduan interaktif di terminal:
   - *Set up and deploy?* &rarr; ketik `y` lalu Enter.
   - *Which scope?* &rarr; pilih akun Anda.
   - *Link to existing project?* &rarr; ketik `n`.
   - *What's your project's name?* &rarr; tekan Enter (default).
   - *In which directory is your code located?* &rarr; tekan Enter (`./`).
4. Untuk deployment versi production publik:
   ```bash
   npx vercel --prod
   ```

---

## Contoh Kode Integrasi Klien

### 1. cURL (Terminal / Postman)
```bash
curl -X POST "https://<your-vercel-domain>.vercel.app/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "umur_bulan": 30,
    "tinggi_badan_cm": 85.0,
    "jenis_kelamin_encoded": 0
  }'
```

### 2. JavaScript / TypeScript (React, Vue, Next.js, HTML)
```javascript
const response = await fetch('https://<your-vercel-domain>.vercel.app/api/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    umur_bulan: 30,
    tinggi_badan_cm: 85.0,
    jenis_kelamin_encoded: 0 // 0: laki-laki, 1: perempuan
  })
});

const data = await response.json();
console.log('Status Gizi:', data.prediction_label);
console.log('Confidence:', data.confidence_score);
```

### 3. Flutter / Dart (Aplikasi Mobile)
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> checkStunting() async {
  final url = Uri.parse('https://<your-vercel-domain>.vercel.app/api/predict');
  final res = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'umur_bulan': 30,
      'tinggi_badan_cm': 85.0,
      'jenis_kelamin_encoded': 0,
    }),
  );

  if (res.statusCode == 200) {
    final data = jsonDecode(res.body);
    print('Status: ${data["prediction_label"]}');
    print('Skor: ${data["confidence_score"]}');
  }
}
```

### 4. Python (Requests)
```python
import requests

url = "https://<your-vercel-domain>.vercel.app/api/predict"
payload = {
    "umur_bulan": 30,
    "tinggi_badan_cm": 85.0,
    "jenis_kelamin_encoded": 0
}
res = requests.post(url, json=payload)
print(res.json())
```

---

## Lisensi
MIT License. Bebas digunakan untuk keperluan riset, skripsi, maupun pengembangan aplikasi kesehatan masyarakat.
