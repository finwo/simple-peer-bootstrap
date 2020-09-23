const root   = (new Function('return this;'))();
const Peer   = require('simple-peer');
const method = 'POST';

module.exports = {
  connect: function(url) {
    const fetch = module.exports._fetch || root.fetch;
    const peer  = new Peer({ initiator: true, trickle: false, wrtc: module.exports._wrtc });

    peer.on('signal', data => {
      const body = JSON.stringify(data);
      fetch(url, { method, body })
        .then(res => res.json())
        .then(data => peer.signal(data));
    });

    return peer;
  },
};
