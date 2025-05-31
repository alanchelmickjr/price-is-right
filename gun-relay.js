const Gun = require('gun');
const server = require('http').createServer().listen(8765);
const gun = Gun({web: server});
console.log('Gun.js relay server started on port 8765');
