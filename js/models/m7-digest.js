// Mô hình 7: Hệ tiêu hóa. Ống và tuyến tiêu hóa, hành trình 5 chặng, dạ dày bổ dọc + cây dẫn mật – tụy, nhung mao – vi nhung mao và 2 con đường hấp thụ.
(function () {
  const GUT = 0xF2A0A8, COLON = 0xD9A07A, LIVER = 0x8B3A3A, GALL = 0x5E9E3E, PANC = 0xF2C46D, BILE = 0x7CC24E;
  const INFO = {
    mouth: { name: 'Khoang miệng', sci: 'Cavitas oris', rows: [['Cơ học', 'Răng nhai, nghiền; lưỡi đảo trộn, viên thức ăn'], ['Hóa học', 'Amylase nước bọt: tinh bột chín → maltose'], ['pH', '6,8 – 7,0']] },
    saliv: { name: 'Tuyến nước bọt', sci: 'Glandulae salivariae', rows: [['Gồm', '3 đôi: mang tai, dưới hàm, dưới lưỡi'], ['Tiết', '1 – 1,5 lít/ngày, chứa amylase, chất nhầy, lysozyme']] },
    eso: { name: 'Thực quản', sci: 'Oesophagus', rows: [['Cơ học', 'Nhu động dạng sóng đẩy thức ăn xuống dạ dày'], ['Hóa học', 'Không có'], ['Dài', '≈ 25 cm']] },
    stom: { name: 'Dạ dày', sci: 'Gaster (Ventriculus)', rows: [['Cơ học', '3 lớp cơ (dọc, vòng, chéo) co bóp đảo trộn mạnh'], ['Dịch vị', 'HCl, pepsin, chất nhầy; 2 – 3 lít/ngày'], ['Hóa học', 'Pepsin: protein → chuỗi polypeptide ngắn'], ['pH', '1,5 – 2,0']] },
    pylor: { name: 'Cơ vòng môn vị', sci: 'Musculus sphincter pylori', rows: [['Vai trò', 'Mở từng đợt đưa dưỡng chấp xuống tá tràng']] },
    duo: { name: 'Tá tràng', sci: 'Duodenum', rows: [['Nhận', 'Dịch mật, dịch tụy qua nhú tá lớn'], ['Hóa học', 'Phân giải triệt để protein, lipid, carbohydrate'], ['pH', '≈ 8,0']] },
    small: { name: 'Ruột non', sci: 'Intestinum tenue (không tràng, hồi tràng)', rows: [['Dài', '≈ 6 m'], ['Cơ học', 'Nhu động, co thắt từng đoạn'], ['Hóa học', 'Dịch ruột: maltase, sucrase, lactase, peptidase'], ['Hấp thụ', 'Đơn phân: glucose, amino acid, acid béo, glycerol'], ['pH', '7,0 – 8,0']] },
    large: { name: 'Ruột già', sci: 'Intestinum crassum', rows: [['Gồm', 'Manh tràng, ruột thừa, đại tràng lên – ngang – xuống – xích ma, trực tràng'], ['Vai trò', 'Tái hấp thu nước và muối khoáng; vi khuẩn lên men, tạo phân'], ['Hóa học', 'Không tiết enzyme tiêu hóa']] },
    appx: { name: 'Ruột thừa', sci: 'Appendix vermiformis', rows: [['Vị trí', 'Đầu manh tràng'], ['Lưu ý', 'Viêm ruột thừa cần cấp cứu']] },
    rect: { name: 'Trực tràng và hậu môn', sci: 'Rectum & Anus', rows: [['Vai trò', 'Chứa phân; cơ vòng hậu môn mở để tống phân ra ngoài']] },
    liver: { name: 'Gan', sci: 'Hepar', rows: [['Tiết', 'Dịch mật (0,5 – 1 lít/ngày), không chứa enzyme'], ['Vai trò mật', 'Nhũ tương hóa lipid thành giọt nhỏ'], ['Khác', 'Điều hòa đường huyết, khử độc chất từ tĩnh mạch cửa']] },
    gall: { name: 'Túi mật', sci: 'Vesica biliaris', rows: [['Vai trò', 'Dự trữ, cô đặc dịch mật'], ['Đổ vào', 'Ống mật chủ → nhú tá lớn']] },
    panc: { name: 'Tụy', sci: 'Pancreas', rows: [['Dịch tụy', 'Trypsin, chymotrypsin, lipase, amylase; NaHCO₃'], ['pH', '7,8 – 8,4'], ['Nội tiết', 'Insulin, glucagon']] },
    bileduct: { name: 'Cây dẫn mật', sci: 'Ductus hepaticus, cysticus, choledochus', rows: [['Đường đi', 'Ống gan → ống gan chung → ống mật chủ; ống túi mật nối vào'], ['Đổ vào', 'Nhú tá lớn cùng ống tụy']] },
    pduct: { name: 'Ống tụy', sci: 'Ductus pancreaticus', rows: [['Đổ vào', 'Nhú tá lớn của tá tràng, cùng ống mật chủ']] },
    papilla: { name: 'Nhú tá lớn', sci: 'Papilla duodeni major', rows: [['Vai trò', 'Nơi dịch mật và dịch tụy đổ vào tá tràng']] },
    layers: { name: '3 lớp cơ dạ dày', sci: 'Tunica muscularis', rows: [['Ngoài', 'Cơ dọc'], ['Giữa', 'Cơ vòng'], ['Trong', 'Cơ chéo'], ['Vai trò', 'Co bóp mạnh, nhào trộn thức ăn với dịch vị']] },
    rugae: { name: 'Nếp gấp niêm mạc dạ dày', sci: 'Rugae gastricae', rows: [['Vai trò', 'Giúp dạ dày dãn rộng khi chứa thức ăn'], ['Tuyến vị', 'Tiết HCl, pepsinogen, chất nhầy']] },
    villus: { name: 'Nhung mao ruột', sci: 'Villi intestinales', rows: [['Kích thước', 'Cao ≈ 0,5 – 1 mm'], ['Bên trong', 'Mạng mao mạch máu và 1 mạch bạch huyết trung tâm'], ['Tăng diện tích', '≈ 30 lần (cùng vi nhung mao: tổng 200 – 300 m²)']] },
    micro: { name: 'Vi nhung mao', sci: 'Microvilli (brush border)', rows: [['Vị trí', 'Mặt tự do của tế bào biểu mô ruột'], ['Tăng diện tích', '≈ 600 lần so với ống trơn'], ['Enzyme màng', 'Maltase, sucrase, lactase, peptidase']] },
    capil: { name: 'Mao mạch máu', sci: 'Capillaries', rows: [['Hấp thụ', 'Glucose, amino acid, vitamin tan trong nước (B, C), nước, khoáng'], ['Đường đi', 'Tĩnh mạch cửa → gan → tĩnh mạch chủ dưới → tim']] },
    lacteal: { name: 'Mạch bạch huyết trung tâm', sci: 'Lacteal', rows: [['Hấp thụ', 'Acid béo + glycerol (tái tổng hợp lipid), vitamin A, D, E, K'], ['Đường đi', 'Ống ngực → tĩnh mạch dưới đòn → tim']] },
    portal: { name: 'Tĩnh mạch cửa gan', sci: 'Vena portae hepatis', rows: [['Chở', 'Máu giàu chất dinh dưỡng từ ruột về gan'], ['Gan', 'Điều hòa nồng độ chất, khử độc']] },
    thor: { name: 'Ống ngực (bạch huyết)', sci: 'Ductus thoracicus', rows: [['Chở', 'Bạch huyết giàu lipid từ ruột'], ['Đổ vào', 'Tĩnh mạch dưới đòn trái']] },
    cell: { name: 'Tế bào biểu mô ruột', sci: 'Enterocyte', rows: [['Đặc điểm', 'Mặt trên có vi nhung mao'], ['Vai trò', 'Hấp thụ đơn phân bằng khuếch tán và vận chuyển chủ động']] }
  };
  const WARN_STARCH = 'Cảnh báo sinh học: Tinh bột không thể tiếp tục tiêu hóa hóa học tại dạ dày do môi trường axit mạnh pH 1.5 - 2.0 làm enzyme Amylase từ nước bọt bị biến tính và ngừng hoạt động!';
  const STAGES = [
    ['Khoang miệng & thực quản', 'Nhai nghiền, amylase: tinh bột chín → maltose; nắp thanh quản đậy, thực quản nhu động'],
    ['Dạ dày', 'Co bóp đảo trộn; HCl + pepsin: protein → polypeptide; môn vị mở từng đợt'],
    ['Tá tràng & tuyến', 'Mật nhũ tương hóa lipid; dịch tụy, dịch ruột phân giải triệt để'],
    ['Ruột non: hấp thụ', 'Glucose, amino acid, acid béo, glycerol qua niêm mạc'],
    ['Ruột già & hậu môn', 'Tái hấp thu nước, muối; vi khuẩn lên men; tống phân']
  ];
  // phần chất chưa phân giải (%) sau mỗi chặng
  const LEFT = [[100, 100, 100], [70, 100, 100], [70, 60, 95], [10, 15, 15], [1, 2, 3], [0, 0, 1]];
  const PH = [['Miệng', 6.8], ['Thực quản', 7], ['Dạ dày', 2], ['Tá tràng', 8], ['Ruột non', 7.5], ['Ruột già', 7]];

  let pspd = 2, op = 1, lv = 1, path = 'both', stageDone = 0;
  const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);

  // ---------- đường ống ----------
  const P_ESO = [[0, 7.6, 0.6], [0, 7.0, 0.1], [0.05, 6.0, -0.3], [0.15, 4.0, -0.3], [0.35, 2.6, -0.1]];
  const P_STOM = [[0.35, 2.6, -0.1], [1.2, 2.3, 0], [1.65, 1.5, 0.1], [1.4, 0.7, 0.2], [0.7, 0.45, 0.25], [0.05, 0.75, 0.2]];
  const P_DUO = [[0.05, 0.75, 0.2], [-0.55, 0.6, 0.1], [-0.75, -0.1, 0.05], [-0.35, -0.55, 0.1], [0.35, -0.4, 0.1]];
  function smallPts() { const a = [[0.35, -0.4, 0.1]]; const rows = 5; for (let r = 0; r < rows; r++) { const y = -0.9 - r * 0.55, dir = r % 2 ? 1 : -1; for (let k = 0; k <= 4; k++) { const x = dir * (1.25 - k * 0.62); a.push([x, y + Math.sin(k * 1.7 + r) * 0.12, 0.35 + Math.cos(k * 2.1 + r) * 0.25]); } } a.push([-1.5, -3.6, 0.3], [-1.85, -3.4, 0.25]); return a; }
  const P_LARGE = [[-1.85, -3.4, 0.25], [-2.05, -3.0, 0.2], [-2.15, -1.2, 0.25], [-2.1, 0.15, 0.3], [-1, 0.35, 0.6], [0.6, 0.3, 0.65], [2.1, 0.2, 0.35], [2.25, -1.4, 0.25], [2.1, -3.1, 0.25], [1.2, -3.75, 0.3], [0.35, -3.7, 0.2], [0.1, -4.4, 0.1], [0, -5.0, 0]];
  const curve = (T, a) => new T.CatmullRomCurve3(a.map(p => new T.Vector3(...p)));

  function overview(api, opt) {
    const T = api.T, V = api.V;
    const C = { eso: curve(T, P_ESO), stom: curve(T, P_STOM), duo: curve(T, P_DUO), small: curve(T, smallPts()), large: curve(T, P_LARGE) };
    const tubeG = api.group(); api.tag(tubeG, 'tract');
    const mouth = api.mesh(new T.CapsuleGeometry(0.42, 0.7, 6, 16), api.mat(0xE87A8C), [0, 7.75, 0.7], tubeG); mouth.rotation.z = Math.PI / 2; api.part(mouth, INFO.mouth);
    const eso = api.mesh(new T.TubeGeometry(C.eso, 60, 0.17, 12), api.mat(GUT), null, tubeG); api.part(eso, INFO.eso);
    const stom = api.group(tubeG); const sm1 = api.mesh(new T.TubeGeometry(C.stom, 60, 0.55, 20), api.mat(0xEE8E96, { opacity: op }), null, stom); const fund = api.sphere(0.72, api.mat(0xEE8E96, { opacity: op }), [1.15, 2.0, 0], stom, 28); api.part(stom, INFO.stom);
    const pyl = api.mesh(new T.TorusGeometry(0.2, 0.08, 8, 20), api.mat(0xC0505A, { emissive: 0xFF6060, emissiveIntensity: 0 }), [0.08, 0.74, 0.2], tubeG); pyl.rotation.y = Math.PI / 2; api.part(pyl, INFO.pylor);
    const duo = api.mesh(new T.TubeGeometry(C.duo, 50, 0.24, 14), api.mat(0xF4B0B6), null, tubeG); api.part(duo, INFO.duo);
    const smallM = api.mesh(new T.TubeGeometry(C.small, 400, 0.2, 12), api.mat(GUT), null, tubeG); api.part(smallM, INFO.small);
    const large = api.mesh(new T.TubeGeometry(C.large, 220, 0.36, 16), api.mat(COLON), null, tubeG); api.part(large, INFO.large);
    const appx = api.tube([[-1.95, -3.55, 0.2], [-1.8, -4.0, 0.3], [-1.6, -4.3, 0.35]], 0.07, COLON, tubeG); api.part(appx, INFO.appx); const appxP = [-1.6, -4.3, 0.35];
    const anus = api.mesh(new T.TorusGeometry(0.2, 0.07, 8, 20), api.mat(0x9A5A42, { emissive: 0xFF6040, emissiveIntensity: 0 }), [0, -4.95, 0], tubeG); anus.rotation.x = Math.PI / 2; api.part(anus, INFO.rect);
    // tuyến
    const gl = api.group(); api.tag(gl, 'gland');
    const sal = api.group(gl); [-1, 1].forEach(s => { api.sphere(0.28, 0xF4D7A1, [s * 0.95, 7.6, -0.1], sal, 14); api.sphere(0.18, 0xF4D7A1, [s * 0.6, 7.25, 0.3], sal, 12); }); api.part(sal, INFO.saliv);
    const liver = api.sphere(1, api.mat(LIVER, { opacity: op, roughness: 0.45 }), [-0.95, 2.35, 0.25], gl, 36); liver.scale.set(1.75, 0.8, 1.05); liver.rotation.z = -0.2; api.part(liver, INFO.liver);
    const gall = api.sphere(0.24, GALL, [-0.55, 1.45, 0.75], gl, 18); gall.scale.set(0.8, 1.3, 0.8); api.part(gall, INFO.gall);
    const panc = api.mesh(new T.CapsuleGeometry(0.2, 1.7, 6, 14), api.mat(PANC), [0.45, -0.05, -0.35], gl); panc.rotation.z = Math.PI / 2 - 0.15; api.part(panc, INFO.panc);
    const bd = api.tube([[-0.8, 1.9, 0.5], [-0.55, 1.2, 0.5], [-0.6, 0.2, 0.25]], 0.04, BILE, gl); api.part(bd, INFO.bileduct);
    // mạch
    const ves = api.group(); api.tag(ves, 'vessel');
    const portal = api.tube([[0, -2.2, -0.25], [-0.2, -0.8, -0.3], [-0.45, 0.8, -0.2], [-0.8, 1.9, -0.05]], 0.07, 0x7A62D6, ves); api.part(portal, INFO.portal);
    const thor = api.tube([[0.1, -2.0, -0.5], [0.25, 0.5, -0.8], [0.35, 4, -0.7], [0.7, 6.2, -0.5], [1.1, 6.4, -0.3]], 0.05, 0xD8E36A, ves); api.part(thor, INFO.thor);
    if (opt && opt.labels) {
      api.label('Khoang miệng', mouth, { off: [1.3, 0.2, 0] }); api.label('Thực quản', [0.1, 5, -0.3], { off: [-1.0, 0, 0], cls: 'plain' }); api.label('Dạ dày', fund, { off: [1.1, 0.5, 0] });
      api.label('Gan', liver, { off: [-1.6, 0.4, 0] }); api.label('Túi mật', gall, { off: [-0.9, -0.2, 0.3], cls: 'plain' }); api.label('Tụy', panc, { off: [1.6, -0.1, 0], cls: 'plain' });
      api.label('Tá tràng', [-0.75, -0.1, 0.05], { off: [-0.9, 0, 0], cls: 'plain' }); api.label('Ruột non', [0, -2, 0.4], { cls: 'tag', color: '#E5737D' }); api.label('Ruột già', [2.25, -1.4, 0.25], { off: [1.1, 0, 0] });
      api.label('Ruột thừa', appxP, { off: [-0.8, -0.3, 0], cls: 'plain' }); api.label('Hậu môn', anus, { off: [0.9, -0.1, 0], cls: 'plain' }); api.label('Tuyến nước bọt', [0.95, 7.6, -0.1], { off: [1.3, 0, 0], cls: 'plain' });
    }
    return { C, stom, sm1, fund, pyl, anus, liver, gall, panc, tubeG, portal, thor };
  }

  // ---------- Tab 1: tổng quan + hành trình ----------
  function overTab(api) {
    const T = api.T, V = api.V;
    const o = overview(api, { labels: true });
    const bolus = api.sphere(0.2, api.mat(0xA9773F, { roughness: 0.9 }), null, null, 18); bolus.userData.noPick = true; bolus.visible = false; bolus.material.depthTest = false; bolus.renderOrder = 10;
    const ring = api.mesh(new T.TorusGeometry(0.26, 0.06, 8, 20), api.mat(0xFF7A85, { emissive: 0xFF3B4B, emissiveIntensity: 0.6 }), null); ring.userData.noPick = true; ring.visible = false; ring.material.depthTest = false; ring.renderOrder = 9;
    const pool = (c, n, r) => { const a = []; for (let k = 0; k < n; k++) { const m = api.sphere(r || 0.06, api.mat(c, { emissive: c, emissiveIntensity: 0.5 }), null, null, 8); m.visible = false; m.userData.noPick = true; api.tag(m, 'nutri'); a.push(m); } return a; };
    const bile = pool(BILE, 12), pj = pool(0xFFFFFF, 12), glu = pool(0xFFF4B0, 16), amino = pool(0x5BB4FF, 14), fat = pool(0xFFC93C, 14, 0.07), water = pool(0x7FD0FF, 14, 0.05), enz = pool(0xD58BFF, 10, 0.05);
    const steps = api.note('');
    let st = -1, u = 0, last = -1, thump = 0, bub = 0;
    const show = () => steps.set(`<b>Hành trình 5 chặng</b><ol class="m3d-steps">${STAGES.map((s, k) => `<li class="${k === st ? 'on' : k < st ? 'done' : ''}"><b>${s[0]}</b>: ${s[1]}</li>`).join('')}</ol>`);
    show();
    const DUR = [4, 6, 4.5, 6, 6];
    const start = () => { st = 0; u = 0; bolus.visible = ring.visible = true; bolus.material.color.set(0xA9773F); bolus.scale.setScalar(1); show(); api.beep(440, 0.1, 'sine', 0.1); };
    api.onFrame(dt => {
      const t = api.time;
      [...bile, ...pj, ...glu, ...amino, ...fat, ...water, ...enz].forEach(m => m.visible = false);
      o.stom.scale.setScalar(1); o.pyl.material.emissiveIntensity = 0; o.anus.material.emissiveIntensity = 0;
      if (st < 0 || st > 4) { api.caption(st > 4 ? 'Hoàn thành hành trình tiêu hóa' : 'Bấm "Bắt đầu hành trình tiêu hóa"'); return; }
      u += dt * pspd / 2 / DUR[st];
      if (st !== last) { last = st; if (st === 1) api.warn('starch', WARN_STARCH, '⚠️ Cảnh báo sinh học'); }
      thump -= dt; if (thump <= 0) { thump = 0.7 / pspd; api.beep(55, 0.18, 'sine', 0.2); }
      const p = Math.min(1, u);
      let pos;
      if (st === 0) { pos = p < 0.25 ? V(0, 7.75, 0.7).add(V(Math.sin(t * 14) * 0.08, 0, 0)) : o.C.eso.getPointAt(sm((p - 0.25) / 0.75)); enz.forEach((m, k) => { if (p < 0.3) { m.visible = true; const a = k * 0.6 + t * 2; m.position.set(Math.cos(a) * 0.6, 7.6 + Math.sin(a * 1.3) * 0.15, 0.4); } }); }
      else if (st === 1) {
        const c = p < 0.8 ? 0 : (p - 0.8) / 0.2; const a = t * 3;
        pos = p < 0.8 ? V(1.1 + Math.cos(a) * 0.35, 1.5 + Math.sin(a) * 0.45, 0.1) : o.C.stom.getPointAt(0.75 + c * 0.25);
        o.stom.scale.setScalar(1 + Math.sin(t * 6 * pspd / 2) * 0.04); o.pyl.material.emissiveIntensity = p > 0.8 ? 0.8 : 0;
        bub -= dt; if (bub <= 0) { bub = 0.25; api.noise(0.05, 0.03, 2800 + Math.random() * 1500); }
        enz.forEach((m, k) => { m.visible = true; const a2 = k * 0.63 + t; m.position.set(1.1 + Math.cos(a2) * 0.55, 1.5 + ((t * 0.6 + k / 10) % 1) * 1.0 - 0.3, 0.3 * Math.sin(a2)); m.material.color.set(0xFF6060); });
        bolus.material.color.set(0xC79A5E); bolus.scale.set(1.2, 0.8, 1.2);
      } else if (st === 2) {
        pos = o.C.duo.getPointAt(p);
        bile.forEach((m, k) => { m.visible = true; const q = (t * 0.8 + k / 12) % 1; m.position.lerpVectors(V(-0.55, 1.4, 0.75), V(-0.6, 0.25, 0.25), q); });
        pj.forEach((m, k) => { m.visible = true; const q = (t * 0.8 + k / 12) % 1; m.position.lerpVectors(V(1.3, -0.05, -0.3), V(-0.6, 0.2, 0.15), q); });
        bub -= dt; if (bub <= 0) { bub = 0.18; api.noise(0.04, 0.025, 1800); }
        bolus.material.color.set(0xD8B46A);
      } else if (st === 3) {
        pos = o.C.small.getPointAt(p);
        const emit = (arr, to, k0) => arr.forEach((m, k) => { m.visible = true; const q = (t * 0.5 + k / arr.length) % 1; const from = o.C.small.getPointAt(((k * 0.137 + k0) % 1)); m.position.lerpVectors(from, to, sm(q)); });
        emit(glu, V(-0.8, 1.9, -0.05), 0.1); emit(amino, V(-0.45, 0.8, -0.2), 0.4); if (path !== 'blood') emit(fat, V(0.35, 4, -0.7), 0.7);
        bolus.scale.setScalar(Math.max(0.5, 1 - p * 0.5));
      } else {
        pos = o.C.large.getPointAt(p);
        water.forEach((m, k) => { m.visible = true; const q = (t * 0.6 + k / 14) % 1; const from = o.C.large.getPointAt((k / 14) * 0.8); m.position.copy(from).add(V(0, 0, -q * 0.9)); });
        bolus.material.color.set(new T.Color(0xD8B46A).lerp(new T.Color(0x5A3B1E), p).getHex()); bolus.scale.setScalar(0.5 + p * 0.1);
        o.anus.material.emissiveIntensity = p > 0.9 ? 0.9 : 0;
      }
      bolus.position.copy(pos); ring.position.copy(pos).add(V(0, 0.22, 0)); ring.rotation.x = Math.PI / 2;
      if (u >= 1) { st++; u = 0; stageDone = Math.max(stageDone, st); show(); if (st > 4) { bolus.visible = ring.visible = false; api.toast('Thức ăn đã đi hết ống tiêu hóa ✔'); api.beep(784, 0.2, 'sine', 0.1); } }
      if (st <= 4) api.caption(`Chặng ${st + 1}/5: ${STAGES[st][0]} · nhu động ${pspd}×`);
    });
    api.button('▶ Bắt đầu hành trình tiêu hóa', () => start());
    api.choices({ label: '🔀 Con đường hấp thụ (chặng 4)', items: [{ t: 'Cả hai', v: 'both' }, { t: '🩸 Máu', v: 'blood' }, { t: '💛 Bạch huyết', v: 'lymph' }], value: path, onPick(v) { path = v; } });
    commonCtl(api, x => { api.setOpacity(o.stom, x); api.setOpacity(o.liver, x); });
    api.view({ pos: [0.6, 1.4, 19], target: [0.6, 1.3, 0], min: 4, max: 30 });
  }

  // ---------- Tab 2: dạ dày bổ dọc, gan – mật – tụy ----------
  function stomTab(api) {
    const T = api.T, V = api.V;
    const cs = curve(T, P_STOM.map(p => [p[0] * 1.8, p[1] * 1.8 - 1.2, 0]));
    const stomG = api.group(); api.tag(stomG, 'tract');
    const layers = [[1.0, 0xE07A84, 'Cơ dọc'], [0.9, 0xC95E6A, 'Cơ vòng'], [0.8, 0xB04A58, 'Cơ chéo']];
    const lay = layers.map(([k, c]) => api.mesh(new T.TubeGeometry(cs, 80, 1.0 * k, 32, false), api.mat(c, { side: T.DoubleSide, opacity: op }), null, stomG));
    const fundL = layers.map(([k, c]) => api.sphere(1.3 * k, api.mat(c, { side: T.DoubleSide, opacity: op }), [2.05, 2.4, 0], stomG, 32));
    const lG = api.group(stomG); lay.forEach(m => lG.attach(m)); fundL.forEach(m => lG.attach(m)); api.part(lG, INFO.layers);
    const rug = api.group(stomG);
    for (let k = 0; k < 7; k++) { const pts = []; for (let j = 0; j <= 20; j++) { const q = 0.05 + j / 20 * 0.85, p = cs.getPointAt(q); pts.push(V(p.x, p.y + (k - 3) * 0.22, -0.55 + Math.sin(j * 0.9 + k) * 0.06)); } api.tube(pts, 0.06, 0xF7B6C0, rug, 60); }
    api.part(rug, INFO.rugae);
    const pyl = api.mesh(new T.TorusGeometry(0.42, 0.14, 10, 24), api.mat(0xA0404E, { emissive: 0xFF6060, emissiveIntensity: 0 }), [0.12, 0.15, 0]); pyl.rotation.y = Math.PI / 2; api.part(pyl, INFO.pylor);
    api.clip(new T.Plane(new T.Vector3(0, 0, -1), 0));
    const duoC = curve(T, [[0.1, 0.15, 0], [-1.0, -0.1, 0.1], [-1.4, -1.4, 0.1], [-0.7, -2.3, 0.15], [0.7, -2.1, 0.1]]);
    const duo = api.mesh(new T.TubeGeometry(duoC, 60, 0.42, 16), api.mat(0xF4B0B6, { side: T.DoubleSide }), null); api.part(duo, INFO.duo); api.tag(duo, 'tract');
    const gl = api.group(); api.tag(gl, 'gland');
    const liver = api.sphere(1, api.mat(LIVER, { opacity: op * 0.8 }), [-2.2, 3.0, -1.2], gl, 36); liver.scale.set(2.3, 1.0, 1.2); api.part(liver, INFO.liver);
    const gall = api.sphere(0.45, GALL, [-1.6, 1.4, -0.4], gl, 20); gall.scale.set(0.8, 1.35, 0.8); api.part(gall, INFO.gall);
    const pap = V(-1.38, -1.15, -0.3);
    const ducts = api.group(gl);
    const dHL = [[-3.0, 2.6, -0.9], [-2.3, 2.0, -0.7]], dHR = [[-1.6, 2.6, -0.9], [-2.0, 2.0, -0.7]];
    api.tube([...dHL, [-2.1, 1.5, -0.6]], 0.08, BILE, ducts); api.tube([...dHR, [-2.1, 1.5, -0.6]], 0.08, BILE, ducts);
    api.tube([[-2.1, 1.5, -0.6], [-1.9, 0.4, -0.5], [-1.6, -0.6, -0.4], [pap.x, pap.y, pap.z]], 0.1, BILE, ducts);
    api.tube([[-1.6, 1.05, -0.4], [-1.85, 0.7, -0.5], [-1.95, 0.5, -0.5]], 0.07, BILE, ducts);
    api.part(ducts, INFO.bileduct);
    const panc = api.mesh(new T.CapsuleGeometry(0.42, 3.2, 8, 16), api.mat(PANC, { opacity: 0.85 }), [0.8, -1.3, -0.8], gl); panc.rotation.z = Math.PI / 2 - 0.1; api.part(panc, INFO.panc);
    const pd = api.tube([[2.5, -1.15, -0.5], [0.8, -1.25, -0.45], [-0.6, -1.25, -0.4], [pap.x, pap.y, pap.z]], 0.07, 0xFFF2C4, gl); api.part(pd, INFO.pduct);
    const papM = api.sphere(0.14, api.mat(0xFFD84A, { emissive: 0xFFB000, emissiveIntensity: 0.5 }), [pap.x, pap.y, pap.z], gl, 12); api.part(papM, INFO.papilla);
    // hạt động
    const pool = (c, n, r) => { const a = []; for (let k = 0; k < n; k++) { const m = api.sphere(r, api.mat(c, { emissive: c, emissiveIntensity: 0.5 }), null, null, 8); m.userData.noPick = true; api.tag(m, 'nutri'); a.push(m); } return a; };
    const hcl = pool(0xFF6B6B, 24, 0.06), bile = pool(BILE, 14, 0.07), pj = pool(0xFFFFFF, 14, 0.06), chyme = pool(0xD8B46A, 6, 0.16);
    const bileC = curve(T, [[-1.6, 1.4, -0.4], [-1.95, 0.5, -0.5], [-1.9, 0.4, -0.5], [-1.6, -0.6, -0.4], [pap.x, pap.y, pap.z]]), pjC = curve(T, [[2.5, -1.15, -0.5], [0.8, -1.25, -0.45], [-0.6, -1.25, -0.4], [pap.x, pap.y, pap.z]]);
    api.label('Cơ dọc · cơ vòng · cơ chéo', [3.2, 1.6, 0], { cls: 'plain' }); api.label('Nếp gấp niêm mạc', [1.8, 1.0, -0.5], { cls: 'tag', color: '#E5737D' }); api.label('Môn vị', pyl, { off: [0, 0.8, 0], cls: 'plain' });
    api.label('Gan', liver, { off: [-1.5, 0.9, 0] }); api.label('Túi mật', gall, { off: [-1.1, 0, 0.4], cls: 'plain' }); api.label('Ống mật chủ', [-1.7, -0.4, -0.4], { off: [-1.1, 0, 0], cls: 'tag', color: '#5E9E3E' });
    api.label('Tụy', panc, { off: [1.4, -0.6, 0] }); api.label('Ống tụy', [1.6, -1.2, -0.45], { cls: 'tag', color: '#C9A100', off: [0, -0.4, 0] }); api.label('Nhú tá lớn', papM, { off: [-0.8, -0.5, 0], cls: 'tag', color: '#E0A100' }); api.label('Tá tràng', [-0.7, -2.3, 0.15], { off: [0, -0.6, 0], cls: 'plain' });
    let bub = 0;
    api.onFrame(dt => {
      const t = api.time, k = pspd;
      lG.scale.set(1 + Math.sin(t * 3 * k) * 0.03, 1 + Math.sin(t * 3 * k + 1) * 0.025, 1);
      hcl.forEach((m, j) => { const q = (t * 0.3 * k + j / 24) % 1; const p = cs.getPointAt(0.1 + (j / 24) * 0.75); m.position.set(p.x + Math.sin(j) * 0.3, p.y - 0.55 + q * 1.1, -0.4 + Math.cos(j) * 0.2); });
      bile.forEach((m, j) => m.position.copy(bileC.getPointAt((t * 0.18 * k + j / 14) % 1)));
      pj.forEach((m, j) => m.position.copy(pjC.getPointAt((t * 0.18 * k + j / 14) % 1)));
      const open = Math.sin(t * 1.2 * k) > 0.6;
      pyl.material.emissiveIntensity = open ? 0.9 : 0; pyl.scale.setScalar(open ? 1.25 : 1);
      chyme.forEach((m, j) => { const q = (t * 0.12 * k + j / 6) % 1; m.position.copy(q < 0.5 ? cs.getPointAt(0.6 + q * 0.8) : duoC.getPointAt((q - 0.5) * 2)); });
      bub -= dt; if (bub <= 0) { bub = 0.3 / k; api.noise(0.04, 0.02, 2600 + Math.random() * 1500); }
      api.caption(open ? 'Môn vị mở: một đợt dưỡng chấp xuống tá tràng' : 'Dạ dày co bóp, HCl và pepsin; mật và dịch tụy đổ vào nhú tá lớn');
    });
    commonCtl(api, x => { lay.forEach(m => api.setOpacity(m, x)); fundL.forEach(m => api.setOpacity(m, x)); api.setOpacity(liver, x * 0.8); });
    api.view({ pos: [0.4, 0.6, 14], target: [0.2, 0.2, 0], min: 4, max: 26 });
  }

  // ---------- Tab 3: nhung mao, vi nhung mao ----------
  function foldsLv(api) {
    const T = api.T;
    const g = api.group(); api.tag(g, 'villi');
    const wall = api.mesh(new T.CylinderGeometry(3, 3, 9, 48, 1, true, Math.PI, Math.PI), api.mat(0xF2A0A8, { side: T.DoubleSide }), [0, 0, 0], g); wall.rotation.z = Math.PI / 2; api.part(wall, INFO.small);
    for (let k = 0; k < 8; k++) { const f = api.mesh(new T.TorusGeometry(2.75, 0.22, 10, 40, Math.PI), api.mat(0xF7B6C0), [-3.6 + k * 1.03, 0, 0], g); f.rotation.y = Math.PI / 2; f.rotation.z = Math.PI; }
    const im = new T.InstancedMesh(new T.CylinderGeometry(0.03, 0.04, 0.22, 5), api.mat(0xFFC9D0), 1600); const M = new T.Matrix4(), Q = new T.Quaternion(), rnd = api.rand(2); let n = 0;
    for (let k = 0; k < 1600; k++) { const x = (rnd() - 0.5) * 8.6, a = Math.PI + 0.1 + rnd() * (Math.PI - 0.2), r = 2.9; const p = new T.Vector3(x, Math.sin(a) * r, Math.cos(a) * r); Q.setFromUnitVectors(new T.Vector3(0, 1, 0), p.clone().setX(0).normalize().negate()); M.compose(p, Q, new T.Vector3(1, 1, 1)); im.setMatrixAt(n++, M); }
    api.root.add(im); im.userData.group = 'villi'; api.part(im, INFO.villus);
    api.label('Nếp gấp vòng: tăng diện tích ×3', [0, -2.4, 0], { cls: 'tag', color: '#E5737D', off: [0, 0, 0.5] }); api.label('Mỗi chấm nhỏ là một nhung mao', [2.5, -2.8, 1], { cls: 'plain' });
    api.caption('Niêm mạc ruột non có nếp gấp vòng, trên đó phủ kín nhung mao');
    api.view({ pos: [0, 3.5, 8], target: [0, -1.5, 0], min: 2, max: 18 });
  }
  function villiLv(api) {
    const T = api.T, V = api.V, rnd = api.rand(6);
    const base = api.box(10, 0.6, 6, 0xF2A0A8, [0, -0.3, 0]); api.tag(base, 'villi'); base.userData.noPick = true;
    const vg = api.group(); api.tag(vg, 'villi');
    for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) { const x = -4.2 + i * 1.4, z = -2.2 + j * 1.45; if (Math.abs(x) < 0.8 && Math.abs(z - 0.7) < 0.9) continue; const m = api.mesh(new T.CapsuleGeometry(0.42, 2.4, 6, 14), api.mat(0xF7B6C0), [x + (rnd() - 0.5) * 0.2, 1.5, z], vg); m.scale.y = 0.9 + rnd() * 0.2; }
    api.part(vg, INFO.villus);
    // nhung mao bổ dọc ở giữa
    const cut = api.group(null, [0, 0, 0.7]);
    const skin = api.mesh(new T.CapsuleGeometry(0.75, 3.4, 8, 24), api.mat(0xF7B6C0, { opacity: 0.28 * op, depthWrite: false, side: T.DoubleSide }), [0, 2, 0], cut); api.part(skin, INFO.villus); api.tag(skin, 'villi');
    const vess = api.group(cut); api.tag(vess, 'vessel');
    const cap = []; for (let k = 0; k < 2; k++) { const pts = []; for (let j = 0; j <= 30; j++) { const q = j / 30, a = q * Math.PI * 7 + k * Math.PI; pts.push(V(Math.cos(a) * 0.5, -0.1 + q * 3.9 * (k ? -1 : 1) + (k ? 3.8 : 0), Math.sin(a) * 0.5)); } cap.push(curve(T, pts.map(p => [p.x, p.y, p.z]))); }
    const capM = cap.map((c, k) => api.mesh(new T.TubeGeometry(c, 160, 0.05, 6), k ? 0x4D6FD6 : 0xE8343A, null, vess));
    api.part(capM[0], INFO.capil); api.part(capM[1], INFO.capil);
    const lac = api.mesh(new T.CapsuleGeometry(0.16, 3.2, 6, 12), api.mat(0xE6EE7A, { opacity: 0.85 }), [0, 1.9, 0], vess); api.part(lac, INFO.lacteal);
    const art = api.tube([[0.5, -0.1, 0], [0.9, -0.5, 0], [2.5, -0.55, 0.4]], 0.08, 0xE8343A, vess), vein = api.tube([[-0.5, -0.1, 0], [-0.9, -0.5, 0], [-2.8, -0.55, 0.4]], 0.08, 0x4D6FD6, vess), lout = api.tube([[0, 0.1, 0], [0, -0.55, 0], [0, -0.6, 2.4]], 0.08, 0xE6EE7A, vess);
    [art, vein, lout].forEach(m => m.userData.noPick = true);
    const pool = (c, n, r, geo) => { const a = []; for (let k = 0; k < n; k++) { const m = geo ? api.mesh(geo, api.mat(c, { emissive: c, emissiveIntensity: 0.5 }), null, null) : api.sphere(r, api.mat(c, { emissive: c, emissiveIntensity: 0.5 }), null, null, 8); m.userData.noPick = true; api.tag(m, 'nutri'); a.push(m); } return a; };
    const glu = pool(0xFFFFFF, 14, 0, new T.BoxGeometry(0.12, 0.12, 0.12)), amino = pool(0x5BB4FF, 12, 0.07), fat = pool(0xFFC93C, 14, 0.09), vit = pool(0xFF8A3C, 6, 0.06);
    const out = { b: V(-2.8, -0.55, 1.1), l: V(0, -0.6, 3.1) };
    api.label('Mao mạch máu', capM[0], { off: [1.4, 1.4, 0], cls: 'tag', color: '#E8343A' }); api.label('Mạch bạch huyết trung tâm', lac, { off: [-2.0, 1.2, 0], cls: 'tag', color: '#B5B800' });
    api.label('→ Tĩnh mạch cửa → Gan → Tim', out.b, { cls: 'plain', off: [-0.6, -0.3, 0], parent: null }); api.label('→ Ống ngực → TM dưới đòn → Tim', out.l, { cls: 'plain', off: [0, -0.4, 0] });
    api.label('Glucose ▫  Amino acid ●  Lipid ●', [0, 5.4, 0.7], { cls: 'plain' });
    api.onFrame(() => {
      const t = api.time, sp = pspd / 2;
      const flow = (arr, inner, k0, dest) => arr.forEach((m, k) => {
        const q = (t * 0.22 * sp + k / arr.length + k0) % 1; const top = V(Math.sin(k * 2.3) * 1.4, 5 - 0.2 * Math.cos(k), 0.7 + Math.cos(k * 1.7) * 0.8);
        if (q < 0.35) m.position.lerpVectors(top, V(Math.sin(k) * 0.4, 3.4 - (k % 4) * 0.5, 0.7 + Math.cos(k) * 0.4), sm(q / 0.35));
        else if (q < 0.75) m.position.copy(inner((q - 0.35) / 0.4, k).add(V(0, 0, 0.7)));
        else m.position.lerpVectors(inner(1, k).add(V(0, 0, 0.7)), dest, sm((q - 0.75) / 0.25));
      });
      const bl = (q, k) => cap[1].getPointAt(Math.min(1, 0.1 + q * 0.9 * (0.6 + (k % 3) * 0.13))), ly = q => V(0, 3.3 - q * 3.4, 0);
      glu.forEach(m => m.visible = path !== 'lymph'); amino.forEach(m => m.visible = path !== 'lymph'); vit.forEach(m => m.visible = path !== 'lymph');
      fat.forEach(m => m.visible = path !== 'blood');
      flow(glu, bl, 0, out.b); flow(amino, bl, 0.37, out.b); flow(vit, bl, 0.61, out.b); flow(fat, (q) => ly(q), 0.2, out.l);
      api.caption(path === 'blood' ? 'Con đường máu: glucose, amino acid, vitamin B, C, nước, khoáng → mao mạch → tĩnh mạch cửa → gan' : path === 'lymph' ? 'Con đường bạch huyết: acid béo + glycerol, vitamin A, D, E, K → mạch bạch huyết → ống ngực → tim' : 'Nhung mao: chất tan trong nước vào máu, lipid vào mạch bạch huyết');
    });
    api.choices({ label: '🔀 Con đường hấp thụ', items: [{ t: 'Cả hai', v: 'both' }, { t: '🩸 Máu', v: 'blood' }, { t: '💛 Bạch huyết', v: 'lymph' }], value: path, onPick(v) { path = v; } });
    api.view({ pos: [0, 7, 11], target: [0, 1.8, 0.7], min: 3, max: 22 });
    return x => api.setOpacity(skin, 0.28 * x / 0.28);
  }
  function microLv(api) {
    const T = api.T, V = api.V, rnd = api.rand(8);
    const cells = api.group(); api.tag(cells, 'villi');
    for (let k = -2; k <= 2; k++) { const c = api.box(1.8, 4, 1.8, api.mat(k ? 0xF2B8C2 : 0xF7C9D2, { opacity: k ? 0.9 : 1 }), [k * 1.85, -1, 0], cells); api.sphere(0.4, 0x7A4FB5, [k * 1.85, -2, 0], cells, 14); if (!k) api.part(c, INFO.cell); }
    const N = 25 * 25, im = new T.InstancedMesh(new T.CapsuleGeometry(0.05, 0.55, 3, 6), api.mat(0xFFD6DE), N); const M = new T.Matrix4(); let n = 0;
    for (let i = 0; i < 50; i++) for (let j = 0; j < 9; j++) { M.makeTranslation(-4.5 + i * 0.184 + (j % 2) * 0.09, 1.32, -0.82 + j * 0.205); im.setMatrixAt(n++, M); }
    im.count = n; api.root.add(im); im.userData.group = 'villi'; api.part(im, INFO.micro);
    const enz = []; for (let k = 0; k < 30; k++) { const m = api.sphere(0.07, api.mat(0xC78BFF, { emissive: 0xC78BFF, emissiveIntensity: 0.4 }), [-4.4 + rnd() * 8.8, 1.2 + rnd() * 0.5, -0.8 + rnd() * 1.6], null, 8); m.userData.noPick = true; enz.push(m); }
    const malt = [], gl = []; for (let k = 0; k < 8; k++) { const g = api.group(); api.box(0.14, 0.14, 0.14, 0xFFFFFF, [-0.09, 0, 0], g); api.box(0.14, 0.14, 0.14, 0xFFFFFF, [0.09, 0, 0], g); g.traverse(o => o.userData.noPick = true); malt.push(g); gl.push(api.box(0.14, 0.14, 0.14, api.mat(0xFFFFFF, { emissive: 0xFFF4B0, emissiveIntensity: 0.6 }), null), api.box(0.14, 0.14, 0.14, api.mat(0xFFFFFF, { emissive: 0xFFF4B0, emissiveIntensity: 0.6 }), null)); }
    gl.forEach(m => m.userData.noPick = true);
    api.label('Vi nhung mao (×600)', [3.5, 1.8, 0], { cls: 'tag', color: '#E5737D' }); api.label('Enzyme màng: maltase, sucrase, lactase', [-3.6, 2.4, 0], { cls: 'plain' }); api.label('Tế bào biểu mô ruột', [0, -3.4, 1], { cls: 'plain' });
    api.onFrame(() => {
      const t = api.time;
      malt.forEach((g, k) => {
        const q = (t * 0.2 * pspd / 2 + k / 8) % 1, x = -3.5 + k;
        g.visible = q < 0.5; g.position.set(x, 3.6 - q * 4, 0);
        const a = gl[k * 2], b = gl[k * 2 + 1]; a.visible = b.visible = q >= 0.5;
        if (q >= 0.5) { const r = (q - 0.5) * 2; a.position.set(x - 0.1 - r * 0.2, 1.6 - r * 3.2, 0.1); b.position.set(x + 0.1 + r * 0.2, 1.6 - r * 3.4, -0.1); }
      });
      api.caption('Maltase trên màng vi nhung mao cắt maltose thành 2 glucose rồi tế bào hấp thụ vào');
    });
    api.view({ pos: [0, 2.5, 9], target: [0, 0.6, 0], min: 2, max: 18 });
  }
  function villiTab(api) {
    api.levels(['Nếp gấp ×3', 'Nhung mao ×30', 'Vi nhung mao ×600'], lv, n => { lv = n; api.setTab(api.tab); });
    let f = null;
    if (lv === 0) foldsLv(api); else if (lv === 1) f = villiLv(api); else microLv(api);
    commonCtl(api, x => f && f(x));
  }

  function commonCtl(api, onOp) {
    api.slider({ label: '🌀 Tốc độ nhu động', min: 1, max: 5, step: 1, value: pspd, unit: '×', lazy: true, onInput(v) { pspd = v; } });
    api.slider({ label: 'Độ trong suốt dạ dày và gan', min: 0, max: 100, step: 5, value: Math.round((1 - op) * 100), unit: '%', lazy: true, onInput(v) { op = Math.max(0.05, 1 - v / 100); onOp(op); } });
    api.checklist([
      { k: 'tract', label: 'Ống tiêu hóa (Miệng → Hậu môn)' }, { k: 'gland', label: 'Các tuyến tiêu hóa (Nước bọt, Gan, Túi mật, Tụy)' },
      { k: 'vessel', label: 'Mạch máu và Mạch bạch huyết' }, { k: 'villi', label: 'Lớp nhung mao và vi nhung mao' }, { k: 'nutri', label: 'Hạt chất dinh dưỡng' }
    ]);
  }

  function chartSVG() {
    const W = 640, H = 300, L = 46, mid = 330;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:${H}px;font-family:'Baloo 2',sans-serif">`;
    s += `<text x="${L}" y="18" font-size="13" font-weight="800" fill="#1F4E79">Độ pH dọc ống tiêu hóa</text>`;
    const X = k => L + k * ((mid - L - 20) / 5), Y = v => 250 - v / 9 * 210;
    [0, 2, 4, 6, 8].forEach(v => { s += `<line x1="${L}" x2="${mid - 20}" y1="${Y(v)}" y2="${Y(v)}" stroke="#E3ECF4"/><text x="${L - 8}" y="${Y(v) + 4}" font-size="11" fill="#6C88A3" text-anchor="end">${v}</text>`; });
    s += `<polyline fill="none" stroke="#E5534B" stroke-width="3" points="${PH.map((p, k) => `${X(k)},${Y(p[1])}`).join(' ')}"/>`;
    PH.forEach((p, k) => { s += `<circle cx="${X(k)}" cy="${Y(p[1])}" r="4.5" fill="#E5534B"/><text x="${X(k)}" y="${Y(p[1]) - 9}" font-size="11" font-weight="800" fill="#E5534B" text-anchor="middle">${p[1]}</text><text x="${X(k)}" y="272" font-size="10.5" fill="#6C88A3" text-anchor="middle">${p[0]}</text>`; });
    const BX = mid + 30, bw = (W - BX - 10) / 6;
    s += `<text x="${BX}" y="18" font-size="13" font-weight="800" fill="#1F4E79">Chất chưa phân giải (%) sau từng chặng</text>`;
    const cols = ['#F2C46D', '#5BB4FF', '#E5737D'], names = ['Tinh bột', 'Protein', 'Lipid'];
    LEFT.forEach((row, k) => { row.forEach((v, j) => { const h = v / 100 * 200, x = BX + k * bw + j * (bw - 8) / 3 + 2; s += `<rect x="${x}" y="${250 - h}" width="${(bw - 8) / 3 - 1}" height="${h}" rx="2" fill="${cols[j]}" opacity="${k <= stageDone ? 1 : 0.35}"/>`; }); s += `<text x="${BX + k * bw + bw / 2 - 3}" y="272" font-size="10.5" fill="#6C88A3" text-anchor="middle">${k ? 'Sau ' + k : 'Ban đầu'}</text>`; });
    names.forEach((nm, j) => { s += `<rect x="${BX + j * 92}" y="282" width="12" height="12" rx="3" fill="${cols[j]}"/><text x="${BX + 16 + j * 92}" y="293" font-size="11" fill="#1F4E79">${nm}</text>`; });
    return s + '</svg>';
  }

  NL.m3d.register('M7', {
    title: 'Hệ tiêu hóa',
    tabs: [{ t: '🍽️ Ống & tuyến tiêu hóa', v: 'over' }, { t: '🫃 Dạ dày – gan – tụy', v: 'stom' }, { t: '🔬 Nhung mao ruột', v: 'villi' }],
    init() { lv = 1; },
    build(api, tab) { if (tab === 'over') overTab(api); else if (tab === 'stom') stomTab(api); else villiTab(api); },
    data() {
      return {
        title: 'Tiêu hóa cơ học, hóa học và hấp thụ',
        sub: `Đã đi qua ${stageDone}/5 chặng · Nhu động ${pspd}×`,
        sheets: [
          { name: 'Các giai đoạn', head: ['STT', 'Vị trí ống tiêu hóa', 'Hoạt động Tiêu hóa Cơ học', 'Hoạt động Tiêu hóa Hóa học (Enzyme & Dịch)', 'Sản phẩm Biến đổi cuối cùng'], rows: [
            [1, 'Khoang miệng', 'Răng nhai nghiền, lưỡi đảo trộn, tạo viên thức ăn', 'Amylase nước bọt (pH 6,8)', 'Một phần tinh bột chín → maltose'],
            [2, 'Thực quản', 'Nhu động đẩy viên thức ăn', 'Không', 'Không đổi'],
            [3, 'Dạ dày', '3 lớp cơ co bóp nhào trộn; môn vị mở từng đợt', 'HCl, pepsin (pH 1,5 – 2,0); amylase bị bất hoạt', 'Protein → polypeptide ngắn; dưỡng chấp'],
            [4, 'Tá tràng', 'Nhu động; mật nhũ tương hóa lipid', 'Dịch tụy: trypsin, chymotrypsin, lipase, amylase; dịch ruột (pH ≈ 8)', 'Polypeptide → amino acid; lipid → acid béo + glycerol; tinh bột → maltose → glucose'],
            [5, 'Ruột non', 'Nhu động, co thắt từng đoạn', 'Maltase, sucrase, lactase, peptidase trên vi nhung mao', 'Đơn phân được hấp thụ qua nhung mao'],
            [6, 'Ruột già', 'Co bóp chậm, cô đặc', 'Không tiết enzyme; vi khuẩn lên men', 'Hấp thu 90% nước còn lại, muối; tạo phân']] },
          { name: 'Enzyme', head: ['Enzyme', 'Nguồn tiết', 'Cơ chất', 'Sản phẩm', 'pH hoạt động'], rows: [
            ['Amylase nước bọt', 'Tuyến nước bọt', 'Tinh bột chín', 'Maltose', '6,8 – 7'], ['Pepsin', 'Tuyến vị (dạ dày)', 'Protein', 'Polypeptide ngắn', '1,5 – 2'],
            ['Trypsin, chymotrypsin', 'Tụy', 'Protein, polypeptide', 'Peptide ngắn', '≈ 8'], ['Lipase', 'Tụy', 'Lipid (đã nhũ tương hóa)', 'Acid béo + glycerol', '≈ 8'],
            ['Amylase tụy', 'Tụy', 'Tinh bột', 'Maltose', '≈ 8'], ['Maltase', 'Ruột non (vi nhung mao)', 'Maltose', '2 glucose', '7 – 8'],
            ['Sucrase', 'Ruột non', 'Saccharose', 'Glucose + fructose', '7 – 8'], ['Lactase', 'Ruột non', 'Lactose', 'Glucose + galactose', '7 – 8'], ['Dịch mật (không phải enzyme)', 'Gan, chứa ở túi mật', 'Lipid', 'Giọt mỡ nhỏ (nhũ tương)', '7 – 8']] },
          { name: 'Hấp thụ', head: ['Chất dinh dưỡng', 'Con đường', 'Đường đi về tim'], rows: [
            ['Glucose', 'Máu', 'Mao mạch → tĩnh mạch cửa → gan → tĩnh mạch chủ dưới → tim'], ['Amino acid', 'Máu', 'Như trên'], ['Vitamin B, C; nước; khoáng', 'Máu', 'Như trên'],
            ['Acid béo + glycerol', 'Bạch huyết', 'Mạch bạch huyết trung tâm → ống ngực → tĩnh mạch dưới đòn → tim'], ['Vitamin A, D, E, K', 'Bạch huyết', 'Như trên']] },
          { name: 'pH và dinh dưỡng', head: ['Vị trí / Chặng', 'pH', 'Tinh bột còn lại (%)', 'Protein còn lại (%)', 'Lipid còn lại (%)'], rows: PH.map((p, k) => [p[0], p[1], ...LEFT[k]]) }
        ],
        chart: { svg: chartSVG() }
      };
    },
    liveData: true
  });
})();
