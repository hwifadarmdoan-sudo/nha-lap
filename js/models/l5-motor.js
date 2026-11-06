// Mô hình Lí 5: động cơ điện một chiều (lực từ F = BIL lên hai cạnh khung, cổ góp đổi chiều dòng điện, vị trí chết, moment theo góc) và quy tắc bàn tay trái.
(function () {
  const vn = (v, d) => (+v).toFixed(d).replace('.', ',');
  const B = 0.5, AREA = 0.002, RES = 4, J = 1.25e-4, FR = 2e-5, SLOW = 20; // T, m², Ω, kg·m², ma sát, chiếu chậm 20 lần
  let s = null;

  function motor(api) {
    const T = api.T, W = 1.2, L = 1.5, RC = 0.36, ZC = 2.3;
    // nam châm
    const mN = api.box(1.2, 3.2, 4.2, api.mat(0xEF4444, { roughness: 0.45 }), [-3.6, 0, 0]), mS = api.box(1.2, 3.2, 4.2, api.mat(0x3B82F6, { roughness: 0.45 }), [3.6, 0, 0]);
    api.textSprite('N', { h: 0.8, pos: [-3.6, 2.2, 0] }); api.textSprite('S', { h: 0.8, pos: [3.6, 2.2, 0] });
    api.part(mN, { name: 'Cực Bắc (N) của nam châm', rows: [['Đường sức', 'Đi ra từ cực N sang cực S'], ['Từ trường giữa hai cực', `Gần như đều, B = ${vn(B, 1)} T`]] });
    api.part(mS, { name: 'Cực Nam (S) của nam châm', rows: [['Đường sức', 'Đi vào cực S']] });
    const fl = api.group(); fl.userData.group = 'field';
    [[1.6, 1.2], [1.6, -1.2], [-1.6, 1.2], [-1.6, -1.2], [0, 1.8], [0, -1.8]].forEach(([y, z]) => {
      const ln = api.lineBetween([-3, y, z], [3, y, z], 0.018, api.mat(0xFDE047, { opacity: 0.45, depthWrite: false }), fl); ln.userData.noPick = true;
      const c = api.mesh(new T.ConeGeometry(0.08, 0.24, 8), api.mat(0xFDE047, { opacity: 0.6 }), [0.9, y, z], fl); c.rotation.z = -Math.PI / 2; c.userData.noPick = true;
    });
    // rotor: khung dây + trục + cổ góp
    const rotor = api.group();
    const turns = () => Math.round(3 + s.N / 50);
    let coil = null;
    const coilM = api.mat(0xD97706, { metalness: 0.6, roughness: 0.35 });
    const buildCoil = () => {
      if (coil) rotor.remove(coil);
      coil = api.group(rotor); const n = turns();
      for (let k = 0; k < n; k++) {
        const o = (k - (n - 1) / 2) * 0.05;
        const p = [[W + o, o * 0.6, -L - o], [W + o, o * 0.6, L + o], [-W - o, o * 0.6, L + o], [-W - o, o * 0.6, -L - o]];
        p.forEach((a, j) => api.lineBetween(a, p[(j + 1) % 4], 0.035, coilM, coil));
      }
      api.part(coil, { name: `Khung dây ${s.N} vòng`, rows: [['Hai cạnh song song với trục', 'Chịu lực từ F = N·B·I·l, hai lực ngược chiều tạo ngẫu lực làm khung quay'], ['Hai cạnh ở đầu khung', 'Song song với đường sức nên lực từ bằng 0']] });
    };
    api.cyl(0.07, 0.07, 6.4, api.mat(0xCBD5E1, { metalness: 0.8 }), [0, 0, 0.6], rotor).rotation.x = Math.PI / 2;
    const half = (start, col) => { const m = api.mesh(new T.CylinderGeometry(RC, RC, 0.6, 24, 1, false, start + 0.12, Math.PI - 0.24), api.mat(col, { metalness: 0.8, roughness: 0.25 }), [0, 0, ZC], rotor); m.rotation.x = Math.PI / 2; return m; };
    const h1 = half(0, 0xB87333), h2 = half(Math.PI, 0xC2410C);
    const comm = api.group(rotor); comm.add(h1); comm.add(h2);
    api.part(comm, { name: 'Cổ góp (vành bán khuyên)', rows: [['Cấu tạo', 'Hai nửa vành đồng cách điện, quay cùng khung dây'], ['Vai trò', 'Cứ mỗi nửa vòng quay lại đổi chiều dòng điện trong khung, để ngẫu lực luôn quay khung theo một chiều']] });
    api.lineBetween([W, 0, L], [RC, 0, ZC], 0.03, coilM, rotor); api.lineBetween([-W, 0, L], [-RC, 0, ZC], 0.03, coilM, rotor);
    // mũi tên dòng điện trên hai cạnh (theo khung)
    const cm = api.mat(0x22D3EE, { emissive: 0x22D3EE, emissiveIntensity: 0.7 });
    const curA = api.mesh(new T.ConeGeometry(0.13, 0.36, 10), cm, [W, 0.2, 0], rotor), curB = api.mesh(new T.ConeGeometry(0.13, 0.36, 10), cm, [-W, 0.2, 0], rotor);
    [curA, curB].forEach(c => { c.userData.noPick = true; c.userData.group = 'cur'; });
    // chổi than + pin
    const brM = api.mat(0x27272A, { roughness: 0.9 });
    const b1 = api.box(0.5, 0.26, 0.4, brM, [RC + 0.25, 0, ZC]), b2 = api.box(0.5, 0.26, 0.4, brM, [-RC - 0.25, 0, ZC]);
    api.part(b1, { name: 'Chổi than', rows: [['Vai trò', 'Đứng yên, tì sát cổ góp để đưa dòng điện từ nguồn vào khung đang quay']] }); api.part(b2, b1.userData.part);
    const bat = api.group(null, [0, -2.6, ZC]);
    api.box(1.6, 0.8, 0.7, api.mat(0x1E293B), [0, 0, 0], bat);
    const batL = api.label('', [1.5, -2.4, ZC], { cls: 'tag', color: '#FDE047' });
    api.part(bat, { name: 'Nguồn một chiều', rows: [['Đổi cực nguồn', 'Dòng điện trong khung đổi chiều nên động cơ quay ngược lại']] });
    const wm = api.mat(0x94A3B8);
    api.lineBetween([RC + 0.5, 0, ZC], [0.6, -2.2, ZC], 0.03, wm); api.lineBetween([-RC - 0.5, 0, ZC], [-0.6, -2.2, ZC], 0.03, wm);
    // mũi tên lực từ (theo không gian, luôn thẳng đứng)
    const arrow = col => { const g = api.group(); const m = api.mat(col, { emissive: col, emissiveIntensity: 0.6 }); const sh = api.cyl(0.06, 0.06, 1, m, [0, 0.5, 0], g); const hd = api.mesh(new T.ConeGeometry(0.16, 0.4, 10), m, [0, 1.15, 0], g); [sh, hd].forEach(o => { o.userData.noPick = true; }); g.userData.group = 'force'; return g; };
    const fA = arrow(0x22C55E), fB = arrow(0x22C55E);
    const fLab = api.label('F', [0, 0, 0], { cls: 'plain', color: '#22C55E' });

    const info = api.note(''), res = api.note('');
    const sw = () => (s.comm ? (Math.cos(s.phi) >= 0 ? 1 : -1) : 1);
    const torque = (I, phi) => s.N * B * AREA * I * Math.cos(phi) * (s.comm ? (Math.cos(phi) >= 0 ? 1 : -1) : 1);
    api.section('⚙️ Động cơ điện một chiều');
    const runBtn = api.button('▶ Đóng mạch', b => { s.on = !s.on; b.textContent = s.on ? '⏸ Ngắt mạch' : '▶ Đóng mạch'; if (s.on && Math.abs(s.w) < 0.05 && Math.abs(Math.cos(s.phi)) < 0.03) api.warn('dead', 'Khung dây đang nằm ở <b>vị trí chết</b>: mặt khung vuông góc với đường sức. Hai lực từ lúc này cùng phương thẳng đứng, ngược chiều và nằm trong mặt phẳng khung nên không tạo moment quay. Đứng yên ở đây thì đóng mạch động cơ cũng không tự khởi động được.<br>Khi đang quay, khung vẫn vượt qua vị trí này nhờ <b>quán tính</b>. Động cơ thật dùng nhiều khung dây đặt lệch nhau để không bao giờ kẹt.', '🤔 Vì sao không quay?'); });
    api.slider({ label: 'Điện áp nguồn U', min: 0, max: 12, step: 1, value: s.U, unit: 'V', onInput(v) { s.U = v; } });
    api.choices({ label: 'Số vòng dây N', items: [50, 100, 200].map(n => ({ t: n + ' vòng', v: n })), value: s.N, onPick(v) { s.N = v; buildCoil(); } });
    api.button('🔁 Đổi cực nguồn', () => { s.pol *= -1; api.toast('Đã đổi cực nguồn: dòng điện trong khung đổi chiều'); });
    api.toggle({ label: 'Có cổ góp', value: true, onChange(v) {
      s.comm = v; h1.visible = h2.visible = true; h2.material.color.set(v ? 0xC2410C : 0xB87333);
      if (!v) api.warn('nocomm', 'Bỏ cổ góp thì dòng điện trong khung luôn chạy một chiều. Khi khung quay quá vị trí chết, ngẫu lực lại kéo nó quay ngược về. Khung chỉ <b>lắc qua lắc lại</b> quanh vị trí chết rồi dừng hẳn.<br>Cổ góp đổi chiều dòng điện đúng lúc khung qua vị trí chết, nên khung quay liên tục một chiều.', '🔧 Thiếu cổ góp');
    } });
    api.button('📍 Đặt khung ở vị trí chết', () => { s.phi = Math.PI / 2; s.w = 0; });
    api.checklist([{ k: 'field', label: 'Đường sức từ' }, { k: 'force', label: 'Lực từ F' }, { k: 'cur', label: 'Chiều dòng điện' }], (k, on) => { if (k === 'force') s.showF = on; else api.groupVis(k, on); });
    buildCoil();

    api.strip({ h: innerHeight < 500 ? 62 : 100, draw(x, w, h) {
      x.clearRect(0, 0, w, h); x.fillStyle = '#0B1220'; x.fillRect(0, 0, w, h);
      const L0 = 60, X = a => L0 + (w - L0 - 16) * a / (2 * Math.PI), mid = h / 2 + 6, A = h / 2 - 16;
      x.strokeStyle = '#334155'; x.lineWidth = 1; x.beginPath(); x.moveTo(L0, mid); x.lineTo(w - 16, mid); x.stroke();
      x.font = `700 ${Math.round(h / 7)}px 'Baloo 2', sans-serif`; x.fillStyle = '#94A3B8';
      [0, 90, 180, 270, 360].forEach(d => x.fillText(d + '°', X(d * Math.PI / 180) - 10, h - 4));
      x.fillText('Moment', 6, mid + 4); x.fillStyle = '#F59E0B'; x.fillText(s.comm ? 'có cổ góp: luôn cùng chiều' : 'không cổ góp: đổi chiều mỗi nửa vòng', L0, 20);
      x.strokeStyle = '#F59E0B'; x.lineWidth = 2; x.beginPath();
      for (let k = 0; k <= 200; k++) { const a = k / 200 * 2 * Math.PI, v = Math.cos(a) * (s.comm ? Math.sign(Math.cos(a)) || 0 : 1) * s.pol; const px = X(a), py = mid - v * A; k ? x.lineTo(px, py) : x.moveTo(px, py); }
      x.stroke();
      const a = ((s.phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), v = Math.cos(a) * (s.comm ? Math.sign(Math.cos(a)) : 1) * s.pol;
      x.fillStyle = '#22C55E'; x.beginPath(); x.arc(X(a), mid - v * A, 5, 0, 7); x.fill();
    } });

    api.onFrame(dt => {
      const sub = 8, h = Math.min(dt, 0.05) / SLOW / sub;
      let I = 0;
      for (let k = 0; k < sub; k++) {
        const c = Math.cos(s.phi) * sw(), e = s.N * B * AREA * s.w * c;
        I = s.on ? (s.pol * s.U - e) / RES : 0;
        const tq = s.N * B * AREA * I * c - FR * s.w - 3e-6 * Math.sign(s.w);
        s.w += tq / J * h; if (!s.on && Math.abs(s.w) < 0.3) s.w *= 0.9;
        s.phi += s.w * h;
      }
      s.I = I; rotor.rotation.z = s.phi;
      const sg = sw() * Math.sign(I || 0), F = s.N * B * Math.abs(I) * 0.05, len = Math.min(2.2, 0.3 + F * 0.9);
      [[fA, 1], [fB, -1]].forEach(([a, k]) => { a.position.set(k * W * Math.cos(s.phi), k * W * Math.sin(s.phi), 0); a.visible = I !== 0 && s.showF; a.scale.set(1, len, 1); a.rotation.z = (k * sg > 0) ? 0 : Math.PI; });
      fLab.pos.set(W * Math.cos(s.phi) + 0.4, W * Math.sin(s.phi) + (sg > 0 ? 1 : -1) * (len + 0.4), 0); fLab.show(I !== 0 && s.showF);
      [curA, curB].forEach((c, k) => { c.rotation.x = ((k ? -1 : 1) * sg > 0) ? Math.PI / 2 : -Math.PI / 2; c.scale.setScalar(I ? 1 : 0.001); });
      const rpm = Math.abs(s.w) * 60 / (2 * Math.PI);
      batL.set(`${s.pol > 0 ? '+ −' : '− +'}  ${s.U} V`);
      info.set(`I = ${vn(Math.abs(I), 2)} A · F mỗi cạnh = N·B·I·l = ${vn(F, 2)} N<br>Moment lúc này: <b>${vn(Math.abs(torque(I, s.phi)) * 1000, 1)} mN·m</b> · tốc độ ${vn(rpm, 0)} vòng/phút<br><span style="opacity:.7">Hình được chiếu chậm ${SLOW} lần</span>`);
      if (!s.comm && s.on) res.set(Math.abs(s.w) < 0.4 ? 'Khung đã dừng ở vị trí chết vì không có cổ góp.' : 'Không có cổ góp: khung lắc qua lắc lại quanh vị trí chết...');
      else if (!s.on) res.set('Bấm Đóng mạch để cho dòng điện chạy qua khung dây.');
      else if (s.comm && s.on && rpm > 50) res.set('Khung quay đều một chiều. Khi khung vuông góc với đường sức, moment bằng 0 nhưng khung vẫn vượt qua nhờ quán tính.');
    });
    void runBtn;
    api.view({ pos: [4.5, 5, 11], target: [0, -0.3, 0.6], min: 4, max: 30 });
  }

  // ---------- quy tắc bàn tay trái ----------
  function leftHand(api) {
    const T = api.T;
    const topM = api.mat(0xEF4444), botM = api.mat(0x3B82F6);
    const top = api.box(4, 0.8, 3, topM, [0, 2.4, 0]), bot = api.box(4, 0.8, 3, botM, [0, -2.4, 0]);
    api.box(4, 5.6, 0.6, api.mat(0x64748B, { metalness: 0.6 }), [0, 0, -1.8]);
    const tTop = api.label('N', [1.6, 3.4, 0], { cls: 'plain', color: '#FFFFFF' }), tBot = api.label('S', [1.6, -3.4, 0], { cls: 'plain', color: '#FFFFFF' });
    api.part(top, { name: 'Cực trên của nam châm chữ U', rows: [['Đổi', 'Bấm "Đảo nam châm" để đổi chỗ hai cực']] }); api.part(bot, top.userData.part);
    const fl = api.group();
    [[-1, -0.8], [0, 0.8], [1, -0.8], [-1, 0.8], [1, 0.8], [0, -0.8]].forEach(([x, z]) => {
      api.lineBetween([x, -2, z], [x, 2, z], 0.02, api.mat(0xFDE047, { opacity: 0.5, depthWrite: false }), fl).userData.noPick = true;
      const c = api.mesh(new T.ConeGeometry(0.1, 0.28, 8), api.mat(0xFDE047), [x, 0.9, z], fl); c.userData.noPick = true; c.userData.arrow = 1;
    });
    const wire = api.group();
    api.cyl(0.09, 0.09, 6, api.mat(0xD97706, { metalness: 0.6 }), [0, 0, 0], wire).rotation.x = Math.PI / 2;
    const cur = [-1.6, 0, 1.6].map(z => { const c = api.mesh(new T.ConeGeometry(0.17, 0.4, 10), api.mat(0x22D3EE, { emissive: 0x22D3EE, emissiveIntensity: 0.7 }), [0, 0, z], wire); c.userData.noPick = true; return c; });
    api.part(wire, { name: 'Đoạn dây dẫn thẳng', rows: [['Đặt', 'Vuông góc với đường sức từ'], ['Khi có dòng điện', 'Chịu lực từ, bị đẩy sang một bên']] });
    const fArr = api.group(); const fm = api.mat(0x22C55E, { emissive: 0x22C55E, emissiveIntensity: 0.6 });
    api.cyl(0.09, 0.09, 1, fm, [0, 0.5, 0], fArr); api.mesh(new T.ConeGeometry(0.26, 0.55, 12), fm, [0, 1.25, 0], fArr); fArr.visible = false;
    const fTxt = api.label('Lực từ F', [0, 0, 0], { cls: 'plain', color: '#22C55E' }); fTxt.show(false);
    const lb = api.label('', [0, 0, 3.4], { cls: 'tag', color: '#22D3EE' });
    let off = 0, target = 0;
    const B = () => s.nTop ? -1 : 1, Fx = () => -s.iz * B();
    const redraw = () => {
      tTop.set(s.nTop ? 'N' : 'S'); tBot.set(s.nTop ? 'S' : 'N'); topM.color.set(s.nTop ? 0xEF4444 : 0x3B82F6); botM.color.set(s.nTop ? 0x3B82F6 : 0xEF4444);
      fl.children.forEach(c => { if (c.userData.arrow) c.rotation.z = s.nTop ? Math.PI : 0; });
      cur.forEach(c => { c.rotation.x = s.iz > 0 ? Math.PI / 2 : -Math.PI / 2; });
      lb.set(s.iz > 0 ? 'Dòng điện chạy RA phía trước' : 'Dòng điện chạy VÀO phía trong'); poles.set(s.nTop ? 'Cực trên: N · đường sức hướng xuống' : 'Cực trên: S · đường sức hướng lên');
      target = 0; off = 0; fArr.visible = false; s.closed = false;
    };
    api.section('✋ Quy tắc bàn tay trái');
    const poles = api.note('');
    api.button('🧲 Đảo nam châm', () => { s.nTop = !s.nTop; redraw(); });
    api.button('↔ Đổi chiều dòng điện', () => { s.iz *= -1; redraw(); });
    api.note('Đoán trước: khi đóng mạch, dây sẽ bị đẩy về phía nào?');
    api.choices({ label: 'Dự đoán của em', items: [{ t: '⬅ Sang trái', v: -1 }, { t: 'Sang phải ➡', v: 1 }], value: 0, onPick(v) { s.guess = v; } });
    const out = api.note('');
    api.button('⚡ Đóng mạch', () => {
      if (!s.guess) { api.toast('Chọn dự đoán trước đã nhé'); return; }
      s.closed = true; target = Fx() * 0.9; fArr.visible = true; fArr.rotation.z = Fx() > 0 ? -Math.PI / 2 : Math.PI / 2; api.beep(660, 0.12, 'square', 0.08);
      const ok = s.guess === Fx(); s.tries++; if (ok) s.right++;
      out.set(`${ok ? '✅ Đúng!' : '❌ Chưa đúng.'} Dây bị đẩy sang <b>${Fx() > 0 ? 'phải' : 'trái'}</b>. Đúng ${s.right}/${s.tries} lần.`);
      if (!ok) api.warn(null, 'Dùng <b>quy tắc bàn tay trái</b>: đặt bàn tay trái sao cho các đường sức từ hướng vào lòng bàn tay, chiều từ cổ tay đến ngón tay giữa là chiều dòng điện. Ngón cái choãi ra 90° chỉ chiều lực từ.<br>Thử lại: đảo nam châm hoặc đổi chiều dòng điện rồi đoán tiếp.', '✋ Xem lại quy tắc');
    });
    api.onFrame(dt => { off += (target - off) * Math.min(1, dt * 6); wire.position.x = off; wire.rotation.z = -off * 0.05; fArr.position.set(off + (Fx() > 0 ? 0.25 : -0.25), 0.9, 0); fTxt.pos.set(off + Fx() * 1.2, 1.5, 0); fTxt.show(fArr.visible); });
    redraw();
    api.view({ pos: [3.5, 3, 10], target: [0, 0, 0], min: 4, max: 25 });
  }

  NL.m3d.register('LM5', {
    title: 'Động cơ điện một chiều',
    tabs: [{ t: '⚙️ Động cơ điện', v: 'motor' }, { t: '✋ Quy tắc bàn tay trái', v: 'hand' }],
    init() { s = { on: false, U: 6, N: 100, pol: 1, comm: true, phi: 0.6, w: 0, I: 0, nTop: true, iz: 1, guess: 0, tries: 0, right: 0, showF: true }; },
    build(api, tab) { if (tab === 'motor') motor(api); else leftHand(api); },
    data() {
      const angs = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360], I0 = s.U / RES;
      const tq = (n, a, c) => { const cs = Math.cos(a * Math.PI / 180); return n * B * AREA * I0 * cs * (c ? (Math.abs(cs) < 1e-9 ? 0 : Math.sign(cs)) : 1) * 1000; };
      return {
        title: 'Moment lực từ lên khung dây theo góc quay', sub: `U = ${s.U} V, R = ${RES} Ω, dòng khởi động I = ${vn(I0, 2)} A, B = ${vn(B, 1)} T, diện tích khung 20 cm². Góc 90° và 270° là vị trí chết.`,
        sheets: [{ name: 'Moment theo góc', head: ['Góc (°)', 'Có cổ góp, 100 vòng (mN·m)', 'Không cổ góp, 100 vòng (mN·m)', 'Có cổ góp, 200 vòng (mN·m)'], rows: angs.map(a => [a, vn(tq(100, a, 1), 1), vn(tq(100, a, 0), 1), vn(tq(200, a, 1), 1)]) }],
        chart: { type: 'line', xLabel: 'Góc quay (°)', yLabel: 'Moment (mN·m)', xMin: 0, xMax: 360, yMin: -Math.ceil(tq(200, 0, 1) / 10) * 10, yMax: Math.ceil(tq(200, 0, 1) / 10) * 10 || 10,
          series: [{ name: 'Có cổ góp, 100 vòng', color: '#F59E0B', dots: true, points: angs.map(a => [a, +tq(100, a, 1).toFixed(2)]) }, { name: 'Không cổ góp, 100 vòng', color: '#38BDF8', dots: true, points: angs.map(a => [a, +tq(100, a, 0).toFixed(2)]) }, { name: 'Có cổ góp, 200 vòng', color: '#E86A92', dots: true, points: angs.map(a => [a, +tq(200, a, 1).toFixed(2)]) }] }
      };
    }
  });
})();
