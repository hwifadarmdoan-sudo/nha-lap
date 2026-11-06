// Mô hình Lí 10: phản xạ toàn phần (góc tới hạn sin i_gh = n₂/n₁, chỉ xảy ra khi đi từ môi trường chiết quang hơn sang kém hơn) và sợi quang (dẫn ánh sáng qua khúc uốn, góc nhận ánh sáng, rò sáng khi uốn gắt).
(function () {
  const vn = (v, d) => (+v).toFixed(d).replace('.', ',');
  const D = Math.PI / 180;
  const PAIRS = {
    gl: { t: 'Sao Thủy → không khí', n1: 1.5, n2: 1, m1: 'Sao Thủy', m2: 'Không khí' },
    wa: { t: 'Nước → không khí', n1: 1.33, n2: 1, m1: 'Nước', m2: 'Không khí' },
    di: { t: 'Kim cương → không khí', n1: 2.42, n2: 1, m1: 'Kim cương', m2: 'Không khí' },
    ag: { t: 'Không khí → thủy tinh', n1: 1, n2: 1.5, m1: 'Không khí', m2: 'Sao Thủy' }
  };
  const fresnel = (n1, n2, i) => { const st = n1 / n2 * Math.sin(i); if (st >= 1) return 1; const t = Math.asin(st), ci = Math.cos(i), ct = Math.cos(t); const rs = ((n1 * ci - n2 * ct) / (n1 * ci + n2 * ct)) ** 2, rp = ((n1 * ct - n2 * ci) / (n1 * ct + n2 * ci)) ** 2; return (rs + rp) / 2; };
  let s = null;

  function tir(api) {
    const T = api.T, R = 4.2;
    const lowM = api.mat(0x7DD3FC, { opacity: 0.22, depthWrite: false, roughness: 0.05 }), upM = api.mat(0x7DD3FC, { opacity: 0.22, depthWrite: false, roughness: 0.05 });
    const low = api.box(11, 5, 3, lowM, [0, -2.5, 0]), up = api.box(11, 5, 3, upM, [0, 2.5, 0]);
    const l1 = api.label('', [-3.6, -3.6, 0], { cls: 'tag', color: '#38BDF8' }), l2 = api.label('', [-3.6, 3.6, 0], { cls: 'tag', color: '#94A3B8' });
    api.lineBetween([0, -4.8, 0], [0, 4.8, 0], 0.015, api.mat(0xE2E8F0, { opacity: 0.6 })).userData.noPick = true;
    api.label('Pháp tuyến', [0.9, 3.9, 0], { cls: 'plain' });
    const laser = api.group(); api.cyl(0.18, 0.18, 1.2, api.mat(0x1F2937, { metalness: 0.6 }), [0, -0.6, 0], laser); api.cyl(0.08, 0.08, 0.1, api.mat(0xEF4444, { emissive: 0xEF4444, emissiveIntensity: 1 }), [0, 0.02, 0], laser);
    api.part(laser, { name: 'Đèn laser', rows: [['Kéo thanh trượt', 'Đổi góc tới i']] });
    let g = null;
    const info = api.note('');
    const ray = (a, b, op, w) => api.lineBetween([a[0], a[1], 0], [b[0], b[1], 0], w || 0.05, api.mat(0xEF4444, { emissive: 0xEF4444, emissiveIntensity: 1, opacity: op, depthWrite: false }), g);
    const arc = (r, a0, a1, col) => { const pts = []; for (let k = 0; k <= 24; k++) { const a = a0 + (a1 - a0) * k / 24; pts.push(new T.Vector3(r * Math.sin(a), r * Math.cos(a), 0)); } const l = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: col })); g.add(l); };
    const update = () => {
      const P = PAIRS[s.pair], i = s.i * D, st = P.n1 / P.n2 * Math.sin(i), ic = P.n1 > P.n2 ? Math.asin(P.n2 / P.n1) : null;
      lowM.opacity = P.n1 > 1.01 ? 0.12 + 0.08 * P.n1 : 0.02; upM.opacity = P.n2 > 1.01 ? 0.12 + 0.08 * P.n2 : 0.02;
      lowM.color.set(s.pair === 'di' ? 0xE0F2FE : 0x7DD3FC);
      api.part(low, { name: P.m1, rows: [['Chiết suất', `n₁ = ${vn(P.n1, 2)}`]] }); api.part(up, { name: P.m2, rows: [['Chiết suất', `n₂ = ${vn(P.n2, 2)}`]] });
      l1.set(`${P.m1} · n₁ = ${vn(P.n1, 2)}`); l2.set(`${P.m2} · n₂ = ${vn(P.n2, 2)}`);
      if (g) api.root.remove(g); g = api.group();
      const S = [-R * Math.sin(i), -R * Math.cos(i)];
      laser.position.set(S[0], S[1], 0); laser.rotation.z = -i;
      const Rf = fresnel(P.n1, P.n2, i);
      ray(S, [0, 0], 1);
      ray([0, 0], [R * Math.sin(i), -R * Math.cos(i)], Math.max(0.12, Rf), 0.03 + 0.03 * Rf);
      arc(1.1, Math.PI, Math.PI + i, 0xFDE047);
      let txt;
      if (st < 1) {
        const r = Math.asin(st); ray([0, 0], [R * Math.sin(r), R * Math.cos(r)], Math.max(0.12, 1 - Rf), 0.03 + 0.03 * (1 - Rf)); arc(1.4, 0, r, 0x4ADE80);
        txt = `Định luật khúc xạ: n₁·sin i = n₂·sin r<br>${vn(P.n1, 2)} × sin ${s.i}° = ${vn(P.n2, 2)} × sin r → r = <b>${vn(r / D, 1)}°</b><br>Phản xạ một phần: ${vn(Rf * 100, 0)}% · khúc xạ: ${vn((1 - Rf) * 100, 0)}%`;
      } else txt = `<b>Phản xạ toàn phần!</b> sin r tính ra bằng ${vn(st, 2)} > 1 nên không có tia khúc xạ. 100% ánh sáng phản xạ trở lại.`;
      txt += ic ? `<br>Góc tới hạn: sin i<sub>gh</sub> = n₂/n₁ → i<sub>gh</sub> = <b>${vn(ic / D, 1)}°</b>` : '<br>Ánh sáng đi từ môi trường chiết quang <b>kém</b> sang chiết quang <b>hơn</b>: không có góc tới hạn.';
      info.set(txt);
      if (!ic && s.i >= 80) api.warn('noTIR', 'Ánh sáng đang đi từ không khí (n = 1) vào thủy tinh (n = 1,5). Lúc này tia khúc xạ luôn lệch <b>gần</b> pháp tuyến hơn tia tới, nên dù góc tới lớn tới đâu vẫn luôn có tia khúc xạ.<br>Phản xạ toàn phần chỉ xảy ra khi ánh sáng đi từ môi trường chiết quang <b>hơn</b> sang môi trường chiết quang <b>kém</b>, với góc tới lớn hơn góc tới hạn.', '🤔 Không phản xạ toàn phần');
    };
    api.section('💎 Phản xạ toàn phần');
    api.choices({ label: 'Ánh sáng đi từ … sang …', items: Object.keys(PAIRS).map(k => ({ t: PAIRS[k].t, v: k })), value: s.pair, onPick(v) { s.pair = v; update(); } });
    api.slider({ label: 'Góc tới i', min: 0, max: 89, step: 1, value: s.i, unit: '°', lazy: true, onInput(v) { s.i = v; update(); } });
    api.note('🎯 Tăng dần góc tới, tìm góc mà tia khúc xạ vừa biến mất. So sánh góc đó giữa nước, thủy tinh và kim cương. Kim cương lấp lánh vì góc tới hạn rất nhỏ.');
    update();
    api.view({ pos: [0, 0.5, 13], target: [0, 0, 0], min: 4, max: 30 });
  }

  // ---------- sợi quang ----------
  const NCORE = 1.5, NCLAD = 1.25, A = 0.4, LS = 7, LV = 2.5;
  function walls(Rb) {
    return [
      { k: 'L', p: [-LS, -A], q: [0, -A] }, { k: 'L', p: [-LS, A], q: [0, A] },
      { k: 'C', c: [0, Rb], r: Rb + A, a0: -Math.PI / 2, a1: 0 }, { k: 'C', c: [0, Rb], r: Rb - A, a0: -Math.PI / 2, a1: 0 },
      { k: 'L', p: [Rb + A, Rb], q: [Rb + A, Rb + LV] }, { k: 'L', p: [Rb - A, Rb], q: [Rb - A, Rb + LV] }
    ];
  }
  function trace(Rb, alpha, y0) {
    const W = walls(Rb), th = Math.asin(Math.sin(alpha * D) / NCORE);
    let p = [-LS, y0], d = [Math.cos(th), Math.sin(th)];
    const segs = [], sinC = NCLAD / NCORE;
    for (let n = 0; n < 400; n++) {
      let best = null;
      W.forEach(w => {
        if (w.k === 'L') {
          const ex = w.q[0] - w.p[0], ey = w.q[1] - w.p[1], den = d[0] * ey - d[1] * ex; if (Math.abs(den) < 1e-12) return;
          const t = ((w.p[0] - p[0]) * ey - (w.p[1] - p[1]) * ex) / den, u = ((w.p[0] - p[0]) * d[1] - (w.p[1] - p[1]) * d[0]) / den;
          if (t > 1e-6 && u >= -1e-9 && u <= 1 + 1e-9 && (!best || t < best.t)) { const L = Math.hypot(ex, ey); best = { t, n: [-ey / L, ex / L] }; }
        } else {
          const ox = p[0] - w.c[0], oy = p[1] - w.c[1], b = ox * d[0] + oy * d[1], cc = ox * ox + oy * oy - w.r * w.r, disc = b * b - cc; if (disc < 0) return;
          [-b - Math.sqrt(disc), -b + Math.sqrt(disc)].forEach(t => { if (t <= 1e-6 || (best && t >= best.t)) return; const x = ox + d[0] * t, y = oy + d[1] * t, a = Math.atan2(y, x); if (a >= w.a0 - 1e-9 && a <= w.a1 + 1e-9) best = { t, n: [x / w.r, y / w.r] }; });
        }
      });
      // đầu ra
      if (d[1] > 0) { const tEnd = (Rb + LV - p[1]) / d[1]; if (tEnd > 1e-6 && (!best || tEnd < best.t)) { const e = [p[0] + d[0] * tEnd, p[1] + d[1] * tEnd]; segs.push([p, e]); return { segs, ok: true, n }; } }
      if (!best) return { segs, ok: false, n };
      const h = [p[0] + d[0] * best.t, p[1] + d[1] * best.t]; segs.push([p, h]);
      let nn = best.n; const cosI = Math.abs(d[0] * nn[0] + d[1] * nn[1]), sinI = Math.sqrt(Math.max(0, 1 - cosI * cosI));
      if (sinI < sinC) { // rò ra ngoài
        if (d[0] * nn[0] + d[1] * nn[1] < 0) nn = [-nn[0], -nn[1]];
        const st = NCORE / NCLAD * sinI, ct = Math.sqrt(1 - st * st), tg = [d[0] - (d[0] * nn[0] + d[1] * nn[1]) * nn[0], d[1] - (d[0] * nn[0] + d[1] * nn[1]) * nn[1]], tl = Math.hypot(tg[0], tg[1]) || 1;
        const od = [nn[0] * ct + tg[0] / tl * st, nn[1] * ct + tg[1] / tl * st];
        return { segs, ok: false, leak: [h, [h[0] + od[0] * 2, h[1] + od[1] * 2]], n };
      }
      const dn = d[0] * nn[0] + d[1] * nn[1]; d = [d[0] - 2 * dn * nn[0], d[1] - 2 * dn * nn[1]]; p = h;
    }
    return { segs, ok: false };
  }
  const passes = (Rb, al) => [-0.3, 0, 0.3].every(y => trace(Rb, al, y * A).ok);
  function fiber(api) {
    const T = api.T;
    let fg = null, rg = null, built = false;
    const det = api.group(); const detM = api.mat(0x14532D, { emissive: 0x22C55E, emissiveIntensity: 0 });
    const detBox = api.box(1.8, 0.4, 1.4, detM, [0, 0, 0], det);
    api.part(detBox, { name: 'Đầu thu ánh sáng', rows: [['Sáng xanh', 'Ánh sáng đã đi hết sợi quang']] });
    const laser = api.group(); api.cyl(0.25, 0.25, 1.6, api.mat(0x1F2937, { metalness: 0.6 }), [0, 0.8, 0], laser); api.part(laser, { name: 'Đèn laser', rows: [['Góc chiếu α', 'Góc giữa tia laser và trục sợi quang']] });
    const info = api.note('');
    const build = () => {
      if (fg) api.root.remove(fg); fg = api.group();
      const Rb = s.Rb, pts = [];
      for (let k = 0; k <= 14; k++) pts.push(new T.Vector3(-LS + LS * k / 14, 0, 0));
      for (let k = 1; k <= 30; k++) { const a = -Math.PI / 2 + Math.PI / 2 * k / 30; pts.push(new T.Vector3(Rb * Math.cos(a), Rb + Rb * Math.sin(a), 0)); }
      for (let k = 1; k <= 8; k++) pts.push(new T.Vector3(Rb, Rb + LV * k / 8, 0));
      const curve = new T.CatmullRomCurve3(pts, false, 'catmullrom', 0.0);
      const core = api.mesh(new T.TubeGeometry(curve, 240, A, 20, false), api.mat(0x67E8F9, { opacity: 0.22, depthWrite: false, roughness: 0.05 }), null, fg);
      const clad = api.mesh(new T.TubeGeometry(curve, 240, A + 0.22, 20, false), api.mat(0xE2E8F0, { opacity: 0.1, depthWrite: false }), null, fg);
      api.part(core, { name: 'Lõi sợi quang', rows: [['Chiết suất', `n₁ = ${vn(NCORE, 2)} (lớn hơn vỏ)`], ['Ánh sáng', 'Phản xạ toàn phần liên tiếp ở mặt phân cách lõi – vỏ nên đi dọc theo lõi, kể cả khi sợi bị uốn cong']] });
      api.part(clad, { name: 'Vỏ sợi quang', rows: [['Chiết suất', `n₂ = ${vn(NCLAD, 2)}`], ['Góc tới hạn lõi – vỏ', `i_gh = ${vn(Math.asin(NCLAD / NCORE) / D, 1)}°`]] });
      det.position.set(Rb, Rb + LV + 0.25, 0);
      const cx = (-LS - 3 + Rb) / 2 + 1.2, cy = (Rb + LV) / 2, dist = Math.max(14, (Rb + LS + 3) * 1.25, (Rb + LV + 2) * 1.9);
      api.view({ pos: [cx, cy + 0.5, dist], target: [cx, cy, 0], min: 4, max: 45 }); if (built) api.homeView(); built = true;
      update();
    };
    const update = () => {
      if (rg) api.root.remove(rg); rg = api.group();
      laser.rotation.z = Math.PI / 2 + s.al * D; laser.position.set(-LS - 3 * Math.cos(s.al * D), -3 * Math.sin(s.al * D), 0);
      const m = api.mat(0xEF4444, { emissive: 0xEF4444, emissiveIntensity: 1 });
      api.lineBetween([-LS - 3 * Math.cos(s.al * D), -3 * Math.sin(s.al * D), 0], [-LS, 0, 0], 0.04, m, rg);
      const r = trace(s.Rb, s.al, 0);
      r.segs.forEach(([a, b]) => api.lineBetween([a[0], a[1], 0], [b[0], b[1], 0], 0.035, m, rg));
      if (r.leak) { const lm = api.mat(0xF97316, { emissive: 0xF97316, emissiveIntensity: 1, opacity: 0.8 }); api.lineBetween([r.leak[0][0], r.leak[0][1], 0], [r.leak[1][0], r.leak[1][1], 0], 0.05, lm, rg); const sp = api.sphere(0.2, api.mat(0xF97316, { emissive: 0xF97316, emissiveIntensity: 1.2 }), [r.leak[0][0], r.leak[0][1], 0], rg); sp.userData.noPick = true; }
      rg.traverse(o => { o.userData.noPick = true; });
      detM.emissiveIntensity = r.ok ? 1.5 : 0;
      const na = Math.sqrt(NCORE * NCORE - NCLAD * NCLAD), amax = Math.asin(Math.min(1, na)) / D;
      info.set(`${r.ok ? `✅ Ánh sáng tới đầu thu sau <b>${r.n}</b> lần phản xạ toàn phần.` : r.leak ? '❌ Ánh sáng <b>rò ra ngoài</b> (chấm cam): góc tới ở mặt lõi – vỏ nhỏ hơn góc tới hạn.' : '❌ Không tới được đầu thu.'}<br>Góc nhận lớn nhất của sợi (sợi thẳng): sin α<sub>max</sub> = √(n₁² − n₂²) = ${vn(na, 3)} → α<sub>max</sub> ≈ <b>${vn(amax, 1)}°</b>`);
      if (r.leak && s.al > amax + 0.5) api.warn('wide', `Tia laser chiếu lệch quá ${vn(amax, 0)}° so với trục sợi. Vào trong lõi, tia gặp mặt lõi – vỏ với góc tới <b>nhỏ hơn góc tới hạn</b> ${vn(Math.asin(NCLAD / NCORE) / D, 1)}° nên một phần lớn ánh sáng khúc xạ ra vỏ rồi mất đi.<br>Muốn dẫn sáng tốt phải chiếu tia gần như dọc theo trục sợi.`, '💡 Rò sáng');
      else if (r.leak) api.warn('bend', 'Sợi quang bị <b>uốn quá gắt</b>. Ở chỗ cong, tia sáng gặp thành sợi với góc tới nhỏ hơn, có lúc nhỏ hơn góc tới hạn nên ánh sáng rò ra ngoài. Vì vậy cáp quang khi lắp đặt có quy định bán kính uốn tối thiểu.', '💡 Rò sáng ở khúc uốn');
    };
    api.section('🧵 Sợi quang');
    api.slider({ label: 'Góc chiếu laser α', min: 0, max: 70, step: 1, value: s.al, unit: '°', lazy: true, onInput(v) { s.al = v; update(); } });
    api.slider({ label: 'Bán kính khúc uốn', min: 1, max: 10, step: 0.5, value: s.Rb, unit: 'cm', lazy: true, onInput(v) { s.Rb = v; build(); } });
    api.note('Sợi quang gồm lõi chiết suất lớn bọc trong lớp vỏ chiết suất nhỏ hơn một chút. Ứng dụng: cáp internet quang, nội soi trong y học.<br>🎯 Tìm góc chiếu lớn nhất mà ánh sáng vẫn tới đầu thu, rồi thử uốn sợi gắt dần.');
    build();
  }

  NL.m3d.register('LM10', {
    title: 'Phản xạ toàn phần và sợi quang',
    tabs: [{ t: '💎 Phản xạ toàn phần', v: 'tir' }, { t: '🧵 Sợi quang', v: 'fiber' }],
    init() { s = { pair: 'gl', i: 30, al: 10, Rb: 8 }; },
    build(api, tab) { if (tab === 'tir') tir(api); else fiber(api); },
    data() {
      const Rbs = [3, 4, 5, 6, 7, 8, 9, 10];
      const amax = Rb => { let a = 0; for (let x = 0; x <= 70; x += 1) { if (passes(Rb, x)) a = x; else break; } return a; };
      const am = Rbs.map(amax);
      return {
        title: 'Góc tới hạn và sợi quang', sub: `Lõi n₁ = ${vn(NCORE, 2)}, vỏ n₂ = ${vn(NCLAD, 2)}, mô hình phóng to: lõi rộng 0,8 cm, vỏ chiết suất thấp để dễ quan sát (sợi thật mảnh như sợi tóc, n₂ chỉ nhỏ hơn n₁ khoảng 1%). Uốn càng gắt, góc chiếu chấp nhận được càng nhỏ.`,
        sheets: [
          { name: 'Góc tới hạn', head: ['Ánh sáng đi từ', 'Sang', 'n₁', 'n₂', 'Góc tới hạn'], rows: Object.values(PAIRS).map(P => [P.m1, P.m2, vn(P.n1, 2), vn(P.n2, 2), P.n1 > P.n2 ? vn(Math.asin(P.n2 / P.n1) / D, 1) + '°' : 'Không có']).concat([['Lõi sợi quang', 'Vỏ sợi quang', vn(NCORE, 2), vn(NCLAD, 2), vn(Math.asin(NCLAD / NCORE) / D, 1) + '°']]) },
          { name: 'Uốn sợi', head: ['Bán kính uốn (cm)', 'Góc chiếu lớn nhất vẫn dẫn được sáng (°)'], rows: Rbs.map((r, k) => [vn(r, 1), vn(am[k], 1)]) }
        ],
        chart: { type: 'line', xLabel: 'Bán kính uốn (cm)', yLabel: 'Góc chiếu lớn nhất (°)', xMin: 2, xMax: 10, yMin: 0, yMax: 60, series: [{ name: 'α lớn nhất', color: '#38BDF8', dots: true, points: Rbs.map((r, k) => [r, am[k]]) }] }
      };
    }
  });
})();
