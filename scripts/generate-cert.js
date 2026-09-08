const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

const certDirectory = path.join(__dirname, '..', 'src', 'config', 'cert');
const attributes = [{ name: 'commonName', value: 'localhost' }];
const { private: privateKey, cert } = selfsigned.generate(attributes, {
  days: 365,
  keySize: 2048,
  algorithm: 'sha256',
  extensions: [
    {
      name: 'subjectAltName',
      altNames: [{ type: 2, value: 'localhost' }]
    }
  ]
});

fs.mkdirSync(certDirectory, { recursive: true });
fs.writeFileSync(path.join(certDirectory, 'key.pem'), privateKey);
fs.writeFileSync(path.join(certDirectory, 'cert.pem'), cert);
console.log('Generated local HTTPS certificates in src/config/cert');
