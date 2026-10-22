'use strict';
// Pretor: retrato em /avatares/<arquivo> do próprio servidor é lido do disco, sem baixar (a rota pede sessão).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { criarAvatar } = require('../lib/avatar');

test('retrato local é servido do disco sem chamar a rede', async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'avatar-local-'));
  fs.mkdirSync(path.join(dataDir, 'avatares'));
  fs.writeFileSync(path.join(dataDir, 'avatares', 'aro.jpg'), Buffer.from([0xff, 0xd8, 0xff, 0xd9]));
  let chamou = false;
  const av = criarAvatar({ dataDir, log() {}, buscar: async () => { chamou = true; throw new Error('não devia baixar'); } });
  const cab = {}; let corpo = Buffer.alloc(0);
  const res = new (require('node:stream').Writable)({ write(c, e, cb) { corpo = Buffer.concat([corpo, c]); cb(); } });
  res.writeHead = (s, h) => { cab.status = s; Object.assign(cab, h); };
  const fim = new Promise(r => res.on('finish', r));
  const falha = await av.servir({ headers: {}, method: 'GET' }, res, { slug: 'jasper', avatar: 'https://exemplo.test/avatares/aro.jpg?v=2' });
  assert.strictEqual(falha, null);
  await fim;
  assert.strictEqual(chamou, false);
  assert.strictEqual(cab.status, 200);
  assert.strictEqual(cab['Content-Type'], 'image/jpeg');
  assert.strictEqual(corpo.length, 4);
});
