// Mô hình 9: Mắt và tai. Kéo vật để mắt tự điều tiết (1/f = 1/d + 1/d′), cận / viễn thị và kính, võng mạc que – nón, mù màu; tai 3 phần, sóng âm và vị trí cảm nhận trên ốc tai; cơ quan Corti, kênh K⁺, tiếng ồn làm gãy lông tơ.
(function () {
  const INFO = {
    cornea: { name: 'Giác mạc', sci: 'Cornea', rows: [['Đặc điểm', 'Trong suốt, cong, không có mạch máu'], ['Vai trò', 'Khúc xạ ánh sáng mạnh nhất (≈ 43 điốp)']] },
    iris: { name: 'Mống mắt và đồng tử', sci: 'Iris & Pupil', rows: [['Vai trò', 'Điều chỉnh lượng ánh sáng vào mắt'], ['Sáng mạnh', 'Đồng tử co nhỏ'], ['Tối', 'Đồng tử dãn to']] },
    lens: { name: 'Thủy tinh thể', sci: 'Lens', rows: [['Bản chất', 'Thấu kính hội tụ trong suốt, đàn hồi'], ['Nhìn gần', 'Phồng lên, tăng độ cong → tăng độ tụ'], ['Nhìn xa', 'Xẹp mỏng, giảm độ tụ'], ['Công thức', '1/f = 1/d + 1/d′']] },
    cil: { name: 'Cơ thể mi và dây treo', sci: 'Ciliary body & Zinn zonules', rows: [['Nhìn gần', 'Cơ thể mi co → dây treo chùng → thủy tinh thể phồng'], ['Nhìn xa', 'Cơ thể mi dãn → dây treo căng → thủy tinh thể xẹp']] },
    vit: { name: 'Thể thủy tinh', sci: 'Corpus vitreum', rows: [['Bản chất', 'Chất keo trong suốt'], ['Vai trò', 'Giữ hình dạng cầu mắt, cho ánh sáng đi qua']] },
    retina: { name: 'Võng mạc', sci: 'Retina', rows: [['Chứa', 'Tế bào que (≈ 120 triệu) và tế bào nón (≈ 6 triệu)'], ['Vai trò', 'Biến ánh sáng thành xung thần kinh']] },
    fovea: { name: 'Hoàng điểm (điểm vàng)', sci: '', rows: [['Đặc điểm', 'Tập trung nhiều tế bào nón. Riêng hố trung tâm ở giữa hoàng điểm chỉ có tế bào nón, không có tế bào que'], ['Vai trò', 'Nơi nhìn rõ nhất, cảm nhận màu']] },
    blind: { name: 'Điểm mù', sci: 'Optic disc', rows: [['Đặc điểm', 'Nơi dây thần kinh thị giác đi ra, không có tế bào thụ cảm'], ['Kết quả', 'Ảnh rơi vào đây không được nhìn thấy']] },
    optic: { name: 'Dây thần kinh thị giác', sci: 'Nervus opticus', rows: [['Dẫn', 'Xung từ tế bào hạch võng mạc về vỏ não thị giác (thùy chẩm)']] },
    rod: { name: 'Tế bào que', sci: 'Rod cell', rows: [['Sắc tố', 'Rhodopsin'], ['Nhạy', 'Ánh sáng yếu (nhìn lúc chạng vạng), không phân biệt màu'], ['Bước sóng nhạy nhất', '≈ 498 nm']] },
    cone: { name: 'Tế bào nón', sci: 'Cone cell (S, M, L)', rows: [['Sắc tố', 'Photopsin'], ['Loại', 'Nón xanh lam ≈ 420 nm, xanh lục ≈ 534 nm, đỏ ≈ 564 nm'], ['Vai trò', 'Nhìn màu và nhìn rõ chi tiết khi đủ sáng']] },
    bip: { name: 'Tế bào hai cực', sci: 'Bipolar cell', rows: [['Vai trò', 'Nhận tín hiệu từ que, nón truyền tới tế bào hạch']] },
    gang: { name: 'Tế bào hạch', sci: 'Ganglion cell', rows: [['Vai trò', 'Phát điện thế hoạt động; sợi trục họp thành dây thần kinh thị giác']] },
    pinna: { name: 'Vành tai', sci: 'Auricula', rows: [['Vai trò', 'Hứng sóng âm, hướng vào ống tai']] },
    canal: { name: 'Ống tai ngoài', sci: 'Meatus acusticus externus', rows: [['Dài', '≈ 2,5 cm'], ['Có', 'Lông và tuyến ráy tai giữ bụi']] },
    drum: { name: 'Màng nhĩ', sci: 'Membrana tympani', rows: [['Vai trò', 'Rung theo sóng âm, truyền vào chuỗi xương tai'], ['Diện tích', 'Lớn gấp ≈ 18 – 20 lần cửa sổ bầu dục']] },
    oss: { name: 'Chuỗi xương tai', sci: 'Malleus – Incus – Stapes', rows: [['Gồm', 'Xương búa, xương đe, xương bàn đạp'], ['Vai trò', 'Đòn bẩy tăng lực rung ≈ 1,3 lần; cộng với màng nhĩ rộng gấp ≈ 17–20 lần cửa sổ bầu dục, áp lực tăng tổng cộng ≈ 20 lần'], ['Xương bàn đạp', 'Xương nhỏ nhất cơ thể, ấn vào cửa sổ bầu dục']] },
    eus: { name: 'Vòi nhĩ (Eustache)', sci: 'Tuba auditiva', rows: [['Nối', 'Tai giữa với họng'], ['Vai trò', 'Cân bằng áp suất 2 bên màng nhĩ']] },
    semi: { name: 'Ống bán khuyên', sci: 'Canales semicirculares', rows: [['Số lượng', '3 ống trên 3 mặt phẳng vuông góc'], ['Vai trò', 'Thăng bằng, cảm nhận chuyển động quay của đầu']] },
    coch: { name: 'Ốc tai', sci: 'Cochlea', rows: [['Hình dạng', 'Ống xoắn ≈ 2,5 vòng'], ['Chứa', 'Cơ quan Corti trên màng cơ sở'], ['Âm cao', 'Rung mạnh ở đáy ốc tai'], ['Âm thấp', 'Rung mạnh ở đỉnh ốc tai']] },
    anerve: { name: 'Dây thần kinh thính giác', sci: 'Nervus cochlearis', rows: [['Dẫn', 'Xung về vỏ não thính giác (thùy thái dương)']] },
    basilar: { name: 'Màng cơ sở', sci: 'Basilar membrane', rows: [['Đặc điểm', 'Hẹp và cứng ở đáy, rộng và mềm ở đỉnh ốc tai'], ['Vai trò', 'Dao động theo sóng dịch, mỗi tần số rung mạnh nhất ở một vị trí']] },
    tect: { name: 'Màng mái', sci: 'Tectorial membrane', rows: [['Vị trí', 'Phía trên tế bào lông, chạm đỉnh lông tơ'], ['Vai trò', 'Khi màng cơ sở rung, lông tơ cọ vào màng mái và bị bẻ cong']] },
    ihc: { name: 'Tế bào lông trong', sci: 'Inner hair cells (1 hàng)', rows: [['Số lượng', '≈ 3 500'], ['Vai trò', 'Thụ cảm chính, truyền ≈ 95% thông tin âm thanh lên não']] },
    ohc: { name: 'Tế bào lông ngoài', sci: 'Outer hair cells (3 hàng)', rows: [['Số lượng', '≈ 12 000'], ['Vai trò', 'Khuếch đại dao động, tăng độ nhạy']] },
    stereo: { name: 'Lông tơ', sci: 'Stereocilia', rows: [['Cơ chế', 'Bị bẻ cong → kéo mở kênh K⁺ cảm ứng cơ học ở đỉnh'], ['Tổn thương', 'Tiếng ồn > 85 dB kéo dài làm gãy vĩnh viễn, không mọc lại']] },
    kch: { name: 'Kênh K⁺ cảm ứng cơ học', sci: 'Mechanotransduction channel', rows: [['Mở khi', 'Lông tơ nghiêng về phía lông cao hơn'], ['Kết quả', 'K⁺ từ nội dịch tràn vào → khử cực tế bào lông → giải phóng chất dẫn truyền']] }
  };
  const WARN_NEAR = 'Cảnh báo sinh lí: Vật thể ở gần hơn điểm cực cận của mắt, cơ thể mi đã co tối đa làm thủy tinh thể phồng hết cỡ nhưng ảnh vẫn rơi phía sau võng mạc khiến hình ảnh bị mờ!';
  const WARN_NOISE = 'Cảnh báo thính giác: Âm thanh trên 85 dB kéo dài làm các lông tơ của tế bào lông bị gãy rụng vĩnh viễn (không mọc lại), dẫn đến giảm thính lực, có thể điếc. Hãy tránh nơi quá ồn và không nghe tai nghe quá to!';

  let dist = 2, defect = 'normal', glasses = false, cb = 'none', eyeView = 'eye', freq = 1000, dB = 60, tone = false, damage = 0;
  const RET = { normal: 0.017, myopia: 0.0185, hyper: 0.0155 };
  const PMIN = 1 / 0.017, PMAX = PMIN + 10;
  function optics(d) {
    const dr = RET[defect], g = glasses && defect !== 'normal' ? (defect === 'myopia' ? -4.8 : 4.0) : 0;
    const need = 1 / d + 1 / dr - g, P = Math.max(PMIN, Math.min(PMAX, need));
    const di = 1 / (P + g - 1 / d);
    return { P, g, di, dr, off: di - dr, acc: P - PMIN };
  }
  const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const tonoPos = f => Math.log(f / 20) / Math.log(1000); // 0 = đáy (âm cao)? → ta đảo: 1 = âm cao ở đáy

  // ---------- Tab 1: mắt ----------
  function eyeTab(api) {
    if (eyeView === 'retina') return retinaView(api);
    const T = api.T, V = api.V, LX = -1.6, U = 250;
    const eye = api.group(); api.tag(eye, 'eye');
    const ball = api.sphere(2.9, api.mat(0xF5F5F0, { opacity: 0.14, depthWrite: false, side: T.DoubleSide }), [-0.25, 0, 0], eye, 48); ball.userData.noPick = true;
    const vit = api.sphere(2.75, api.mat(0xBFE3FF, { opacity: 0.06, depthWrite: false }), [-0.2, 0, 0], eye, 40); api.part(vit, INFO.vit);
    const cornea = api.mesh(new T.SphereGeometry(1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.32), api.mat(0xBFE6FF, { opacity: 0.35, depthWrite: false, side: T.DoubleSide }), [-1.95, 0, 0], eye); cornea.rotation.z = Math.PI / 2; api.part(cornea, INFO.cornea); api.tag(cornea, 'cornea');
    const iris = api.mesh(new T.RingGeometry(0.42, 1.25, 40), api.mat(0x4E7FB0, { side: T.DoubleSide }), [-2.15, 0, 0], eye); iris.rotation.y = Math.PI / 2; api.part(iris, INFO.iris);
    const lens = api.sphere(0.95, api.mat(0xFFF6D8, { opacity: 0.7, roughness: 0.1 }), [LX, 0, 0], eye, 40); api.part(lens, INFO.lens); api.tag(lens, 'lens');
    const cilG = api.group(eye, [LX, 0, 0]); api.tag(cilG, 'cil');
    const cil = api.mesh(new T.TorusGeometry(1.55, 0.2, 12, 40), api.mat(0xB0505A), [0, 0, 0], cilG); cil.rotation.y = Math.PI / 2;
    const zon = []; for (let k = 0; k < 16; k++) { const m = api.mesh(new T.CylinderGeometry(0.012, 0.012, 1, 4), api.mat(0xFFFFFF, { opacity: 0.8 }), null, cilG); m.userData.a = k / 16 * Math.PI * 2; zon.push(m); }
    api.part(cilG, INFO.cil);
    // võng mạc (nửa sau), hoàng điểm, điểm mù, dây thần kinh
    const retG = api.group(eye); api.tag(retG, 'retina');
    const ret = api.mesh(new T.SphereGeometry(2.82, 48, 24, Math.PI / 2, Math.PI, 0, Math.PI), api.mat(0xE0734F, { opacity: 0.55, side: T.DoubleSide, depthWrite: false }), [-0.25, 0, 0], retG); api.part(ret, INFO.retina);
    const fov = api.sphere(0.16, api.mat(0xFFD84A, { emissive: 0xFFC107, emissiveIntensity: 0.3 }), [2.55, 0, 0], retG, 16); api.part(fov, INFO.fovea);
    const bs = api.mesh(new T.CircleGeometry(0.28, 20), api.mat(0xFFFFFF, { side: T.DoubleSide }), [2.4, 0, 0.95], retG); bs.rotation.y = -Math.PI / 2 + 0.35; api.part(bs, INFO.blind);
    const on = api.tube([[2.45, 0, 1.0], [3.3, 0, 1.25], [4.8, 0, 1.6]], 0.28, 0xF2D8A6, retG); api.part(on, INFO.optic); api.tag(on, 'optic');
    // vật: ngọn nến
    const obj = api.group(); const cand = api.cyl(0.18, 0.2, 1.0, 0xF4EEE0, [0, -0.5, 0], obj, 16); const flame = api.sphere(0.16, api.mat(0xFFB000, { emissive: 0xFF9000, emissiveIntensity: 1.6 }), [0, 0.12, 0], obj, 14); flame.scale.y = 1.6;
    cand.userData.noPick = true;
    const dToX = d => LX - 2.2 - 6 * Math.log(d / 0.05) / Math.log(200);
    const xToD = x => Math.max(0.05, Math.min(10, 0.05 * Math.pow(200, (LX - 2.2 - x) / 6)));
    // tia sáng
    const rays = [-0.62, 0, 0.62].map(() => [api.lineBetween([0, 0, 0], [1, 0, 0], 0.025, api.mat(0xFFE070, { emissive: 0xFFD040, emissiveIntensity: 1 })), api.lineBetween([0, 0, 0], [1, 0, 0], 0.025, api.mat(0xFFE070, { emissive: 0xFFD040, emissiveIntensity: 1 })), api.lineBetween([0, 0, 0], [1, 0, 0], 0.025, api.mat(0xFFE070, { emissive: 0xFFD040, emissiveIntensity: 1 }))]);
    rays.flat().forEach(m => m.userData.noPick = true);
    const blur = api.mesh(new T.CircleGeometry(1, 24), api.mat(0xFFE070, { emissive: 0xFFD040, emissiveIntensity: 1.2, opacity: 0.6, side: T.DoubleSide, depthWrite: false }), null); blur.rotation.y = Math.PI / 2; blur.userData.noPick = true;
    const glass = api.mesh(new T.CylinderGeometry(1.3, 1.3, 0.12, 32), api.mat(0x9FD8FF, { opacity: 0.45 }), [LX - 2.0, 0, 0]); glass.rotation.z = Math.PI / 2; glass.userData.noPick = true;
    const set = (m, a, b) => { const len = a.distanceTo(b); m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(1, Math.max(0.001, len), 1); m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); };
    rays.forEach(r => r.forEach(m => m.geometry = new T.CylinderGeometry(0.025, 0.025, 1, 5)));
    const dLab = api.label('', obj, { off: [0, 1.0, 0], cls: 'tag', color: '#E0A100' });
    const fLab = api.label('', [3.2, -1.6, 0], { cls: 'plain' });
    api.label('Giác mạc', cornea, { off: [-0.4, 1.4, 0], cls: 'plain' }); api.label('Thủy tinh thể', lens, { off: [0, 1.5, 0] }); api.label('Cơ thể mi', [LX, -1.6, 0], { off: [0, -0.5, 0], cls: 'plain' });
    api.label('Võng mạc', [2.3, 1.6, 0], { cls: 'plain' }); api.label('Hoàng điểm', fov, { off: [0.9, 0.3, 0], cls: 'tag', color: '#E0A100' }); api.label('Điểm mù', bs, { off: [0.6, -0.4, 0.3], cls: 'plain' }); api.label('Dây thần kinh thị giác', [4.6, 0, 1.6], { cls: 'plain' });
    let dragX = null;
    api.draggable(flame, { normal: new T.Vector3(0, 0, 1), move(p) { dragX = p.x; dist = +xToD(p.x).toFixed(2); if (sl) sl.set(dist, true); } });
    let sl = null, warnNear = false;
    api.onFrame(() => {
      const o = optics(dist), dr = o.dr;
      const retX = LX + dr * U;
      eye.scale.set(1, 1, 1); ball.scale.x = retG.scale.x = 1 + (dr - 0.017) * U / 2.9 * 0.5; ball.position.x = retG.position.x = (dr - 0.017) * U * 0.5;
      // thủy tinh thể và cơ thể mi
      const a = Math.min(1, o.acc / 10);
      lens.scale.set(0.42 + 0.33 * a, 1, 1);
      cil.geometry.dispose(); cil.geometry = new T.TorusGeometry(1.6 - 0.22 * a, 0.17 + 0.1 * a, 12, 40);
      zon.forEach(z => { const r0 = 0.9, r1 = 1.6 - 0.22 * a - 0.12; const A = V(0, Math.cos(z.userData.a) * r0, Math.sin(z.userData.a) * r0), B = V(0, Math.cos(z.userData.a) * r1, Math.sin(z.userData.a) * r1); const mid = A.clone().add(B).multiplyScalar(0.5).add(V(a * 0.15, 0, 0)); set(z, A, B); z.position.copy(mid); z.material.opacity = 0.9 - a * 0.5; });
      // vật
      const ox = dragX !== null && Math.abs(dToX(dist) - dragX) < 0.3 ? dragX : dToX(dist); obj.position.set(ox, 0, 0);
      glass.visible = glasses && defect !== 'normal'; glass.material.color.set(defect === 'myopia' ? 0x9FD8FF : 0xFFD9A0);
      // tia
      const fx = LX + o.di * U, tip = V(ox, 0.3, 0);
      const imgY = -0.12;
      rays.forEach((r, k) => {
        const ly = [-0.62, 0, 0.62][k], L = V(LX, ly, 0), F = V(fx, imgY, 0);
        set(r[0], tip, L);
        if (fx < retX) { set(r[1], L, F); const dir = F.clone().sub(L).normalize(); const t = (retX - F.x) / dir.x; set(r[2], F, F.clone().add(dir.multiplyScalar(t))); r[2].visible = true; }
        else { const dir = F.clone().sub(L).normalize(); const t = (retX - L.x) / dir.x; set(r[1], L, L.clone().add(dir.multiplyScalar(t))); r[2].visible = false; }
      });
      const off = Math.abs(o.off) * U; blur.position.set(retX - 0.03, imgY, 0); blur.scale.setScalar(Math.max(0.05, Math.min(1.2, off * 0.55)));
      blur.material.color.set(off < 0.08 ? 0x7CFF8A : 0xFFE070); fov.material.emissiveIntensity = off < 0.08 ? 1 : 0.2;
      dLab.el.innerHTML = `d = ${dist < 1 ? Math.round(dist * 100) + ' cm' : dist + ' m'}`;
      const state = off < 0.08 ? '✔ Ảnh rõ trên hoàng điểm' : o.off > 0 ? '✖ Ảnh sau võng mạc (mờ)' : '✖ Ảnh trước võng mạc (mờ)';
      fLab.el.innerHTML = `${state}<br>Độ tụ thủy tinh thể ≈ ${o.P.toFixed(1)} D (điều tiết ${o.acc.toFixed(1)} D)`;
      if (dist < 0.1 && defect === 'normal' && !warnNear) { warnNear = true; api.warn('near', WARN_NEAR, '⚠️ Cảnh báo sinh lí'); }
      if (dist >= 0.1) warnNear = false;
      api.caption(`${a > 0.5 ? 'Nhìn gần: cơ thể mi co, dây treo chùng, thủy tinh thể phồng' : 'Nhìn xa: cơ thể mi dãn, dây treo căng, thủy tinh thể xẹp'} · 1/f = 1/d + 1/d′ · d′ = ${(o.di * 1000).toFixed(1)} mm`);
    });
    sl = api.slider({ label: '🕯 Khoảng cách vật', min: 0.05, max: 10, step: 0.05, value: dist, unit: 'm', onInput(v) { dist = v; dragX = null; } });
    api.choices({ label: '👓 Tật khúc xạ', items: [{ t: 'Mắt thường', v: 'normal' }, { t: 'Cận thị', v: 'myopia' }, { t: 'Viễn thị', v: 'hyper' }], value: defect, onPick(v) { defect = v; glasses = false; api.setTab('eye'); api.toast(v === 'myopia' ? 'Trục cầu mắt dài: kéo vật ra xa xem ảnh rơi trước võng mạc' : v === 'hyper' ? 'Trục cầu mắt ngắn: kéo vật lại gần xem ảnh rơi sau võng mạc' : 'Mắt bình thường'); } });
    if (defect !== 'normal') api.toggle({ label: defect === 'myopia' ? 'Đeo kính phân kỳ (−4,8 D)' : 'Đeo kính hội tụ (+4 D)', value: glasses, onChange(v) { glasses = v; } });
    api.button('🔬 Xem võng mạc vi mô', () => { eyeView = 'retina'; api.setTab('eye'); });
    api.checklist([{ k: 'cornea', label: 'Giác mạc' }, { k: 'lens', label: 'Thủy tinh thể' }, { k: 'cil', label: 'Cơ thể mi & Dây treo' }, { k: 'retina', label: 'Võng mạc' }, { k: 'optic', label: 'Dây thần kinh thị giác' }]);
    api.view({ pos: [-2.6, 3.2, 12], target: [-2.2, 0, 0], min: 3, max: 24 });
  }
  function retinaView(api) {
    const T = api.T, V = api.V, rnd = api.rand(12);
    const g = api.group();
    const pig = api.box(10, 0.4, 4, 0x3A2A24, [0, -0.2, 0], g); pig.userData.noPick = true;
    const cones = [], rods = [];
    const CC = [0xE5534B, 0x3FB37F, 0x4D6FD6];
    for (let i = 0; i < 26; i++) for (let j = 0; j < 4; j++) {
      const x = -4.6 + i * 0.36, z = -1.5 + j * 1.0 + (i % 2) * 0.3, central = Math.abs(x) < 1.6;
      if (central || (i + j) % 3 === 0) { const c = (i * 7 + j * 3) % 3; const m = api.mesh(new T.ConeGeometry(0.13, 0.9, 10), api.mat(CC[c], { emissive: CC[c], emissiveIntensity: 0 }), [x, 0.55, z], g); m.rotation.x = Math.PI; m.userData.c = c; api.part(m, INFO.cone); api.tag(m, 'cone'); cones.push(m); }
      else { const m = api.cyl(0.07, 0.07, 1.5, api.mat(0xB8BEC6, { emissive: 0xFFFFFF, emissiveIntensity: 0 }), [x, 0.75, z], g, 8); api.part(m, INFO.rod); api.tag(m, 'rod'); rods.push(m); }
    }
    const bips = []; for (let k = 0; k < 12; k++) { const m = api.sphere(0.18, api.mat(0x9F7AE0, { emissive: 0x9F7AE0, emissiveIntensity: 0 }), [-4.2 + k * 0.76, 2.2, (rnd() - 0.5) * 2], g, 12); api.part(m, INFO.bip); bips.push(m); }
    const gangs = []; for (let k = 0; k < 6; k++) { const m = api.sphere(0.3, api.mat(0x4FC3F7, { emissive: 0x4FC3F7, emissiveIntensity: 0 }), [-3.8 + k * 1.5, 3.4, (rnd() - 0.5) * 1.5], g, 14); api.part(m, INFO.gang); gangs.push(m); api.tube([[m.position.x, 3.6, m.position.z], [m.position.x * 0.6 + 2, 4.2, 0], [5.5, 4.4, 0]], 0.04, 0x4FC3F7, g, 20).userData.noPick = true; }
    bips.forEach((b, k) => { api.lineBetween(b.position, V(b.position.x, 1.1, b.position.z), 0.02, 0x9F7AE0, g).userData.noPick = true; api.lineBetween(b.position, gangs[Math.min(5, k >> 1)].position, 0.02, 0x9F7AE0, g).userData.noPick = true; });
    const photons = []; for (let k = 0; k < 18; k++) { const m = api.sphere(0.08, api.mat(0xFFFFFF, { emissive: 0xFFFFFF, emissiveIntensity: 1 }), null, null, 8); m.userData.noPick = true; photons.push(m); }
    const sig = api.sphere(0.12, api.mat(0xFFE070, { emissive: 0xFFD040, emissiveIntensity: 1.5 }), null, null, 10); sig.userData.noPick = true;
    api.label('Ánh sáng đi vào ↓', [0, 6, 0], { cls: 'plain' }); api.label('Tế bào hạch', gangs[5], { off: [1.0, 0.3, 0], cls: 'tag', color: '#4FC3F7' }); api.label('Tế bào hai cực', bips[11], { off: [1.2, 0, 0], cls: 'tag', color: '#9F7AE0' });
    api.label('Tế bào nón (R, G, B) dày ở hoàng điểm', [0, 0, 2.4], { cls: 'plain' }); api.label('Tế bào que', rods[rods.length - 1], { off: [0.8, 0.5, 0], cls: 'plain' }); api.label('→ Dây thần kinh thị giác', [5.5, 4.4, 0], { cls: 'plain' });
    // mù màu: bảng màu so sánh
    const M = { none: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], protan: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]], deutan: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]] };
    const sw = ['#E53935', '#43A047', '#FB8C00', '#8E24AA', '#1E88E5', '#FDD835'];
    const conv = (hex, m) => { const r = parseInt(hex.slice(1, 3), 16), gg = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); const o = m.map(row => Math.round(row[0] * r + row[1] * gg + row[2] * b)); return `rgb(${o.join(',')})`; };
    const ov = api.overlay('', 'm3d-cb');
    const drawCb = () => { ov.innerHTML = `<div><b>Mắt thường thấy</b> ${sw.map(c => `<i style="background:${c}"></i>`).join('')}</div><div><b>${cb === 'none' ? 'Đang xem' : cb === 'protan' ? 'Mù màu đỏ thấy' : 'Mù màu xanh lục thấy'}</b> ${sw.map(c => `<i style="background:${conv(c, M[cb])}"></i>`).join('')}</div>`; };
    drawCb();
    let lastSig = -9;
    api.onFrame(dt => {
      const t = api.time;
      photons.forEach((m, k) => { const q = (t * 0.5 + k / 18) % 1; const x = -4.4 + (k * 0.53) % 9; m.position.set(x, 6 - q * 5.6, ((k * 0.37) % 1 - 0.5) * 2.5); });
      cones.forEach(c => { const dead = (cb === 'protan' && c.userData.c === 0) || (cb === 'deutan' && c.userData.c === 1); c.material.color.set(dead ? 0x555555 : CC[c.userData.c]); c.material.emissiveIntensity = dead ? 0 : Math.max(0, Math.sin(t * 3 + c.position.x * 2)) * 0.8; });
      rods.forEach(r => r.material.emissiveIntensity = Math.max(0, Math.sin(t * 2 + r.position.x)) * 0.3);
      const q = (t % 2) / 2; bips.forEach(b => b.material.emissiveIntensity = q > 0.3 && q < 0.5 ? 0.9 : 0); gangs.forEach(gg => gg.material.emissiveIntensity = q > 0.5 && q < 0.7 ? 1 : 0);
      sig.visible = q > 0.65; if (q > 0.65) sig.position.lerpVectors(gangs[2].position, V(5.5, 4.4, 0), (q - 0.65) / 0.35);
      if (q > 0.65 && t - lastSig > 1.5) { lastSig = t; [660, 990].forEach((f, k) => api.beep(f, 0.12, 'sine', 0.05, k * 0.05)); }
      api.caption(q < 0.3 ? 'Photon làm phân giải sắc tố rhodopsin / photopsin → điện thế màng thay đổi' : q < 0.5 ? 'Tín hiệu truyền sang tế bào hai cực' : q < 0.7 ? 'Tế bào hạch phát điện thế hoạt động' : 'Xung đi theo dây thần kinh thị giác về vỏ não thị giác');
    });
    api.choices({ label: '🎨 Mù màu', items: [{ t: 'Bình thường', v: 'none' }, { t: 'Mất nón đỏ', v: 'protan' }, { t: 'Mất nón xanh lục', v: 'deutan' }], value: cb, onPick(v) { cb = v; drawCb(); } });
    api.button('👁 Về mô hình cả mắt', () => { eyeView = 'eye'; api.setTab('eye'); });
    api.checklist([{ k: 'rod', label: 'Tế bào que' }, { k: 'cone', label: 'Tế bào nón' }]);
    api.view({ pos: [0, 4.5, 10], target: [0, 2, 0], min: 3, max: 20 });
  }

  // ---------- Tab 2: tai ----------
  function earTab(api) {
    const T = api.T, V = api.V;
    const outer = api.group(); api.tag(outer, 'drum');
    const pin = api.sphere(1.6, api.mat(0xF2C2A8), [-5, 0.4, 0], outer, 32); pin.scale.set(0.3, 1.4, 1); api.part(pin, INFO.pinna);
    const rim = api.mesh(new T.TorusGeometry(1.3, 0.18, 10, 36, Math.PI * 1.5), api.mat(0xE8B096), [-4.9, 0.5, 0], outer); rim.rotation.y = Math.PI / 2; rim.rotation.x = 0.6; rim.userData.noPick = true;
    const canal = api.mesh(new T.CylinderGeometry(0.42, 0.38, 3.2, 24, 1, true), api.mat(0xF2C2A8, { opacity: 0.5, side: T.DoubleSide, depthWrite: false }), [-3.2, 0, 0], outer); canal.rotation.z = Math.PI / 2; api.part(canal, INFO.canal);
    const drum = api.mesh(new T.CircleGeometry(0.5, 32), api.mat(0xF8E6C8, { side: T.DoubleSide, opacity: 0.9 }), [-1.6, 0, 0], outer); drum.rotation.y = Math.PI / 2 - 0.2; api.part(drum, INFO.drum);
    const oss = api.group(); api.tag(oss, 'oss');
    const mal = api.group(oss, [-1.45, 0.25, 0]); api.mesh(new T.CapsuleGeometry(0.06, 0.6, 4, 8), 0xF4EEDF, [0, -0.2, 0], mal); api.sphere(0.16, 0xF4EEDF, [0.05, 0.25, 0], mal, 12);
    const inc = api.group(oss, [-1.05, 0.35, 0]); api.sphere(0.17, 0xF4EEDF, [0, 0, 0], inc, 12); api.mesh(new T.CapsuleGeometry(0.05, 0.45, 4, 8), 0xF4EEDF, [0.1, -0.3, 0], inc).rotation.z = 0.3;
    const sta = api.group(oss, [-0.72, 0.0, 0]); const arch = api.mesh(new T.TorusGeometry(0.16, 0.035, 6, 16, Math.PI), 0xF4EEDF, [0, 0, 0], sta); arch.rotation.z = -Math.PI / 2; api.box(0.04, 0.38, 0.22, 0xF4EEDF, [0.17, 0, 0], sta);
    api.part(oss, INFO.oss);
    const eus = api.tube([[-1.2, -0.5, 0], [-0.9, -1.4, 0.2], [-0.5, -2.6, 0.4]], 0.12, 0xE8A0A0); api.part(eus, INFO.eus); api.tag(eus, 'oss');
    // ốc tai xoắn
    const cg = api.group(null, [0.6, -0.3, 0]); api.tag(cg, 'coch');
    const pts = []; for (let k = 0; k <= 120; k++) { const q = k / 120, a = q * Math.PI * 5, r = 1.1 * (1 - q * 0.75); pts.push(V(q * 0.9, r * Math.sin(a), r * Math.cos(a))); }
    const cc = new T.CatmullRomCurve3(pts); const coch = api.mesh(new T.TubeGeometry(cc, 300, 0.22, 10), api.mat(0xF6C2D0, { opacity: 0.85 }), null, cg); api.part(coch, INFO.coch);
    const peak = api.sphere(0.3, api.mat(0xFFE070, { emissive: 0xFFC107, emissiveIntensity: 1.2, opacity: 0.85 }), null, cg, 16); peak.userData.noPick = true;
    const semi = api.group(null, [0.2, 1.35, 0]); [[0, 0, 0], [Math.PI / 2, 0, 0], [0, Math.PI / 2, 0]].forEach((r, k) => { const m = api.mesh(new T.TorusGeometry(0.55, 0.07, 8, 30), 0xF6C2D0, [k * 0.25 - 0.25, 0, 0], semi); m.rotation.set(...r); }); api.part(semi, INFO.semi); api.tag(semi, 'coch');
    const an = api.tube([[1.4, -0.3, 0], [2.6, -0.2, -0.2], [4.2, 0.2, -0.4]], 0.16, 0xF2D8A6); api.part(an, INFO.anerve); api.tag(an, 'anerve');
    const waves = []; for (let k = 0; k < 6; k++) { const m = api.mesh(new T.TorusGeometry(0.6, 0.03, 6, 30), api.mat(0x7FD0FF, { emissive: 0x5BB4FF, emissiveIntensity: 0.6, opacity: 0.8 }), null); m.rotation.y = Math.PI / 2; m.userData.noPick = true; waves.push(m); }
    const pulse = api.sphere(0.12, api.mat(0xFFE070, { emissive: 0xFFD040, emissiveIntensity: 1.5 }), null, null, 10); pulse.userData.noPick = true;
    api.label('Vành tai', pin, { off: [0, 2.3, 0] }); api.label('Ống tai ngoài', canal, { off: [0, 0.8, 0], cls: 'plain' }); api.label('Màng nhĩ', drum, { off: [0, -0.9, 0] });
    api.label('Búa · Đe · Bàn đạp', [-1.05, 0.35, 0], { off: [0, 0.9, 0], cls: 'tag', color: '#C9A100' }); api.label('Vòi Eustache', [-0.5, -2.6, 0.4], { cls: 'plain' }); api.label('Ốc tai', [1.0, -1.6, 0], { cls: 'plain' });
    api.label('Ống bán khuyên', [0.2, 2.1, 0], { cls: 'plain' }); api.label('Dây thần kinh thính giác', [4.2, 0.2, -0.4], { cls: 'plain' });
    api.label('Tai ngoài', [-4.3, -2.4, 0], { cls: 'tag', color: '#E5737D' }); api.label('Tai giữa', [-1.1, -1.4, 0], { cls: 'tag', color: '#E0A100' }); api.label('Tai trong', [1.4, -2.2, 0], { cls: 'tag', color: '#5BB4FF' });
    const pLab = api.label('', peak, { off: [0, 0.6, 0], cls: 'tag', color: '#E0A100' });
    soundLoop(api);
    api.onFrame(() => {
      const t = api.time, amp = dB / 120, vis = 2 + Math.log10(freq) * 0.8;
      waves.forEach((m, k) => { const q = (t * 0.6 + k / 6) % 1; m.position.set(-6 + q * 4.3, 0, 0); m.scale.setScalar(1.6 - q); m.material.opacity = 0.8 * (1 - q) * Math.min(1, amp * 1.5); });
      const vib = Math.sin(t * vis * 6) * amp;
      drum.position.x = -1.6 + vib * 0.06; mal.rotation.z = vib * 0.1; inc.rotation.z = vib * 0.08; sta.position.x = -0.72 + vib * 0.05;
      const pos = 1 - tonoPos(freq); const pp = cc.getPointAt(Math.max(0.02, Math.min(0.98, pos)));
      peak.position.copy(pp); peak.scale.setScalar(0.6 + amp + Math.abs(Math.sin(t * 8)) * 0.2);
      pLab.el.innerHTML = freq >= 2000 ? 'Âm cao: rung mạnh ở đáy ốc tai' : freq <= 300 ? 'Âm thấp: rung mạnh ở đỉnh ốc tai' : 'Vùng rung mạnh nhất';
      const q2 = (t * 0.5) % 1; pulse.position.lerpVectors(V(1.4, -0.3, 0), V(4.2, 0.2, -0.4), q2);
      api.caption(`${freq} Hz · ${dB} dB · Màng nhĩ → búa → đe → bàn đạp (tai giữa tăng áp lực ≈ 20 lần) → cửa sổ bầu dục → sóng dịch ốc tai`);
    });
    soundCtl(api);
    api.checklist([{ k: 'drum', label: 'Màng nhĩ' }, { k: 'oss', label: 'Chuỗi xương tai' }, { k: 'coch', label: 'Ốc tai' }, { k: 'anerve', label: 'Dây thần kinh thính giác' }]);
    api.view({ pos: [-1, 2, 12], target: [-0.8, 0, 0], min: 3, max: 24 });
  }

  // ---------- Tab 3: cơ quan Corti ----------
  function cortiTab(api) {
    const T = api.T, V = api.V;
    const NX = 60, L = 10;
    const bgeo = new T.PlaneGeometry(L, 3.6, NX, 4); bgeo.rotateX(-Math.PI / 2);
    const bas = api.mesh(bgeo, api.mat(0xE59AB0, { side: T.DoubleSide }), [0, 0, 0]); api.part(bas, INFO.basilar); api.tag(bas, 'basilar');
    const base0 = bgeo.attributes.position.array.slice();
    const tect = api.box(L, 0.18, 2.4, api.mat(0xBFE6FF, { opacity: 0.55, depthWrite: false }), [0, 1.75, 0.35]); api.part(tect, INFO.tect); api.tag(tect, 'tect');
    const cells = [];
    const rows = [{ z: -1.0, inner: true }, { z: 0.35 }, { z: 0.8 }, { z: 1.25 }];
    rows.forEach(r => {
      for (let i = 0; i < 12; i++) {
        const x = -4.6 + i * 0.84 + (r.inner ? 0 : 0.2);
        const g = api.group(null, [x, 0, r.z]);
        const body = api.mesh(new T.CapsuleGeometry(0.16, 0.8, 4, 10), api.mat(r.inner ? 0xF7B267 : 0x9AD0F5), [0, 0.6, 0], g); api.part(body, r.inner ? INFO.ihc : INFO.ohc); api.tag(body, r.inner ? 'ihc' : 'ohc');
        const bun = api.group(g, [0, 1.15, 0]); api.tag(bun, 'stereo');
        const hs = r.inner ? [0.18, 0.28, 0.38] : [0.2, 0.32, 0.46];
        hs.forEach((h, j) => { for (let s = -1; s <= 1; s++) { const m = api.cyl(0.018, 0.018, h, 0xFFFFFF, [(j - 1) * 0.06, h / 2, s * 0.06 * (r.inner ? 1 : 1.5)], bun, 5); m.userData.base = true; } });
        api.part(bun, INFO.stereo);
        const k = api.sphere(0.04, api.mat(0x7CFF8A, { emissive: 0x44FF66, emissiveIntensity: 0 }), [0.06, 0.45, 0], bun, 6); api.tag(k, 'kch'); api.part(k, INFO.kch);
        const ion = api.sphere(0.05, api.mat(0xB07CFF, { emissive: 0xB07CFF, emissiveIntensity: 0.8 }), null, null, 6); ion.userData.noPick = true; ion.visible = false;
        cells.push({ g, bun, k, ion, x, inner: !!r.inner, broken: 0, seed: Math.random() });
      }
    });
    const nerves = []; cells.filter(c => c.inner).forEach(c => { const m = api.tube([[c.x, 0.1, -1.0], [c.x, -0.6, -1.2], [c.x + 0.4, -1.4, -1.8]], 0.035, 0xF2D8A6); m.userData.noPick = true; api.tag(m, 'ihc'); nerves.push(m); });
    api.label('Màng mái', tect, { off: [L / 2 - 0.6, 0.5, 0] }); api.label('Màng cơ sở', [4.6, -0.2, 1.8], { cls: 'plain' }); api.label('1 hàng tế bào lông trong', [-4.6, 1.2, -1.0], { off: [-0.2, 0.8, -0.4], cls: 'tag', color: '#E0A100' });
    api.label('3 hàng tế bào lông ngoài', [4.8, 1.2, 1.25], { off: [0.4, 0.8, 0.4], cls: 'tag', color: '#5BB4FF' }); api.label('Sợi thần kinh thính giác', [-4.2, -1.4, -1.8], { cls: 'plain' });
    const dLab = api.label('', [0, 3, 0], { cls: 'plain' });
    soundLoop(api);
    let loud = 0;
    api.onFrame(dt => {
      const t = api.time, amp = Math.min(1, dB / 90) * 0.35, center = (1 - tonoPos(freq)) * L - L / 2, wl = 2.4, w = 3 + Math.log10(freq);
      const pos = bgeo.attributes.position.array;
      const disp = x => amp * Math.exp(-Math.pow((x - center) / 2.2, 2)) * Math.sin((x - center) / wl * Math.PI * 2 - t * w);
      for (let i = 0; i < pos.length; i += 3) pos[i + 1] = base0[i + 1] + disp(base0[i]);
      bgeo.attributes.position.needsUpdate = true; bgeo.computeVertexNormals();
      if (dB > 85) { loud += dt; damage = Math.min(1, damage + dt * (dB - 85) / 35 * 0.08); if (loud > 0.5) api.warn('noise', WARN_NOISE, '⚠️ Cảnh báo thính giác'); } else loud = 0;
      cells.forEach(c => {
        const y = disp(c.x), sh = (disp(c.x + 0.05) - y) / 0.05;
        c.g.position.y = y;
        const brk = c.seed < damage;
        if (brk && !c.broken) { c.broken = 1; c.bun.children.forEach((m, j) => { if (m.userData.base) { m.rotation.z = 1.2 + j * 0.05; m.position.y *= 0.4; m.material = api.mat(0x888888); } }); api.noise(0.05, 0.05, 4000); }
        const bend = brk ? 0 : Math.max(-0.5, Math.min(0.5, (y * 2.2 + sh * 0.6)));
        if (!brk) c.bun.rotation.z = -bend;
        const open = !brk && bend > 0.08;
        c.k.material.emissiveIntensity = open ? 1.5 : 0;
        c.ion.visible = open; if (open) { const q = (t * 2 + c.seed) % 1; c.ion.position.set(c.x + 0.06, c.g.position.y + 1.75 - q * 0.9, c.g.position.z); }
      });
      nerves.forEach((n, k) => { const c = cells[k]; n.material.emissive = n.material.emissive || new T.Color(); n.material.emissive.set(0xFFD040); n.material.emissiveIntensity = !c.broken && c.k.material.emissiveIntensity > 0 ? 1 : 0; });
      dLab.el.innerHTML = damage > 0 ? `Lông tơ bị gãy: ${Math.round(damage * 100)}% (vĩnh viễn)` : '';
      api.caption(`${freq} Hz · ${dB} dB · Màng cơ sở rung → lông tơ cọ vào màng mái, bị bẻ cong → mở kênh K⁺ → K⁺ vào, khử cực tế bào lông`);
    });
    soundCtl(api);
    api.button('🔄 Đặt lại lông tơ (chỉ có trong mô phỏng)', () => { damage = 0; api.setTab('corti'); });
    api.checklist([{ k: 'basilar', label: 'Màng cơ sở' }, { k: 'tect', label: 'Màng mái' }, { k: 'ihc', label: 'Tế bào lông trong' }, { k: 'ohc', label: 'Tế bào lông ngoài' }, { k: 'stereo', label: 'Lông tơ (Stereocilia)' }, { k: 'kch', label: 'Kênh ion K⁺' }]);
    api.view({ pos: [0, 4.2, 9], target: [0, 0.8, 0], min: 2.5, max: 20 });
  }

  function soundLoop(api) {
    let next = 0;
    api.onFrame(() => { if (!tone) return; if (api.time >= next) { next = api.time + 0.5; const f = Math.max(20, Math.min(18000, freq)); api.beep(f, 0.52, 'sine', Math.min(0.12, 0.004 + 0.11 * Math.pow(dB / 120, 2))); } });
  }
  function soundCtl(api) {
    api.slider({ label: '🎵 Tần số âm', min: 20, max: 20000, step: 10, value: freq, unit: 'Hz', lazy: true, onInput(v) { freq = v; } });
    api.choices({ items: [{ t: '100 Hz', v: 100 }, { t: '1 000 Hz', v: 1000 }, { t: '8 000 Hz', v: 8000 }], value: freq, onPick(v) { freq = v; const r = api.el.querySelectorAll('.m3d-side input[type=range]')[0]; if (r) { r.value = v; r.dispatchEvent(new Event('input')); } } });
    api.slider({ label: '🔊 Cường độ âm', min: 0, max: 120, step: 5, value: dB, unit: 'dB', lazy: true, onInput(v) { dB = v; } });
    api.toggle({ label: '🔈 Phát tiếng theo tần số (âm lượng thật đã được giảm an toàn)', value: tone, onChange(v) { tone = v; } });
  }

  function chartSVG() {
    const W = 640, H = 300;
    let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:${H}px;font-family:'Baloo 2',sans-serif">`;
    // trái: độ tụ thủy tinh thể theo khoảng cách
    const L = 46, R = 300, X = d => L + Math.log(d / 0.05) / Math.log(200) * (R - L), Y = p => 250 - (p - 56) / 16 * 210;
    s += `<text x="${L}" y="18" font-size="13" font-weight="800" fill="#1F4E79">Độ tụ thủy tinh thể (D) theo khoảng cách vật</text>`;
    [56, 60, 64, 68, 72].forEach(p => { s += `<line x1="${L}" x2="${R}" y1="${Y(p)}" y2="${Y(p)}" stroke="#E3ECF4"/><text x="${L - 6}" y="${Y(p) + 4}" font-size="11" fill="#6C88A3" text-anchor="end">${p}</text>`; });
    [0.05, 0.1, 0.25, 1, 3, 10].forEach(d => { s += `<text x="${X(d)}" y="270" font-size="11" fill="#6C88A3" text-anchor="middle">${d < 1 ? d * 100 + 'cm' : d + 'm'}</text>`; });
    let pts = []; for (let k = 0; k <= 60; k++) { const d = 0.05 * Math.pow(200, k / 60); pts.push(`${X(d)},${Y(optics(d).P)}`); }
    s += `<polyline fill="none" stroke="#2A8BD8" stroke-width="3" points="${pts.join(' ')}"/>`;
    const o = optics(dist); s += `<circle cx="${X(dist)}" cy="${Y(o.P)}" r="6" fill="#E5534B"/><text x="${X(dist) + 8}" y="${Y(o.P) - 8}" font-size="12" font-weight="800" fill="#E5534B">${o.P.toFixed(1)} D</text>`;
    // phải: sóng âm
    const L2 = 350, R2 = 630, mid = 140, A = 90 * dB / 120;
    s += `<text x="${L2}" y="18" font-size="13" font-weight="800" fill="#1F4E79">Sóng âm ${freq} Hz · ${dB} dB (5 ms)</text>`;
    s += `<line x1="${L2}" x2="${R2}" y1="${mid}" y2="${mid}" stroke="#E3ECF4"/>`;
    pts = []; const per = Math.max(1, Math.min(400, freq * 0.005 * 4)); for (let k = 0; k <= 400; k++) { const q = k / 400; pts.push(`${L2 + q * (R2 - L2)},${mid - A * Math.sin(q * Math.PI * 2 * Math.min(per, 60))}`); }
    s += `<polyline fill="none" stroke="#7A4FB5" stroke-width="2" points="${pts.join(' ')}"/>`;
    if (dB > 85) s += `<text x="${L2}" y="270" font-size="12" font-weight="800" fill="#E5534B">⚠ Trên 85 dB: nguy cơ tổn thương lông tơ</text>`;
    return s + '</svg>';
  }

  NL.m3d.register('M9', {
    title: 'Mắt và tai',
    tabs: [{ t: '👁️ Mắt & điều tiết', v: 'eye' }, { t: '👂 Tai & ốc tai', v: 'ear' }, { t: '🔬 Cơ quan Corti', v: 'corti' }],
    init() { eyeView = 'eye'; tone = false; },
    build(api, tab) { if (tab === 'eye') eyeTab(api); else if (tab === 'ear') earTab(api); else cortiTab(api); },
    data() {
      const o = optics(dist);
      return {
        title: 'Thị giác và thính giác',
        sub: `Vật cách mắt ${dist} m · ${defect === 'normal' ? 'Mắt thường' : defect === 'myopia' ? 'Cận thị' : 'Viễn thị'}${glasses ? ' có kính' : ''} · Âm ${freq} Hz, ${dB} dB`,
        sheets: [
          { name: 'So sánh mắt – tai', head: ['STT', 'Tiêu chí so sánh', 'Cơ quan Thị giác (Mắt)', 'Cơ quan Thính giác (Tai)', 'Dạng năng lượng kích thích & Tế bào thụ cảm'], rows: [
            [1, 'Kích thích thích hợp', 'Ánh sáng 380 – 760 nm', 'Sóng âm 20 – 20 000 Hz', 'Quang năng / cơ năng (dao động)'],
            [2, 'Bộ phận thu nhận', 'Võng mạc', 'Cơ quan Corti trong ốc tai', 'Tế bào que, nón / tế bào lông'],
            [3, 'Bộ phận điều chỉnh', 'Thủy tinh thể, cơ thể mi, đồng tử', 'Màng nhĩ và chuỗi xương tai (tăng áp lực ≈ 20 lần)', '–'],
            [4, 'Cơ chế ở tế bào thụ cảm', 'Photon phân giải rhodopsin / photopsin', 'Lông tơ bẻ cong mở kênh K⁺', 'Đổi điện thế màng → xung thần kinh'],
            [5, 'Dây thần kinh', 'Thị giác', 'Thính giác', '–'], [6, 'Vùng vỏ não', 'Thùy chẩm', 'Thùy thái dương', '–'],
            [7, 'Bệnh, tật thường gặp', 'Cận thị, viễn thị, mù màu', 'Giảm thính lực do tiếng ồn > 85 dB', '–']] },
          { name: 'Điều tiết mắt', head: ['Khoảng cách vật (m)', 'Độ tụ thủy tinh thể (D)', 'Điều tiết (D)', 'Ảnh d′ (mm)', 'Võng mạc (mm)', 'Kết quả'], rows: [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, dist].map(d => { const q = optics(d), off = (q.di - q.dr) * 1000; return [d, q.P.toFixed(1), q.acc.toFixed(1), (q.di * 1000).toFixed(2), (q.dr * 1000).toFixed(1), Math.abs(off) < 0.3 ? 'Rõ' : off > 0 ? 'Mờ, ảnh sau võng mạc' : 'Mờ, ảnh trước võng mạc']; }) },
          { name: 'Thính giác', head: ['Thông số', 'Giá trị'], rows: [['Tần số (Hz)', freq], ['Cường độ (dB)', dB], ['Vị trí rung mạnh nhất trên ốc tai', freq >= 2000 ? 'Gần đáy' : freq <= 300 ? 'Gần đỉnh' : 'Đoạn giữa'], ['Lông tơ bị gãy (%)', Math.round(damage * 100)], ['Ngưỡng nguy hiểm', '85 dB kéo dài']] }
        ],
        chart: { svg: chartSVG() }
      };
    },
    liveData: true
  });
})();
