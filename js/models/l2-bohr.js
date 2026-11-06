// Mô hình Lí 2: nguyên tử Rutherford – Bohr. Z từ 1 đến 36 (proton, neutron của đồng vị phổ biến nhất, electron theo lớp),
// mẫu Rutherford sụp đổ theo điện từ học cổ điển, quang phổ vạch hydrogen (Lyman, Balmer, Paschen). Công thức Bohr chỉ đúng cho H.
(function () {
  // số neutron của đồng vị phổ biến nhất, Z = 1…36 (Cu-63 và Zn-64 đều có 34 neutron)
  const NEU = [0, 2, 4, 5, 6, 6, 7, 8, 10, 10, 12, 12, 14, 14, 16, 16, 18, 22, 20, 20, 24, 26, 28, 28, 30, 30, 32, 30, 34, 34, 38, 42, 42, 46, 44, 48];
  const SHELL = ['K', 'L', 'M', 'N'];
  const vn = (v, d) => (+v).toFixed(d).replace('.', ',');
  const RH = 1.097e7;
  const lam = (n, m) => 1e9 / (RH * (1 / (m * m) - 1 / (n * n))); // nm
  function wl2hex(l) {
    if (l < 380) return 0xB57BFF; if (l > 750) return 0xFF6B6B;
    let r = 0, g = 0, b = 0;
    if (l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = (510 - l) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = (645 - l) / 65; } else r = 1;
    return (Math.round(255 * r) << 16) | (Math.round(255 * g) << 8) | Math.round(255 * b);
  }
  let s = null;

  function atom(api) {
    const T = api.T, C = NL.chem3d;
    let nuc = null, rings = [], es = [];
    const info = api.note(''), lab = api.label('', [0, 0, 0], { cls: 'tag', color: '#FDE047' });
    const rebuild = () => {
      if (nuc) { api.root.remove(nuc); } rings.forEach(r => api.root.remove(r)); es.forEach(e => api.root.remove(e.m));
      rings = []; es = [];
      const Z = s.Z, N = NEU[Z - 1], el = C.EL[Z - 1], sh = C.shells(Z);
      // hạt nhân: xếp proton, neutron thành khối cầu
      nuc = api.group(); const A = Z + N, rN = 0.16 * Math.cbrt(A) + 0.05, rnd = api.rand(Z * 7);
      const pts = []; for (let k = 0; k < A; k++) { const u = rnd(), v = rnd(), w = Math.cbrt(rnd()) * rN; const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1); pts.push([w * Math.sin(ph) * Math.cos(th), w * Math.sin(ph) * Math.sin(th), w * Math.cos(ph)]); }
      const order = Array.from({ length: A }, (_, k) => k < Z); for (let k = A - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [order[k], order[j]] = [order[j], order[k]]; }
      pts.forEach((p, k) => api.sphere(0.13, api.mat(order[k] ? 0xEF4444 : 0x9CA3AF, { roughness: 0.4 }), p, nuc, 12));
      api.part(nuc, { name: `Hạt nhân ${el.sym}-${A}`, rows: [['Proton (đỏ)', `${Z} hạt, mang điện dương`], ['Neutron (xám)', `${N} hạt, không mang điện`], ['Số khối A', `${A} = ${Z} + ${N}`], ['Kích thước thật', 'Nhỏ hơn nguyên tử khoảng 100 000 lần (ở đây vẽ phóng to)']] });
      // lớp electron
      sh.forEach((ne, n) => {
        const R = 1.6 + n * 1.15, tilt = [0.1, 0.65, 1.15, -1.0][n];
        const ring = api.mesh(new T.TorusGeometry(R, 0.015, 8, 128), api.mat(0x7DD3FC, { opacity: 0.45, depthWrite: false })); ring.rotation.x = Math.PI / 2 + tilt; ring.userData.noPick = true; rings.push(ring);
        api.part(ring, { name: `Lớp ${SHELL[n]} (n = ${n + 1})`, rows: [['Số electron', `${ne}`], ['Tối đa theo 2n²', `${2 * (n + 1) * (n + 1)}`]], focus: false });
        for (let k = 0; k < ne; k++) {
          const m = api.sphere(0.09, api.mat(0x38BDF8, { emissive: 0x38BDF8, emissiveIntensity: 0.8 }), null, null, 10); m.userData.noPick = true;
          es.push({ m, R, tilt, a: 2 * Math.PI * k / ne, w: 1.4 / Math.sqrt(n + 1), r0: R });
        }
      });
      info.set(`<b>${el.vi} (${el.sym})</b>, Z = ${Z}<br>Cấu hình theo lớp: ${sh.map((e, n) => `${SHELL[n]}${e}`).join(' · ')}<br>Cấu hình electron: ${C.config(Z)}`);
      lab.set(`${el.sym} · Z = ${Z} · A = ${A}`); lab.pos && lab.pos.set(0, -(1.6 + sh.length * 1.15 + 0.3), 0);
      s.collapse = 0;
    };
    api.onFrame(dt => {
      if (s.mode === 'ruth') s.collapse = Math.min(1, s.collapse + dt / 4);
      es.forEach(e => {
        e.a += dt * e.w * (s.mode === 'ruth' ? 1 + 6 * s.collapse : 1);
        const R = s.mode === 'ruth' ? Math.max(0.35, e.r0 * (1 - s.collapse)) : e.R;
        const x = Math.cos(e.a) * R, z = Math.sin(e.a) * R, ct = Math.cos(e.tilt), st = Math.sin(e.tilt);
        e.m.position.set(x, -z * st, z * ct);
      });
      if (s.mode === 'ruth' && s.collapse >= 1 && !s.saidRuth) { s.saidRuth = true; api.warn('ruth', 'Theo điện từ học cổ điển, electron quay tròn quanh hạt nhân phải liên tục bức xạ sóng điện từ, mất năng lượng và <b>rơi xoắn ốc vào hạt nhân</b> chỉ trong khoảng 10⁻¹¹ s. Nguyên tử thật lại bền vững. Mẫu Rutherford không giải thích được điều này, nên Bohr đưa ra tiên đề về <b>trạng thái dừng</b>: electron chỉ ở trên một số quỹ đạo xác định và không bức xạ khi ở đó.', '💥 Mẫu Rutherford sụp đổ'); }
    });
    api.section('⚛️ Nguyên tử');
    const zs = api.slider({ label: 'Số hiệu nguyên tử Z', min: 1, max: 36, step: 1, value: s.Z, unit: '', onInput(v) { s.Z = v; rebuild(); } });
    api.choices({ label: 'Mẫu nguyên tử', items: [{ t: 'Bohr (trạng thái dừng)', v: 'bohr' }, { t: 'Rutherford (cổ điển)', v: 'ruth' }], value: s.mode, onPick(v) { s.mode = v; s.collapse = 0; s.saidRuth = false; } });
    api.button('↺ Dựng lại nguyên tử', () => zs.set(s.Z));
    api.note('Proton đỏ, neutron xám, electron xanh. Số neutron lấy theo đồng vị phổ biến nhất. Hình vẽ chỉ minh họa số electron trên từng lớp; công thức bán kính và năng lượng của Bohr chỉ đúng cho nguyên tử hydrogen.');
    rebuild();
    api.view({ pos: [0, 5, 12], target: [0, 0, 0], min: 2, max: 30 });
  }

  function spectrum(api) {
    const T = api.T, K = 0.16, rad = n => K * n * n + 0.25;
    const nucl = api.sphere(0.22, api.mat(0xEF4444), [0, 0, 0], null, 20);
    api.part(nucl, { name: 'Hạt nhân hydrogen (1 proton)', rows: [['Điện tích', '+e']] });
    for (let n = 1; n <= 6; n++) {
      const ring = api.mesh(new T.TorusGeometry(rad(n), 0.02, 8, 160), api.mat(0x7DD3FC, { opacity: 0.5, depthWrite: false })); ring.rotation.x = Math.PI / 2;
      api.part(ring, { name: `Quỹ đạo dừng n = ${n}`, rows: [['Bán kính', `rₙ = n²r₀ = ${n * n} × 0,053 nm = ${vn(n * n * 0.053, 3)} nm`], ['Năng lượng', `Eₙ = −13,6/n² = ${vn(-13.6 / (n * n), 2)} eV`]], focus: false });
      api.label(`n = ${n}`, [rad(n) + 0.15, 0.15, 0], { cls: 'plain' });
    }
    const e = api.sphere(0.12, api.mat(0x38BDF8, { emissive: 0x38BDF8, emissiveIntensity: 0.9 }), null, null, 12); e.userData.noPick = true;
    const ph = api.group(); let wave = null;
    let cur = s.up, ang = 0, jump = null;
    const res = api.note('');
    api.onFrame(dt => {
      ang += dt * 2.2 / cur;
      let r = rad(cur);
      if (jump) { jump.k = Math.min(1, jump.k + dt * 1.6); r = rad(jump.from) + (rad(jump.to) - rad(jump.from)) * jump.k; if (jump.k >= 1) { cur = jump.to; jump = null; } }
      e.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
      if (wave) { wave.t += dt; wave.g.position.addScaledVector(wave.dir, dt * 4); wave.g.children.forEach(c => { c.material.opacity = Math.max(0, 1 - wave.t / 2.5); }); if (wave.t > 2.5) { api.root.remove(wave.g); wave = null; } }
    });
    const emit = () => {
      if (s.low >= s.up) { api.toast('Mức trên phải cao hơn mức dưới'); return; }
      cur = s.up; ang = Math.atan2(e.position.z, e.position.x);
      jump = { from: s.up, to: s.low, k: 0 };
      const L = lam(s.up, s.low), col = wl2hex(L), dE = 13.6 * (1 / (s.low * s.low) - 1 / (s.up * s.up));
      // photon: đoạn sóng hình sin bay ra
      if (wave) api.root.remove(wave.g);
      const g = api.group(), pts = []; const wl = Math.min(1.2, Math.max(0.25, L / 600));
      for (let k = 0; k <= 60; k++) { const x = k * 0.06; pts.push(new T.Vector3(x, Math.sin(x / wl * 2 * Math.PI) * 0.18, 0)); }
      const tube = api.tube(pts, 0.035, api.mat(col, { emissive: col, emissiveIntensity: 1, opacity: 1 }), g, 120); tube.userData.noPick = true;
      const dir = e.position.clone().normalize(); g.position.copy(e.position); g.quaternion.setFromUnitVectors(new T.Vector3(1, 0, 0), dir);
      wave = { g, t: 0, dir };
      const ser = s.low === 1 ? 'Lyman (tử ngoại)' : s.low === 2 ? 'Balmer (nhìn thấy được nếu λ từ 380 đến 760 nm)' : 'Paschen (hồng ngoại)';
      s.lines = s.lines.filter(x => !(x.n === s.up && x.m === s.low)); s.lines.push({ n: s.up, m: s.low, L, dE });
      res.set(`Electron nhảy từ n = ${s.up} xuống n = ${s.low}, phát ra 1 photon<br>ε = E${s.up} − E${s.low} = <b>${vn(dE, 2)} eV</b><br>λ = hc/ε ≈ <b>${vn(L, 0)} nm</b> · dãy ${ser}`);
      api.beep(300 + 2e5 / L, 0.25, 'sine', 0.12);
    };
    api.section('🌈 Quang phổ vạch hydrogen');
    api.choices({ label: 'Mức năng lượng ban đầu (trên)', items: [2, 3, 4, 5, 6].map(n => ({ t: 'n = ' + n, v: n })), value: s.up, onPick(v) { s.up = v; cur = v; } });
    api.choices({ label: 'Mức năng lượng sau (dưới)', items: [1, 2, 3].map(n => ({ t: 'n = ' + n, v: n })), value: s.low, onPick(v) { s.low = v; } });
    api.button('✨ Cho electron chuyển mức', emit);
    api.note('Electron chỉ phát photon khi chuyển từ mức cao xuống mức thấp. Năng lượng photon đúng bằng hiệu hai mức: ε = E<sub>cao</sub> − E<sub>thấp</sub>. Vì các mức là rời rạc nên quang phổ hydrogen là các <b>vạch</b> riêng biệt, không liên tục.');
    // dải quang phổ ở dưới màn hình
    api.strip({ h: innerHeight < 500 ? 62 : 96, draw(x, w, h) {
      x.clearRect(0, 0, w, h); x.fillStyle = '#0B1220'; x.fillRect(0, 0, w, h);
      const L0 = 90, L1 = 1900, X = l => 10 + (w - 20) * (Math.log(l) - Math.log(L0)) / (Math.log(L1) - Math.log(L0));
      for (let l = 380; l <= 760; l += 4) { const c = wl2hex(l); x.fillStyle = `rgba(${c >> 16},${(c >> 8) & 255},${c & 255},.18)`; x.fillRect(X(l), 8, X(l + 4) - X(l) + 1, h - 34); }
      x.fillStyle = '#94A3B8'; x.font = `700 ${Math.round(h / 6.5)}px 'Baloo 2', sans-serif`;
      [100, 200, 400, 700, 1000, 1875].forEach(l => x.fillText(l + ' nm', X(l) - 14, h - 8));
      x.fillText('tử ngoại', X(110), 22); x.fillText('nhìn thấy', X(450), 22); x.fillText('hồng ngoại', X(1100), 22);
      s.lines.forEach(ln => { const c = wl2hex(ln.L); x.fillStyle = `rgb(${c >> 16},${(c >> 8) & 255},${c & 255})`; x.fillRect(X(ln.L) - 2, 8, 4, h - 34); });
    } });
    res.set('Chọn hai mức rồi bấm nút để xem photon phát ra. Thử đủ 4 vạch Balmer: 3→2, 4→2, 5→2, 6→2.');
    api.view({ pos: [0, 7, 9], target: [0, 0, 0], min: 2, max: 25 });
  }

  NL.m3d.register('LM2', {
    title: 'Nguyên tử Rutherford – Bohr',
    tabs: [{ t: '⚛️ Cấu tạo nguyên tử', v: 'atom' }, { t: '🌈 Quang phổ hydrogen', v: 'spec' }],
    init() { s = { Z: 6, mode: 'bohr', up: 3, low: 2, lines: [] }; },
    build(api, tab) { if (tab === 'atom') atom(api); else spectrum(api); },
    data() {
      const C = NL.chem3d, el = C.EL[s.Z - 1], N = NEU[s.Z - 1];
      return {
        title: 'Mức năng lượng và vạch quang phổ của hydrogen', sub: `Nguyên tố đang xem: ${el.vi} (${el.sym}), ${s.Z} proton, ${N} neutron, ${s.Z} electron, lớp ${C.shells(s.Z).join('-')}`,
        sheets: [
          { name: 'Mức năng lượng H', head: ['n', 'rₙ (nm)', 'Eₙ (eV)'], rows: [1, 2, 3, 4, 5, 6].map(n => [n, vn(0.053 * n * n, 3), vn(-13.6 / (n * n), 3)]) },
          { name: 'Vạch em đã tạo', head: ['Từ n', 'Xuống n', 'ε (eV)', 'λ (nm)'], rows: s.lines.length ? s.lines.map(l => [l.n, l.m, vn(l.dE, 3), vn(l.L, 1)]) : [['–', '–', '–', '–']] }
        ],
        chart: { type: 'line', xLabel: 'n', yLabel: 'Eₙ (eV)', xMin: 1, xMax: 6, yMin: -14, yMax: 0, series: [{ name: 'Eₙ = −13,6/n²', color: '#38BDF8', dots: true, points: [1, 2, 3, 4, 5, 6].map(n => [n, +(-13.6 / (n * n)).toFixed(3)]) }] }
      };
    }
  });
})();
