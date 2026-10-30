// Bản 3D thử nghiệm (mở bằng ?3d): vẽ lại các khung cảnh bằng three.js.
// Logic đi lại, thang máy, thí nghiệm, nhiều người chơi vẫn dùng chung với bản 2D (main.js, scenes.js).
// Toạ độ: ô (x, y) của bản 2D = (X, Z) trong 3D, trục Y hướng lên, 1 ô = 1 mét.
window.NL = window.NL || {};
NL.w3 = (function () {
  const on = new URLSearchParams(location.search).has('3d');
  let T, renderer, scene, camera, cv, sky, sun, hemi, ready = false, loading = null;
  let built = {}, curId = null, curGroup = null, anims = [], pickables = [], active = [], shellV = 1, doorOpen = 0, seamT = 0, skyBg = null, skyFog = null, sunDisc = null;
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
      skyBg = skyTex(); skyFog = new T.Fog(0xCFEAFB, 45, 130);
      scene.background = skyBg; scene.fog = skyFog;
      camera = new T.PerspectiveCamera(38, 1, 0.1, 400);
      hemi = new T.HemisphereLight(0xEAF6FF, 0xB9D8A0, 0.9); scene.add(hemi);
      sun = new T.DirectionalLight(0xFFE9C4, 2.1); sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
      scene.add(sun); scene.add(sun.target);
      scene.add(new T.AmbientLight(0xFFFFFF, 0.25));
      sky = clouds(); scene.add(sky);
      // mặt trời rực rỡ trên trời
      sunDisc = new T.Sprite(new T.SpriteMaterial({ map: canvasTex(256, 256, (x) => { const gr = x.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.25, 'rgba(255,236,150,.95)'); gr.addColorStop(0.5, 'rgba(255,220,120,.35)'); gr.addColorStop(1, 'rgba(255,220,120,0)'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); }), transparent: true, depthWrite: false, fog: false }));
      sunDisc.scale.set(26, 26, 1); scene.add(sunDisc);
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

  // ---------- nhân vật chibi: bảng chọn giống bản demo Student Chibi ----------
  const SKINS = ['#FBE3D0', '#F2C6A5', '#E2AC86', '#C68B62', '#9F6845', '#6F4631'];
  // chỉ số kiểu tóc giữ như cũ để nhân vật đã lưu không đổi; HAIR_UI là 5 kiểu hiện ở bảng chọn
  const HAIRS = ['Ngắn', 'Dài', 'Búi', 'Đuôi ngựa', 'Rẽ ngôi', 'Xoăn', 'Mái bằng'];
  const HAIR_UI = [0, 1, 5, 3, 6];
  const HAIR_COLS = ['#2A2321', '#6B4330', '#E4BE76', '#B5442E', '#5B7FD6', '#F09ABD', '#69BB89'];
  const HAIR_NAMES = ['Đen', 'Nâu', 'Vàng', 'Đỏ', 'Xanh dương', 'Hồng', 'Xanh lá'];
  const EYE_COLS = ['#4A3025', '#1F1A1A', '#B07A2A', '#4E8B63', '#4A72B5'];
  const EYES = ['Tròn', 'Long lanh', 'Hiền', 'Cười híp'];
  const BROWS = ['Tự nhiên', 'Mảnh', 'Đậm', 'Cong'];
  const MOUTHS = ['Cười nhẹ', 'Cười tươi', 'Chữ O', 'Nhếch môi'];
  const EXPRS = ['😄 Vui vẻ', '🧐 Tò mò', '😮 Ngạc nhiên', '😎 Tự tin', '🤔 Suy nghĩ'];
  const OUTFITS = ['🥼 Áo blouse', '👔 Sơ mi', '👕 Áo phông'];
  const COATS = ['#FFFFFF', '#BCD5F6', '#F8C6D7', '#C3E8D0', '#D7C9F4'];
  const COAT_NAMES = ['Trắng', 'Xanh dương', 'Hồng', 'Xanh lá', 'Tím'];
  const SHIRTS = ['#F3B8C8', '#F2F2EE', '#B9D4F2', '#F6DC97', '#A9DCC4', '#4E5D82'];
  const BODIES = ['Gầy', 'Vừa', 'Đầy đặn'];
  const FACES = EXPRS;
  // biểu cảm: lông mày [trong, ngoài] dịch lên (+) xuống (−) cho mắt trái/phải, hướng nhìn, miệng thay thế
  const EXPR_FACE = [
    { brow: [[6, 6], [6, 6]], gaze: [0, 0], cheek: 0.5 },
    { brow: [[-8, 2], [16, 20]], gaze: [12, -2], cheek: 0.35 },
    { brow: [[24, 18], [24, 18]], gaze: [0, 0], cheek: 0.3, mouth: 2, big: true },
    { brow: [[-12, 2], [-12, 2]], gaze: [0, 0], cheek: 0.35, squint: true },
    { brow: [[-8, 0], [14, 18]], gaze: [-12, -12], cheek: 0.3, mouth: 4 },
  ];
  // mặt vẽ bằng canvas: mắt to long lanh, má hồng, lông mày, miệng theo lựa chọn và biểu cảm
  const faceTex = {};
  function faceTexture(f) {
    const k = JSON.stringify(f);
    if (faceTex[k]) return faceTex[k];
    faceTex[k] = canvasTex(512, 512, (x, W, H) => {
      const cx = W / 2, ey = 250, ex = 92, E = EXPR_FACE[f.expr] || EXPR_FACE[0];
      let eyes = f.eyes; if (E.big && eyes > 1) eyes = 0;
      // má hồng
      x.fillStyle = `rgba(255,120,140,${E.cheek})`; [-1, 1].forEach(s => { x.beginPath(); x.ellipse(cx + s * 128, ey + 70, 40, 24, 0, 0, 7); x.fill(); });
      // lông mày
      x.strokeStyle = f.browC; x.lineCap = 'round'; x.lineWidth = [12, 7, 19, 11][f.brows] * (f.gender === 'm' ? 1.15 : 1);
      [-1, 1].forEach((s, i) => {
        const [up, upO] = E.brow[i], arch = f.brows === 3 ? 34 : 16;
        x.beginPath(); x.moveTo(cx + s * (ex - 36), ey - 70 - up); x.quadraticCurveTo(cx + s * ex, ey - 70 - arch - (up + upO) / 2, cx + s * (ex + 36), ey - 72 - upO); x.stroke();
      });
      // mắt
      const [gx, gy] = E.gaze;
      const eye = s => {
        const X = cx + s * ex;
        if (eyes === 3) { x.strokeStyle = '#2A1D14'; x.lineWidth = 14; x.beginPath(); x.arc(X, ey + 12, 30, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); return; }
        const r = E.big ? 44 : eyes === 1 ? 41 : 38;
        x.save();
        const lidY = eyes === 2 ? ey - 6 : E.squint ? ey - 16 : null;
        if (lidY !== null) { x.beginPath(); x.rect(X - 60, lidY, 120, 120); x.clip(); }
        x.fillStyle = '#2A1D14'; x.beginPath(); x.ellipse(X, ey, r * 0.78, r, 0, 0, 7); x.fill();
        const pr = E.big ? 0.42 : 0.55;
        x.fillStyle = f.eyeC; x.beginPath(); x.ellipse(X + gx * 0.5, ey + 10 + gy * 0.5, r * pr, r * (pr + 0.05), 0, 0, 7); x.fill();
        x.fillStyle = '#fff'; x.beginPath(); x.arc(X - 10 + gx * 0.4, ey - 14 + gy * 0.4, eyes === 1 ? 14 : 12, 0, 7); x.fill(); x.beginPath(); x.arc(X + 10 + gx * 0.4, ey + 14 + gy * 0.4, eyes === 1 ? 7 : 5, 0, 7); x.fill();
        if (eyes === 1) { x.beginPath(); x.arc(X + 14, ey - 6, 4, 0, 7); x.fill(); }
        x.restore();
        if (lidY !== null) { x.strokeStyle = '#2A1D14'; x.lineWidth = 9; x.beginPath(); x.moveTo(X - r * 0.85, lidY + 4); x.quadraticCurveTo(X, lidY - 4, X + r * 0.85, lidY + 4); x.stroke(); }
        if (f.gender === 'f') { x.strokeStyle = '#2A1D14'; x.lineWidth = 7; const top = lidY !== null ? lidY : ey - r * 0.8; [[0.62, -10, 22], [0.78, 4, 18]].forEach(([dx, dy, l]) => { x.beginPath(); x.moveTo(X + s * r * dx, top + dy + 6); x.lineTo(X + s * (r * dx + l * 0.7), top + dy - l * 0.6); x.stroke(); }); }
      };
      eye(-1); eye(1);
      if (f.teacher) { x.strokeStyle = '#2B3440'; x.lineWidth = 7; [-1, 1].forEach(s => { x.beginPath(); x.arc(cx + s * ex, ey, 52, 0, 7); x.stroke(); }); x.beginPath(); x.moveTo(cx - 40, ey); x.lineTo(cx + 40, ey); x.stroke(); }
      // miệng
      const my = ey + 100, mouth = E.mouth != null ? E.mouth : f.mouth;
      x.lineWidth = 11; x.strokeStyle = '#8E3B3B'; x.lineCap = 'round';
      if (mouth === 0) { x.beginPath(); x.arc(cx, my - 22, 30, Math.PI * 0.18, Math.PI * 0.82); x.stroke(); }
      else if (mouth === 1) { x.fillStyle = '#9C3A3A'; x.beginPath(); x.moveTo(cx - 42, my - 10); x.quadraticCurveTo(cx, my + 60, cx + 42, my - 10); x.closePath(); x.fill(); x.fillStyle = '#fff'; x.fillRect(cx - 30, my - 9, 60, 12); x.fillStyle = '#F07C8C'; x.beginPath(); x.ellipse(cx, my + 22, 18, 10, 0, 0, 7); x.fill(); }
      else if (mouth === 2) { x.fillStyle = '#9C3A3A'; x.beginPath(); x.ellipse(cx, my + 4, 18, 24, 0, 0, 7); x.fill(); }
      else if (mouth === 3) { x.beginPath(); x.moveTo(cx - 26, my + 4); x.quadraticCurveTo(cx + 10, my + 16, cx + 34, my - 8); x.stroke(); }
      else { x.beginPath(); x.moveTo(cx - 6, my + 4); x.lineTo(cx + 30, my); x.stroke(); }
    });
    return faceTex[k];
  }
  // Nhân vật chibi mặc áo blouse: đầu to, mắt to, tươi cười
  function makeChar(look, o = {}) {
    look = look || {};
    const fem = look.gender === 'f', bw = [0.88, 1, 1.22][look.body == null ? 1 : look.body];
    const outfit = o.teacher ? 0 : (look.outfit || 0), skirt = !o.teacher && look.bottom === 'skirt', expr = look.expr == null ? (look.face === 3 ? 2 : 0) : look.expr;
    const skinC = look.skin || SKINS[1], skin = mat(skinC, { roughness: 0.55 });
    const coatC = o.teacher ? '#2F80C0' : (look.coat || '#FFFFFF');
    const coat = mat(coatC, { roughness: 0.65 }), coatEdge = mat(/^#F[A-F]F[A-F]F[A-F]$/i.test(coatC) ? '#DDE8F0' : NL.shade ? NL.shade(coatC, -12) : coatC, { roughness: 0.7 });
    const shirtC = look.shirt || (fem ? '#FF9FB4' : look.gender === 'n' ? '#A9DCC4' : '#7FC4F0');
    const shirt = mat(shirtC), pants = mat(o.teacher ? '#2E3A4A' : '#3E5C8A'), shoe = mat(fem ? '#E8607A' : '#3A4A6A', { roughness: 0.45 });
    const sleeveM = outfit === 0 ? coat : shirt;
    const hairC = look.hairColor && /^#/.test(look.hairColor) ? look.hairColor : '#2B2B2B', hairM = mat(hairC, { roughness: 0.5 });
    const root = new T.Group(), body = new T.Group(); root.add(body);
    // chân ngắn + giày tròn
    const leg = side => {
      const g = new T.Group(); g.position.set(side * 0.075 * bw, 0.4, 0); body.add(g);
      mesh(new T.CapsuleGeometry(0.055 * Math.sqrt(bw), 0.22, 4, 10), skirt ? skin : pants, g, [0, -0.18, 0]);
      const sh = mesh(new T.SphereGeometry(0.075, 14, 10), shoe, g, [0, -0.35, 0.03]); sh.scale.set(0.9, 0.6, 1.3);
      return g;
    };
    const legL = leg(-1), legR = leg(1);
    // thân tròn + áo blouse xoè
    const torso = new T.Group(); torso.position.y = 0.4; body.add(torso);
    const tb = mesh(new T.SphereGeometry(0.16, 20, 16), shirt, torso, [0, 0.17, 0]); tb.scale.set(1.05 * bw, 1.15, 0.85 * bw);
    if (skirt) { const sk = mesh(new T.CylinderGeometry(0.15 * bw, 0.23 * bw, 0.17, 18, 1, true), new T.MeshStandardMaterial({ color: '#3E5C8A', roughness: 0.7, side: T.DoubleSide, flatShading: true }), torso, [0, 0.0, 0]); sk.scale.z = 0.9; }
    if (outfit === 0) {
    const prof = [[0.08, 0.36], [0.15 * bw, 0.33], [0.175 * bw, 0.22], [0.19 * bw, 0.06], [0.22 * bw, -0.06], [0.225 * bw, -0.075]].map(([r, y]) => new T.Vector2(r, y));
    const cm = mesh(new T.LatheGeometry(prof, 28, 0.42, Math.PI * 2 - 0.84), new T.MeshStandardMaterial({ color: coatC, roughness: 0.65, side: T.DoubleSide }), torso, [0, 0, 0]); cm.scale.z = 0.85;
    const fz = 0.15 * bw * 0.85;
    [-1, 1].forEach(s => { const l = mesh(new T.BoxGeometry(0.035, 0.14, 0.01), coatEdge, torso, [s * 0.05, 0.27, fz + 0.012]); l.rotation.z = s * 0.35; });
    mesh(new T.BoxGeometry(0.07, 0.055, 0.01), coatEdge, torso, [0.1 * bw, 0.05, 0.19 * bw * 0.85 + 0.01]);
    const pen = mesh(new T.CylinderGeometry(0.008, 0.008, 0.07, 6), mat('#2F80C0'), torso, [0.1 * bw, 0.09, 0.19 * bw * 0.85 + 0.015], false);
    void pen;
    } else {
      const fz = 0.16 * bw * 0.85 * 0.98;
      if (outfit === 1) { // sơ mi: cổ áo trắng, hàng cúc
        const col = mat(NL.shade ? NL.shade(shirtC, 30) : '#FFFFFF');
        [-1, 1].forEach(s => { const c = mesh(new T.BoxGeometry(0.075, 0.045, 0.012), col, torso, [s * 0.04, 0.315, fz - 0.005]); c.rotation.z = s * 0.5; c.rotation.x = -0.35; });
        [0.24, 0.17, 0.1].forEach(y => mesh(new T.SphereGeometry(0.009, 8, 6), mat(NL.shade ? NL.shade(shirtC, -25) : '#888'), torso, [0, y, fz + 0.004], false));
      } else { // áo phông: viền cổ tròn
        const nk = mesh(new T.TorusGeometry(0.055, 0.01, 6, 18, Math.PI), mat(NL.shade ? NL.shade(shirtC, -15) : shirtC), torso, [0, 0.33, fz - 0.03], false); nk.rotation.set(-0.9, 0, Math.PI);
      }
    }
    // tay ngắn, bàn tay tròn
    const arm = side => {
      const g = new T.Group(); g.position.set(side * 0.17 * bw, 0.31, 0); torso.add(g);
      if (outfit === 2) { mesh(new T.SphereGeometry(0.06 * Math.sqrt(bw), 12, 10), shirt, g, [0, -0.04, 0]).scale.set(1, 1.1, 1); mesh(new T.CapsuleGeometry(0.04 * Math.sqrt(bw), 0.12, 4, 10), skin, g, [0, -0.13, 0]); }
      else mesh(new T.CapsuleGeometry(0.05 * Math.sqrt(bw), 0.16, 4, 10), sleeveM, g, [0, -0.11, 0]);
      mesh(new T.SphereGeometry(0.048, 12, 10), skin, g, [0, -0.25, 0]);
      return g;
    };
    const armL = arm(-1), armR = arm(1);
    // đầu to
    const head = new T.Group(); head.position.y = 0.98; body.add(head);
    const HR = 0.25;
    const skull = mesh(new T.SphereGeometry(HR, 32, 24), skin, head, [0, 0, 0]); skull.scale.set(1.04, 0.98, 0.96);
    [-1, 1].forEach(s => mesh(new T.SphereGeometry(0.045, 12, 10), skin, head, [s * HR * 1.02, -0.01, 0]));
    // mặt (dán lên nửa trước của đầu)
    const fm = new T.MeshStandardMaterial({ map: faceTexture({ eyes: look.eyes || 0, brows: look.brows || 0, mouth: look.mouth != null ? look.mouth : (look.face === 1 || look.face === 5 ? 1 : 0), expr, gender: look.gender, eyeC: look.eyeColor || '#5A3A22', browC: NL.shade ? NL.shade(hairC, -18) : hairC, teacher: !!o.teacher }), transparent: true, roughness: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const face = new T.Mesh(new T.SphereGeometry(HR * 1.004, 40, 30, Math.PI / 2 - 0.95, 1.9, Math.PI / 2 - 0.8, 1.6), fm);
    face.scale.copy(skull.scale); head.add(face); face.renderOrder = 2;
    const nose = mesh(new T.SphereGeometry(0.014, 10, 8), mat(NL.shade ? NL.shade(skinC, -8) : skinC), head, [0, -0.045, HR * 0.97], false); void nose;
    // tóc: phủ đỉnh và sau đầu, mái ngắn ở trên mắt
    const hs = look.hair || 0;
    const cap = mesh(new T.SphereGeometry(HR * 1.07, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.42), hairM, head, [0, 0.015, -0.01]); cap.scale.set(1.04, 1.0, 1.0);
    const back = mesh(new T.SphereGeometry(HR * 1.06, 28, 18, Math.PI * 1.15, Math.PI * 0.7, Math.PI * 0.25, Math.PI * 0.5), hairM, head, [0, 0, -0.005]); back.scale.set(1.03, 1, 1);
    // mái: vài lọn bo tròn, đáy cao hơn mắt
    if (hs === 6) { const bg = mesh(new T.SphereGeometry(0.1, 20, 12), hairM, head, [0, 0.155, HR * 0.8]); bg.scale.set(2.35, 0.62, 0.75); }
    else for (let k = -2; k <= 2; k++) { const f = mesh(new T.SphereGeometry(0.07, 12, 10), hairM, head, [k * 0.075, 0.15 - Math.abs(k) * 0.012, HR * 0.83 - Math.abs(k) * 0.03]); f.scale.set(1.1, 0.62, 0.7); f.rotation.z = -k * 0.2; }
    [-1, 1].forEach(s => { const sd = mesh(new T.SphereGeometry(0.07, 12, 10), hairM, head, [s * HR * 0.95, 0.06, -0.02]); sd.scale.set(0.55, 1.1, 0.9); });
    if (hs === 1) { const lg = mesh(new T.CapsuleGeometry(0.17, 0.2, 6, 16), hairM, head, [0, -0.16, -0.1]); lg.scale.set(1.45, 1, 0.75); }
    if (hs === 2) mesh(new T.SphereGeometry(0.1, 16, 12), hairM, head, [0, 0.24, -0.12]);
    if (hs === 3) { const p = mesh(new T.CapsuleGeometry(0.06, 0.22, 6, 10), hairM, head, [0, -0.02, -0.3]); p.rotation.x = 0.5; mesh(new T.TorusGeometry(0.04, 0.015, 8, 14), mat('#FF6B8A'), head, [0, 0.1, -0.26]).rotation.x = 1.1; }
    if (hs === 4) { const f = mesh(new T.SphereGeometry(0.12, 16, 12), hairM, head, [-0.09, 0.2, 0.12]); f.scale.set(1.3, 0.5, 0.9); }
    if (hs === 5) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; mesh(new T.SphereGeometry(0.075, 10, 8), hairM, head, [Math.cos(a) * 0.22, 0.13 + Math.sin(k * 1.7) * 0.03, Math.sin(a) * 0.21 - 0.03]); }
    if (fem && hs !== 1 && hs !== 5) mesh(new T.SphereGeometry(0.035, 10, 8), mat('#FF6B8A'), head, [HR * 0.75, 0.17, 0.08]);
    root.traverse(m => { if (m.isMesh) m.userData.char = true; });
    const st = { root, legL, legR, armL, armR, body, head, heading: 0, expr };
    st.pose = (anim, t, emote) => {
      const w = anim === 'walk' ? Math.sin(t * 10) : 0;
      legL.rotation.x = w * 0.7; legR.rotation.x = -w * 0.7;
      armL.rotation.x = -w * 0.6; armR.rotation.x = w * 0.6; armL.rotation.z = -0.25; armR.rotation.z = 0.25; armR.rotation.y = 0;
      body.position.y = anim === 'walk' ? Math.abs(Math.sin(t * 10)) * 0.04 : Math.sin(t * 2.2) * 0.008;
      body.rotation.z = 0; body.rotation.y = 0; head.rotation.set(0, 0, anim === 'idle' ? Math.sin(t * 1.3) * 0.05 : 0);
      if (anim === 'dance') { body.position.y = Math.abs(Math.sin(t * 8)) * 0.1; body.rotation.z = Math.sin(t * 4) * 0.15; armL.rotation.z = -2.4 + Math.sin(t * 8) * 0.4; armR.rotation.z = 2.4 + Math.sin(t * 8 + 1) * 0.4; legL.rotation.x = Math.sin(t * 8) * 0.4; legR.rotation.x = -Math.sin(t * 8) * 0.4; }
      if (anim === 'special') { body.position.y = Math.abs(Math.sin(t * 6)) * 0.16; body.rotation.y = t * 6; armL.rotation.z = -1.6; armR.rotation.z = 1.6; }
      if (anim === 'jump') { body.position.y = Math.abs(Math.sin(t * 6)) * 0.2; armR.rotation.z = 2.7 + Math.sin(t * 12) * 0.2; }
      if (anim === 'idle' && !emote) {
        if (expr === 1) head.rotation.z = 0.2 + Math.sin(t * 1.3) * 0.03;
        if (expr === 2) { armL.rotation.z = -1.0; armR.rotation.z = 1.0; head.rotation.x = -0.08; }
        if (expr === 3) { armL.rotation.z = -0.75; armR.rotation.z = 0.75; armL.rotation.x = 0.35; armR.rotation.x = 0.35; head.rotation.x = -0.06; }
        if (expr === 4) { armR.rotation.set(-1.95, 0, -0.45); head.rotation.z = -0.12 + Math.sin(t * 0.9) * 0.03; }
      }
            if (emote === 'wave' || emote === 'five') { armR.rotation.z = 2.6; armR.rotation.x = 0; armR.rotation.y = Math.sin(t * 12) * 0.4; }
      if (emote === 'poke') armR.rotation.x = -1.4;
      if (emote === 'haha') head.rotation.x = -0.2 + Math.sin(t * 16) * 0.08;
    };
    root.scale.setScalar(o.scale || 1);
    return st;
  }

  // ---------- dựng khung cảnh từ dữ liệu scenes.js ----------
  const WALL_C = '#FBF3DC';
  // sân trước và sảnh nằm chung một không gian: sảnh đặt bên trong tầng 1 tòa A1 để đi liền mạch
  const OFF = { lobby: [2, -5.4] };
  const LINK = { outside: ['lobby'], lobby: ['outside'] };
  const offOf = id => OFF[id] || [0, 0];
  let grassTexC = null;
  function grassTex(rep) {
    if (!grassTexC) grassTexC = canvasTex(512, 512, (x, W, H) => {
      x.fillStyle = '#8CCB72'; x.fillRect(0, 0, W, H);
      const R = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
      for (let k = 0; k < 2600; k++) { const px = R() * W, py = R() * H, l = 5 + R() * 9; x.strokeStyle = ['#7DBE63', '#9AD57E', '#6FB257', '#A8DC8C'][k % 4]; x.lineWidth = 2; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (R() - 0.5) * 4, py - l); x.stroke(); }
      for (let k = 0; k < 70; k++) { const px = R() * W, py = R() * H; x.fillStyle = ['#FFFFFF', '#FFE066', '#FF9EBB', '#C9B6FF'][k % 4]; x.beginPath(); x.arc(px, py, 3, 0, 7); x.fill(); x.fillStyle = '#FFD23F'; x.beginPath(); x.arc(px, py, 1.2, 0, 7); x.fill(); }
    });
    const t = grassTexC.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep, rep); return t;
  }
  // khuôn viên trường: cỏ hoa, hàng cây đung đưa, đèn, ghế đá, các nhà khác phía xa, lá bay
  function campus(g, s, an, opt = {}) {
    const R = (() => { let k = 11; return () => (k = (k * 16807) % 2147483647) / 2147483647; })();
    const gr = mesh(new T.PlaneGeometry(220, 220), new T.MeshStandardMaterial({ map: grassTex(60), roughness: 1 }), g, [s.w / 2, -0.03, s.d / 2], false); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true;
    const keep = opt.keep || [-3, -12, s.w + 3, s.d + 2];
    const free = (x, z) => !(x > keep[0] && x < keep[2] && z > keep[1] && z < keep[3]);
    let n = 0;
    while (n < 46) {
      const x = s.w / 2 + (R() - 0.5) * 70, z = s.d / 2 + (R() - 0.5) * 70; if (!free(x, z)) continue; n++;
      obj(g, { kind: R() > 0.3 ? 'tree' : 'bush', x: x - 0.5, y: z - 0.5, w: 1, d: 1, big: 0.8 + R() * 0.7 }, [], an);
    }
    // bồn hoa
    for (let k = 0; k < 14; k++) {
      const x = s.w / 2 + (R() - 0.5) * 40, z = s.d / 2 + (R() - 0.5) * 40; if (!free(x, z)) continue;
      for (let j = 0; j < 9; j++) mesh(new T.SphereGeometry(0.09, 8, 6), mat(['#FF7BA0', '#FFD23F', '#FFFFFF', '#B497FF'][j % 4], { roughness: 0.6 }), g, [x + (R() - 0.5) * 1.2, 0.12, z + (R() - 0.5) * 1.2], false);
    }
    // nhà khác trong trường phía xa
    [[-22, -20, 14, 10, 4], [30, -18, 12, 9, 5], [-26, 18, 10, 12, 3], [34, 20, 14, 10, 4]].forEach(([x, z, w, d, fl]) => {
      const h = fl * STOREY, bt = canvasTex(128, 128, (c, W, H) => { c.fillStyle = '#F2E4C6'; c.fillRect(0, 0, W, H); c.fillStyle = '#8EC9EE'; for (let k = 0; k < 4; k++) c.fillRect(10 + k * 30, 40, 18, 50); });
      bt.wrapS = bt.wrapT = T.RepeatWrapping; bt.repeat.set(w / 3, fl);
      const m = new T.MeshStandardMaterial({ map: bt, roughness: 0.9 });
      mesh(new T.BoxGeometry(w, h, d), [m, m, mat('#E3D3AA'), mat('#E3D3AA'), m, m], g, [s.w / 2 + x, h / 2, s.d / 2 + z]);
      mesh(new T.BoxGeometry(w + 0.6, 0.6, d + 0.6), mat('#C9604B', { roughness: 0.8 }), g, [s.w / 2 + x, h + 0.3, s.d / 2 + z]);
    });
    // lá rơi bay theo gió
    const leafG = new T.PlaneGeometry(0.12, 0.08), leaves = [];
    for (let k = 0; k < 36; k++) { const l = new T.Mesh(leafG, new T.MeshStandardMaterial({ color: ['#7CC36A', '#E9C46A', '#A7D676'][k % 3], side: T.DoubleSide })); l.userData = { x: s.w / 2 + (R() - 0.5) * 30, z: s.d / 2 + (R() - 0.5) * 24, y: R() * 6, sp: 0.3 + R() * 0.5, ph: R() * 6 }; g.add(l); leaves.push(l); }
    an.push((t, dt) => leaves.forEach(l => { const u = l.userData; u.y -= u.sp * (dt || 0.016); u.x += 0.6 * (dt || 0.016); if (u.y < 0) { u.y = 5 + R() * 3; u.x = s.w / 2 + (R() - 0.5) * 30 - 6; } l.position.set(u.x + Math.sin(t * 2 + u.ph) * 0.4, u.y, u.z); l.rotation.set(t * 2 + u.ph, t * 1.3, 0); }));
  }
  // tấm biển gắn tường: chữ vẽ trên canvas, dán phẳng lên tường nên không bị cắt chữ
  function wallSign(g, side, m, y, text, o = {}) {
    const fs = 64, pad = 34, font = `800 ${fs}px 'Baloo 2', sans-serif`;
    const mc = document.createElement('canvas').getContext('2d'); mc.font = font;
    const W = Math.ceil(mc.measureText(text).width) + pad * 2, Hh = Math.round(fs * 1.6);
    const tex = canvasTex(W, Hh, (x) => {
      x.fillStyle = o.bg || '#2F80C0'; x.beginPath(); x.roundRect ? x.roundRect(0, 0, W, Hh, 22) : x.rect(0, 0, W, Hh); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 5; x.beginPath(); x.roundRect ? x.roundRect(6, 6, W - 12, Hh - 12, 18) : x.rect(6, 6, W - 12, Hh - 12); x.stroke();
      x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = o.color || '#fff'; x.fillText(text, W / 2, Hh / 2 + 3);
    });
    let h = o.h || 0.3, w = h * W / Hh; if (o.maxW && w > o.maxW) { w = o.maxW; h = w * Hh / W; }
    const p = mesh(new T.BoxGeometry(w, h, 0.03), [mat('#E6EEF5'), mat('#E6EEF5'), mat('#E6EEF5'), mat('#E6EEF5'), new T.MeshStandardMaterial({ map: tex, roughness: 0.5 }), mat('#E6EEF5')], g, null, false);
    const out = (o.out || 0.03);
    if (side === 'N') p.position.set(m, y, out); else { p.position.set(out, y, m); p.rotation.y = Math.PI / 2; }
    return p;
  }
  function build(s) {
    const g = new T.Group(); const picks = [], an = [];
    const f = s.floor || 1, balcony = s.triggers.some(tr => tr.type === 'balcony');
    const linked = !!LINK[s.id], interior = s.walls && !balcony && !linked;
    if (!s.walls) campus(g, s, an, { keep: [-1, -10, s.w + 1, s.d + 1] });
    else if (balcony) { const cg = new T.Group(); cg.position.y = -(f - 1) * STOREY - 0.12; g.add(cg); campus(cg, s, an, { keep: [-2, -2, s.w + 2, s.d + 8] }); }
    else if (interior) { const fl0 = mesh(new T.PlaneGeometry(80, 80), mat('#EFE6D4', { roughness: 1 }), g, [s.w / 2, -0.14, s.d / 2], false); fl0.rotation.x = -Math.PI / 2; }
    // sàn: sân ngoài trời vẽ cỏ + gạch lát, trong nhà vẽ gạch men
    const R = s.walls ? 32 : 64, ft = canvasTex(s.w * R, s.d * R, (x) => {
      for (let yy = 0; yy < s.d; yy++) for (let xx = 0; xx < s.w; xx++) {
        const c = s.floorColor(xx, yy), isGrass = !s.walls && /^#(A6DB8F|9CD385)$/i.test(c);
        if (isGrass) continue;
        x.fillStyle = c; x.fillRect(xx * R, yy * R, R, R);
        x.strokeStyle = s.walls ? 'rgba(30,60,90,.08)' : 'rgba(120,100,70,.25)'; x.lineWidth = s.walls ? 1 : 3; x.strokeRect(xx * R + 1, yy * R + 1, R - 2, R - 2);
      }
    });
    ft.magFilter = s.walls ? T.NearestFilter : T.LinearFilter;
    const fl = mesh(new T.PlaneGeometry(s.w, s.d), new T.MeshStandardMaterial({ map: ft, roughness: 0.75, transparent: !s.walls }), g, [s.w / 2, 0.002, s.d / 2], false); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; picks.push(fl);
    if (!s.walls) { const pk = mesh(new T.PlaneGeometry(s.w, s.d), new T.MeshBasicMaterial({ visible: false }), g, [s.w / 2, 0, s.d / 2], false); pk.rotation.x = -Math.PI / 2; picks.push(pk); }
    if (s.walls) {
      if (f > 1) { // khối tòa nhà bên dưới (thấy khi nhìn ra ban công)
        const bt = canvasTex(256, 128, (x, w, h) => { x.fillStyle = '#F4E9C8'; x.fillRect(0, 0, w, h); x.fillStyle = '#8EC9EE'; for (let k = 0; k < 8; k++) x.fillRect(8 + k * 31, 34, 18, 52); x.fillStyle = '#E2D2A2'; x.fillRect(0, h - 8, w, 8); });
        bt.wrapS = bt.wrapT = T.RepeatWrapping; bt.repeat.set(Math.ceil(s.w / 6), f - 1);
        const bm = new T.MeshStandardMaterial({ map: bt, roughness: 0.9 });
        const hb = (f - 1) * STOREY; mesh(new T.BoxGeometry(s.w, hb, s.d), [bm, bm, mat('#EADDB5'), mat('#EADDB5'), bm, bm], g, [s.w / 2, -hb / 2 - 0.13, s.d / 2], false);
      }
      mesh(new T.BoxGeometry(s.w, 0.12, s.d), mat('#E7DCC0'), g, [s.w / 2, -0.065, s.d / 2], false);
      // tường bắc (z = 0) và tây (x = 0)
      const wm = mat(WALL_C, { roughness: 0.95 });
      const wn = mesh(new T.BoxGeometry(s.w + 0.15, WALL_H, 0.15), wm, g, [s.w / 2 - 0.075, WALL_H / 2, -0.075]); picks.push(wn);
      const ww = mesh(new T.BoxGeometry(0.15, WALL_H, s.d), wm, g, [-0.075, WALL_H / 2, s.d / 2]); picks.push(ww);
      mesh(new T.BoxGeometry(s.w + 0.15, 0.12, 0.03), mat('#E6D6A8'), g, [s.w / 2 - 0.075, 0.06, 0.005], false);
      mesh(new T.BoxGeometry(0.03, 0.12, s.d), mat('#E6D6A8'), g, [0.005, 0.06, s.d / 2], false);
      // phòng kín: tường nam, đông cắt thấp (kiểu nhà búp bê) để nhìn vào, chừa lối ra
      if (!balcony) {
        const gapS = s.triggers.filter(tr => tr.type === 'goto' && tr.y2 >= s.d - 0.7).map(tr => [tr.x1 - 0.2, tr.x2 + 0.2]);
        const gapE = s.triggers.filter(tr => tr.type === 'goto' && tr.x2 >= s.w - 0.7).map(tr => [tr.y1 - 0.2, tr.y2 + 0.2]);
        const runs = (len, gaps) => { const out = []; let a = 0; gaps.sort((p, q) => p[0] - q[0]).forEach(([g0, g1]) => { if (g0 > a) out.push([a, g0]); a = Math.max(a, g1); }); if (a < len) out.push([a, len]); return out; };
        const LH = 0.5, cap = mat('#FFFFFF', { roughness: 0.5 });
        runs(s.w + 0.15, gapS).forEach(([a, b]) => { mesh(new T.BoxGeometry(b - a, LH, 0.15), wm, g, [(a + b) / 2, LH / 2, s.d + 0.075]); mesh(new T.BoxGeometry(b - a, 0.04, 0.18), cap, g, [(a + b) / 2, LH + 0.02, s.d + 0.075], false); });
        runs(s.d, gapE).forEach(([a, b]) => { mesh(new T.BoxGeometry(0.15, LH, b - a), wm, g, [s.w + 0.075, LH / 2, (a + b) / 2]); mesh(new T.BoxGeometry(0.18, 0.04, b - a), cap, g, [s.w + 0.075, LH + 0.02, (a + b) / 2], false); });
      }
      (s.deco || []).forEach(dc => deco(g, dc, picks));
    }
    (s.mats || []).forEach(m => {
      const p = mesh(new T.PlaneGeometry(m.w, 1), mat('#5BB4EA', { roughness: 0.6 }), g, [m.x + m.w / 2, 0.012, m.y + 0.5], false); p.rotation.x = -Math.PI / 2;
      label(m.label, { parent: g, pos: [m.x + m.w / 2, 0.35, m.y + 0.5], h: 0.26 });
    });
    (s.tags || []).forEach(tg => label(tg.label, { parent: g, pos: [tg.x, 0.6, tg.y], h: 0.26 }));
    s.objects.forEach(o => obj(g, o, picks, an));
    if (s.walls) { const pl = new T.PointLight(0xFFF2D8, 0.5, 18); pl.position.set(s.w / 2, 2.6, s.d / 2); g.add(pl); }
    const o2 = offOf(s.id); g.position.set(o2[0], linked && s.walls ? 0.012 : 0, o2[1]);
    g.userData = { picks, anims: an, env: interior ? 'indoor' : 'sky' };
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
      wallSign(g, w.side, m, 2.28, w.floorLabel || '▲', { h: 0.13, bg: '#14273A', color: '#7CF29A', out: 0.16 });
      wallSign(g, w.side, m, 2.62, '🛗 Thang máy', { h: 0.28, bg: '#FFFFFF', color: '#1F4E79', maxW: (w.b - w.a) + 0.6 });
      void disp;
    } else if (w.kind === 'door') {
      onWall(g, w.side, w.a - 0.1, w.b + 0.1, 0, 2.3, 0.06, mat('#FFFFFF'));
      const d = onWall(g, w.side, w.a, w.b, 0, 2.18, 0.08, mat(w.locked ? '#C9D3DD' : '#9FD3F2', { roughness: 0.4 })); picks.push(d);
      onWall(g, w.side, w.a + 0.15, w.b - 0.15, 1.05, 1.95, 0.09, mat('#E8F6FF', { roughness: 0.1, emissive: '#CFEFFF', emissiveIntensity: 0.3 }));
      const hx = w.b - 0.22; onWall(g, w.side, hx - 0.03, hx + 0.03, 0.95, 1.12, 0.12, mat('#C9A227', { metalness: 0.7, roughness: 0.3 }));
      wallSign(g, w.side, m, 2.52, w.label, { h: 0.3, bg: w.locked ? '#9AA9B7' : (w.color || '#2F80C0'), maxW: (w.b - w.a) + 0.55 });
      if (w.sub) wallSign(g, w.side, m, 1.45, w.sub, { h: 0.22, bg: '#FFFFFF', color: '#1F4E79', out: 0.11 });
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
        const tr = new T.Group(); tr.position.set(cx, 0, cz); tr.scale.setScalar(o.big || 1); g.add(tr);
        mesh(new T.CylinderGeometry(0.12, 0.18, 1.8, 10), mat('#8A5A3B'), tr, [0, 0.9, 0]);
        const top = new T.Group(); top.position.set(0, 2.2, 0); tr.add(top);
        [[0, 0.4, 0, 0.95], [-0.5, 0, 0.2, 0.7], [0.5, 0, -0.1, 0.7], [0.1, 0.9, 0, 0.6], [0, 0, 0.5, 0.65]].forEach(([x, y, z, r], k) => mesh(new T.IcosahedronGeometry(r, 1), mat(k % 2 ? '#5DB36F' : '#4FA36B', { flatShading: true }), top, [x, y, z]));
        an.push(t => { top.rotation.z = Math.sin(t * 1.4 + o.x) * 0.05 + Math.sin(t * 3.1 + o.y) * 0.015; top.rotation.x = Math.sin(t * 1.1 + o.y) * 0.03; });
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
  // tòa A1 trước sân: sâu 9 m để sảnh tầng 1 nằm gọn bên trong; mờ dần khi em bước vào sảnh
  let bShell = null, bMats = [], doorL = null, doorR = null, doorAt = null;
  function building(g, o, picks) {
    const floors = 4, hh = floors * STOREY + 0.6, x0 = o.x, w = o.w, fz = o.y + o.d, D = 9, z0 = fz - D;
    const bg = new T.Group(); g.add(bg); bShell = bg;
    const wm = mat('#F4E9C8', { roughness: 0.95 });
    const b = mesh(new T.BoxGeometry(w, hh, D), wm, bg, [x0 + w / 2, hh / 2, z0 + D / 2]); picks.push(b);
    mesh(new T.BoxGeometry(w + 0.3, 0.3, D + 0.3), mat('#EADDB5'), bg, [x0 + w / 2, hh + 0.15, z0 + D / 2]);
    const glassM = mat('#8EC9EE', { roughness: 0.1, metalness: 0.2, emissive: '#6FB6E2', emissiveIntensity: 0.15 });
    for (let f = 0; f < floors; f++) {
      const y = f * STOREY + 0.9;
      mesh(new T.BoxGeometry(w + 0.08, 0.1, 0.08), mat('#E2D2A2'), bg, [x0 + w / 2, (f + 1) * STOREY + 0.05, fz + 0.02], false);
      for (let k = 0; k < 12; k++) {
        if (f === 0 && k >= 4 && k <= 7) continue;
        mesh(new T.BoxGeometry(0.62, 1.4, 0.06), glassM, bg, [x0 + 0.62 + k, y + 0.7, fz + 0.02], false);
        mesh(new T.BoxGeometry(0.72, 0.06, 0.12), mat('#FFFFFF'), bg, [x0 + 0.62 + k, y - 0.02, fz + 0.05], false);
      }
      for (let k = 0; k < 7; k++) mesh(new T.BoxGeometry(0.06, 1.4, 0.6), glassM, bg, [x0 + w + 0.02, y + 0.7, z0 + 0.8 + k * 1.2], false);
      wallSign(bg, 'N', 0, 0, ['Tầng 1 · Sảnh', 'Tầng 2 · Lý', 'Tầng 3 · Hóa', 'Tầng 4 · Sinh'][f], { h: 0.32, bg: f === 3 ? '#3FB37F' : '#FFFFFF', color: f === 3 ? '#fff' : '#1F4E79' }).position.set(x0 + w + 0.06, y + 0.7, fz - 0.6);
      bg.children[bg.children.length - 1].rotation.y = Math.PI / 2;
    }
    // sảnh vào: bậc thềm, cửa kính đôi tự mở, 4 cột tròn, mái đón có biển A1
    const gx = x0 + 6, wh = mat('#FFFFFF', { roughness: 0.5 });
    [[4.8, 0.03, 2.0], [4.4, 0.06, 1.6], [4.0, 0.09, 1.2]].forEach(([w2, h2, d2]) => mesh(new T.BoxGeometry(w2, h2, d2), mat('#E9E2D0'), g, [gx, h2 / 2, fz + d2 / 2 - 0.1]));
    mesh(new T.BoxGeometry(3.0, 3.0, 0.18), mat('#D9CFB5'), bg, [gx, 1.8, fz + 0.06], false);
    const dm = mat('#5FA6D6', { roughness: 0.08, metalness: 0.35, emissive: '#4F96C6', emissiveIntensity: 0.15, transparent: true, opacity: 0.8 });
    doorL = mesh(new T.BoxGeometry(1.24, 2.7, 0.06), dm, bg, [gx - 0.63, 1.35, fz + 0.18], false);
    doorR = mesh(new T.BoxGeometry(1.24, 2.7, 0.06), dm, bg, [gx + 0.63, 1.35, fz + 0.18], false);
    [doorL, doorR].forEach((d, k) => { mesh(new T.BoxGeometry(0.05, 0.5, 0.06), mat('#C9A227', { metalness: 0.7, roughness: 0.3 }), d, [k ? -0.52 : 0.52, 0.05, 0.05], false); });
    doorL.userData.x = gx - 0.63; doorR.userData.x = gx + 0.63; doorAt = [gx, fz];
    mesh(new T.BoxGeometry(2.6, 0.08, 0.1), wh, bg, [gx, 2.74, fz + 0.18], false);
    [-2.05, -1.25, 1.25, 2.05].forEach(dx => {
      mesh(new T.CylinderGeometry(0.15, 0.17, 3.5, 20), wh, bg, [gx + dx, 2.05, fz + 1.75]);
      mesh(new T.BoxGeometry(0.42, 0.12, 0.42), wh, bg, [gx + dx, 0.36, fz + 1.75]);
    });
    mesh(new T.BoxGeometry(5.2, 0.36, 2.4), wh, bg, [gx, 3.98, fz + 1.05]);
    mesh(new T.BoxGeometry(5.3, 0.08, 2.5), mat('#2F80C0'), bg, [gx, 4.2, fz + 1.05]);
    wallSign(bg, 'N', gx, 3.95, 'Trường Đại học Sư phạm Hà Nội', { h: 0.28, bg: '#FFFFFF', color: '#1F4E79', out: fz + 2.27 });
    wallSign(bg, 'N', gx, 4.75, 'A1', { h: 0.7, out: fz + 1.5 });
    wallSign(bg, 'N', gx, 3.02, '🚪 Lối vào', { h: 0.24, bg: '#3FB37F', out: fz + 0.2 });
    // vật liệu riêng để làm mờ cả khối
    bMats = [];
    bg.traverse(m => { if (m.isMesh) { const arr = Array.isArray(m.material) ? m.material : [m.material]; const cl = arr.map(x => { const c = x.clone(); c.transparent = true; c.userData.op = x.opacity; bMats.push(c); return c; }); m.material = Array.isArray(m.material) ? cl : cl[0]; } });
  }
  function shellFade(v) {
    if (!bShell) return;
    bShell.visible = v > 0.02;
    bMats.forEach(m => { m.opacity = (m.userData.op == null ? 1 : m.userData.op) * v; m.depthWrite = v > 0.95; });
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
      const want = [s.id].concat(LINK[s.id] || []);
      active.forEach(id => { if (!want.includes(id)) scene.remove(built[id]); });
      want.forEach(id => { if (!built[id]) built[id] = build(NL.scenes[id]); if (!active.includes(id)) scene.add(built[id]); });
      const seam = curId && (LINK[curId] || []).includes(s.id);
      active = want; curId = s.id; curGroup = built[s.id];
      pickables = curGroup.userData.picks; anims = [].concat(...want.map(id => built[id].userData.anims));
      chars.forEach(c => { c.st.root.visible = false; });
      // nắng: phủ cả sân + sảnh khi đang ở cụm liền mạch
      const base = LINK[s.id] ? NL.scenes.outside : s, span = Math.max(base.w, base.d) + 4;
      sun.position.set(base.w / 2 + 10, 18, base.d / 2 + 8); sun.target.position.set(base.w / 2, 0, base.d / 2 - 2);
      const sc = sun.shadow.camera; sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.near = 1; sc.far = 70; sc.updateProjectionMatrix();
      const indoor = curGroup.userData.env === 'indoor';
      scene.background = indoor ? new T.Color('#EFE6D4') : skyBg; scene.fog = indoor ? new T.Fog(0xEFE6D4, 10, 26) : skyFog; sky.visible = !indoor; sunDisc.visible = !indoor;
      if (!seam) camPos = null; seamT = seam ? 1.2 : 0;
    }
    // vỏ tòa A1 mờ dần khi vào sảnh, hiện lại khi ra sân; cửa kính tự mở khi đến gần
    if (built.outside && active.includes('outside')) {
      const tf = curId === 'outside' ? 1 : 0; shellV += (tf - shellV) * Math.min(1, st.dt * 3); if (Math.abs(tf - shellV) < 0.01) shellV = tf; shellFade(shellV);
      if (built.lobby) built.lobby.visible = shellV < 0.98;
      const me = st.self, o0 = offOf(curId), near = me && doorAt && Math.hypot(me.x + o0[0] - doorAt[0], me.y + o0[1] - doorAt[1]) < 2.6;
      doorOpen += ((near ? 1 : 0) - doorOpen) * Math.min(1, st.dt * 5);
      if (doorL) { doorL.position.x = doorL.userData.x - doorOpen * 1.1; doorR.position.x = doorR.userData.x + doorOpen * 1.1; }
    }
    anims.forEach(f => f(st.t, st.dt));
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
      const o0 = offOf(curId), r = c.st.root; r.visible = true; r.position.set(x + o0[0], curGroup.position.y, y + o0[1]);
      let dh = c.heading - r.rotation.y; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); r.rotation.y += dh * Math.min(1, st.dt * 10);
      c.st.pose(o.anim || 'idle', st.t + (id.length || 0), o.emote);
      // nhãn tên
      const emo = o.emote && EMO[o.emote] ? EMO[o.emote] : '';
      const html = `${o.help ? '<i class="w3-help">🆘</i>' : ''}${emo ? `<i class="w3-emo">${emo}</i>` : ''}<b class="${me ? 'me' : ''}${o.teacher ? ' tch' : ''}">${esc(o.name || '')}${me && !st.teacher ? ' (em)' : o.bot ? ' (ảo)' : ''}${o.teacher ? ' 👩‍🏫' : ''}</b>${st.teacher && !o.teacher && o.status ? `<small>${esc(o.status)}</small>` : ''}`;
      if (html !== c.tagHtml) { c.tag.innerHTML = html; c.tagHtml = html; }
      const p = new T.Vector3(x + o0[0], 1.5, y + o0[1]).project(camera);
      c.tag.style.transform = `translate(${(p.x * 0.5 + 0.5) * innerWidth}px,${(-p.y * 0.5 + 0.5) * innerHeight}px) translate(-50%,-100%)`;
      c.tag.style.display = p.z < 1 ? '' : 'none';
    });
    chars.forEach((c, id) => { if (!live.has(id)) { c.st.root.visible = false; c.tag.style.display = 'none'; } });
    // camera: nhìn chéo từ phía +x +z giống bản 2D, bám theo nhân vật
    const f0 = st.focus, oo = offOf(curId), f = { x: f0.x + oo[0], y: f0.y + oo[1] };
    const dist = (s.walls ? 5.8 : 9.5) * zoomK * (st.zoomRel || 1), elev = s.walls ? 0.62 : 0.48;
    const tgt = new T.Vector3(f.x, 0.7, f.y);
    const pos = new T.Vector3(f.x + dist * Math.cos(elev) * 0.7071, 0.9 + dist * Math.sin(elev), f.y + dist * Math.cos(elev) * 0.7071);
    if (!camPos || st.snap) { camPos = pos.clone(); camTgt = tgt.clone(); }
    seamT = Math.max(0, seamT - st.dt);
    const k = Math.min(1, st.dt * (seamT > 0 ? 2.2 : 5)); camPos.lerp(pos, k); camTgt.lerp(tgt, k);
    sunDisc.position.set(camPos.x + 40, camPos.y + 38, camPos.z - 70);
    camera.position.copy(camPos); camera.lookAt(camTgt);
    // dẫn đường
    if (st.guide) { arrow.visible = true; arrow.position.set(st.guide.x + oo[0], 0.9 + Math.abs(Math.sin(st.t * 3)) * 0.25, st.guide.y + oo[1]); arrow.rotation.y = st.t; } else arrow.visible = false;
    dots.forEach((d, k2) => { const q = st.guidePts && st.guidePts[k2 * 2]; d.visible = !!q; if (q) { d.position.set(q.x + oo[0], 0.03, q.y + oo[1]); d.material.opacity = 0.55 + 0.35 * Math.sin(st.t * 5 - k2); } });
    if (st.clickMark) { ring.visible = true; const kk = st.clickMark.t / 0.6; ring.position.set(st.clickMark.x + oo[0], 0.03, st.clickMark.y + oo[1]); ring.scale.setScalar(1 + kk * 1.5); ring.material.opacity = 1 - kk; } else ring.visible = false;
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
    const oo = offOf(curId);
    if (hit) return { x: hit.point.x - oo[0], y: hit.point.z - oo[1] };
    const t = -ray.r.ray.origin.y / ray.r.ray.direction.y; if (!(t > 0)) return null;
    const p = ray.r.ray.origin.clone().addScaledVector(ray.r.ray.direction, t); return { x: p.x - oo[0], y: p.z - oo[1] };
  }
  function hitChar(sx, sy, list) {
    if (!ready) return null;
    return list.find(o => {
      const oo = offOf(curId), a = new T.Vector3(o.rx + oo[0], 0, o.ry + oo[1]).project(camera), b = new T.Vector3(o.rx + oo[0], 1.3, o.ry + oo[1]).project(camera);
      const ax = (a.x * 0.5 + 0.5) * innerWidth, ay = (-a.y * 0.5 + 0.5) * innerHeight, by = (-b.y * 0.5 + 0.5) * innerHeight;
      const half = Math.max(16, (ay - by) * 0.22);
      return Math.abs(sx - ax) < half && sy < ay + 6 && sy > by - 6;
    }) || null;
  }

  // ---------- xem trước nhân vật ở màn chọn ----------
  const previews = new Map();
  function spin(canvas) { const p = previews.get(canvas); if (p) p.hop = performance.now(); }
  function preview(canvas, getLook) {
    load().then(() => {
      let p = previews.get(canvas);
      if (!p) {
        const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); r.setPixelRatio(Math.min(2, devicePixelRatio || 1)); r.setSize(canvas.width, canvas.height, false);
        r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping;
        const sc = new T.Scene(); sc.add(new T.HemisphereLight(0xFFFFFF, 0xC8D8E8, 1.1)); const dl = new T.DirectionalLight(0xFFFFFF, 1.4); dl.position.set(2, 3, 4); sc.add(dl);
        const cam = new T.PerspectiveCamera(30, canvas.width / canvas.height, 0.1, 20); const near = canvas.width >= 280; cam.position.set(0, 0.85, near ? 3.3 : 3.6); cam.lookAt(0, 0.66, 0);
        p = { r, sc, cam, key: '', ch: null, rot: 0, drag: null, touched: 0 }; previews.set(canvas, p);
        // kéo để xoay nhân vật 360°
        canvas.style.touchAction = 'none'; canvas.style.cursor = 'grab';
        canvas.addEventListener('pointerdown', e => { p.drag = e.clientX; p.touched = performance.now(); canvas.setPointerCapture(e.pointerId); });
        canvas.addEventListener('pointermove', e => { if (p.drag == null) return; p.rot += (e.clientX - p.drag) * 0.012; p.drag = e.clientX; p.touched = performance.now(); });
        const up = () => { p.drag = null; }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
        const loop = () => {
          if (!canvas.isConnected) return;
          const look = getLook(), key = JSON.stringify(look);
          if (key !== p.key) { if (p.ch) p.sc.remove(p.ch.root); p.ch = makeChar(look, {}); p.sc.add(p.ch.root); p.key = key; }
          const t = performance.now() / 1000;
          if (performance.now() - p.touched > 4000) p.rot += (Math.sin(t * 0.6) * 0.5 - (((p.rot + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI)) * 0.03;
          p.ch.root.rotation.y = p.rot;
          if (p.hop) { const k = (performance.now() - p.hop) / 600; if (k >= 1) p.hop = 0; else { p.ch.root.rotation.y = p.rot + k * Math.PI * 2; p.ch.root.position.y = Math.sin(k * Math.PI) * 0.12; } }
          p.ch.pose('idle', t, p.ch.expr === 0 && Math.sin(t * 0.7) > 0.5 ? 'wave' : null);
          if (canvas.offsetParent) p.r.render(p.sc, p.cam);
          requestAnimationFrame(loop);
        };
        loop();
      }
    });
  }

  return { on, init, render, pick, hitChar, preview, spin, seamless: (a, b) => !!(LINK[a] && LINK[a].includes(b)), get ready() { return ready; }, SKINS, HAIRS, HAIR_UI, HAIR_COLS, HAIR_NAMES, EYE_COLS, EYES, BROWS, MOUTHS, EXPRS, OUTFITS, COATS, COAT_NAMES, SHIRTS, BODIES, FACES, makeChar };
})();
