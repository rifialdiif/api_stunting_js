const http = require('http');
const fs = require('fs');
const path = require('path');
const predictHandler = require('./api/predict');
const indexHandler = require('./api/index');

const PORT = process.env.PORT || 3000;

// Helper adapter agar request/response Node.js native dapat bekerja persis seperti di Vercel
function adaptResponse(res) {
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  res.json = function (data) {
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify(data, null, 2));
    return res;
  };
  return res;
}

const server = http.createServer((req, res) => {
  adaptResponse(res);

  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // Baca body jika request method POST / PUT
  if (req.method === 'POST' || req.method === 'PUT') {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
    });
    req.on('end', () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch (err) {
        req.body = bodyData;
      }

      routeRequest(pathname, req, res);
    });
  } else {
    routeRequest(pathname, req, res);
  }
});

function routeRequest(pathname, req, res) {
  // 1. Endpoint Prediksi
  if (pathname === '/api/predict' || pathname === '/predict') {
    return predictHandler(req, res);
  }

  // 2. Endpoint Info API
  if (pathname === '/api' || pathname === '/api/index') {
    return indexHandler(req, res);
  }

  // 3. Static Web UI di folder public
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    return fs.createReadStream(filePath).pipe(res);
  }

  // 4. Default fallback untuk root jika file index.html belum ada
  if (pathname === '/') {
    return indexHandler(req, res);
  }

  // 404
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
}

server.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`  Stunting Prediction Serverless API (Node.js)`);
  console.log(`======================================================`);
  console.log(`  Local URL      : http://localhost:${PORT}`);
  console.log(`  Web Testing UI : http://localhost:${PORT}`);
  console.log(`  Predict API    : http://localhost:${PORT}/api/predict`);
  console.log(`                   http://localhost:${PORT}/predict`);
  console.log(`======================================================`);
});

