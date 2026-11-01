// Mô hình Lí 6: thấu kính hội tụ và phân kì (ba tia đặc biệt, 1/f = 1/d + 1/d', hứng ảnh trên màn) và mắt cận, mắt viễn cùng kính sửa.
(function () {
  const vn = (v, d) => (+v).toFixed(d).replace('.', ',');
  const SC = 0.12, H = 1.6, XMAX = 10.5, XMIN = -8.6; // 1 cm = 0,12 đơn vị; vật cao 1,6
  let s = null;

  function lensGeo(T, R, conv) {
    const pts = [], n = 16, t = r => conv ? 0.06 + 0.5 * (1 - (r / R) ** 2) : 0.06 + 0.4 * (r / R) ** 2;
    for (let k = 0; k <= n; k++) { const r = R * k / n; pts.push(new T.Vector2(r, t(r) / 2)); }
    for (let k = n; k >= 0; k--) { const r = R * k / n; pts.push(new T.Vector2(r, -t(r) / 2)); }
    const g = new T.LatheGeometry(pts, 48); g.rotateZ(Math.PI / 2); return g;
  }
  function arrowObj(api, col, opts = {}) {
    const T = api.T, g = api.group(), m = api.mat(col, Object.assign({ emissive: col, emissiveIntensity: 0.35 }, opts));
    const sh = api.cyl(0.07, 0.07, 1, m, [0, 0.5, 0], g), hd = api.mesh(new T.ConeGeometry(0.22, 0.45, 12), m, [0, 1, 0], g);
    g.userData.set = (x, h) => { g.position.set(x, 0, 0); const a = Math.abs(h); sh.scale.y = Math.max(0.01, a - 0.4); sh.position.y = (a - 0.4) / 2; hd.position.y = a - 0.2; g.rotation.z = h < 0 ? Math.PI : 0; g.visible = a > 0.02; };
    return g;
  }
  function seg(api, a, b, col, parent, dashed) {
    const m = api.mat(col, { emissive: col, emissiveIntensity: 0.9, opacity: dashed ? 0.55 : 0.95, depthWrite: false });
    if (!dashed) { api.lineBetween([a[0], a[1], 0], [b[0], b[1], 0], 0.025, m, parent).userData.noPick = true; return; }
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.floor(L / 0.32));
    for (let k = 0; k < n; k += 2) { const u0 = k / n, u1 = Math.min(1, (k + 1) / n); api.lineBetween([a[0] + (b[0] - a[0]) * u0, a[1] + (b[1] - a[1]) * u0, 0], [a[0] + (b[0] - a[0]) * u1, a[1] + (b[1] - a[1]) * u1, 0], 0.018, m, parent).userData.noPick = true; }
  }
  // kéo dài tia từ p theo hướng (dx, dy) tới biên x
  const toX = (p, dx, dy, X) => (Math.abs(dx) < 1e-9 ? [p[0], p[1]] : [X, p[1] + dy * (X - p[0]) / dx]);
  const clipY = (p, q, Y) => { if (Math.abs(q[1]) <= Y) return q; const u = (Math.sign(q[1]) * Y - p[1]) / (q[1] - p[1]); return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; };

  function lens(api) {
    const T = api.T;
    api.box(20, 0.25, 0.8, api.mat(0x475569, { metalness: 0.5 }), [1, -3.4, 0]).userData.noPick = true;
    api.lineBetween([XMIN, 0, 0], [XMAX, 0, 0], 0.012, api.mat(0x94A3B8, { opacity: 0.6 })).userData.noPick = true;
    const lm = api.mat(0x7DD3FC, { opacity: 0.35, roughness: 0.05, metalness: 0.1, depthWrite: false });
    let lensMesh = null;
    const obj = arrowObj(api, 0xF59E0B), img = arrowObj(api, 0x38BDF8);
    api.part(obj, { name: 'Vật sáng AB', rows: [['Đặt', 'Vuông góc với trục chính, A nằm trên trục'], ['Kéo thanh trượt', 'Đổi khoảng cách d từ vật tới thấu kính']] });
    api.part(img, { name: "Ảnh A'B'", rows: [['Ảnh thật', 'Nằm khác phía vật, ngược chiều, hứng được trên màn'], ['Ảnh ảo', 'Cùng phía vật, cùng chiều, không hứng được trên màn, chỉ nhìn thấy qua thấu kính']] });
    const fpt = [-1, 1].map(k => api.sphere(0.1, api.mat(0xE86A92, { emissive: 0xE86A92, emissiveIntensity: 0.6 }), [0, 0, 0]));
    const fl = [api.label('F', [0, 0, 0], { cls: 'plain', color: '#E86A92' }), api.label("F'", [0, 0, 0], { cls: 'plain', color: '#E86A92' })];
    const oL = api.label('O', [0.15, -0.35, 0], { cls: 'plain' }); void oL;
    const screen = api.group(); const scr = api.box(0.08, 5, 3, api.mat(0xF8FAFC, { roughness: 0.9 }), [0, 0, 0], screen);
    api.part(scr, { name: 'Màn chắn', rows: [['Dùng để', 'Hứng ảnh thật'], ['Ảnh rõ nét', 'Khi màn đặt đúng vị trí ảnh']] });
    const blob = api.mesh(new T.CircleGeometry(1, 32), api.mat(0x38BDF8, { emissive: 0x38BDF8, emissiveIntensity: 0.8, opacity: 0.5, depthWrite: false }), [-0.05, 0, 0], screen); blob.rotation.y = -Math.PI / 2; blob.userData.noPick = true;
    const sImg = arrowObj(api, 0x0EA5E9); screen.add(sImg); sImg.position.x = -0.06;
    let rays = null;
    const info = api.note(''), scrNote = api.note('');
    let wasSharp = false;
    const update = () => {
      const f = s.conv ? s.f : -s.f, d = s.d, near = Math.abs(d - f) < 0.6;
      if (lensMesh) api.root.remove(lensMesh);
      lensMesh = api.mesh(lensGeo(T, 2.6, s.conv), lm);
      api.part(lensMesh, { name: s.conv ? 'Thấu kính hội tụ (rìa mỏng)' : 'Thấu kính phân kì (rìa dày)', rows: [['Tiêu cự', `f = ${s.conv ? '' : '−'}${s.f} cm`], ['Tia qua quang tâm O', 'Truyền thẳng'], ['Tia song song trục chính', s.conv ? "Ló ra đi qua tiêu điểm ảnh F'" : "Ló ra có đường kéo dài đi qua tiêu điểm F'"]] });
      [-1, 1].forEach((k, i) => { const x = k * s.f * SC * (s.conv ? 1 : -1); fpt[i].position.set(x, 0, 0); fl[i].pos.set(x, -0.4, 0); });
      obj.userData.set(-d * SC, H);
      if (rays) api.root.remove(rays); rays = api.group();
      const P = [-d * SC, H];
      const dp = near ? Infinity : d * f / (d - f), k = near ? Infinity : -dp / d;
      const I = near ? null : [dp * SC, k * H], real = dp > 0 && isFinite(dp);
      if (I) img.userData.set(I[0], Math.max(-5, Math.min(5, I[1]))); else img.visible = false;
      img.children.forEach(c => { c.material.opacity = real ? 1 : 0.45; });
      const Y = 4.6, cols = [0xFDE047, 0x4ADE80, 0xF472B6];
      // tia 1: song song trục chính
      const L1 = [0, H];
      seg(api, P, L1, cols[0], rays);
      if (near) seg(api, L1, clipY(L1, toX(L1, f * SC, -H, XMAX), Y), cols[0], rays);
      else if (real) seg(api, L1, clipY(L1, toX(L1, I[0], I[1] - H, XMAX), Y), cols[0], rays);
      else { const dir = [-I[0], H - I[1]]; seg(api, L1, clipY(L1, toX(L1, dir[0], dir[1], XMAX), Y), cols[0], rays); seg(api, L1, clipY(L1, I, Y), cols[0], rays, true); }
      // tia 2: qua quang tâm
      seg(api, P, [0, 0], cols[1], rays); seg(api, [0, 0], clipY([0, 0], toX([0, 0], d * SC, -H, XMAX), Y), cols[1], rays);
      if (I && !real) seg(api, [0, 0], clipY([0, 0], I, Y), cols[1], rays, true);
      // tia 3: hướng tới tiêu điểm vật, ló song song
      if (!near && Math.abs(k * H) < Y) {
        const L3 = [0, k * H]; seg(api, P, L3, cols[2], rays); seg(api, L3, [XMAX, k * H], cols[2], rays);
        if (!real) seg(api, L3, I, cols[2], rays, true);
        if (!s.conv) seg(api, L3, [-f * SC, 0], cols[2], rays, true);
      }
      if (!s.conv) seg(api, L1, [f * SC, 0], cols[0], rays, true);
      // màn chắn
      screen.position.set(s.xs * SC, 0, 0);
      let sharp = false;
      if (real) {
        const blur = Math.abs(s.xs - dp) / dp * 2.6; sharp = blur < 0.08;
        blob.scale.setScalar(Math.max(0.05, Math.min(2.3, blur))); blob.material.opacity = sharp ? 0 : Math.min(0.7, 0.15 / Math.max(0.2, blur));
        sImg.visible = sharp; sImg.userData.set(-0.06, Math.max(-2.4, Math.min(2.4, k * H))); sImg.position.x = -0.06; sImg.visible = sharp;
      } else { blob.scale.setScalar(2.2); blob.material.opacity = 0.08; sImg.visible = false; }
      scrNote.set(sharp ? '✅ Ảnh rõ nét trên màn!' : real ? `Màn ở ${s.xs} cm sau thấu kính. Kéo màn tới chỗ ảnh rõ nét.` : 'Ảnh ảo: màn đặt ở đâu cũng chỉ thấy một vùng sáng mờ.');
      if (sharp && !wasSharp) { api.beep(880, 0.12, 'sine', 0.1); api.toast('✅ Hứng được ảnh rõ nét'); }
      wasSharp = sharp;
      const nature = near ? 'Vật ở tiêu điểm: chùm ló song song, ảnh ở rất xa (vô cực).' : real ? `<b>Ảnh thật, ngược chiều</b>, ${Math.abs(k) > 1.02 ? 'lớn hơn vật' : Math.abs(k) < 0.98 ? 'nhỏ hơn vật' : 'bằng vật'}` : `<b>Ảnh ảo, cùng chiều</b>, ${Math.abs(k) > 1.02 ? 'lớn hơn vật' : 'nhỏ hơn vật'}`;
      info.set(near ? nature : `1/f = 1/d + 1/d' → d' = d·f/(d − f) = ${d}·(${vn(f, 0)})/(${d} − (${vn(f, 0)})) = <b>${vn(dp, 1)} cm</b><br>Độ phóng đại k = −d'/d = <b>${vn(k, 2)}</b><br>${nature}`);
    };

    api.section('🔍 Thấu kính');
    api.choices({ label: 'Loại thấu kính', items: [{ t: 'Hội tụ', v: true }, { t: 'Phân kì', v: false }], value: s.conv, onPick(v) { s.conv = v; update(); } });
    api.slider({ label: 'Tiêu cự f', min: 5, max: 20, step: 1, value: s.f, unit: 'cm', lazy: true, onInput(v) { s.f = v; update(); } });
    api.slider({ label: 'Khoảng cách vật d', min: 2, max: 70, step: 1, value: s.d, unit: 'cm', lazy: true, onInput(v) { s.d = v; update(); } });
    api.slider({ label: 'Vị trí màn chắn', min: 5, max: 85, step: 1, value: s.xs, unit: 'cm', lazy: true, onInput(v) {
      s.xs = v; update();
      if (!s.conv) api.warn('div', 'Thấu kính phân kì <b>luôn</b> cho ảnh ảo, cùng chiều, nhỏ hơn vật. Ảnh ảo nằm cùng phía với vật nên không hứng được trên màn dù đặt màn ở đâu.', '🤔 Không hứng được ảnh');
      else if (s.d < s.f) api.warn('virt', 'Vật đang nằm <b>trong khoảng tiêu cự</b> (d < f) nên thấu kính hội tụ cho ảnh ảo, cùng chiều, lớn hơn vật. Ảnh ảo không hứng được trên màn, chỉ nhìn thấy khi đặt mắt sau thấu kính. Đó chính là cách dùng <b>kính lúp</b>.', '🤔 Không hứng được ảnh');
    } });
    api.note('Ba tia đặc biệt: <span style="color:#CA8A04">vàng</span> song song trục chính, <span style="color:#16A34A">xanh</span> qua quang tâm, <span style="color:#DB2777">hồng</span> qua tiêu điểm vật. Nét đứt là đường kéo dài, không phải tia sáng thật.');
    update();
    api.view({ pos: [1, 2, 15], target: [1, 0, 0], min: 4, max: 35 });
  }

  // ---------- mắt cận, mắt viễn ----------
  const FE = 4.4, EYES = { norm: { t: 'Mắt bình thường', L: 4.4 }, myo: { t: 'Mắt cận', L: 5.4 }, hyp: { t: 'Mắt viễn', L: 3.6 } };
  const GL = { none: { t: 'Không đeo', f: 0 }, div: { t: 'Kính phân kì', f: -22.8 }, conv: { t: 'Kính hội tụ', f: 20.8 } };
  function eyeCalc() {
    const L = EYES[s.eye].L, fg = GL[s.gl].f;
    if (!fg) return { L, fg, dp: FE };
    const d = 1 - fg; return { L, fg, dp: d * FE / (d - FE) };
  }
  function eye(api) {
    const T = api.T;
    let ball = null, glass = null, rays = null;
    const lensE = api.mesh(lensGeo(T, 1.5, true), api.mat(0xFDE68A, { opacity: 0.6, depthWrite: false }));
    api.part(lensE, { name: 'Thể thủy tinh', rows: [['Vai trò', 'Như một thấu kính hội tụ, hội tụ ánh sáng lên màng lưới'], ['Khi nhìn vật ở xa', 'Mắt không điều tiết, tiêu cự lớn nhất']] });
    const spot = api.mesh(new T.CircleGeometry(1, 32), api.mat(0xFDE047, { emissive: 0xFDE047, emissiveIntensity: 1, opacity: 0.8, depthWrite: false }), [0, 0, 0]); spot.rotation.y = -Math.PI / 2; spot.userData.noPick = true;
    const retL = api.label('Màng lưới', [0, 0, 0], { cls: 'plain', color: '#F87171' });
    const info = api.note('');
    let blurPx = 0;
    const update = () => {
      const r = eyeCalc();
      if (ball) api.root.remove(ball);
      ball = api.group();
      const sp = api.sphere(1, api.mat(0xF1F5F9, { opacity: 0.16, depthWrite: false }), [0, 0, 0], ball); sp.scale.set(r.L / 2 + 0.15, 2.3, 2.3); ball.position.x = r.L / 2 - 0.1;
      const ret = api.mesh(new T.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, 0.75), api.mat(0xF87171, { opacity: 0.6, side: T.DoubleSide, depthWrite: false }), [0, 0, 0], ball);
      ret.scale.set(2.3, r.L / 2 + 0.12, 2.3); ret.rotation.z = -Math.PI / 2; ret.userData.noPick = true;
      api.part(sp, { name: EYES[s.eye].t, rows: [['Khoảng cách thể thủy tinh – màng lưới', s.eye === 'norm' ? 'Vừa đúng tiêu cự: ảnh vật ở xa rơi đúng màng lưới' : s.eye === 'myo' ? 'Cầu mắt dài: ảnh vật ở xa rơi TRƯỚC màng lưới' : 'Cầu mắt ngắn: ảnh vật ở xa rơi SAU màng lưới'], ['Kính sửa', s.eye === 'myo' ? 'Thấu kính phân kì' : s.eye === 'hyp' ? 'Thấu kính hội tụ' : 'Không cần']] });
      retL.pos.set(r.L + 0.3, 2.1, 0);
      if (glass) api.root.remove(glass); glass = null;
      if (r.fg) { glass = api.mesh(lensGeo(T, 1.9, r.fg > 0), api.mat(0x7DD3FC, { opacity: 0.4, depthWrite: false }), [-1, 0, 0]); api.part(glass, { name: GL[s.gl].t, rows: [['Đặt', 'Sát trước mắt']] }); }
      if (rays) api.root.remove(rays); rays = api.group();
      const cols = [0xFDE047, 0xFACC15, 0xFDE047, 0xFACC15, 0xFDE047];
      let blurR = 0;
      [-1.1, -0.55, 0, 0.55, 1.1].forEach((y, k) => {
        let p = [-6.5, y], y1 = y;
        if (r.fg) { seg(api, p, [-1, y], cols[k], rays); y1 = y * (1 - 1 / r.fg); seg(api, [-1, y], [0, y1], cols[k], rays); }
        else seg(api, p, [0, y], cols[k], rays);
        const yR = y1 * (1 - r.L / r.dp); // độ cao tia khi tới màng lưới
        if (r.dp < r.L) { seg(api, [0, y1], [r.dp, 0], cols[k], rays); seg(api, [r.dp, 0], [r.L, yR], cols[k], rays); }
        else seg(api, [0, y1], [r.L, yR], cols[k], rays);
        blurR = Math.max(blurR, Math.abs(yR));
      });
      spot.position.set(r.L - 0.02, 0, 0); spot.scale.setScalar(Math.max(0.05, blurR));
      blurPx = Math.min(14, blurR * 16);
      const sharp = blurR < 0.06;
      const where = Math.abs(r.dp - r.L) < 0.05 ? 'rơi <b>đúng màng lưới</b>' : r.dp < r.L ? 'rơi <b>trước màng lưới</b>' : 'rơi <b>sau màng lưới</b>';
      info.set(`${EYES[s.eye].t}, ${GL[s.gl].t.toLowerCase()}: điểm hội tụ của chùm sáng từ vật ở xa ${where}. ${sharp ? '✅ Nhìn rõ.' : '❌ Nhìn mờ.'}`);
      if (s.eye === 'myo' && s.gl === 'conv') api.warn('myoconv', 'Mắt cận vốn đã hội tụ ánh sáng <b>quá mạnh</b> (ảnh rơi trước màng lưới). Đeo thêm kính hội tụ thì ảnh càng tiến ra xa màng lưới, nhìn càng mờ.<br>Người cận phải đeo <b>kính phân kì</b> để làm chùm sáng loe ra trước khi vào mắt.', '👓 Đeo nhầm kính');
      if (s.eye === 'hyp' && s.gl === 'div') api.warn('hypdiv', 'Mắt viễn hội tụ ánh sáng <b>chưa đủ mạnh</b> (ảnh rơi sau màng lưới). Kính phân kì làm chùm sáng loe thêm nên càng mờ.<br>Người viễn phải đeo <b>kính hội tụ</b>.', '👓 Đeo nhầm kính');
    };
    api.section('👁 Mắt và kính');
    api.choices({ label: 'Loại mắt', items: Object.keys(EYES).map(k => ({ t: EYES[k].t, v: k })), value: s.eye, onPick(v) { s.eye = v; update(); } });
    api.choices({ label: 'Kính đeo', items: Object.keys(GL).map(k => ({ t: GL[k].t, v: k })), value: s.gl, onPick(v) { s.gl = v; update(); } });
    api.note('🎯 Chọn mắt cận rồi mắt viễn, tìm loại kính giúp mỗi mắt nhìn rõ vật ở xa. Dải dưới cùng là thứ mắt nhìn thấy.');
    api.strip({ h: innerHeight < 500 ? 62 : 100, draw(x, w, h) {
      x.clearRect(0, 0, w, h); x.fillStyle = '#F8FAFC'; x.fillRect(0, 0, w, h);
      x.save(); x.filter = `blur(${blurPx.toFixed(1)}px)`; x.fillStyle = '#0F172A'; x.font = `800 ${Math.round(h * 0.42)}px 'Baloo 2', sans-serif`; x.textAlign = 'center';
      x.fillText('E  F  P  T  O  Z  L  P  E  D', w / 2, h * 0.62); x.restore();
      x.fillStyle = '#64748B'; x.font = `700 ${Math.round(h / 7)}px 'Baloo 2', sans-serif`; x.fillText('Mắt nhìn thấy bảng chữ ở xa:', 10, 16);
    } });
    update();
    api.view({ pos: [1.2, 3, 13], target: [1.2, 0, 0], min: 4, max: 30 });
  }

  NL.m3d.register('LM6', {
    title: 'Thấu kính và mắt',
    tabs: [{ t: '🔍 Thấu kính', v: 'lens' }, { t: '👁 Mắt cận, mắt viễn', v: 'eye' }],
    init() { s = { conv: true, f: 10, d: 30, xs: 40, eye: 'myo', gl: 'none' }; },
    build(api, tab) { if (tab === 'lens') lens(api); else eye(api); },
    data() {
      const f = s.conv ? s.f : -s.f, ds = [1.25, 1.5, 2, 2.5, 3, 4, 5].map(m => Math.round(m * s.f));
      const dp = d => d * f / (d - f);
      return {
        title: s.conv ? 'Vị trí ảnh qua thấu kính hội tụ' : 'Vị trí ảnh qua thấu kính phân kì', sub: `Tiêu cự f = ${vn(f, 0)} cm. Công thức thấu kính: 1/f = 1/d + 1/d'. Đồ thị 1/d' theo 1/d là đường thẳng cắt trục tung tại 1/f.`,
        sheets: [{ name: "d và d'", head: ['d (cm)', "d' (cm)", 'k = −d\'/d', 'Tính chất ảnh', '1/d (1/m)', "1/d' (1/m)"], rows: ds.map(d => { const p = dp(d); return [d, vn(p, 1), vn(-p / d, 2), p > 0 ? 'Thật, ngược chiều' : 'Ảo, cùng chiều', vn(100 / d, 2), vn(100 / p, 2)]; }) }],
        chart: { type: 'line', xLabel: '1/d (1/m)', yLabel: "1/d' (1/m)", xMin: 0, xMax: Math.ceil(100 / ds[0]), yMin: s.conv ? 0 : -Math.ceil(100 / s.f + 100 / ds[0]), yMax: s.conv ? Math.ceil(100 / s.f) : 0,
          series: [{ name: `f = ${vn(f, 0)} cm`, color: '#38BDF8', dots: true, points: ds.map(d => [+(100 / d).toFixed(2), +(100 / dp(d)).toFixed(2)]) }] }
      };
    }
  });
})();
