# 👶 API Deteksi Stunting Balita (Public & Free Serverless)

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel&style=flat-square)](https://api-stunting-js-eosin.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Runtime: Node.js](https://img.shields.io/badge/Runtime-Node.js%20Native-informational?logo=node.js&style=flat-square)](https://nodejs.org/)
[![CORS: Enabled](https://img.shields.io/badge/CORS-Enabled%20(Public)-brightgreen?style=flat-square)](https://api-stunting-js-eosin.vercel.app/)

API Publik berbasis Machine Learning (*Decision Tree Classifier*) untuk mendeteksi status gizi balita: **Normal**, **Tinggi**, **Stunted (Pendek)**, atau **Severely Stunted (Sangat Pendek)** berdasarkan usia dalam bulan, tinggi badan (cm), dan jenis kelamin.

Model machine learning telah di-rewrite dari Python ke **Native JavaScript** dan di-deploy ke **Vercel Serverless Function** sehingga beroperasi **100% Gratis**, berlatensi eksekusi super cepat (< 2 milidetik), dan siap diintegrasikan langsung ke aplikasi mobile (Flutter/Android/iOS), web, maupun sistem IoT posyandu.

---

## 🌐 Live Production URL

| Layanan | URL Publik | Deskripsi |
|---|---|---|
| **Web UI Playground** | [https://api-stunting-js-eosin.vercel.app/](https://api-stunting-js-eosin.vercel.app/) | Antarmuka web interaktif untuk uji coba live di browser |
| **Endpoint Prediksi Utama** | `https://api-stunting-js-eosin.vercel.app/api/predict` | Endpoint `POST` prediksi status gizi |
| **Endpoint Prediksi (Alias)** | `https://api-stunting-js-eosin.vercel.app/predict` | Jalur alternatif yang di-rewrite otomatis |
| **Health Check & Info** | `https://api-stunting-js-eosin.vercel.app/api` | Info status layanan dan spesifikasi API |

---

## 📋 Spesifikasi Endpoint Prediksi

- **Endpoint:** `/api/predict` (atau `/predict`)
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Authentication:** None (Public Access)
- **CORS:** Diaktifkan untuk semua origin (`*`)

### 1. Request Body Schema

| Parameter | Tipe Data | Wajib | Rentang Nilai | Deskripsi & Contoh |
|---|---|---|---|---|
| `umur_bulan` | `number` | **Ya** | `0` – `60` | Usia anak balita dalam bulan. Contoh: `30` |
| `tinggi_badan_cm` | `number` | **Ya** | `30.0` – `150.0` | Tinggi badan balita dalam centimeter. Contoh: `85.0` |
| `jenis_kelamin_encoded` | `number` / `string` | **Ya** | `0` atau `1` | `0` = Laki-laki, `1` = Perempuan. *(Bisa juga mengirimkan string `"laki-laki"` / `"perempuan"` pada parameter `jenis_kelamin`)* |

#### Contoh Request JSON:
```json
{
  "umur_bulan": 30,
  "tinggi_badan_cm": 85.0,
  "jenis_kelamin_encoded": 0
}
```

---

### 2. Response Schema (HTTP 200 OK)

```json
{
  "prediction_label": "stunted",
  "confidence_score": 1,
  "probabilities": {
    "normal": 0,
    "severely stunted": 0,
    "stunted": 1,
    "tinggi": 0
  },
  "input": {
    "umur_bulan": 30,
    "tinggi_badan_cm": 85,
    "jenis_kelamin_encoded": 0,
    "jenis_kelamin_label": "laki-laki"
  }
}
```

#### Penjelasan Field Response:
* **`prediction_label`** *(string)*: Hasil klasifikasi akhir status gizi balita:
  * `"normal"` : Status gizi normal sesuai kurva pertumbuhan.
  * `"tinggi"` : Balita memiliki tinggi badan di atas rata-rata usianya.
  * `"stunted"` : Mengalami stunting / tubuh pendek (kurang gizi kronis).
  * `"severely stunted"` : Mengalami stunting tingkat berat (sangat pendek).
* **`confidence_score`** *(number, 0.0 – 1.0)*: Tingkat keyakinan / probabilitas tertinggi model atas prediksi yang diberikan.
* **`probabilities`** *(object)*: Rincian persentase sebaran probabilitas untuk seluruh 4 kelas klasifikasi.
* **`input`** *(object)*: Data input yang berhasil diparsing dan dinormalisasi oleh sistem.

---

### 3. Response Error Schema (HTTP 400 Bad Request)

Jika data input tidak valid atau parameter wajib tidak dikirimkan, API akan memberikan respon `400 Bad Request` yang informatif tanpa membuat server crash:

```json
{
  "error": "Umur (bulan) harus berupa angka positif."
}
```

---

## 💻 Contoh Integrasi Kode Klien

Berikut contoh siap pakai untuk memanggil API ini dari berbagai bahasa pemrograman dan framework:

### 1. cURL (Terminal / Command Prompt)
```bash
curl -X POST "https://api-stunting-js-eosin.vercel.app/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "umur_bulan": 30,
    "tinggi_badan_cm": 85.0,
    "jenis_kelamin_encoded": 0
  }'
```

---

### 2. JavaScript / TypeScript (Fetch API di React, Vue, Next.js, atau HTML)
```javascript
async function checkStunting() {
  const response = await fetch('https://api-stunting-js-eosin.vercel.app/api/predict', {
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
  
  if (response.ok) {
    console.log('Status Gizi:', data.prediction_label);
    console.log('Keyakinan:', (data.confidence_score * 100) + '%');
  } else {
    console.error('Error:', data.error);
  }
}

checkStunting();
```

---

### 3. Flutter / Dart (Aplikasi Mobile Android & iOS)
Tambahkan `http` ke `pubspec.yaml`, lalu panggil fungsi berikut:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> predictStunting() async {
  final url = Uri.parse('https://api-stunting-js-eosin.vercel.app/api/predict');

  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'umur_bulan': 30,
        'tinggi_badan_cm': 85.0,
        'jenis_kelamin_encoded': 0, // 0: Laki-laki, 1: Perempuan
      }),
    );

    if (response.statusCode == 200) {
      final jsonResponse = jsonDecode(response.body);
      String status = jsonResponse['prediction_label'];
      num score = jsonResponse['confidence_score'];

      print('Hasil Status Gizi: $status');
      print('Confidence Score: ${(score * 100).toStringAsFixed(1)}%');
    } else {
      print('Request gagal: ${response.body}');
    }
  } catch (e) {
    print('Kesalahan koneksi: $e');
  }
}
```

---

### 4. Kotlin (Android Native dengan Retrofit / OkHttp)
```kotlin
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

