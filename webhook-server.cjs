const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const secret = process.env.WEBHOOK_SECRET || fs.readFileSync(
  process.env.WEBHOOK_SECRET_FILE || '/etc/jaisonblog/webhook.secret', 'utf8'
).trim();
if (!secret) throw new Error('A webhook secret is required');
const repository = process.env.GITHUB_REPOSITORY || 'jaisonZheng/JaisonBlog';
const branch = process.env.GIT_BRANCH || 'main';
const script = process.env.DEPLOY_SCRIPT_PATH || path.join(__dirname, 'deploy.sh');
let running = false;
let queued = false;
const deliveries = new Set();
function deploy() {
  if (running) { queued = true; return; }
  running = true;
  queued = false;
  const child = spawn('/bin/bash', [script], { cwd: __dirname, stdio: 'inherit' });
  let finished = false;
  const finish = (code) => {
    if (finished) return;
    finished = true;
    running = false;
    console.log(`Deployment exited with ${code}`);
    if (queued) deploy();
  };
  child.on('error', (error) => { console.error(error); finish(1); });
  child.on('close', finish);
}
const server = http.createServer((req, res) => {
  const reply = (status, text) => { res.writeHead(status, { 'Content-Type': 'text/plain' }); res.end(text); };
  if (req.method !== 'POST' || req.url !== '/webhook') return reply(404, 'Not found');
  const chunks = [];
  let size = 0;
  let tooLarge = false;
  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > 2 * 1024 * 1024) {
      if (!tooLarge) reply(413, 'Payload too large');
      tooLarge = true;
      return;
    }
    if (!tooLarge) chunks.push(chunk);
  });
  req.on('error', (error) => console.error('Request error:', error.message));
  req.on('end', () => {
    if (tooLarge) return;
    const body = Buffer.concat(chunks);
    const signature = req.headers['x-hub-signature-256'] || '';
    const expected = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
    if (!/^sha256=[a-f0-9]{64}$/.test(signature) ||
        !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return reply(401, 'Invalid signature');
    }
    let payload;
    try { payload = JSON.parse(body); } catch { return reply(400, 'Invalid JSON'); }
    if (req.headers['x-github-event'] === 'ping') return reply(200, 'pong');
    if (req.headers['x-github-event'] !== 'push' || payload.deleted ||
        payload.ref !== `refs/heads/${branch}` ||
        payload.repository?.full_name?.toLowerCase() !== repository.toLowerCase()) {
      return reply(200, 'Ignored event');
    }
    const delivery = req.headers['x-github-delivery'];
    if (!delivery) return reply(400, 'Missing delivery ID');
    if (deliveries.has(delivery)) return reply(200, 'Duplicate delivery');
    deliveries.add(delivery);
    if (deliveries.size > 1000) deliveries.delete(deliveries.values().next().value);
    console.log(`Accepted GitHub delivery ${delivery}, commit ${payload.after}`);
    reply(202, 'Deployment queued');
    deploy();
  });
});
server.requestTimeout = 15000;
server.listen(Number(process.env.WEBHOOK_PORT || 10086), process.env.WEBHOOK_HOST || '127.0.0.1', () => {
  console.log('GitHub webhook listener ready');
});
