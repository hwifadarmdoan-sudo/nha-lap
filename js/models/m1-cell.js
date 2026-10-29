// Mô hình 1: Tế bào nhân thực (động vật / thực vật), 4 cấp độ: mô → tế bào → nhân → DNA quấn histone.
(function () {
  const INFO = {
    membrane: { name: 'Màng sinh chất', sci: 'Plasma membrane', rows: [['Cấu trúc', 'Lớp kép phospholipid xen protein, cholesterol (mô hình khảm động)'], ['Chức năng', 'Bao bọc tế bào, kiểm soát chất ra vào (thấm chọn lọc), thu nhận thông tin'], ['Kích thước', 'Dày khoảng 7–8 nm'], ['Số lượng', '1 lớp bao quanh tế bào']] },
    nucleus: { name: 'Nhân tế bào', sci: 'Nucleus', rows: [['Cấu trúc', 'Màng kép (màng nhân) có lỗ nhân; bên trong là dịch nhân, chất nhiễm sắc (DNA + histone) và nhân con'], ['Chức năng', 'Chứa vật chất di truyền, điều khiển mọi hoạt động sống của tế bào'], ['Kích thước', 'Đường kính 5–10 µm'], ['Số lượng', 'Thường 1 nhân']], text: 'Cuộn sát vào nhân để xem màng nhân, lỗ nhân và sợi chất nhiễm sắc' },
    nucleolus: { name: 'Nhân con', sci: 'Nucleolus', rows: [['Cấu trúc', 'Vùng đậm đặc trong nhân, không có màng, giàu rRNA và protein'], ['Chức năng', 'Tổng hợp rRNA, lắp ráp tiểu đơn vị ribosome'], ['Kích thước', '1–3 µm'], ['Số lượng', '1–4 nhân con']] },
    mito: { name: 'Ti thể', sci: 'Mitochondrion', rows: [['Cấu trúc', 'Màng kép; màng trong gấp nếp thành mào (cristae); chất nền có DNA vòng, ribosome riêng'], ['Chức năng', 'Hô hấp tế bào, tổng hợp ATP cung cấp năng lượng'], ['Kích thước', 'Dài 1–10 µm, rộng 0,5–1 µm'], ['Số lượng', 'Hàng trăm đến vài nghìn (tế bào gan ~1000–2000)']] },
    rer: { name: 'Lưới nội chất hạt', sci: 'Rough endoplasmic reticulum', rows: [['Cấu trúc', 'Hệ thống túi dẹt nối với màng nhân, mặt ngoài đính nhiều ribosome'], ['Chức năng', 'Tổng hợp protein tiết ra ngoài, protein màng và protein của lysosome'], ['Kích thước', 'Túi dày khoảng 50 nm, trải rộng khắp tế bào chất'], ['Số lượng', 'Một hệ thống liên tục']] },
    ser: { name: 'Lưới nội chất trơn', sci: 'Smooth endoplasmic reticulum', rows: [['Cấu trúc', 'Hệ thống ống phân nhánh, không có ribosome'], ['Chức năng', 'Tổng hợp lipid, chuyển hóa đường, khử độc, dự trữ Ca²⁺'], ['Kích thước', 'Ống đường kính 30–60 nm'], ['Số lượng', 'Một hệ thống, nhiều ở tế bào gan']] },
    golgi: { name: 'Bộ máy Golgi', sci: 'Golgi apparatus', rows: [['Cấu trúc', 'Chồng 4–8 túi dẹt xếp cong, mặt cis nhận túi từ lưới nội chất, mặt trans tách túi đi'], ['Chức năng', 'Sửa đổi, phân loại, đóng gói và vận chuyển protein, lipid'], ['Kích thước', '1–3 µm'], ['Số lượng', 'Một đến vài chục (tế bào thực vật có thể hàng trăm thể Golgi)']] },
    ribo: { name: 'Ribosome', sci: 'Ribosome (80S)', rows: [['Cấu trúc', 'Không có màng, gồm 2 tiểu đơn vị (rRNA + protein)'], ['Chức năng', 'Dịch mã: tổng hợp chuỗi polypeptide theo mRNA'], ['Kích thước', '20–30 nm'], ['Số lượng', 'Hàng triệu (tự do hoặc đính trên lưới nội chất hạt)']] },
    cyto: { name: 'Khung xương tế bào', sci: 'Cytoskeleton', rows: [['Cấu trúc', 'Vi ống (~25 nm), sợi trung gian (~10 nm), vi sợi actin (~7 nm)'], ['Chức năng', 'Giữ hình dạng, neo bào quan, làm đường ray vận chuyển nội bào, giúp tế bào vận động'], ['Kích thước', 'Sợi dài tới hàng chục µm'], ['Số lượng', 'Mạng lưới khắp tế bào chất']] },
    chloro: { name: 'Lục lạp', sci: 'Chloroplast', rows: [['Cấu trúc', 'Màng kép; chất nền stroma; các hạt grana gồm túi thylakoid chứa diệp lục'], ['Chức năng', 'Quang hợp: biến năng lượng ánh sáng thành năng lượng hóa học trong chất hữu cơ'], ['Kích thước', 'Dài 2–10 µm'], ['Số lượng', 'Khoảng 20–100 trong một tế bào lá']], text: 'Diệp lục nằm trên màng thylakoid' },
    vacuole: { name: 'Không bào trung tâm', sci: 'Central vacuole', rows: [['Cấu trúc', 'Túi lớn có màng (tonoplast) chứa dịch bào'], ['Chức năng', 'Duy trì sức trương nước, tạo hình dạng tế bào, dự trữ chất, chứa sắc tố và chất thải'], ['Kích thước', 'Chiếm 30–90% thể tích tế bào'], ['Số lượng', 'Thường 1 không bào lớn']] },
    wall: { name: 'Thành tế bào', sci: 'Cell wall', rows: [['Cấu trúc', 'Chủ yếu là cellulose, có cầu sinh chất nối các tế bào'], ['Chức năng', 'Bảo vệ, định hình tế bào, chống trương vỡ khi hút nước'], ['Kích thước', 'Dày 0,1–10 µm'], ['Số lượng', 'Bao ngoài màng sinh chất']] },
    centro: { name: 'Trung thể', sci: 'Centrosome', rows: [['Cấu trúc', '2 trung tử xếp vuông góc; mỗi trung tử gồm 9 bộ ba vi ống'], ['Chức năng', 'Trung tâm tổ chức vi ống, hình thành thoi phân bào khi phân chia'], ['Kích thước', 'Trung tử dài ~0,5 µm, đường kính ~0,2 µm'], ['Số lượng', '1 trung thể (2 trung tử)']] },
    lyso: { name: 'Lysosome', sci: 'Lysosome', rows: [['Cấu trúc', 'Túi màng đơn chứa enzyme thủy phân, môi trường acid (pH ≈ 5)'], ['Chức năng', 'Tiêu hóa nội bào, phân hủy bào quan già và tế bào tổn thương'], ['Kích thước', '0,1–1,2 µm'], ['Số lượng', 'Vài trăm']] },
    perox: { name: 'Peroxisome', sci: 'Peroxisome', rows: [['Cấu trúc', 'Túi màng đơn chứa enzyme oxy hóa và catalase'], ['Chức năng', 'Phân giải H₂O₂, oxy hóa acid béo, khử độc rượu'], ['Kích thước', '0,1–1 µm'], ['Số lượng', 'Vài trăm']] },
    glyox: { name: 'Glyoxysome', sci: 'Glyoxysome', rows: [['Cấu trúc', 'Dạng peroxisome đặc biệt, màng đơn'], ['Chức năng', 'Chuyển hóa lipid dự trữ thành đường (chu trình glyoxylate) ở hạt có dầu đang nảy mầm'], ['Kích thước', '0,5–1,5 µm'], ['Số lượng', 'Nhiều ở hạt nảy mầm']] },
    tissue: { name: 'Mô', sci: 'Tissue', rows: [['Là gì', 'Tập hợp các tế bào giống nhau cùng thực hiện một chức năng'], ['Ví dụ', 'Mô biểu bì, mô cơ, mô dậu ở lá']], text: 'Chạm vào một tế bào hoặc cuộn sát vào để xem một tế bào' },
    envelope: { name: 'Màng nhân', sci: 'Nuclear envelope', rows: [['Cấu trúc', 'Màng kép, màng ngoài nối với lưới nội chất hạt'], ['Chức năng', 'Ngăn cách nhân với tế bào chất'], ['Kích thước', 'Mỗi màng dày ~7 nm, khoảng giữa 20–40 nm']] },
    pore: { name: 'Lỗ nhân', sci: 'Nuclear pore complex', rows: [['Cấu trúc', 'Phức hợp protein hình vòng xuyên qua màng nhân'], ['Chức năng', 'Cửa cho mRNA, tiểu đơn vị ribosome đi ra và protein đi vào nhân'], ['Kích thước', 'Đường kính ~120 nm'], ['Số lượng', '3000–5000 lỗ trên một nhân']] },
    chromatin: { name: 'Sợi chất nhiễm sắc', sci: 'Chromatin', rows: [['Cấu trúc', 'DNA quấn quanh protein histone tạo chuỗi nucleosome, xoắn tiếp nhiều bậc'], ['Chức năng', 'Mang và bảo quản thông tin di truyền'], ['Kích thước', 'Sợi cơ bản 11 nm, sợi nhiễm sắc 30 nm']], text: 'Cuộn sát nữa để xem DNA quấn quanh histone' },
    histone: { name: 'Nucleosome (8 phân tử histone)', sci: 'Nucleosome / Histone octamer', rows: [['Cấu trúc', 'Lõi 8 phân tử histone (H2A, H2B, H3, H4 ×2), đoạn DNA 146 cặp nucleotide quấn 1¾ vòng'], ['Chức năng', 'Đóng gói DNA dài vào trong nhân nhỏ, điều hòa hoạt động gene'], ['Kích thước', 'Đường kính ~11 nm']] },
    dna: { name: 'Chuỗi xoắn kép DNA', sci: 'DNA double helix', rows: [['Cấu trúc', '2 mạch polynucleotide xoắn kép, đường kính 2 nm'], ['Nối giữa các nucleosome', 'Đoạn DNA nối (linker) dài khoảng 20–60 cặp nucleotide']] }
  };
  // tỉ lệ thể tích ước tính (%), theo số liệu tế bào gan (động vật) và tế bào thịt lá (thực vật)
  const VOL = {
    animal: { 'Tế bào chất (bào tương)': 54, 'Ti thể': 22, 'Lưới nội chất hạt': 9, 'Lưới nội chất trơn': 6, 'Nhân': 6, 'Bộ máy Golgi': 3, 'Lysosome': 1, 'Peroxisome': 1 },
    plant: { 'Không bào trung tâm': 60, 'Lục lạp': 15, 'Tế bào chất (bào tương)': 12, 'Nhân': 4, 'Lưới nội chất': 3, 'Ti thể': 2, 'Thành tế bào': 3, 'Bộ máy Golgi': 1 }
  };
  const CMP = [
    ['Nhân tế bào', 'Có', 'Có', 'Nhân', 'Chứa DNA, điều khiển hoạt động sống'],
    ['Ti thể', 'Có', 'Có', 'Ti thể', 'Hô hấp tế bào, tạo ATP'],
    ['Lưới nội chất hạt', 'Có', 'Có', 'Lưới nội chất hạt', 'Tổng hợp protein tiết, protein màng'],
    ['Lưới nội chất trơn', 'Có', 'Có', 'Lưới nội chất trơn', 'Tổng hợp lipid, khử độc'],
    ['Bộ máy Golgi', 'Có', 'Có', 'Bộ máy Golgi', 'Sửa đổi, phân loại, đóng gói protein'],
    ['Ribosome', 'Có', 'Có', '', 'Tổng hợp protein'],
    ['Khung xương tế bào', 'Có', 'Có', '', 'Giữ hình dạng, vận chuyển nội bào'],
    ['Lục lạp', 'Không', 'Có', 'Lục lạp', 'Quang hợp'],
    ['Không bào trung tâm', 'Không', 'Có', 'Không bào trung tâm', 'Trương nước, dự trữ'],
    ['Thành tế bào cellulose', 'Không', 'Có', 'Thành tế bào', 'Bảo vệ, định hình'],
    ['Trung thể', 'Có', 'Không (thực vật bậc cao)', '', 'Hình thành thoi phân bào'],
    ['Lysosome', 'Có', 'Ít/không (thay bằng không bào)', 'Lysosome', 'Tiêu hóa nội bào'],
    ['Peroxisome', 'Có', 'Có', 'Peroxisome', 'Phân giải H₂O₂, acid béo'],
    ['Glyoxysome', 'Không', 'Có (hạt nảy mầm)', '', 'Chuyển lipid thành đường']
  ];
  const COLORS = ['#6FC2E8', '#F2994A', '#3FB37F', '#E8C547', '#9B6BD6', '#E86A92', '#5BB4EA', '#A3B8CC'];

  let lv = 1, opacity = 0.35, anim = true, clipOn = false, clipAx = 'x', clipPos = 0.2, clipAng = 0;
  let cur = null; // các nhóm của cảnh đang xem

  function blobGeo(T, r, amp, seed, wseg) {
    const g = new T.SphereGeometry(r, wseg || 72, (wseg || 72) * 0.66 | 0), p = g.attributes.position, v = new T.Vector3();
    for (let k = 0; k < p.count; k++) {
      v.fromBufferAttribute(p, k); const n = v.clone().normalize();
      const d = 1 + amp * (Math.sin(n.x * 3.1 + seed) * Math.cos(n.y * 2.3 + seed * 0.7) + 0.6 * Math.sin(n.z * 4.2 + seed * 1.3) * Math.sin(n.x * 2.0));
      v.copy(n).multiplyScalar(r * d); p.setXYZ(k, v.x, v.y, v.z);
    }
    g.computeVertexNormals(); g.userData.base = Float32Array.from(p.array); return g;
  }
  function roundBox(T, w, h, d, r) {
    const g = new T.BoxGeometry(w, h, d, 24, 24, 24), p = g.attributes.position, v = new T.Vector3();
    const hw = w / 2 - r, hh = h / 2 - r, hd = d / 2 - r;
    for (let k = 0; k < p.count; k++) {
      v.fromBufferAttribute(p, k);
      const c = new T.Vector3(Math.max(-hw, Math.min(hw, v.x)), Math.max(-hh, Math.min(hh, v.y)), Math.max(-hd, Math.min(hd, v.z)));
      const dir = v.clone().sub(c); if (dir.lengthSq() > 1e-9) dir.normalize().multiplyScalar(r); v.copy(c).add(dir); p.setXYZ(k, v.x, v.y, v.z);
    }
    g.computeVertexNormals(); return g;
  }

  // ---------- cấp 2: một tế bào ----------
  function buildCell(api, plant) {
    const T = api.T, R = api.rand(plant ? 7 : 3), V = api.V;
    const g = {}; cur = g;
    const inner = plant ? { x: 4.6, y: 3.3, z: 3.3 } : { x: 3.6, y: 3.6, z: 3.6 };
    const inside = (m) => { // điểm ngẫu nhiên trong tế bào, tránh nhân và không bào
      for (let k = 0; k < 200; k++) {
        const p = V((R() * 2 - 1) * inner.x * m, (R() * 2 - 1) * inner.y * m, (R() * 2 - 1) * inner.z * m);
        if (!plant && p.length() > 3.3 * m) continue;
        if (p.distanceTo(nucPos) < 1.9) continue;
        if (plant && Math.abs(p.x - 0.9) < 2.3 && Math.abs(p.y) < 2.0 && Math.abs(p.z) < 2.0) continue;
        return p;
      }
      return V(0, 0, 0);
    };
    const nucPos = plant ? V(-2.6, 0.6, 0.3) : V(-0.4, 0.3, 0.2);

    // màng sinh chất / thành tế bào
    if (plant) {
      g.wall = api.mesh(roundBox(T, 10.4, 7.6, 7.6, 0.7), api.mat(0x7DBE5A, { opacity: opacity, side: T.DoubleSide, roughness: 0.8 }));
      api.part(api.tag(g.wall, 'wall'), INFO.wall);
      g.mem = api.mesh(roundBox(T, 9.8, 7.0, 7.0, 0.6), api.mat(0xC6E9A8, { opacity: opacity * 0.8, side: T.DoubleSide }));
    } else {
      g.memGeo = blobGeo(T, 4.2, 0.06, 1.3);
      g.mem = api.mesh(g.memGeo, api.mat(0xF2A7B6, { opacity, side: T.DoubleSide }));
    }
    api.part(g.mem, INFO.membrane);
    g.mem.renderOrder = 2; if (g.wall) g.wall.renderOrder = 3;

    // nhân
    const nuc = api.group(null, [nucPos.x, nucPos.y, nucPos.z]);
    api.mesh(new T.SphereGeometry(1.35, 48, 32), api.mat(0x8C6BD6, { opacity: 0.55, side: T.DoubleSide }), null, nuc);
    for (let k = 0; k < 22; k++) { // lỗ nhân
      const n = V(R() * 2 - 1, R() * 2 - 1, R() * 2 - 1).normalize();
      const ring = api.mesh(new T.TorusGeometry(0.09, 0.03, 6, 12), 0x4B2E83, null, nuc);
      ring.position.copy(n.clone().multiplyScalar(1.35)); ring.lookAt(n.clone().multiplyScalar(3));
    }
    const nl = api.sphere(0.45, 0x3B1F66, [0.3, 0.2, 0.1], nuc);
    for (let k = 0; k < 6; k++) { // sợi nhiễm sắc
      const pts = []; let p = V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(1.4);
      for (let j = 0; j < 7; j++) { pts.push(p.clone()); p.add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(0.7)); p.clampLength(0, 1.1); }
      api.tube(pts, 0.035, 0xD7B8FF, nuc);
    }
    api.part(api.tag(nuc, 'nucleus'), Object.assign({}, INFO.nucleus, { onSelect: () => {} }));
    api.part(nl, INFO.nucleolus);
    g.nuc = nuc;

    // lưới nội chất hạt: các túi dẹt uốn quanh nhân, có hạt ribosome
    const rer = api.group(null, [nucPos.x, nucPos.y, nucPos.z]);
    const riboPts = [];
    for (let k = 0; k < 5; k++) {
      const r = 1.75 + k * 0.28, arc = 2.4 - k * 0.15;
      const t = api.mesh(new T.TorusGeometry(r, 0.07, 6, 48, arc), api.mat(0x5FA8D3, { opacity: 0.95 }), null, rer);
      t.scale.set(1, 1, 3.2); t.rotation.set(Math.PI / 2, 0, 0.6 + k * 0.08);
      for (let j = 0; j < 26; j++) { const a = 0.6 + k * 0.08 + (j / 26) * arc; riboPts.push(V(nucPos.x + Math.cos(a) * (r + 0.09), nucPos.y + Math.sin(a) * (r + 0.09), nucPos.z + (R() - 0.5) * 0.4)); }
    }
    api.part(api.tag(rer, 'rer'), INFO.rer);
    // ribosome trên lưới và tự do
    const nFree = 160;
    for (let k = 0; k < nFree; k++) riboPts.push(inside(0.95));
    const ribo = new T.InstancedMesh(new T.SphereGeometry(0.045, 6, 5), api.mat(0x2C3E50), riboPts.length);
    const M4 = new T.Matrix4(); riboPts.forEach((p, k) => { M4.makeTranslation(p.x, p.y, p.z); ribo.setMatrixAt(k, M4); });
    api.root.add(ribo); api.part(api.tag(ribo, 'ribo'), INFO.ribo);

    // lưới nội chất trơn: ống phân nhánh
    const ser = api.group(null, plant ? [-0.6, -1.9, 1.4] : [1.2, -1.4, 1.2]);
    for (let k = 0; k < 6; k++) {
      const pts = []; let p = V(R() - 0.5, R() - 0.5, R() - 0.5);
      for (let j = 0; j < 6; j++) { pts.push(p.clone()); p.add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(0.9)); }
      api.tube(pts, 0.09, 0xB7D86B, ser);
    }
    api.part(api.tag(ser, 'ser'), INFO.ser);

    // bộ máy Golgi
    const golgiPos = plant ? V(-0.4, 1.9, -1.4) : V(1.8, 1.3, -0.8);
    const golgi = api.group(null, [golgiPos.x, golgiPos.y, golgiPos.z]);
    for (let k = 0; k < 6; k++) {
      const t = api.mesh(new T.TorusGeometry(0.8 - k * 0.04, 0.07, 6, 32, 2.0), api.mat(0xE8C547), null, golgi);
      t.scale.set(1, 1, 3.4); t.position.set(k * 0.17, 0, 0); t.rotation.set(Math.PI / 2, Math.PI / 2, 2.1);
    }
    for (let k = 0; k < 7; k++) api.sphere(0.09, 0xF2D675, [0.9 + R() * 0.5, (R() - 0.5) * 1.2, (R() - 0.5) * 1.2], golgi, 10);
    golgi.rotation.y = -0.6;
    api.part(api.tag(golgi, 'golgi'), INFO.golgi);
    g.golgiPos = golgiPos;

    // nhóm bào quan trôi theo dòng tế bào chất
    const flow = api.group(); g.flow = flow;
    // ti thể
    const nMito = plant ? 6 : 10;
    for (let k = 0; k < nMito; k++) {
      const m = api.group(flow), p = inside(0.82);
      m.position.copy(p); m.rotation.set(R() * 3, R() * 3, R() * 3);
      api.mesh(new T.CapsuleGeometry(0.24, 0.62, 6, 14), api.mat(0xF2994A, { emissive: 0xFF5A00, emissiveIntensity: 0 }), null, m);
      for (let j = 0; j < 4; j++) { const c = api.box(0.03, 0.34, 0.28, 0xC0571C, [0, -0.24 + j * 0.16, 0], m); c.rotation.x = 1.57; c.rotation.z = j % 2 ? 0.3 : -0.3; }
      api.part(api.tag(m, 'mito'), INFO.mito);
    }
    // lysosome (động vật), peroxisome, glyoxysome (thực vật)
    const smallOrg = (key, n, color, r, info) => {
      for (let k = 0; k < n; k++) {
        const o = api.group(flow); o.position.copy(inside(0.85));
        api.sphere(r, color, null, o, 16);
        if (key === 'perox' || key === 'glyox') api.box(r * 0.9, r * 0.9, r * 0.9, key === 'perox' ? 0x2E7D5B : 0x8A6D1F, null, o).rotation.set(0.6, 0.6, 0);
        else for (let j = 0; j < 3; j++) api.sphere(r * 0.25, 0x5E2A80, [(R() - 0.5) * r, (R() - 0.5) * r, (R() - 0.5) * r], o, 8);
        api.part(api.tag(o, key), info);
      }
    };
    if (!plant) smallOrg('lyso', 6, 0xC793E8, 0.22, INFO.lyso);
    smallOrg('perox', plant ? 3 : 5, 0x9BE3B8, 0.18, INFO.perox);
    if (plant) smallOrg('glyox', 3, 0xE8D48A, 0.2, INFO.glyox);
    // lục lạp
    if (plant) {
      for (let k = 0; k < 9; k++) {
        const c = api.group(flow), a = (k / 9) * Math.PI * 2;
        c.position.set(Math.cos(a) * 3.9, (R() - 0.5) * 4.6, Math.sin(a) * 2.6 + (R() - 0.5));
        if (Math.abs(c.position.x) < 3) c.position.y = c.position.y > 0 ? 2.7 : -2.7;
        c.rotation.set(R(), R() * 3, R());
        const body = api.mesh(new T.SphereGeometry(0.62, 28, 18), api.mat(0x3E9B4A, { opacity: 0.85 }), null, c); body.scale.set(1.4, 0.55, 0.85);
        for (let j = 0; j < 4; j++) for (let h = 0; h < 3; h++) api.cyl(0.13, 0.13, 0.05, 0x1D5E2A, [-0.5 + j * 0.33, -0.08 + h * 0.07, 0], c, 12);
        api.part(api.tag(c, 'chloro'), INFO.chloro);
      }
      // không bào trung tâm
      const vac = api.mesh(blobGeo(T, 1, 0.05, 2.2, 48), api.mat(0x8FD3F4, { opacity: 0.35, side: T.DoubleSide }));
      vac.scale.set(2.3, 2.0, 2.0); vac.position.set(0.9, 0, 0);
      api.part(api.tag(vac, 'vacuole'), INFO.vacuole);
    }
    // trung thể
    if (!plant) {
      const ce = api.group(null, [1.0, 1.9, 1.2]);
      const c1 = api.cyl(0.11, 0.11, 0.42, 0x6B8BA8, null, ce, 9), c2 = api.cyl(0.11, 0.11, 0.42, 0x6B8BA8, [0.18, 0.05, 0], ce, 9);
      c1.rotation.z = 0; c2.rotation.x = Math.PI / 2;
      api.part(api.tag(ce, 'centro'), INFO.centro);
      g.centro = ce;
    }
    // khung xương tế bào
    const cyto = api.group();
    const from = plant ? V(0, 0, 0) : V(1.0, 1.9, 1.2);
    for (let k = 0; k < 18; k++) {
      const end = V(R() * 2 - 1, R() * 2 - 1, R() * 2 - 1).normalize().multiply(V(inner.x, inner.y, inner.z)).multiplyScalar(0.97);
      const st = plant ? end.clone().multiplyScalar(-0.2 + R() * 0.3) : from;
      const mid = st.clone().lerp(end, 0.5).add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(0.8));
      api.tube([st, mid, end], 0.018, 0x9EC7E6, cyto, 16);
    }
    api.part(api.tag(cyto, 'cyto'), INFO.cyto);

    // dòng tế bào chất: hạt nhỏ
    const nP = 300, pg = new T.BufferGeometry(), pa = new Float32Array(nP * 3);
    for (let k = 0; k < nP; k++) { const p = inside(0.95); pa.set([p.x, p.y, p.z], k * 3); }
    pg.setAttribute('position', new T.BufferAttribute(pa, 3));
    const pts = new T.Points(pg, new T.PointsMaterial({ color: 0xFFFFFF, size: 0.05, transparent: true, opacity: 0.6 }));
    pts.userData.noPick = true; api.root.add(pts); g.pts = pts;

    // túi vận chuyển: lưới nội chất → Golgi → màng (xuất bào)
    g.ves = [];
    for (let k = 0; k < 4; k++) {
      const v = api.sphere(0.11, 0xFFE38A, null, null, 12); v.userData.noPick = true;
      g.ves.push({ m: v, t: k / 4 });
    }
    g.rerEnd = nucPos.clone().add(V(1.9, 0.9, 0));
    g.exoPt = plant ? V(1.5, 3.4, -1.0) : V(2.4, 2.4, -1.9).normalize().multiplyScalar(4.1);
    g.phago = { t: 0 };
    g.plant = plant;

    api.onFrame((dt, t) => {
      if (!anim) return;
      flow.rotation.y += dt * (plant ? 0.12 : 0.06);
      flow.children.forEach((c, k) => { c.rotation.x += dt * 0.2 * ((k % 3) - 1); });
      pts.rotation.y += dt * 0.1;
      // ti thể nhấp nháy tạo ATP
      flow.traverse(o => { if (o.userData.group === 'mito') { const m = o.children[0].material; if (!m.userData.sv) m.emissiveIntensity = 0.25 + 0.25 * Math.max(0, Math.sin(t * 5 + o.position.x * 3)); } });
      // túi vận chuyển
      g.ves.forEach((v, k) => {
        v.t = (v.t + dt * 0.12) % 1;
        let p;
        if (v.t < 0.45) p = g.rerEnd.clone().lerp(g.golgiPos, v.t / 0.45);
        else p = g.golgiPos.clone().lerp(g.exoPt, (v.t - 0.45) / 0.55);
        v.m.position.copy(p); v.m.visible = vesOn;
        if (!plant && v.t > 0.96 && !g.phago.t) g.phago.t = 0.001;
      });
      // màng phồng ra tại điểm xuất bào
      if (!plant && g.memGeo) {
        if (g.phago.t) { g.phago.t += dt * 0.8; if (g.phago.t > 1) g.phago.t = 0; }
        const amp = g.phago.t ? Math.sin(g.phago.t * Math.PI) * 0.45 : 0;
        if (amp || g.wasAmp) {
          const P = g.memGeo.attributes.position, B = g.memGeo.userData.base, dir = g.exoPt.clone().normalize();
          for (let k = 0; k < P.count; k++) {
            const x = B[k * 3], y = B[k * 3 + 1], z = B[k * 3 + 2], l = Math.hypot(x, y, z);
            const c = (x * dir.x + y * dir.y + z * dir.z) / l, w = Math.max(0, (c - 0.9) / 0.1);
            const s = 1 + amp * w * w / 4.2;
            P.setXYZ(k, x * s, y * s, z * s);
          }
          P.needsUpdate = true; g.memGeo.computeVertexNormals(); g.wasAmp = amp > 0;
        }
      }
    });
  }
  let vesOn = true;

  // ---------- cấp 1: mô ----------
  function buildTissue(api, plant) {
    const T = api.T, R = api.rand(11);
    for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 0; k++) {
      const c = api.group(null, [i * (plant ? 2.3 : 2.1), j * (plant ? 1.8 : 2.1), k * 2]);
      let shell;
      if (plant) { shell = api.mesh(roundBox(T, 2.2, 1.7, 1.9, 0.18), api.mat(0x7DBE5A, { opacity: 0.55 }), null, c); for (let q = 0; q < 5; q++) api.sphere(0.16, 0x2F8A3E, [(R() - 0.5) * 1.6, (R() - 0.5) * 1.2, 0.85], c, 10); }
      else { shell = api.mesh(blobGeo(T, 1, 0.08, i + j * 3, 32), api.mat(0xF2A7B6, { opacity: 0.6 }), null, c); }
      api.sphere(0.32, 0x8C6BD6, [0, 0, plant ? 0.3 : 0.5], c, 16);
      c.userData.cell = true; void shell;
    }
    api.label(plant ? 'Mô thịt lá' : 'Mô biểu bì (động vật)', [0, 3.6, 0], { cls: 'big' });
    api.onPick(hit => { let o = hit && hit.object; while (o && !o.userData.cell) o = o.parent; if (o) { goLevel(api, 1); return true; } return false; });
    api.view({ pos: [3, 3, 16], target: [0, 0, 0], min: 7, max: 30 });
  }

  // ---------- cấp 3: nhân ----------
  function buildNucleus(api) {
    const T = api.T, R = api.rand(5), V = api.V;
    const outer = api.mesh(new T.SphereGeometry(4, 64, 40, 0, Math.PI * 1.5), api.mat(0x8C6BD6, { opacity: 0.6, side: T.DoubleSide }));
    const inner = api.mesh(new T.SphereGeometry(3.75, 64, 40, 0, Math.PI * 1.5), api.mat(0xA58BE8, { opacity: 0.5, side: T.DoubleSide }));
    const env = api.group(); env.add(outer); env.add(inner);
    api.part(env, INFO.envelope);
    const pores = api.group();
    for (let k = 0; k < 60; k++) {
      const n = V(R() * 2 - 1, R() * 2 - 1, R() * 2 - 1).normalize();
      const ang = Math.atan2(n.z, n.x); if (((-ang + Math.PI * 2) % (Math.PI * 2)) > Math.PI * 1.5 - 0.1) continue;
      const ring = api.mesh(new T.TorusGeometry(0.22, 0.08, 8, 16), 0x3B1F66, null, pores);
      ring.position.copy(n.multiplyScalar(3.88)); ring.lookAt(0, 0, 0);
    }
    api.part(pores, INFO.pore);
    const nl = api.sphere(1.1, 0x3B1F66, [0.6, 0.4, -0.4], null, 32); api.part(nl, INFO.nucleolus);
    const chrom = api.group();
    for (let k = 0; k < 10; k++) {
      const pts = []; let p = V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(4);
      for (let j = 0; j < 10; j++) { pts.push(p.clone()); p.add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(1.4)); p.clampLength(0, 3.3); }
      api.tube(pts, 0.09, 0xD7B8FF, chrom, 80);
    }
    api.part(chrom, INFO.chromatin);
    api.label('Màng nhân (màng kép)', [3.6, 2.4, 0.5]); api.label('Nhân con', nl, { off: [0, 1.4, 0] }); api.label('Lỗ nhân', [-2.6, 3.0, -0.8]);
    api.onPick(hit => { let o = hit && hit.object; while (o && o !== chrom) o = o.parent; if (o === chrom && api.sel && api.sel.obj === chrom) { goLevel(api, 3); return true; } return false; });
    api.view({ pos: [6, 3, 9], target: [0, 0, 0], min: 4.5, max: 18 });
  }

  // ---------- cấp 4: DNA quấn histone ----------
  function buildDNA(api) {
    const T = api.T, V = api.V;
    const pts = [];
    const nN = 5;
    for (let n = 0; n < nN; n++) {
      const cx = (n - (nN - 1) / 2) * 3.2, cy = n % 2 ? 0.6 : -0.6;
      const core = api.group(null, [cx, cy, 0]);
      const cols = [0xF2994A, 0xF2C94C, 0x6FC2E8, 0xE86A92];
      for (let k = 0; k < 8; k++) api.sphere(0.42, cols[k % 4], [((k & 1) - 0.5) * 0.7, (((k >> 1) & 1) - 0.5) * 0.7, ((k >> 2) - 0.5) * 0.6], core, 18);
      api.part(core, INFO.histone);
      // 1,65 vòng quấn quanh lõi
      for (let s = 0; s <= 40; s++) { const a = -Math.PI / 2 + s / 40 * Math.PI * 2 * 1.65; pts.push(V(cx + Math.cos(a) * 1.05, cy + Math.sin(a) * 1.05, -0.55 + s / 40 * 1.1)); }
    }
    // hai mạch xoắn kép quanh đường quấn
    const curve = new T.CatmullRomCurve3(pts);
    const N = 900, s1 = [], s2 = [], rungs = api.group();
    const fr = curve.computeFrenetFrames(N, false);
    for (let k = 0; k <= N; k++) {
      const u = k / N, p = curve.getPointAt(u), a = u * 260;
      const nrm = fr.normals[k], bin = fr.binormals[k];
      const off1 = nrm.clone().multiplyScalar(Math.cos(a) * 0.16).add(bin.clone().multiplyScalar(Math.sin(a) * 0.16));
      s1.push(p.clone().add(off1)); s2.push(p.clone().sub(off1));
      if (k % 6 === 0) api.lineBetween(p.clone().add(off1), p.clone().sub(off1), 0.025, [0xE5534B, 0x3FB37F, 0xF2C94C, 0x2F80C0][(k / 6) % 4], rungs);
    }
    const dna = api.group();
    api.tube(s1, 0.045, 0xF4F7FA, dna, 1600); api.tube(s2, 0.045, 0xA9C4DD, dna, 1600); dna.add(rungs);
    api.part(dna, INFO.dna);
    api.label('Lõi 8 histone', [-6.4, -2.2, 0]); api.label('DNA quấn 1¾ vòng', [0, 2.3, 0]); api.label('DNA nối', [-4.8, 1.4, 0]);
    api.view({ pos: [0, 2, 13], target: [0, 0, 0], min: 3, max: 20 });
  }

  function goLevel(api, n) { lv = n; api.setTab(api.tab); }

  function applyClip(api) {
    if (!clipOn) { api.clip(null); return; }
    const T = api.T, a = clipAng * Math.PI / 180;
    const n = clipAx === 'x' ? new T.Vector3(Math.cos(a), 0, Math.sin(a)) : clipAx === 'y' ? new T.Vector3(Math.sin(a), Math.cos(a), 0) : new T.Vector3(0, Math.sin(a), Math.cos(a));
    api.clip(new T.Plane(n.negate(), clipPos * 5));
  }

  NL.m3d.register('M1', {
    title: 'Tế bào nhân thực',
    tabs: [{ t: '🐾 Tế bào Động vật', v: 'animal' }, { t: '🌿 Tế bào Thực vật', v: 'plant' }],
    init() { lv = 1; },
    build(api, tab) {
      const plant = tab === 'plant';
      api.levels(['Mô', 'Tế bào', 'Nhân tế bào', 'DNA – Histone'], lv, n => goLevel(api, n));
      if (lv === 0) { buildTissue(api, plant); return; }
      if (lv === 2) { buildNucleus(api); return; }
      if (lv === 3) { buildDNA(api); return; }
      buildCell(api, plant);
      api.view({ pos: [6, 4, 11], target: [0, 0, 0], min: 4.6, max: 24 });
      // bảng điều khiển
      api.slider({ label: plant ? 'Độ trong suốt màng + thành' : 'Độ trong suốt màng', min: 0, max: 100, step: 5, value: Math.round((1 - opacity) * 100), unit: '%', onInput(v) { opacity = 1 - v / 100; if (cur.mem) api.setOpacity(cur.mem, Math.max(0.02, opacity) / 0.35 * (plant ? 0.8 : 1)); if (cur.wall) api.setOpacity(cur.wall, Math.max(0.02, opacity) / 0.35); } });
      const plantOnly = k => ({ dis: !plant, onDis: () => api.warn('no-' + k, WARN_A[k]) });
      const animalOnly = k => ({ dis: plant, onDis: () => api.warn('no-' + k, WARN_P[k]) });
      api.checklist([
        { k: 'nucleus', label: 'Nhân tế bào' }, { k: 'mito', label: 'Ti thể' }, { k: 'rer', label: 'Lưới nội chất hạt' }, { k: 'ser', label: 'Lưới nội chất trơn' },
        { k: 'golgi', label: 'Bộ máy Golgi' }, { k: 'ribo', label: 'Ribosome' }, { k: 'cyto', label: 'Khung xương tế bào' },
        Object.assign({ k: 'chloro', label: 'Lục lạp' }, plantOnly('chloro')), Object.assign({ k: 'vacuole', label: 'Không bào trung tâm' }, plantOnly('vacuole')),
        Object.assign({ k: 'wall', label: 'Thành tế bào' }, plantOnly('wall')), Object.assign({ k: 'centro', label: 'Trung thể' }, animalOnly('centro')),
        Object.assign({ k: 'lyso', label: 'Lysosome' }, animalOnly('lyso')), { k: 'perox', label: 'Peroxisome' }, Object.assign({ k: 'glyox', label: 'Glyoxisome' }, plantOnly('glyox'))
      ].map(it => Object.assign(it, { on: !it.dis })));
      api.toggle({ label: 'Chuyển động nội bào', value: anim, onChange(v) { anim = v; vesOn = v; if (!v) cur.flow.traverse(o => { if (o.userData.group === 'mito') o.children[0].material.emissiveIntensity = 0; }); } });
      api.section('✂️ Mặt cắt 3D');
      api.toggle({ label: 'Bật mặt cắt', value: clipOn, onChange(v) { clipOn = v; applyClip(api); } });
      api.choices({ items: [{ t: 'Trục X', v: 'x' }, { t: 'Trục Y', v: 'y' }, { t: 'Trục Z', v: 'z' }], value: clipAx, onPick(v) { clipAx = v; applyClip(api); } });
      api.slider({ label: 'Vị trí cắt', min: -100, max: 100, step: 5, value: Math.round(clipPos * 100), unit: '%', lazy: true, onInput(v) { clipPos = v / 100; applyClip(api); } });
      api.slider({ label: 'Góc cắt', min: 0, max: 360, step: 5, value: clipAng, unit: '°', lazy: true, onInput(v) { clipAng = v; applyClip(api); } });
      applyClip(api);
      api.note('Chạm vào một bào quan để xem thẻ thông tin. Cuộn sát vào nhân để xuống cấp nhỏ hơn.');
      api.onPick(hit => {
        let o = hit && hit.object; while (o && !o.userData.part) o = o.parent;
        if (o && o === cur.nuc && api.sel && api.sel.obj === cur.nuc) { goLevel(api, 2); return true; }
        return false;
      });
    },
    data(api) {
      const plant = api.tab === 'plant', vol = VOL[plant ? 'plant' : 'animal'];
      const rows = CMP.map((r, k) => {
        const key = r[3]; let v = '';
        if (key) { const hit = Object.keys(vol).find(n => n.startsWith(key)); v = hit ? vol[hit] : (plant ? (r[2] === 'Có' ? '<1' : 0) : (r[1] === 'Có' ? '<1' : 0)); }
        else v = r[0] === 'Ribosome' || r[0] === 'Khung xương tế bào' ? 'trong bào tương' : (plant ? (r[2].startsWith('Có') ? '<1' : 0) : (r[1] === 'Có' ? '<1' : 0));
        return [k + 1, r[0], r[1], r[2], v, r[4]];
      });
      const labels = Object.keys(vol);
      return {
        title: 'So sánh tế bào động vật và thực vật',
        sub: `Tỉ lệ thể tích (ước tính) của ${plant ? 'tế bào thịt lá (thực vật)' : 'tế bào gan (động vật)'}`,
        sheets: [
          { name: 'Đối chiếu cấu trúc', head: ['STT', 'Bào quan / Cấu trúc', 'Tế bào Động vật', 'Tế bào Thực vật', `Tỉ lệ thể tích (%) – ${plant ? 'thực vật' : 'động vật'}`, 'Chức năng chính'], rows },
          { name: 'Tỉ lệ thể tích', head: ['Thành phần', 'Tỉ lệ thể tích (%)'], rows: labels.map(l => [l, vol[l]]) }
        ],
        chart: { type: 'pie', labels, values: labels.map(l => vol[l]), colors: COLORS, title: 'Tỉ lệ thể tích các thành phần (%)' }
      };
    }
  });

  const WARN_A = {
    chloro: 'Tế bào động vật không chứa lục lạp vì động vật là sinh vật dị dưỡng, không có khả năng tự tổng hợp chất hữu cơ bằng quá trình quang hợp!',
    vacuole: 'Tế bào động vật không có không bào trung tâm lớn. Chỉ có các không bào nhỏ (không bào tiêu hóa, không bào co bóp ở động vật nguyên sinh).',
    wall: 'Tế bào động vật không có thành tế bào cellulose. Bên ngoài màng sinh chất chỉ có chất nền ngoại bào, nhờ vậy tế bào động vật mềm và dễ thay đổi hình dạng.',
    glyox: 'Glyoxisome chỉ có ở tế bào thực vật (nhiều ở hạt có dầu đang nảy mầm) để chuyển lipid dự trữ thành đường.'
  };
  const WARN_P = {
    centro: 'Tế bào thực vật bậc cao không có trung thể. Thoi phân bào ở thực vật được hình thành từ các vùng tổ chức vi ống khác.',
    lyso: 'Tế bào thực vật hầu như không có lysosome điển hình. Chức năng tiêu hóa nội bào do không bào đảm nhận.'
  };
})();
