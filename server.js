const http = require('http');
const next = require('next');

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOSTNAME || '0.0.0.0';
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((request, response) => handle(request, response)).listen(port, hostname, () => {
    console.log(`IT Security Center listening on ${hostname}:${port}`);
  });
}).catch(error => {
  console.error('Unable to start IT Security Center:', error);
  process.exit(1);
});
