// Mô hình Lí 5: động cơ điện một chiều (lực từ F = BIL lên hai cạnh khung, cổ góp 2K phiến, chổi than, pin + −, 1–4 khung dây lệch nhau, điểm chết, moment lực tổng theo góc) và quy tắc bàn tay trái với bàn tay 3D.
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
    // phần ứng (rotor): K khung dây lệch nhau 180°/K trên cùng trục, cổ góp 2K phiến
    const rotor = api.group();
    const turns = () => Math.round(3 + s.N / 50);
    const coilM = api.mat(0xD97706, { metalness: 0.6, roughness: 0.35 }), darkM = api.mat(0x1F2937, { metalness: 0.3, roughness: 0.6 });
    const cm = api.mat(0x22D3EE, { emissive: 0x22D3EE, emissiveIntensity: 0.7 });
    const segM = [api.mat(0xB87333, { metalness: 0.8, roughness: 0.25 }), api.mat(0xE0A060, { metalness: 0.8, roughness: 0.25 })];
    let frames = [], arm = null, comm = null;
    const buildArm = () => {
      if (arm) rotor.remove(arm);
      arm = api.group(rotor); frames = []; const n = turns(), K = s.K;
      for (let f = 0; f < K; f++) {
        const fg = api.group(arm); fg.rotation.z = f * Math.PI / K;
        const coil = api.group(fg);
        for (let k = 0; k < n; k++) {
          const o = (k - (n - 1) / 2) * 0.05;
          const p = [[W + o, o * 0.6, -L - o], [W + o, o * 0.6, L + o], [-W - o, o * 0.6, L + o], [-W - o, o * 0.6, -L - o]];
          p.forEach((q, j) => api.lineBetween(q, p[(j + 1) % 4], 0.035, f === 0 && j === 0 && k === n - 1 ? darkM : coilM, coil));
        }
        api.lineBetween([W, 0, L], [RC, 0, ZC], 0.03, coilM, coil); api.lineBetween([-W, 0, L], [-RC, 0, ZC], 0.03, coilM, coil);
        api.part(coil, { name: K > 1 ? `Khung dây số ${f + 1} (${s.N} vòng)` : `Khung dây ${s.N} vòng`, rows: [['Hai cạnh song song với trục', 'Chịu lực từ F = N·B·I·l, hai lực ngược chiều tạo ngẫu lực làm khung quay'], ['Hai cạnh ở đầu khung', 'Song song với đường sức nên lực từ bằng 0'], ['Moment lực của khung', 'M = N·B·I·S·|cos α|, α là góc giữa mặt khung và đường sức'], K > 1 ? ['Lệch nhau', `${vn(180 / K, 0)}° so với khung bên cạnh, nên tổng moment không bao giờ bằng 0`] : ['Một khung', 'Có 2 vị trí chết mỗi vòng (mặt khung vuông góc đường sức)']] });
        // mũi tên dòng điện trên 2 cạnh bên và 2 cạnh đầu khung
        const ar = [[W, 0.2, 0, 'z'], [-W, 0.2, 0, 'z'], [0, 0.2, L, 'x'], [0, 0.2, -L, 'x']].map(([x, y, z, ax]) => { const c = api.mesh(new T.ConeGeometry(0.13, 0.36, 10), cm, [x, y, z], fg); c.userData.noPick = true; c.userData.group = 'cur'; c.userData.ax = ax; return c; });
        frames.push({ g: fg, ar, off: f * Math.PI / K });
      }
      // cổ góp: 2K phiến đồng cách điện, phiến j nối với khung floor(j mod K)
      if (comm) rotor.remove(comm);
      comm = api.group(rotor); comm.position.z = ZC; comm.rotation.x = Math.PI / 2;
      const gap = 0.1, seg = 2 * Math.PI / (2 * K);
      for (let j = 0; j < 2 * K; j++) { const m = api.mesh(new T.CylinderGeometry(RC, RC, 0.6, 24, 1, false, j * seg + gap / 2 - seg / 2, seg - gap), segM[j % 2], [0, 0, 0], comm); m.userData.noPick = false; }
      api.cyl(RC - 0.06, RC - 0.06, 0.62, api.mat(0x111827), [0, 0, 0], comm);
      api.part(comm, { name: `Cổ góp (${2 * K} phiến)`, rows: [['Cấu tạo', `${2 * K} phiến đồng cách điện với nhau, quay cùng khung dây; mỗi khung nối với 2 phiến đối diện`], ['Vai trò', 'Cứ mỗi nửa vòng quay của một khung lại đổi chiều dòng điện trong khung đó, để moment lực luôn quay rotor theo một chiều'], ['Quan sát', 'Khi khung quay qua vị trí thẳng đứng, chổi than đổi sang phiến khác']] });
    };
    api.cyl(0.07, 0.07, 6.4, api.mat(0xCBD5E1, { metalness: 0.8 }), [0, 0, 0.6], rotor).rotation.x = Math.PI / 2;
    // chổi than (đứng yên) tì vào cạnh bên cổ góp, nối nguồn
    const brM = api.mat(0x3F3F46, { roughness: 0.9 });
    const b1 = api.box(0.5, 0.3, 0.42, brM, [RC + 0.25, 0, ZC]), b2 = api.box(0.5, 0.3, 0.42, brM, [-RC - 0.25, 0, ZC]);
    const brInfo = { name: 'Chổi than', rows: [['Vai trò', 'Đứng yên, tì sát cổ góp để đưa dòng điện từ nguồn vào khung đang quay'], ['Hai chổi', 'Một chổi nối cực +, một chổi nối cực − của nguồn']] };
    api.part(b1, brInfo); api.part(b2, brInfo);
    api.label('Chổi than', b1, { off: [1.3, 0.9, 0], cls: 'plain' }); api.label('Cổ góp', [0, 0, ZC], { off: [-1.4, 1.1, 0], cls: 'plain' });
    // pin: cực + đỏ, cực − xanh; dây nối tới hai chổi than
    const bat = api.group(null, [0, -2.7, ZC]);
    const batBody = api.box(2.0, 0.8, 0.7, api.mat(0x1E293B), [0, 0, 0], bat);
    const capP = api.box(0.5, 0.86, 0.76, api.mat(0xEF4444), [0.75, 0, 0], bat), capN = api.box(0.5, 0.86, 0.76, api.mat(0x3B82F6), [-0.75, 0, 0], bat);
    const nubP = api.cyl(0.12, 0.12, 0.2, api.mat(0xE5E7EB, { metalness: 0.7 }), [1.1, 0, 0], bat); nubP.rotation.z = Math.PI / 2;
    const tP = api.textSprite('+', { h: 0.5, pos: [0.75, 0.75, 0], parent: bat }), tN = api.textSprite('−', { h: 0.5, pos: [-0.75, 0.75, 0], parent: bat });
    const batL = api.label('', bat, { off: [0, -0.9, 0], cls: 'tag', color: '#FDE047' });
    api.part(bat, { name: 'Nguồn điện một chiều (pin)', rows: [['Cực +', 'Đầu màu đỏ'], ['Cực −', 'Đầu màu xanh'], ['Dòng điện ngoài mạch', 'Đi từ cực + qua chổi than, cổ góp, khung dây rồi về cực −'], ['Đổi cực nguồn', 'Dòng điện trong khung đổi chiều nên động cơ quay ngược lại']] });
    const wm = api.mat(0xFFF1C9, { roughness: 0.5 });
    const wire = pts => { for (let k = 0; k + 1 < pts.length; k++) api.lineBetween(pts[k], pts[k + 1], 0.03, wm).userData.noPick = true; };
    wire([[RC + 0.5, 0, ZC], [1.6, 0, ZC], [1.6, -2.7, ZC], [1.2, -2.7, ZC]]); wire([[-RC - 0.5, 0, ZC], [-1.6, 0, ZC], [-1.6, -2.7, ZC], [-1.0, -2.7, ZC]]);
    const wArr = [[1.6, -1.2, ZC, 1], [-1.6, -1.2, ZC, -1]].map(([x, y, z, k]) => { const c = api.mesh(new T.ConeGeometry(0.12, 0.34, 10), cm, [x, y, z]); c.userData.noPick = true; c.userData.group = 'cur'; c.userData.k = k; return c; });
    // mũi tên lực từ (theo không gian, luôn thẳng đứng) cho khung số 1
    const arrow = col => { const g = api.group(); const m = api.mat(col, { emissive: col, emissiveIntensity: 0.6 }); const sh = api.cyl(0.06, 0.06, 1, m, [0, 0.5, 0], g); const hd = api.mesh(new T.ConeGeometry(0.16, 0.4, 10), m, [0, 1.15, 0], g); [sh, hd].forEach(o => { o.userData.noPick = true; }); g.userData.group = 'force'; return g; };
    const fA = arrow(0x22C55E), fB = arrow(0x22C55E);
    const fLab = api.label('F', [0, 0, 0], { cls: 'plain', color: '#22C55E' });

    // khung mô tả cố định: ô số liệu riêng, không xê dịch khi số thay đổi
    const info = api.note(`<div class="lm5-stat">
      <div><i>I</i><b data-k="I">0</b><u>A</u></div><div><i>F mỗi cạnh</i><b data-k="F">0</b><u>N</u></div>
      <div><i>Moment lực tổng</i><b data-k="M">0</b><u>mN·m</u></div><div><i>Tốc độ</i><b data-k="n">0</b><u>vòng/phút</u></div>
      <div><i>Góc khung 1</i><b data-k="a">0</b><u>°</u></div><div><i>Số khung</i><b data-k="K">${s.K}</b><u>khung</u></div>
    </div><div class="lm5-msg" data-k="msg"></div><div style="opacity:.7;font-size:11px">F = N·B·I·l · M = Σ N·B·I·S·|cos α| · hình chiếu chậm ${SLOW} lần</div>`);
    const cell = {}; info.el.querySelectorAll('[data-k]').forEach(e => cell[e.dataset.k] = e);
    const setCell = (k, v) => { if (cell[k] && cell[k].textContent !== v) cell[k].textContent = v; };
    const phiK = f => s.phi + f * Math.PI / s.K;
    const sgn = f => (s.comm ? (Math.cos(phiK(f)) >= 0 ? 1 : -1) : 1);
    const torqueAll = (I, phi) => { let M = 0; for (let f = 0; f < s.K; f++) { const c = Math.cos(phi + f * Math.PI / s.K); M += s.N * B * AREA * I * c * (s.comm ? (c >= 0 ? 1 : -1) : 1); } return M; };
    const atDead = () => s.K === 1 && Math.abs(Math.cos(s.phi)) < 0.02;
    api.section('⚙️ Động cơ điện một chiều');
    const runBtn = api.button('▶ Đóng mạch', b => {
      s.on = !s.on; b.textContent = s.on ? '⏸ Ngắt mạch' : '▶ Đóng mạch';
      if (s.on && Math.abs(s.w) < 0.05 && atDead()) api.warn('dead', 'Khung dây đang nằm ở <b>điểm chết</b>: mặt khung vuông góc với đường sức. Hai lực từ lúc này cùng phương thẳng đứng, ngược chiều và nằm trong mặt phẳng khung nên moment lực bằng 0. Đứng yên ở đây thì đóng mạch động cơ cũng không tự khởi động được.<br>Khi đang quay, khung vẫn vượt qua điểm chết nhờ <b>quán tính</b>. Động cơ thật dùng nhiều khung dây đặt lệch nhau (chọn "Số khung dây của phần ứng" từ 2 trở lên) để tự khởi động ở mọi vị trí.', '🤔 Vì sao không quay?');
    });
    api.slider({ label: 'Điện áp nguồn U', min: 0, max: 12, step: 1, value: s.U, unit: 'V', onInput(v) { s.U = v; } });
    api.choices({ label: 'Số khung dây của phần ứng', items: [1, 2, 3, 4].map(n => ({ t: n + ' khung', v: n })), value: s.K, onPick(v) { s.K = v; buildArm(); setCell('K', String(v)); api.toast(v === 1 ? '1 khung: có điểm chết, moment lực có lúc bằng 0' : `${v} khung lệch nhau ${vn(180 / v, 0)}°: tổng moment luôn dương`); } });
    api.choices({ label: 'Số vòng dây N mỗi khung', items: [50, 100, 200].map(n => ({ t: n + ' vòng', v: n })), value: s.N, onPick(v) { s.N = v; buildArm(); } });
    api.button('🔁 Đổi cực nguồn', () => { s.pol *= -1; api.toast('Đã đổi cực nguồn: dòng điện trong khung đổi chiều'); });
    api.toggle({ label: 'Có cổ góp', value: true, onChange(v) {
      s.comm = v; segM[1].color.set(v ? 0xE0A060 : 0xB87333);
      if (!v) api.warn('nocomm', 'Bỏ cổ góp thì dòng điện trong khung luôn chạy một chiều. Khi khung quay quá vị trí thẳng đứng, ngẫu lực lại kéo nó quay ngược về. Khung chỉ <b>lắc qua lắc lại</b> rồi dừng.<br>Cổ góp đổi chiều dòng điện đúng lúc khung qua vị trí thẳng đứng, nên khung quay liên tục một chiều.', '🔧 Thiếu cổ góp');
    } });
    api.button('📍 Đặt khung ở điểm chết (1 khung)', () => { s.K = 1; buildArm(); setCell('K', '1'); s.phi = Math.PI / 2; s.w = 0; api.toast('Khung đứng yên vuông góc với đường sức. Thử đóng mạch xem sao'); });
    api.checklist([{ k: 'field', label: 'Đường sức từ' }, { k: 'force', label: 'Lực từ F (khung 1)' }, { k: 'cur', label: 'Chiều dòng điện' }], (k, on) => { if (k === 'force') s.showF = on; else api.groupVis(k, on); });
    buildArm();

    api.strip({ h: innerHeight < 500 ? 62 : 100, draw(x, w, h) {
      x.clearRect(0, 0, w, h); x.fillStyle = '#0B1220'; x.fillRect(0, 0, w, h);
      const L0 = 60, X = a => L0 + (w - L0 - 16) * a / (2 * Math.PI), mid = h / 2 + 6, A = h / 2 - 16, K = s.K;
      const tot = a => { let m = 0; for (let f = 0; f < K; f++) { const c = Math.cos(a + f * Math.PI / K); m += c * (s.comm ? (c >= 0 ? 1 : -1) : 1); } return m / K; };
      x.strokeStyle = '#334155'; x.lineWidth = 1; x.beginPath(); x.moveTo(L0, mid); x.lineTo(w - 16, mid); x.stroke();
      x.font = `700 ${Math.round(h / 7)}px 'Baloo 2', sans-serif`; x.fillStyle = '#94A3B8';
      [0, 90, 180, 270, 360].forEach(d => x.fillText(d + '°', X(d * Math.PI / 180) - 10, h - 4));
      x.fillText('M', 6, mid + 4); x.fillStyle = '#F59E0B'; x.fillText(`${K} khung · ` + (s.comm ? (K === 1 ? 'có cổ góp: luôn cùng chiều, bằng 0 ở 90° và 270°' : 'có cổ góp: tổng moment lực luôn dương') : 'không cổ góp: đổi chiều mỗi nửa vòng'), L0, 20);
      x.strokeStyle = '#F59E0B'; x.lineWidth = 2; x.beginPath();
      for (let k = 0; k <= 200; k++) { const a = k / 200 * 2 * Math.PI, v = tot(a) * s.pol; const px = X(a), py = mid - v * A; k ? x.lineTo(px, py) : x.moveTo(px, py); }
      x.stroke();
      const a = ((s.phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), v = tot(a) * s.pol;
      x.fillStyle = '#22C55E'; x.beginPath(); x.arc(X(a), mid - v * A, 5, 0, 7); x.fill();
    } });

    api.onFrame(dt => {
      const sub = 8, h = Math.min(dt, 0.05) / SLOW / sub;
      let I = 0;
      for (let k = 0; k < sub; k++) {
        let e = 0, c1 = 0; for (let f = 0; f < s.K; f++) { const c = Math.cos(phiK(f)) * sgn(f); e += s.N * B * AREA * s.w * c; if (!f) c1 = c; }
        I = s.on ? (s.pol * s.U - e) / RES : 0;
        const tq = torqueAll(I, s.phi) - FR * s.w - 3e-6 * Math.sign(s.w);
        s.w += tq / J * h; if (!s.on && Math.abs(s.w) < 0.3) s.w *= 0.9;
        s.phi += s.w * h;
      }
      s.I = I; rotor.rotation.z = s.phi;
      const c1 = Math.cos(s.phi) * sgn(0), sg = c1 >= 0 ? Math.sign(I || 0) : -Math.sign(I || 0);
      const F = s.N * B * Math.abs(I) * 0.05, len = Math.min(2.2, 0.3 + F * 0.9);
      [[fA, 1], [fB, -1]].forEach(([a, k]) => { a.position.set(k * W * Math.cos(s.phi), k * W * Math.sin(s.phi), 0); a.visible = I !== 0 && s.showF; a.scale.set(1, len, 1); a.rotation.z = (k * sg > 0) ? 0 : Math.PI; });
      fLab.pos.set(W * Math.cos(s.phi) + 0.4, W * Math.sin(s.phi) + (sg > 0 ? 1 : -1) * (len + 0.4), 0); fLab.show(I !== 0 && s.showF);
      // chiều dòng điện trong từng khung (đổi khi cổ góp đổi phiến) và trên dây ngoài
      frames.forEach((fr, f) => {
        const d = sgn(f) * Math.sign(I || 0);
        fr.ar.forEach((c, j) => {
          if (c.userData.ax === 'z') c.rotation.x = ((j ? -1 : 1) * d > 0) ? Math.PI / 2 : -Math.PI / 2;
          else { c.rotation.x = 0; c.rotation.z = ((j === 2 ? -1 : 1) * d > 0) ? Math.PI / 2 : -Math.PI / 2; }
          c.scale.setScalar(I ? 1 : 0.001);
        });
      });
      wArr.forEach(c => { const up = c.userData.k * s.pol > 0; c.rotation.z = up ? 0 : Math.PI; c.scale.setScalar(I ? 1 : 0.001); });
      const rpm = Math.abs(s.w) * 60 / (2 * Math.PI);
      const plus = s.pol > 0; capP.material.color.set(plus ? 0xEF4444 : 0x3B82F6); capN.material.color.set(plus ? 0x3B82F6 : 0xEF4444); tP.position.x = plus ? 0.75 : -0.75; tN.position.x = plus ? -0.75 : 0.75;
      batL.set(`Pin ${s.U} V · ${plus ? 'cực + bên phải' : 'cực + bên trái'}`);
      setCell('I', vn(Math.abs(I), 2)); setCell('F', vn(F, 2)); setCell('M', vn(Math.abs(torqueAll(I, s.phi)) * 1000, 1)); setCell('n', vn(rpm, 0)); setCell('a', vn(((s.phi * 180 / Math.PI) % 360 + 360) % 360, 0));
      let msg;
      if (!s.on) msg = 'Bấm Đóng mạch để cho dòng điện chạy qua khung dây.';
      else if (s.K === 1 && atDead() && Math.abs(s.w) < 0.05) msg = 'Điểm chết: moment lực bằng 0, động cơ không tự khởi động được.';
      else if (!s.comm) msg = Math.abs(s.w) < 0.4 ? 'Không có cổ góp: khung đã dừng ở vị trí thẳng đứng.' : 'Không có cổ góp: khung lắc qua lắc lại rồi dừng...';
      else if (s.K === 1) msg = 'Một khung: moment lực bằng 0 ở điểm chết nhưng khung vẫn vượt qua nhờ quán tính, nên tốc độ dao động theo vòng.';
      else msg = `${s.K} khung lệch nhau: tổng moment lực luôn dương, rotor quay đều và tự khởi động ở mọi vị trí.`;
      setCell('msg', msg);
    });
    void runBtn; void batBody;
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
    api.part(wire, { name: 'Đoạn dây dẫn thẳng', rows: [['Đặt', 'Vuông góc với đường sức từ (hoặc song song để thử F = 0)'], ['Khi có dòng điện', 'Chịu lực từ F = B·I·l·sin α, bị đẩy sang một bên']] });
    const fArr = api.group(); const fm = api.mat(0x22C55E, { emissive: 0x22C55E, emissiveIntensity: 0.6 });
    api.cyl(0.09, 0.09, 1, fm, [0, 0.5, 0], fArr); api.mesh(new T.ConeGeometry(0.26, 0.55, 12), fm, [0, 1.25, 0], fArr); fArr.visible = false;
    const fTxt = api.label('Lực từ F', [0, 0, 0], { cls: 'plain', color: '#22C55E' }); fTxt.show(false);
    const lb = api.label('', [0, 0, 3.4], { cls: 'tag', color: '#22D3EE' });
    // bàn tay trái 3D: lòng bàn tay hứng đường sức, bốn ngón chỉ chiều I, ngón cái choãi 90° chỉ chiều F
    const SKIN = 0xF1C9A5, skin = api.mat(SKIN, { roughness: 0.75 });
    const hand = api.group(null, [0, 0, 4.4]); hand.scale.setScalar(0.78); hand.userData.group = 'hand';
    const hb = api.group(hand); // toạ độ địa phương: +X ngón cái (F), +Z ngón tay (I), +Y mặt lòng bàn tay (B đâm vào theo −Y)
    const palm = api.mesh(new T.BoxGeometry(1.5, 0.34, 1.6, 1, 1, 1), skin, [0, 0, 0], hb);
    [-0.52, -0.18, 0.17, 0.52].forEach((x, k) => { const len = [1.15, 1.35, 1.3, 1.05][k]; const f = api.mesh(new T.CapsuleGeometry(0.16, len, 4, 12), skin, [x, 0, 0.8 + len / 2], hb); f.rotation.x = Math.PI / 2; });
    const thumb = api.mesh(new T.CapsuleGeometry(0.19, 1.0, 4, 12), skin, [0.75 + 0.5, 0.05, -0.35], hb); thumb.rotation.z = Math.PI / 2;
    const wrist = api.mesh(new T.CylinderGeometry(0.42, 0.46, 1.3, 16), skin, [0, 0, -1.4], hb); wrist.rotation.x = Math.PI / 2;
    const bIn = api.group(hb); // 3 mũi tên B đâm vào lòng bàn tay
    [[-0.45, 0.3], [0.1, -0.2], [0.45, 0.55]].forEach(([x, z]) => { api.cyl(0.025, 0.025, 1.1, api.mat(0xFDE047), [x, 1.0, z], bIn); const c = api.mesh(new T.ConeGeometry(0.09, 0.26, 8), api.mat(0xFDE047), [x, 0.4, z], bIn); c.rotation.z = Math.PI; });
    bIn.traverse(o => o.userData.noPick = true);
    api.part(hand, { name: 'Bàn tay trái (quy tắc bàn tay trái)', rows: [['Lòng bàn tay', 'Hứng các đường sức từ (B đâm vào lòng bàn tay)'], ['Chiều từ cổ tay đến ngón giữa', 'Chiều dòng điện I'], ['Ngón cái choãi ra 90°', 'Chiều lực từ F'], ['Nếu I song song B', 'F = 0, không áp dụng quy tắc']] });
    const lF = api.label('Ngón cái → F', thumb, { cls: 'plain', color: '#22C55E', off: [1.0, 0.5, 0] }), lI = api.label('Ngón giữa → I', [0, 0, 2.3], { cls: 'plain', color: '#22D3EE', parent: hb }), lB = api.label('B đâm vào lòng bàn tay', [0, 1.3, 0], { cls: 'plain', color: '#FDE047', parent: hb });
    const fZero = api.label('F = 0', [0, 1.2, 4.4], { cls: 'tag', color: '#F97316' }); fZero.show(false);
    let off = 0, target = 0, qTarget = new T.Quaternion(), qFrom = new T.Quaternion(), qT = 1;
    const B = () => s.nTop ? -1 : 1, Fx = () => -s.iz * B();
    const aimHand = () => {
      const par = s.par; // dây song song đường sức: không có lực
      hand.visible = s.showHand && !par; fZero.show(par);
      if (par) return;
      const F = new T.Vector3(Fx(), 0, 0), I = new T.Vector3(0, 0, s.iz), Y = I.clone().cross(F); // Y = I × F = −B
      const m = new T.Matrix4().makeBasis(F, Y, I);
      qFrom.copy(hb.quaternion); qTarget.setFromRotationMatrix(m); qT = 0;
    };
    const redraw = () => {
      tTop.set(s.nTop ? 'N' : 'S'); tBot.set(s.nTop ? 'S' : 'N'); topM.color.set(s.nTop ? 0xEF4444 : 0x3B82F6); botM.color.set(s.nTop ? 0x3B82F6 : 0xEF4444);
      fl.children.forEach(c => { if (c.userData.arrow) c.rotation.z = s.nTop ? Math.PI : 0; });
      cur.forEach(c => { c.rotation.x = s.iz > 0 ? Math.PI / 2 : -Math.PI / 2; });
      wire.rotation.x = s.par ? Math.PI / 2 : 0;
      lb.set(s.par ? 'Dây đặt song song với đường sức: F = 0' : s.iz > 0 ? 'Dòng điện chạy RA phía trước' : 'Dòng điện chạy VÀO phía trong'); poles.set(s.nTop ? 'Cực trên: N · đường sức hướng xuống' : 'Cực trên: S · đường sức hướng lên');
      target = 0; off = 0; fArr.visible = false; s.closed = false; aimHand();
    };
    api.section('✋ Quy tắc bàn tay trái');
    const poles = api.note('');
    api.button('🧲 Đảo nam châm', () => { s.nTop = !s.nTop; redraw(); });
    api.button('↔ Đổi chiều dòng điện', () => { s.iz *= -1; redraw(); });
    api.choices({ label: 'Hướng dây dẫn', items: [{ t: '⟂ Vuông góc đường sức', v: 0 }, { t: '∥ Song song đường sức', v: 1 }], value: 0, onPick(v) { s.par = !!v; redraw(); if (v) api.toast('I song song B: lực từ bằng 0, không cần quy tắc bàn tay'); } });
    api.toggle({ label: '✋ Hiện bàn tay trái', value: s.showHand, onChange(v) { s.showHand = v; aimHand(); } });
    api.note('Đoán trước: khi đóng mạch, dây sẽ bị đẩy về phía nào?');
    api.choices({ label: 'Dự đoán của em', items: [{ t: '⬅ Sang trái', v: -1 }, { t: 'Sang phải ➡', v: 1 }, { t: 'Không bị đẩy', v: 9 }], value: 0, onPick(v) { s.guess = v; } });
    const out = api.note('');
    api.button('⚡ Đóng mạch', () => {
      if (!s.guess) { api.toast('Chọn dự đoán trước đã nhé'); return; }
      const ans = s.par ? 9 : Fx();
      s.closed = true; target = s.par ? 0 : Fx() * 0.9; fArr.visible = !s.par; fArr.rotation.z = Fx() > 0 ? -Math.PI / 2 : Math.PI / 2; api.beep(660, 0.12, 'square', 0.08);
      const ok = s.guess === ans; s.tries++; if (ok) s.right++;
      out.set(`${ok ? '✅ Đúng!' : '❌ Chưa đúng.'} ${s.par ? 'Dây song song đường sức nên <b>F = 0</b>, dây đứng yên.' : `Dây bị đẩy sang <b>${Fx() > 0 ? 'phải' : 'trái'}</b>.`} Đúng ${s.right}/${s.tries} lần.`);
      if (!ok) api.warn(null, 'Dùng <b>quy tắc bàn tay trái</b>: đặt bàn tay trái sao cho các đường sức từ hướng vào lòng bàn tay, chiều từ cổ tay đến ngón tay giữa là chiều dòng điện. Ngón cái choãi ra 90° chỉ chiều lực từ.<br>Bật "Hiện bàn tay trái" để xem bàn tay tự xoay theo B và I, rồi thử lại.', '✋ Xem lại quy tắc');
    });
    api.onFrame(dt => {
      off += (target - off) * Math.min(1, dt * 6); wire.position.x = off; wire.rotation.z = -off * 0.05; fArr.position.set(off + (Fx() > 0 ? 0.25 : -0.25), 0.9, 0); fTxt.pos.set(off + Fx() * 1.2, 1.5, 0); fTxt.show(fArr.visible);
      if (qT < 1) { qT = Math.min(1, qT + dt / 0.5); hb.quaternion.slerpQuaternions(qFrom, qTarget, qT < 1 ? qT * qT * (3 - 2 * qT) : 1); }
    });
    redraw(); hb.quaternion.copy(qTarget); qT = 1;
    void palm; void lF; void lI; void lB;
    api.view({ pos: [3.5, 3, 11], target: [0, 0, 1], min: 4, max: 25 });
  }

  NL.m3d.register('LM5', {
    title: 'Động cơ điện một chiều',
    tabs: [{ t: '⚙️ Động cơ điện', v: 'motor' }, { t: '✋ Quy tắc bàn tay trái', v: 'hand' }],
    init() { s = { on: false, U: 6, N: 100, K: 2, pol: 1, comm: true, phi: 0.6, w: 0, I: 0, nTop: true, iz: 1, par: false, showHand: true, guess: 0, tries: 0, right: 0, showF: true }; },
    build(api, tab) { if (tab === 'motor') motor(api); else leftHand(api); },
    data() {
      const angs = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345, 360], I0 = s.U / RES;
      const tq = (n, a, c, K) => { let m = 0; for (let f = 0; f < (K || 1); f++) { const cs = Math.cos((a + f * 180 / (K || 1)) * Math.PI / 180); m += cs * (c ? (Math.abs(cs) < 1e-9 ? 0 : Math.sign(cs)) : 1); } return n * B * AREA * I0 * m * 1000; };
      return {
        title: 'Moment lực tổng của phần ứng theo góc quay', sub: `U = ${s.U} V, R = ${RES} Ω, dòng khởi động I = ${vn(I0, 2)} A, B = ${vn(B, 1)} T, mỗi khung N = ${s.N} vòng, S = 20 cm². M = Σ N·B·I·S·|cos α|. Với 1 khung, 90° và 270° là điểm chết.`,
        sheets: [{ name: 'Moment lực theo góc', head: ['Góc khung 1 (°)', '1 khung, có cổ góp (mN·m)', '1 khung, không cổ góp (mN·m)', '2 khung (mN·m)', '3 khung (mN·m)', '4 khung (mN·m)'], rows: angs.map(a => [a, vn(tq(s.N, a, 1, 1), 1), vn(tq(s.N, a, 0, 1), 1), vn(tq(s.N, a, 1, 2), 1), vn(tq(s.N, a, 1, 3), 1), vn(tq(s.N, a, 1, 4), 1)]) }],
        chart: { type: 'line', xLabel: 'Góc quay của khung 1 (°)', yLabel: 'Moment lực (mN·m)', xMin: 0, xMax: 360, yMin: -Math.ceil(tq(s.N, 0, 1, 1) / 10) * 10, yMax: Math.ceil(tq(s.N, 0, 1, 4) / 10) * 10 || 10,
          series: [{ name: '1 khung, có cổ góp', color: '#F59E0B', dots: true, points: angs.map(a => [a, +tq(s.N, a, 1, 1).toFixed(2)]) }, { name: '1 khung, không cổ góp', color: '#38BDF8', dots: true, points: angs.map(a => [a, +tq(s.N, a, 0, 1).toFixed(2)]) }, { name: '2 khung', color: '#E86A92', dots: true, points: angs.map(a => [a, +tq(s.N, a, 1, 2).toFixed(2)]) }, { name: '4 khung', color: '#22C55E', dots: true, points: angs.map(a => [a, +tq(s.N, a, 1, 4).toFixed(2)]) }] }
      };
    }
  });
})();
