// Tầng Hóa: màu cố định cho từng nguyên tố, tô màu công thức, kính lúp hạt.
// Góp ý Linh 30/10: công thức trắng đen làm nhức đầu, nên mỗi nguyên tố có một màu dùng chung cả tầng.
window.NL = window.NL || {};
NL.chem = (function () {
  const EL = {
    H: '#7A8A99', O: '#E5534B', C: '#3B3B3B', N: '#3D6FD9', Cl: '#2EA44F', S: '#C9A100', P: '#E07B00',
    Cu: '#1E88E5', Fe: '#B5532E', Zn: '#6C7A89', Mg: '#8E6CC9', Al: '#7F8C9A', Na: '#9B59B6', K: '#A0529F',
    Ca: '#D07A2B', Ag: '#8A9BA8', Ba: '#2A9D8F', Mn: '#B0306A', I: '#7B3FA0', Pb: '#5A6570', Br: '#A0522D'
  };
  // màu hạt trong kính lúp (ion lấy màu nguyên tố chính)
  const SP = {
    'H⁺': '#E5534B', 'OH⁻': '#8E44AD', 'Cl⁻': '#2EA44F', 'Na⁺': '#9B59B6', 'K⁺': '#A0529F', 'Cu²⁺': '#1E88E5',
    'Fe²⁺': '#6FA86A', 'Fe³⁺': '#B5532E', 'Zn²⁺': '#6C7A89', 'Mg²⁺': '#8E6CC9', 'Al³⁺': '#7F8C9A', 'Ag⁺': '#8A9BA8',
    'Ba²⁺': '#2A9D8F', 'Ca²⁺': '#D07A2B', 'SO₄²⁻': '#C9A100', 'NO₃⁻': '#3D6FD9', 'CO₃²⁻': '#555555',
    'CH₃COO⁻': '#E07B00', 'H₂O': '#9CC7E3', 'H₂': '#C9D3DC', 'N₂': '#3D6FD9', 'O₂': '#E5534B', 'CO₂': '#555555',
    'C₁₂H₂₂O₁₁': '#E8B04B', 'Cu(OH)₂': '#1565C0', 'BaSO₄': '#9AA8B2', 'BaCO₃': '#7F8F99', 'CuCO₃': '#26A69A', 'Fe(OH)₃': '#A0461E', 'Fe(OH)₂': '#5E8C5A', 'Al(OH)₃': '#AAB4BE', 'CH₃COOC₂H₅': '#E8A33D', 'CH₄': '#3B3B3B', 'C': '#222222', 'C₂₅H₅₂': '#C9B47A', 'Al(OH)₄⁻': '#8FA0AE', 'FeCl₃': '#B5532E', 'C₂H₂': '#5A5A5A', 'Fe²⁺(aq)': '#6FA86A', 'CH₃COOH': '#E07B00', 'C₂H₅OH': '#5FA8D3', 'Cu': '#C8743A', 'Fe': '#8C8C8C', 'e⁻': '#FFD54A'
  };
  const SYM = Object.keys(EL).sort((a, b) => b.length - a.length);
  const PART = '(?:' + SYM.join('|') + ')[₀-₉]*';
  const FORM = new RegExp(`(?<![\\p{L}])((?:${PART}|\\((?:${PART})+\\)[₀-₉]*)+)([⁰¹²³⁴-⁹]*[⁺⁻])?(?![\\p{L}\\d])`, 'gu');
  const color = sym => EL[sym] || '#1F4E79';

  // Trả về HTML tô màu cho một công thức đã có chỉ số dưới (Cu²⁺, H₂SO₄, Fe(OH)₃)
  function paint(f, charge) {
    const parts = f.match(new RegExp(`\\(|\\)[₀-₉]*|${PART}`, 'gu')) || [f];
    const main = (parts.find(p => /^[A-Z]/.test(p)) || '').replace(/[₀-₉]/g, '');
    return `<span class="chem">${parts.map(p => {
      const s = p.replace(/[₀-₉()]/g, '');
      return s ? `<b style="color:${color(s)}">${p}</b>` : p;
    }).join('')}${charge ? `<b style="color:${color(main)}">${charge}</b>` : ''}</span>`;
  }
  // Tìm công thức trong đoạn chữ (đã escape) để tô màu. Chỉ nhận chuỗi có chỉ số, điện tích
  // hoặc từ hai nguyên tố trở lên, để không tô nhầm chữ tiếng Việt như "Co", "Ba", "Na".
  function colorize(html, keep) {
    return html.replace(FORM, (m, f, ch) => {
      const n = (f.match(new RegExp(PART, 'gu')) || []).length;
      if (!ch && n < 2 && !/[₀-₉]/.test(f)) return m;
      const out = paint(f, ch);
      return keep ? keep(out) : out;
    });
  }

  // Kính lúp hạt: vòng tròn phóng to, các hạt chuyển động bên trong.
  // set([{ f: 'Cu²⁺', n: 6 }, …]) đổi thành phần, hạt cũ mờ dần, hạt mới hiện dần.
  function lens(api, parent, x, y, r, opt) {
    opt = opt || {};
    const g = api.g(parent, x, y), id = 'lc' + Math.random().toString(36).slice(2, 8);
    const defs = api.el('defs', {}, g), cp = api.el('clipPath', { id }, defs);
    api.el('circle', { r: r - 4 }, cp);
    api.el('circle', { r, fill: opt.bg || '#F4FAFF', stroke: '#2F80C0', 'stroke-width': 6 }, g);
    const inner = api.el('g', { 'clip-path': `url(#${id})` }, g);
    api.el('rect', { x: r * 0.62, y: r * 0.62, width: r * 0.5, height: 16, rx: 8, fill: '#2F80C0', transform: `rotate(45 ${r * 0.62} ${r * 0.62})` }, g);
    const cap = api.text(g, 0, r + 26, opt.title || '🔍 Kính lúp hạt', 15, '#2F80C0', 800);
    const legend = api.el('g', {}, g);
    let parts = [];
    function dot(f) {
      const d = api.g(inner, (Math.random() * 2 - 1) * r * 0.7, (Math.random() * 2 - 1) * r * 0.7);
      const big = f.length > 3, huge = f.length > 8, rr = huge ? 25 : big ? 17 : 13;
      api.el('circle', { r: rr, fill: SP[f] || '#999', stroke: '#fff', 'stroke-width': 2 }, d);
      const t = api.text(d, 0, 4, f, huge ? 7 : big ? 8 : 10, '#fff', 800); t.setAttribute('pointer-events', 'none');
      d._vx = (Math.random() * 2 - 1) * 40; d._vy = (Math.random() * 2 - 1) * 40; d._f = f; d._a = 0; d._ta = 1;
      d.setAttribute('opacity', 0); return d;
    }
    function set(list) {
      const want = {}; list.forEach(s => { want[s.f] = (want[s.f] || 0) + s.n; });
      const have = {};
      parts.forEach(p => { if (p._ta > 0) { have[p._f] = (have[p._f] || 0) + 1; if (have[p._f] > (want[p._f] || 0)) p._ta = 0; } });
      Object.keys(want).forEach(f => { for (let k = have[f] || 0; k < want[f]; k++) parts.push(dot(f)); });
      legend.innerHTML = '';
      Object.keys(want).filter(f => want[f]).forEach((f, i, a) => {
        const gap = a.some(f => f.length > 4) ? 96 : 74, lx = (i - (a.length - 1) / 2) * gap;
        api.el('circle', { cx: lx - 22, cy: -r - 18, r: 7, fill: SP[f] || '#999' }, legend);
        api.text(legend, lx + 6, -r - 13, f, 13, '#1F4E79', 800).setAttribute('text-anchor', 'middle');
      });
    }
    const lp = api.loop(dt => {
      parts = parts.filter(p => {
        p._a += (p._ta - p._a) * Math.min(1, dt * 3);
        if (p._ta === 0 && p._a < 0.03) { p.remove(); return false; }
        p.setAttribute('opacity', p._a.toFixed(2));
        p._x += p._vx * dt * (opt.speed || 1); p._y += p._vy * dt * (opt.speed || 1);
        const lim = r - 16;
        if (Math.hypot(p._x, p._y) > lim) { const a = Math.atan2(p._y, p._x); p._x = Math.cos(a) * lim; p._y = Math.sin(a) * lim; p._vx = -p._vx + (Math.random() - 0.5) * 20; p._vy = -p._vy + (Math.random() - 0.5) * 20; }
        api.place(p); return true;
      });
    });
    if (opt.list) set(opt.list);
    return { g, set, caption(t) { cap.textContent = t; }, remove() { lp.stop(); g.remove(); } };
  }

  return { EL, SP, paint, colorize, lens, color };
})();
