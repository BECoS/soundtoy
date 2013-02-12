var static = require('node-static');

var file = new(static.Server)('./site');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
      request.url = request.url === '/' ? '/index.html' : request.url; 
      request.url = request.url === '/specs' ? '/specs.html' : request.url; 
      file.serve(request, response);
      });
    }).listen(3000);
