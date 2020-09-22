const root   = (new Function('return this;'))();
const Peer   = require('simple-peer');
const method = 'POST';

module.exports = {
  _fetch   : root.fetch,
  bootstrap: function() {
    const fetch = module.exports._fetch;
    const peer  = new Peer({ initiator: true, trickle: false });

    peer.on('signal', data => {
      const body = JSON.stringify(data);
      fetch({ method, body })
        .then(res => res.json())
        .then(peer.signal);
    });

    return peer;
  },
};
