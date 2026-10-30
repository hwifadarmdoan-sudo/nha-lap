// Mô hình Hóa 2: Hình học phân tử theo thuyết VSEPR. 10 phân tử, liên kết σ (xám) / π (tím), cặp electron tự do, cung góc liên kết, mũi tên phân cực.
(function () {
  const C3 = () => NL.chem3d;
  const D = Math.PI / 180, S = 1.5; // 1 Å = 1,5 đơn vị cảnh
  const v = (x, y, z) => [x, y, z];
  const pol = (th, ph) => v(Math.sin(th * D) * Math.cos(ph * D), Math.cos(th * D), Math.sin(th * D) * Math.sin(ph * D));
  const pyrTh = a => Math.acos(-Math.sqrt((Math.cos(a * D) + 0.5) / 1.5)) / D; // góc lệch khỏi trục cho tháp tam giác
  const MOL = {
    CO2: { f: 'CO₂', name: 'Carbon dioxide', c: 'C', axe: 'AX₂', shape: 'Đường thẳng', ang: '180°', angV: 180, hyb: 'sp', polar: false,
      lig: [['O', v(1, 0, 0), 2, 1.16], ['O', v(-1, 0, 0), 2, 1.16]], lp: [], arcs: [[0, 1]] },
    HCN: { f: 'HCN', name: 'Hydrogen cyanide', c: 'C', axe: 'AX₂', shape: 'Đường thẳng', ang: '180°', angV: 180, hyb: 'sp', polar: true, dip: v(1, 0, 0),
      lig: [['H', v(-1, 0, 0), 1, 1.07], ['N', v(1, 0, 0), 3, 1.16]], lp: [], arcs: [[0, 1]] },
    BF3: { f: 'BF₃', name: 'Boron trifluoride', c: 'B', axe: 'AX₃', shape: 'Tam giác phẳng', ang: '120°', angV: 120, hyb: 'sp²', polar: false,
      lig: [['F', v(0, 1, 0), 1, 1.31], ['F', v(0.866, -0.5, 0), 1, 1.31], ['F', v(-0.866, -0.5, 0), 1, 1.31]], lp: [], arcs: [[0, 1]] },
    CH2O: { f: 'CH₂O', name: 'Formaldehyde', c: 'C', axe: 'AX₃', shape: 'Tam giác phẳng', ang: 'H–C–H 116,5°; H–C–O 121,8°', angV: 116.5, hyb: 'sp²', polar: true, dip: v(0, 1, 0),
      lig: [['O', v(0, 1, 0), 2, 1.21], ['H', pol(121.8, 0), 1, 1.11], ['H', pol(121.8, 180), 1, 1.11]], lp: [], arcs: [[1, 2], [0, 1]], perp: v(0, 0, 1) },
    SO2: { f: 'SO₂', name: 'Sulfur dioxide', c: 'S', axe: 'AX₂E₁', shape: 'Gấp khúc (chữ V)', ang: '≈ 119°', angV: 119, hyb: 'sp²', polar: true, dip: v(0, -1, 0),
      lig: [['O', pol(180 - 59.5, 0), 1.5, 1.43], ['O', pol(180 - 59.5, 180), 1.5, 1.43]], lp: [v(0, 1, 0)], arcs: [[0, 1]], perp: v(0, 0, 1) },
    CH4: { f: 'CH₄', name: 'Methane', c: 'C', axe: 'AX₄', shape: 'Tứ diện đều', ang: '109,5°', angV: 109.5, hyb: 'sp³', polar: false,
      lig: [['H', v(0, 1, 0), 1, 1.09], ['H', pol(109.47, 0), 1, 1.09], ['H', pol(109.47, 120), 1, 1.09], ['H', pol(109.47, 240), 1, 1.09]], lp: [], arcs: [[0, 1]] },
    NH3: { f: 'NH₃', name: 'Ammonia', c: 'N', axe: 'AX₃E₁', shape: 'Chóp tam giác', ang: '107°', angV: 107, hyb: 'sp³', polar: true, dip: v(0, 1, 0),
      lig: [['H', pol(pyrTh(107), 90), 1, 1.01], ['H', pol(pyrTh(107), 210), 1, 1.01], ['H', pol(pyrTh(107), 330), 1, 1.01]], lp: [v(0, 1, 0)], arcs: [[0, 1]] },
    H2O: { f: 'H₂O', name: 'Water', c: 'O', axe: 'AX₂E₂', shape: 'Gấp khúc (chữ V)', ang: '104,5°', angV: 104.5, hyb: 'sp³', polar: true, dip: v(0, 1, 0),
      lig: [['H', pol(180 - 52.25, 0), 1, 0.96], ['H', pol(180 - 52.25, 180), 1, 0.96]], lp: [pol(57.5, 90), pol(57.5, 270)], arcs: [[0, 1]] },
    PCl5: { f: 'PCl₅', name: 'Phosphorus pentachloride', c: 'P', axe: 'AX₅', shape: 'Lưỡng chóp tam giác', ang: '90° và 120°', angV: 90, hyb: 'sp³d (mở rộng)', polar: false,
      lig: [['Cl', v(0, 1, 0), 1, 2.14], ['Cl', v(0, -1, 0), 1, 2.14], ['Cl', v(1, 0, 0), 1, 2.04], ['Cl', pol(90, 120), 1, 2.04], ['Cl', pol(90, 240), 1, 2.04]], lp: [], arcs: [[0, 2], [2, 3]] },
    SF6: { f: 'SF₆', name: 'Sulfur hexafluoride', c: 'S', axe: 'AX₆', shape: 'Bát diện đều', ang: '90°', angV: 90, hyb: 'sp³d² (mở rộng)', polar: false,
      lig: [['F', v(1, 0, 0), 1, 1.56], ['F', v(-1, 0, 0), 1, 1.56], ['F', v(0, 1, 0), 1, 1.56], ['F', v(0, -1, 0), 1, 1.56], ['F', v(0, 0, 1), 1, 1.56], ['F', v(0, 0, -1), 1, 1.56]], lp: [], arcs: [[0, 2]] }
  };
  const KEYS = Object.keys(MOL);
  const BONDNAME = { 1: 'đơn (1σ)', 1.5: 'cộng hưởng (1σ + π trải đều trên 2 liên kết)', 2: 'đôi (1σ + 1π)', 3: 'ba (1σ + 2π)' };
  let cur = 'H2O', style = 'ball', showLP = true, showAng = true, showDip = false, spin = false;

  function build(api) {
    const T = api.T, V = api.V, m = MOL[cur], g = api.group(), fill = style === 'fill';
    const center = V(0, 0, 0);
    const nLP = m.lp.length, nX = m.lig.length;
    const cA = C3().atom(api, m.c, center, g, { fill, scale: 1.25 });
    api.part(cA, { name: `Nguyên tử trung tâm ${m.c}`, sci: m.c, rows: [['Công thức VSEPR', m.axe + ` (${nX} nguyên tử liên kết, ${nLP} cặp electron tự do)`], ['Số miền electron', `${nX + nLP} miền → các miền đẩy nhau ra xa nhất`], ['Lai hóa', m.hyb], ['Hình dạng', m.shape]], zoom: 5 });
    const dirs = [];
    m.lig.forEach(([el, d, order, len], k) => {
      const dir = V(...d).normalize(); dirs.push(dir);
      const p = dir.clone().multiplyScalar(len * S);
      const a = C3().atom(api, el, p, g, { fill });
      api.part(a, { name: `Nguyên tử ${el}`, sci: el, rows: [['Liên kết với ' + m.c, 'Liên kết ' + BONDNAME[order]], ['Độ dài liên kết', `${Math.round(len * 100)} pm`]], zoom: 5 });
      if (!fill) {
        const b = C3().bond(api, center, p, order, g, { perp: m.perp ? V(...m.perp) : null });
        api.part(b, { name: `Liên kết ${m.c}${order === 3 ? '≡' : order >= 2 ? '=' : '–'}${el}`, sci: BONDNAME[order], rows: [['Loại', 'Liên kết ' + BONDNAME[order]], ['Độ dài', `${Math.round(len * 100)} pm`], ['Trong VSEPR', 'Dù đơn, đôi hay ba, mỗi liên kết chỉ tính là <b>1 miền electron</b>']], zoom: 4, onSelect() { if (order === 3) api.warn('hcn', WARN_HCN, '🔬 Thông điệp khoa học'); } });
      }
    });
    m.lp.forEach(d => {
      const lp = C3().lonePair(api, center, V(...d), g, fill ? 1.2 : 0.75);
      api.part(lp, { name: 'Cặp electron tự do (chưa liên kết)', sci: 'Lone pair', rows: [['Ở đâu?', `Trên nguyên tử trung tâm ${m.c}`], ['Vì sao góc nhỏ lại?', 'Cặp electron tự do chiếm nhiều chỗ hơn và đẩy mạnh hơn cặp liên kết, ép các liên kết khép lại'], ['Ví dụ', 'CH₄ 109,5° → NH₃ 107° → H₂O 104,5°']], zoom: 4 });
      lp.visible = showLP;
    });
    if (!fill) m.arcs.forEach(([i, j]) => { const a = C3().angleArc(api, center, dirs[i], dirs[j], 0.7, g); a.tube.visible = showAng; a.label.show(showAng); a.label.el.dataset.ang = 1; });
    if (m.polar && m.dip) {
      const dg = api.group(g); const d = V(...m.dip).normalize(), base = d.clone().multiplyScalar(-1.1), tip = d.clone().multiplyScalar(1.6);
      api.lineBetween(base, tip, 0.05, api.mat(0xFDE047, { emissive: 0xFDE047, emissiveIntensity: 0.6 }), dg);
      const cone = api.mesh(new T.ConeGeometry(0.15, 0.4, 16), api.mat(0xFDE047, { emissive: 0xFDE047, emissiveIntensity: 0.6 }), null, dg); cone.position.copy(tip); cone.quaternion.setFromUnitVectors(V(0, 1, 0), d);
      dg.position.z = 1.4; dg.visible = showDip; api.tag(dg, 'dip');
      api.part(dg, { name: 'Mũi tên phân cực (moment lưỡng cực)', rows: [['Chiều', 'Hướng về phía nguyên tử có độ âm điện lớn hơn (đầu âm δ−)'], ['Kết luận', `${m.f} là phân tử phân cực`]] });
    }
    g.userData.spin = true;
    api.onFrame(dt => { if (spin) g.rotation.y += dt * 0.6; });
    const card = `<b style="font-size:1.25em">${m.f}</b> · ${m.name}<br>Công thức VSEPR: <b>${m.axe}</b><br>Hình dạng: <b>${m.shape}</b><br>Góc liên kết: <b>${m.ang}</b><br>Lai hóa: ${m.hyb} · ${m.polar ? '<b style="color:#F59E0B">phân cực</b>' : 'không phân cực'}`;
    api.overlay(`<div class="hm-card">${card}</div>`, 'hm-tl');
    api.caption(`${m.f}: ${m.axe}, ${m.shape}, góc ${m.ang}`);
    if (cur === 'HCN') setTimeout(() => api.warn('hcn', WARN_HCN, '🔬 Thông điệp khoa học'), 600);
  }
  const WARN_HCN = 'Giữa nguyên tử Carbon và Nitrogen hình thành <b>liên kết ba</b>. Tuy nhiên, theo thuyết VSEPR, liên kết ba này vẫn chỉ được tính là <b>1 miền electron</b> (giống như liên kết đơn), nên phân tử HCN giữ dạng <b>đường thẳng</b> với góc 180°.';

  NL.m3d.register('HM2', {
    title: 'Hình học phân tử (VSEPR)',
    init() { cur = 'H2O'; },
    build(api) {
      build(api);
      api.choices({ label: '🧪 Chọn phân tử', items: KEYS.map(k => ({ t: MOL[k].f, v: k })), value: cur, onPick(k) { cur = k; [660, 990].forEach((f, i) => api.beep(f, 0.15, 'sine', 0.06, i * 0.06)); api.setTab(api.tab); } });
      api.choices({ label: 'Kiểu hiển thị', items: [{ t: 'Quả cầu – que', v: 'ball' }, { t: 'Đặc (không gian)', v: 'fill' }], value: style, onPick(s) { style = s; api.setTab(api.tab); } });
      api.toggle({ label: '☁️ Cặp electron tự do', value: showLP, onChange(x) { showLP = x; api.groupVis('lp', x); if (x && !MOL[cur].lp.length) api.toast(`${MOL[cur].f} không có cặp electron tự do trên nguyên tử trung tâm`); } });
      api.toggle({ label: '📐 Góc liên kết', value: showAng, onChange(x) { showAng = x; api.groupVis('ang', x); document.querySelectorAll('.m3d-lab[data-ang]').forEach(e => { e.style.visibility = x ? '' : 'hidden'; }); } });
      api.toggle({ label: '➜ Mũi tên phân cực', value: showDip, onChange(x) { showDip = x; api.groupVis('dip', x); if (x && !MOL[cur].polar) api.toast(`${MOL[cur].f} đối xứng nên các phân cực triệt tiêu: không phân cực`); } });
      api.toggle({ label: '🔄 Tự xoay', value: spin, onChange(x) { spin = x; } });
      api.note('<span style="color:#B8C2CC">■</span> liên kết σ · <span style="color:#A855F7">■</span> liên kết π · <span style="color:#FACC15">●</span> cặp electron tự do');
      const R = Math.max(...MOL[cur].lig.map(l => l[3])) * S, d = R * 2.6 + 2.5;
      api.view({ pos: [d * 0.45, d * 0.25, d * 0.86], target: [0, 0, 0], min: 2, max: 25 });
    },
    data() {
      const LPN = { CH4: 0, NH3: 1, H2O: 2 };
      return {
        title: 'Hình học 10 phân tử theo VSEPR',
        sub: 'Cùng 4 miền electron (tứ diện): mỗi cặp electron tự do thêm vào làm góc liên kết nhỏ lại',
        sheets: [{ name: 'VSEPR', head: ['Phân tử', 'Công thức VSEPR', 'Số miền electron', 'Cặp e tự do (trung tâm)', 'Hình dạng', 'Góc liên kết', 'Lai hóa', 'Phân cực'], rows: KEYS.map(k => { const m = MOL[k]; return [m.f, m.axe, m.lig.length + m.lp.length, m.lp.length, m.shape, m.ang, m.hyb, m.polar ? 'Có' : 'Không']; }) }],
        chart: { title: 'Góc liên kết khi có 4 miền electron', max: 120, labels: ['CH₄ (0 cặp)', 'NH₃ (1 cặp)', 'H₂O (2 cặp)'], series: [{ name: 'Góc liên kết (°)', color: '#22D3EE', values: Object.keys(LPN).map(k => MOL[k].angV) }], yLabel: 'Góc (°)' }
      };
    }
  });
})();
