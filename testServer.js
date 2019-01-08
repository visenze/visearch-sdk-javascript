// Create a simple http server listen on 3000 for examples testing

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const port = process.argv[2] || 3000;

http.createServer((request, response) => {
  const uri = url.parse(request.url).pathname;
  let filename = path.join(process.cwd(), uri);

  fs.exists(filename, (exists) => {
    if (!exists) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.write('404 Not Found\n');
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) {
      filename += '/index.html';
    }

    fs.readFile(filename, 'binary', (err, file) => {
      if (err) {
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.write(`${err}\n`);
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, 'binary');
      response.end();
    });
  });
}).listen(parseInt(port, 10));

console.log(`Test server running at\n  => http://localhost:${port}/\nCTRL + C to shutdown`);
