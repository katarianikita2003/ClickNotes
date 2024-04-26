const http = require('node:http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;
const home = fs.readFileSync('./Notes.html')
const Upload = fs.readFileSync('./upload.html')
const Download = fs.readFileSync('./download.html')
const About = fs.readFileSync('./about.html')

const server = http.createServer((req, res) => {
    console.log(req.url)

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(home);
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});