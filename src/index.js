const URL  = require('url').URL;
const http = require('http');
const Peer = require('simple-peer');

const bootstrap  = module.exports = require('./browser');
bootstrap._fetch = require('node-fetch');
bootstrap._wrtc  = require('wrtc');

// Middleware handler
// Intended for express (app.use('/bootstrap', require('simple-peer-bootstrap').middleware))
bootstrap.middleware = handler => ((req, res, next) => {
  if (req.method !== 'POST') return next();
  const peer = new Peer({ initiator: false, trickle: false, wrtc: bootstrap._wrtc });
  peer.on('signal', data => {
    res.end(JSON.stringify(data));
  });
  peer.on('connect', () => handler(peer));
  peer.signal(req.body);
});

// Adds request handler for POST /bootstrap
// Waits for the request body & assumes json
bootstrap.server = function(options, handler) {
  if ('function' === typeof options) {
    handler = options;
    options = {};
  }

  const server = options.server || http.createServer();
  const mw     = bootstrap.middleware(handler);

  server.on('request', (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    if (parsedUrl.pathname !== '/bootstrap') return;

    // Ensure POST
    if (req.method !== 'POST') return;

    // Wait for request body
    let data = "";
    req.on('data', chunk => { data += chunk });
    req.on('end', () => {
      req.body = JSON.parse(data);
      mw(req, res, () => {
        // Should not occur, already filtered
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
    });
  });

  return server;
};