fun cekStunting() {
    val client = OkHttpClient()
    val json = """
        {
            "umur_bulan": 30,
            "tinggi_badan_cm": 85.0,
            "jenis_kelamin_encoded": 0
        }
    """.trimIndent()

    val body = json.toRequestBody("application/json; charset=utf-8".toMediaType())
    val request = Request.Builder()
        .url("https://api-stunting-js-eosin.vercel.app/api/predict")
        .post(body)
        .build()

    client.newCall(request).execute().use { response ->
        if (response.isSuccessful) {
            println("Response: " + response.body?.string())
        }
    }
}
```

---

### 5. Python (Requests Library)
```python
import requests

url = "https://api-stunting-js-eosin.vercel.app/api/predict"
payload = {
    "umur_bulan": 30,
    "tinggi_badan_cm": 85.0,
    "jenis_kelamin_encoded": 0
}

response = requests.post(url, json=payload)
data = response.json()

print(f"Status Gizi : {data['prediction_label']}")
print(f"Confidence  : {data['confidence_score'] * 100:.1f}%")
```

---

### 6. PHP / Laravel (Guzzle HTTP / Http Facade)
```php
use Illuminate\Support\Facades\Http;

$response = Http::post('https://api-stunting-js-eosin.vercel.app/api/predict', [
    'umur_bulan' => 30,
    'tinggi_badan_cm' => 85.0,
    'jenis_kelamin_encoded' => 0
]);

if ($response->successful()) {
    $result = $response->json();
    echo "Status: " . $result['prediction_label'];
    echo "Skor  : " . $result['confidence_score'];
}
```

---

## 🛠️ Pengujian Manual Secara Lokal (Offline)

Anda juga dapat menjalankan dan menguji model ini di komputer lokal tanpa internet:

### 1. Menjalankan Tes Cepat via CLI Terminal
```bash
node cli.js 30 85 0
```
*Output menampilkan status gizi, confidence score, dan grafik distribusi probabilitas di terminal.*

### 2. Menjalankan Server Lokal
```bash
node server.js
```
Buka browser di `http://localhost:3000` untuk membuka Web UI Playground lokal.

### 3. Menjalankan Unit Test Otomatis
```bash
node test_predict.js
```
*Menguji 5 skenario kondisi gizi balita dengan akurasi 100%.*

---

## 📁 Struktur Repositori

```
├── api/
│   ├── predict.js          # Serverless function endpoint: POST /api/predict
│   └── index.js            # Serverless function info: GET /api
├── lib/
│   ├── predictor.js        # Engine inferensi Decision Tree JavaScript
│   └── model_tree.json     # Struktur pohon keputusan (2.067 node hasil ekstraksi)
├── public/
│   └── index.html          # Web UI playground & dokumentasi live interaktif
├── cli.js                  # Tool CLI untuk pengujian instan lewat terminal
├── server.js               # Server lokal (0 dependencies) untuk testing offline
├── test_predict.js         # Script automated unit testing
├── vercel.json             # Konfigurasi routing rewrite & header CORS Vercel
├── .vercelignore           # Filter file agar deployment Vercel super cepat (<100KB)
└── package.json            # Konfigurasi manifest Node.js
```

---

## 📜 Lisensi
Proyek ini dilisensikan di bawah **MIT License**. Bebas digunakan untuk keperluan penelitian, skripsi, prototipe, maupun integrasi sistem kesehatan masyarakat.
