// Basic Static File Server From:
// http://stackoverflow.com/questions/7268033/basic-static-file-server-in-nodejs

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

var mimeTypes = {
  "html"  :   "text/html",
  "jpg"   :   "image/jpeg",
  "png"   :   "image/png",
  "js"    :   "text/javascript",
  "svg"   :   "image/svg+xml",
  "css"   :   "text/css"
};

http.createServer(function(req, res) {
  var uri = url.parse(req.url).pathname;
  if (uri === '/') uri = '/index.html';
  var filename = path.join(path.join(process.cwd(), 'site'), uri);
  fs.exists(filename, function(exists) {
    if (!exists) {
      console.log("Requested: " + uri + " does not exist at " + filename);
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write('404 Not Found\n');
      res.end();
      return;
    }
    var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
    res.writeHead(200, {'Content-Type' : mimeType});
    var fileStream = fs.createReadStream(filename);
    fileStream.pipe(res);
  });
}).listen(3000);
