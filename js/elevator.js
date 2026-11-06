// Thang máy nhìn từ bên trong (góc POV). Bản chính: buồng thang 3D (three.js) với vách inox, gương, tay vịn, bảng nút có đèn, màn số tầng, cửa trượt hai cánh; bản 2D (?2d) dùng SVG.
window.NL = window.NL || {};
NL.elevator = (function () {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const $ = id => document.getElementById(id);
  const NAMES = { 1: 'Sảnh', 2: 'Vật lí', 3: 'Hóa học', 4: 'Sinh học' };
  const COLS = { 1: '#5BB4EA', 2: '#3FB37F', 3: '#9B6BD6', 4: '#3D8BD9' };
  let svg, busy = false, cur = 1, opts = null, hand, screen, outsideSign, outsideWall;

  function el(tag, a, p) { const e = document.createElementNS(SVGNS, tag); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function txt(p, x, y, s, size, fill, anchor) { const t = el('text', { x, y, 'font-size': size, fill, 'font-weight': 800, 'text-anchor': anchor || 'middle', 'font-family': "'Baloo 2', sans-serif" }, p); t.textContent = s; return t; }

  function buildSvg() {
    svg = $('elevSvg'); svg.innerHTML = ''; svg.style.display = '';
    const cab = el('g', { class: 'cabin' }, svg);
    // trần, sàn, hai vách
    el('polygon', { points: '0,0 1000,0 700,90 300,90', fill: '#E9EEF2' }, cab);
    el('rect', { x: 420, y: 22, width: 160, height: 30, rx: 8, fill: '#FFFBE8' }, cab);
    el('polygon', { points: '0,560 300,470 700,470 1000,560', fill: '#B7A58A' }, cab);
    for (let k = 1; k < 6; k++) el('line', { x1: 300 + k * 66.7, y1: 470, x2: k * 166.7, y2: 560, stroke: '#A8967B', 'stroke-width': 2 }, cab);
    el('polygon', { points: '0,0 300,90 300,470 0,560', fill: '#C9D3DC' }, cab);
    el('polygon', { points: '1000,0 700,90 700,470 1000,560', fill: '#BFCAD4' }, cab);
    el('line', { x1: 40, y1: 400, x2: 290, y2: 352, stroke: '#E6ECF1', 'stroke-width': 10, 'stroke-linecap': 'round' }, cab);
    el('line', { x1: 960, y1: 400, x2: 710, y2: 352, stroke: '#E6ECF1', 'stroke-width': 10, 'stroke-linecap': 'round' }, cab);
    // vách trước + khung cửa
    el('rect', { x: 300, y: 90, width: 400, height: 380, fill: '#D5DEE6' }, cab);
    el('rect', { x: 370, y: 128, width: 260, height: 342, fill: '#9AA9B7' }, cab);
    // khung cảnh bên ngoài cửa (hành lang của tầng)
    const out = el('g', {}, cab);
    const clip = el('clipPath', { id: 'doorClip' }, el('defs', {}, svg)); el('rect', { x: 378, y: 134, width: 244, height: 336 }, clip);
    out.setAttribute('clip-path', 'url(#doorClip)');
    outsideWall = el('rect', { x: 378, y: 134, width: 244, height: 230, fill: '#FBF3DC' }, out);
    el('rect', { x: 378, y: 364, width: 244, height: 106, fill: '#EFE8D6' }, out);
    el('rect', { x: 378, y: 356, width: 244, height: 10, fill: '#E6D6A8' }, out);
    el('circle', { cx: 590, cy: 320, r: 22, fill: '#4FA36B' }, out); el('rect', { x: 575, y: 330, width: 30, height: 34, rx: 4, fill: '#E08A5A' }, out);
    outsideSign = el('g', {}, out);
    // hai cánh cửa
    const dl = el('rect', { x: 378, y: 134, width: 122, height: 336, fill: '#E3E9EF', stroke: '#9AA9B7', 'stroke-width': 2, class: 'door-l' }, cab);
    const dr = el('rect', { x: 500, y: 134, width: 122, height: 336, fill: '#E3E9EF', stroke: '#9AA9B7', 'stroke-width': 2, class: 'door-r' }, cab);
    dl.style.transform = 'translateX(-118px)'; dr.style.transform = 'translateX(118px)';
    // màn hình tầng
    el('rect', { x: 452, y: 96, width: 96, height: 28, rx: 6, fill: '#14273A' }, cab);
    screen = txt(cab, 500, 117, '1', 20, '#7CF29A');
    // bảng nút bên phải
    el('polygon', { points: '740,150 880,120 880,410 740,390', fill: '#E7ECF0', stroke: '#A9B6C2', 'stroke-width': 3 }, cab);
    [4, 3, 2, 1].forEach((f, k) => {
      const y = 180 + k * 58, ready = f === 1 || NL.SUBJECTS[f].ready || (opts && opts.allowAll);
      const b = el('g', { class: 'fbtn', 'data-f': f }, cab);
      el('circle', { cx: 778, cy: y, r: 22, fill: 'transparent' }, b);
      el('circle', { cx: 778, cy: y, r: 19, fill: '#F7F9FB', stroke: ready ? COLS[f] : '#B5C0CA', 'stroke-width': 4, class: 'face' }, b);
      txt(b, 778, y + 7, String(f), 20, ready ? '#1F4E79' : '#9AA9B7');
      if (ready) txt(b, 806, y + 6, NAMES[f], 14, '#1F4E79', 'start');
      else { txt(b, 806, y - 1, NAMES[f], 13, '#9AA9B7', 'start'); txt(b, 806, y + 15, 'Sắp có', 12, '#E0A100', 'start'); }
      b._ready = ready; b._y = y;
      b.addEventListener('pointerdown', e => { e.stopPropagation(); press(f, b); });
    });
    // bàn tay (5 ngón, ngón trỏ chỉ ra)
    hand = el('g', {}, svg); hand.style.pointerEvents = 'none';
    el('rect', { x: -22, y: 30, width: 44, height: 90, rx: 18, fill: '#F4F8FB', stroke: 'rgba(30,60,90,.25)', 'stroke-width': 2 }, hand);
    el('rect', { x: -24, y: 22, width: 48, height: 16, rx: 8, fill: '#fff', stroke: 'rgba(30,60,90,.2)', 'stroke-width': 2 }, hand);
    // nắm tay, ngón trỏ duỗi ở mép trái (không để ngón chỉ nằm giữa), ba ngón gập, ngón cái vắt ngang
    const SK = { fill: '#FFE0C4', stroke: '#E8B998', 'stroke-width': 2 };
    el('rect', Object.assign({ x: -28, y: -6, width: 52, height: 42, rx: 16 }, SK), hand);
    el('rect', Object.assign({ x: -26, y: -48, width: 14, height: 50, rx: 7 }, SK), hand); // ngón trỏ
    [-10, 1, 12].forEach(fx => el('rect', Object.assign({ x: fx, y: -12, width: 11, height: 18, rx: 5.5 }, SK), hand)); // 3 ngón gập
    el('rect', Object.assign({ x: -20, y: 10, width: 34, height: 12, rx: 6, transform: 'rotate(-12 -3 16)' }, SK), hand); // ngón cái
    hand._x = 880; hand._y = 620; placeHand();
  }
  function placeHand() { hand.setAttribute('transform', `translate(${hand._x},${hand._y})`); }
  function moveHand(x, y, ms, done) {
    const x0 = hand._x, y0 = hand._y, t0 = performance.now();
    const f = now => { const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3); hand._x = x0 + (x - x0) * e; hand._y = y0 + (y - y0) * e; placeHand(); if (k < 1) requestAnimationFrame(f); else if (done) done(); };
    requestAnimationFrame(f);
  }

  // ---------- buồng thang máy 3D ----------
  let R3 = null, scene3, cam3, cv3, raf3 = 0, doors3 = null, btn3 = [], scrTex = null, signTex = null, doorT = 1, doorTarget = 1, moving3 = false, shake = 0, lastT = 0, hover3 = null;
  function canvasText(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, c); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return { c, x, t }; }
  function build3d() {
    const T = window.THREE, box = $('elevator');
    svg = $('elevSvg'); svg.style.display = 'none';
    if (!cv3) { cv3 = document.createElement('canvas'); cv3.id = 'elevCv'; box.insertBefore(cv3, box.firstChild); }
    if (!R3) { R3 = new T.WebGLRenderer({ canvas: cv3, antialias: true }); R3.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); R3.shadowMap.enabled = false; }
    scene3 = new T.Scene(); scene3.background = new T.Color(0x6F7C89);
    cam3 = new T.PerspectiveCamera(58, 1, 0.05, 50); cam3.position.set(0, 1.5, -1.95); cam3.lookAt(0, 1.3, 0.3);
    scene3.add(new T.HemisphereLight(0xFFFFFF, 0x8A96A3, 1.4)); scene3.add(new T.AmbientLight(0xFFFFFF, 0.55));
    const pl = new T.PointLight(0xFFF4DC, 1.1, 8); pl.position.set(0, 2.35, 0.2); scene3.add(pl);
    const d2 = new T.DirectionalLight(0xFFFFFF, 0.5); d2.position.set(1, 3, 2); scene3.add(d2);
    const inox = new T.MeshStandardMaterial({ color: 0xD6DEE5, metalness: 0.35, roughness: 0.45 });
    const inoxD = new T.MeshStandardMaterial({ color: 0xB9C4CE, metalness: 0.5, roughness: 0.4 });
    const W = 2.2, H = 2.5, D = 2.4, Z0 = -1.2; // buồng rộng 2,2 m, cao 2,5 m, sâu 2,4 m, tâm z = −1,2
    const wall = (w, h, pos, rot, m) => { const me = new T.Mesh(new T.PlaneGeometry(w, h), m || inox); me.position.set(...pos); if (rot) me.rotation.set(...rot); scene3.add(me); return me; };
    // sàn, trần, vách trái/phải, vách sau (gương)
    wall(W, D, [0, 0, Z0], [-Math.PI / 2, 0, 0], new T.MeshStandardMaterial({ color: 0x8C7A5E, roughness: 0.7, metalness: 0.05 }));
    wall(W, D, [0, H, Z0], [Math.PI / 2, 0, 0], new T.MeshStandardMaterial({ color: 0xF2F5F8, roughness: 0.9 }));
    const lamp = new T.Mesh(new T.BoxGeometry(0.9, 0.03, 0.5), new T.MeshStandardMaterial({ color: 0xFFFBE8, emissive: 0xFFF2C4, emissiveIntensity: 0.9 })); lamp.position.set(0, H - 0.02, Z0); scene3.add(lamp);
    wall(D, H, [-W / 2, H / 2, Z0], [0, Math.PI / 2, 0]); wall(D, H, [W / 2, H / 2, Z0], [0, -Math.PI / 2, 0]);
    // gương vách sau (bán phản chiếu: tấm sáng, khung inox)
    wall(W, H, [0, H / 2, Z0 - D / 2], [0, 0, 0], inoxD);
    const mir = new T.Mesh(new T.PlaneGeometry(W * 0.78, H * 0.55), new T.MeshStandardMaterial({ color: 0xE6F1FA, metalness: 0.6, roughness: 0.08 })); mir.position.set(0, 1.45, Z0 - D / 2 + 0.01); scene3.add(mir);
    const mf = new T.Mesh(new T.BoxGeometry(W * 0.8, H * 0.57, 0.02), inox); mf.position.set(0, 1.45, Z0 - D / 2 + 0.0); scene3.add(mf); mir.position.z += 0.015;
    // tay vịn 3 vách
    const rail = (len, pos, rot) => { const m = new T.Mesh(new T.CylinderGeometry(0.025, 0.025, len, 12), inoxD); m.position.set(...pos); m.rotation.set(...rot); scene3.add(m); };
    rail(D - 0.3, [-W / 2 + 0.06, 0.95, Z0], [Math.PI / 2, 0, 0]); rail(D - 0.3, [W / 2 - 0.06, 0.95, Z0], [Math.PI / 2, 0, 0]); rail(W - 0.3, [0, 0.95, Z0 - D / 2 + 0.06], [0, 0, Math.PI / 2]);
    // vách trước có khung cửa; hành lang bên ngoài nhìn qua cửa
    const FZ = Z0 + D / 2; // z vách trước = 0
    const frontM = inox;
    const fl = new T.Mesh(new T.PlaneGeometry((W - 1.1) / 2, H), frontM); fl.position.set(-W / 2 + (W - 1.1) / 4, H / 2, FZ); fl.rotation.y = Math.PI; scene3.add(fl);
    const fr = fl.clone(); fr.position.x = W / 2 - (W - 1.1) / 4; scene3.add(fr);
    const ft = new T.Mesh(new T.PlaneGeometry(1.1, H - 2.1), frontM); ft.position.set(0, 2.1 + (H - 2.1) / 2, FZ); ft.rotation.y = Math.PI; scene3.add(ft);
    [[-0.58, 1.05, 0.06, 2.16], [0.58, 1.05, 0.06, 2.16], [0, 2.13, 1.2, 0.06]].forEach(([x, y, w, h]) => { const f = new T.Mesh(new T.BoxGeometry(w, h, 0.06), inoxD); f.position.set(x, y, FZ + 0.02); scene3.add(f); });
    // hành lang: tường kem, sàn, biển tên tầng
    const corW = new T.Mesh(new T.PlaneGeometry(6, 3), new T.MeshStandardMaterial({ color: 0xFBF3DC, roughness: 0.9 })); corW.position.set(0, 1.5, FZ + 2.2); corW.rotation.y = Math.PI; scene3.add(corW);
    const corF = new T.Mesh(new T.PlaneGeometry(6, 2.3), new T.MeshStandardMaterial({ color: 0xE6DCC4, roughness: 0.9 })); corF.position.set(0, 0, FZ + 1.15); corF.rotation.x = -Math.PI / 2; scene3.add(corF);
    const pot = new T.Mesh(new T.CylinderGeometry(0.14, 0.11, 0.3, 12), new T.MeshStandardMaterial({ color: 0xE08A5A })); pot.position.set(0.45, 0.15, FZ + 1.4); scene3.add(pot);
    const plant = new T.Mesh(new T.SphereGeometry(0.26, 12, 10), new T.MeshStandardMaterial({ color: 0x4FA36B })); plant.position.set(0.45, 0.5, FZ + 1.4); scene3.add(plant);
    signTex = canvasText(512, 128, () => {}); const sign = new T.Mesh(new T.PlaneGeometry(1.4, 0.35), new T.MeshBasicMaterial({ map: signTex.t, transparent: true })); sign.position.set(0, 1.75, FZ + 2.18); sign.rotation.y = Math.PI; scene3.add(sign);
    // hai cánh cửa trượt
    const doorM = new T.MeshStandardMaterial({ color: 0xE3E9EF, metalness: 0.35, roughness: 0.45 });
    const mk = x => { const d = new T.Mesh(new T.BoxGeometry(0.56, 2.08, 0.04), doorM); d.position.set(x, 1.05, FZ + 0.0); const line = new T.Mesh(new T.BoxGeometry(0.02, 2.0, 0.045), inoxD); line.position.set(x > 0 ? -0.26 : 0.26, 0, 0); d.add(line); scene3.add(d); return d; };
    doors3 = { l: mk(-0.28), r: mk(0.28) };
    // màn hiển thị số tầng trên cửa
    scrTex = canvasText(256, 96, () => {}); const scr = new T.Mesh(new T.PlaneGeometry(0.5, 0.19), new T.MeshBasicMaterial({ map: scrTex.t })); scr.position.set(0, 2.3, FZ - 0.03); scr.rotation.y = Math.PI; scene3.add(scr);
    const scrF = new T.Mesh(new T.BoxGeometry(0.56, 0.24, 0.03), new T.MeshStandardMaterial({ color: 0x14273A })); scrF.position.set(0, 2.3, FZ - 0.0); scene3.add(scrF);
    // bảng nút bấm tầng trên vách phải, gần cửa
    const panel = new T.Mesh(new T.BoxGeometry(0.04, 0.9, 0.46), new T.MeshStandardMaterial({ color: 0xEDF1F4, metalness: 0.2, roughness: 0.5 })); panel.position.set(-W / 2 + 0.02, 1.3, FZ - 0.45); scene3.add(panel);
    btn3 = [];
    [4, 3, 2, 1].forEach((f, k) => {
      const ready = f === 1 || NL.SUBJECTS[f].ready || (opts && opts.allowAll);
      const g = new T.Group(); g.position.set(-W / 2 + 0.045, 1.6 - k * 0.2, FZ - 0.58); scene3.add(g);
      const b = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 0.02, 24), new T.MeshStandardMaterial({ color: ready ? 0xF7F9FB : 0xD5DCE2, emissive: 0x000000, emissiveIntensity: 1, metalness: 0.3, roughness: 0.4 })); b.rotation.z = Math.PI / 2; g.add(b);
      const ring = new T.Mesh(new T.TorusGeometry(0.052, 0.009, 8, 24), new T.MeshStandardMaterial({ color: ready ? parseInt(COLS[f].slice(1), 16) : 0xB5C0CA, emissive: ready ? parseInt(COLS[f].slice(1), 16) : 0x000000, emissiveIntensity: 0.25 })); ring.rotation.y = Math.PI / 2; g.add(ring);
      const lab = canvasText(256, 96, x => { x.font = "800 64px 'Baloo 2', sans-serif"; x.textAlign = 'center'; x.fillStyle = ready ? '#1F4E79' : '#9AA9B7'; x.fillText(String(f), 128, 70); });
      const tm = new T.Mesh(new T.PlaneGeometry(0.1, 0.0375), new T.MeshBasicMaterial({ map: lab.t, transparent: true })); tm.position.set(0.012, 0, 0); tm.rotation.y = Math.PI / 2; g.add(tm);
      const nm = canvasText(512, 96, x => { x.font = "800 58px 'Baloo 2', sans-serif"; x.textAlign = 'left'; x.fillStyle = ready ? '#1F4E79' : '#9AA9B7'; x.fillText(NAMES[f] + (ready ? '' : ' · Sắp có'), 8, 62); });
      const nmM = new T.Mesh(new T.PlaneGeometry(0.32, 0.06), new T.MeshBasicMaterial({ map: nm.t, transparent: true })); nmM.position.set(0.012, -0.012, 0.17); nmM.rotation.y = Math.PI / 2; g.add(nmM);
      g.userData = { f, ready, face: b, ring }; btn3.push(g);
    });
    doorT = 1; doorTarget = 1; moving3 = false; shake = 0;
    resize3();
    if (!cv3._bound) { cv3._bound = true; cv3.addEventListener('pointerdown', onDown3); cv3.addEventListener('pointermove', onMove3); window.addEventListener('resize', resize3); }
    cancelAnimationFrame(raf3); lastT = performance.now(); raf3 = requestAnimationFrame(loop3);
  }
  function resize3() { if (!R3 || !cv3) return; const w = cv3.clientWidth || innerWidth, h = cv3.clientHeight || innerHeight; R3.setSize(w, h, false); cam3.aspect = w / h; cam3.fov = w < h ? 78 : 58; cam3.updateProjectionMatrix(); }
  function pick3(e) {
    const r = cv3.getBoundingClientRect(), v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const rc = new THREE.Raycaster(); rc.setFromCamera(v, cam3);
    const hits = rc.intersectObjects(btn3, true); return hits.length ? hits[0].object.parent : null;
  }
  function onMove3(e) { const g = pick3(e); if (g !== hover3) { hover3 = g; cv3.style.cursor = g ? 'pointer' : ''; } }
  function onDown3(e) { const g = pick3(e); if (g) { e.preventDefault(); press3(g.userData.f, g); } }
  function setBtnLit(g, col) { g.userData.face.material.emissive.setHex(col); g.userData.face.material.color.setHex(col ? 0xFFF3C4 : (g.userData.ready ? 0xF7F9FB : 0xD5DCE2)); }
  function loop3(now) {
    if (!isOpen() || !R3) return;
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    doorT += (doorTarget - doorT) * Math.min(1, dt * 3.2);
    if (doors3) { doors3.l.position.x = -0.28 - 0.5 * doorT; doors3.r.position.x = 0.28 + 0.5 * doorT; }
    // rung nhẹ khi thang chạy
    const t = now / 1000;
    const sh = moving3 ? 0.006 : 0; shake += (sh - shake) * Math.min(1, dt * 4);
    cam3.position.set(Math.sin(t * 23) * shake, 1.5 + Math.sin(t * 17) * shake * 1.2 + (moving3 ? Math.sin(t * 2.5) * 0.004 : 0), -1.95 + Math.cos(t * 19) * shake * 0.5);
    cam3.lookAt(0, 1.3, 0.3);
    R3.render(scene3, cam3);
    raf3 = requestAnimationFrame(loop3);
  }
  function drawScreen(txt) { if (!scrTex) return; const { x, c, t } = scrTex; x.fillStyle = '#14273A'; x.fillRect(0, 0, c.width, c.height); x.font = "800 64px 'Baloo 2', sans-serif"; x.textAlign = 'center'; x.fillStyle = '#7CF29A'; x.fillText(txt, c.width / 2, 72); t.needsUpdate = true; }
  function drawSign(f) { if (!signTex) return; const { x, c, t } = signTex; x.clearRect(0, 0, c.width, c.height); x.fillStyle = COLS[f]; x.beginPath(); x.roundRect ? x.roundRect(8, 16, c.width - 16, c.height - 32, 48) : x.rect(8, 16, c.width - 16, c.height - 32); x.fill(); x.font = "800 52px 'Baloo 2', sans-serif"; x.textAlign = 'center'; x.fillStyle = '#fff'; x.fillText('Tầng ' + f + ' · ' + NAMES[f], c.width / 2, 82); t.needsUpdate = true; }
  function press3(f, g) {
    if (busy) return;
    NL.audio.play('click');
    setBtnLit(g, g.userData.ready ? 0xFFB300 : 0xFF5A5A);
    if (!g.userData.ready) { NL.helpers.toast('Tầng ' + f + ' không có phòng học, em chọn tầng 2, 3 hoặc 4 nhé'); setTimeout(() => setBtnLit(g, 0), 600); return; }
    if (f === cur) { $('elevTip').textContent = 'Em đang ở tầng này rồi'; setTimeout(() => setBtnLit(g, 0), 600); return; }
    ride3(f, g);
  }
  function ride3(to, g) {
    busy = true; $('elevTip').textContent = 'Thang đang chạy…';
    NL.audio.play('door'); doorTarget = 0;
    let f = cur; const dir = to > cur ? 1 : -1;
    setTimeout(() => {
      moving3 = true;
      (function stepF() {
        f += dir; drawScreen(f + (f === to ? '' : dir > 0 ? ' ▲' : ' ▼'));
        if (f !== to) { setTimeout(stepF, 700); return; }
        setTimeout(() => {
          moving3 = false; NL.audio.play('ting');
          cur = to; drawSign(to); drawScreen(String(to)); setBtnLit(g, 0);
          doorTarget = 1;
          $('elevTip').textContent = 'Tới tầng ' + to + ' rồi!';
          setTimeout(() => { busy = false; close(); opts.onArrive(to); }, 1300);
        }, 500);
      })();
    }, 1000);
  }
  const use3d = () => !!window.THREE && !/[?&]2d\b/.test(location.search);

  function setOutside(f) {
    if (use3d()) { drawSign(f); drawScreen(String(f)); return; }
    outsideSign.innerHTML = '';
    const col = COLS[f];
    el('rect', { x: 410, y: 190, width: 140, height: 40, rx: 20, fill: col }, outsideSign);
    txt(outsideSign, 480, 217, 'Tầng ' + f + ' · ' + NAMES[f], 17, '#fff');
    screen.textContent = f;
  }

  function press(f, b) {
    if (busy) return;
    NL.audio.play('click');
    moveHand(778 + 19, b._y + 46, 280, () => {
      b.querySelector('.face').setAttribute('fill', b._ready ? '#FFE9A8' : '#FFD6D6');
      setTimeout(() => moveHand(880, 620, 400), 250);
      if (!b._ready) { NL.helpers.toast('Tầng ' + f + ' không có phòng học, em chọn tầng 2, 3 hoặc 4 nhé'); setTimeout(() => b.querySelector('.face').setAttribute('fill', '#F7F9FB'), 600); return; }
      if (f === cur) { $('elevTip').textContent = 'Em đang ở tầng này rồi'; setTimeout(() => b.querySelector('.face').setAttribute('fill', '#F7F9FB'), 600); return; }
      ride(f, b);
    });
  }

  function ride(to, b) {
    busy = true; $('elevTip').textContent = 'Thang đang chạy…';
    NL.audio.play('door');
    const box = $('elevator'); box.classList.add('closed');
    let f = cur; const dir = to > cur ? 1 : -1;
    setTimeout(() => {
      box.classList.add('moving');
      (function stepF() {
        f += dir; screen.textContent = f + (f === to ? '' : dir > 0 ? ' ▲' : ' ▼');
        if (f !== to) { setTimeout(stepF, 700); return; }
        setTimeout(() => {
          box.classList.remove('moving');
          NL.audio.play('ting');
          cur = to; setOutside(to);
          b.querySelector('.face').setAttribute('fill', '#F7F9FB');
          box.classList.remove('closed');
          $('elevTip').textContent = 'Tới tầng ' + to + ' rồi!';
          setTimeout(() => { busy = false; close(); opts.onArrive(to); }, 1300);
        }, 500);
      })();
    }, 1000);
  }

  function open(o) {
    opts = o; cur = o.floor; busy = false;
    if (use3d()) build3d(); else buildSvg();
    setOutside(cur);
    $('elevTip').textContent = 'Bấm số tầng muốn lên';
    const box = $('elevator'); box.classList.remove('closed', 'moving', 'hidden');
  }
  function close() { $('elevator').classList.add('hidden'); cancelAnimationFrame(raf3); }
  function isOpen() { return !$('elevator').classList.contains('hidden'); }

  document.addEventListener('DOMContentLoaded', () => {
    $('elevClose').addEventListener('click', () => { if (busy) return; NL.audio.play('click'); close(); opts && opts.onExit(); });
  });
  return { open, close, isOpen, get busy() { return busy; } };
})();
