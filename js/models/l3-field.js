// Mô hình Lí 3: đường sức từ của nam châm thẳng (mạt sắt, kim nam châm kéo thả, cắt đôi nam châm) và của ống dây có dòng điện (B = μ₀NI/l, quy tắc nắm tay phải).
(function () {
  const vn = (v, d) => (+v).toFixed(d).replace('.', ',');
  const MU0 = 4 * Math.PI * 1e-7, LEN = 0.5; // ống dây dài 0,5 m
  let s = null;

  // từ trường mô hình hai "cực từ" tại x = ±a (đúng dạng bên ngoài nam châm và ống dây)
  function Bpole(x, y, z, a, sgn) {
    const f = (px) => { const dx = x - px, d2 = dx * dx + y * y + z * z, d3 = Math.pow(d2, 1.5) + 1e-6; return [dx / d3, y / d3, z / d3]; };
    const n = f(a * sgn), q = f(-a * sgn);
    return [n[0] - q[0], n[1] - q[1], n[2] - q[2]];
  }
  // vạch một đường sức trong mặt phẳng (x, r) rồi trả về điểm 2D
  function trace(a, sgn, phi, stop) {
    const pts = []; let x = a * sgn + 0.2 * Math.cos(phi) * sgn, r = 0.2 * Math.sin(phi);
    for (let k = 0; k < 700; k++) {
      pts.push([x, r]);
      const b = Bpole(x, r, 0, a, sgn), m = Math.hypot(b[0], b[1]) || 1;
      x += 0.07 * b[0] / m; r += 0.07 * b[1] / m;
      if (Math.hypot(x + a * sgn, r) < 0.22 || Math.hypot(x, r) > 15 || (stop && stop(x, r))) { pts.push([x, r]); break; }
    }
    return pts;
  }
  function drawLines(api, a, sgn, col, opacity, inside, nPhi, nRot) {
    const T = api.T, g = api.group(), mat = api.mat(col, { opacity, depthWrite: false, emissive: col, emissiveIntensity: 0.4 });
    const PH = [12, 28, 45, 62, 80, 100, 125, 150];
    const phis = (nPhi ? PH.filter((_, k) => k % Math.ceil(PH.length / nPhi) === 0).slice(0, nPhi) : PH).map(d => d * Math.PI / 180);
    const rots = Array.from({ length: nRot || 6 }, (_, k) => k * 2 * Math.PI / (nRot || 6));
    phis.forEach(phi => {
      const p2 = trace(a, sgn, phi, inside); if (p2.length < 6) return;
      rots.forEach(th => {
        const pts = p2.filter((_, k) => k % 3 === 0).map(([x, r]) => new T.Vector3(x, r * Math.cos(th), r * Math.sin(th)));
        if (pts.length < 3) return;
        const tube = api.tube(pts, 0.022, mat, g, Math.min(240, pts.length * 2)); tube.userData.noPick = true;
        const mid = Math.floor(pts.length / 2), dir = pts[mid + 1].clone().sub(pts[mid]).normalize();
        const cone = api.mesh(new T.ConeGeometry(0.09, 0.26, 10), mat, null, g); cone.position.copy(pts[mid]); cone.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir); cone.userData.noPick = true;
      });
    });
    return g;
  }
  function compass(api, field, pos) {
    const T = api.T, g = api.group(null, pos);
    api.cyl(0.55, 0.55, 0.12, api.mat(0xF8FAFC, { roughness: 0.3 }), [0, 0, 0], g);
    api.mesh(new T.TorusGeometry(0.55, 0.05, 8, 40), api.mat(0x94A3B8, { metalness: 0.6 }), [0, 0.07, 0], g).rotation.x = Math.PI / 2;
    const nd = api.group(g, [0, 0.12, 0]);
    const tipN = api.mesh(new T.ConeGeometry(0.09, 0.45, 4), api.mat(0xEF4444), [0.22, 0, 0], nd); tipN.rotation.z = -Math.PI / 2;
    const tipS = api.mesh(new T.ConeGeometry(0.09, 0.45, 4), api.mat(0x3B82F6), [-0.22, 0, 0], nd); tipS.rotation.z = Math.PI / 2;
    api.part(g, { name: 'Kim nam châm (la bàn)', rows: [['Đầu đỏ', 'Cực Bắc (N) của kim'], ['Quy ước', 'Đầu N của kim chỉ theo chiều đường sức từ tại chỗ đặt kim'], ['Thao tác', 'Kéo kim đi quanh để dò từ trường']], focus: false });
    let ang = 0;
    api.onFrame(dt => { const b = field(g.position.x, 0, g.position.z); if (Math.hypot(b[0], b[2]) < 1e-9) return; const t = Math.atan2(-b[2], b[0]); let d = t - ang; d = Math.atan2(Math.sin(d), Math.cos(d)); ang += d * Math.min(1, dt * 6); nd.rotation.y = ang; });
    api.draggable(g, { normal: new T.Vector3(0, 1, 0), anchor: new T.Vector3(0, pos[1], 0), move(p) { g.position.set(Math.max(-10, Math.min(10, p.x)), pos[1], Math.max(-7, Math.min(7, p.z))); } });
    return g;
  }

  function bar(api) {
    const T = api.T, A = 1.7;
    const mag = api.group();
    const n = api.box(2, 0.9, 0.9, api.mat(0xEF4444, { roughness: 0.4 }), [1, 0, 0], mag), sp = api.box(2, 0.9, 0.9, api.mat(0x3B82F6, { roughness: 0.4 }), [-1, 0, 0], mag);
    api.textSprite('N', { h: 0.6, pos: [1.3, 0.75, 0], parent: mag }); api.textSprite('S', { h: 0.6, pos: [-1.3, 0.75, 0], parent: mag });
    api.part(n, { name: 'Cực Bắc (N)', rows: [['Đường sức', 'Đi RA khỏi cực N'], ['Tương tác', 'Đẩy cực N khác, hút cực S']] });
    api.part(sp, { name: 'Cực Nam (S)', rows: [['Đường sức', 'Đi VÀO cực S'], ['Tương tác', 'Hút cực N, đẩy cực S khác']] });
    const field = (x, y, z) => Bpole(x, y, z, A, 1);
    const lines = api.tag(drawLines(api, A, 1, 0xFDE047, 0.75), 'lines');
    // mạt sắt
    const rnd = api.rand(5), pos = [];
    for (let x = -9; x <= 9; x += 0.55) for (let z = -6.5; z <= 6.5; z += 0.55) { const px = x + (rnd() - 0.5) * 0.25, pz = z + (rnd() - 0.5) * 0.25; if (Math.abs(px) < 2.3 && Math.abs(pz) < 0.7) continue; pos.push([px, pz]); }
    const im = new T.InstancedMesh(new T.BoxGeometry(0.26, 0.03, 0.05), api.mat(0x4B5563, { metalness: 0.7, roughness: 0.4 }), pos.length), m4 = new T.Matrix4(), q = new T.Quaternion();
    pos.forEach(([x, z], k) => { const b = field(x, 0, z); q.setFromAxisAngle(new T.Vector3(0, 1, 0), Math.atan2(-b[2], b[0])); m4.compose(new T.Vector3(x, -0.45, z), q, new T.Vector3(1, 1, 1)); im.setMatrixAt(k, m4); });
    im.userData.noPick = true; api.root.add(im); api.tag(im, 'filings'); im.visible = false;
    const sheet = api.box(20, 0.04, 14, api.mat(0xF1F5F9, { opacity: 0.12, depthWrite: false }), [0, -0.5, 0]); sheet.userData.noPick = true; api.tag(sheet, 'filings'); sheet.visible = false;
    compass(api, field, [0, 0.1, 3.2]);
    // cắt đôi
    const half = api.group(null, [0, 0, -4]); half.visible = false;
    [[-1.6, 0], [1.6, 0]].forEach(([x]) => { api.box(1, 0.7, 0.7, api.mat(0xEF4444), [x + 0.5, 0, 0], half); api.box(1, 0.7, 0.7, api.mat(0x3B82F6), [x - 0.5, 0, 0], half); api.textSprite('N', { h: 0.4, pos: [x + 0.5, 0.6, 0], parent: half }); api.textSprite('S', { h: 0.4, pos: [x - 0.5, 0.6, 0], parent: half }); });
    api.section('🧲 Nam châm thẳng');
    api.checklist([{ k: 'lines', label: 'Đường sức từ' }, { k: 'filings', label: 'Rắc mạt sắt', on: false }]);
    api.toggle({ label: '✂ Cắt đôi nam châm', value: false, onChange(v) { half.visible = v; if (v) api.warn('cut', 'Cắt đôi nam châm KHÔNG tách được cực N riêng và cực S riêng. Mỗi nửa lập tức trở thành một nam châm hoàn chỉnh có đủ hai cực N và S. Trong tự nhiên chưa ai tìm thấy "đơn cực từ".', '🤔 Hiểu lầm thường gặp'); } });
    api.note('Đường sức từ bên ngoài nam châm đi <b>ra từ cực N, vào cực S</b>. Chỗ đường sức dày là từ trường mạnh (gần hai cực). Các đường sức không bao giờ cắt nhau.<br>Kéo kim nam châm trắng đi quanh để dò chiều đường sức.');
    void lines;
    api.view({ pos: [0, 12, 11], target: [0, 0, 0], min: 3, max: 40 });
  }

  function coil(api) {
    const T = api.T, A = 3, R = 1.2;
    let g = null, lines = null, poleN = null, poleS = null;
    const Bin = () => MU0 * s.N * Math.abs(s.I) / LEN; // T (độ lớn)
    // số đường sức trong lòng ống tăng tuyến tính theo N·I: 4 đường ở N·I = 50 A·vòng (nhỏ nhất), 24 đường ở 5000 (lớn nhất)
    const nLines = () => { const NI = s.N * Math.abs(s.I); return NI === 0 ? 0 : Math.max(1, Math.round(4 + 20 * (NI - 50) / 4950)); };
    let tmr = 0; const soon = () => { clearTimeout(tmr); tmr = setTimeout(rebuild, 120); };
    const field = (x, y, z) => { const r = Math.hypot(y, z); if (Math.abs(x) < A && r < R) return [s.I >= 0 ? 1 : -1, 0, 0]; const b = Bpole(x, y, z, A, s.I >= 0 ? 1 : -1); return b; };
    const info = api.note('');
    const rebuild = () => {
      [g, lines].forEach(o => o && api.root.remove(o));
      g = api.group();
      const turns = Math.round(6 + s.N / 50), pts = [];
      for (let k = 0; k <= turns * 24; k++) { const t = k / (turns * 24), a = t * turns * 2 * Math.PI; pts.push(new T.Vector3(-A + 2 * A * t, R * Math.cos(a), R * Math.sin(a))); }
      const wire = api.tube(pts, 0.05, api.mat(0xD97706, { metalness: 0.6, roughness: 0.35 }), g, turns * 24);
      api.part(wire, { name: `Ống dây ${s.N} vòng`, rows: [['Chiều dài', '0,5 m'], ['Cảm ứng từ trong lòng ống', `B = μ₀NI/l = ${vn(Bin() * 1000, 2)} mT`], ['Đặc điểm', 'Trong lòng ống, đường sức gần như song song và cách đều: từ trường đều']] });
      // mũi tên chiều dòng điện trên vài vòng phía trước
      for (let k = 1; k < turns; k += Math.max(1, Math.floor(turns / 5))) {
        const x = -A + 2 * A * (k + 0.25) / turns, c = api.mesh(new T.ConeGeometry(0.12, 0.32, 10), api.mat(0x22D3EE, { emissive: 0x22D3EE, emissiveIntensity: 0.6 }), [x, 0, R + 0.02], g);
        c.rotation.x = s.I >= 0 ? Math.PI / 2 : -Math.PI / 2; c.userData.noPick = true; c.visible = s.I !== 0;
      }
      api.cyl(0.08, 0.08, 1.4, api.mat(0x64748B), [-A, -R - 0.7, 0], g); api.cyl(0.08, 0.08, 1.4, api.mat(0x64748B), [A, -R - 0.7, 0], g);
      const n = nLines(), nOut = s.I === 0 ? 0 : Math.max(2, Math.min(8, Math.round(n / 4))) * Math.max(2, Math.min(6, Math.round(n / 4)));
      if (s.I !== 0) {
        const sg = s.I > 0 ? 1 : -1, op = 0.75;
        lines = drawLines(api, A, sg, 0xFDE047, op, null, Math.max(2, Math.min(8, Math.round(n / 4))), Math.max(2, Math.min(6, Math.round(n / 4))));
        // n đường sức trong lòng ống, rải đều theo hình hoa hướng dương (dày đều, mật độ tỉ lệ với B)
        const GA = Math.PI * (3 - Math.sqrt(5)), mL = api.mat(0xFDE047, { opacity: op, depthWrite: false });
        for (let k = 0; k < n; k++) {
          const r = n === 1 ? 0 : 0.88 * R * Math.sqrt((k + 0.5) / n), th = k * GA, y = r * Math.cos(th), z = r * Math.sin(th);
          const ln = api.lineBetween([-A, y, z], [A, y, z], 0.022, mL, lines); ln.userData.noPick = true;
          const cn = api.mesh(new T.ConeGeometry(0.09, 0.26, 10), mL, [0, y, z], lines); cn.rotation.z = -sg * Math.PI / 2; cn.userData.noPick = true;
        }
      } else lines = null;
      const nx = s.I >= 0 ? A + 0.9 : -A - 0.9;
      if (!poleN) { poleN = api.label('', [0, 0, 0], { cls: 'tag', color: '#EF4444' }); poleS = api.label('', [0, 0, 0], { cls: 'tag', color: '#3B82F6' }); }
      poleN.pos.set(nx, R + 0.6, 0); poleS.pos.set(-nx, R + 0.6, 0); poleN.set('Cực N'); poleS.set('Cực S'); poleN.show(s.I !== 0); poleS.show(s.I !== 0);
      info.set(`N = ${s.N} vòng · I = ${vn(Math.abs(s.I), 1)} A · N·I = ${vn(s.N * Math.abs(s.I), 0)} A·vòng<br>Số đường sức đang vẽ: <b>${s.I === 0 ? 0 : n}</b> trong lòng ống (${nOut} vòng ngoài) · <i>số đường chỉ thể hiện độ mạnh tương đối của từ trường</i><br>B = μ₀·N·I / ℓ = 4π·10⁻⁷ × ${s.N} × ${vn(Math.abs(s.I), 1)} / 0,5 = <b>${vn(Bin() * 1000, 2)} mT</b><br>Quy tắc nắm tay phải: khum các ngón tay theo chiều dòng điện trong các vòng dây, ngón cái choãi ra chỉ chiều đường sức trong lòng ống (đi ra ở cực N).`);
    };
    compass(api, field, [5.5, 0.1, 2.6]);
    api.section('🌀 Ống dây có dòng điện');
    api.slider({ label: 'Cường độ dòng điện I', min: -5, max: 5, step: 0.5, value: s.I, unit: 'A', lazy: true, onInput(v) { const flip = (v < 0) !== (s.I < 0); s.I = v; soon(); if (flip && v < 0) api.toast('Dòng điện đổi chiều: hai cực của ống dây đổi chỗ'); } });
    api.slider({ label: 'Số vòng dây N', min: 100, max: 1000, step: 100, value: s.N, unit: 'vòng', lazy: true, onInput(v) { s.N = v; soon(); } });
    api.note('Kéo I hoặc N: số đường sức tăng theo N·I (từ trường mạnh lên). Đặt I = 0 thì không còn từ trường. Đổi dấu I (đổi chiều dòng điện) để thấy cực N, S đổi chỗ và kim nam châm quay ngược lại.');
    rebuild();
    api.view({ pos: [2, 9, 13], target: [0, 0, 0], min: 3, max: 40 });
  }

  NL.m3d.register('LM3', {
    title: 'Đường sức từ của nam châm và ống dây',
    tabs: [{ t: '🧲 Nam châm thẳng', v: 'bar' }, { t: '🌀 Ống dây có dòng điện', v: 'coil' }],
    init() { s = { I: 2, N: 500 }; },
    build(api, tab) { if (tab === 'bar') bar(api); else coil(api); },
    data() {
      const Is = [0, 1, 2, 3, 4, 5];
      return {
        title: 'Cảm ứng từ trong lòng ống dây', sub: `Ống dây dài 0,5 m · B = μ₀NI/l · đang chọn N = ${s.N} vòng, I = ${vn(s.I, 1)} A`,
        sheets: [{ name: 'B theo I', head: ['I (A)', 'B (mT) với 200 vòng', `B (mT) với ${s.N} vòng`, 'B (mT) với 1000 vòng'], rows: Is.map(I => [I, vn(MU0 * 200 * I / LEN * 1000, 3), vn(MU0 * s.N * I / LEN * 1000, 3), vn(MU0 * 1000 * I / LEN * 1000, 3)]) }],
        chart: { type: 'line', xLabel: 'I (A)', yLabel: 'B (mT)', xMin: 0, xMax: 5, yMin: 0, yMax: 13, series: [200, s.N, 1000].filter((v, k, a) => a.indexOf(v) === k).map((N, k) => ({ name: `${N} vòng`, color: ['#38BDF8', '#F59E0B', '#E86A92'][k], dots: true, points: Is.map(I => [I, +(MU0 * N * I / LEN * 1000).toFixed(3)]) })) }
      };
    }
  });
})();
