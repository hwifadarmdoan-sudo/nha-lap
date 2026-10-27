// Kết nối nhiều người chơi.
// Hiện tại: BroadcastChannel (các tab trên cùng một máy thấy nhau, dùng để thử).
// Khi có Firebase: điền cấu hình vào NL_FIREBASE trong js/config.js, phần còn lại giữ nguyên.
window.NL = window.NL || {};
NL.net = (function () {
  const peers = new Map();
  let ch = null, selfId = null, stateCb = () => {}, eventCb = () => {}, fb = null, online = false, lastSent = '', lastSentAt = 0;

  function init(id) {
    selfId = id;
    if (window.NL_FIREBASE && window.firebase) return initFirebase();
    try {
      ch = new BroadcastChannel('nha-lap');
      ch.onmessage = e => handle(e.data);
    } catch (e) { ch = null; }
  }

  function initFirebase() {
    // Mỗi người ghi trạng thái của mình vào players/{id}; mất kết nối thì tự xóa.
    // Nghe từng người thay đổi (child_*) thay vì cả danh sách, để mỗi máy chỉ tải phần đổi.
    try {
      const app = firebase.initializeApp(window.NL_FIREBASE);
      const db = firebase.database(app);
      const meRef = db.ref('players/' + selfId);
      meRef.onDisconnect().remove();
      const players = db.ref('players');
      const onPlayer = snap => { if (snap.key !== selfId) handle({ kind: 'state', from: snap.key, state: snap.val() }); };
      players.on('child_added', onPlayer);
      players.on('child_changed', onPlayer);
      players.on('child_removed', snap => peers.delete(snap.key));
      // bỏ qua các sự kiện cũ có sẵn lúc mới vào, chỉ nhận sự kiện mới (không dựa vào đồng hồ từng máy)
      const evRef = db.ref('events').limitToLast(10), seen = new Set();
      evRef.once('value', all => {
        all.forEach(ch2 => { seen.add(ch2.key); });
        evRef.on('child_added', snap => {
          const ev = snap.val();
          if (!ev || seen.has(snap.key) || ev.from === selfId) return;
          seen.add(snap.key); handle({ kind: 'event', from: ev.from, ev });
        });
      });
      db.ref('.info/connected').on('value', snap => { online = !!snap.val(); });
      fb = { meRef, events: db.ref('events') };
    } catch (e) {
      console.warn('Không nối được Firebase, dùng chế độ thử trên một máy', e);
      fb = null;
      try { ch = new BroadcastChannel('nha-lap'); ch.onmessage = e2 => handle(e2.data); } catch (e2) { ch = null; }
    }
  }

  function handle(msg) {
    if (!msg || msg.from === selfId) return;
    if (msg.kind === 'state') { peers.set(msg.from, { state: msg.state, last: Date.now() }); stateCb(msg.from, msg.state); }
    else if (msg.kind === 'bye') peers.delete(msg.from);
    else if (msg.kind === 'event') eventCb(msg.ev);
  }

  function sendState(state) {
    if (fb) {
      // chỉ gửi khi có gì đổi, tối đa 5 lần/giây, để gói miễn phí của Firebase đủ dùng cho cả lớp
      const key = JSON.stringify(Object.assign({}, state, { emoteT: 0 })), now = Date.now();
      if (key === lastSent || now - lastSentAt < 200) return;
      lastSent = key; lastSentAt = now; fb.meRef.set(state); return;
    }
    if (ch) ch.postMessage({ kind: 'state', from: selfId, state });
  }
  function sendEvent(ev) {
    ev.from = selfId; ev.at = Date.now();
    if (fb) { const r = fb.events.push(ev); r.onDisconnect().remove(); return; }
    if (ch) ch.postMessage({ kind: 'event', from: selfId, ev });
  }
  function bye() { if (ch) ch.postMessage({ kind: 'bye', from: selfId }); if (fb) fb.meRef.remove(); }
  function prune() { if (fb) return; const now = Date.now(); peers.forEach((p, id) => { if (now - p.last > 6000) peers.delete(id); }); }

  window.addEventListener('pagehide', bye);
  return {
    init, sendState, sendEvent, prune, peers, get online() { return online; }, get mode() { return fb ? 'firebase' : 'local'; },
    onState(cb) { stateCb = cb; }, onEvent(cb) { eventCb = cb; }
  };
})();
