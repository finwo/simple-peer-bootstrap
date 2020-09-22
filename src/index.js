const URL  = require('url');
const http = require('http');
const Peer = require('simple-peer');
const conf = require('rc')('spbootstrap', {
  port: 5000,
});

const bootstrap = module.exports = require('./browser');

// Middleware handler
// Intended for express (app.use('/bootstrap', require('simple-peer-bootstrap').middleware))
module.exports.middleware = (req, res, next) => {
  if (req.method !== 'POST') return next();
  const peer = new Peer({ initiator: false, trickle: false });
  peer.on('signal', data => {
    res.send(JSON.stringify(data));
  });
  peer.signal(req.body);
};

// Adds request handler for POST /bootstrap
// Waits for the request body & assumes json
module.exports.Server = function Server(options) {
  const server = options.server || http.createServer();
  server.on('request', (req, res) => {

    // Ensure POST /bootstrap
    if (req.method !== 'POST') return;
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    if (parsedUrl.pathname !== '/bootstrap') return;

    // Wait for request body
    let data = "";
    req.on('data', chunk => { data += chunk });
    req.on('end', () => {
      req.body = JSON.parse(data);
      bootstrap.middleware(req, res, () => {
        // Should not occur, already filtered
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
    });
  });
  return server;
};
