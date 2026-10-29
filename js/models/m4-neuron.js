// Mô hình 4: Neuron, truyền xung trên sợi trục (có / không bao myelin), synapse hóa học 6 bước, 4 cấp độ, độc tố TTX và chất ức chế AChE.
(function () {
  const PINK = 0xF0B3CF, MYE = 0xF7EED2, YEL = 0xFFD84A, CA = 0xFF9A3C, ACH = 0x3FD07F, NA = 0xFFE066, K = 0xB07CFF, ENZ = 0x8E5BD6;
  const POT = ['Điện thế nghỉ', '−70 mV'], APV = ['Điện thế hoạt động', '+30 mV'];
  const INFO = {
    brain: { name: 'Não bộ', sci: 'Encephalon (Brain)', rows: [['Thuộc', 'Thần kinh trung ương'], ['Số neuron', '≈ 86 tỉ'], ['Chức năng', 'Tiếp nhận, xử lí thông tin và ra lệnh điều khiển']] },
    cord: { name: 'Tủy sống', sci: 'Medulla spinalis (Spinal cord)', rows: [['Thuộc', 'Thần kinh trung ương'], ['Chức năng', 'Trung khu phản xạ không điều kiện; dẫn truyền xung giữa não và cơ thể']] },
    nerve: { name: 'Dây thần kinh ngoại biên', sci: 'Peripheral nerve', rows: [['Cấu tạo', 'Bó gồm rất nhiều sợi trục của neuron'], ['Chức năng', 'Dẫn xung cảm giác về trung ương và xung vận động ra cơ quan']] },
    soma: { name: 'Thân neuron', sci: 'Soma (Cell body)', rows: [['Chứa', 'Nhân, thể Nissl (lưới nội chất hạt), ti thể'], ['Chức năng', 'Tổng hợp protein, chất dẫn truyền; tổng hợp tín hiệu từ sợi nhánh'], POT, APV] },
    nucleus: { name: 'Nhân neuron', sci: 'Nucleus', rows: [['Chức năng', 'Chứa DNA, điều khiển hoạt động của neuron'], ['Lưu ý', 'Neuron trưởng thành hầu như không phân chia']] },
    nissl: { name: 'Thể Nissl', sci: 'Nissl bodies', rows: [['Bản chất', 'Cụm lưới nội chất hạt và ribosome'], ['Chức năng', 'Tổng hợp protein cho neuron']] },
    dend: { name: 'Sợi nhánh', sci: 'Dendrites', rows: [['Chức năng', 'Tiếp nhận tín hiệu từ neuron khác truyền về thân neuron'], ['Đặc điểm', 'Ngắn, phân nhánh nhiều, có nhiều thụ thể']] },
    hill: { name: 'Gò sợi trục', sci: 'Axon hillock', rows: [['Vai trò', 'Nơi tổng hợp tín hiệu; nếu đạt ngưỡng −55 mV thì phát sinh điện thế hoạt động'], ['Đặc điểm', 'Rất nhiều kênh Na⁺ cảm ứng điện thế']] },
    axon: { name: 'Sợi trục', sci: 'Axon', rows: [['Chức năng', 'Dẫn xung thần kinh từ thân neuron đến chùy synapse'], ['Chiều dài', 'Từ vài µm đến hơn 1 m'], POT, APV] },
    myelin: { name: 'Bao myelin', sci: 'Myelin sheath (tế bào Schwann)', rows: [['Bản chất', 'Nhiều lớp màng tế bào Schwann quấn quanh sợi trục, giàu lipid'], ['Vai trò', 'Cách điện, giúp xung lan truyền nhảy vọt nên rất nhanh (100–120 m/s)']] },
    node: { name: 'Eo Ranvier', sci: 'Node of Ranvier', rows: [['Vị trí', 'Khoảng hở giữa 2 tế bào Schwann, dài ≈ 1 µm'], ['Đặc điểm', 'Tập trung dày đặc kênh Na⁺, K⁺ cảm ứng điện thế'], ['Vai trò', 'Nơi duy nhất xảy ra mất phân cực trên sợi có bao myelin'], POT, APV] },
    term: { name: 'Chùy synapse', sci: 'Synaptic terminal (bouton)', rows: [['Chứa', 'Bóng chứa chất dẫn truyền (acetylcholine), ti thể'], ['Chức năng', 'Chuyển tín hiệu điện thành tín hiệu hóa học']] },
    pre: { name: 'Chùy màng trước synapse', sci: 'Pre-synaptic terminal', rows: [['Trên màng có', 'Kênh Ca²⁺ cảm ứng điện thế'], ['Bên trong', 'Bóng chứa acetylcholine, ti thể cung cấp ATP'], POT] },
    ves: { name: 'Bóng chứa chất dẫn truyền', sci: 'Synaptic vesicle', rows: [['Chứa', 'Hàng nghìn phân tử acetylcholine (ACh)'], ['Giải phóng', 'Hòa màng trước, xuất bào khi Ca²⁺ tràn vào']] },
    mito: { name: 'Ti thể', sci: 'Mitochondrion', rows: [['Vai trò', 'Cung cấp ATP để tái tổng hợp acetylcholine và vận chuyển bóng chứa']] },
    cach: { name: 'Kênh Ca²⁺ cảm ứng điện thế', sci: 'Voltage-gated Ca²⁺ channel', rows: [['Vị trí', 'Màng chùy trước synapse'], ['Mở khi', 'Xung điện đến làm màng mất phân cực'], ['Kết quả', 'Ca²⁺ tràn vào, kích thích bóng chứa hòa màng']] },
    cleft: { name: 'Khe synapse', sci: 'Synaptic cleft', rows: [['Độ rộng', '20 – 30 nm'], ['Chứa', 'Dịch ngoại bào, enzyme acetylcholinesterase'], ['Vai trò', 'Nơi ACh khuếch tán từ màng trước sang màng sau']] },
    post: { name: 'Màng sau synapse', sci: 'Post-synaptic membrane', rows: [['Trên màng có', 'Thụ thể đặc hiệu gắn với kênh Na⁺ (kênh cảm ứng ligand)'], ['Kết quả', 'Na⁺ tràn vào, xuất hiện điện thế hoạt động mới'], POT, APV] },
    rec: { name: 'Thụ thể ACh – kênh Na⁺', sci: 'Nicotinic acetylcholine receptor', rows: [['Cấu tạo', '5 tiểu phần protein xếp quanh một lỗ kênh'], ['Hoạt động', '2 phân tử ACh gắn vào 2 tiểu phần α làm protein đổi cấu hình, mở cổng cho Na⁺ đi vào'], ['Loại kênh', 'Kênh cảm ứng ligand (hóa học)']] },
    ache: { name: 'Enzyme acetylcholinesterase', sci: 'Acetylcholinesterase (AChE)', rows: [['Vị trí', 'Khe synapse, sát màng sau'], ['Chức năng', 'Phân hủy ACh thành acetate và choline; choline được màng trước thu hồi để tái tổng hợp ACh'], ['Ý nghĩa', 'Giúp màng sau trở về trạng thái nghỉ']] },
    nach: { name: 'Kênh Na⁺ cảm ứng điện thế', sci: 'Voltage-gated Na⁺ channel', rows: [['Mở khi', 'Màng đạt ngưỡng −55 mV'], ['Kết quả', 'Na⁺ tràn vào gây mất phân cực, đảo cực lên +30 mV'], ['Bị khóa bởi', 'Tetrodotoxin (TTX) của cá nóc']] },
    kch: { name: 'Kênh K⁺ cảm ứng điện thế', sci: 'Voltage-gated K⁺ channel', rows: [['Mở khi', 'Màng đảo cực (≈ +30 mV)'], ['Kết quả', 'K⁺ đi ra ngoài gây tái phân cực, rồi ưu phân cực (≈ −80 mV)']] },
    mem: { name: 'Màng sinh chất', sci: 'Phospholipid bilayer', rows: [['Cấu tạo', 'Lớp kép phospholipid, đầu ưa nước quay ra ngoài'], ['Tính thấm', 'Ion không tự đi qua được, phải qua kênh protein']] }
  };
  const WARN_TTX = 'Cảnh báo sinh học: Độc tố Tetrodotoxin khóa hoàn toàn kênh Na⁺ cảm ứng điện thế, ngăn cản dòng Na⁺ đi vào màng sợi trục, làm cho neuron không thể khởi tạo điện thế hoạt động, dẫn đến ngưng trệ toàn bộ hệ thống truyền tin thần kinh!';
  const WARN_ACHE = 'Cảnh báo sinh học: Enzyme acetylcholinesterase bị ức chế nên acetylcholine không bị phân hủy, đọng lại liên tục trong khe synapse. Màng sau bị kích thích liên tục, không trở về điện thế nghỉ, cơ co cứng rồi liệt. Đây là cơ chế gây độc của thuốc trừ sâu lân hữu cơ và khí độc thần kinh!';
  const STEPS = [
    'Xung điện thế hoạt động lan truyền đến chùy màng trước, làm thay đổi điện thế màng.',
    'Kênh Ca²⁺ cảm ứng điện thế mở, Ca²⁺ tràn từ dịch ngoại bào vào chùy màng trước.',
    'Ca²⁺ làm bóng chứa di chuyển đến hòa màng trước, giải phóng acetylcholine vào khe synapse (xuất bào).',
    'Acetylcholine khuếch tán qua khe synapse (20 – 30 nm), gắn vào thụ thể đặc hiệu ở màng sau.',
    'Kênh Na⁺ ở màng sau mở, Na⁺ tràn vào làm xuất hiện điện thế hoạt động mới và lan truyền đi.',
    'Acetylcholinesterase phân hủy acetylcholine thành acetate và choline; màng trước thu hồi choline để tái tổng hợp, màng sau trở về nghỉ.'
  ];

  let lv = 1, myelin = true, freq = 5, ttx = false, ache = false, lastPass = -99, vPost = -70, synAuto = true;
  const interval = () => 4 / Math.sqrt(freq);
  const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const lerp = (a, b, t) => a + (b - a) * t;
  // điện thế hoạt động theo ms (−70 → ngưỡng −55 → +30 → −80 → −70)
  function ap(t) {
    if (t < 0 || t > 5) return -70;
    if (t < 0.5) return -70 + 15 * (t / 0.5);
    if (t < 1) return -55 + 85 * sm((t - 0.5) / 0.5);
    if (t < 2) return 30 - 110 * sm(t - 1);
    if (t < 4) return -80 + 10 * sm((t - 2) / 2);
    return -70;
  }
  function phase(t) {
    if (t < 0 || t >= 4) return 'Điện thế nghỉ';
    if (t < 0.5) return 'Mất phân cực (đến ngưỡng)';
    const v = ap(t);
    if (t < 1) return v > 0 ? 'Đảo cực' : 'Mất phân cực';
    if (v > -70 && t < 2) return v > 0 ? 'Đảo cực' : 'Tái phân cực';
    return 'Ưu phân cực';
  }
  const velText = () => myelin ? '100 – 120 m/s (nhảy vọt)' : '1 – 2 m/s (liên tục)';
  // vật liệu phát sáng
  const glowMat = (api, c, op) => api.mat(c, { emissive: c, emissiveIntensity: 0, opacity: op == null ? 1 : op });

  // ---------- dải đồ thị điện thế ----------
  function apStrip(api, post) {
    let x = 0, prev = null;
    api.strip({
      h: 110, draw(c, W, H, tt, dt) {
        const steps = Math.max(1, Math.round(dt * W / 5));
        const Y = v => H * 0.9 - (v + 90) / 130 * H * 0.78;
        const light = api.el.classList.contains('light');
        for (let k = 0; k < steps; k++) {
          const now = tt - dt + dt * (k + 1) / steps;
          const v = post ? vPost : (ttx ? -70 : ap((now - lastPass) * 10));
          c.fillStyle = light ? '#FFFFFF' : '#08121E'; c.fillRect(x, 0, 8, H);
          c.fillStyle = 'rgba(120,160,200,.5)'; if (x % 10 < 5) { c.fillRect(x, Y(-70), 1, 2); c.fillRect(x, Y(30), 1, 2); }
          const y = Y(v);
          c.strokeStyle = post ? '#FF8AD0' : '#FFD84A'; c.lineWidth = 3;
          if (prev !== null) { c.beginPath(); c.moveTo(x - 1, prev); c.lineTo(x, y); c.stroke(); }
          prev = y; x++; if (x >= W) { x = 0; prev = null; }
        }
        const t = (tt - lastPass) * 10;
        c.fillStyle = 'rgba(8,18,30,.78)'; c.fillRect(6, 4, 760, 38);
        c.font = "800 30px 'Baloo 2'"; c.fillStyle = post ? '#FF8AD0' : '#FFD84A';
        c.fillText(post ? `Màng sau synapse · ${Math.round(vPost)} mV` : (ttx ? 'Sợi trục · TTX: không có điện thế hoạt động' : `Eo Ranvier số 5 · ${Math.round(ap(t))} mV · ${phase(t)}`), 12, 32);
        c.font = "700 18px 'Baloo 2'"; c.fillStyle = '#8FB3D6'; c.fillText('+30', W - 46, Y(30) - 4); c.fillText('−70', W - 46, Y(-70) - 4);
      }
    });
  }
  // nhịp phát xung chung cho các cấp không có sợi trục chạy hạt
  function pulseClock(api, fire) {
    let acc = interval() * 0.7;
    api.onFrame(dt => { acc += dt; if (acc >= interval()) { acc = 0; fire(api.time); } });
  }

  // ---------- Cấp 1: hệ thần kinh ----------
  function buildSystem(api) {
    const T = api.T, V = api.V;
    const body = api.mesh(new T.CapsuleGeometry(2.2, 6, 8, 24), api.mat(0x9FC3E6, { opacity: 0.08, depthWrite: false }), [0, 1, 0]); body.userData.noPick = true;
    const head = api.sphere(2.1, api.mat(0x9FC3E6, { opacity: 0.08, depthWrite: false }), [0, 6.6, 0]); head.userData.noPick = true;
    const br = api.group(null, [0, 6.7, 0]);
    [-1, 1].forEach(s => { const h = api.sphere(1, glowMat(api, 0xF29BB8), [s * 0.62, 0, 0], br, 32); h.scale.set(0.82, 0.95, 1.35); });
    const cb = api.sphere(0.6, 0xE07FA0, [0, -0.75, -0.95], br); cb.scale.set(1.3, 0.7, 0.8);
    api.part(br, INFO.brain);
    const cord = api.tube([[0, 5.8, -0.6], [0, 3, -0.9], [0, 0, -0.9], [0, -2.4, -0.7]], 0.22, glowMat(api, 0xF6C35A)); api.part(cord, INFO.cord);
    const nv = api.group();
    const paths = [
      [[0, 3.4, -0.9], [1.6, 3.6, -0.4], [3.2, 2.4, 0], [3.8, -0.2, 0.2], [4.1, -2.6, 0.4]],
      [[0, 3.4, -0.9], [-1.6, 3.6, -0.4], [-3.2, 2.4, 0], [-3.8, -0.2, 0.2], [-4.1, -2.6, 0.4]],
      [[0, -2.3, -0.7], [0.9, -3.6, -0.3], [1.3, -6, 0], [1.4, -8.4, 0.3]],
      [[0, -2.3, -0.7], [-0.9, -3.6, -0.3], [-1.3, -6, 0], [-1.4, -8.4, 0.3]],
      [[0, 1.2, -0.9], [1.6, 0.6, 0.2], [1.9, -0.6, 0.8]], [[0, 1.2, -0.9], [-1.6, 0.6, 0.2], [-1.9, -0.6, 0.8]]
    ];
    paths.forEach(p => api.tube(p, 0.07, 0xFFE9A8, nv));
    api.part(nv, INFO.nerve);
    api.label('Não bộ', br, { off: [0, 1.6, 0] }); api.label('Tủy sống', [0, 0.5, -0.9], { off: [-1.2, 0, 0] }); api.label('Dây thần kinh ngoại biên', [3.8, -0.2, 0.2], { off: [1.4, 0, 0] });
    const route = new T.CatmullRomCurve3([[0, 6.6, 0], [0, 5.8, -0.6], [0, 3.4, -0.9], ...paths[0].slice(1)].map(p => V(...p)));
    const spark = api.sphere(0.2, glowMat(api, YEL), null, null, 16); spark.material.emissiveIntensity = 1.6; spark.userData.noPick = true; spark.visible = false;
    let t0 = -99;
    pulseClock(api, now => { t0 = now; lastPass = now + 0.6; if (ttx) api.beep(60, 0.3, 'sine', 0.2); });
    api.onFrame(() => {
      const u = (api.time - t0) / 1.6;
      br.children[0].material.emissiveIntensity = br.children[1].material.emissiveIntensity = u >= 0 && u < 0.2 ? 0.6 : 0;
      spark.visible = !ttx && u >= 0 && u < 1; if (spark.visible) spark.position.copy(route.getPointAt(Math.min(0.999, u)));
      api.caption(ttx ? 'TTX: xung thần kinh không lan truyền được' : `Xung từ não theo tủy sống ra dây thần kinh tay · ${velText()}`);
    });
    api.view({ pos: [0, 0.5, 21], target: [0, -0.5, 0], min: 6, max: 34 });
  }

  // ---------- Cấp 2: tế bào neuron ----------
  function buildNeuron(api) {
    const T = api.T, V = api.V, rnd = api.rand(7);
    const NODES = []; for (let i = 0; i <= 8; i++) NODES.push(-6 + i * 1.6);
    const soma = api.group(null, [-8, 0, 0]); api.tag(soma, 'soma');
    const sm_ = api.sphere(1.25, glowMat(api, PINK, 0.55), null, soma, 40); sm_.material.depthWrite = false;
    api.part(sm_, INFO.soma);
    api.part(api.sphere(0.45, 0x7A4FB5, null, soma), INFO.nucleus);
    const nis = api.group(soma); for (let k = 0; k < 16; k++) { const a = rnd() * 6.28, b = rnd() * 3.14, r = 0.7 + rnd() * 0.35; const m = api.sphere(0.12, 0x3E5BA9, [r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)], nis, 10); m.scale.set(1.4, 0.6, 1); }
    api.part(nis, INFO.nissl);
    // sợi nhánh
    const den = api.group(); api.tag(den, 'dend');
    const branch = (p, dir, len, r, depth) => {
      const e = p.clone().add(dir.clone().multiplyScalar(len));
      const mid = p.clone().lerp(e, 0.5).add(V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(len * 0.25));
      api.tube([p, mid, e], r, PINK, den, 16);
      if (depth > 0) for (let k = 0; k < 2; k++) { const d = dir.clone().add(V(rnd() - 0.6, rnd() - 0.5, rnd() - 0.5).multiplyScalar(1.1)).normalize(); branch(e, d, len * 0.62, r * 0.6, depth - 1); }
    };
    for (let k = 0; k < 6; k++) { const a = 1.5 + k * 0.62, d = V(Math.cos(a), Math.sin(a) * 0.9, (rnd() - 0.5) * 1.2).normalize(); branch(V(-8, 0, 0).add(d.clone().multiplyScalar(1.1)), d, 1.6, 0.14, 2); }
    api.part(den, INFO.dend);
    // gò + sợi trục
    const hill = api.mesh(new T.CylinderGeometry(0.2, 0.55, 0.9, 20), glowMat(api, PINK), [-6.55, 0, 0]); hill.rotation.z = Math.PI / 2; api.tag(hill, 'axon'); api.part(hill, INFO.hill);
    const ax = api.mesh(new T.CylinderGeometry(0.17, 0.17, 13.2, 16), glowMat(api, 0xF3C6DA), [0.5, 0, 0]); ax.rotation.z = Math.PI / 2; api.tag(ax, 'axon'); api.part(ax, INFO.axon);
    const sheaths = [], rings = [];
    for (let i = 0; i < NODES.length - 1; i++) {
      const sh = api.mesh(new T.CapsuleGeometry(0.42, 1.0, 6, 20), api.mat(MYE, { roughness: 0.4 }), [NODES[i] + 0.8, 0, 0]); sh.rotation.z = Math.PI / 2; api.tag(sh, 'axon'); api.part(sh, INFO.myelin); sheaths.push(sh);
    }
    NODES.forEach(x => { const r = api.mesh(new T.TorusGeometry(0.24, 0.08, 10, 24), glowMat(api, 0xFFB347), [x, 0, 0]); r.rotation.y = Math.PI / 2; api.tag(r, 'axon'); api.part(r, INFO.node); rings.push(r); });
    // chùy synapse
    const term = api.group(); api.tag(term, 'term');
    const tips = [[8.8, 1.3, 0.6], [9.2, 0.3, -0.7], [8.9, -0.9, 0.8], [8.4, -1.6, -0.5]];
    tips.forEach(p => { api.tube([[6.8, 0, 0], [7.6, p[1] * 0.4, p[2] * 0.4], p], 0.09, 0xF3C6DA, term, 16); api.sphere(0.36, glowMat(api, 0xE58BB5), p, term); });
    api.part(term, INFO.term);
    // độc tố TTX và điện cực
    const tox = api.group(); NODES.forEach(x => { for (let k = 0; k < 3; k++) { const a = k * 2.1; api.sphere(0.08, 0xFF2D55, [x, 0.3 * Math.cos(a), 0.3 * Math.sin(a)], tox, 8); } }); tox.traverse(o => o.userData.noPick = true); tox.visible = ttx;
    const el = api.group(null, [NODES[4], 0.6, 0]); api.cyl(0.02, 0.05, 2.2, 0xC9D6E3, [0, 1.1, 0], el, 8); el.traverse(o => o.userData.noPick = true);
    api.label('Thân neuron', soma, { off: [0, 1.9, 0] }); api.label('Sợi nhánh', [-9.4, 2.4, 0]); api.label('Bao myelin', [NODES[2] + 0.8, 0.5, 0], { off: [0, 0.6, 0] });
    api.label('Eo Ranvier', [NODES[6], -0.4, 0], { off: [0, -0.7, 0] }); api.label('Chùy synapse', [8.8, 1.3, 0.6], { off: [0, 0.8, 0] }); api.label('Điện cực đo', [NODES[4], 2.9, 0], { cls: 'tag', color: '#FFD84A' });
    const applyMyelin = () => { sheaths.forEach(s => s.visible = myelin && (s.parent && ax.visible)); rings.forEach(r => r.visible = myelin && ax.visible); };
    applyMyelin();
    // xung
    const pulses = [], JUMP = 0.14, SLOW = 1.4;
    pulseClock(api, now => {
      sm_.material.emissiveIntensity = 0.5;
      if (ttx) { api.beep(55, 0.35, 'sine', 0.22); pulses.push({ t0: now, dead: true }); return; }
      const p = { t0: now, ring: null, last: -1 };
      if (!myelin) { p.ring = api.mesh(new T.TorusGeometry(0.22, 0.09, 8, 20), glowMat(api, YEL), [-6.6, 0, 0]); p.ring.rotation.y = Math.PI / 2; p.ring.material.emissiveIntensity = 1.6; p.ring.userData.noPick = true; }
      pulses.push(p);
    });
    const glowT = NODES.map(() => -99);
    api.onFrame(dt => {
      const now = api.time;
      sm_.material.emissiveIntensity = Math.max(0, sm_.material.emissiveIntensity - dt * 1.5);
      hill.material.emissiveIntensity = 0;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i], age = now - p.t0;
        if (p.dead) { hill.material.emissiveIntensity = age < 0.35 ? 0.35 : 0; if (age > 0.5) pulses.splice(i, 1); continue; }
        let done = false;
        if (p.ring) {
          const x = -6.6 + age * SLOW; p.ring.position.x = x; ax.material.emissiveIntensity = 0.12;
          if (x >= NODES[4] && p.last < 4) { p.last = 4; lastPass = now; }
          if (x > 6.8) done = true;
        } else {
          const n = Math.floor(age / JUMP);
          if (n !== p.last && n < NODES.length) { p.last = n; glowT[n] = now; if (n === 4) lastPass = now; if (freq <= 25) api.beep(1400, 0.03, 'square', 0.035); }
          if (n >= NODES.length + 1) done = true;
        }
        if (done) { if (p.ring) { p.ring.parent.remove(p.ring); p.ring.geometry.dispose(); } term.children.forEach(c => { if (c.material && c.geometry.type === 'SphereGeometry') c.material.emissiveIntensity = 0.9; }); pulses.splice(i, 1); }
      }
      rings.forEach((r, k) => { const a = now - glowT[k]; r.material.emissiveIntensity = a < 0.25 ? 1.8 * (1 - a / 0.25) : 0; r.scale.setScalar(a < 0.25 ? 1.4 - a * 1.6 : 1); });
      term.children.forEach(c => { if (c.material && c.material.emissiveIntensity > 0) c.material.emissiveIntensity = Math.max(0, c.material.emissiveIntensity - dt * 2); });
      tox.visible = ttx;
      api.caption(ttx ? 'TTX đang khóa kênh Na⁺: không có xung lan truyền' : `${myelin ? 'Sợi có bao myelin' : 'Sợi không có bao myelin'} · ${velText()} · ${freq} Hz`);
    });
    return { applyMyelin, clear: () => pulses.forEach(p => p.ring && p.ring.parent && p.ring.parent.remove(p.ring)) };
  }

  // ---------- Cấp 3: eo Ranvier, trao đổi ion ----------
  function buildNode(api) {
    const T = api.T, V = api.V, rnd = api.rand(11);
    const mem = api.mesh(new T.CylinderGeometry(2, 2, 14, 40, 1, true), api.mat(0xF3C6DA, { opacity: 0.32, side: T.DoubleSide, depthWrite: false }), [0, 0, 0]); mem.rotation.z = Math.PI / 2; api.part(mem, INFO.axon); api.tag(mem, 'axon');
    const sl = [];
    [-1, 1].forEach(s => { const m = api.mesh(new T.CylinderGeometry(3.3, 3.3, 5.2, 40, 1, true), api.mat(MYE, { opacity: 0.85, side: T.DoubleSide }), [s * 4.1, 0, 0]); m.rotation.z = Math.PI / 2; api.part(m, INFO.myelin); api.tag(m, 'axon'); sl.push(m);
      for (let k = 1; k < 5; k++) { const w = api.mesh(new T.CylinderGeometry(2 + k * 0.26, 2 + k * 0.26, 5.2, 40, 1, true), api.mat(0xE9DDB4, { opacity: 0.35, side: T.DoubleSide, depthWrite: false }), [s * 4.1, 0, 0]); w.rotation.z = Math.PI / 2; w.userData.noPick = true; api.tag(w, 'axon'); sl.push(w); } });
    sl.forEach(m => m.visible = myelin);
    const chans = [];
    const mkCh = (x, a, color, info, key) => {
      const g = api.group(null, [x, 2 * Math.cos(a), 2 * Math.sin(a)]); g.rotation.x = a;
      api.cyl(0.22, 0.22, 0.7, glowMat(api, color), [0, 0, 0], g, 14); api.tag(g, 'chan'); api.part(g, info); g.userData.key = key; chans.push(g); return g;
    };
    const NA_A = [], K_A = [];
    const xs = myelin ? [-0.6, 0.6] : [-5, -2.5, 0, 2.5, 5];
    xs.forEach((x0, j) => { for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + j * 0.2; (j % 2 ? K_A : NA_A).push(mkCh(x0, a, j % 2 ? K : 0x46C37B, j % 2 ? INFO.kch : INFO.nach, j % 2 ? 'k' : 'na')); } });
    // TTX chặn kênh Na⁺
    const tox = api.group(); NA_A.forEach(g => { const p = g.position.clone().multiplyScalar(1.22); api.sphere(0.2, 0xFF2D55, [p.x, p.y, p.z], tox, 10); }); tox.visible = ttx; tox.traverse(o => o.userData.noPick = true);
    // ion
    const mkIon = (color, n) => { const a = []; for (let k = 0; k < n; k++) { const m = api.sphere(0.13, glowMat(api, color), null, null, 10); m.material.emissiveIntensity = 0.4; m.userData.noPick = true; a.push(m); } return a; };
    const naI = mkIon(NA, NA_A.length), kI = mkIon(K, K_A.length);
    const bgNa = mkIon(NA, 30), bgK = mkIon(K, 24);
    bgNa.forEach(m => { const a = rnd() * 6.28, r = 2.5 + rnd() * 0.6; m.position.set((rnd() - 0.5) * (myelin ? 2.2 : 12), r * Math.cos(a), r * Math.sin(a)); });
    bgK.forEach(m => { const a = rnd() * 6.28, r = rnd() * 1.6; m.position.set((rnd() - 0.5) * 12, r * Math.cos(a), r * Math.sin(a)); });
    api.label('Bao myelin', [-4.1, 3.3, 0], { off: [0, 0.6, 0] }); api.label(myelin ? 'Eo Ranvier' : 'Màng sợi trục', [0, 2.7, 0], { off: [0, 1.2, 0] });
    api.label('Kênh Na⁺', NA_A[0], { cls: 'tag', color: '#46C37B', off: [-0.8, 0.6, 0] }); api.label('Kênh K⁺', K_A[0], { cls: 'tag', color: '#B07CFF', off: [0.8, 0.6, 0] });
    api.label('Ngoài màng: nhiều Na⁺', [0, -3.2, 0], { cls: 'plain' }); api.label('Trong sợi trục: nhiều K⁺', [0, 0, 0], { cls: 'plain' });
    let t0 = -99;
    pulseClock(api, now => { t0 = now; lastPass = now + 0.05; if (ttx) api.beep(55, 0.35, 'sine', 0.22); });
    api.onFrame(() => {
      const u = (api.time - t0) / 1.4;
      const naP = ttx ? 0 : sm(u / 0.4) * (u < 1 ? 1 : 0), kP = ttx ? 0 : sm((u - 0.4) / 0.4) * (u < 1 ? 1 : 0);
      NA_A.forEach((g, k) => { g.children[0].material.emissiveIntensity = !ttx && u > 0 && u < 0.45 ? 1 : 0; const out = g.position.clone().multiplyScalar(1.35), inn = g.position.clone().multiplyScalar(0.55); naI[k].position.lerpVectors(out, inn, naP); naI[k].visible = u > 0 && u < 1 && !ttx; });
      K_A.forEach((g, k) => { g.children[0].material.emissiveIntensity = !ttx && u > 0.4 && u < 0.85 ? 1 : 0; const out = g.position.clone().multiplyScalar(1.35), inn = g.position.clone().multiplyScalar(0.55); kI[k].position.lerpVectors(inn, out, kP); kI[k].visible = u > 0.4 && u < 1 && !ttx; });
      mem.material.emissive = new T.Color(YEL); mem.material.emissiveIntensity = !ttx && u > 0.1 && u < 0.55 ? 0.5 : 0;
      tox.visible = ttx;
      api.caption(ttx ? 'TTX bịt kênh Na⁺: Na⁺ không vào được, không có điện thế hoạt động' : u < 0.45 ? 'Kênh Na⁺ mở: Na⁺ tràn vào → mất phân cực, đảo cực lên +30 mV' : u < 1 ? 'Kênh K⁺ mở: K⁺ đi ra → tái phân cực, ưu phân cực' : 'Điện thế nghỉ −70 mV (bơm Na⁺/K⁺ duy trì chênh lệch nồng độ)');
    });
    api.view({ pos: [0, 4, 13], target: [0, 0, 0], min: 4, max: 24 });
  }

  // ---------- Cấp 4: thụ thể ACh – kênh Na⁺ ----------
  function buildReceptor(api) {
    const T = api.T;
    // màng kép phospholipid
    const heads = new T.InstancedMesh(new T.SphereGeometry(0.22, 10, 8), api.mat(0x86B7E8), 2 * 18 * 18); let n = 0; const M = new T.Matrix4();
    [1.1, -1.1].forEach(y => { for (let i = 0; i < 18; i++) for (let j = 0; j < 18; j++) { const x = -4.6 + i * 0.54, z = -4.6 + j * 0.54; if (x * x + z * z < 4) continue; M.makeTranslation(x, y, z); heads.setMatrixAt(n++, M); } });
    heads.count = n; api.root.add(heads); api.part(heads, INFO.mem);
    const tails = api.box(9.6, 1.6, 9.6, api.mat(0xF2E3A6, { opacity: 0.35, depthWrite: false }), [0, 0, 0]); tails.userData.noPick = true;
    // 5 tiểu phần
    const rec = api.group(); const subs = [];
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * Math.PI * 2, alpha = k === 0 || k === 2;
      const g = api.group(rec, [0, 0, 0]); g.rotation.y = a;
      const m = api.mesh(new T.CapsuleGeometry(0.42, 2.6, 6, 16), glowMat(api, alpha ? 0xF07A9A : 0x6FA8DC), [0.75, 0.3, 0], g); subs.push({ g, m, alpha });
      if (alpha) { const site = api.sphere(0.16, 0x2B8A57, [1.12, 1.4, 0], g, 10); site.userData.noPick = true; }
    }
    api.part(rec, INFO.rec); api.tag(rec, 'chan');
    const ach = [0, 2].map(k => { const g = api.group(); const a = k / 5 * Math.PI * 2; g.userData.site = api.V(1.25 * Math.cos(-a), 1.5, 1.25 * Math.sin(-a)); [[0, 0, 0], [0.18, 0.1, 0], [-0.16, 0.12, 0.05]].forEach(p => api.sphere(0.13, glowMat(api, ACH), p, g, 10)); g.traverse(o => o.userData.noPick = true); return g; });
    const enz = api.sphere(0.5, glowMat(api, ENZ), [3, 2.6, 1], null, 20); enz.scale.set(1.2, 0.8, 1); api.part(enz, INFO.ache); api.tag(enz, 'ache');
    const ions = []; for (let k = 0; k < 6; k++) { const m = api.sphere(0.15, glowMat(api, NA), null, null, 10); m.material.emissiveIntensity = 0.6; m.userData.noPick = true; ions.push(m); }
    api.label('Thụ thể ACh (5 tiểu phần)', [0, 2, 0], { off: [0, 1.4, 0] }); api.label('Acetylcholine', ach[0], { cls: 'tag', color: '#3FD07F', off: [-0.6, 0.5, 0] });
    api.label('Lớp kép phospholipid', [-4, 1.1, 3.5], { cls: 'plain' }); api.label('AChE', enz, { cls: 'tag', color: '#8E5BD6', off: [0, 0.7, 0] });
    const PER = 4.2;
    api.onFrame(() => {
      const u = (api.time % PER) / PER;
      const bound = ache ? u > 0.3 || api.time > PER : u > 0.3 && u < 0.85;
      const open = ache ? sm((Math.max(u, api.time > PER ? 1 : u) - 0.3) / 0.15) : u < 0.85 ? sm((u - 0.3) / 0.15) : 1 - sm((u - 0.85) / 0.1);
      subs.forEach(s => { s.m.position.x = 0.75 + 0.32 * open; s.g.children[0].rotation.z = -0.12 * open; s.m.material.emissiveIntensity = s.alpha && bound ? 0.5 : 0; });
      ach.forEach((g, k) => {
        const start = api.V(k ? -3 : 2.5, 5.5, k ? 1.5 : -2), site = g.userData.site;
        if (!ache && u > 0.85) { g.position.lerpVectors(site, enz.position.clone().add(api.V(k ? -0.5 : 0.5, 0.4, 0)), sm((u - 0.85) / 0.08)); g.children.forEach((c, j) => c.material.color.set(u > 0.93 ? (j ? 0x5FA8FF : 0xBFC7D0) : ACH)); }
        else { g.position.lerpVectors(start, site, ache && api.time > PER ? 1 : sm(u / 0.3)); g.children.forEach(c => c.material.color.set(ACH)); }
      });
      enz.material.emissiveIntensity = !ache && u > 0.85 ? 0.8 : 0;
      ions.forEach((m, k) => { const p = ((u - 0.45) * 2.2 + k / 6) % 1; m.visible = open > 0.6; m.position.set(0.12 * Math.cos(k), 4 - p * 7.5, 0.12 * Math.sin(k)); });
      vPost = open > 0.6 ? lerp(-70, 30, Math.min(1, (open - 0.6) / 0.3)) : -70;
      api.caption(ache ? 'Chất ức chế AChE: ACh không bị phân hủy, kênh Na⁺ mở mãi' : u < 0.3 ? 'ACh khuếch tán tới thụ thể' : u < 0.45 ? '2 ACh gắn vào 2 tiểu phần α → protein đổi cấu hình' : u < 0.85 ? 'Cổng mở: Na⁺ đi qua lỗ kênh vào trong tế bào' : 'AChE cắt ACh thành acetate + choline → cổng đóng');
    });
    api.view({ pos: [0, 2.6, 10], target: [0, 0.8, 0], min: 3, max: 22 });
  }

  // ---------- Tab synapse: chuỗi 6 bước ----------
  function synTab(api) {
    const T = api.T, V = api.V, rnd = api.rand(5);
    const preG = api.group(); api.tag(preG, 'term');
    const bulb = api.mesh(new T.SphereGeometry(3, 48, 32), glowMat(api, 0xE58BB5, 0.28), [0, 3.2, 0], preG); bulb.scale.set(1.2, 0.85, 1); bulb.material.depthWrite = false; bulb.material.side = T.DoubleSide; api.part(bulb, INFO.pre);
    const axo = api.cyl(0.7, 0.9, 5, glowMat(api, 0xF3C6DA, 0.5), [0, 7.6, 0], preG); axo.userData.noPick = true;
    const mito = api.mesh(new T.CapsuleGeometry(0.35, 1.1, 6, 14), 0xE9894E, [-1.6, 4.2, 0.4], preG); mito.rotation.z = 1.1; api.part(mito, INFO.mito);
    const MEMY = 0.75;
    // bóng chứa
    const ves = []; const vesG = api.group(); api.tag(vesG, 'term');
    for (let k = 0; k < 12; k++) {
      const p = V((rnd() - 0.5) * 4.2, 1.6 + rnd() * 2.6, (rnd() - 0.5) * 3); const g = api.group(vesG, [p.x, p.y, p.z]);
      api.sphere(0.36, api.mat(0xFFF4FA, { opacity: 0.55 }), null, g, 16); for (let j = 0; j < 4; j++) api.sphere(0.07, ACH, [(rnd() - 0.5) * 0.4, (rnd() - 0.5) * 0.4, (rnd() - 0.5) * 0.4], g, 6);
      g.userData.home = p.clone(); g.userData.dock = V(-1.8 + (k % 4) * 1.2, MEMY + 0.3, (k % 2 ? 0.5 : -0.5)); ves.push(g);
    }
    api.part(vesG, INFO.ves);
    // kênh Ca²⁺
    const caCh = [];
    [-1, 1].forEach(s => [0.35, -0.35].forEach(z => { const p = V(s * 2.9, 1.5, z * 3); const g = api.group(null, [p.x, p.y, p.z]); g.rotation.z = s * 1.0; api.cyl(0.2, 0.2, 0.6, glowMat(api, CA), null, g, 12); api.part(g, INFO.cach); api.tag(g, 'chan'); caCh.push(g); }));
    // màng sau
    const post = api.box(10, 1.6, 6, glowMat(api, 0x8FD3B8, 0.7), [0, -1.25, 0]); post.material.emissive = new T.Color(0xFF5FB4); api.part(post, INFO.post);
    const recs = []; for (let k = 0; k < 6; k++) { const g = api.group(null, [-2.5 + k, -0.35, (k % 2 ? 0.6 : -0.6)]); api.cyl(0.22, 0.22, 0.5, glowMat(api, 0x2E9E6A), null, g, 12); api.part(g, INFO.rec); api.tag(g, 'chan'); recs.push(g); }
    const cleft = api.box(10, 0.95, 6, api.mat(0x7FB2E5, { opacity: 0.08, depthWrite: false }), [0, 0.0, 0]); api.part(cleft, INFO.cleft);
    const enz = []; for (let k = 0; k < 5; k++) { const m = api.sphere(0.2, glowMat(api, ENZ), [-2 + k, -0.05, (k % 2 ? -0.9 : 0.9)], null, 12); m.scale.set(1.3, 0.8, 1); api.part(m, INFO.ache); api.tag(m, 'ache'); enz.push(m); }
    // ion và phân tử
    const pool = (color, n, r) => { const a = []; for (let k = 0; k < n; k++) { const m = api.sphere(r || 0.11, glowMat(api, color), null, null, 8); m.material.emissiveIntensity = 0.5; m.userData.noPick = true; m.visible = false; a.push(m); } return a; };
    const caI = pool(CA, 12), achI = pool(ACH, 24, 0.1), naI = pool(NA, 14);
    const caFrom = caI.map((m, k) => { const s = k % 2 ? 1 : -1; return V(s * (4.2 + rnd()), 1.2 + rnd() * 1.2, (rnd() - 0.5) * 2); });
    const caTo = caI.map((m, k) => { const s = k % 2 ? 1 : -1; return V(s * (1.6 + rnd()), 1.4 + rnd() * 0.8, (rnd() - 0.5) * 2); });
    const naFrom = naI.map(() => V((rnd() - 0.5) * 6, 0.1, (rnd() - 0.5) * 2.5)), naTo = naI.map(() => V((rnd() - 0.5) * 7, -1.4 - rnd() * 0.5, (rnd() - 0.5) * 3));
    api.label('Chùy màng trước', bulb, { off: [2.6, 2.4, 0] }); api.label('Bóng chứa ACh', ves[3], { cls: 'tag', color: '#3FD07F', off: [-1.6, 0.4, 0] });
    api.label('Kênh Ca²⁺', caCh[2], { cls: 'tag', color: '#FF9A3C', off: [0.9, 0.3, 0] }); api.label('Khe synapse 20–30 nm', [-4.6, 0, 3], { cls: 'plain' });
    api.label('Màng sau synapse', post, { off: [0, -1.2, 0] }); api.label('Thụ thể – kênh Na⁺', recs[5], { cls: 'tag', color: '#2E9E6A', off: [1.2, -0.3, 0] }); api.label('AChE', enz[4], { cls: 'tag', color: '#8E5BD6', off: [0.6, 0.4, 0] });
    // bảng các bước
    const list = api.note('');
    let step = 0, p = 0, built = -1, stuck = 0;
    const renderSteps = () => { list.set(`<b>6 bước truyền tin qua synapse</b><ol class="m3d-steps">${STEPS.map((s, k) => `<li class="${k === step ? 'on' : k < step ? 'done' : ''}">${s}</li>`).join('')}</ol>`); built = step; };
    renderSteps();
    const ctl = api.button('⏸ Tạm dừng', b => { synAuto = !synAuto; b.textContent = synAuto ? '⏸ Tạm dừng' : '▶ Chạy tự động'; });
    api.button('⏭ Bước tiếp theo', () => { synAuto = false; ctl.textContent = '▶ Chạy tự động'; next(); });
    const D = () => 1.9 / (0.6 + freq / 25);
    const next = () => {
      if (ttx && step === 0) { p = 0; return; }
      step = (step + 1) % 6; p = 0;
      if (step === 0) { stuck = ache ? Math.min(stuck + 1, 3) : 0; }
      if (step === 2) { /* tách khi hòa màng */ }
      if (step === 5 && ache) api.warn('ache', WARN_ACHE, '⚠️ Cảnh báo sinh học');
      renderSteps();
    };
    let tach = false;
    api.onFrame(dt => {
      if (synAuto) { p += dt / D(); if (p >= 1) { if (ttx && step === 0) { p = 0; api.beep(55, 0.35, 'sine', 0.2); } else next(); } }
      else p = Math.min(1, p + dt / D());
      const P = sm(p);
      // bước 1: xung xuống chùy
      bulb.material.emissiveIntensity = step === 0 ? (ttx ? 0 : 0.5 * P) : step === 1 ? 0.4 : 0;
      axo.material.emissiveIntensity = step === 0 && !ttx ? 0.8 * (1 - Math.abs(P - 0.5) * 2) : 0;
      if (step === 0) lastPass = api.time;
      // bước 2: Ca²⁺
      caCh.forEach(g => g.children[0].material.emissiveIntensity = step === 1 || step === 2 ? 1 : 0);
      caI.forEach((m, k) => { m.visible = step >= 1 && step <= 2 && !ttx; m.position.lerpVectors(caFrom[k], caTo[k], step === 1 ? P : 1); });
      // bước 3: bóng chứa hòa màng
      ves.forEach((g, k) => {
        const docker = k < 4;
        if (step === 2 && docker) { g.position.lerpVectors(g.userData.home, g.userData.dock, sm(p / 0.6)); g.scale.setScalar(p < 0.6 ? 1 : Math.max(0.01, 1 - (p - 0.6) / 0.4)); }
        else if (step >= 3 && docker) { g.scale.setScalar(0.01); }
        else { g.position.copy(g.userData.home); g.scale.setScalar(1); }
      });
      if (step === 2 && p > 0.6 && !tach) { tach = true; api.noise(0.05, 0.25, 3200); api.beep(1800, 0.03, 'square', 0.05); }
      if (step !== 2) tach = false;
      // ACh
      achI.forEach((m, k) => {
        const v = ves[k % 4], src = v.userData.dock.clone().add(V(((k / 4 | 0) - 2.5) * 0.12, -0.4, 0)), rc = recs[k % 6].position.clone().add(V(0, 0.35, 0)), ez = enz[k % 5].position;
        const extra = ache && k < 6 * (stuck + 1);
        if (step === 2) { m.visible = p > 0.6; m.position.copy(src); }
        else if (step === 3) { m.visible = true; m.position.lerpVectors(src, rc, P).add(V(Math.sin(k * 7 + api.time * 3) * 0.15 * (1 - P), 0, Math.cos(k * 5 + api.time * 3) * 0.15 * (1 - P))); }
        else if (step === 4) { m.visible = true; m.position.copy(rc); }
        else if (step === 5) { m.visible = true; if (ache) m.position.copy(rc).add(V(Math.sin(api.time * 4 + k) * 0.08, 0, 0)); else { m.position.lerpVectors(rc, ez, sm(p / 0.4)); if (p > 0.45) m.position.lerpVectors(ez, src.clone().add(V(0, 0.2, 0)), sm((p - 0.45) / 0.55)); m.material.color.set(p > 0.4 ? (k % 2 ? 0x5FA8FF : 0xBFC7D0) : ACH); m.visible = !(k % 2 && p > 0.6); } }
        else { m.visible = extra; if (extra) m.position.copy(rc).add(V(Math.sin(api.time * 4 + k) * 0.1, 0, Math.cos(api.time * 3 + k) * 0.1)); }
        if (step !== 5 || ache) m.material.color.set(ACH);
      });
      enz.forEach(m => m.material.emissiveIntensity = step === 5 && !ache ? 0.9 : 0);
      // bước 5: Na⁺
      const recOn = step === 4 || (ache && (step === 5 || stuck > 0));
      recs.forEach(g => g.children[0].material.emissiveIntensity = recOn ? 1 : 0);
      naI.forEach((m, k) => { m.visible = recOn && !ttx; m.position.lerpVectors(naFrom[k], naTo[k], step === 4 ? P : ((api.time * 0.6 + k / 14) % 1)); });
      const target = step === 4 ? lerp(-70, 30, sm(p / 0.4)) - (p > 0.5 ? 60 * sm((p - 0.5) / 0.5) : 0) : ache && (step === 5 || stuck > 0) ? -25 + 5 * Math.sin(api.time * 6) : -70;
      vPost += (target - vPost) * Math.min(1, dt * 12);
      post.material.emissiveIntensity = vPost > -60 ? 0.12 + 0.3 * (vPost + 70) / 100 : 0;
      api.caption(ttx ? 'TTX chặn xung trên sợi trục: không có tín hiệu đến chùy synapse' : `Bước ${step + 1}/6 · ${freq} Hz${ache ? ' · AChE bị ức chế' : ''}`);
      if (built !== step) renderSteps();
    });
    api.view({ pos: [0, 2.4, 15], target: [0, 1.2, 0], min: 4, max: 26 });
  }

  function controls(api, isSyn, nr) {
    api.slider({ label: '⚡ Tần số kích thích', min: 1, max: 100, step: 1, value: freq, unit: 'Hz', lazy: true, onInput(v) { freq = v; } });
    if (!isSyn) api.toggle({ label: 'Sợi trục có bao myelin', value: myelin, onChange(v) { myelin = v; api.toast(v ? 'Nhảy vọt qua eo Ranvier: 100 – 120 m/s' : 'Lan truyền liên tục: 1 – 2 m/s'); if (lv === 2) api.setTab(api.tab); else if (nr) nr.applyMyelin(); } });
    api.section('🧪 Dược lý và độc tố');
    api.toggle({ label: 'Bật độc tố Tetrodotoxin (TTX)', value: ttx, onChange(v) { ttx = v; if (v) { api.beep(48, 0.8, 'sine', 0.3); api.warn('ttx', WARN_TTX, '⚠️ Cảnh báo sinh học'); } } });
    api.toggle({ label: 'Bật chất ức chế Acetylcholinesterase', value: ache, onChange(v) { ache = v; if (v) api.warn('ache', WARN_ACHE, '⚠️ Cảnh báo sinh học'); } });
    api.checklist([
      { k: 'soma', label: 'Thân neuron và Nhân' }, { k: 'dend', label: 'Sợi nhánh' }, { k: 'axon', label: 'Sợi trục, Bao myelin / Eo Ranvier' },
      { k: 'term', label: 'Chùy màng trước và Bóng chứa ACh' }, { k: 'chan', label: 'Kênh Ca²⁺, Kênh Na⁺, Kênh K⁺' }, { k: 'ache', label: 'Enzyme acetylcholinesterase' }
    ], (k, on) => { api.groupVis(k, on); if (k === 'axon' && nr) nr.applyMyelin(); });
  }

  NL.m3d.register('M4', {
    title: 'Neuron và synapse',
    tabs: [{ t: '⚡ Neuron & truyền xung', v: 'neuron' }, { t: '🔬 Khe synapse', v: 'syn' }],
    init() { lv = 1; synAuto = true; },
    build(api, tab) {
      if (tab === 'syn') { vPost = -70; synTab(api); apStrip(api, true); controls(api, true); return; }
      api.levels(['Hệ thần kinh', 'Tế bào neuron', myelin ? 'Eo Ranvier' : 'Màng sợi trục', 'Kênh ion & thụ thể'], lv, n => { lv = n; api.setTab(api.tab); });
      let nr = null;
      if (lv === 0) buildSystem(api); else if (lv === 2) buildNode(api); else if (lv === 3) buildReceptor(api);
      else { nr = buildNeuron(api); api.view({ pos: [2, 3, 21], target: [2, 0, 0], min: 4, max: 32 }); }
      apStrip(api, lv === 3);
      controls(api, false, nr);
    },
    data() {
      const pts = []; for (let t = 0; t <= 5.0001; t += 0.1) pts.push([+t.toFixed(1), ttx ? -70 : +ap(t).toFixed(1)]);
      return {
        title: 'Truyền xung thần kinh và điện thế hoạt động',
        sub: `Sợi đang xem: ${myelin ? 'có bao myelin' : 'không có bao myelin'} · Tần số ${freq} Hz · TTX ${ttx ? 'bật' : 'tắt'} · Ức chế AChE ${ache ? 'bật' : 'tắt'}`,
        sheets: [
          { name: 'Dẫn truyền', head: ['STT', 'Đặc điểm / Loại sợi trục', 'Sợi có bao Myelin', 'Sợi không có bao Myelin'], rows: [
            [1, 'Vận tốc truyền xung (m/s)', '100 – 120', '1 – 2'],
            [2, 'Cơ chế lan truyền', 'Nhảy vọt từ eo Ranvier này sang eo Ranvier kế tiếp', 'Liên tục, lần lượt từng vùng kề nhau trên màng'],
            [3, 'Nơi xảy ra mất phân cực', 'Chỉ tại các eo Ranvier', 'Toàn bộ màng sợi trục'],
            [4, 'Năng lượng tiêu tốn cho bơm Na⁺/K⁺', 'Ít', 'Nhiều'],
            [5, 'Thời gian xung đi hết 1 m', '≈ 8 – 10 ms', '≈ 0,5 – 1 s'],
            [6, 'Đang mô phỏng', myelin ? '✔' : '', myelin ? '' : '✔']] },
          { name: 'Nồng độ ion', head: ['Ion', 'Trong tế bào (mM)', 'Ngoài tế bào (mM)', 'Vai trò'], rows: [
            ['Na⁺', 15, 145, 'Đi vào gây mất phân cực, đảo cực'], ['K⁺', 140, 5, 'Đi ra tạo điện thế nghỉ, gây tái phân cực'],
            ['Ca²⁺', 0.0001, 2, 'Đi vào chùy synapse, kích thích xuất bào'], ['Cl⁻', 10, 110, 'Góp phần ổn định điện thế nghỉ']] },
          { name: 'Điện thế hoạt động', head: ['Thời gian (ms)', 'Điện thế màng (mV)', 'Giai đoạn'], rows: pts.map(p => [p[0], p[1], ttx ? 'Bị TTX khóa, không đạt ngưỡng' : phase(p[0])]) }
        ],
        chart: { type: 'line', series: [{ name: ttx ? 'Điện thế màng (TTX)' : 'Điện thế hoạt động', color: '#E0A100', points: pts }], xLabel: 'Thời gian (ms)', yLabel: 'mV', yMin: -90, yMax: 50, xMax: 5,
          marks: [{ y: -70, label: 'Nghỉ −70 mV', color: '#4D6FD6' }, { y: 30, label: 'Đảo cực +30 mV', color: '#E5534B' }, { y: -55, label: 'Ngưỡng −55', color: '#8FA4B8' }] }
      };
    },
    liveData: true
  });
})();
