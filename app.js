var static = require('node-static');

var file = new(static.Server)('./site');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
      file.serve(request, response);
      });
    }).listen(3000);
