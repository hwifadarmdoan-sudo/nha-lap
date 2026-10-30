// Bản 3D thử nghiệm (mở bằng ?3d): vẽ lại các khung cảnh bằng three.js.
// Logic đi lại, thang máy, thí nghiệm, nhiều người chơi vẫn dùng chung với bản 2D (main.js, scenes.js).
// Toạ độ: ô (x, y) của bản 2D = (X, Z) trong 3D, trục Y hướng lên, 1 ô = 1 mét.
window.NL = window.NL || {};
NL.w3 = (function () {
  const on = new URLSearchParams(location.search).has('3d');
  let T, renderer, scene, camera, cv, sky, sun, hemi, ready = false, loading = null;
  let built = {}, curId = null, curGroup = null, anims = [], pickables = [];
  const chars = new Map(); let tagBox = null, arrow = null, ring = null, dots = [];
  let zoomK = 1, camPos = null, camTgt = null;
  const STOREY = 3.3, WALL_H = 2.9;
  const H = h => (h || 40) * 0.022; // chiều cao (px của bản 2D) → mét

  // ---------- nạp three.js ----------
  function loadScript(src) { return new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }
  function load() {
    if (loading) return loading;
    loading = (window.THREE ? Promise.resolve() : loadScript('js/vendor/three.min.js')).then(() => { T = window.THREE; });
    return loading;
  }

  // ---------- khởi tạo ----------
  function init() {
    if (!on) return Promise.resolve(false);
    document.body.classList.add('w3d');
    return load().then(() => {
      cv = document.createElement('canvas'); cv.id = 'world3d';
      const w2 = document.getElementById('world'); w2.parentNode.insertBefore(cv, w2);
      renderer = new T.WebGLRenderer({ canvas: cv, antialias: true });
      renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
      renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
      scene = new T.Scene();
      scene.background = skyTex();
      scene.fog = new T.Fog(0xCFEAFB, 40, 120);
      camera = new T.PerspectiveCamera(38, 1, 0.1, 400);
      hemi = new T.HemisphereLight(0xEAF6FF, 0xB9D8A0, 0.9); scene.add(hemi);
      sun = new T.DirectionalLight(0xFFF4DE, 1.6); sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
      scene.add(sun); scene.add(sun.target);
      scene.add(new T.AmbientLight(0xFFFFFF, 0.25));
      sky = clouds(); scene.add(sky);
      tagBox = document.createElement('div'); tagBox.className = 'w3-tags'; document.body.appendChild(tagBox);
      arrow = guideArrow(); scene.add(arrow);
      ring = new T.Mesh(new T.RingGeometry(0.18, 0.26, 32), new T.MeshBasicMaterial({ color: 0x2F80C0, transparent: true, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.visible = false; scene.add(ring);
      for (let k = 0; k < 40; k++) { const d = new T.Mesh(new T.CircleGeometry(0.09, 16), new T.MeshBasicMaterial({ color: 0xFFD54A, transparent: true, depthWrite: false })); d.rotation.x = -Math.PI / 2; d.visible = false; scene.add(d); dots.push(d); }
      addEventListener('resize', resize); resize();
      cv.addEventListener('wheel', e => { zoomK = Math.max(0.55, Math.min(1.8, zoomK * (e.deltaY > 0 ? 1.08 : 0.93))); }, { passive: true });
      document.getElementById('world').addEventListener('wheel', e => { zoomK = Math.max(0.55, Math.min(1.8, zoomK * (e.deltaY > 0 ? 1.08 : 0.93))); }, { passive: true });
      ready = true; return true;
    });
  }
  function resize() { if (!renderer) return; renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }

  // ---------- vật liệu, hình ----------
  const matCache = {};
  function mat(color, o = {}) {
    const k = color + JSON.stringify(o);
    if (!matCache[k]) matCache[k] = new T.MeshStandardMaterial(Object.assign({ color, roughness: 0.8, metalness: 0 }, o));
    return matCache[k];
  }
  function mesh(geo, m, parent, pos, shadow = true) {
    const me = new T.Mesh(geo, m); if (pos) me.position.set(...pos);
    me.castShadow = shadow; me.receiveShadow = true; if (parent) parent.add(me); return me;
  }
  // khối hộp đặt theo ô: x..x+w, z..z+d, đáy ở y0
  function box(parent, x, z, w, d, h, color, y0 = 0, o) { return mesh(new T.BoxGeometry(w, h, d), mat(color, o), parent, [x + w / 2, y0 + h / 2, z + d / 2]); }
  function rbox(w, h, d, r) { // hộp bo góc nhẹ
    const s = new T.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const g = new T.ExtrudeGeometry(s, { depth: d - r * 2, bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.6, bevelSegments: 2, curveSegments: 4 });
    g.translate(0, 0, -(d - r * 2) / 2); return g;
  }
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function skyTex() {
    return canvasTex(4, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6FBDEB'); g.addColorStop(0.55, '#B7E0F7'); g.addColorStop(1, '#EAF6FD'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  }
  function clouds() {
    const g = new T.Group(), m = new T.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 1, emissive: 0xFFFFFF, emissiveIntensity: 0.35 });
    for (let k = 0; k < 9; k++) {
      const c = new T.Group();
      for (let j = 0; j < 4; j++) { const s = new T.Mesh(new T.SphereGeometry(2 + Math.random() * 1.6, 12, 10), m); s.position.set(j * 2.4 - 3.6, Math.random(), Math.random() - 0.5); s.scale.y = 0.6; c.add(s); }
      const a = k / 9 * Math.PI * 2; c.position.set(Math.cos(a) * 70, 22 + Math.random() * 10, Math.sin(a) * 70); c.userData.v = 0.4 + Math.random() * 0.5; g.add(c);
    }
    return g;
  }
  // nhãn chữ nổi (sprite)
  function label(text, o = {}) {
    const fs = 44, pad = 26, font = `800 ${fs}px 'Baloo 2', sans-serif`;
    const mc = document.createElement('canvas').getContext('2d'); mc.font = font;
    const w = Math.ceil(mc.measureText(text).width) + pad * 2, h = Math.round(fs * 1.55);
    const tex = canvasTex(w, h, (x) => {
      x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = o.bg || 'rgba(255,255,255,.95)'; x.beginPath(); x.roundRect ? x.roundRect(2, 2, w - 4, h - 4, h / 2) : x.rect(0, 0, w, h); x.fill();
      x.fillStyle = o.color || '#1F4E79'; x.fillText(text, w / 2, h / 2 + 2);
    });
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: o.depthTest !== false }));
    const sh = o.h || 0.32; sp.scale.set(sh * w / h, sh, 1); sp.renderOrder = 5;
    if (o.pos) sp.position.set(...o.pos); if (o.parent) o.parent.add(sp); return sp;
  }
  function emojiSprite(e, size, parent, pos) {
    const tex = canvasTex(128, 128, x => { x.font = "96px 'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 64, 70); });
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); sp.scale.set(size, size, 1); if (pos) sp.position.set(...pos); parent.add(sp); return sp;
  }

  // ---------- nhân vật người thật mặc áo blouse ----------
  const SKINS = ['#F6D7BE', '#EDC3A0', '#D9A47C', '#B57B55', '#8A5A3C'];
  const HAIRS = ['Ngắn', 'Dài', 'Búi', 'Đuôi ngựa', 'Rẽ ngôi', 'Xoăn'];
  const HAIR_COLS = ['#1E1A17', '#3B2618', '#6B4226', '#A8743A', '#D8B66A', '#8C8C8C'];
  const BODIES = ['Gầy', 'Vừa', 'Đầy đặn'];
  function makeChar(look, o = {}) {
    look = look || {};
    const fem = look.gender === 'f', bw = [0.86, 1, 1.28][look.body == null ? 1 : look.body];
    const ht = fem ? 0.95 : 1, skin = mat(look.skin || SKINS[1], { roughness: 0.6 });
    const coatC = o.teacher ? '#2F80C0' : (look.coat || '#FFFFFF');
    const coat = mat(coatC, { roughness: 0.7 }), coatEdge = mat(coatC === '#FFFFFF' ? '#E4ECF2' : coatC, { roughness: 0.75 });
    const shirt = mat(fem ? '#9FC4E6' : '#7FA7D0'), pants = mat(o.teacher ? '#2E3A4A' : '#33435C'), shoe = mat('#2A2A2E', { roughness: 0.5 });
    const hairM = mat(look.hairColor && /^#/.test(look.hairColor) ? look.hairColor : '#2B2B2B', { roughness: 0.55 });
    const root = new T.Group(), body = new T.Group(); root.add(body); body.scale.set(1, ht, 1);
    const sw = (fem ? 0.17 : 0.2) * bw, hipW = (fem ? 0.15 : 0.14) * bw;
    // chân
    const leg = side => {
      const g = new T.Group(); g.position.set(side * hipW * 0.6, 0.9, 0); body.add(g);
      mesh(new T.CapsuleGeometry(0.068 * Math.sqrt(bw), 0.72, 4, 10), pants, g, [0, -0.42, 0]);
      mesh(rbox(0.11, 0.08, 0.26, 0.03), shoe, g, [0, -0.86, 0.04]);
      return g;
    };
    const legL = leg(-1), legR = leg(1);
    // thân + áo sơ mi
    const torso = new T.Group(); torso.position.y = 0.9; body.add(torso);
    const tg = new T.CapsuleGeometry(1, 1, 6, 16); const tm = mesh(tg, shirt, torso, [0, 0.3, 0]); tm.scale.set(sw * 0.9, 0.2, 0.12 * bw);
    // áo blouse: hình trụ loe dài tới gối, hở phía trước
    const prof = [[sw * 0.55, 0.62], [sw * 1.02, 0.58], [sw * 1.04, 0.45], [sw * 0.98 + 0.01, 0.15], [hipW * 1.15 + 0.07, -0.05], [hipW * 1.2 + 0.11, -0.42], [hipW * 1.2 + 0.12, -0.44]].map(([r, y]) => new T.Vector2(r, y));
    const coatG = new T.LatheGeometry(prof, 28, 0.32, Math.PI * 2 - 0.64); const cm = mesh(coatG, new T.MeshStandardMaterial({ color: coatC, roughness: 0.7, side: T.DoubleSide }), torso, [0, 0, 0]);
    cm.scale.z = 0.62 * Math.max(1, bw * 0.92);
    // ve áo + túi + bảng tên
    [-1, 1].forEach(s => { const l = mesh(new T.BoxGeometry(0.05, 0.3, 0.012), coatEdge, torso, [s * 0.06, 0.42, sw * 0.62 * Math.max(1, bw * 0.92) + 0.005]); l.rotation.z = s * 0.28; });
    mesh(new T.BoxGeometry(0.11, 0.09, 0.01), coatEdge, torso, [-0.1 * bw, -0.12, (hipW * 1.15 + 0.08) * 0.62 * Math.max(1, bw * 0.92) + 0.004]);
    mesh(new T.BoxGeometry(0.11, 0.09, 0.01), coatEdge, torso, [0.1 * bw, -0.12, (hipW * 1.15 + 0.08) * 0.62 * Math.max(1, bw * 0.92) + 0.004]);
    mesh(new T.BoxGeometry(0.07, 0.025, 0.008), mat('#2F80C0'), torso, [-0.09 * bw, 0.4, sw * 0.62 * Math.max(1, bw * 0.92) + 0.002]);
    // tay (ống tay áo blouse + bàn tay)
    const arm = side => {
      const g = new T.Group(); g.position.set(side * (sw + 0.035), 0.53, 0); torso.add(g);
      mesh(new T.CapsuleGeometry(0.058 * Math.sqrt(bw), 0.5, 4, 10), coat, g, [0, -0.27, 0]);
      mesh(new T.CylinderGeometry(0.064 * Math.sqrt(bw), 0.064 * Math.sqrt(bw), 0.05, 10), coatEdge, g, [0, -0.54, 0]);
      const hand = mesh(new T.SphereGeometry(0.048, 12, 10), skin, g, [0, -0.62, 0]); hand.scale.set(0.8, 1.15, 0.6);
      return g;
    };
    const armL = arm(-1), armR = arm(1);
    // cổ, đầu, mặt
    const head = new T.Group(); head.position.y = 1.58; body.add(head);
    mesh(new T.CylinderGeometry(0.045, 0.05, 0.1, 10), skin, body, [0, 1.5, 0]);
    const skull = mesh(new T.SphereGeometry(0.105, 24, 18), skin, head, [0, 0.07, 0]); skull.scale.set(0.92, 1.12, 1);
    const jaw = mesh(new T.SphereGeometry(0.08, 18, 12), skin, head, [0, 0.0, 0.02]); jaw.scale.set(0.95, 0.9, 1);
    [-1, 1].forEach(s => { const e = mesh(new T.SphereGeometry(0.022, 10, 8), skin, head, [s * 0.098, 0.06, 0]); e.scale.set(0.5, 1, 0.8); });
    const eyeW = mat('#FFFFFF', { roughness: 0.3 }), eyeD = mat('#2A1D14', { roughness: 0.2 }), brow = hairM;
    [-1, 1].forEach(s => {
      const ew = mesh(new T.SphereGeometry(0.016, 12, 10), eyeW, head, [s * 0.036, 0.075, 0.09], false); ew.scale.set(1.2, 0.8, 0.6);
      mesh(new T.SphereGeometry(0.0095, 10, 8), eyeD, head, [s * 0.036, 0.075, 0.1], false);
      const b = mesh(new T.BoxGeometry(0.036, 0.007, 0.01), brow, head, [s * 0.037, 0.1, 0.096], false); b.rotation.z = -s * 0.12;
    });
    const nose = mesh(new T.ConeGeometry(0.012, 0.035, 8), skin, head, [0, 0.045, 0.103], false); nose.rotation.x = Math.PI / 2.4;
    const mouth = mesh(new T.TorusGeometry(0.018, 0.0035, 6, 16, Math.PI), mat('#B5564F'), head, [0, 0.012, 0.094], false); mouth.rotation.z = Math.PI;
    if (o.teacher) { const gl = mat('#222831', { metalness: 0.4, roughness: 0.3 }); [-1, 1].forEach(s => mesh(new T.TorusGeometry(0.02, 0.003, 6, 18), gl, head, [s * 0.036, 0.075, 0.105], false)); }
    // tóc
    const hs = look.hair || 0;
    const cap = mesh(new T.SphereGeometry(0.115, 24, 16, 0, Math.PI * 2, 0, Math.PI * (hs === 5 ? 0.62 : 0.55)), hairM, head, [0, 0.085, -0.005]); cap.scale.set(0.97, 1.12, 1.04);
    const back = mesh(new T.SphereGeometry(0.112, 18, 12, Math.PI * 0.62, Math.PI * 0.76, Math.PI * 0.3, Math.PI * 0.45), hairM, head, [0, 0.07, -0.006]); back.scale.set(0.98, 1.15, 1.05);
    if (hs === 1) { const lg = mesh(new T.CylinderGeometry(0.1, 0.12, 0.3, 18, 1, true, Math.PI * 0.55, Math.PI * 0.9), new T.MeshStandardMaterial({ color: hairM.color, roughness: 0.55, side: T.DoubleSide }), head, [0, -0.07, -0.02]); lg.scale.z = 0.9; }
    if (hs === 2) mesh(new T.SphereGeometry(0.055, 14, 12), hairM, head, [0, 0.17, -0.09]);
    if (hs === 3) { const p = mesh(new T.CapsuleGeometry(0.032, 0.18, 4, 10), hairM, head, [0, 0.03, -0.13]); p.rotation.x = 0.35; }
    if (hs === 4) { const f = mesh(new T.SphereGeometry(0.06, 14, 10), hairM, head, [-0.04, 0.17, 0.06]); f.scale.set(1.4, 0.45, 0.9); }
    if (hs === 5) for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; mesh(new T.SphereGeometry(0.04, 10, 8), hairM, head, [Math.cos(a) * 0.1, 0.12 + Math.sin(k * 1.7) * 0.03, Math.sin(a) * 0.09 - 0.01]); }
    if (fem && (hs === 0 || hs === 4)) { [-1, 1].forEach(s => { const sd = mesh(new T.CapsuleGeometry(0.03, 0.1, 4, 8), hairM, head, [s * 0.095, 0.0, -0.02]); }); }
    root.traverse(m => { if (m.isMesh) m.userData.char = true; });
    const st = { root, legL, legR, armL, armR, body, head, heading: 0 };
    st.pose = (anim, t, emote) => {
      const w = anim === 'walk' ? Math.sin(t * 9) : 0;
      legL.rotation.x = w * 0.55; legR.rotation.x = -w * 0.55;
      armL.rotation.x = -w * 0.45; armR.rotation.x = w * 0.45; armL.rotation.z = -0.06; armR.rotation.z = 0.06;
      body.position.y = anim === 'walk' ? Math.abs(Math.sin(t * 9)) * 0.03 : Math.sin(t * 2) * 0.004;
      body.rotation.z = 0; body.rotation.y = 0; head.rotation.set(0, 0, 0);
      if (anim === 'dance') { body.position.y = Math.abs(Math.sin(t * 8)) * 0.08; body.rotation.z = Math.sin(t * 4) * 0.12; armL.rotation.z = -2.4 + Math.sin(t * 8) * 0.4; armR.rotation.z = 2.4 + Math.sin(t * 8 + 1) * 0.4; legL.rotation.x = Math.sin(t * 8) * 0.3; legR.rotation.x = -Math.sin(t * 8) * 0.3; }
      if (anim === 'special') { body.position.y = Math.abs(Math.sin(t * 6)) * 0.14; body.rotation.y = t * 6; armL.rotation.z = -1.6; armR.rotation.z = 1.6; }
      if (anim === 'jump') { body.position.y = Math.abs(Math.sin(t * 6)) * 0.18; armR.rotation.z = 2.7 + Math.sin(t * 12) * 0.2; }
      if (emote === 'wave' || emote === 'five') { armR.rotation.z = 2.5; armR.rotation.x = 0; armR.rotation.y = Math.sin(t * 12) * 0.4; }
      if (emote === 'poke') { armR.rotation.x = -1.4; }
      if (emote === 'haha') head.rotation.x = -0.2 + Math.sin(t * 16) * 0.08;
    };
    root.scale.setScalar(o.scale || 1);
    return st;
  }

  // ---------- dựng khung cảnh từ dữ liệu scenes.js ----------
  const WALL_C = '#FBF3DC';
  function build(s) {
    const g = new T.Group(); const picks = [], an = [];
    const floorY = 0, f = s.floor || 1, ground = s.walls ? -(f - 1) * STOREY - 0.12 : -0.01;
    // mặt đất cỏ + lối đi
    const grass = mesh(new T.PlaneGeometry(260, 260), mat('#9ED486', { roughness: 1 }), g, [s.w / 2, ground - 0.02, s.d / 2], false); grass.rotation.x = -Math.PI / 2;
    // sàn theo màu ô của bản 2D
    const R = 32, ft = canvasTex(s.w * R, s.d * R, (x) => {
      for (let yy = 0; yy < s.d; yy++) for (let xx = 0; xx < s.w; xx++) { x.fillStyle = s.floorColor(xx, yy); x.fillRect(xx * R, yy * R, R, R); x.strokeStyle = 'rgba(30,60,90,.08)'; x.strokeRect(xx * R + 0.5, yy * R + 0.5, R - 1, R - 1); }
    });
    ft.magFilter = T.NearestFilter;
    const fl = mesh(new T.PlaneGeometry(s.w, s.d), new T.MeshStandardMaterial({ map: ft, roughness: 0.75 }), g, [s.w / 2, floorY, s.d / 2], false); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; picks.push(fl);
    if (s.walls) {
      // khối tòa nhà bên dưới (thấy khi nhìn ra ban công)
      if (f > 1) {
        const bt = canvasTex(256, 128, (x, w, h) => { x.fillStyle = '#F4E9C8'; x.fillRect(0, 0, w, h); x.fillStyle = '#8EC9EE'; for (let k = 0; k < 8; k++) x.fillRect(8 + k * 31, 34, 18, 52); x.fillStyle = '#E2D2A2'; x.fillRect(0, h - 8, w, 8); });
        bt.wrapS = bt.wrapT = T.RepeatWrapping; bt.repeat.set(Math.ceil(s.w / 6), f - 1);
        const bm = new T.MeshStandardMaterial({ map: bt, roughness: 0.9 });
        const hb = (f - 1) * STOREY; const blk = mesh(new T.BoxGeometry(s.w, hb, s.d), [bm, bm, mat('#EADDB5'), mat('#EADDB5'), bm, bm], g, [s.w / 2, -hb / 2 - 0.13, s.d / 2], false);
      }
      mesh(new T.BoxGeometry(s.w, 0.12, s.d), mat('#E7DCC0'), g, [s.w / 2, -0.065, s.d / 2], false);
      // tường bắc (z = 0) và tây (x = 0)
      const wm = mat(WALL_C, { roughness: 0.95 });
      const wn = mesh(new T.BoxGeometry(s.w + 0.15, WALL_H, 0.15), wm, g, [s.w / 2 - 0.075, WALL_H / 2, -0.075]); picks.push(wn);
      const ww = mesh(new T.BoxGeometry(0.15, WALL_H, s.d), wm, g, [-0.075, WALL_H / 2, s.d / 2]); picks.push(ww);
      mesh(new T.BoxGeometry(s.w + 0.15, 0.12, 0.03), mat('#E6D6A8'), g, [s.w / 2 - 0.075, 0.06, 0.005], false);
      mesh(new T.BoxGeometry(0.03, 0.12, s.d), mat('#E6D6A8'), g, [0.005, 0.06, s.d / 2], false);
      // phòng kín (không có ban công): tường nam, đông bằng kính mờ để vẫn nhìn vào trong
      if (!s.triggers.some(tr => tr.type === 'balcony')) {
        const gm = new T.MeshStandardMaterial({ color: 0xE8F4FC, transparent: true, opacity: 0.12, roughness: 0.1, depthWrite: false });
        mesh(new T.BoxGeometry(s.w, WALL_H, 0.06), gm, g, [s.w / 2, WALL_H / 2, s.d + 0.03], false);
        mesh(new T.BoxGeometry(0.06, WALL_H, s.d), gm, g, [s.w + 0.03, WALL_H / 2, s.d / 2], false);
        mesh(new T.BoxGeometry(s.w + 0.1, 0.35, 0.12), mat('#F1E5C2'), g, [s.w / 2, 0.175, s.d + 0.06], false);
        mesh(new T.BoxGeometry(0.12, 0.35, s.d), mat('#F1E5C2'), g, [s.w + 0.06, 0.175, s.d / 2], false);
        mesh(new T.BoxGeometry(s.w + 0.1, 0.06, 0.12), mat('#FFFFFF'), g, [s.w / 2, WALL_H, s.d + 0.06], false);
        mesh(new T.BoxGeometry(0.12, 0.06, s.d), mat('#FFFFFF'), g, [s.w + 0.06, WALL_H, s.d / 2], false);
      }
      (s.deco || []).forEach(dc => deco(g, dc, picks));
    }
    (s.mats || []).forEach(m => {
      const p = mesh(new T.PlaneGeometry(m.w, 1), mat('#5BB4EA', { roughness: 0.6 }), g, [m.x + m.w / 2, 0.012, m.y + 0.5], false); p.rotation.x = -Math.PI / 2;
      label(m.label, { parent: g, pos: [m.x + m.w / 2, 0.35, m.y + 0.5], h: 0.26 });
    });
    (s.tags || []).forEach(tg => label(tg.label, { parent: g, pos: [tg.x, 0.6, tg.y], h: 0.26 }));
    s.objects.forEach(o => obj(g, o, picks, an));
    // ánh sáng trong phòng
    if (s.walls) { const pl = new T.PointLight(0xFFF2D8, 0.5, 18); pl.position.set(s.w / 2, 2.6, s.d / 2); g.add(pl); }
    g.userData = { picks, anims: an, ground };
    return g;
  }
  // trang trí gắn tường: side 'N' chạy theo x ở z = 0; 'W' chạy theo z ở x = 0
  function onWall(g, side, a, b, y0, y1, depth, m, off = 0.01) {
    const w = b - a, h = y1 - y0;
    const me = side === 'N' ? mesh(new T.BoxGeometry(w, h, depth), m, g, [(a + b) / 2, y0 + h / 2, depth / 2 + off]) : mesh(new T.BoxGeometry(depth, h, w), m, g, [depth / 2 + off, y0 + h / 2, (a + b) / 2]);
    return me;
  }
  const wallPos = (side, m, y, out = 0.12) => side === 'N' ? [m, y, out] : [out, y, m];
  function deco(g, w, picks) {
    const m = (w.a + w.b) / 2;
    if (w.kind === 'window') {
      onWall(g, w.side, w.a - 0.06, w.b + 0.06, 0.82, 2.38, 0.06, mat('#FFFFFF'));
      onWall(g, w.side, w.a, w.b, 0.88, 2.32, 0.07, mat('#BFE4FA', { roughness: 0.1, metalness: 0.1, emissive: '#9FD3F2', emissiveIntensity: 0.35 }));
      onWall(g, w.side, m - 0.025, m + 0.025, 0.88, 2.32, 0.09, mat('#FFFFFF'));
    } else if (w.kind === 'elevator') {
      onWall(g, w.side, w.a - 0.18, w.b + 0.18, 0, 2.4, 0.06, mat('#9FB0C0', { metalness: 0.5, roughness: 0.35 }));
      const dl = onWall(g, w.side, w.a, m - 0.01, 0, 2.15, 0.08, mat('#DCE4EC', { metalness: 0.6, roughness: 0.25 }));
      const dr = onWall(g, w.side, m + 0.01, w.b, 0, 2.15, 0.08, mat('#DCE4EC', { metalness: 0.6, roughness: 0.25 }));
      picks.push(dl, dr);
      const disp = onWall(g, w.side, m - 0.22, m + 0.22, 2.2, 2.36, 0.1, mat('#14273A'));
      label(w.floorLabel || '▲', { parent: g, pos: wallPos(w.side, m, 2.28, 0.17), h: 0.13, bg: '#14273A', color: '#7CF29A' });
      label('🛗 Thang máy', { parent: g, pos: wallPos(w.side, m, 2.65, 0.3), h: 0.26 });
      void disp;
    } else if (w.kind === 'door') {
      onWall(g, w.side, w.a - 0.1, w.b + 0.1, 0, 2.3, 0.06, mat('#FFFFFF'));
      const d = onWall(g, w.side, w.a, w.b, 0, 2.18, 0.08, mat(w.locked ? '#C9D3DD' : '#9FD3F2', { roughness: 0.4 })); picks.push(d);
      onWall(g, w.side, w.a + 0.15, w.b - 0.15, 1.05, 1.95, 0.09, mat('#E8F6FF', { roughness: 0.1, emissive: '#CFEFFF', emissiveIntensity: 0.3 }));
      const hx = w.b - 0.22; onWall(g, w.side, hx - 0.03, hx + 0.03, 0.95, 1.12, 0.12, mat('#C9A227', { metalness: 0.7, roughness: 0.3 }));
      label(w.label, { parent: g, pos: wallPos(w.side, m, w.high ? 2.85 : 2.5, 0.3), h: 0.24, bg: w.locked ? '#9AA9B7' : (w.color || '#2F80C0'), color: '#fff' });
      if (w.sub) label(w.sub, { parent: g, pos: wallPos(w.side, m, 1.2, 0.3), h: 0.2 });
    } else if (w.kind === 'board') {
      const lines = w.lines || [];
      const tex = canvasTex(512, 320, (x, W, Hh) => {
        x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, W, Hh); x.fillStyle = w.color || '#E8F4FC'; x.fillRect(14, 14, W - 28, Hh - 28);
        x.textAlign = 'center'; x.textBaseline = 'middle';
        lines.forEach((ln, k) => {
          const head = k === 0 && lines.length > 1, y = Hh / 2 + (k - (lines.length - 1) / 2) * 66;
          if (head) { x.fillStyle = w.head || '#2F80C0'; x.beginPath(); x.roundRect ? x.roundRect(40, y - 30, W - 80, 60, 30) : x.rect(40, y - 30, W - 80, 60); x.fill(); }
          x.fillStyle = head ? '#fff' : '#1F4E79'; x.font = `800 ${head ? 40 : 36}px 'Baloo 2', sans-serif`; x.fillText(ln, W / 2, y + 3);
        });
      });
      const bm = new T.MeshStandardMaterial({ map: tex, roughness: 0.6 });
      const bw = w.b - w.a;
      if (w.side === 'N') mesh(new T.PlaneGeometry(bw, bw * 0.62), bm, g, [m, 1.65, 0.02], false);
      else { const p = mesh(new T.PlaneGeometry(bw, bw * 0.62), bm, g, [0.02, 1.65, m], false); p.rotation.y = Math.PI / 2; }
    }
  }
  function obj(g, o, picks, an) {
    const cx = o.x + (o.w || 1) / 2, cz = o.y + (o.d || 1) / 2;
    const add = me => { picks.push(me); return me; };
    switch (o.kind) {
      case 'plant': {
        mesh(new T.CylinderGeometry(0.2, 0.15, 0.36, 14), mat('#E08A5A'), g, [cx, 0.18, cz]);
        const leaves = new T.Group(); leaves.position.set(cx, 0.36, cz); g.add(leaves);
        for (let k = 0; k < 7; k++) { const l = mesh(new T.SphereGeometry(0.16 + (k % 3) * 0.03, 10, 8), mat(k % 2 ? '#4FA36B' : '#62B77C'), leaves, [Math.cos(k * 2.4) * 0.12, 0.2 + (k % 4) * 0.12, Math.sin(k * 2.4) * 0.12]); l.scale.y = 1.3; }
        an.push(t => { leaves.rotation.z = Math.sin(t * 1.5 + o.x) * 0.04; });
        break;
      }
      case 'tree': {
        mesh(new T.CylinderGeometry(0.12, 0.18, 1.8, 10), mat('#8A5A3B'), g, [cx, 0.9, cz]);
        const top = new T.Group(); top.position.set(cx, 2.2, cz); g.add(top);
        [[0, 0.4, 0, 0.95], [-0.5, 0, 0.2, 0.7], [0.5, 0, -0.1, 0.7], [0.1, 0.9, 0, 0.6], [0, 0, 0.5, 0.65]].forEach(([x, y, z, r], k) => mesh(new T.IcosahedronGeometry(r, 1), mat(k % 2 ? '#5DB36F' : '#4FA36B', { flatShading: true }), top, [x, y, z]));
        an.push(t => { top.rotation.z = Math.sin(t * 1.1 + o.x) * 0.025; });
        break;
      }
      case 'bush': [[-0.2, 0], [0.2, 0], [0, 0.15]].forEach(([x, y]) => mesh(new T.SphereGeometry(0.3, 10, 8), mat('#5DB36F'), g, [cx + x, 0.25 + y, cz])); break;
      case 'sofa': {
        const c = mat('#6AA6D6', { roughness: 0.9 });
        mesh(rbox(o.w, 0.42, o.d, 0.06), c, g, [cx, 0.21, cz]); mesh(rbox(o.w, 0.5, 0.22, 0.06), c, g, [cx, 0.62, o.y + 0.11]);
        [-1, 1].forEach(s => mesh(rbox(0.2, 0.62, o.d, 0.05), c, g, [cx + s * (o.w / 2 - 0.1), 0.31, cz]));
        break;
      }
      case 'npc': {
        const ch = makeChar(Object.assign({ gender: 'f', body: 1, skin: SKINS[1], hair: 2, hairColor: '#2B1B12' }, o.look, { coat: o.look && o.look.coat }), {});
        ch.root.position.set(cx, 0, cz); ch.root.rotation.y = Math.PI / 2 * 0.9; g.add(ch.root);
        an.push(t => ch.pose('idle', t, Math.sin(t * 0.8) > 0.6 ? 'wave' : null));
        break;
      }
      case 'desk': {
        add(mesh(rbox(o.w, H(o.h) - 0.05, o.d, 0.04), mat('#F6E7C1', { roughness: 0.6 }), g, [cx, (H(o.h) - 0.05) / 2, cz]));
        mesh(new T.BoxGeometry(o.w + 0.1, 0.05, o.d + 0.1), mat('#FFFFFF', { roughness: 0.3 }), g, [cx, H(o.h) - 0.02, cz]);
        mesh(new T.BoxGeometry(0.4, 0.26, 0.03), mat('#1F2A36', { roughness: 0.3 }), g, [cx - 0.1, H(o.h) + 0.15, cz - 0.3]).rotation.y = Math.PI / 2;
        if (o.label) label(o.label, { parent: g, pos: [cx, H(o.h) + 0.85, cz], h: 0.26, bg: '#2F80C0', color: '#fff' });
        break;
      }
      case 'stand': {
        add(mesh(new T.CylinderGeometry(0.42, 0.48, H(o.h) + 0.35, 24), mat('#D7E6F2', { roughness: 0.4 }), g, [cx, (H(o.h) + 0.35) / 2, cz]));
        const top = H(o.h) + 0.35;
        const glow = mesh(new T.CylinderGeometry(0.34, 0.4, 0.5, 24, 1, true), new T.MeshBasicMaterial({ color: 0x78E6FF, transparent: true, opacity: 0.22, side: T.DoubleSide, depthWrite: false }), g, [cx, top + 0.25, cz], false);
        const ic = emojiSprite(o.icon, 0.5, g, [cx, top + 0.55, cz]);
        label(o.no + ' · ' + o.short, { parent: g, pos: [cx, top + 1.05, cz], h: 0.22, bg: o.done ? '#3FB37F' : '#2F80C0', color: '#fff' });
        an.push(t => { ic.position.y = top + 0.55 + Math.sin(t * 2 + o.x * 1.7) * 0.06; glow.material.opacity = 0.16 + 0.08 * Math.sin(t * 3); });
        break;
      }
      case 'bench': {
        const h = H(o.h) + 0.08;
        add(mesh(new T.BoxGeometry(o.w - 0.08, h - 0.06, o.d - 0.08), mat('#E8EEF3', { roughness: 0.6 }), g, [cx, (h - 0.06) / 2, cz]));
        add(mesh(new T.BoxGeometry(o.w, 0.06, o.d), mat('#3A4652', { roughness: 0.35 }), g, [cx, h - 0.03, cz]));
        for (let k = 0; k < 3; k++) mesh(new T.BoxGeometry(o.w / 3 - 0.08, h * 0.7, 0.02), mat('#F7FAFC'), g, [o.x + o.w / 6 + k * o.w / 3, h * 0.42, o.y + o.d - 0.03]);
        benchProps(g, o, h, an);
        if (o.glow) {
          const e = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(o.w + 0.04, 0.08, o.d + 0.04)), new T.LineBasicMaterial({ color: 0xFFD54A, transparent: true }));
          e.position.set(cx, h - 0.02, cz); g.add(e); an.push(t => { e.material.opacity = 0.45 + 0.5 * Math.abs(Math.sin(t * 3)); });
        }
        break;
      }
      case 'shelf': {
        const h = H(o.h);
        add(mesh(new T.BoxGeometry(o.w, h, o.d), mat('#C9AE85', { roughness: 0.8 }), g, [cx, h / 2, cz]));
        const cols = ['#5BB4EA', '#3FB37F', '#E86A92', '#FFD54A', '#9B6BD6'];
        for (let r = 0; r < 3; r++) {
          mesh(new T.BoxGeometry(0.04, 0.03, o.d - 0.1), mat('#B89A70'), g, [o.x + o.w + 0.01, 0.5 + r * 0.6, cz]);
          for (let k = 0; k < 5; k++) mesh(new T.CylinderGeometry(0.05, 0.05, 0.2, 10), mat(cols[(r + k) % 5], { roughness: 0.2, transparent: true, opacity: 0.85 }), g, [o.x + o.w - 0.12, 0.62 + r * 0.6, o.y + 0.3 + k * (o.d - 0.5) / 4]);
        }
        break;
      }
      case 'sink': {
        const h = H(o.h);
        add(mesh(new T.BoxGeometry(o.w, h, o.d), mat('#DDE6EE', { roughness: 0.5 }), g, [cx, h / 2, cz]));
        mesh(new T.BoxGeometry(o.w * 0.6, 0.06, o.d * 0.55), mat('#9FB4C6', { metalness: 0.6, roughness: 0.2 }), g, [cx, h - 0.01, cz]);
        const fau = mesh(new T.TorusGeometry(0.1, 0.018, 8, 16, Math.PI), mat('#C0C8D0', { metalness: 0.8, roughness: 0.2 }), g, [cx, h + 0.1, o.y + 0.15]); fau.rotation.y = Math.PI / 2;
        break;
      }
      case 'seat': {
        mesh(new T.BoxGeometry(o.w, 0.08, o.d), mat('#C99A6B', { roughness: 0.7 }), g, [cx, 0.42, cz]);
        [-1, 1].forEach(s => mesh(new T.BoxGeometry(0.08, 0.4, o.d * 0.8), mat('#8A6A4B'), g, [cx + s * (o.w / 2 - 0.15), 0.2, cz]));
        break;
      }
      case 'railing': {
        const n = Math.round((o.x2 - o.x1) * 2);
        for (let k = 0; k <= n; k++) mesh(new T.CylinderGeometry(0.02, 0.02, 0.9, 6), mat('#FFFFFF'), g, [o.x1 + k / 2, 0.45, o.y]);
        mesh(new T.BoxGeometry(o.x2 - o.x1, 0.06, 0.1), mat('#E3D6B4'), g, [(o.x1 + o.x2) / 2, 0.92, o.y]);
        mesh(new T.BoxGeometry(o.x2 - o.x1, 0.12, 0.12), mat('#F4E9C8'), g, [(o.x1 + o.x2) / 2, 0.06, o.y + 0.08]);
        break;
      }
      case 'building': building(g, o, picks); break;
      default: add(box(g, o.x, o.y, o.w, o.d, H(o.h), o.color || '#DDE6EE'));
    }
  }
  // dụng cụ trên bàn thí nghiệm
  function benchProps(g, o, h, an) {
    const cx = o.x + o.w / 2, cz = o.y + o.d / 2;
    const glass = new T.MeshStandardMaterial({ color: 0xCFEAFB, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.45 });
    const beaker = (x, z, r, hh, liquid) => {
      mesh(new T.CylinderGeometry(r, r * 0.95, hh, 20, 1, true), glass, g, [x, h + hh / 2, z], false);
      if (liquid) mesh(new T.CylinderGeometry(r * 0.92, r * 0.9, hh * 0.6, 20), mat(liquid, { transparent: true, opacity: 0.75, roughness: 0.1 }), g, [x, h + hh * 0.3, z], false);
    };
    if (o.exp === '2A') {
      beaker(cx - 0.3, cz, 0.12, 0.3, '#BFE6F5');
      for (let k = 0; k < 4; k++) mesh(new T.CylinderGeometry(0.008, 0.008, 0.18, 5), mat('#3FB37F'), g, [cx - 0.3 + (k - 1.5) * 0.02, h + 0.1, cz], false);
      mesh(new T.CylinderGeometry(0.015, 0.015, 0.45, 8), mat('#555'), g, [cx + 0.3, h + 0.22, cz]);
      const lamp = mesh(new T.ConeGeometry(0.1, 0.14, 16, 1, true), mat('#FFD54A', { emissive: '#FFD54A', emissiveIntensity: 0.4, side: T.DoubleSide }), g, [cx + 0.2, h + 0.46, cz]); lamp.rotation.z = -1.0;
    } else if (o.exp === '2B' || o.exp === '2I') {
      const mc = new T.Group(); mc.position.set(cx, h, cz); g.add(mc);
      const dk = mat('#3A4A5A', { roughness: 0.4, metalness: 0.3 });
      mesh(new T.BoxGeometry(0.22, 0.04, 0.28), dk, mc, [0, 0.02, 0]);
      const arm = mesh(new T.BoxGeometry(0.05, 0.32, 0.06), dk, mc, [0, 0.18, -0.1]); arm.rotation.x = 0.2;
      mesh(new T.BoxGeometry(0.16, 0.02, 0.14), dk, mc, [0, 0.12, 0.02]);
      const tube = mesh(new T.CylinderGeometry(0.025, 0.03, 0.2, 12), mat('#E8EEF3', { metalness: 0.5, roughness: 0.3 }), mc, [0, 0.3, 0.02]); tube.rotation.x = -0.4;
    } else {
      const e = NL.EXPERIMENTS.find(x => x.id === o.exp);
      beaker(cx - 0.35, cz - 0.1, 0.08, 0.2, '#C8F0D2'); beaker(cx + 0.35, cz + 0.05, 0.07, 0.24, '#FFE8A3');
      const rack = new T.Group(); rack.position.set(cx, h, cz + 0.15); g.add(rack);
      mesh(new T.BoxGeometry(0.34, 0.04, 0.1), mat('#E3C08D'), rack, [0, 0.12, 0]);
      for (let k = 0; k < 4; k++) mesh(new T.CylinderGeometry(0.018, 0.018, 0.2, 10), mat(['#E86A92', '#5BB4EA', '#FFD54A', '#3FB37F'][k], { transparent: true, opacity: 0.8 }), rack, [-0.12 + k * 0.08, 0.1, 0]);
      if (e) { const ic = emojiSprite(e.icon, 0.34, g, [cx, h + 0.55, cz]); an.push(t => { ic.position.y = h + 0.55 + Math.sin(t * 2) * 0.04; }); }
    }
  }
  // tòa A1 trước sân
  function building(g, o, picks) {
    const floors = 4, hh = floors * STOREY + 0.6, x0 = o.x, z0 = o.y, w = o.w, d = o.d;
    const wm = mat('#F4E9C8', { roughness: 0.95 });
    const b = mesh(new T.BoxGeometry(w, hh, d), wm, g, [x0 + w / 2, hh / 2, z0 + d / 2]); picks.push(b);
    mesh(new T.BoxGeometry(w + 0.3, 0.3, d + 0.3), mat('#EADDB5'), g, [x0 + w / 2, hh + 0.15, z0 + d / 2]);
    const glassM = mat('#8EC9EE', { roughness: 0.1, metalness: 0.2, emissive: '#6FB6E2', emissiveIntensity: 0.15 });
    for (let f = 0; f < floors; f++) {
      const y = f * STOREY + 0.9;
      mesh(new T.BoxGeometry(w + 0.08, 0.1, 0.08), mat('#E2D2A2'), g, [x0 + w / 2, (f + 1) * STOREY + 0.05, z0 + d + 0.02], false);
      for (let k = 0; k < 12; k++) {
        if (f === 0 && k >= 4 && k <= 7) continue;
        mesh(new T.BoxGeometry(0.62, 1.4, 0.06), glassM, g, [x0 + 0.62 + k, y + 0.7, z0 + d + 0.02], false);
        mesh(new T.BoxGeometry(0.72, 0.06, 0.12), mat('#FFFFFF'), g, [x0 + 0.62 + k, y - 0.02, z0 + d + 0.05], false);
      }
      for (let k = 0; k < 3; k++) mesh(new T.BoxGeometry(0.06, 1.4, 0.6), glassM, g, [x0 + w + 0.02, y + 0.7, z0 + 0.7 + k * 1.1], false);
      label(['Tầng 1 · Sảnh', 'Tầng 2 · Lý', 'Tầng 3 · Hóa', 'Tầng 4 · Sinh'][f], { parent: g, pos: [x0 + w + 0.6, y + 0.7, z0 + d - 0.2], h: 0.3, bg: f === 3 ? '#3FB37F' : 'rgba(255,255,255,.92)', color: f === 3 ? '#fff' : '#1F4E79' });
    }
    // cửa chính, mái hiên, biển A1
    mesh(new T.BoxGeometry(1.3, 2.3, 0.06), mat('#5FA6D6', { roughness: 0.1, metalness: 0.3 }), g, [x0 + 6, 1.15, z0 + d + 0.03], false);
    mesh(new T.BoxGeometry(0.03, 2.3, 0.08), mat('#FFFFFF'), g, [x0 + 6, 1.15, z0 + d + 0.05], false);
    mesh(new T.BoxGeometry(2.4, 0.14, 1.0), mat('#FFFFFF'), g, [x0 + 6, 2.75, z0 + d + 0.5]);
    [-1, 1].forEach(s => mesh(new T.CylinderGeometry(0.06, 0.06, 2.7, 10), mat('#FFFFFF'), g, [x0 + 6 + s * 1.05, 1.35, z0 + d + 0.92]));
    label('A1', { parent: g, pos: [x0 + 6, 3.25, z0 + d + 0.4], h: 0.6, bg: '#2F80C0', color: '#fff' });
    label('Trường Đại học Sư phạm Hà Nội', { parent: g, pos: [x0 + 6, 3.95, z0 + d + 0.4], h: 0.32 });
  }

  // ---------- mũi tên dẫn đường ----------
  function guideArrow() {
    const g = new T.Group(), m = new T.MeshStandardMaterial({ color: 0xFFD54A, emissive: 0xFFB300, emissiveIntensity: 0.45, roughness: 0.4 });
    const c = new T.Mesh(new T.ConeGeometry(0.2, 0.36, 20), m); c.rotation.x = Math.PI; c.position.y = 0.18; g.add(c);
    const s = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.3, 12), m); s.position.y = 0.5; g.add(s);
    g.visible = false; return g;
  }

  // ---------- nhân vật trong cảnh ----------
  function lookKey(o) { return JSON.stringify([o.look, !!o.teacher]); }
  function charFor(id, o) {
    let c = chars.get(id);
    if (c && c.key !== lookKey(o)) { scene.remove(c.st.root); c.tag.remove(); chars.delete(id); c = null; }
    if (!c) {
      const st = makeChar(o.teacher ? Object.assign({ gender: 'f', hair: 2, hairColor: '#2B2B2B', skin: SKINS[1], body: 1 }, o.look || {}) : o.look, { teacher: o.teacher });
      scene.add(st.root);
      const tag = document.createElement('div'); tag.className = 'w3-tag'; tagBox.appendChild(tag);
      c = { st, key: lookKey(o), tag, px: o.x, py: o.y, heading: 0, seen: 0, tagHtml: '' };
      chars.set(id, c);
    }
    return c;
  }
  const EMO = { wave: '👋', poke: '👉', five: '✋', heart: '❤️', haha: '😂' };

  // ---------- vẽ mỗi khung hình ----------
  // st: { s, g, others[], self, guide, clickMark, guidePts, dt, t, focus, zoom, teacher, filming }
  let frameNo = 0;
  function render(st) {
    if (!ready) return;
    frameNo++;
    const s = st.s;
    if (curId !== s.id) {
      if (curGroup) scene.remove(curGroup);
      if (!built[s.id]) built[s.id] = build(s);
      curGroup = built[s.id]; scene.add(curGroup); curId = s.id;
      pickables = curGroup.userData.picks; anims = curGroup.userData.anims;
      chars.forEach(c => { c.st.root.visible = false; });
      const span = Math.max(s.w, s.d);
      sun.position.set(s.w / 2 + 8, 16, s.d / 2 + 6); sun.target.position.set(s.w / 2, 0, s.d / 2);
      const sc = sun.shadow.camera; sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.near = 1; sc.far = 60; sc.updateProjectionMatrix();
      camPos = null;
    }
    anims.forEach(f => f(st.t));
    sky.children.forEach(c => { c.position.x += c.userData.v * st.dt; if (c.position.x > 90) c.position.x = -90; });
    // nhân vật
    const live = new Set();
    const list = st.others.map(o => ({ id: o.id || o.name, o, x: o.rx, y: o.ry, me: false }));
    if (st.self) list.push({ id: 'self', o: st.self, x: st.self.x, y: st.self.y, me: true });
    list.forEach(({ id, o, x, y, me }) => {
      const c = charFor(id, o); live.add(id);
      const dx = x - c.px, dy = y - c.py, mv = Math.hypot(dx, dy);
      if (mv > 0.002 && mv < 2) c.heading = Math.atan2(dx, dy);
      else if (mv >= 2) c.heading = c.heading || 0;
      c.px = x; c.py = y;
      const r = c.st.root; r.visible = true; r.position.set(x, 0, y);
      let dh = c.heading - r.rotation.y; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); r.rotation.y += dh * Math.min(1, st.dt * 10);
      c.st.pose(o.anim || 'idle', st.t + (id.length || 0), o.emote);
      // nhãn tên
      const emo = o.emote && EMO[o.emote] ? EMO[o.emote] : '';
      const html = `${o.help ? '<i class="w3-help">🆘</i>' : ''}${emo ? `<i class="w3-emo">${emo}</i>` : ''}<b class="${me ? 'me' : ''}${o.teacher ? ' tch' : ''}">${esc(o.name || '')}${me && !st.teacher ? ' (em)' : o.bot ? ' (ảo)' : ''}${o.teacher ? ' 👩‍🏫' : ''}</b>${st.teacher && !o.teacher && o.status ? `<small>${esc(o.status)}</small>` : ''}`;
      if (html !== c.tagHtml) { c.tag.innerHTML = html; c.tagHtml = html; }
      const p = new T.Vector3(x, 2.0, y).project(camera);
      c.tag.style.transform = `translate(${(p.x * 0.5 + 0.5) * innerWidth}px,${(-p.y * 0.5 + 0.5) * innerHeight}px) translate(-50%,-100%)`;
      c.tag.style.display = p.z < 1 ? '' : 'none';
    });
    chars.forEach((c, id) => { if (!live.has(id)) { c.st.root.visible = false; c.tag.style.display = 'none'; } });
    // camera: nhìn chéo từ phía +x +z giống bản 2D, bám theo nhân vật
    const f = st.focus;
    const dist = (s.walls ? 6.6 : 10.5) * zoomK * (st.zoomRel || 1), elev = s.walls ? 0.62 : 0.48;
    const tgt = new T.Vector3(f.x, 0.9, f.y);
    const pos = new T.Vector3(f.x + dist * Math.cos(elev) * 0.7071, 0.9 + dist * Math.sin(elev), f.y + dist * Math.cos(elev) * 0.7071);
    if (!camPos || st.snap) { camPos = pos.clone(); camTgt = tgt.clone(); }
    const k = Math.min(1, st.dt * 5); camPos.lerp(pos, k); camTgt.lerp(tgt, k);
    camera.position.copy(camPos); camera.lookAt(camTgt);
    // dẫn đường
    if (st.guide) { arrow.visible = true; arrow.position.set(st.guide.x, 0.9 + Math.abs(Math.sin(st.t * 3)) * 0.25, st.guide.y); arrow.rotation.y = st.t; } else arrow.visible = false;
    dots.forEach((d, k2) => { const q = st.guidePts && st.guidePts[k2 * 2]; d.visible = !!q; if (q) { d.position.set(q.x, 0.015, q.y); d.material.opacity = 0.55 + 0.35 * Math.sin(st.t * 5 - k2); } });
    if (st.clickMark) { ring.visible = true; const kk = st.clickMark.t / 0.6; ring.position.set(st.clickMark.x, 0.02, st.clickMark.y); ring.scale.setScalar(1 + kk * 1.5); ring.material.opacity = 1 - kk; } else ring.visible = false;
    renderer.render(scene, camera);
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- chạm/bấm ----------
  const ray = new (function () { this.r = null; })();
  function pick(sx, sy) {
    if (!ready || !curGroup) return null;
    if (!ray.r) ray.r = new T.Raycaster();
    const nd = new T.Vector2(sx / innerWidth * 2 - 1, -(sy / innerHeight) * 2 + 1);
    ray.r.setFromCamera(nd, camera);
    const hit = ray.r.intersectObjects(pickables, false)[0];
    if (hit) return { x: hit.point.x, y: hit.point.z };
    const t = -ray.r.ray.origin.y / ray.r.ray.direction.y; if (!(t > 0)) return null;
    const p = ray.r.ray.origin.clone().addScaledVector(ray.r.ray.direction, t); return { x: p.x, y: p.z };
  }
  function hitChar(sx, sy, list) {
    if (!ready) return null;
    return list.find(o => {
      const a = new T.Vector3(o.rx, 0, o.ry).project(camera), b = new T.Vector3(o.rx, 1.8, o.ry).project(camera);
      const ax = (a.x * 0.5 + 0.5) * innerWidth, ay = (-a.y * 0.5 + 0.5) * innerHeight, by = (-b.y * 0.5 + 0.5) * innerHeight;
      const half = Math.max(16, (ay - by) * 0.22);
      return Math.abs(sx - ax) < half && sy < ay + 6 && sy > by - 6;
    }) || null;
  }

  // ---------- xem trước nhân vật ở màn chọn ----------
  const previews = new Map();
  function preview(canvas, getLook) {
    load().then(() => {
      let p = previews.get(canvas);
      if (!p) {
        const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.setSize(canvas.width, canvas.height, false);
        r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping;
        const sc = new T.Scene(); sc.add(new T.HemisphereLight(0xFFFFFF, 0xC8D8E8, 1.1)); const dl = new T.DirectionalLight(0xFFFFFF, 1.4); dl.position.set(2, 3, 4); sc.add(dl);
        const cam = new T.PerspectiveCamera(30, canvas.width / canvas.height, 0.1, 20); cam.position.set(0, 1.1, 3.4); cam.lookAt(0, 0.92, 0);
        p = { r, sc, cam, key: '', ch: null }; previews.set(canvas, p);
        const loop = () => {
          if (!canvas.isConnected) return;
          const look = getLook(), key = JSON.stringify(look);
          if (key !== p.key) { if (p.ch) p.sc.remove(p.ch.root); p.ch = makeChar(look, {}); p.sc.add(p.ch.root); p.key = key; }
          const t = performance.now() / 1000; p.ch.root.rotation.y = Math.sin(t * 0.6) * 0.5; p.ch.pose('idle', t, Math.sin(t * 0.7) > 0.5 ? 'wave' : null);
          if (canvas.offsetParent) p.r.render(p.sc, p.cam);
          requestAnimationFrame(loop);
        };
        loop();
      }
    });
  }

  return { on, init, render, pick, hitChar, preview, get ready() { return ready; }, SKINS, HAIRS, HAIR_COLS, BODIES, makeChar };
})();
