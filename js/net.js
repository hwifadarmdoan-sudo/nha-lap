// Kết nối nhiều người chơi.
// Có Firebase (js/config.js): học sinh đăng nhập ẩn danh, cô đăng nhập bằng email; luật Database ở database.rules.json.
// Không nối được Firebase: BroadcastChannel (các tab trên cùng một máy thấy nhau, dùng để thử).
window.NL = window.NL || {};
NL.net = (function () {
  const peers = new Map();
  let ch = null, selfId = null, stateCb = () => {}, eventCb = () => {}, fb = null, online = false, lastSent = '', lastSentAt = 0;
  let auth = null, db = null, readyCb = () => {};

  const hasFirebase = () => !!(window.NL_FIREBASE && window.firebase && firebase.auth && firebase.database);

  // asTeacher: chưa đăng nhập ngay, chờ cô nhập email + mật khẩu (teacherLogin)
  function init(onReady, asTeacher) {
    readyCb = onReady || readyCb;
    if (!hasFirebase()) return useLocal();
    try {
      const app = firebase.initializeApp(window.NL_FIREBASE);
      auth = firebase.auth(app); db = firebase.database(app);
      // mỗi tab một danh tính riêng, tải lại trang vẫn giữ
      auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(() => {});
    } catch (e) { console.warn('Firebase lỗi, chơi trên một máy', e); return useLocal(); }
    if (asTeacher) return;
    const go = () => auth.signInAnonymously().then(cred => connect(cred.user.uid)).catch(e => { console.warn('Không đăng nhập ẩn danh được', e); useLocal(); });
    const off = auth.onAuthStateChanged(u => { off(); if (u && u.isAnonymous) connect(u.uid); else go(); });
  }

  function useLocal() {
    fb = null; selfId = selfId || 'p' + Math.random().toString(36).slice(2, 9);
    try { ch = new BroadcastChannel('nha-lap'); ch.onmessage = e => handle(e.data); } catch (e) { ch = null; }
    readyCb(selfId, 'local');
  }

  // Trả về Promise: true nếu email này có trong danh sách giáo viên (teachers/{uid} trên Database)
  function teacherLogin(email, pass) {
    if (!auth) return Promise.reject(new Error('local'));
    return auth.signInWithEmailAndPassword(email, pass)
      .then(cred => db.ref('teachers/' + cred.user.uid).once('value').then(s => {
        if (s.val() !== true) { auth.signOut(); throw new Error('not-teacher'); }
        connect(cred.user.uid); return true;
      }));
  }

  function connect(uid) {
    // Mỗi người ghi trạng thái của mình vào players/{uid}; mất kết nối thì tự xóa.
    // Nghe từng người thay đổi (child_*) thay vì cả danh sách, để mỗi máy chỉ tải phần đổi.
    selfId = uid;
    const meRef = db.ref('players/' + uid);
    meRef.onDisconnect().remove();
    const players = db.ref('players');
    const onPlayer = snap => { if (snap.key !== selfId) handle({ kind: 'state', from: snap.key, state: snap.val() }); };
    players.on('child_added', onPlayer);
    players.on('child_changed', onPlayer);
    players.on('child_removed', snap => peers.delete(snap.key));
    // bỏ qua các sự kiện cũ có sẵn lúc mới vào, chỉ nhận sự kiện mới (không dựa vào đồng hồ từng máy)
    const evRef = db.ref('events').limitToLast(10), seen = new Set();
    evRef.once('value', all => {
      all.forEach(c => { seen.add(c.key); });
      evRef.on('child_added', snap => {
        const ev = snap.val();
        if (!ev || seen.has(snap.key) || ev.from === selfId) return;
        seen.add(snap.key); handle({ kind: 'event', from: ev.from, ev });
      });
    });
    db.ref('.info/connected').on('value', snap => { online = !!snap.val(); });
    fb = { meRef, events: db.ref('events') };
    readyCb(uid, 'firebase');
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
      lastSent = key; lastSentAt = now;
      fb.meRef.set(JSON.parse(JSON.stringify(state))).catch(e => {
        // luật Database cũ chưa có ô res: bỏ phần kết quả rồi gửi lại
        if (state.res && /PERMISSION/i.test(e.code || e.message || '')) { api.noRes = true; lastSent = ''; return; }
        console.warn('Không gửi được trạng thái', e.code || e);
      });
      return;
    }
    if (ch && selfId) ch.postMessage({ kind: 'state', from: selfId, state });
  }
  function sendEvent(ev) {
    if (!selfId) return;
    ev.from = selfId; ev.at = Date.now();
    if (fb) { const r = fb.events.push(); r.set(ev).then(() => r.onDisconnect().remove()).catch(e => console.warn('Không gửi được sự kiện', e.code || e)); return; }
    if (ch) ch.postMessage({ kind: 'event', from: selfId, ev });
  }
  function bye() { if (ch) ch.postMessage({ kind: 'bye', from: selfId }); if (fb) fb.meRef.remove(); }
  function prune() { if (fb) return; const now = Date.now(); peers.forEach((p, id) => { if (now - p.last > 6000) peers.delete(id); }); }

  window.addEventListener('pagehide', bye);
  const api = {
    noRes: false, init, teacherLogin, sendState, sendEvent, prune, peers, hasFirebase,
    get online() { return online; }, get mode() { return fb ? 'firebase' : 'local'; }, get id() { return selfId; },
    onState(cb) { stateCb = cb; }, onEvent(cb) { eventCb = cb; }
  };
  return api;
})();
