// Thí nghiệm H5: phản ứng trao đổi ion. Trộn hai dung dịch, thấy kết tủa, khí, nước hoặc không có gì,
// rồi chọn đúng các ion thật sự kết hợp để ghép phương trình ion thu gọn.
(function () {
  const A = NL.art, C = NL.chem.colorize;
  // Dung dịch: 7 dung dịch cơ bản + bảng mở rộng cho chế độ Tự chọn
  const SOL = {
    CuSO4: { t: 'CuSO₄', col: 'rgba(70,150,230,.65)', ions: ['Cu²⁺', 'SO₄²⁻'] },
    NaOH: { t: 'NaOH', col: 'rgba(220,240,255,.55)', ions: ['Na⁺', 'OH⁻'] },
    BaCl2: { t: 'BaCl₂', col: 'rgba(220,240,255,.55)', ions: ['Ba²⁺', 'Cl⁻'] },
    Na2CO3: { t: 'Na₂CO₃', col: 'rgba(220,240,255,.55)', ions: ['Na⁺', 'CO₃²⁻'] },
    HCl: { t: 'HCl', col: 'rgba(220,240,255,.55)', ions: ['H⁺', 'Cl⁻'] },
    NaCl: { t: 'NaCl', col: 'rgba(220,240,255,.55)', ions: ['Na⁺', 'Cl⁻'] },
    KNO3: { t: 'KNO₃', col: 'rgba(220,240,255,.55)', ions: ['K⁺', 'NO₃⁻'] },
    // mở rộng
    Na2SO4: { t: 'Na₂SO₄', col: 'rgba(220,240,255,.55)', ions: ['Na⁺', 'SO₄²⁻'], ext: true },
    FeCl3: { t: 'FeCl₃', col: 'rgba(200,140,60,.55)', ions: ['Fe³⁺', 'Cl⁻'], ext: true },
    AgNO3: { t: 'AgNO₃', col: 'rgba(220,240,255,.55)', ions: ['Ag⁺', 'NO₃⁻'], ext: true },
    H2SO4: { t: 'H₂SO₄', col: 'rgba(220,240,255,.55)', ions: ['H⁺', 'SO₄²⁻'], ext: true },
    CaOH2: { t: 'Ca(OH)₂', col: 'rgba(220,240,255,.55)', ions: ['Ca²⁺', 'OH⁻'], ext: true },
    BaOH2: { t: 'Ba(OH)₂', col: 'rgba(220,240,255,.55)', ions: ['Ba²⁺', 'OH⁻'], ext: true },
    NH4Cl: { t: 'NH₄Cl', col: 'rgba(220,240,255,.55)', ions: ['NH₄⁺', 'Cl⁻'], ext: true },
    MgCl2: { t: 'MgCl₂', col: 'rgba(220,240,255,.55)', ions: ['Mg²⁺', 'Cl⁻'], ext: true },
    KI: { t: 'KI', col: 'rgba(220,240,255,.55)', ions: ['K⁺', 'I⁻'], ext: true },
    PbNO32: { t: 'Pb(NO₃)₂', col: 'rgba(220,240,255,.55)', ions: ['Pb²⁺', 'NO₃⁻'], ext: true }
  };
  const BASIC = Object.keys(SOL).filter(k => !SOL[k].ext), ALL = Object.keys(SOL);
  let KEYS = BASIC;
  const BX = i => 80 + i * 95, BY = 525;
  // bảng tính tan rút gọn: các cặp ion kết hợp được với nhau; type: kt (kết tủa), khi, nuoc (chất điện li yếu)
  const RULES = [
    { a: 'Cu²⁺', b: 'OH⁻', type: 'kt', prod: 'Cu(OH)₂', col: '#3E8FD9', eq: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓', see: 'Kết tủa xanh lam' },
    { a: 'Ba²⁺', b: 'SO₄²⁻', type: 'kt', prod: 'BaSO₄', col: '#F4F6F8', eq: 'Ba²⁺ + SO₄²⁻ → BaSO₄↓', see: 'Kết tủa trắng' },
    { a: 'Ba²⁺', b: 'CO₃²⁻', type: 'kt', prod: 'BaCO₃', col: '#F4F6F8', eq: 'Ba²⁺ + CO₃²⁻ → BaCO₃↓', see: 'Kết tủa trắng' },
    { a: 'Cu²⁺', b: 'CO₃²⁻', type: 'kt', prod: 'CuCO₃', col: '#5FB8A8', eq: 'Cu²⁺ + CO₃²⁻ → CuCO₃↓', see: 'Kết tủa xanh lục', note: 'Thực tế kết tủa là muối carbonate base của đồng, sách phổ thông viết gọn là CuCO₃.' },
    { a: 'H⁺', b: 'CO₃²⁻', type: 'khi', prod: 'CO₂', eq: '2H⁺ + CO₃²⁻ → CO₂↑ + H₂O', see: 'Sủi bọt khí' },
    { a: 'H⁺', b: 'OH⁻', type: 'nuoc', prod: 'H₂O', eq: 'H⁺ + OH⁻ → H₂O', see: 'Không thấy gì, nhưng ống ấm lên' },
    { a: 'Fe³⁺', b: 'OH⁻', type: 'kt', prod: 'Fe(OH)₃', col: '#A0461E', eq: 'Fe³⁺ + 3OH⁻ → Fe(OH)₃↓', see: 'Kết tủa nâu đỏ' },
    { a: 'Fe³⁺', b: 'CO₃²⁻', type: 'kt', prod: 'Fe(OH)₃', col: '#A0461E', eq: '2Fe³⁺ + 3CO₃²⁻ + 3H₂O → 2Fe(OH)₃↓ + 3CO₂↑', see: 'Kết tủa nâu đỏ và sủi bọt khí', note: 'Fe₂(CO₃)₃ không bền trong nước, bị thủy phân ngay thành Fe(OH)₃ và CO₂.' },
    { a: 'Ag⁺', b: 'Cl⁻', type: 'kt', prod: 'AgCl', col: '#F4F6F8', eq: 'Ag⁺ + Cl⁻ → AgCl↓', see: 'Kết tủa trắng (hóa đen ngoài ánh sáng)' },
    { a: 'Ag⁺', b: 'I⁻', type: 'kt', prod: 'AgI', col: '#F2E394', eq: 'Ag⁺ + I⁻ → AgI↓', see: 'Kết tủa vàng' },
    { a: 'Ag⁺', b: 'CO₃²⁻', type: 'kt', prod: 'Ag₂CO₃', col: '#F2E6B8', eq: '2Ag⁺ + CO₃²⁻ → Ag₂CO₃↓', see: 'Kết tủa vàng nhạt' },
    { a: 'Ag⁺', b: 'OH⁻', type: 'kt', prod: 'Ag₂O', col: '#5A4A3A', eq: '2Ag⁺ + 2OH⁻ → Ag₂O↓ + H₂O', see: 'Kết tủa nâu đen', note: 'AgOH không bền, phân hủy ngay thành Ag₂O.' },
    { a: 'Ag⁺', b: 'SO₄²⁻', type: 'kt', prod: 'Ag₂SO₄', col: '#F4F6F8', eq: '2Ag⁺ + SO₄²⁻ → Ag₂SO₄↓', see: 'Kết tủa trắng (ít tan, chỉ thấy khi dung dịch đặc)' },
    { a: 'Ca²⁺', b: 'CO₃²⁻', type: 'kt', prod: 'CaCO₃', col: '#F4F6F8', eq: 'Ca²⁺ + CO₃²⁻ → CaCO₃↓', see: 'Kết tủa trắng' },
    { a: 'Ca²⁺', b: 'SO₄²⁻', type: 'kt', prod: 'CaSO₄', col: '#F4F6F8', eq: 'Ca²⁺ + SO₄²⁻ → CaSO₄↓', see: 'Kết tủa trắng (ít tan)' },
    { a: 'Mg²⁺', b: 'OH⁻', type: 'kt', prod: 'Mg(OH)₂', col: '#F4F6F8', eq: 'Mg²⁺ + 2OH⁻ → Mg(OH)₂↓', see: 'Kết tủa trắng' },
    { a: 'Mg²⁺', b: 'CO₃²⁻', type: 'kt', prod: 'MgCO₃', col: '#F4F6F8', eq: 'Mg²⁺ + CO₃²⁻ → MgCO₃↓', see: 'Kết tủa trắng' },
    { a: 'Pb²⁺', b: 'I⁻', type: 'kt', prod: 'PbI₂', col: '#F2C200', eq: 'Pb²⁺ + 2I⁻ → PbI₂↓', see: 'Kết tủa vàng tươi' },
    { a: 'Pb²⁺', b: 'Cl⁻', type: 'kt', prod: 'PbCl₂', col: '#F4F6F8', eq: 'Pb²⁺ + 2Cl⁻ → PbCl₂↓', see: 'Kết tủa trắng (tan khi đun nóng)' },
    { a: 'Pb²⁺', b: 'SO₄²⁻', type: 'kt', prod: 'PbSO₄', col: '#F4F6F8', eq: 'Pb²⁺ + SO₄²⁻ → PbSO₄↓', see: 'Kết tủa trắng' },
    { a: 'Pb²⁺', b: 'OH⁻', type: 'kt', prod: 'Pb(OH)₂', col: '#F4F6F8', eq: 'Pb²⁺ + 2OH⁻ → Pb(OH)₂↓', see: 'Kết tủa trắng' },
    { a: 'Pb²⁺', b: 'CO₃²⁻', type: 'kt', prod: 'PbCO₃', col: '#F4F6F8', eq: 'Pb²⁺ + CO₃²⁻ → PbCO₃↓', see: 'Kết tủa trắng' },
    { a: 'NH₄⁺', b: 'OH⁻', type: 'khi', prod: 'NH₃', eq: 'NH₄⁺ + OH⁻ → NH₃↑ + H₂O', see: 'Mùi khai (khí NH₃), quỳ ẩm hóa xanh' }
  ];
  const TYPE = { kt: 'Kết tủa', khi: 'Sủi khí', nuoc: 'Tạo nước', none: 'Không phản ứng' };
  const MISSION = ['kt', 'khi', 'none'];
  // cặp gợi sẵn khi mở bảng chọn, để lần đầu bấm là trộn được ngay
  const SUGGEST = [['CuSO4', 'NaOH'], ['Na2CO3', 'HCl'], ['NaCl', 'KNO3'], ['BaCl2', 'CuSO4'], ['HCl', 'NaOH'], ['BaCl2', 'Na2CO3']];
  let st;

  // mọi cặp ion phản ứng được giữa hai dung dịch (có thể 2 kết tủa cùng lúc, ví dụ CuSO₄ + Ba(OH)₂)
  const rulesOf = (a, b) => {
    const ia = SOL[a].ions, ib = SOL[b].ions;
    return RULES.filter(r => (ia.includes(r.a) && ib.includes(r.b)) || (ib.includes(r.a) && ia.includes(r.b)));
  };
  const ruleOf = (a, b) => rulesOf(a, b)[0] || null;
  // phương trình phân tử (ghép muối từ ion), chỉ để hiển thị
  const CHARGE = f => { const m = f.match(/([⁰¹²³⁴-⁹]*)([⁺⁻])$/); const n = m[1] ? '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(m[1]) : 1; return m[2] === '⁺' ? n : -n; };
  const bare = f => f.replace(/[⁰¹²³⁴-⁹]*[⁺⁻]$/, '');
  const SUBD = '₀₁₂₃₄₅₆₇₈₉';
  const salt = (cat, an) => {
    const c = Math.abs(CHARGE(cat)), a = Math.abs(CHARGE(an)), g = (x, y) => y ? g(y, x % y) : x, l = c * a / g(c, a), nc = l / c, na = l / a;
    const wrap = (f, n) => n === 1 ? f : ((f.match(/[A-Z]/g) || []).length > 1 ? `(${f})` : f) + SUBD[n];
    if (cat === 'H⁺' && an === 'OH⁻') return 'H₂O';
    return wrap(bare(cat), nc) + wrap(bare(an), na);
  };
  const SPECIAL = { 'CO₂': 'CO₂↑ + H₂O', 'NH₃': 'NH₃↑ + H₂O', 'Ag₂O': 'Ag₂O↓ + H₂O', 'H₂O': 'H₂O' };
  const molecular = (a, b) => {
    const [c1, a1] = SOL[a].ions, [c2, a2] = SOL[b].ions;
    if (!rulesOf(a, b).length) return '';
    const prod = (cat, an) => {
      const r = RULES.find(x => (x.a === cat && x.b === an) || (x.a === an && x.b === cat));
      if (!r) return salt(cat, an);
      if (SPECIAL[r.prod]) return SPECIAL[r.prod];
      if (r.eq.includes('CO₂↑') && r.type === 'kt') return `${r.prod}↓ + CO₂↑`;
      return r.prod + (r.type === 'kt' ? '↓' : '');
    };
    return balance([SOL[a].t, SOL[b].t], `${prod(c1, a2)} + ${prod(c2, a1)}`.split(' + '));
  };
  // Cân bằng hệ số bằng cách thử (phương trình ngắn, tối đa 5 chất)
  const count = f => {
    const out = {}; f = f.replace(/[↑↓]/g, '').replace(/[₀-₉]/g, d => SUBD.indexOf(d));
    const walk = (str, mul) => { let i = 0; while (i < str.length) { if (str[i] === '(') { let d = 1, j = i + 1; while (d) { if (str[j] === '(') d++; if (str[j] === ')') d--; j++; } let k = j, n = ''; while (/\d/.test(str[k] || '')) n += str[k++]; walk(str.slice(i + 1, j - 1), mul * (+n || 1)); i = k; } else { const m = str.slice(i).match(/^([A-Z][a-z]?)(\d*)/); if (!m) { i++; continue; } out[m[1]] = (out[m[1]] || 0) + mul * (+m[2] || 1); i += m[0].length; } } };
    walk(f, 1); return out;
  };
  const balance = (L, R) => {
    const all = L.concat(R), cs = all.map(count), els = [...new Set(cs.flatMap(Object.keys))], n = all.length;
    const co = new Array(n).fill(1), lim = 6;
    const ok = () => els.every(e => cs.reduce((t, c, i) => t + (i < L.length ? 1 : -1) * co[i] * (c[e] || 0), 0) === 0);
    const rec = i => { if (i === n) return ok(); for (let k = 1; k <= lim; k++) { co[i] = k; if (rec(i + 1)) return true; } return false; };
    const found = rec(0), fmt = (f, i) => (found && co[i] > 1 ? co[i] : '') + f;
    return L.map(fmt).join(' + ') + ' → ' + R.map((f, i) => fmt(f, i + L.length)).join(' + ') + (found ? '' : ' (chưa cân bằng hệ số)');
  };

  function build(api) {
    const L = api.svg, el = api.el;
    st = { rows: [], found: {}, tried: {}, a: null, b: null, warned: false };
    st.bottleG = api.g(L, 0, 0);
    // chế độ Tự chọn: 17 lọ xếp hai hàng để không chui xuống dưới bảng điều khiển bên phải
    st.drawBottles = () => {
      st.bottleG.innerHTML = ''; const many = KEYS.length > 8;
      st.bx = i => many ? (i < 9 ? 60 + i * 74 : 97 + (i - 9) * 74) : BX(i);
      st.by = i => many && i >= 9 ? BY - 84 : BY;
      st.bottles = KEYS.map((k, i) => A.bottle(api, st.bottleG, st.bx(i), st.by(i), SOL[k].t, SOL[k].col, { w: many ? 46 : 64, h: many ? 56 : 74, font: many ? 10 : 13 }));
      st.ty = many ? -50 : 0; if (st.tube) api.place(st.tube, 330, 400 + st.ty); // nâng ống trộn lên khỏi hàng lọ phía sau
    };
    st.drawBottles();
    st.badge = { A: api.text(L, 0, 0, 'A', 18, '#fff', 800), B: api.text(L, 0, 0, 'B', 18, '#fff', 800) };
    st.badgeBg = { A: el('circle', { r: 14, fill: '#2F80C0' }, L), B: el('circle', { r: 14, fill: '#E07B00' }, L) };
    ['A', 'B'].forEach(k => { L.appendChild(st.badge[k]); st.badgeBg[k].style.display = st.badge[k].style.display = 'none'; });
    // ống trộn
    st.tube = A.tube(api, L, 330, 400, { h: 230, w: 60, label: 'Ống trộn' });
    st.ppt = el('path', { d: '', fill: '#fff', opacity: 0 }, st.tube);
    st.bub = api.g(st.tube, 0, 0);
    st.heat = api.text(L, 420, 300, '', 16, '#E5534B', 800);
    st.pip = A.pipette(api, L, 0, 0, { len: 130, bulb: '#E07B00' }); st.pip.style.display = 'none';
    st.lens = NL.chem.lens(api, L, 590, 190, 86, { title: '🔍 Kính lúp hạt: trong ống trộn' }); st.lens.g.style.display = 'none';
  }
  function badge(k, key) {
    const bg = st.badgeBg[k], t = st.badge[k];
    if (!key) { bg.style.display = t.style.display = 'none'; return; }
    const i = KEYS.indexOf(key), x = st.bx(i) + (k === 'A' ? -14 : 14), y = st.by(i) - (KEYS.length > 8 ? 70 : 108);
    bg.style.display = t.style.display = '';
    bg.setAttribute('cx', x); bg.setAttribute('cy', y); t.setAttribute('x', x); t.setAttribute('y', y + 6);
  }
  function sideTable(api) {
    if (!st.tbl) st.tbl = api.table(['Trộn', 'Thấy', 'Loại']);
    st.tbl.set(st.rows.map(r => [C(`${SOL[r.a].t} + ${SOL[r.b].t}`), r.see, TYPE[r.type]]));
  }
  const missionHtml = () => '<div><b>Nhiệm vụ:</b> tìm đủ 3 kiểu</div><div style="margin-top:4px">' + MISSION.map(m => `${st.found[m] ? '✅' : '⬜'} ${TYPE[m]}`).join(' &nbsp; ') + '</div>';
  function reset() {
    st.tube.fill(null, 0); st.ppt.setAttribute('opacity', 0); if (st.ppt2) st.ppt2.setAttribute('opacity', 0); st.bub.innerHTML = ''; st.heat.textContent = '';
    st.lens.set([]); st.lens.g.style.display = 'none';
  }
  function suggest() {
    const s = SUGGEST.find(p => !st.tried[p.join('+')] && !st.tried[p[1] + '+' + p[0]]) || SUGGEST[0];
    st.a = s[0]; st.b = s[1];
  }

  const steps = [
    {
      label: () => `Lần trộn ${st.rows.length + 1}`, text: 'Chọn dung dịch A trong ống và dung dịch B trong pipette, rồi kéo pipette nhỏ vào ống', hint: 'Chọn A, chọn B bên phải, rồi kéo pipette cam vào miệng ống trộn',
      enter(api) {
        sideTable(api); reset();
        if (!api.prediction) api.ask({ predict: true, q: 'Trộn dung dịch NaCl với dung dịch KNO₃ (đều trong suốt). Em đoán sẽ thấy gì?', options: [{ t: 'Có kết tủa trắng' }, { t: 'Sủi bọt khí' }, { t: 'Không có hiện tượng gì' }] });
        suggest();
        st.mis = api.panel(missionHtml());
        const rebuild = () => {
          if (st.pickA) { st.pickA.remove(); st.pickB.remove(); }
          const items = KEYS.map(k => ({ t: C(SOL[k].t), v: k }));
          if (!KEYS.includes(st.a)) st.a = KEYS[0]; if (!KEYS.includes(st.b)) st.b = KEYS[1];
          st.pickA = api.choices({ label: 'A: trong ống trộn', items, value: st.a, onPick(v) { st.a = v; ready(api); } });
          st.pickB = api.choices({ label: 'B: trong pipette', items, value: st.b, onPick(v) { st.b = v; ready(api); } });
          ready(api);
        };
        st.mode = api.choices({ label: 'Chế độ', items: [{ t: '7 dung dịch cơ bản', v: false }, { t: '🧪 Tự chọn (17 dung dịch)', v: true }], value: !!st.free, onPick(v) { st.free = v; KEYS = v ? ALL : BASIC; st.drawBottles(); badge('A', null); badge('B', null); rebuild(); } });
        rebuild();
      }
    },
    {
      label: () => `Lần trộn ${st.rows.length + 1} · Phương trình`, text: 'Ion nào thật sự kết hợp với nhau? Chạm đúng 2 ion', hint: 'Nhìn kính lúp: hạt nào biến mất để tạo ra chất mới?',
      enter(api) {
        const r = st.rule;
        if (!r) {
          api.say('Không có kết tủa, khí hay nước tạo thành: không có phản ứng');
          api.card({ kicker: '🤷 Không có phản ứng', text: 'Bốn ion vẫn bơi tự do như trước khi trộn, không cặp nào kết hợp thành kết tủa, khí hay nước.', sub: 'Đây cũng là một kết quả đáng ghi lại!', btn: 'Ghi vào bảng ➜' }, () => record(api, 'Không có hiện tượng', 'none'));
          return;
        }
        chips(api);
      },
      onNext(api) { if (st.mis2) { st.mis2.remove(); st.mis2 = null; } api.goto(st.all ? 2 : 0); }
    },
    {
      label: 'Kết quả', text: 'Các kiểu phản ứng em đã tìm thấy', hint: 'Phản ứng trao đổi ion chỉ xảy ra khi tạo kết tủa, khí hoặc nước',
      enter(api) { st.lens.g.style.display = 'none'; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Không có hiện tượng gì', truth: 'Na⁺, Cl⁻, K⁺, NO₃⁻ không kết hợp được thành kết tủa, khí hay nước, nên chúng vẫn bơi tự do: không có phản ứng.',
          sub: 'Điều kiện để phản ứng trao đổi ion xảy ra: sản phẩm có chất kết tủa, chất khí hoặc chất điện li yếu như H₂O.',
          result: result(),
          quiz: [{
            kicker: '❓ Vì sao?', q: 'Trong phương trình ion thu gọn Cu²⁺ + 2OH⁻ → Cu(OH)₂↓, vì sao không viết Na⁺ và SO₄²⁻?',
            options: [
              { t: 'Vì chúng vẫn ở dạng ion tự do trước và sau phản ứng, không tham gia phản ứng', ok: true },
              { t: 'Vì chúng bay hơi mất', why: 'Ion trong dung dịch không bay hơi. Nhìn lại kính lúp: Na⁺ và SO₄²⁻ có thay đổi không?' },
              { t: 'Vì chúng quá nhỏ', why: 'Kích thước không quyết định. Câu hỏi là ion đó có kết hợp tạo chất mới hay không.' }
            ],
            explain: 'Na⁺ và SO₄²⁻ là ion khán giả: có mặt trong dung dịch nhưng không đổi. Phương trình ion thu gọn chỉ giữ những ion thật sự tạo ra chất mới.'
          }]
        });
      }
    }
  ];

  function ready(api) {
    badge('A', st.a); badge('B', st.b);
    st.tube.fill(SOL[st.a].col, 0.35);
    st.pip.style.display = 'none';
    if (st.a === st.b) { api.say('Chọn hai dung dịch khác nhau nhé'); return; }
    api.say(`Trộn ${SOL[st.a].t} với ${SOL[st.b].t}`);
    const bi = KEYS.indexOf(st.b), bx = st.bx(bi), by = st.by(bi);
    st.pip.style.display = ''; st.pip.fill(SOL[st.b].col.replace(/[\d.]+\)$/, '.9)'));
    api.place(st.pip, bx, by - (KEYS.length > 8 ? 100 : 130)); api.setOn(st.pip, true);
    api.draggable(st.pip, { target: { x: 330, y: 150 + st.ty, r: 80, sx: 330, sy: 150 + st.ty }, onDrop: () => mix(api) });
  }
  function mix(api) {
    st.pickA.remove(); st.pickB.remove(); st.mis.remove(); st.mode.remove();
    const a = st.a, b = st.b, rs = st.rules = rulesOf(a, b), r = st.rule = rs[0] || null;
    st.tried[a + '+' + b] = 1;
    let n = 0;
    const one = () => A.drop(api, api.svg, 330, 158 + st.ty, 290 + st.ty, SOL[b].col, () => { NL.audio.play('drop'); if (++n < 3) one(); else after(); });
    one();
    function after() {
      st.pip.empty(); st.pip.style.display = 'none';
      st.tube.fill(SOL[a].col, 0.6);
      const ions = SOL[a].ions.concat(SOL[b].ions);
      st.lens.g.style.display = ''; st.lens.set(ions.map(f => ({ f, n: 3 })));
      api.wait(1.2, () => {
        const kts = rs.filter(x => x.type === 'kt'), gas = rs.find(x => x.type === 'khi' || /↑/.test(x.eq));
        if (kts.length) {
          // một hoặc hai lớp kết tủa (hai kết tủa thì lớp trên là chất thứ hai)
          st.ppt.setAttribute('fill', kts[0].col); st.ppt.setAttribute('stroke', '#C9D3DC');
          if (kts[1]) { if (!st.ppt2) st.ppt2 = api.el('path', { d: '', opacity: 0 }, st.tube); st.ppt2.setAttribute('fill', kts[1].col); st.ppt2.setAttribute('stroke', '#C9D3DC'); }
          let t = 0; api.loop(dt => {
            t += dt; const k = Math.min(1, t / 1.5), h = kts[1] ? 24 : 40;
            st.ppt.setAttribute('opacity', 0.95); st.ppt.setAttribute('d', `M-27 ${-30 - h * k} Q0 ${-36 - h * k} 27 ${-30 - h * k} L27 -30 A27 27 0 0 1 -27 -30 Z`);
            if (kts[1]) { st.ppt2.setAttribute('opacity', 0.95); st.ppt2.setAttribute('d', `M-27 ${-30 - h * k - 22 * k} Q0 ${-36 - h * k - 22 * k} 27 ${-30 - h * k - 22 * k} L27 ${-30 - h * k} Q0 ${-36 - h * k} -27 ${-30 - h * k} Z`); }
            if (k >= 1) return false;
          });
          NL.audio.play('pop');
          st.lens.set(ions.filter(f => !rs.some(x => x.a === f || x.b === f)).map(f => ({ f, n: 2 })).concat(kts.map(x => ({ f: x.prod, n: 4 }))), { clump: kts.map(x => x.prod) });
        }
        if (gas) {
          let t = 0, acc = 0; const bs = [];
          api.loop(dt => {
            t += dt; acc += 14 * dt;
            while (acc > 1) { acc--; bs.push({ e: api.el('circle', { cx: Math.random() * 36 - 18, cy: -20, r: 2 + Math.random() * 3, fill: 'rgba(255,255,255,.95)', stroke: '#9CC7E3' }, st.bub), y: -20 }); }
            for (let i = bs.length - 1; i >= 0; i--) { bs[i].y -= 80 * dt; bs[i].e.setAttribute('cy', bs[i].y); if (bs[i].y < -135) { bs[i].e.remove(); bs.splice(i, 1); } }
            if (t > 6) { bs.forEach(x => x.e.remove()); return false; }
          });
          NL.audio.play('bubble');
        } else if (r && r.type === 'nuoc') {
          st.heat.textContent = '🌡️ ống ấm lên'; NL.audio.play('hum');
        }
        api.say(rs.length ? rs.map(x => x.see).join(' + ') : 'Không thấy gì thay đổi');
        api.wait(1, () => api.goto(1));
      });
    }
  }
  function chips(api) {
    const r = st.rule, ions = SOL[st.a].ions.concat(SOL[st.b].ions), k = st.rules.indexOf(r);
    const picked = {};
    const d = st.chip = api.panel(`<div>${st.rules.length > 1 ? `Phản ứng ${k + 1}/${st.rules.length}: c` : 'C'}hạm 2 ion kết hợp với nhau</div><div class="seg">${ions.map((f, i) => `<button class="seg-b pop ion-chip" data-i="${i}">${C(f)}</button>`).join('')}</div>`);
    d.querySelectorAll('.seg-b').forEach(btn => btn.addEventListener('click', () => {
      const f = ions[+btn.dataset.i];
      if (f === r.a || f === r.b) {
        NL.audio.play('ting'); picked[f] = 1; btn.classList.add('on'); btn.disabled = true;
        if (picked[r.a] && picked[r.b]) solved(api);
        return;
      }
      NL.audio.play('click');
      if (st.rules.some(x => x !== r && (x.a === f || x.b === f))) { api.say(`${f} có tham gia phản ứng, nhưng ở phương trình khác. Chọn cặp ion của phản ứng ${k + 1} trước nhé`); btn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 }); return; }
      if (!st.warned) {
        st.warned = true;
        api.lesson({ title: 'Chọn nhầm ion khán giả', text: `${f} vẫn bơi tự do trong dung dịch cả trước và sau khi trộn. Nó không kết hợp với ion nào cả.`, sub: 'Bài học: phương trình ion thu gọn chỉ giữ những ion thật sự kết hợp thành kết tủa, khí hoặc nước. Ion không đổi gọi là ion khán giả, được bỏ đi.', btn: '🔁 Chọn lại' }, () => {});
      } else api.say(`${f} là ion khán giả, nó không đổi. Chọn ion khác nhé`);
      btn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
    }));
  }
  function solved(api) {
    const r = st.rule, rs = st.rules, ions = SOL[st.a].ions.concat(SOL[st.b].ions);
    st.chip.remove();
    const used = f => rs.some(x => x.a === f || x.b === f);
    const kts = rs.filter(x => x.type === 'kt').map(x => x.prod);
    // ion khán giả mờ dần, chỉ còn sản phẩm (kết tủa kết cụm lắng xuống)
    st.lens.set(rs.map(x => ({ f: x.prod, n: 4 })).concat(ions.filter(f => !used(f)).map(f => ({ f, n: 1 }))), { clump: kts });
    api.wait(1.2, () => st.lens.set(rs.map(x => ({ f: x.prod, n: 4 })), { clump: kts }));
    api.say(r.eq);
    const spect = ions.filter(f => !used(f)).filter((f, i, a) => a.indexOf(f) === i);
    const next = rs[rs.indexOf(r) + 1];
    api.card({ kicker: next ? `✨ Phương trình ion thu gọn ${rs.indexOf(r) + 1}/${rs.length}` : '✨ Phương trình ion thu gọn', text: rs.length > 1 && !next ? rs.map(x => x.eq).join(' ; ') : r.eq, sub: (st.free ? `Phương trình phân tử: ${molecular(st.a, st.b)}. ` : '') + (spect.length ? `Ion khán giả (bỏ đi): ${spect.join(', ')}.` : 'Không có ion khán giả: cả bốn ion đều tham gia phản ứng.') + (r.note ? ' ' + r.note : ''), btn: next ? 'Phản ứng tiếp ➜' : 'Ghi vào bảng ➜' }, () => {
      if (next) { st.rule = next; chips(api); return; }
      record(api, rs.map(x => x.see).join(' + '), rs.some(x => x.type === 'kt') ? 'kt' : r.type);
    });
  }
  function record(api, see, type) {
    st.rows.push({ a: st.a, b: st.b, see, type, eq: st.rules && st.rules.length ? st.rules.map(x => x.eq).join('; ') : '' }); st.found[type] = 1; sideTable(api);
    const all = st.all = MISSION.every(m => st.found[m]);
    if (st.mis2) st.mis2.remove();
    st.mis2 = api.panel(missionHtml());
    api.done(all ? 'Xem kết quả ➜' : 'Trộn cặp khác ➜');
  }

  function result() {
    const cnt = t => st.rows.filter(r => r.type === t).length;
    return {
      title: 'Phản ứng trao đổi ion trong dung dịch', param: `${st.rows.length} lần trộn, ${st.free ? 17 : 7} dung dịch`,
      table: { head: ['Lần', 'Trộn', 'Hiện tượng', 'Phương trình ion thu gọn'], rows: st.rows.map((r, i) => [i + 1, `${SOL[r.a].t} + ${SOL[r.b].t}`, r.see, r.eq || 'Không phản ứng']) },
      chart: { labels: ['Kết tủa', 'Sủi khí', 'Tạo nước', 'Không phản ứng'], yLabel: 'Số lần trộn', series: [{ name: 'Số lần', color: '#9B6BD6', values: ['kt', 'khi', 'nuoc', 'none'].map(cnt) }] },
      conclusion: 'Phản ứng trao đổi ion chỉ xảy ra khi các ion kết hợp được thành chất kết tủa, chất khí hoặc chất điện li yếu (như H₂O). Phương trình ion thu gọn chỉ ghi những ion đó, bỏ các ion khán giả',
      note: 'Muốn biết chất nào kết tủa, dùng bảng tính tan ở cuối sách giáo khoa.'
    };
  }
  function auto(api) {
    if (st.chip && st.chip.isConnected) {
      const btn = [...st.chip.querySelectorAll('.seg-b')].find(b => !b.disabled && b.textContent && [st.rule.a, st.rule.b].includes(b.textContent));
      if (btn) { btn.click(); return 'chip'; }
    }
    return false;
  }

  NL.lab.register('H5', { goal: 'Trộn hai dung dịch trong suốt, khi nào mới có phản ứng?', build, steps, auto });
})();
