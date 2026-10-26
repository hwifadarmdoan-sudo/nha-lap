// Kết nối nhiều người chơi.
// Hiện tại: BroadcastChannel (các tab trên cùng một máy thấy nhau, dùng để thử).
// Khi có Firebase: điền cấu hình vào NL_FIREBASE trong js/config.js, phần còn lại giữ nguyên.
window.NL = window.NL || {};
NL.net = (function () {
  const peers = new Map();
  let ch = null, selfId = null, stateCb = () => {}, eventCb = () => {}, fb = null;

  function init(id) {
    selfId = id;
    if (window.NL_FIREBASE && window.firebase) return initFirebase();
    try {
      ch = new BroadcastChannel('nha-lap');
      ch.onmessage = e => handle(e.data);
    } catch (e) { ch = null; }
  }

  function initFirebase() {
    // Sẽ nối khi Linh tạo xong Firebase Realtime Database.
    const app = firebase.initializeApp(window.NL_FIREBASE);
    const db = firebase.database(app);
    const meRef = db.ref('players/' + selfId);
    meRef.onDisconnect().remove();
    db.ref('players').on('value', snap => {
      const all = snap.val() || {};
      const now = Date.now();
      Object.keys(all).forEach(id => { if (id !== selfId) handle({ kind: 'state', from: id, state: all[id] }); });
      peers.forEach((p, id) => { if (!all[id]) peers.delete(id); });
      void now;
    });
    db.ref('events').limitToLast(1).on('child_added', snap => { const ev = snap.val(); if (ev && ev.from !== selfId && Date.now() - ev.at < 8000) handle({ kind: 'event', from: ev.from, ev }); });
    fb = { meRef, events: db.ref('events') };
  }

  function handle(msg) {
    if (!msg || msg.from === selfId) return;
    if (msg.kind === 'state') { peers.set(msg.from, { state: msg.state, last: Date.now() }); stateCb(msg.from, msg.state); }
    else if (msg.kind === 'bye') peers.delete(msg.from);
    else if (msg.kind === 'event') eventCb(msg.ev);
  }

  function sendState(state) {
    if (fb) { fb.meRef.set(state); return; }
    if (ch) ch.postMessage({ kind: 'state', from: selfId, state });
  }
  function sendEvent(ev) {
    ev.from = selfId; ev.at = Date.now();
    if (fb) { fb.events.push(ev); return; }
    if (ch) ch.postMessage({ kind: 'event', from: selfId, ev });
  }
  function bye() { if (ch) ch.postMessage({ kind: 'bye', from: selfId }); if (fb) fb.meRef.remove(); }
  function prune() { const now = Date.now(); peers.forEach((p, id) => { if (now - p.last > 6000) peers.delete(id); }); }

  window.addEventListener('pagehide', bye);
  return {
    init, sendState, sendEvent, prune, peers,
    onState(cb) { stateCb = cb; }, onEvent(cb) { eventCb = cb; }
  };
})();
