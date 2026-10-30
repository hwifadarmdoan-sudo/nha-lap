// Mô hình 2: DNA & RNA. Cấu trúc (3 kiểu hiển thị, thước đo, chia đôi màn hình), cơ chế (nhân đôi, phiên mã, dịch mã), đột biến gene.
(function () {
  const BC = { A: 0xE5534B, T: 0x3FB37F, U: 0x3FB37F, G: 0xF2C94C, C: 0x2F80C0 };
  const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const RPAIR = { A: 'U', T: 'A', G: 'C', C: 'G' };
  const NAME = { A: 'Adenine', T: 'Thymine', G: 'Guanine', C: 'Cytosine', U: 'Uracil' };
  // bảng mã di truyền (mRNA)
  const AA = {};
  'UUU:Phe UUC:Phe UUA:Leu UUG:Leu CUU:Leu CUC:Leu CUA:Leu CUG:Leu AUU:Ile AUC:Ile AUA:Ile AUG:Met GUU:Val GUC:Val GUA:Val GUG:Val UCU:Ser UCC:Ser UCA:Ser UCG:Ser CCU:Pro CCC:Pro CCA:Pro CCG:Pro ACU:Thr ACC:Thr ACA:Thr ACG:Thr GCU:Ala GCC:Ala GCA:Ala GCG:Ala UAU:Tyr UAC:Tyr UAA:KT UAG:KT CAU:His CAC:His CAA:Gln CAG:Gln AAU:Asn AAC:Asn AAA:Lys AAG:Lys GAU:Asp GAC:Asp GAA:Glu GAG:Glu UGU:Cys UGC:Cys UGA:KT UGG:Trp CGU:Arg CGC:Arg CGA:Arg CGG:Arg AGU:Ser AGC:Ser AGA:Arg AGG:Arg GGU:Gly GGC:Gly GGA:Gly GGG:Gly'.split(' ').forEach(x => { const [k, v] = x.split(':'); AA[k] = v; });
  const translate = mrna => { const out = []; let i = mrna.indexOf('AUG'); if (i < 0) return out; for (; i + 3 <= mrna.length; i += 3) { const a = AA[mrna.substr(i, 3)]; out.push(a); if (a === 'KT') break; } return out; };

  const INFO = {
    P: { name: 'Nhóm phosphate', sci: 'Phosphate', rows: [['Điện tích', 'Trong mạch DNA, mỗi nhóm phosphate mang 1 điện tích âm, nên cả phân tử DNA tích điện âm'], ['Liên kết', 'Liên kết phosphodiester nối C3′ của đường này với C5′ của đường kế tiếp'], ['Năng lượng liên kết', '≈ 340 kJ/mol (liên kết cộng hóa trị P–O)'], ['Khoảng cách', 'P–O ≈ 0,16 nm; 2 nhóm phosphate kề nhau ≈ 0,7 nm']] },
    S: { name: 'Đường deoxyribose', sci: 'Deoxyribose (C₅H₁₀O₄)', rows: [['Công thức', 'C₅H₁₀O₄, vòng 5 cạnh (4C + 1O)'], ['Khác ribose', 'Thiếu 1 nguyên tử O ở C2′ (ribose của RNA là C₅H₁₀O₅)'], ['Liên kết', 'Liên kết glycosidic C1′–N với base; liên kết phosphodiester ở C3′ và C5′'], ['Khoảng cách', 'C1′–N ≈ 0,15 nm']] },
    R: { name: 'Đường ribose', sci: 'Ribose (C₅H₁₀O₅)', rows: [['Công thức', 'C₅H₁₀O₅, có nhóm –OH ở C2′'], ['Liên kết', 'Glycosidic với base, phosphodiester với phosphate']] },
    base: b => ({ name: 'Base ' + NAME[b] + ' (' + b + ')', sci: NAME[b], rows: [['Loại', 'AG'.includes(b) ? 'Purine (2 vòng)' : 'Pyrimidine (1 vòng)'], ['Công thức', { A: 'C₅H₅N₅', T: 'C₅H₆N₂O₂', G: 'C₅H₅N₅O', C: 'C₄H₅N₃O', U: 'C₄H₄N₂O₂' }[b]], ['Bắt cặp', b === 'U' ? 'U – A bằng 2 liên kết hydrogen (trong RNA)' : `${b} – ${PAIR[b]} bằng ${'AT'.includes(b) ? 2 : 3} liên kết hydrogen`], ['Liên kết với đường', 'Liên kết glycosidic (N–C1′)']] }),
    H: { name: 'Liên kết hydrogen', sci: 'Hydrogen bond', rows: [['Vị trí', 'Giữa 2 base đối diện: A–T có 2, G–C có 3 liên kết'], ['Năng lượng', 'Yếu, khoảng 4–20 kJ/mol mỗi liên kết'], ['Khoảng cách', '≈ 0,28–0,30 nm (giữa 2 nguyên tử N/O)'], ['Ý nghĩa', 'Dễ đứt khi nhân đôi, phiên mã; nhiều liên kết thì DNA bền']] },
    PD: { name: 'Liên kết phosphodiester', sci: 'Phosphodiester bond (3′–5′)', rows: [['Vị trí', 'Nối C3′ của đường với C5′ của đường kế tiếp qua nhóm phosphate'], ['Loại', 'Liên kết cộng hóa trị, rất bền'], ['Năng lượng', '≈ 340 kJ/mol'], ['Ý nghĩa', 'Tạo khung đường – phosphate, quy định chiều 5′ → 3′ của mạch']] },
    groove: { name: 'Rãnh lớn và rãnh nhỏ', sci: 'Major / minor groove', rows: [['Rãnh lớn', 'Rộng ≈ 2,2 nm'], ['Rãnh nhỏ', 'Rộng ≈ 1,2 nm'], ['Ý nghĩa', 'Nơi protein điều hòa "đọc" trình tự base mà không cần tháo xoắn']] },
    mrna: { name: 'mRNA (RNA thông tin)', sci: 'Messenger RNA', rows: [['Cấu trúc', 'Một mạch đơn thẳng, đường ribose, base A U G C'], ['Chức năng', 'Mang thông tin di truyền từ gene tới ribosome làm khuôn dịch mã'], ['Đơn vị mã', 'Bộ ba mã hóa (codon); mở đầu AUG, kết thúc UAA, UAG, UGA']] },
    trna: { name: 'tRNA (RNA vận chuyển)', sci: 'Transfer RNA', rows: [['Cấu trúc', 'Một mạch đơn cuộn lại thành hình lá chẻ ba (3 thùy), có đoạn bắt cặp bổ sung'], ['Bộ ba đối mã', 'Ở thùy giữa, khớp bổ sung với codon trên mRNA'], ['Đầu 3′', 'Trình tự CCA gắn amino acid'], ['Độ dài', '≈ 75–90 nucleotide']] },
    anticodon: { name: 'Bộ ba đối mã', sci: 'Anticodon', rows: [['Vị trí', 'Thùy giữa của tRNA'], ['Chức năng', 'Bắt cặp bổ sung, ngược chiều với codon trên mRNA']] },
    aa: { name: 'Amino acid', sci: 'Amino acid', rows: [['Vị trí', 'Gắn vào đầu 3′ (CCA) của tRNA'], ['Liên kết', 'Các amino acid nối nhau bằng liên kết peptide tại ribosome']] },
    rrna: { name: 'rRNA và ribosome', sci: 'Ribosomal RNA', rows: [['Cấu trúc', 'rRNA kết hợp protein tạo 2 tiểu đơn vị: bé (40S) và lớn (60S)'], ['Chức năng', 'Ribosome là nơi dịch mã; rRNA xúc tác hình thành liên kết peptide'], ['Vị trí A, P, E', 'A: nhận tRNA mới; P: giữ chuỗi polypeptide; E: tRNA rời đi']] },
    small: { name: 'Tiểu đơn vị bé', sci: 'Small subunit (40S)', rows: [['Thành phần', 'rRNA 18S + khoảng 33 protein'], ['Chức năng', 'Gắn và trượt trên mRNA, kiểm soát khớp codon – anticodon']] },
    large: { name: 'Tiểu đơn vị lớn', sci: 'Large subunit (60S)', rows: [['Thành phần', 'rRNA 28S, 5,8S, 5S + khoảng 47 protein'], ['Chức năng', 'Chứa vị trí A, P, E; xúc tác liên kết peptide']] },
    helicase: { name: 'Enzyme Helicase', sci: 'Helicase', rows: [['Chức năng', 'Cắt đứt liên kết hydrogen, tháo xoắn, tách 2 mạch tạo chạc tái bản chữ Y'], ['Nguồn năng lượng', 'ATP']] },
    pol: { name: 'DNA Polymerase', sci: 'DNA polymerase', rows: [['Chức năng', 'Lắp nucleotide tự do theo nguyên tắc bổ sung, kéo dài mạch mới chiều 5′ → 3′'], ['Mạch liên tục', 'Tổng hợp liên tục cùng chiều tháo xoắn'], ['Mạch gián đoạn', 'Tổng hợp thành các đoạn Okazaki ngược chiều tháo xoắn'], ['Cần mồi', 'Không tự bắt đầu được: enzyme primase phải đặt trước một đoạn mồi RNA ngắn, polymerase mới nối tiếp vào đầu 3′ của mồi']] },
    ligase: { name: 'DNA Ligase', sci: 'DNA ligase', rows: [['Chức năng', 'Nối các đoạn Okazaki bằng liên kết phosphodiester']] },
    rnapol: { name: 'RNA Polymerase', sci: 'RNA polymerase', rows: [['Chức năng', 'Bám vùng khởi động (promoter), tháo xoắn, trượt trên mạch gốc chiều 3′ → 5′, tổng hợp mRNA chiều 5′ → 3′'], ['Nguyên tắc', 'A – U, T – A, G – C, C – G']] }
  };

  let style = 'ball', bbOp = 1, ruler = false, unit = 'nm', proc = 'rep', speed = 1, playing = true, selfPair = false;
  let rulerPts = [], rulerObjs = [];
  const SEQ = 'ATGCGTACCTTAGGCATCGA';
  // gene cho chế độ đột biến (mạch mã hóa 5′→3′): Met Ala Ser Gly Lys Trp His Asp KT
  const GENE0 = 'ATGGCTTCTGGAAAATGGCACGATTAA';
  let gene = GENE0, selPos = 7, lastMut = null;

  // ---------- dựng chuỗi xoắn kép ----------
  function helix(api, seq, parent, o = {}) {
    const T = api.T, V = api.V, N = seq.length, g = api.group(parent);
    const rise = 0.34, x0 = -(N - 1) / 2 * rise, sty = o.style || style;
    const pos = (i, ang, r) => V(x0 + i * rise, Math.cos(ang) * r, Math.sin(ang) * r);
    const A = i => i * Math.PI / 5; // 36° mỗi cặp
    const OFF = Math.PI * 0.8; // mạch 2 lệch 144° tạo rãnh lớn / rãnh nhỏ
    const sz = sty === 'fill' ? { P: 0.3, S: 0.3, B: 0.17 } : sty === 'ribbon' ? { P: 0.07, S: 0.07, B: 0.05 } : { P: 0.13, S: 0.11, B: 0.06 };
    const strands = [[], []], items = [];
    for (let i = 0; i < N; i++) {
      const b1 = seq[i], b2 = o.single ? null : (o.rna ? RPAIR : PAIR)[b1];
      [[b1, 0], [b2, 1]].forEach(([b, s]) => {
        if (!b) return;
        const ang = A(i) + (s ? OFF : 0);
        const P = pos(i + (s ? 0.5 : -0.5) * 0.6, ang, 1.0), S = pos(i, ang + (s ? -0.18 : 0.18), 0.78);
        const nt = api.group(g); nt.userData.nt = { i, s, b };
        const pm = api.sphere(sz.P, 0xF2994A, [P.x, P.y, P.z], nt, 14); pm.userData.atom = 'Nhóm phosphate';
        const sm = api.sphere(sz.S, o.rna ? 0xF4D3E0 : 0xE6EEF5, [S.x, S.y, S.z], nt, 14); sm.userData.atom = o.rna ? 'Đường ribose' : 'Đường deoxyribose';
        api.tag(pm, 'bb'); api.tag(sm, 'bb');
        api.part(pm, INFO.P); api.part(sm, o.rna ? INFO.R : INFO.S);
        // base: từ đường hướng vào giữa
        const mid = o.single ? pos(i, ang, 0.15) : pos(i, A(i) + OFF / 2, Math.cos(OFF / 2) * 0.78);
        const end = S.clone().lerp(mid, 0.9);
        const bg = api.group(nt); api.tag(bg, 'b' + (b === 'U' ? 'T' : b));
        if (sty === 'ribbon') { const bx = api.lineBetween(S, end, 0.09, BC[b], bg); bx.scale.set(1.6, 1, 0.35); }
        else { api.lineBetween(S, end, sz.B, BC[b], bg); const tip = api.sphere(sty === 'fill' ? 0.24 : 0.12, BC[b], [end.x, end.y, end.z], bg, 14); tip.userData.atom = 'Base ' + b; }
        bg.userData.atomBase = b;
        api.part(bg, INFO.base(b));
        strands[s].push({ P, S, end, nt, b, i });
        items.push(nt);
      });
      if (!o.single) {
        const e1 = strands[0][i].end, e2 = strands[1][strands[1].length - 1].end, nH = 'AT'.includes(b1) ? 2 : 3;
        const hb = api.group(g); api.tag(hb, 'hb');
        for (let k = 0; k < nH; k++) {
          const sh = V(0, 0, 0).add(V((k - (nH - 1) / 2) * 0.09, 0, 0));
          for (let d = 0; d < 3; d++) { const a = e1.clone().lerp(e2, 0.15 + d * 0.27).add(sh), b = e1.clone().lerp(e2, 0.27 + d * 0.27).add(sh); api.lineBetween(a, b, 0.018, 0xDDF6FF, hb).material.emissive = new T.Color(0x66CCFF); }
        }
        api.part(hb, Object.assign({}, INFO.H, { name: `Liên kết hydrogen ${b1} – ${b2} (${nH} liên kết)` }));
      }
    }
    // liên kết phosphodiester (đường → phosphate kế tiếp) và dải khung
    strands.forEach((st, s) => {
      if (!st.length) return;
      const pd = api.group(g); api.tag(pd, 'pd');
      for (let k = 0; k < st.length; k++) {
        api.lineBetween(st[k].S, st[k].P, sty === 'fill' ? 0.08 : 0.04, 0xFFB46B, pd);
        if (k + 1 < st.length) api.lineBetween(st[k].S, st[k + 1].P, sty === 'fill' ? 0.08 : 0.04, 0xFFB46B, pd);
      }
      api.part(pd, INFO.PD);
      if (sty === 'ribbon') { const t = api.tube(st.map(n => n.P), 0.12, s ? 0x7FB6E0 : 0xF2994A, g); api.tag(t, 'bb'); api.part(t, INFO.P); }
      const first = st[0], last = st[st.length - 1];
      const l5 = s ? last : first, l3 = s ? first : last;
      if (!o.noLabels) {
        const a = api.label("5′", l5.nt.children[0], { cls: 'tag', color: '#E5534B', off: [0, 0.45, 0] }), b = api.label("3′", l3.nt.children[0], { cls: 'tag', color: '#2F80C0', off: [0, 0.45, 0] });
        a.el.dataset.g = 'ends'; b.el.dataset.g = 'ends'; (g.userData.endLabels = g.userData.endLabels || []).push(a, b);
      }
    });
    // rãnh lớn / rãnh nhỏ
    if (!o.single && !o.noGroove) {
      const gr = api.group(g); api.tag(gr, 'groove');
      const minor = [], major = [];
      for (let k = 0; k <= N * 4; k++) { const i = k / 4; minor.push(pos(i, A(i) + OFF / 2, 0.95)); major.push(pos(i, A(i) + OFF / 2 + Math.PI, 0.95)); }
      const t1 = api.tube(minor, 0.28, 0x9AA9B7, gr), t2 = api.tube(major, 0.45, 0xC9D3DD, gr);
      t1.material.opacity = 0.22; t2.material.opacity = 0.18; t1.material.depthWrite = t2.material.depthWrite = false;
      api.part(gr, INFO.groove);
      gr.visible = false;
    }
    g.userData.strands = strands;
    return g;
  }

  function applyVis(api, vis) {
    Object.keys(vis).forEach(k => api.groupVis(k, vis[k]));
    api.root.traverse(o => { if (o.userData.endLabels) o.userData.endLabels.forEach(l => l.show(vis.ends)); });
  }
  const VIS = { bb: true, bA: true, bT: true, bG: true, bC: true, hb: true, pd: true, ends: true, groove: false };

  // ---------- thước đo ----------
  function rulerPick(api, hit) {
    if (!ruler) return false;
    if (!hit || !hit.object.userData.atom) { api.toast('Chạm đúng vào một quả cầu (nguyên tử) nhé'); return true; }
    const T = api.T, p = hit.object.getWorldPosition(new T.Vector3());
    if (rulerPts.length >= 2) clearRuler(api);
    rulerPts.push({ p, name: hit.object.userData.atom });
    const dot = api.sphere(0.08, 0xFFFF66, [p.x, p.y, p.z]); dot.material.emissive = new T.Color(0xFFFF00); dot.userData.noPick = true; rulerObjs.push(dot);
    api.beep(1500, 0.08, 'square', 0.06);
    if (rulerPts.length === 2) {
      const [a, b] = rulerPts, d = a.p.distanceTo(b.p), ax = Math.abs(a.p.x - b.p.x), rad = Math.hypot(a.p.y - b.p.y, a.p.z - b.p.z);
      const geo = new T.BufferGeometry().setFromPoints([a.p, b.p]);
      const line = new T.Line(geo, new T.LineDashedMaterial({ color: 0xFFFF66, dashSize: 0.08, gapSize: 0.05 })); line.computeLineDistances(); line.userData.noPick = true; api.root.add(line); rulerObjs.push(line);
      const f = v => unit === 'nm' ? v.toFixed(2) + ' nm' : (v * 10).toFixed(1) + ' Å';
      const l = api.label(`📏 ${f(d)}`, [(a.p.x + b.p.x) / 2, (a.p.y + b.p.y) / 2 + 0.3, (a.p.z + b.p.z) / 2], { cls: 'big' }); rulerObjs.push(l);
      api.caption(`Thước đo: ${a.name} – ${b.name} = ${f(d)}`);
      rulerNote && rulerNote.set(`<b>${a.name} → ${b.name}</b><br>Thẳng: <b>${f(d)}</b><br>Dọc trục xoắn: <b>${f(ax)}</b><br>Ngang trục: <b>${f(rad)}</b>`);
    }
    return true;
  }
  let rulerNote = null;
  function clearRuler(api) { rulerObjs.forEach(o => o.remove ? (o.isObject3D ? o.parent && o.parent.remove(o) : o.remove()) : 0); rulerObjs.forEach(o => { if (o.isObject3D && o.parent) o.parent.remove(o); }); rulerObjs = []; rulerPts = []; api.caption(''); }

  // ---------- RNA ----------
  function buildMRNA(api, parent, seq, x0, right) {
    const V = api.V, g = api.group(parent);
    const pts = [];
    for (let i = 0; i < seq.length; i++) {
      const x = (x0 || 0) + (i - (seq.length - 1) / 2) * 0.42, y = Math.sin(i * 0.5) * 0.25;
      const nt = api.group(g); const b = seq[i];
      const P = V(x, y + 0.5, 0), S = V(x + 0.1, y + 0.2, 0.15), E = V(x + 0.1, y - 0.55, 0.15);
      const pm = api.sphere(0.12, 0xF2994A, [P.x, P.y, P.z], nt, 12), sm = api.sphere(0.11, 0xF4D3E0, [S.x, S.y, S.z], nt, 12);
      pm.userData.atom = 'Nhóm phosphate'; sm.userData.atom = 'Đường ribose'; api.tag(pm, 'bb'); api.tag(sm, 'bb');
      const bg = api.group(nt); api.lineBetween(S, E, 0.06, BC[b], bg); api.sphere(0.12, BC[b], [E.x, E.y, E.z], bg, 12).userData.atom = 'Base ' + b;
      api.tag(bg, 'b' + (b === 'U' ? 'T' : b)); api.part(bg, INFO.base(b));
      pts.push(P);
      if (i % 3 === 2) api.label(seq.substr(i - 2, 3), [x - 0.42, y - 1.0, 0.15], { cls: 'plain', right });
    }
    const t = api.tube(pts, 0.05, 0xFFB46B, g); api.tag(t, 'pd'); api.part(t, INFO.PD);
    return g;
  }
  function buildTRNA(api) {
    const V = api.V;
    // hình lá chẻ ba (cỏ 3 lá): thân nhận amino acid ở trên, 3 thùy D, đối mã, T
    const stem = (a, b, n, c1) => { const g = api.group(); for (let k = 0; k < n; k++) { const t = k / (n - 1); const p = a.clone().lerp(b, t); api.sphere(0.13, 0xF4D3E0, [p.x - 0.35, p.y, p.z], g, 10); api.sphere(0.13, 0xF4D3E0, [p.x + 0.35, p.y, p.z], g, 10); api.lineBetween(V(p.x - 0.3, p.y, p.z), V(p.x + 0.3, p.y, p.z), 0.05, c1 || 0x9EC7E6, g); } return g; };
    const loop = (c, r, n, color) => { const g = api.group(); for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2; api.sphere(0.13, color || 0xF4D3E0, [c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, c.z], g, 10); } return g; };
    const tr = api.group();
    tr.add(stem(V(0, 3.2, 0), V(0, 1.4, 0), 7));
    tr.add(stem(V(-1.6, 0.8, 0), V(-2.8, 0.8, 0), 4)).rotation.z = 0;
    tr.add(loop(V(-3.6, 0.8, 0), 0.7, 9));
    tr.add(stem(V(1.6, 0.8, 0), V(2.8, 0.8, 0), 4));
    tr.add(loop(V(3.6, 0.8, 0), 0.7, 8));
    tr.add(stem(V(0, 0.2, 0), V(0, -1.6, 0), 5));
    const ac = api.group(tr);
    ['G', 'A', 'U'].forEach((b, k) => { const x = -0.45 + k * 0.45; api.sphere(0.2, BC[b], [x, -2.7, 0], ac, 14); api.label(b, [x, -3.15, 0], { cls: 'tag', color: '#' + BC[b].toString(16).padStart(6, '0') }); });
    loop(V(0, -2.4, 0), 0.75, 7, 0xF4D3E0).position.set(0, 0, -0.01);
    const cca = api.group(tr); ['C', 'C', 'A'].forEach((b, k) => api.sphere(0.15, BC[b], [0.35, 3.5 + k * 0.32, 0], cca, 10));
    const aa = api.sphere(0.4, 0x9B6BD6, [0.35, 4.75, 0], tr, 20);
    api.part(tr, INFO.trna); api.part(ac, INFO.anticodon); api.part(aa, Object.assign({}, INFO.aa, { name: 'Amino acid (Leu)', text: 'Bộ ba đối mã 3′-GAU-5′ khớp với codon 5′-CUA-3′ mã hóa Leucine' }));
    api.label('Đầu 3′ (CCA) gắn amino acid', [1.4, 4.2, 0]); api.label('Bộ ba đối mã', [1.6, -2.7, 0]); api.label('Thùy D', [-3.6, 1.8, 0]); api.label('Thùy T', [3.6, 1.8, 0]);
    tr.rotation.y = 0.3;
  }
  function buildRibosome(api, parent, at) {
    const T = api.T, R = api.rand(9), g = api.group(parent, at || [0, 0, 0]);
    const large = api.mesh(new T.SphereGeometry(1.6, 40, 28), api.mat(0x8E7CC3, { opacity: 0.55 }), [0, 1.0, 0], g); large.scale.set(1.25, 0.85, 1);
    const small = api.mesh(new T.SphereGeometry(1.2, 40, 28), api.mat(0xC3B4E8, { opacity: 0.6 }), [0, -0.85, 0], g); small.scale.set(1.35, 0.55, 0.95);
    for (let k = 0; k < 4; k++) { const pts = []; for (let j = 0; j < 8; j++) pts.push([(R() - 0.5) * 2.4, 1 + (R() - 0.5) * 1.6, (R() - 0.5) * 1.6]); api.tube(pts, 0.05, 0xF4D3E0, large, 60).position.set(0, -1.0, 0); }
    for (let k = 0; k < 12; k++) api.sphere(0.16, 0x5E4B8B, [(R() - 0.5) * 2.6, 1 + (R() - 0.5) * 1.2, (R() - 0.5) * 1.4], g, 10);
    api.part(large, INFO.large); api.part(small, INFO.small);
    return { g, large, small };
  }

  // ---------- cơ chế ----------
  function buildProcess(api) {
    const T = api.T, V = api.V, R = api.rand(4);
    const st = { t: 0 };
    api.choices({ label: 'Tiến trình', items: [{ t: 'Nhân đôi DNA', v: 'rep' }, { t: 'Phiên mã', v: 'tx' }, { t: 'Dịch mã', v: 'tl' }], value: proc, onPick(v) { proc = v; api.setTab('proc'); } });
    api.toggle({ label: '⏯ Đang chạy', value: playing, onChange(v) { playing = v; } });
    api.slider({ label: 'Tốc độ', min: 0.25, max: 3, step: 0.25, value: speed, unit: '×', onInput(v) { speed = v; } });
    const N = 34, rise = 0.42, x0 = -(N - 1) / 2 * rise, seq = 'TACGGATCCTAGCATGCTTACGGATTCAGCTAGG'.slice(0, N);
    const nucl = (b, color) => { const g = api.group(); api.sphere(0.12, 0xF2994A, [0, 0, 0], g, 10); api.lineBetween(V(0, 0, 0), V(0, -0.45, 0), 0.07, color || BC[b], g); api.sphere(0.12, BC[b], [0, -0.5, 0], g, 10); return g; };
    if (proc === 'rep') {
      // mạch khuôn trên (3′→5′ trái sang phải) và dưới; chạc tái bản di chuyển sang phải
      const top = [], bot = [], lead = [], lag = [];
      for (let i = 0; i < N; i++) {
        const b = seq[i]; const a = nucl(b); top.push(a); const c = nucl(PAIR[b]); c.rotation.z = Math.PI; bot.push(c);
        const l = nucl(PAIR[b]); l.rotation.z = Math.PI; l.visible = false; lead.push(l); api.tag(l, 'new');
        const m = nucl(b); m.visible = false; lag.push(m); api.tag(m, 'new');
      }
      const hel = api.mesh(new T.TorusGeometry(0.55, 0.22, 12, 24), api.mat(0xE86A92), [0, 0, 0]); hel.rotation.y = Math.PI / 2; api.part(hel, INFO.helicase);
      const pol1 = api.sphere(0.5, 0x3FB37F, [0, 0, 0]); pol1.material.opacity = 0.75; api.part(pol1, INFO.pol);
      const pol2 = api.sphere(0.5, 0x3FB37F, [0, 0, 0]); pol2.material.opacity = 0.75; api.part(pol2, INFO.pol);
      const lig = api.mesh(new T.OctahedronGeometry(0.35), api.mat(0xF2C94C)); api.part(lig, INFO.ligase);
      const lh = api.label('Helicase', hel, { off: [0, 0.9, 0], cls: 'tag', color: '#E86A92' }), lp = api.label('DNA Polymerase', pol1, { off: [0, 0.8, 0] }), lp2 = api.label('Polymerase (Okazaki)', pol2, { off: [0, -0.9, 0] }), ll = api.label('Ligase', lig, { off: [0, 0.6, 0] });
      void lh; void lp; void lp2; void ll;
      api.label("3′", [x0 - 0.5, 0.6, 0], { cls: 'tag', color: '#2F80C0' }); api.label("5′", [x0 - 0.5, -0.6, 0], { cls: 'tag', color: '#E5534B' });
      api.label('Mạch liên tục (5′→3′)', [x0 + 2.5, 2.4, 0]); api.label('Mạch gián đoạn – các đoạn Okazaki', [x0 + 3, -2.6, 0]);
      const info = api.note('');
      let fork = 1.5, okStart = 0, lastBreak = -1, waitPair = null;
      const pairUI = api.overlay('', 'm3d-seq'); pairUI.style.display = 'none';
      api.toggle({ label: '🧩 Tự ghép nucleotide (mạch liên tục)', value: selfPair, onChange(v) { selfPair = v; } });
      const askPair = i => {
        waitPair = i; const b = seq[i];
        pairUI.style.display = '';
        pairUI.innerHTML = `<b>Mạch khuôn có base <span class="n${b}">${b}</span>. Em chọn nucleotide tự do để ghép:</b> ` + ['A', 'T', 'G', 'C'].map(x => `<button class="btn small pop" data-b="${x}" style="margin:0 3px">${x}</button>`).join('');
        pairUI.querySelectorAll('button').forEach(bt => bt.onclick = () => {
          const x = bt.dataset.b;
          if (x === PAIR[b]) { api.beep(880, 0.12, 'sine', 0.2); api.beep(1320, 0.12, 'sine', 0.15, 0.08); pairUI.style.display = 'none'; waitPair = null; lead[i].visible = true; }
          else {
            const pur = s => 'AG'.includes(s);
            api.warn(null, pur(x) && pur(b) ? `Nguyên tắc bổ sung bị vi phạm! ${NAME[x]} (base purine vòng kép) không thể liên kết với ${NAME[b]} (base purine vòng kép) do kích thước không gian quá lớn, gây biến dạng đường kính chuỗi xoắn kép 2,0 nm của DNA!` : !pur(x) && !pur(b) ? `Nguyên tắc bổ sung bị vi phạm! ${NAME[x]} và ${NAME[b]} đều là base pyrimidine (1 vòng), ghép với nhau thì quá hẹp, không đủ chạm để tạo liên kết hydrogen và làm méo chuỗi xoắn!` : `Nguyên tắc bổ sung bị vi phạm! ${NAME[x]} không tạo đủ liên kết hydrogen với ${NAME[b]}. Chỉ có A – T (2 liên kết) và G – C (3 liên kết).`);
          }
        });
      };
      api.onFrame((dt) => {
        if (!playing || waitPair !== null) return;
        fork += dt * 0.55 * speed; if (fork > N * rise + 2) { fork = 1.5; okStart = 0; lead.forEach(l => { l.visible = false; }); lag.forEach(l => { l.visible = false; }); }
        const fx = x0 + fork;
        top.forEach((a, i) => {
          const x = x0 + i * rise, d = fx - x, sep = d > 0 ? Math.min(1.8, 0.35 + d * 0.55) : 0.35;
          a.position.set(x, sep, 0); bot[i].position.set(x, -sep, 0);
          lead[i].position.set(x, sep - 1.15, 0); lag[i].position.set(x, -sep + 1.15, 0);
          if (d > 0.6 && !lead[i].visible) { if (selfPair && i % 3 === 0) { askPair(i); return; } lead[i].visible = true; }
          if (d > 0 && i > lastBreak) { lastBreak = i; api.beep(2200, 0.03, 'square', 0.03); }
        });
        if (fx < x0 + 1) lastBreak = -1;
        // mạch gián đoạn: đoạn 6 nucleotide tổng hợp ngược chiều, theo sau chạc
        const iF = Math.floor(fork / rise);
        if (iF - okStart >= 7) { for (let k = okStart; k < okStart + 6 && k < N; k++) lag[k].visible = true; okStart += 7; }
        hel.position.set(fx + 0.2, 0, 0); hel.rotation.x += dt * 8;
        pol1.position.set(fx - 0.9, 0.55, 0.3); pol2.position.set(x0 + Math.max(0, okStart - 4) * rise, -0.55, 0.3);
        // ligase nối khe giữa các đoạn
        const gapX = x0 + (okStart - 1) * rise; lig.position.set(gapX - 7 * rise * ((performance.now() / 1500) % 1 < 0.5 ? 1 : 1), -1.25, 0.3);
        info.set(`Chạc tái bản ở cặp thứ <b>${Math.min(N, iF)}</b>/${N}. Helicase cắt liên kết hydrogen; primase đặt đoạn mồi RNA; polymerase lắp nucleotide chiều 5′→3′ tiếp sau mồi; mồi được thay bằng DNA rồi ligase nối các đoạn Okazaki.`);
      });
      api.view({ pos: [0, 0.5, 15], target: [0, 0, 0], min: 4, max: 30 });
    } else if (proc === 'tx') {
      const top = [], bot = [], rna = [];
      const templ = seq; // mạch gốc
      for (let i = 0; i < N; i++) { const a = nucl(PAIR[templ[i]]); top.push(a); const c = nucl(templ[i]); c.rotation.z = Math.PI; bot.push(c); const r = nucl(RPAIR[templ[i]], 0xF4D3E0); r.children[1].material.color.setHex(BC[RPAIR[templ[i]]]); r.visible = false; rna.push(r); }
      const pol = api.mesh(new T.SphereGeometry(1.0, 32, 22), api.mat(0x5BB4EA, { opacity: 0.45 })); pol.scale.set(1.5, 1.15, 1); api.part(pol, INFO.rnapol);
      api.label('RNA Polymerase', pol, { off: [0, 1.6, 0], cls: 'tag', color: '#2F80C0' });
      const prom = api.box(1.6, 0.12, 0.3, 0xE5534B, [x0 + 0.6, -0.9, 0]); api.label('Vùng khởi động (promoter)', prom, { off: [0, -0.45, 0] });
      api.label("Mạch gốc 3′→5′", [x0 + 2, -1.4, 0]); api.label('mRNA 5′→3′', [x0 + 1, 2.8, 0], { cls: 'tag', color: '#9B6BD6' });
      const free = []; for (let k = 0; k < 14; k++) { const b = 'AUGC'[k % 4], n = nucl(b, 0xF4D3E0); n.children[1].material.color.setHex(BC[b]); n.position.set((R() - 0.5) * 12, 2 + R() * 2, (R() - 0.5) * 3); n.userData.v = V(R() - 0.5, R() - 0.5, R() - 0.5); free.push(n); }
      const info = api.note('');
      let p = 0;
      api.onFrame((dt) => {
        if (!playing) return;
        p += dt * 0.45 * speed; if (p > N * rise + 1.5) { p = 0; rna.forEach(r => { r.visible = false; }); }
        const px = x0 + p;
        top.forEach((a, i) => {
          const x = x0 + i * rise, d = Math.abs(px - x), open = d < 1.3 ? 0.35 + (1.3 - d) * 0.6 : 0.35;
          a.position.set(x, open, 0); bot[i].position.set(x, -open, 0);
          const done = x < px - 0.3;
          if (done && !rna[i].visible) { rna[i].visible = true; api.beep(1700, 0.04, 'square', 0.03); }
          // mRNA tách khỏi mạch gốc sau polymerase, cong lên trên
          const back = px - x;
          rna[i].position.set(x, back < 1.2 ? -open + 1.0 : 0.6 + Math.min(2.2, (back - 1.2) * 0.8), back < 1.2 ? 0 : -Math.min(1.5, (back - 1.2) * 0.5));
        });
        pol.position.set(px, 0, 0);
        free.forEach(n => { n.position.addScaledVector(n.userData.v, dt * 0.6); if (n.position.distanceTo(V(px, 0, 0)) > 6) n.position.set(px + (R() - 0.5) * 8, 2.5 + R() * 1.5, (R() - 0.5) * 3); n.position.lerp(V(px, -0.2, 0), dt * 0.15); });
        const done = rna.filter(r => r.visible).length;
        info.set(`Đã lắp <b>${done}</b> nucleotide vào mRNA. Nguyên tắc bổ sung: mạch gốc A → U, T → A, G → C, C → G.`);
      });
      api.view({ pos: [0, 1, 15], target: [0, 0.5, 0], min: 4, max: 30 });
    } else {
      // dịch mã
      const mseq = 'AUGGCUUUCGGAAAAUGGCACGAUUAA', codons = mseq.match(/.../g);
      const mg = buildMRNA(api, null, mseq, 0); mg.position.y = -1.4;
      api.part(mg, INFO.mrna);
      const rib = buildRibosome(api, null, [0, 0, 0]);
      api.label('Ribosome', rib.large, { off: [0, 1.5, 0], cls: 'tag', color: '#8E7CC3' });
      const siteL = ['E', 'P', 'A'].map((s, k) => api.label(s, rib.g, { off: [(k - 1) * 1.26, 2.6, 0.2], cls: 'tag', color: '#1F4E79' }));
      void siteL;
      const chain = api.group(); const tr = [];
      const mkT = (cod) => { const g = api.group(); const anti = cod.split('').map(c => ({ A: 'U', U: 'A', G: 'C', C: 'G' }[c])).join(''); const L = api.group(g); api.lineBetween(V(0, 0, 0), V(0, 1.4, 0), 0.18, 0xF4D3E0, L); api.lineBetween(V(0, 1.4, 0), V(0.6, 1.9, 0), 0.18, 0xF4D3E0, L); api.part(g, Object.assign({}, INFO.trna, { name: 'tRNA mang ' + AA[cod], text: `Bộ ba đối mã ${anti} khớp codon ${cod}` })); const aa = api.sphere(0.32, AA[cod] === 'Met' ? 0xE86A92 : 0x9B6BD6, [0.6, 2.2, 0], g, 16); g.userData.aa = aa; g.userData.lab = api.label(anti, g, { off: [0, -0.35, 0], cls: 'plain' }); return g; };
      const info = api.note('');
      let k = 0, ph = 0; const step = 0.42 * 3;
      const peptide = [];
      const reset = () => { k = 0; ph = 0; tr.forEach(t => { t.userData.lab.remove(); t.parent.remove(t); }); tr.length = 0; peptide.forEach(p => p.parent.remove(p)); peptide.length = 0; };
      api.onFrame((dt) => {
        if (!playing) return;
        ph += dt * 0.5 * speed;
        const codonX = i => (i * 3 + 1 - (mseq.length - 1) / 2) * 0.42;
        const pX = codonX(k);
        rib.g.position.x += (pX + 0.42 * 3 * 0.5 - rib.g.position.x) * Math.min(1, dt * 3);
        if (ph < 1) { // tRNA mới bay vào vị trí A
          if (!tr.find(t => t.userData.k === k + 1) && k + 1 < codons.length && codons[k + 1] && AA[codons[k + 1]] !== 'KT') { const t = mkT(codons[k + 1]); t.userData.k = k + 1; t.position.set(codonX(k + 1) + 3, 4, 0); tr.push(t); if (!tr.find(x => x.userData.k === 0) && k === 0) { const t0 = mkT(codons[0]); t0.userData.k = 0; t0.position.set(codonX(0), -0.85, 0); tr.push(t0); } }
          tr.forEach(t => { const tx = codonX(t.userData.k); t.position.lerp(V(tx, -0.85, 0), Math.min(1, dt * 4)); });
        } else if (ph < 1.6) { // hình thành liên kết peptide
          if (!peptide[k]) { const pA = tr.find(t => t.userData.k === k); if (pA) { const s = api.sphere(0.3, pA.userData.aa.material.color.getHex(), [0, 0, 0], chain, 14); peptide[k] = s; pA.userData.aa.visible = false; api.beep(990, 0.15, 'sine', 0.15); api.toast('Hình thành liên kết peptide ✨'); } }
        } else if (ph < 2.4) { // dịch chuyển 1 bộ ba, tRNA ở E rời đi
          tr.forEach(t => { if (t.userData.k < k) t.position.lerp(V(codonX(t.userData.k) - 2, 4.5, 0), Math.min(1, dt * 2)); });
        } else {
          tr.filter(t => t.userData.k < k).forEach(t => { t.userData.lab.remove(); t.parent.remove(t); });
          for (let i = tr.length - 1; i >= 0; i--) if (!tr[i].parent) tr.splice(i, 1);
          k++; ph = 0;
          if (k >= codons.length - 1 || AA[codons[k]] === 'KT') { api.toast('Gặp bộ ba kết thúc UAA: chuỗi polypeptide được giải phóng'); setTimeout(reset, 1200); k = codons.length; }
        }
        // chuỗi polypeptide nối dài trên ribosome
        peptide.forEach((p, i) => { if (p) p.position.set(rib.g.position.x - 0.6 - (k - i) * 0.55, 2.9 + Math.sin(i) * 0.25, 0.4); });
        info.set(`Codon đang đọc ở vị trí P: <b>${codons[Math.min(k, codons.length - 1)]}</b> → ${AA[codons[Math.min(k, codons.length - 1)]] || ''}. Chuỗi: <b>${peptide.filter(Boolean).length}</b> amino acid`);
        if (k >= codons.length && !peptide.length) k = 0;
      });
      api.label("5′", [-6.2, -1.2, 0], { cls: 'tag', color: '#E5534B' }); api.label("3′", [6.2, -1.2, 0], { cls: 'tag', color: '#2F80C0' });
      api.view({ pos: [0, 1.5, 13], target: [0, 0.5, 0], min: 4, max: 30 });
    }
  }

  // ---------- đột biến ----------
  function buildMutation(api) {
    const g = helix(api, gene, null, { noGroove: true, style: 'ball' });
    g.rotation.y = 0;
    const strands = g.userData.strands;
    const s = strands[0][Math.min(selPos, gene.length - 1)];
    if (s) { const T = api.T, b = new T.Box3().setFromObject(s.nt), c = b.getCenter(new T.Vector3()); const ring = api.mesh(new T.TorusGeometry(1.25, 0.05, 8, 40), api.mat(0xE5534B, { emissive: 0xE5534B, emissiveIntensity: 0.6 }), [c.x, 0, 0]); ring.rotation.y = Math.PI / 2; ring.userData.noPick = true; }
    const box = api.overlay('', 'm3d-seq');
    const render = () => {
      const tmpl = gene.split('').map(b => PAIR[b]).join(''), mrna = gene.replace(/T/g, 'U');
      const p0 = translate(GENE0.replace(/T/g, 'U')), p1 = translate(mrna);
      const cls = verdict(p0, p1);
      const nts = (s, cl) => s.split('').map((b, i) => `<span class="nt n${b} ${i === selPos ? 'sel' : ''} ${i % 3 === 0 && i ? 'gap' : ''}" data-i="${i}">${b}</span>`).join('');
      box.innerHTML = `<div class="sq"><b>Mạch mã hóa 5′</b>${nts(gene)}<b>&nbsp;3′</b></div>
        <div class="sq"><b>Mạch gốc 3′</b>${nts(tmpl)}<b>&nbsp;5′</b></div>
        <div class="sq"><b>mRNA 5′</b>${nts(mrna)}<b>&nbsp;3′</b></div>
        <div class="sq"><b>Polypeptide</b>${p1.map((a, i) => `<span class="aa ${a === 'KT' ? 'stop' : ''} ${p0[i] !== a ? 'bad' : ''}">${a === 'KT' ? 'Kết thúc' : a}</span>`).join('')}</div>
        <div style="margin-top:4px">${lastMut ? `Thao tác: <b>${lastMut}</b> → ` : ''}<span class="verdict ${cls.ok ? 'ok' : ''}">${cls.t}</span></div>`;
      box.querySelectorAll('.nt').forEach(n => n.onclick = () => { selPos = +n.dataset.i; NL.audio.play('click'); api.setTab('mut'); });
      api.caption('Đột biến: ' + cls.t);
    };
    render();
    api.section('🧪 Can thiệp nucleotide');
    api.note(`Chạm vào một nucleotide ở khung dưới để chọn vị trí. Đang chọn: <b>vị trí ${selPos + 1}</b> (cặp ${gene[selPos]} – ${PAIR[gene[selPos]]})`);
    api.choices({ label: 'Thay thế cặp thành', items: ['A', 'T', 'G', 'C'].map(b => ({ t: `${b}–${PAIR[b]}`, v: b })), value: null, onPick(v) { if (v === gene[selPos]) { api.toast('Cặp này đã là ' + v + '–' + PAIR[v]); return; } lastMut = `Thay cặp ${gene[selPos]}–${PAIR[gene[selPos]]} thành ${v}–${PAIR[v]} ở vị trí ${selPos + 1}`; gene = gene.slice(0, selPos) + v + gene.slice(selPos + 1); api.beep(700, 0.12, 'triangle', 0.15); api.setTab('mut'); } });
    api.button('➖ Mất cặp nucleotide', () => { if (gene.length < 10) return; lastMut = `Mất cặp ${gene[selPos]}–${PAIR[gene[selPos]]} ở vị trí ${selPos + 1}`; gene = gene.slice(0, selPos) + gene.slice(selPos + 1); selPos = Math.min(selPos, gene.length - 1); api.beep(400, 0.15, 'triangle', 0.15); api.setTab('mut'); });
    api.choices({ label: '➕ Thêm cặp vào vị trí đang chọn', items: ['A', 'T', 'G', 'C'].map(b => ({ t: `${b}–${PAIR[b]}`, v: b })), value: null, onPick(v) { if (gene.length > 36) return; lastMut = `Thêm cặp ${v}–${PAIR[v]} vào vị trí ${selPos + 1}`; gene = gene.slice(0, selPos) + v + gene.slice(selPos); api.beep(1000, 0.12, 'triangle', 0.15); api.setTab('mut'); } });
    api.button('↺ Đặt lại gene gốc', () => { gene = GENE0; lastMut = null; selPos = 7; api.setTab('mut'); }, 'ghost');
    api.note('Gợi ý thử: đổi T ở vị trí 9 (UCU → UCC) để thấy đột biến đồng nghĩa; đổi G ở vị trí 18 (UGG → UGA) để thấy đột biến vô nghĩa.');
    api.view({ pos: [0, 3, 11], target: [0, 0, 0], min: 3, max: 25 });
  }
  function verdict(p0, p1) {
    const len0 = GENE0.length, len1 = gene.length;
    if (gene === GENE0) return { t: 'Gene bình thường', ok: true };
    if ((len1 - len0) % 3 !== 0) return { t: 'Đột biến dịch khung (Frameshift): sai toàn bộ amino acid từ chỗ đột biến về sau' };
    const stop1 = p1.indexOf('KT'), stop0 = p0.indexOf('KT');
    if (stop1 >= 0 && stop1 < stop0) return { t: 'Đột biến vô nghĩa (Nonsense): xuất hiện bộ ba kết thúc sớm, chuỗi polypeptide ngắn lại' };
    if (p1.join() === p0.join()) return { t: 'Đột biến đồng nghĩa (Silent): codon mới vẫn mã hóa cùng amino acid nhờ tính thoái hóa của mã di truyền', ok: true };
    return { t: 'Đột biến sai nghĩa (Missense): thay đổi một amino acid trong chuỗi' };
  }

  // ---------- đăng ký ----------
  NL.m3d.register('M2', {
    title: 'Phân tử DNA và RNA',
    tabs: [{ t: '🧬 DNA', v: 'dna' }, { t: 'mRNA', v: 'mrna' }, { t: 'tRNA', v: 'trna' }, { t: 'rRNA', v: 'rrna' }, { t: '⚙️ Cơ chế', v: 'proc' }, { t: '🧪 Đột biến', v: 'mut' }],
    build(api, tab) {
      rulerPts = []; rulerObjs = []; rulerNote = null;
      if (tab === 'proc') { buildProcess(api); return; }
      if (tab === 'mut') { buildMutation(api); return; }
      api.choices({ label: 'Kiểu hiển thị', items: [{ t: 'Cầu – que', v: 'ball' }, { t: 'Lấp đầy', v: 'fill' }, { t: 'Dải băng', v: 'ribbon' }], value: style, onPick(v) { style = v; api.setTab(tab); } });
      if (tab === 'dna') {
        const g = helix(api, SEQ);
        g.rotation.z = 0;
        api.label('Rãnh lớn', [0.7, 0, 1.3], { cls: 'plain' }).el.dataset.g = 'groove';
        api.slider({ label: 'Độ trong suốt khung', min: 0, max: 100, step: 5, value: Math.round((1 - bbOp) * 100), unit: '%', onInput(v) { bbOp = 1 - v / 100; api.root.traverse(o => { if (o.userData.group === 'bb' || o.userData.group === 'pd') api.setOpacity(o, Math.max(0.03, bbOp)); }); } });
        api.checklist([
          { k: 'bb', label: 'Khung đường – phosphate' }, { k: 'bA', label: '<span class="nA">■</span> Adenine (A)' }, { k: 'bT', label: '<span class="nT">■</span> Thymine (T)' }, { k: 'bG', label: '<span class="nG">■</span> Guanine (G)' }, { k: 'bC', label: '<span class="nC">■</span> Cytosine (C)' },
          { k: 'hb', label: 'Liên kết hydrogen' }, { k: 'pd', label: 'Liên kết phosphodiester' }, { k: 'ends', label: 'Đầu 5′ và 3′' }, { k: 'groove', label: 'Rãnh lớn / rãnh nhỏ', on: VIS.groove }
        ].map(it => Object.assign(it, { on: VIS[it.k] })), (k, on) => { VIS[k] = on; applyVis(api, VIS); api.root.parent && 0; document.querySelectorAll('.m3d-lab[data-g=groove]').forEach(e => { e.style.opacity = VIS.groove ? 1 : 0; }); });
        applyVis(api, VIS); document.querySelectorAll('.m3d-lab[data-g=groove]').forEach(e => { e.style.opacity = VIS.groove ? 1 : 0; });
        api.section('📏 Thước đo 3D');
        api.toggle({ label: 'Bật thước đo', value: ruler, onChange(v) { ruler = v; if (!v) clearRuler(api); api.toast(v ? 'Chạm lần lượt vào 2 quả cầu để đo' : 'Đã tắt thước đo'); } });
        api.choices({ items: [{ t: 'nm', v: 'nm' }, { t: 'Å', v: 'A' }], value: unit, onPick(v) { unit = v; } });
        rulerNote = api.note('Thử đo: 2 phosphate cách nhau 10 cặp cùng mạch (bước xoắn 3,4 nm), 2 base kề nhau (0,34 nm dọc trục), 2 phosphate đối diện (đường kính 2 nm).');
        api.section('🪞 Chia đôi màn hình');
        api.toggle({ label: 'Đối chiếu DNA | mRNA', value: false, onChange(v) { if (v) { const sc = api.splitScene(); const old = api.root; const tmp = new api.T.Group(); sc.add(tmp); splitRNA(api, tmp); void old; } else api.unsplit(); } });
        api.onPick(hit => rulerPick(api, hit));
        api.view({ pos: [0, 2.5, 9], target: [0, 0, 0], min: 2, max: 25 });
      } else if (tab === 'mrna') {
        const g = buildMRNA(api, null, 'AUGGCUUUCGGAAAAUGG', 0); api.part(g, INFO.mrna);
        api.label("5′", [-4.2, 0.9, 0], { cls: 'tag', color: '#E5534B' }); api.label("3′", [4.2, 0.9, 0], { cls: 'tag', color: '#2F80C0' });
        api.note('mRNA là <b>mạch đơn</b>, dùng đường ribose và base <b>U</b> thay cho T. Mỗi 3 nucleotide là một codon.');
        api.toggle({ label: '📏 Thước đo 3D', value: ruler, onChange(v) { ruler = v; if (!v) clearRuler(api); } });
        rulerNote = api.note('');
        api.onPick(hit => rulerPick(api, hit));
        api.view({ pos: [0, 1, 10], target: [0, 0, 0], min: 2, max: 25 });
      } else if (tab === 'trna') {
        buildTRNA(api);
        api.note('tRNA cuộn gập thành hình <b>lá chẻ ba</b>. Thùy giữa mang <b>bộ ba đối mã</b>, đầu 3′ gắn amino acid.');
        api.view({ pos: [0, 0.8, 17], target: [0, 0.8, 0], min: 3, max: 30 });
      } else {
        const r = buildRibosome(api, null, [0, 0.3, 0]); void r;
        const m = buildMRNA(api, null, 'AUGGCUUUCGGAAAA', 0); m.position.y = -1.1; api.part(m, INFO.mrna);
        api.label('Tiểu đơn vị lớn', [0, 2.3, 0]); api.label('Tiểu đơn vị bé', [0, -1.8, 1.2]);
        api.note('rRNA (dây hồng) kết hợp với protein (hạt tím) tạo 2 tiểu đơn vị của <b>ribosome</b>.');
        api.view({ pos: [0, 1, 9], target: [0, 0, 0], min: 3, max: 25 });
      }
    },
    data(api) {
      const cnt = s => { const c = { A: 0, T: 0, G: 0, C: 0, U: 0 }; s.split('').forEach(b => c[b]++); return c; };
      const isRNA = api.tab === 'mrna' || api.tab === 'trna' || api.tab === 'rrna';
      const seq = api.tab === 'mut' ? gene + gene.split('').map(b => PAIR[b]).join('') : isRNA ? 'AUGGCUUUCGGAAAAUGG' : SEQ + SEQ.split('').map(b => PAIR[b]).join('');
      const c = cnt(seq), tot = seq.length, pct = b => +(c[b] / tot * 100).toFixed(1);
      const ratio = (c.T + c.C) ? ((c.A + c.G) / (c.T + c.C)) : 0;
      return {
        title: 'Đối chiếu DNA và RNA · Tỉ lệ nucleotide',
        sub: isRNA ? `mRNA mạch đơn: (A+G)/(U+C) = ${((c.A + c.G) / (c.U + c.C)).toFixed(2)} (không nhất thiết bằng 1)` : `DNA mạch kép: (A+G)/(T+C) = ${ratio.toFixed(2)} → đúng quy luật Chargaff`,
        sheets: [
          { name: 'Đối chiếu DNA-RNA', head: ['STT', 'Đặc điểm cấu trúc', 'Phân tử DNA', 'Phân tử RNA (mRNA, tRNA, rRNA)', 'Chức năng sinh học cốt lõi'], rows: [
            [1, 'Số mạch', '2 mạch xoắn kép, ngược chiều', 'Mạch đơn (tRNA, rRNA có đoạn tự bắt cặp)', 'DNA bền vững để lưu trữ; RNA linh hoạt'],
            [2, 'Đường pentose', 'Deoxyribose C₅H₁₀O₄', 'Ribose C₅H₁₀O₅', 'Ribose có –OH ở C2′ nên RNA kém bền hơn'],
            [3, 'Các loại base', 'A, T, G, C', 'A, U, G, C', 'U thay cho T trong RNA'],
            [4, 'Nguyên tắc bổ sung', 'A–T (2 lk H), G–C (3 lk H) giữa 2 mạch', 'Chỉ ở đoạn tự bắt cặp hoặc khi khớp codon – anticodon', 'Đảm bảo sao chép và truyền thông tin chính xác'],
            [5, 'Kích thước', 'Đường kính 2 nm, bước xoắn 3,4 nm (10 cặp)', 'Ngắn hơn nhiều (tRNA ≈ 80 nucleotide)', ''],
            [6, 'Chức năng', 'Lưu trữ, bảo quản, truyền đạt thông tin di truyền', 'mRNA: khuôn dịch mã; tRNA: vận chuyển amino acid; rRNA: cấu tạo ribosome', 'Cùng tham gia biểu hiện gene']] },
          { name: 'Tỉ lệ nucleotide', head: ['Loại base', 'Số lượng', 'Tỉ lệ (%)'], rows: ['A', 'T', 'G', 'C', 'U'].map(b => [b, c[b], pct(b)]).concat([[isRNA ? '(A+G)/(U+C)' : '(A+G)/(T+C)', '', isRNA ? +((c.A + c.G) / (c.U + c.C)).toFixed(2) : +ratio.toFixed(2)]]) }
        ],
        chart: { labels: ['A', 'T', 'G', 'C', 'U'], series: [{ name: 'Tỉ lệ %', color: '#5BB4EA', values: ['A', 'T', 'G', 'C', 'U'].map(pct) }], yLabel: 'Tỉ lệ base (%)' }
      };
    }
  });

  function splitRNA(api, parent) {
    // tạm dựng mRNA vào cảnh phụ: dựng trong root rồi chuyển sang
    const g = buildMRNA(api, null, 'AUGCGUACCUUAGGCAUCGA', 0, true);
    parent.add(g);
    api.label('mRNA (mạch đơn, U thay T)', [0, 2, 0], { cls: 'big', right: true });
  }
})();
