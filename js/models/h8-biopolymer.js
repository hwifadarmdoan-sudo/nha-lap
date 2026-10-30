// Mô hình Hóa 8: Cấu trúc không gian của protein (xoắn α, phiến gấp β, biến tính theo nhiệt độ) và carbohydrate (amylose, amylopectin, cellulose).
(function () {
  const C3 = () => NL.chem3d;
  const S = 0.6; // 1 Å = 0,6 đơn vị cảnh
  const HB = { name: 'Liên kết hydrogen', sci: 'N–H ··· O=C', rows: [['Độ dài', 'H···O ≈ 1,9 – 2,1 Å (N···O ≈ 2,9 Å)'], ['Năng lượng', 'Yếu: khoảng 10 – 30 kJ/mol mỗi liên kết'], ['Vai trò', 'Hàng trăm liên kết H cùng lúc giữ vững cấu trúc bậc 2 của protein']] };
  const PEP = { name: 'Liên kết peptide', sci: '–CO–NH–', rows: [['Nối', 'Nhóm –COOH của amino acid này với nhóm –NH₂ của amino acid kế tiếp (tách 1 phân tử H₂O)'], ['Độ dài C–N', '1,33 Å (ngắn hơn C–N đơn 1,47 Å vì mang một phần tính chất liên kết đôi)'], ['Độ bền', 'Bền, cộng hóa trị; chỉ bị thủy phân bởi acid, base mạnh hoặc enzyme'], ['Thuộc bậc', 'Bậc 1 (trình tự amino acid)']] };
  const RG = { name: 'Gốc R (mạch bên)', sci: 'Side chain', rows: [['Vị trí', 'Gắn vào Cα của mỗi amino acid'], ['Trong xoắn α', 'Hướng ra ngoài lò xo'], ['Trong phiến β', 'Lần lượt hướng lên và xuống mặt phiến'], ['Có 20 loại', 'Quyết định tính chất từng amino acid']] };
  const WARN_HELIX = 'Liên kết hydrogen tuy là liên kết yếu, nhưng <b>hàng ngàn liên kết</b> này gộp lại đã tạo nên sự ổn định đáng kinh ngạc cho cấu trúc không gian của protein!';
  const WARN_CELL = 'Nhờ các liên kết <b>β-1,4-glycoside</b>, các chuỗi cellulose tạo thành mạch thẳng và liên kết chéo với nhau bằng liên kết hydrogen. Cấu trúc này tạo ra độ bền cơ học cực cao, biến cellulose thành "bộ xương" vững chắc của thành tế bào thực vật!';
  const WARN_DEN = 'Biến tính: nhiệt độ cao làm <b>đứt các liên kết hydrogen</b>, chuỗi polypeptide duỗi ra và mất hình dạng (mất chức năng). Nhưng các <b>liên kết peptide vẫn còn nguyên</b>: trình tự amino acid (bậc 1) không đổi. Ví dụ: luộc trứng, lòng trắng đông lại.';
  let style = 'atom', showHB = true, temp = 25, iodine = false;
  const helixFrac = t => 1 / (1 + Math.exp((t - 62) / 3.5));

  // tọa độ khung xoắn α: N, Cα, C của từng gốc
  function helixAtoms(T, n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const th = i * 100 * Math.PI / 180, y = i * 1.5 - n * 0.75;
      const at = (dth, r, dy) => new T.Vector3(Math.cos(th + dth) * r * S, (y + dy) * S, Math.sin(th + dth) * r * S);
      out.push({ N: at(-0.5, 1.55, -0.5), CA: at(0, 2.3, 0), C: at(0.5, 1.6, 0.5), th });
    }
    return out;
  }
  function protein(api, tab) {
    const T = api.T, V = api.V, g = api.group(), n = 18, R = api.rand(5);
    let res;
    if (tab === 'sheet') {
      res = [];
      for (let s = 0; s < 4; s++) for (let i = 0; i < 7; i++) {
        const dir = s % 2 ? -1 : 1, k = dir > 0 ? i : 6 - i, x = (k * 3.4 - 10.2) * S, z = (s * 4.8 - 7.2) * S, up = (k % 2 ? 1 : -1);
        res.push({ s, i, N: V(x - dir * 1.15 * S, -0.25 * up * S, z), CA: V(x, 0.45 * up * S, z), C: V(x + dir * 1.15 * S, -0.25 * up * S, z), up, dir });
      }
    } else res = helixAtoms(T, n);
    const coil = [];
    if (tab === 'denat') { let p = V(0, -n * 0.75 * S, 0); res.forEach((r, i) => { const d = V(R() - 0.5, 0.55 + R() * 0.3, R() - 0.5).normalize().multiplyScalar(3.8 * S); p = p.clone().add(d); coil.push(p.clone().add(V(Math.sin(i) * 1.5, 0, Math.cos(i * 0.7) * 1.5))); }); }
    const atoms = [], hbPairs = [];
    const bb = api.group(g); api.tag(bb, 'bb');
    const sideG = api.group(g); api.tag(sideG, 'R');
    res.forEach((r, i) => {
      const cN = C3().atom(api, 'N', r.N, bb, { scale: 0.7, seg: 14 }), cA = C3().atom(api, 'C', r.CA, bb, { scale: 0.8, seg: 14 }), cC = C3().atom(api, 'C', r.C, bb, { scale: 0.7, seg: 14 });
      api.part(cA, { name: `Cα của amino acid thứ ${i + 1}`, sci: 'Cα', rows: [['Gắn với', '–NH–, –CO–, H và gốc R']] });
      // O của nhóm C=O và H của nhóm N–H
      const oDir = tab === 'sheet' ? V(0, 0, (r.s % 2 ? -1 : 1) * (r.i % 2 ? 1 : -1)) : V(0, 1, 0), hDir = oDir.clone().negate();
      const O = C3().atom(api, 'O', r.C.clone().add(oDir.clone().multiplyScalar(1.5 * S)), bb, { scale: 0.65, seg: 12 });
      const H = C3().atom(api, 'H', r.N.clone().add(hDir.clone().multiplyScalar(1.3 * S)), bb, { scale: 0.6, seg: 10 });
      [[r.N, r.CA], [r.CA, r.C]].forEach(([a, b]) => api.lineBetween(a, b, 0.05, api.mat(C3().SIGMA), bb).userData.noPick = true);
      api.lineBetween(r.C, O.position, 0.05, api.mat(C3().SIGMA), bb).userData.noPick = true; api.lineBetween(r.N, H.position, 0.04, api.mat(C3().SIGMA), bb).userData.noPick = true;
      const out = tab === 'sheet' ? V(0, r.up, 0) : V(Math.cos(r.th), 0, Math.sin(r.th));
      const Rg = api.sphere(0.22, api.mat(0x4ADE80, { roughness: 0.4 }), null, sideG, 14); Rg.position.copy(r.CA.clone().add(out.multiplyScalar(1.6 * S))); api.lineBetween(r.CA, Rg.position, 0.045, api.mat(0x86EFAC), sideG).userData.noPick = true;
      api.part(Rg, RG);
      atoms.push({ r, cN, cA, cC, O, H, Rg });
      if (i > 0 && (tab !== 'sheet' || res[i - 1].s === r.s)) {
        const p = res[i - 1], pb = api.lineBetween(p.C, r.N, 0.075, api.mat(0xF59E0B, { emissive: 0xF59E0B, emissiveIntensity: 0.3 }), bb); api.part(pb, PEP);
      }
    });
    // liên kết hydrogen
    if (tab === 'sheet') { atoms.forEach(a => atoms.forEach(b => { if (b.r.s === a.r.s + 1 && Math.abs(b.r.CA.x - a.r.CA.x) < 0.1) { const [o, h] = a.r.i % 2 ? [a.O, b.H] : [b.O, a.H]; hbPairs.push([o, h]); } })); }
    else for (let i = 0; i + 4 < atoms.length; i++) hbPairs.push([atoms[i].O, atoms[i + 4].H]);
    const hb = C3().dashes(api, 80, 0xFDE047, g, { dots: 5, r: 0.045 }); api.tag(hb.obj, 'hb');
    const hbHit = api.group(g); hbPairs.forEach(([o, h]) => { const m = api.lineBetween(o.position, h.position, 0.12, api.mat(0xFDE047, { opacity: 0.03, depthWrite: false }), hbHit); m.userData.pair = [o, h]; }); api.part(hbHit, Object.assign({}, HB, { onSelect() { api.warn('helix', WARN_HELIX, '🧬 Thông điệp sinh học'); } })); api.tag(hbHit, 'hb');
    // dải băng (kiểu hoạt hình)
    let ribbon = null;
    const mkRibbon = () => {
      if (ribbon) { ribbon.parent.remove(ribbon); }
      ribbon = api.group(g); api.tag(ribbon, 'rib');
      if (tab === 'sheet') { for (let s = 0; s < 4; s++) { const st = atoms.filter(a => a.r.s === s).map(a => a.cA.position); const t = api.tube(st, 0.16, s % 2 ? 0x60A5FA : 0x38BDF8, ribbon, 60); t.scale.set(1, 1, 1); const end = st[st.length - 1], prev = st[st.length - 2], cone = api.mesh(new T.ConeGeometry(0.35, 0.6, 4), api.mat(s % 2 ? 0x60A5FA : 0x38BDF8), null, ribbon); cone.position.copy(end); cone.quaternion.setFromUnitVectors(V(0, 1, 0), end.clone().sub(prev).normalize()); } }
      else api.tube(atoms.map(a => a.cA.position), 0.22, 0xF472B6, ribbon, 200);
      ribbon.visible = style === 'ribbon'; api.part(ribbon, { name: tab === 'sheet' ? 'Phiến gấp β' : 'Mạch xoắn α', sci: tab === 'sheet' ? 'β-sheet' : 'α-helix', rows: tab === 'sheet' ? [['Hình dạng', 'Các đoạn mạch duỗi thẳng, gấp nếp như giấy xếp, xếp song song nhau'], ['Giữ bởi', 'Liên kết hydrogen giữa các mạch cạnh nhau'], ['Khoảng cách 2 mạch', '≈ 4,8 Å']] : [['Hình dạng', 'Lò xo xoắn phải, 3,6 amino acid mỗi vòng'], ['Bước xoắn', '5,4 Å'], ['Giữ bởi', 'Liên kết hydrogen giữa C=O của amino acid thứ i với N–H của amino acid thứ i + 4']] });
    };
    mkRibbon();
    const base = atoms.map(a => ({ N: a.cN.position.clone(), CA: a.cA.position.clone(), C: a.cC.position.clone() }));
    api.onFrame(() => {
      if (tab === 'denat') {
        const f = helixFrac(temp);
        atoms.forEach((a, i) => { const off = coil[i].clone().sub(base[i].CA).multiplyScalar(1 - f); [a.cN, a.cA, a.cC, a.O, a.H, a.Rg].forEach(m => { if (!m.userData.p0) m.userData.p0 = m.position.clone(); m.position.copy(m.userData.p0).add(off); }); });
      }
      const f = tab === 'denat' ? helixFrac(temp) : 1;
      hb.set(showHB ? hbPairs.filter((_, k) => (k * 0.37) % 1 < f).map(([o, h]) => [o.position, h.position]) : []);
    });
    if (tab === 'denat') {
      // trong chế độ biến tính chỉ vẽ dải nối Cα cho dễ nhìn
      [bb, sideG].forEach(G => G.children.forEach(c => { if (c.geometry && c.geometry.type === 'CylinderGeometry') c.visible = false; }));
      const tubeG = api.group(g); let tube = null, lastT = null; hbHit.visible = false;
      api.onFrame(() => { if (lastT === temp) return; lastT = temp; if (tube) { tubeG.remove(tube); tube.geometry.dispose(); } tube = api.tube(atoms.map(a => a.cA.position.clone()), 0.07, 0xF59E0B, tubeG, 120); api.part(tube, PEP); });
      api.slider({ label: '🌡 Nhiệt độ', min: 20, max: 100, step: 1, value: temp, unit: '°C', onInput(v) {
        temp = v; if (v >= 70) api.warn('den', WARN_DEN, '🍳 Thông điệp sinh học');
        api.caption(`${v} °C · còn ${Math.round(helixFrac(v) * 100)}% cấu trúc xoắn α · liên kết peptide: còn nguyên`);
      } });
      api.note('Kéo nhiệt độ lên quá khoảng 60 °C: liên kết hydrogen (vàng) đứt dần, lò xo duỗi ra thành cuộn rối. Dải cam là chuỗi liên kết peptide, không bị đứt.');
    } else {
      api.choices({ label: 'Kiểu hiển thị', items: [{ t: 'Nguyên tử', v: 'atom' }, { t: 'Dải băng', v: 'ribbon' }], value: style, onPick(v) { style = v; api.groupVis('rib', v === 'ribbon'); api.groupVis('bb', v === 'atom'); } });
      api.groupVis('bb', style === 'atom');
      api.checklist([{ k: 'R', label: '<span style="color:#4ADE80">●</span> Gốc R' }]);
    }
    api.toggle({ label: '<span style="color:#FDE047">- -</span> Liên kết hydrogen', value: showHB, onChange(v) { showHB = v; } });
    api.note('<span style="color:#3050F8">●</span> N · <span style="color:#888">●</span> C · <span style="color:#FF2A2A">●</span> O · <span style="color:#F59E0B">■</span> liên kết peptide');
    if (tab === 'helix') setTimeout(() => api.warn('helix', WARN_HELIX, '🧬 Thông điệp sinh học'), 700);
    api.view(tab === 'sheet' ? { pos: [4, 11, 12], target: [0, 0, 0], min: 2, max: 35 } : { pos: [14, 2, 19], target: [0, tab === 'denat' ? 1.5 : 0, 0], min: 2, max: 45 });
  }

  // ---------- carbohydrate ----------
  function glucose(api, parent, pos, q, color) {
    const T = api.T, g = api.group(parent); g.position.copy(pos); if (q) g.quaternion.copy(q);
    const ring = api.mesh(new T.CylinderGeometry(0.42, 0.42, 0.12, 6), api.mat(color, { roughness: 0.45 }), null, g); ring.rotation.x = Math.PI / 2;
    const o = api.sphere(0.1, api.mat(0xFF2A2A), [0.42, 0, 0.04], g, 10); o.userData.noPick = true;
    const ch = api.sphere(0.09, api.mat(0x94A3B8), [-0.2, 0.36, 0.22], g, 8); ch.userData.noPick = true;
    return g;
  }
  function carb(api, tab) {
    const T = api.T, V = api.V, g = api.group(), units = [], links = [];
    const UNIT = { name: tab === 'cell' ? 'Gốc β-glucose' : 'Gốc α-glucose', sci: 'C₆H₁₀O₅ (trong mạch)', rows: [['Vòng', '6 cạnh: 5 nguyên tử C và 1 nguyên tử O'], ['Khác nhau α / β', 'Vị trí nhóm –OH ở C1 (dưới mặt vòng là α, trên mặt vòng là β)']] };
    const GLY = k => ({ name: `Liên kết ${k}-glycoside`, sci: k === 'α-1,6' ? 'C1–O–C6' : 'C1–O–C4', rows: [['Nối', k === 'α-1,6' ? 'C1 của gốc này với C6 của gốc trên mạch chính: tạo điểm phân nhánh' : 'C1 của gốc này với C4 của gốc kế tiếp, qua 1 nguyên tử O'], ['Độ dài C–O', '≈ 1,43 Å'], ['Năng lượng', '≈ 360 kJ/mol (liên kết cộng hóa trị C–O)'], ['Bị cắt bởi', k.startsWith('β') ? 'Enzyme cellulase (người không có)' : 'Enzyme amylase (có trong nước bọt, dịch tụy)']] });
    const link = (a, b, kind, parent) => { const m = api.lineBetween(a, b, 0.06, api.mat(kind === 'α-1,6' ? 0xF59E0B : 0xFF6B6B), parent || g); const mid = api.sphere(0.1, api.mat(0xFF2A2A), null, parent || g, 10); mid.position.lerpVectors(a, b, 0.5); api.part(m, GLY(kind)); links.push(m); return m; };
    if (tab === 'amylose') {
      const n = 30, pts = [];
      for (let i = 0; i < n; i++) { const a = i * Math.PI / 3, p = V(Math.cos(a) * 1.4, i * 0.34 - n * 0.17, Math.sin(a) * 1.4); pts.push(p); const q = new T.Quaternion().setFromUnitVectors(V(0, 0, 1), V(Math.cos(a), 0, Math.sin(a))); const u = glucose(api, g, p, q, 0x86EFAC); api.part(u, UNIT); units.push(u); }
      for (let i = 0; i + 1 < n; i++) link(pts[i], pts[i + 1], 'α-1,4');
      const iod = api.group(g); api.tag(iod, 'iod');
      for (let i = 0; i < 14; i++) api.sphere(0.24, api.mat(0x7C3AED, { emissive: 0x6D28D9, emissiveIntensity: 0.6 }), [0, i * 0.7 - 4.6, 0], iod, 14);
      api.part(iod, { name: 'Iod nằm trong lòng xoắn amylose', sci: 'I₂ / I₅⁻', rows: [['Hiện tượng', 'Tinh bột + dung dịch iod → màu xanh tím'], ['Giải thích', 'Phân tử iod chui vào lòng ống xoắn amylose tạo phức có màu'], ['Đun nóng', 'Xoắn giãn ra, iod thoát ra → mất màu; để nguội màu xanh tím trở lại']] });
      iod.visible = iodine;
      api.toggle({ label: '🟣 Nhỏ dung dịch iod', value: iodine, onChange(v) { iodine = v; iod.visible = v; api.scene.background = new T.Color(v ? 0x1E1B4B : 0x0F1B2B); if (v) api.toast('Iod chui vào lòng xoắn amylose: dung dịch hóa xanh tím'); } });
      api.note('<b>Amylose</b>: các gốc α-glucose nối bằng liên kết <b>α-1,4</b>, cuộn thành <b>lò xo</b> (khoảng 6 gốc mỗi vòng), không phân nhánh.');
      api.view({ pos: [11, 2, 13], target: [0, 0, 0], min: 3, max: 35 });
    } else if (tab === 'amylopectin') {
      const R = api.rand(3);
      const chain = (start, dir, n, depth) => {
        let p = start.clone(); const ps = [];
        for (let i = 0; i < n; i++) { if (i) p = p.clone().add(dir.clone().multiplyScalar(0.95)).add(V((R() - 0.5) * 0.2, (R() - 0.5) * 0.2, (R() - 0.5) * 0.2)); const u = glucose(api, g, p, null, depth ? 0xA7F3D0 : 0x86EFAC); api.part(u, UNIT); units.push(u); ps.push(p); if (i) link(ps[i - 1], p, 'α-1,4'); }
        if (depth < 2) for (let b = 3; b < n - 1; b += 4) { const nd = dir.clone().applyAxisAngle(V(0, 0, 1), (b % 8 ? 1 : -1) * 0.9).applyAxisAngle(V(0, 1, 0), (R() - 0.5) * 1.2).normalize(); const s0 = ps[b].clone().add(nd.clone().multiplyScalar(0.95)); link(ps[b], s0, 'α-1,6'); chain(s0, nd, 7 - depth * 2, depth + 1); }
      };
      chain(V(-6, -1.5, 0), V(1, 0.15, 0).normalize(), 13, 0);
      api.note('<b>Amylopectin</b>: mạch α-1,4 như amylose nhưng cứ khoảng <b>20 – 30</b> gốc lại có một nhánh nối bằng liên kết <b>α-1,6</b> (màu cam). Mô hình vẽ nhánh dày hơn để dễ nhìn.');
      api.view({ pos: [0, 2, 16], target: [0, 1.5, 0], min: 3, max: 35 });
    } else {
      const nC = 4, n = 10, chains = [];
      for (let c = 0; c < nC; c++) {
        const ps = [];
        for (let i = 0; i < n; i++) { const p = V(i * 1.0 - n * 0.5, 0, c * 1.25 - nC * 0.62); const q = new T.Quaternion().setFromAxisAngle(V(1, 0, 0), i % 2 ? Math.PI : 0).multiply(new T.Quaternion().setFromAxisAngle(V(1, 0, 0), -Math.PI / 2)); const u = glucose(api, g, p, q, 0xFDE68A); api.part(u, UNIT); units.push(u); ps.push(p); if (i) link(ps[i - 1], p, 'β-1,4'); }
        chains.push(ps);
      }
      const hb = C3().dashes(api, 100, 0x67E8F9, g, { dots: 4, r: 0.05 }); const pairs = [];
      for (let c = 0; c + 1 < nC; c++) for (let i = 0; i < n; i++) pairs.push([chains[c][i].clone().add(V(0.15, 0, 0.3)), chains[c + 1][i].clone().add(V(0.15, 0, -0.3))]);
      api.onFrame(() => hb.set(showHB ? pairs : []));
      const hit = api.group(g); pairs.forEach(([a, b]) => api.lineBetween(a, b, 0.12, api.mat(0x67E8F9, { opacity: 0.03, depthWrite: false }), hit)); api.part(hit, { name: 'Liên kết hydrogen giữa các mạch cellulose', rows: [['Giữa', 'Nhóm –OH của mạch này với O của mạch bên cạnh'], ['Kết quả', 'Các mạch thẳng bó chặt thành vi sợi, rất bền, không tan trong nước']] });
      api.toggle({ label: '<span style="color:#67E8F9">- -</span> Liên kết hydrogen giữa các mạch', value: showHB, onChange(v) { showHB = v; } });
      api.note('<b>Cellulose</b>: các gốc β-glucose nối bằng liên kết <b>β-1,4</b>, gốc sau lật ngược so với gốc trước nên mạch <b>thẳng</b>. Nhiều mạch xếp song song, nối với nhau bằng liên kết hydrogen.');
      setTimeout(() => api.warn('cell', WARN_CELL, '🌿 Thông điệp sinh học'), 600);
      api.view({ pos: [3, 7, 8], target: [0, 0, 0], min: 3, max: 30 });
    }
    api.note('<span style="color:#86EFAC">⬢</span> gốc glucose · <span style="color:#FF2A2A">●</span> O cầu nối glycoside');
    api.caption({ amylose: 'Amylose: xoắn lò xo, liên kết α-1,4', amylopectin: 'Amylopectin: phân nhánh nhờ liên kết α-1,6', cell: 'Cellulose: mạch thẳng, liên kết β-1,4' }[tab]);
  }

  NL.m3d.register('HM8', {
    title: 'Protein và carbohydrate',
    tabs: [{ t: '🌀 Xoắn α', v: 'helix' }, { t: '📄 Phiến β', v: 'sheet' }, { t: '🍳 Biến tính', v: 'denat' }, { t: '🍚 Amylose', v: 'amylose' }, { t: '🌳 Amylopectin', v: 'amylopectin' }, { t: '🌿 Cellulose', v: 'cell' }],
    init() { temp = 25; iodine = false; },
    build(api, tab) { if (['helix', 'sheet', 'denat'].includes(tab)) protein(api, tab); else carb(api, tab); },
    data() {
      const pts = []; for (let t = 20; t <= 100; t += 5) pts.push([t, Math.round(helixFrac(t) * 100)]);
      return {
        title: 'So sánh cấu trúc protein và carbohydrate',
        sub: `Đường cong biến tính: ở ${temp} °C còn khoảng ${Math.round(helixFrac(temp) * 100)}% cấu trúc xoắn α (mô hình minh họa, nhiệt độ biến tính thật tùy từng protein)`,
        sheets: [
          { name: 'So sánh cấu trúc', head: ['Cấu trúc', 'Đơn phân', 'Liên kết nối đơn phân', 'Hình dạng', 'Lực giữ hình dạng', 'Vai trò'], rows: [
            ['Xoắn α (protein bậc 2)', 'Amino acid', 'Peptide', 'Lò xo xoắn phải, 3,6 gốc/vòng, gốc R hướng ra ngoài', 'Liên kết hydrogen giữa gốc i và i + 4', 'Keratin (tóc, móng)'],
            ['Phiến gấp β (protein bậc 2)', 'Amino acid', 'Peptide', 'Các mạch duỗi xếp song song, gấp nếp', 'Liên kết hydrogen giữa các mạch', 'Tơ tằm (fibroin)'],
            ['Amylose (tinh bột)', 'α-glucose', 'α-1,4-glycoside', 'Xoắn lò xo, không nhánh', 'Liên kết hydrogen trong xoắn', 'Dự trữ năng lượng ở thực vật'],
            ['Amylopectin (tinh bột)', 'α-glucose', 'α-1,4 và α-1,6-glycoside', 'Phân nhánh (20 – 30 gốc một nhánh)', '–', 'Dự trữ năng lượng, dễ thủy phân nhanh'],
            ['Cellulose', 'β-glucose', 'β-1,4-glycoside', 'Mạch thẳng, bó thành sợi', 'Liên kết hydrogen giữa các mạch', 'Thành tế bào thực vật']] },
          { name: 'Biến tính', head: ['Nhiệt độ (°C)', 'Cấu trúc xoắn α còn lại (%)', 'Liên kết peptide'], rows: pts.map(p => [p[0], p[1], 'Còn nguyên']) }
        ],
        chart: { type: 'line', title: 'Cấu trúc xoắn α còn lại theo nhiệt độ', xMin: 20, xMax: 100, yMax: 100, series: [{ name: 'Xoắn α (%)', color: '#F472B6', points: pts }, { name: 'Đang xem', color: '#F59E0B', points: [[temp, Math.round(helixFrac(temp) * 100)]] }], yLabel: '%', xLabel: 'Nhiệt độ (°C)' }
      };
    },
    liveData: true
  });
})();
