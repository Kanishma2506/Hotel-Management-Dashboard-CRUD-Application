const fs = require('fs');
const path = require('path');
const http = require('http');

const BASE_URL = 'http://localhost:5000';

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        ...headers,
      },
    };

    let bodyData = null;
    if (Buffer.isBuffer(data)) {
      bodyData = data;
      options.headers['Content-Length'] = data.length;
    } else if (data && !headers['Content-Type']) {
      bodyData = JSON.stringify(data);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(bodyData);
    } else if (data && typeof data === 'string') {
      bodyData = data;
      options.headers['Content-Length'] = Buffer.byteLength(bodyData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, body, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (bodyData) req.write(bodyData);
    req.end();
  });
}

async function runTests() {
  console.log('=== RUNNING BACKEND SUITE VERIFICATION ===\n');

  // 1. Health Check
  const health = await request('GET', '/api/health');
  console.log('[1] Health Check:', health.status === 200 && health.body.success ? 'PASS' : 'FAIL', health.body);

  // 2. GET /api/hotels
  const allHotels = await request('GET', '/api/hotels');
  console.log('[2] GET /api/hotels default:', allHotels.status === 200 && allHotels.body.pagination.total === 100 && allHotels.body.data.length === 10 ? 'PASS' : 'FAIL', {
    total: allHotels.body.pagination?.total,
    count: allHotels.body.data?.length,
  });

  // 3. Search & Price Filter
  const filtered = await request('GET', '/api/hotels?title=chennai&minPrice=2000&maxPrice=5000&offset=0&limit=5');
  console.log('[3] GET /api/hotels with search & price filters:', filtered.status === 200 ? 'PASS' : 'FAIL', {
    total: filtered.body.pagination?.total,
    count: filtered.body.data?.length,
    firstItem: filtered.body.data?.[0]?.title,
  });

  // 4. GET /api/hotels/:id (Found)
  const single = await request('GET', '/api/hotels/1');
  console.log('[4] GET /api/hotels/1:', single.status === 200 && single.body.data?.id === 1 ? 'PASS' : 'FAIL', single.body.data?.title);

  // 5. GET /api/hotels/99999 (404)
  const notFound = await request('GET', '/api/hotels/99999');
  console.log('[5] GET /api/hotels/99999 (404 check):', notFound.status === 404 && !notFound.body.success ? 'PASS' : 'FAIL', notFound.body.message);

  // 6. POST /api/hotels (Validation Error check)
  const invalidPost = await request('POST', '/api/hotels', {
    title: 'ab', // short
    description: 'short', // short
    price: -100, // negative
    latitude: 200, // out of range
    longitude: 80,
  });
  console.log('[6] POST invalid input (400 check):', invalidPost.status === 400 && !invalidPost.body.success ? 'PASS' : 'FAIL', invalidPost.body.errors);

  // 7. POST /api/hotels (Valid creation)
  const validPost = await request('POST', '/api/hotels', {
    title: 'New Luxury Palace Hotel',
    description: 'A brand new state-of-the-art hotel built near the beach with incredible amenities.',
    latitude: 13.0827,
    longitude: 80.2707,
    price: 9500,
    rating: 4.9,
    reviews: 12,
  });
  console.log('[7] POST create hotel (201 check):', validPost.status === 201 && validPost.body.success ? 'PASS' : 'FAIL', {
    id: validPost.body.data?.id,
    title: validPost.body.data?.title,
  });

  const createdId = validPost.body.data?.id;

  // 8. PUT /api/hotels/:id
  const putUpdate = await request('PUT', `/api/hotels/${createdId}`, {
    title: 'New Luxury Palace Hotel Updated',
    price: 9900,
  });
  console.log('[8] PUT update hotel (200 check):', putUpdate.status === 200 && putUpdate.body.data?.title === 'New Luxury Palace Hotel Updated' ? 'PASS' : 'FAIL', {
    title: putUpdate.body.data?.title,
    price: putUpdate.body.data?.price,
    image: putUpdate.body.data?.image, // verify existing image retained
  });

  // 9. Multipart Image Upload Test
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const dummyImageContent = Buffer.from('fake image content png data');
  let body = '';
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="title"\r\n\r\nUploaded Hotel With Image\r\n';
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="description"\r\n\r\nThis is a sample hotel uploaded with a real image attachment.\r\n';
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="latitude"\r\n\r\n12.9716\r\n';
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="longitude"\r\n\r\n77.5946\r\n';
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="price"\r\n\r\n4500\r\n';
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="image"; filename="sample.png"\r\n';
  body += 'Content-Type: image/png\r\n\r\n';
  const payloadBuffer = Buffer.concat([
    Buffer.from(body),
    dummyImageContent,
    Buffer.from(`\r\n--${boundary}--\r\n`)
  ]);

  const uploadRes = await request('POST', '/api/hotels', payloadBuffer, {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
  });
  console.log('[9] POST multipart image upload:', uploadRes.status === 201 && uploadRes.body.data?.image?.startsWith('/uploads/hotels/') ? 'PASS' : 'FAIL', uploadRes.body.data?.image);

  const uploadedId = uploadRes.body.data?.id;
  const imagePath = uploadRes.body.data?.image;

  // 10. Verify uploaded image accessible via static endpoint
  if (imagePath) {
    const staticImageRes = await request('GET', imagePath);
    console.log('[10] GET static image endpoint:', staticImageRes.status === 200 ? 'PASS' : 'FAIL');
  }

  // 11. DELETE /api/hotels/:id
  const deleteRes = await request('DELETE', `/api/hotels/${createdId}`);
  console.log('[11] DELETE created hotel:', deleteRes.status === 200 ? 'PASS' : 'FAIL', deleteRes.body.message);

  if (uploadedId) {
    const deleteRes2 = await request('DELETE', `/api/hotels/${uploadedId}`);
    console.log('[12] DELETE uploaded hotel with image file cleanup:', deleteRes2.status === 200 ? 'PASS' : 'FAIL', deleteRes2.body.message);
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
}

runTests().catch(console.error);
