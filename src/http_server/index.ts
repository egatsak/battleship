import * as fs from 'node:fs';
import * as http from 'node:http';
import path from 'node:path';

export const httpServer = http.createServer(function (req, res) {
  const file_path =
    process.env.NODE_ENV === 'development'
      ? path.resolve(__dirname, '..', '..') +
        (req.url === '/' ? '/front/index.html' : '/front' + req.url)
      : path.resolve(__dirname, '..') +
        (req.url === '/' ? '/front/index.html' : '/front' + req.url);
  fs.readFile(file_path, function (err, data) {
    if (err) {
      console.error(err);
      res.writeHead(404);
      return res.end(JSON.stringify(err));
    }
    res.writeHead(200);
    res.end(data);
  });
});
