// Mô hình Lí 1: Hệ Mặt Trời (8 hành tinh, tua nhanh thời gian, định luật III Kepler) và nhật thực, nguyệt thực (quỹ đạo Mặt Trăng nghiêng 5°).
// Khoảng cách và kích thước KHÔNG theo tỉ lệ thật (ghi rõ trên màn hình); chu kì quỹ đạo là số liệu thật.
(function () {
  const PL = [
    { n: 'Thủy tinh', e: 'Mercury', a: 0.387, T: 0.241, r: 0.17, c: 0x9CA3AF, d: '4 879 km', m: 'Không có', x: 'Gần Mặt Trời nhất, ngày nóng 430 °C, đêm lạnh −180 °C vì gần như không có khí quyển' },
    { n: 'Kim tinh', e: 'Venus', a: 0.723, T: 0.615, r: 0.3, c: 0xE8C27A, d: '12 104 km', m: 'Không có', x: 'Nóng nhất hệ Mặt Trời (~465 °C) do khí quyển CO₂ dày gây hiệu ứng nhà kính rất mạnh' },
    { n: 'Trái Đất', e: 'Earth', a: 1, T: 1, r: 0.32, c: 0x3B82F6, d: '12 742 km', m: '1 (Mặt Trăng)', x: 'Hành tinh duy nhất biết có sự sống, có nước lỏng trên bề mặt' },
    { n: 'Hỏa tinh', e: 'Mars', a: 1.524, T: 1.881, r: 0.24, c: 0xDC6B3C, d: '6 779 km', m: '2', x: 'Màu đỏ do bụi sắt oxit, có núi lửa Olympus Mons cao nhất hệ Mặt Trời' },
    { n: 'Mộc tinh', e: 'Jupiter', a: 5.203, T: 11.86, r: 0.9, c: 0xD9A066, d: '139 820 km', m: '95', x: 'Lớn nhất, là hành tinh khí. Vết Đỏ Lớn là cơn bão rộng hơn cả Trái Đất' },
    { n: 'Thổ tinh', e: 'Saturn', a: 9.537, T: 29.46, r: 0.76, c: 0xE9D29B, d: '116 460 km', m: '146', x: 'Có hệ vành đai rực rỡ làm từ băng và đá, khối lượng riêng nhỏ hơn nước' },
    { n: 'Thiên vương tinh', e: 'Uranus', a: 19.19, T: 84.01, r: 0.5, c: 0x8FD3E0, d: '50 724 km', m: '28', x: 'Trục quay nghiêng gần 98°, như đang "lăn" trên quỹ đạo' },
    { n: 'Hải vương tinh', e: 'Neptune', a: 30.07, T: 164.8, r: 0.48, c: 0x4F6FE0, d: '49 244 km', m: '16', x: 'Xa nhất, gió mạnh nhất hệ Mặt Trời (hơn 2 000 km/h)' }
  ];
  const R = a => 3.2 + 3.9 * Math.sqrt(a); // khoảng cách hiển thị (nén)
  const vn = (v, d) => (+v).toFixed(d).replace('.', ',');
  let s = null;

  function solar(api) {
    const T = api.T;
    const sun = api.sphere(2, api.mat(0xFFC83D, { emissive: 0xFFA500, emissiveIntensity: 1.2 }), [0, 0, 0], null, 48);
    api.part(sun, { name: 'Mặt Trời', rows: [['Loại', 'Ngôi sao (sao lùn vàng)'], ['Đường kính', '≈ 1,39 triệu km (gấp 109 lần Trái Đất)'], ['Năng lượng', 'Phản ứng nhiệt hạch: hydrogen tổng hợp thành helium ở lõi']] });
    const glow = api.sphere(2.5, api.mat(0xFFD27A, { opacity: 0.18, depthWrite: false }), [0, 0, 0], null, 32); glow.userData.noPick = true;
    const light = new T.PointLight(0xFFF4D6, 2.2, 0, 0); api.root.add(light);
    s.pl = PL.map((p, k) => {
      const rr = R(p.a);
      const ring = api.mesh(new T.RingGeometry(rr - 0.025, rr + 0.025, 128), api.mat(0x94A3B8, { opacity: 0.35, side: T.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.userData.noPick = true; api.tag(ring, 'orbit');
      const g = api.group();
      const ball = api.sphere(p.r, api.mat(p.c, { roughness: 0.8 }), [0, 0, 0], g, 32);
      if (p.e === 'Saturn') { const rg = api.mesh(new T.RingGeometry(p.r * 1.3, p.r * 2.1, 64), api.mat(0xE9D29B, { opacity: 0.7, side: T.DoubleSide }), null, g); rg.rotation.x = -Math.PI / 2 + 0.47; }
      if (p.e === 'Earth') { s.moon = api.sphere(0.09, api.mat(0xD1D5DB), [0.65, 0, 0], g, 16); }
      api.part(g, { name: `${p.n} (${p.e})`, rows: [['Khoảng cách tới Mặt Trời', `${vn(p.a, 3)} AU`], ['Chu kì quỹ đạo', p.T < 1.5 ? `${Math.round(p.T * 365.25)} ngày` : `${vn(p.T, 2)} năm`], ['Đường kính', p.d], ['Số vệ tinh', p.m], ['Đặc điểm', p.x]] });
      const lab = api.label(p.n, g, { cls: 'plain', off: [0, p.r + 0.35, 0] });
      return { p, g, rr, ph: k * 0.8, lab };
    });
    // vành đai tiểu hành tinh giữa Hỏa tinh và Mộc tinh
    const rnd = api.rand(9), n = 400, im = new T.InstancedMesh(new T.IcosahedronGeometry(0.05, 0), api.mat(0x8B7E6E), n), m4 = new T.Matrix4();
    for (let k = 0; k < n; k++) { const a = rnd() * 6.283, r = R(2.2 + rnd() * 1.1); m4.makeTranslation(Math.cos(a) * r, (rnd() - 0.5) * 0.3, Math.sin(a) * r); im.setMatrixAt(k, m4); }
    api.root.add(im); api.part(im, { name: 'Vành đai tiểu hành tinh', rows: [['Vị trí', 'Giữa Hỏa tinh và Mộc tinh (2,2 – 3,3 AU)'], ['Thành phần', 'Hàng triệu khối đá, kim loại nhỏ']] });
    api.onFrame(dt => {
      if (!s.pause) s.t += dt * s.speed;
      s.pl.forEach(o => { const a = o.ph + 2 * Math.PI * s.t / o.p.T; o.g.position.set(Math.cos(a) * o.rr, 0, -Math.sin(a) * o.rr); o.g.rotation.y += dt * 2; });
      if (s.moon) { const a = 2 * Math.PI * s.t / (27.32 / 365.25); s.moon.position.set(Math.cos(a) * 0.65, 0, -Math.sin(a) * 0.65); }
      api.caption(`Thời gian trôi: ${vn(s.t, 2)} năm Trái Đất`);
    });
    api.section('🪐 Hệ Mặt Trời');
    api.slider({ label: '⏩ Tốc độ thời gian', min: 0.02, max: 2, step: 0.02, value: s.speed, unit: 'năm/giây', onInput(v) { s.speed = v; } });
    api.toggle({ label: '⏸ Tạm dừng', value: s.pause, onChange(v) { s.pause = v; } });
    api.checklist([{ k: 'orbit', label: 'Quỹ đạo' }, { k: 'name', label: 'Tên hành tinh' }], (k, on) => { if (k === 'orbit') api.groupVis('orbit', on); else s.pl.forEach(o => o.lab.show(on)); });
    api.note('Khoảng cách và kích thước đã được thu nhỏ khác nhau để nhìn được cả 8 hành tinh. Nếu vẽ đúng tỉ lệ, Mặt Trời to như quả bóng thì Trái Đất chỉ là hạt cát cách xa 26 m.<br><b>Kepler III:</b> T² / a³ như nhau cho mọi hành tinh (T tính bằng năm, a bằng AU thì tỉ số ≈ 1).');
    api.view({ pos: [0, 22, 30], target: [0, 0, 0], min: 4, max: 70 });
  }

  function eclipse(api) {
    const T = api.T, ORB = 4.2, INC = 15 * Math.PI / 180; // vẽ phóng to góc nghiêng (thật ≈ 5°)
    // Mặt Trời ở xa phía −x
    const sun = api.sphere(2.6, api.mat(0xFFC83D, { emissive: 0xFFA500, emissiveIntensity: 1.2 }), [-17, 0, 0], null, 40);
    api.part(sun, { name: 'Mặt Trời', rows: [['Khoảng cách thật', 'Khoảng 150 triệu km, gấp gần 400 lần khoảng cách Trái Đất – Mặt Trăng']] });
    const dl = new T.DirectionalLight(0xFFFFFF, 2.4); dl.position.set(-17, 0, 0); dl.target.position.set(0, 0, 0); api.root.add(dl); api.root.add(dl.target);
    const earth = api.sphere(1, api.mat(0x3B82F6, { roughness: 0.75 }), [0, 0, 0], null, 48);
    api.part(earth, { name: 'Trái Đất', rows: [['Bóng của Trái Đất', 'Hình nón tối phía sau, ngược hướng Mặt Trời'], ['Nguyệt thực', 'Khi Mặt Trăng đi vào vùng bóng tối này (luôn vào đêm trăng tròn)']] });
    // mặt phẳng hoàng đạo và quỹ đạo Mặt Trăng nghiêng
    const ecl = api.mesh(new T.RingGeometry(ORB - 0.02, ORB + 0.02, 128), api.mat(0xFACC15, { opacity: 0.5, side: T.DoubleSide, depthWrite: false })); ecl.rotation.x = -Math.PI / 2; ecl.userData.noPick = true;
    const og = api.group(); const orb = api.mesh(new T.RingGeometry(ORB - 0.03, ORB + 0.03, 128), api.mat(0xE5E7EB, { opacity: 0.6, side: T.DoubleSide, depthWrite: false }), null, og); orb.rotation.x = -Math.PI / 2; orb.userData.noPick = true;
    const moon = api.sphere(0.36, api.mat(0xD1D5DB, { roughness: 0.9 }), [ORB, 0, 0], null, 32);
    api.part(moon, { name: 'Mặt Trăng', rows: [['Chu kì', '29,5 ngày từ trăng non tới trăng non'], ['Quỹ đạo', 'Nghiêng khoảng 5° so với mặt phẳng quỹ đạo Trái Đất'], ['Nhật thực', 'Khi Mặt Trăng che Mặt Trời (luôn vào ngày trăng non)']] });
    // bóng tối (nón) của Trái Đất và Mặt Trăng
    const umbra = api.mesh(new T.ConeGeometry(1, 9, 32, 1, true), api.mat(0x020617, { opacity: 0.22, depthWrite: false, side: T.DoubleSide })); umbra.rotation.z = -Math.PI / 2; umbra.position.set(4.5, 0, 0); umbra.userData.noPick = true;
    const mShadow = api.mesh(new T.ConeGeometry(0.36, 3.2, 24, 1, true), api.mat(0x020617, { opacity: 0.45, depthWrite: false, side: T.DoubleSide })); mShadow.userData.noPick = true;
    api.label('Hoàng đạo (mặt phẳng quỹ đạo Trái Đất)', [0, 0, ORB + 0.6], { cls: 'plain' });
    const status = api.label('', [0, 3.2, 0], { cls: 'tag', color: '#FDE047' });
    api.label('☀ Ánh sáng Mặt Trời', [-9, 1.4, 0], { cls: 'plain' });
    const place = () => {
      const th = s.ph * Math.PI / 180, nd = s.node * Math.PI / 180;
      og.rotation.set(0, 0, 0); og.rotateY(nd); og.rotateX(INC);
      const x = -Math.cos(th) * ORB, z = Math.sin(th) * ORB, y = -ORB * Math.sin(INC) * Math.sin(th - nd);
      moon.position.set(x, y, z);
      // trạng thái
      let msg = '', kind = '';
      const newM = Math.abs(((s.ph + 180) % 360) - 180) < 6, full = Math.abs(s.ph - 180) < 6;
      mShadow.visible = false; earth.material.emissive && earth.material.emissive.setHex(0);
      if (newM) {
        if (Math.abs(y) < 0.5) { kind = 'solar'; msg = Math.abs(y) < 0.12 ? '🌑 NHẬT THỰC TOÀN PHẦN' : '🌘 Nhật thực một phần'; mShadow.visible = true; mShadow.position.set(x + 1.6, y * 0.6, z * 0.6); }
        else msg = 'Trăng non nhưng Mặt Trăng ở cao hơn hoặc thấp hơn hoàng đạo: KHÔNG có nhật thực';
      } else if (full) {
        if (Math.abs(y) < 0.75) { kind = 'lunar'; msg = Math.abs(y) < 0.3 ? '🌕 NGUYỆT THỰC TOÀN PHẦN (Trăng máu)' : '🌖 Nguyệt thực một phần'; }
        else msg = 'Trăng tròn nhưng Mặt Trăng lệch khỏi bóng Trái Đất: KHÔNG có nguyệt thực';
      } else msg = `Pha Mặt Trăng: ${s.ph < 90 ? 'trăng lưỡi liềm đầu tháng' : s.ph < 180 ? 'trăng khuyết → tròn' : s.ph < 270 ? 'trăng tròn → khuyết' : 'trăng lưỡi liềm cuối tháng'}`;
      moon.material.color.setHex(kind === 'lunar' ? 0xB4442C : 0xD1D5DB);
      status.set(msg); s.kind = kind;
      if (newM && !kind) api.warn('noecl', 'Vì sao không phải tháng nào cũng có nhật thực? Quỹ đạo Mặt Trăng <b>nghiêng khoảng 5°</b> so với hoàng đạo. Phần lớn các lần trăng non, bóng Mặt Trăng đi lướt phía trên hoặc phía dưới Trái Đất. Chỉ khi trăng non rơi đúng gần <b>giao điểm (nút)</b> của hai quỹ đạo mới có nhật thực.', '🤔 Hiểu lầm thường gặp');
    };
    mShadow.rotation.z = -Math.PI / 2;
    api.section('🌗 Nhật thực và nguyệt thực');
    const ph = api.slider({ label: 'Vị trí Mặt Trăng trên quỹ đạo', min: 0, max: 359, step: 1, value: s.ph, unit: '°', onInput(v) { s.ph = v; place(); } });
    api.slider({ label: 'Hướng giao tuyến hai quỹ đạo (đổi theo tháng)', min: 0, max: 179, step: 1, value: s.node, unit: '°', onInput(v) { s.node = v; place(); } });
    api.button('🌑 Tới trăng non', () => ph.set(0));
    api.button('🌕 Tới trăng tròn', () => ph.set(180));
    api.toggle({ label: '▶ Cho Mặt Trăng tự quay', value: false, onChange(v) { s.spin = v; } });
    api.note('0° là trăng non (Mặt Trăng nằm giữa Mặt Trời và Trái Đất), 180° là trăng tròn. Đặt hướng giao tuyến về 0° rồi bấm Trăng non để thấy nhật thực.<br>Góc nghiêng quỹ đạo được vẽ phóng to để dễ thấy, thật ra chỉ khoảng 5°.');
    api.onFrame(dt => { if (s.spin) { s.ph = (s.ph + dt * 25) % 360; ph.set(Math.round(s.ph), true); place(); } });
    place();
    api.view({ pos: [-4, 6, 16], target: [-4, 0, 0], min: 3, max: 40 });
  }

  NL.m3d.register('LM1', {
    title: 'Hệ Mặt Trời, nhật thực và nguyệt thực',
    tabs: [{ t: '🪐 Hệ Mặt Trời', v: 'solar' }, { t: '🌗 Nhật thực, nguyệt thực', v: 'eclipse' }],
    init() { s = { t: 0, speed: 0.2, pause: false, ph: 40, node: 60 }; },
    build(api, tab) { if (tab === 'solar') solar(api); else eclipse(api); },
    data() {
      return {
        title: 'Các hành tinh và định luật III Kepler', sub: 'a: bán trục lớn quỹ đạo (AU), T: chu kì (năm Trái Đất). T²/a³ gần bằng 1 với mọi hành tinh',
        sheets: [{ name: 'Hành tinh', head: ['Hành tinh', 'a (AU)', 'T (năm)', 'T²', 'a³', 'T²/a³'], rows: PL.map(p => [p.n, vn(p.a, 3), vn(p.T, 3), vn(p.T * p.T, 2), vn(p.a ** 3, 2), vn(p.T * p.T / p.a ** 3, 3)]) }],
        chart: { type: 'line', xLabel: 'a (AU)', yLabel: 'T (năm)', xMin: 0, xMax: 32, yMin: 0, yMax: 180, series: [{ name: 'T = a^1,5', color: '#9AA9B7', dash: true, points: Array.from({ length: 33 }, (_, k) => [k, +(k ** 1.5).toFixed(2)]) }, { name: 'Hành tinh', color: '#F59E0B', dots: true, points: PL.map(p => [p.a, p.T]) }] }
      };
    }
  });
})();
