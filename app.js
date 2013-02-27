var static = require('node-static');

var file = new(static.Server)('./site');

var fileserver = function (request, response) {
  request.addListener('end', function () {
    request.url = request.url === '/' ? '/index.html' : request.url; 
    request.url = request.url === '/specs' ? '/specs.html' : request.url; 
    file.serve(request, response);
  });
}

require('http').createServer(fileserver).listen(80, 
      function(err) {
        if (err) return console.log(err);
        var uid = parseInt(process.env.SUDIO_UID);
        if (uid) process.setuid(uid);
      }
    );
