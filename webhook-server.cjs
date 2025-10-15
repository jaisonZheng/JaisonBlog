const http = require('http');
const { exec } = require('child_process');

const PORT = 8080;
const DEPLOY_SCRIPT_PATH = './deploy.sh';

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        console.log('Webhook received...');

        // **优化点：立刻发送成功响应给 Gitee**
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Accepted. Deployment is starting in the background.');

        // **然后在后台异步执行部署脚本**
        // 注意：响应已经发送，这里的执行结果不会影响给Gitee的响应
        exec(`sh ${DEPLOY_SCRIPT_PATH}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Deployment script failed: ${error}`);
                return;
            }
            console.log(`Deployment script stdout: ${stdout}`);
            console.error(`Deployment script stderr: ${stderr}`);
            console.log('Background deployment process finished.');
        });

    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Webhook server listening on port ${PORT}`);
});

