// Khung xem mô hình 3D dùng chung cho 10 mô hình Sinh (phòng Mô hình 3D, tầng 4).
// Mỗi mô hình gọi NL.m3d.register(id, { title, tabs, build(api, tab), data(api), quizKey }).
// three.js chỉ được tải khi mở mô hình đầu tiên để trò chơi vào nhanh.
window.NL = window.NL || {};
NL.MODELS = [
  { id: 'M1', no: 1, short: 'Tế bào', name: 'Tế bào nhân thực', icon: '🧫' },
  { id: 'M2', no: 2, short: 'DNA & RNA', name: 'Phân tử DNA và RNA', icon: '🧬' },
  { id: 'M3', no: 3, short: 'Tim mạch', name: 'Tim và hệ tuần hoàn', icon: '🫀' },
  { id: 'M4', no: 4, short: 'Neuron', name: 'Neuron và synapse', icon: '⚡' },
  { id: 'M5', no: 5, short: 'Hô hấp', name: 'Hệ hô hấp và thông khí', icon: '🫁' },
  { id: 'M6', no: 6, short: 'Hoa', name: 'Hoa lưỡng tính và thụ phấn', icon: '🌺' },
  { id: 'M7', no: 7, short: 'Tiêu hóa', name: 'Hệ tiêu hóa', icon: '🍽️' },
  { id: 'M8', no: 8, short: 'Tháp sinh thái', name: 'Tháp sinh thái', icon: '🔺' },
  { id: 'M9', no: 9, short: 'Mắt & tai', name: 'Mắt và tai người', icon: '👁️' },
  { id: 'M10', no: 10, short: 'Đột biến NST', name: 'Đột biến cấu trúc NST', icon: '🧶' }
];

NL.m3d = (function () {
  const DEFS = {};
  let T = null, R = null, cv = null, root = null, ui = null;
  let st = null; // trạng thái lúc đang mở một mô hình
  let raf = 0, lastT = 0;

  function register(id, def) { DEFS[id] = def; }

  function loadScript(src) {
    return new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  }
  function loadThree() {
    if (window.THREE && THREE.OrbitControls) return Promise.resolve();
    return loadScript('js/vendor/three.min.js').then(() => loadScript('js/vendor/OrbitControls.js'));
  }

  // ---------- khung giao diện ----------
  function buildUI() {
    root = document.createElement('div'); root.id = 'm3d'; root.className = 'm3d dark hidden';
    root.innerHTML = `
      <canvas class="m3d-cv"></canvas>
      <div class="m3d-labels"></div>
      <div class="m3d-top">
        <button class="icon-btn pop" data-k="close" title="Rời mô hình">✕</button>
        <div class="m3d-title"><span class="m3d-no"></span><b></b></div>
        <div class="m3d-tabs"></div>
      </div>
      <div class="m3d-info hidden"></div>
      <button class="icon-btn pop m3d-sidebtn" data-k="side" title="Bảng điều khiển">☰</button>
      <div class="m3d-side"></div>
      <div class="m3d-tools">
        <button class="btn small pop" data-k="data">📊 Số liệu</button>
        <button class="btn small pop" data-k="quiz">📝 Kiểm tra</button>
        <button class="btn small ghost pop" data-k="shot">🖼 Lưu ảnh</button>
        <button class="btn small ghost pop" data-k="bg">🌓 Nền</button>
        <button class="btn small ghost pop" data-k="home">🎯</button>
      </div>
      <div class="m3d-strip hidden"><canvas></canvas></div>
      <div class="m3d-hint">Kéo để xoay · cuộn hoặc chụm 2 ngón để phóng to · chạm vào bộ phận để xem</div>
      <div class="m3d-load">Đang dựng mô hình…</div>`;
    document.body.appendChild(root);
    cv = root.querySelector('.m3d-cv');
    ui = {
      labels: root.querySelector('.m3d-labels'), title: root.querySelector('.m3d-title b'), no: root.querySelector('.m3d-no'),
      tabs: root.querySelector('.m3d-tabs'), info: root.querySelector('.m3d-info'), side: root.querySelector('.m3d-side'),
      strip: root.querySelector('.m3d-strip'), stripCv: root.querySelector('.m3d-strip canvas'), hint: root.querySelector('.m3d-hint'),
      load: root.querySelector('.m3d-load')
    };
    root.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', e => {
      const k = b.dataset.k; NL.audio.play('click');
      if (k === 'close') close();
      else if (k === 'side') root.classList.toggle('side-off');
      else if (k === 'data') openData();
      else if (k === 'quiz') runQuiz();
      else if (k === 'shot') screenshot();
      else if (k === 'bg') { root.classList.toggle('dark'); root.classList.toggle('light'); setBg(); }
      else if (k === 'home') { deselect(); homeView(); }
      e.stopPropagation();
    }));
    window.addEventListener('resize', resize);
  }

  function initGL() {
    T = window.THREE;
    R = new T.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, alpha: false });
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    R.localClippingEnabled = true;
    // nhặt bộ phận bằng một lần chạm (không tính khi kéo xoay)
    let down = null;
    cv.addEventListener('pointerdown', e => {
      down = { x: e.clientX, y: e.clientY, t: performance.now() };
      if (!st) return;
      const hit = pick(e, st.drags.map(d => d.obj));
      if (hit) {
        const d = st.drags.find(dd => isUnder(hit.object, dd.obj));
        if (d) { st.dragging = d; st.controls.enabled = false; cv.setPointerCapture(e.pointerId); d.start && d.start(hit.point); e.preventDefault(); }
      }
    });
    cv.addEventListener('pointermove', e => {
      if (!st || !st.dragging) return;
      const d = st.dragging, p = planePoint(e, d);
      if (p) d.move(p);
    });
    cv.addEventListener('pointerup', e => {
      if (st && st.dragging) { const d = st.dragging; st.dragging = null; st.controls.enabled = true; d.end && d.end(); down = null; return; }
      if (!down || !st) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t;
      down = null;
      if (moved > 7 || dt > 600) return;
      const hit = pick(e);
      if (st.pickHandler && st.pickHandler(hit, e)) return;
      let o = hit && hit.object;
      while (o && !(o.userData && o.userData.part)) o = o.parent;
      if (o) select(o); else deselect();
    });
    cv.addEventListener('wheel', e => {
      if (!st || !st.levels) return;
      const dist = st.camera.position.distanceTo(st.controls.target);
      if (e.deltaY < 0 && dist <= st.controls.minDistance * 1.02) levelStep(1);
      else if (e.deltaY > 0 && dist >= st.controls.maxDistance * 0.98) levelStep(-1);
    }, { passive: true });
  }
  function isUnder(o, top) { while (o) { if (o === top) return true; o = o.parent; } return false; }
  const ray = () => st.ray || (st.ray = new T.Raycaster());
  function ndc(e) { const r = cv.getBoundingClientRect(); return new T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); }
  function pick(e, list) {
    const rc = ray(); rc.setFromCamera(ndc(e), st.camera);
    const hits = rc.intersectObjects(list || [st.root], true).filter(h => {
      let o = h.object; if (h.object.userData.noPick) return false;
      while (o) { if (!o.visible) return false; o = o.parent; }
      const m = h.object.material; return !(m && m.opacity !== undefined && m.opacity < 0.06 && !h.object.userData.part);
    });
    // bỏ qua lớp vỏ gần như trong suốt (màng, thành) nếu phía sau còn bộ phận đặc hơn
    const solid = hits.find(h => { const m = h.object.material; return !m || m.opacity === undefined || m.opacity >= 0.5 || h.object.isInstancedMesh; });
    return solid || hits[0] || null;
  }
  function planePoint(e, d) {
    const rc = ray(); rc.setFromCamera(ndc(e), st.camera);
    const n = d.normal ? d.normal.clone() : st.camera.getWorldDirection(new T.Vector3()).negate();
    const o = d.obj.getWorldPosition(new T.Vector3());
    const plane = new T.Plane().setFromNormalAndCoplanarPoint(n, d.anchor || o);
    const p = new T.Vector3(); return rc.ray.intersectPlane(plane, p) ? p : null;
  }

  function resize() {
    if (!R || !st) return;
    const w = root.clientWidth, h = root.clientHeight;
    R.setSize(w, h, false);
    st.camera.aspect = w / h; st.camera.updateProjectionMatrix();
    if (st.strip) { const c = ui.stripCv, r = c.getBoundingClientRect(); c.width = r.width * 2; c.height = r.height * 2; }
  }
  function setBg() {
    if (!st) return;
    const dark = root.classList.contains('dark');
    st.scene.background = new T.Color(dark ? 0x0F1B2B : 0xEAF3FA);
    if (st.split) st.split.scene.background = st.scene.background;
  }

  // ---------- mở / đóng ----------
  let opening = false;
  function open(id) {
    const def = DEFS[id]; if (!def || opening) return;
    if (!root) buildUI();
    root.classList.remove('hidden'); ui.load.style.display = 'grid';
    opening = true;
    loadThree().then(() => {
      opening = false;
      if (!R) initGL();
      start(id, def);
      ui.load.style.display = 'none';
    }).catch(e => { console.error(e); opening = false; ui.load.textContent = 'Không tải được thư viện 3D. Em thử tải lại trang nhé'; });
  }

  function start(id, def) {
    const meta = NL.MODELS.find(m => m.id === id) || {};
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(45, 1, 0.05, 2000);
    const controls = new T.OrbitControls(camera, cv);
    controls.enableDamping = true; controls.dampingFactor = 0.09; controls.screenSpacePanning = true;
    controls.minDistance = 2; controls.maxDistance = 60;
    scene.add(new T.HemisphereLight(0xFFFFFF, 0x3A4A66, 0.9));
    const sun = new T.DirectionalLight(0xFFFFFF, 1.6); sun.position.set(6, 10, 8); scene.add(sun);
    const fill = new T.DirectionalLight(0xBFDFFF, 0.6); fill.position.set(-8, -2, -6); scene.add(fill);
    st = { id, def, meta, scene, camera, controls, frames: [], parts: [], drags: [], labels: [], warned: {}, sel: null, tab: null, home: null, clip: null };
    ui.title.textContent = def.title || meta.name; ui.no.textContent = 'Mô hình ' + (meta.no || '');
    root.classList.toggle('dark', true); root.classList.toggle('light', false);
    root.classList.remove('side-off');
    setBg(); resize();
    const tabs = def.tabs || [{ t: def.title, v: 'main' }];
    ui.tabs.innerHTML = tabs.length > 1 ? tabs.map((t, k) => `<button class="m3d-tab pop" data-i="${k}">${t.t}</button>`).join('') : '';
    ui.tabs.querySelectorAll('.m3d-tab').forEach(b => b.addEventListener('click', () => { NL.audio.play('pop'); setTab(tabs[+b.dataset.i].v); }));
    def.init && def.init(api);
    setTab(tabs[0].v);
    ui.hint.classList.remove('gone'); clearTimeout(st.hintT); st.hintT = setTimeout(() => ui.hint.classList.add('gone'), 6000);
    lastT = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }

  function clearTab() {
    deselect();
    st.frames = []; st.drags = []; st.pickHandler = null; st.levels = null; st.dataFn = null; st.caption = '';
    st.labels.forEach(l => l.el.remove()); st.labels = [];
    st.parts = [];
    if (st.root) { st.scene.remove(st.root); disposeTree(st.root); }
    st.root = new T.Group(); st.scene.add(st.root);
    if (st.split) { st.split = null; }
    ui.side.innerHTML = ''; ui.info.classList.add('hidden');
    stripOff(); clip(null);
    st.controls.enabled = true; st.controls.autoRotate = false;
    root.querySelectorAll('.m3d-pop,.m3d-ov').forEach(p => p.remove());
  }
  function setTab(v) {
    clearTab();
    st.tab = v;
    ui.tabs.querySelectorAll('.m3d-tab').forEach((b, k) => b.classList.toggle('on', (st.def.tabs || [])[k] && st.def.tabs[k].v === v));
    st.def.build(api, v);
    if (!st.home) view({ pos: [0, 2, 12], target: [0, 0, 0] });
    homeView(true);
  }
  function close() {
    if (!st) return;
    cancelAnimationFrame(raf);
    st.def.destroy && st.def.destroy(api);
    clearTab();
    st.controls.dispose();
    st = null;
    root.classList.add('hidden');
    closeData();
  }
  function disposeTree(o) {
    o.traverse(c => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
    });
  }

  // ---------- vòng vẽ ----------
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (!st) return;
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    st.time = (st.time || 0) + dt;
    if (st.fly) {
      const f = st.fly; f.k = Math.min(1, f.k + dt / f.dur); const e = 1 - Math.pow(1 - f.k, 3);
      st.camera.position.lerpVectors(f.p0, f.p1, e); st.controls.target.lerpVectors(f.t0, f.t1, e);
      if (f.k >= 1) st.fly = null;
    }
    st.frames.forEach(fn => fn(dt, st.time));
    if (st.sel && st.sel.outline) { const k = 0.55 + 0.45 * Math.sin(st.time * 6); st.sel.outline.forEach(m => { m.material.opacity = 0.35 + 0.5 * k; }); }
    st.controls.update();
    const w = root.clientWidth, h = root.clientHeight;
    if (st.split) {
      R.setScissorTest(true);
      const hw = Math.floor(w / 2);
      st.camera.aspect = hw / h; st.camera.updateProjectionMatrix();
      R.setViewport(0, 0, hw, h); R.setScissor(0, 0, hw, h); R.render(st.scene, st.camera);
      R.setViewport(hw, 0, w - hw, h); R.setScissor(hw, 0, w - hw, h); R.render(st.split.scene, st.camera);
      R.setScissorTest(false);
    } else {
      if (Math.abs(st.camera.aspect - w / h) > 0.001) { st.camera.aspect = w / h; st.camera.updateProjectionMatrix(); }
      R.setViewport(0, 0, w, h); R.render(st.scene, st.camera);
    }
    updateLabels(w, h);
    if (st.strip && st.strip.draw) { const c = ui.stripCv, x = c.getContext('2d'); st.strip.draw(x, c.width, c.height, st.time, dt); }
  }

  // ---------- nhãn chữ bám theo vật 3D ----------
  const _v = () => st._v || (st._v = new T.Vector3());
  function updateLabels(w, h) {
    const split = !!st.split;
    st.labels.forEach(l => {
      let vis = l.on;
      if (vis && l.obj) { let o = l.obj; while (o) { if (!o.visible) { vis = false; break; } o = o.parent; } }
      if (!vis) { l.el.style.display = 'none'; return; }
      const p = _v();
      if (l.obj) { l.obj.getWorldPosition(p); if (l.off) p.add(l.off); } else p.copy(l.pos);
      p.project(st.camera);
      if (p.z > 1) { l.el.style.display = 'none'; return; }
      const W = split ? w / 2 : w, x0 = split && l.right ? w / 2 : 0;
      l.el.style.display = '';
      l.el.style.transform = `translate(${x0 + (p.x * 0.5 + 0.5) * W}px, ${(-p.y * 0.5 + 0.5) * h}px) translate(-50%, -50%)`;
    });
  }
  function label(text, target, o = {}) {
    const el = document.createElement('div'); el.className = 'm3d-lab ' + (o.cls || ''); el.innerHTML = text;
    if (o.color) el.style.setProperty('--c', o.color);
    ui.labels.appendChild(el);
    const l = { el, on: true, right: o.right };
    if (Array.isArray(target) && o.parent) { const d0 = new T.Object3D(); d0.position.set(...target); o.parent.add(d0); target = d0; }
    if (target && target.isObject3D) { l.obj = target; if (o.off) l.off = new T.Vector3(...o.off); } else l.pos = new T.Vector3(...(target || [0, 0, 0]));
    l.set = t => { el.innerHTML = t; return l; };
    l.show = v => { l.on = v; return l; };
    l.remove = () => { el.remove(); st.labels = st.labels.filter(x => x !== l); };
    st.labels.push(l);
    return l;
  }

  // ---------- camera ----------
  function view(v) { st.home = { pos: new T.Vector3(...v.pos), target: new T.Vector3(...(v.target || [0, 0, 0])) }; if (v.min) st.controls.minDistance = v.min; if (v.max) st.controls.maxDistance = v.max; }
  function homeView(instant) {
    if (!st.home) return;
    if (instant) { st.camera.position.copy(st.home.pos); st.controls.target.copy(st.home.target); st.fly = null; st.controls.update(); return; }
    flyTo(st.home.pos, st.home.target);
  }
  function flyTo(pos, target, dur) {
    st.fly = { p0: st.camera.position.clone(), p1: pos.clone(), t0: st.controls.target.clone(), t1: target.clone(), k: 0, dur: dur || 0.7 };
  }
  function focusObj(obj, k) {
    const box = new T.Box3().setFromObject(obj), c = box.getCenter(new T.Vector3()), r = Math.max(0.3, box.getSize(new T.Vector3()).length() / 2);
    const dir = st.camera.position.clone().sub(st.controls.target).normalize();
    const d = Math.max(st.controls.minDistance * 1.05, r * (k || 2.8));
    flyTo(c.clone().add(dir.multiplyScalar(d)), c);
  }

  // ---------- vật liệu, bộ phận, chọn ----------
  function mat(color, o = {}) {
    const m = new T.MeshStandardMaterial(Object.assign({ color, roughness: 0.55, metalness: 0.04, transparent: true, opacity: 1 }, o));
    if (st && st.clip) m.clippingPlanes = [st.clip];
    return m;
  }
  function mesh(geo, m, pos, parent) {
    const me = new T.Mesh(geo, (m && m.isMaterial) ? m : mat(m));
    if (pos) me.position.set(pos[0], pos[1], pos[2]);
    (parent || st.root).add(me);
    return me;
  }
  // info: { name, sci, rows: [[nhãn, nội dung]], text, focus: false để không bay tới }
  function part(obj, info) {
    obj.userData.part = info;
    obj.traverse(c => {
      if (!c.material || c.userData.noPick) return;
      if (c.material.userData.owner && c.material.userData.owner !== info) c.material = c.material.clone();
      c.material.userData.owner = info;
    });
    st.parts.push(obj);
    return obj;
  }
  function meshesOf(o, out = []) { o.traverse(c => { if (c.isMesh && !c.userData.isOutline) out.push(c); }); return out; }
  function select(obj, opt = {}) {
    deselect(true);
    const info = obj.userData.part;
    const own = new Set(meshesOf(obj));
    const saved = [];
    meshesOf(st.root).forEach(m => {
      const ms = Array.isArray(m.material) ? m.material : [m.material];
      ms.forEach(mt => {
        if (!mt || mt.userData.sv) return;
        mt.userData.sv = { op: mt.opacity, tr: mt.transparent, dw: mt.depthWrite, em: mt.emissive ? mt.emissive.getHex() : null, ei: mt.emissiveIntensity };
        saved.push(mt);
        if (own.has(m)) { if (mt.emissive) { mt.emissive.setHex(0x33FFE6); mt.emissiveIntensity = 0.45; } }
        else { mt.transparent = true; mt.opacity = mt.userData.sv.op * 0.2; mt.depthWrite = false; }
      });
    });
    const outline = [];
    [...own].slice(0, 50).forEach(m => {
      if (m.isInstancedMesh || !m.geometry) return;
      const om = new T.Mesh(m.geometry, new T.MeshBasicMaterial({ color: 0x3DFFF0, side: T.BackSide, transparent: true, opacity: 0.7, depthWrite: false }));
      om.scale.setScalar(1.08); om.userData.isOutline = om.userData.noPick = true; m.add(om); outline.push(om);
    });
    st.sel = { obj, saved, outline };
    showInfo(info);
    NL.audio.beep(1320, 0.25, 'sine', 0.15); NL.audio.beep(1980, 0.3, 'sine', 0.08, 0.06);
    if (info.focus !== false && !opt.noFly) focusObj(obj, info.zoom);
    info.onSelect && info.onSelect(obj);
  }
  function deselect(keepInfo) {
    if (!st || !st.sel) { if (!keepInfo && ui) ui.info.classList.add('hidden'); return; }
    st.sel.saved.forEach(mt => { const s = mt.userData.sv; mt.opacity = s.op; mt.transparent = s.tr; mt.depthWrite = s.dw; if (s.em !== null && mt.emissive) { mt.emissive.setHex(s.em); mt.emissiveIntensity = s.ei; } delete mt.userData.sv; });
    st.sel.outline.forEach(o => { o.parent && o.parent.remove(o); o.material.dispose(); });
    st.sel = null;
    if (!keepInfo) ui.info.classList.add('hidden');
  }
  function showInfo(info) {
    const rows = (info.rows || []).map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('');
    ui.info.innerHTML = `<button class="m3d-x">✕</button><div class="m3d-iname">${info.name}</div>${info.sci && /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(info.sci) ? `<div class="m3d-isci">${info.sci}</div>` : ''}${rows ? `<table>${rows}</table>` : ''}${info.text ? `<p>${info.text}</p>` : ''}`;
    ui.info.classList.remove('hidden'); ui.info.scrollTop = 0;
    ui.info.querySelector('.m3d-x').onclick = () => { NL.audio.play('click'); deselect(); };
    st.caption = info.name;
  }
  // gắn nhóm cho vật để ẩn/hiện bằng hộp kiểm
  function tag(obj, key) { obj.userData.group = key; return obj; }
  function groupVis(key, on) { st.root.traverse(o => { if (o.userData.group === key) o.visible = on; }); if (st.split) st.split.scene.traverse(o => { if (o.userData.group === key) o.visible = on; }); }
  // đặt độ trong suốt cho mọi vật liệu của một vật
  function setOpacity(obj, op) {
    obj.traverse(c => { if (c.material && !c.userData.isOutline) (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => { const v = op * (m.userData.base == null ? (m.userData.base = m.opacity) : m.userData.base); if (m.userData.sv) m.userData.sv.op = v; else m.opacity = v; m.transparent = true; m.depthWrite = op > 0.95; }); });
  }

  // ---------- bảng điều khiển bên phải ----------
  function ctl(html, cls) { const d = document.createElement('div'); d.className = 'm3d-ctl ' + (cls || ''); d.innerHTML = html; ui.side.appendChild(d); return d; }
  function section(t) { return ctl(t, 'm3d-sec'); }
  function note(html) { const d = ctl(html, 'm3d-note'); return { el: d, set(h) { d.innerHTML = h; } }; }
  function slider(o) {
    const sp = o.step || 1;
    const d = ctl(`<div class="m3d-row"><span>${o.label}</span><b><input class="m3d-num" type="number" min="${o.min}" max="${o.max}" step="${sp}" value="${o.value}"> ${o.unit || ''}</b></div><input type="range" min="${o.min}" max="${o.max}" step="${sp}" value="${o.value}">`);
    const r = d.querySelector('input[type=range]'), n = d.querySelector('.m3d-num');
    const c = {
      el: d, get value() { return +r.value; },
      set(v, silent) { v = Math.max(o.min, Math.min(o.max, +(Math.round(+v / sp) * sp).toFixed(4))); r.value = v; n.value = v; if (!silent) o.onInput && o.onInput(v, c); }
    };
    r.addEventListener('input', () => c.set(r.value)); n.addEventListener('change', () => c.set(n.value));
    if (o.onInput && !o.lazy) o.onInput(+o.value, c);
    return c;
  }
  function toggle(o) {
    const d = ctl(`<label class="m3d-tg"><input type="checkbox" ${o.value ? 'checked' : ''}><i></i><span>${o.label}</span></label>`);
    const i = d.querySelector('input');
    const c = { el: d, get value() { return i.checked; }, set(v, silent) { i.checked = v; if (!silent) o.onChange && o.onChange(v, c); } };
    i.addEventListener('change', () => { NL.audio.play('click'); o.onChange && o.onChange(i.checked, c); });
    return c;
  }
  function choices(o) {
    const d = ctl(`${o.label ? `<div class="m3d-cl">${o.label}</div>` : ''}<div class="m3d-seg">${o.items.map((it, k) => `<button class="pop" data-i="${k}">${it.t}</button>`).join('')}</div>`);
    const bs = [...d.querySelectorAll('button')];
    const c = {
      el: d, value: o.value,
      set(v, silent) { c.value = v; bs.forEach((b, k) => b.classList.toggle('on', o.items[k].v === v)); if (!silent) o.onPick && o.onPick(v, c); }
    };
    bs.forEach((b, k) => b.addEventListener('click', () => { NL.audio.play('click'); c.set(o.items[k].v); }));
    c.set(o.value, true);
    return c;
  }
  function button(label, fn, cls) { const d = ctl(`<button class="btn small pop ${cls || ''}">${label}</button>`, 'm3d-btnrow'); const b = d.querySelector('button'); b.onclick = () => { NL.audio.play('click'); fn(b); }; return b; }
  // hộp kiểm ẩn/hiện. items: [{ k, label, on, off: true nếu khóa (ví dụ không có ở tế bào động vật) }]
  function checklist(items, onChange) {
    const d = ctl(`<div class="m3d-cl">👁 Ẩn / hiện</div>` + items.map((it, k) => `<label class="m3d-ck ${it.dis ? 'dis' : ''}"><input type="checkbox" data-i="${k}" ${it.on !== false ? 'checked' : ''}><span>${it.label}</span></label>`).join(''));
    d.querySelectorAll('input').forEach(inp => inp.addEventListener('change', () => {
      const it = items[+inp.dataset.i];
      if (it.dis) { inp.checked = false; it.onDis && it.onDis(); return; }
      NL.audio.play('click');
      if (onChange) onChange(it.k, inp.checked); else groupVis(it.k, inp.checked);
    }));
    items.forEach(it => { if (it.on === false && !onChange) groupVis(it.k, false); });
    return d;
  }

  // ---------- thông báo sư phạm ----------
  function warn(key, text, kicker) {
    if (key && st.warned[key]) return;
    if (key) st.warned[key] = 1;
    NL.audio.beep(520, 0.18, 'square', 0.06); NL.audio.beep(390, 0.25, 'square', 0.06, 0.15);
    const p = document.createElement('div'); p.className = 'm3d-pop';
    p.innerHTML = `<div class="m3d-popbox"><div class="m3d-popk">${kicker || '⚠️ Cảnh báo khoa học'}</div><div>${text}</div><button class="btn small pop">Đã hiểu</button></div>`;
    root.appendChild(p);
    p.querySelector('button').onclick = () => { NL.audio.play('click'); p.remove(); };
  }
  function toast(text) {
    let t = root.querySelector('.m3d-toast');
    if (!t) { t = document.createElement('div'); t.className = 'm3d-toast'; root.appendChild(t); }
    t.textContent = text; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2400);
  }

  // ---------- dải dưới màn hình (điện tâm đồ, đồ thị chạy) ----------
  function strip(o) {
    st.strip = o; ui.strip.classList.remove('hidden'); ui.strip.style.height = (o.h || 110) + 'px'; root.style.setProperty('--sh', (o.h || 110) + 'px');
    root.classList.add('has-strip');
    requestAnimationFrame(resize);
  }
  function stripOff() { if (st) st.strip = null; ui.strip.classList.add('hidden'); root.classList.remove('has-strip'); }

  // ---------- mặt cắt ----------
  function clip(plane) {
    st.clip = plane;
    st.root && st.root.traverse(c => { if (c.material && !c.userData.noClip) (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => { m.clippingPlanes = plane ? [plane] : null; m.clipShadows = true; m.needsUpdate = true; }); });
  }

  // ---------- cấp độ phóng đại (cuộn sâu thì sang cấp kế tiếp) ----------
  function levels(list, cur, onChange) {
    const d = ctl(`<div class="m3d-cl">🔎 Cấp độ quan sát</div><div class="m3d-lv">${list.map((l, k) => `<button class="pop" data-i="${k}">${k + 1}. ${l}</button>`).join('')}</div><div class="m3d-sub">Cuộn sát vào để xuống cấp nhỏ hơn, cuộn ra để quay lên</div>`);
    const bs = [...d.querySelectorAll('button')];
    st.levels = { list, cur, onChange, bs, lock: 0 };
    bs.forEach((b, k) => { b.classList.toggle('on', k === cur); b.onclick = () => { NL.audio.play('pop'); onChange(k); }; });
  }
  function levelStep(dir) {
    const L = st.levels, now = performance.now();
    if (!L || now - L.lock < 900) return;
    const n = L.cur + dir; if (n < 0 || n >= L.list.length) return;
    L.lock = now; NL.audio.beep(dir > 0 ? 660 : 440, 0.2, 'sine', 0.12); NL.audio.beep(dir > 0 ? 990 : 330, 0.25, 'sine', 0.08, 0.08);
    root.classList.add('m3d-zoomfx'); setTimeout(() => root.classList.remove('m3d-zoomfx'), 450);
    L.onChange(n);
  }

  // ---------- chia đôi màn hình ----------
  function splitScene() {
    const sc = new T.Scene();
    sc.add(new T.HemisphereLight(0xFFFFFF, 0x3A4A66, 0.9));
    const s1 = new T.DirectionalLight(0xFFFFFF, 1.6); s1.position.set(6, 10, 8); sc.add(s1);
    st.split = { scene: sc }; setBg();
    return sc;
  }
  function unsplit() { if (st.split) { disposeTree(st.split.scene); st.split = null; } }

  // ---------- kéo thả vật trong không gian ----------
  // o: { start(p), move(p), end(), normal: Vector3 (mặt phẳng kéo), anchor }
  function draggable(obj, o) { const d = Object.assign({ obj }, o); st.drags.push(d); return d; }

  // ---------- bảng số liệu ----------
  let dataBox = null, dataTimer = 0;
  function openData() {
    if (!st) return;
    const fn = st.dataFn || (st.def.data && (() => st.def.data(api)));
    if (!fn) { toast('Mô hình này chưa có số liệu ở chế độ đang xem'); return; }
    closeData();
    dataBox = document.createElement('div'); dataBox.className = 'm3d-data';
    root.appendChild(dataBox);
    const draw = () => {
      if (!st) return closeData();
      const d = fn();
      const t = d.table, sheets = d.sheets || [{ name: 'Số liệu', head: t.head, rows: t.rows }];
      const tableHtml = sheets.map(sh => `${sheets.length > 1 ? `<div class="m3d-sh">${sh.name}</div>` : ''}<div class="m3d-tw"><table><tr>${sh.head.map(h => `<th>${h}</th>`).join('')}</tr>${sh.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>`).join('');
      const chart = d.chart ? (d.chart.svg || NL.chartSVG(d.chart, 640, 300).replace(/<animate[^>]*\/>/g, '')) : '';
      dataBox.innerHTML = `<div class="m3d-dbox"><button class="icon-btn pop m3d-dx">✕</button><h3>${d.title}</h3>${d.sub ? `<div class="m3d-sub">${d.sub}</div>` : ''}<div class="m3d-dgrid">${chart ? `<div class="m3d-chart">${chart}</div>` : ''}<div>${tableHtml}</div></div>
        <div class="rep-dl"><button class="btn small pop" data-x="xlsx">📥 Tải file Excel</button>${d.chart ? '<button class="btn small pop" data-x="jpg">🖼 Lưu ảnh biểu đồ</button>' : ''}</div></div>`;
      dataBox.querySelector('.m3d-dx').onclick = () => { NL.audio.play('click'); closeData(); };
      const res = { title: d.title, sheets, chart: d.chart, table: { head: sheets[0].head, rows: sheets[0].rows } };
      dataBox.querySelector('[data-x=xlsx]').onclick = () => { NL.audio.play('click'); NL.exportData.xlsx(res); };
      const j = dataBox.querySelector('[data-x=jpg]'); if (j) j.onclick = () => { NL.audio.play('click'); chartJpg(res); };
    };
    draw();
    if (st.def.liveData) dataTimer = setInterval(() => { if (dataBox && !dataBox.matches(':hover')) draw(); }, 1000);
  }
  function closeData() { clearInterval(dataTimer); if (dataBox) { dataBox.remove(); dataBox = null; } }
  function chartJpg(res) { NL.exportData.svgJpg(res.chart.svg || NL.chartSVG(res.chart, 900, 440), res); }

  // ---------- lưu ảnh mô hình ----------
  function screenshot() {
    if (!st) return;
    R.render(st.scene, st.camera);
    const w = cv.width, h = cv.height, s = w / root.clientWidth;
    const c = document.createElement('canvas'); c.width = w; c.height = h + 90 * s;
    const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    x.drawImage(cv, 0, 0);
    // nhãn đang hiện
    x.textAlign = 'center'; x.textBaseline = 'middle';
    st.labels.forEach(l => {
      if (l.el.style.display === 'none') return;
      const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(l.el.style.transform); if (!m) return;
      const t = l.el.textContent; x.font = `800 ${13 * s}px 'Baloo 2', sans-serif`;
      const tw = x.measureText(t).width + 14 * s;
      x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.roundRect ? x.roundRect(+m[1] * s - tw / 2, +m[2] * s - 11 * s, tw, 22 * s, 11 * s) : x.rect(+m[1] * s - tw / 2, +m[2] * s - 11 * s, tw, 22 * s); x.fill();
      x.fillStyle = '#1F4E79'; x.fillText(t, +m[1] * s, +m[2] * s);
    });
    x.textAlign = 'left';
    x.fillStyle = '#1F4E79'; x.font = `800 ${24 * s}px 'Baloo 2', sans-serif`;
    x.fillText(`Mô hình ${st.meta.no}: ${st.def.title || st.meta.name}`, 20 * s, h + 32 * s);
    x.fillStyle = '#2F80C0'; x.font = `700 ${17 * s}px 'Baloo 2', sans-serif`;
    const cap = [st.sel ? 'Đang chọn: ' + st.sel.obj.userData.part.name : '', st.caption && !st.sel ? st.caption : '', st.extraCaption || ''].filter(Boolean).join(' · ');
    x.fillText(cap || 'Nhà Láp · Phòng mô hình 3D', 20 * s, h + 64 * s);
    c.toBlob(b => NL.exportData.save(b, NL.exportData.fileName({ title: 'Mo hinh ' + st.meta.no + ' ' + (st.def.title || '') }, 'jpg')), 'image/jpeg', 0.93);
    toast('Đã lưu ảnh mô hình 🖼');
  }

  // ---------- 10 câu kiểm tra ----------
  function runQuiz() {
    if (!st) return;
    const qs = (NL.QUIZ && NL.QUIZ[st.id]) || [];
    if (!qs.length) { toast('Chưa có câu hỏi'); return; }
    const list = NL.learn.bank(st.id, qs.length);
    let k = 0, right = 0;
    const next = () => {
      if (k >= list.length) {
        const g = NL.game; if (g) { g.models = g.models || {}; const best = Math.max(right, (g.models[st.id] || {}).score || 0); g.models[st.id] = { score: best, total: list.length }; NL.persist && NL.persist(); }
        NL.audio.play(right >= 8 ? 'success' : 'ting');
        NL.learn.card({ parent: root, kicker: '🏁 Kết quả kiểm tra', text: `Em đúng ngay lần đầu ${right}/${list.length} câu`, sub: right >= 8 ? 'Xuất sắc! Em nắm rất chắc mô hình này' : right >= 5 ? 'Khá lắm! Xem lại mô hình ở những phần em còn lúng túng nhé' : 'Em xoay, chạm vào từng bộ phận để xem thẻ thông tin rồi làm lại nhé', btn: 'Đóng' });
        return;
      }
      const q = list[k]; q.parent = root; q.kicker = `📝 Câu ${k + 1}/${list.length}`;
      NL.learn.ask(q, r => { if (r.firstTry) right++; k++; next(); });
    };
    next();
  }

  const api = {
    get T() { return T; }, get scene() { return st.scene; }, get camera() { return st.camera; }, get controls() { return st.controls; },
    get root() { return st.root; }, get tab() { return st.tab; }, get time() { return st.time; }, get sel() { return st.sel; },
    get renderer() { return R; }, get el() { return root; },
    mat, mesh, part, tag, groupVis, setOpacity, select, deselect, focusObj, flyTo, view, homeView,
    label, section, note, slider, toggle, choices, button, checklist, warn, toast, strip, stripOff, clip, levels,
    splitScene, unsplit, draggable,
    onFrame(fn) { st.frames.push(fn); return fn; },
    // khung HTML riêng của từng chế độ (tự xóa khi đổi tab)
    overlay(html, cls) { const d = document.createElement('div'); d.className = 'm3d-ov ' + (cls || ''); d.innerHTML = html; root.appendChild(d); return d; },
    offFrame(fn) { st.frames = st.frames.filter(f => f !== fn); },
    onPick(fn) { st.pickHandler = fn; },
    data(fn) { st.dataFn = fn; },
    caption(t) { st.extraCaption = t; },
    setTab, info: showInfo,
    beep: (...a) => NL.audio.beep(...a), noise: (...a) => NL.audio.noise(...a),
    // tiện ích dựng hình
    V: (x, y, z) => new T.Vector3(x, y, z),
    tube(points, r, color, parent, seg) {
      const curve = new T.CatmullRomCurve3(points.map(p => p.isVector3 ? p : new T.Vector3(...p)));
      return mesh(new T.TubeGeometry(curve, seg || Math.max(20, points.length * 12), r, 12, false), color, null, parent);
    },
    sphere(r, color, pos, parent, seg) { return mesh(new T.SphereGeometry(r, seg || 24, Math.max(8, (seg || 24) * 0.66 | 0)), color, pos, parent); },
    box(w, h, d, color, pos, parent) { return mesh(new T.BoxGeometry(w, h, d), color, pos, parent); },
    cyl(rt, rb, h, color, pos, parent, seg) { return mesh(new T.CylinderGeometry(rt, rb, h, seg || 24), color, pos, parent); },
    group(parent, pos) { const g = new T.Group(); if (pos) g.position.set(...pos); (parent || st.root).add(g); return g; },
    lineBetween(a, b, r, color, parent) {
      const A = a.isVector3 ? a : new T.Vector3(...a), B = b.isVector3 ? b : new T.Vector3(...b);
      const len = A.distanceTo(B), m = mesh(new T.CylinderGeometry(r, r, len, 8), color, null, parent);
      m.position.copy(A).add(B).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), B.clone().sub(A).normalize());
      return m;
    },
    // bảng chữ viết lên mặt phẳng (dùng canvas)
    textSprite(text, o = {}) {
      const c = document.createElement('canvas'), x = c.getContext('2d'), fs = o.size || 64;
      x.font = `800 ${fs}px 'Baloo 2', sans-serif`; const w = Math.ceil(x.measureText(text).width) + fs;
      c.width = w; c.height = fs * 1.6;
      x.font = `800 ${fs}px 'Baloo 2', sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
      if (o.bg) { x.fillStyle = o.bg; x.beginPath(); x.roundRect ? x.roundRect(0, 0, w, c.height, c.height / 2) : x.rect(0, 0, w, c.height); x.fill(); }
      x.fillStyle = o.color || '#fff'; x.fillText(text, w / 2, c.height / 2);
      const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
      const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthTest: o.depthTest !== false }));
      const h = o.h || 0.5; sp.scale.set(h * w / c.height, h, 1); sp.userData.noPick = true;
      if (o.pos) sp.position.set(...o.pos);
      (o.parent || st.root).add(sp);
      return sp;
    },
    rand(seed) { let s = seed || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
  };

  return { register, open, close, get isOpen() { return !!st || opening; }, api, DEFS };
})();
