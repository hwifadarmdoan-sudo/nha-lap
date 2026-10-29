// Hình vẽ dụng cụ dùng chung cho các bàn thí nghiệm (SVG, toạ độ khung 1000×560).
window.NL = window.NL || {};
NL.art = (function () {
  const GLASS = '#8FBBD8', LIQ = 'rgba(150,210,245,.55)';

  // Ống nghiệm, miệng ở trên, đáy tròn tại (0,0). fill(color, k) đổ chất lỏng cao k (0..1)
  function tube(api, parent, x, y, opt) {
    opt = opt || {};
    const h = opt.h || 150, w = opt.w || 30, g = api.g(parent, x, y);
    const r = w / 2;
    const liq = api.el('path', { d: '', fill: opt.color || LIQ }, g);
    api.el('path', { d: `M${-r} ${-h} L${-r} ${-r} A${r} ${r} 0 0 0 ${r} ${-r} L${r} ${-h}`, fill: 'rgba(220,240,255,.25)', stroke: GLASS, 'stroke-width': 3.5 }, g);
    api.el('rect', { x: -r + 4, y: -h + 8, width: 4, height: h - r - 14, rx: 2, fill: 'rgba(255,255,255,.7)' }, g);
    if (opt.label) api.text(g, 0, -h - 10, opt.label, 15, '#1F4E79', 800);
    g.fill = (color, k) => {
      if (!k) { liq.setAttribute('d', ''); return; }
      const top = -r - (h - r - 6) * k;
      liq.setAttribute('d', `M${-r + 2} ${top} L${-r + 2} ${-r} A${r - 2} ${r - 2} 0 0 0 ${r - 2} ${-r} L${r - 2} ${top} Z`);
      liq.setAttribute('fill', color);
    };
    if (opt.k) g.fill(opt.color || LIQ, opt.k);
    return g;
  }

  // Pipette: đầu nhọn ở (0,0), bóp cao su phía trên. fill(color) / empty()
  function pipette(api, parent, x, y, opt) {
    opt = opt || {};
    const g = api.g(parent, x, y), L = opt.len || 150;
    const liq = api.el('rect', { x: -4, y: -46, width: 8, height: 0, fill: 'transparent' }, g);
    api.el('path', { d: `M-2 0 L-6 -24 L-6 ${-L + 30} L6 ${-L + 30} L6 -24 L2 0 Z`, fill: 'rgba(220,240,255,.45)', stroke: GLASS, 'stroke-width': 2.5 }, g);
    api.el('rect', { x: -11, y: -L - 8, width: 22, height: 42, rx: 11, fill: opt.bulb || '#E5534B' }, g);
    g.fill = color => { liq.setAttribute('y', -60); liq.setAttribute('height', 50); liq.setAttribute('fill', color); };
    g.empty = () => liq.setAttribute('fill', 'transparent');
    return g;
  }

  // Lọ hoá chất có nhãn. Đáy ở (0,0)
  function bottle(api, parent, x, y, label, color, opt) {
    opt = opt || {};
    const g = api.g(parent, x, y), w = opt.w || 70, h = opt.h || 90;
    api.el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 12, fill: 'rgba(220,240,255,.35)', stroke: GLASS, 'stroke-width': 3 }, g);
    api.el('rect', { x: -w / 2 + 4, y: -h * 0.62, width: w - 8, height: h * 0.62 - 4, rx: 9, fill: color }, g);
    api.el('rect', { x: -w / 4, y: -h - 16, width: w / 2, height: 18, rx: 4, fill: opt.cap || '#4A5A6A' }, g);
    api.el('rect', { x: -w / 2 + 6, y: -h * 0.55, width: w - 12, height: 26, rx: 5, fill: '#fff', opacity: .92 }, g);
    api.text(g, 0, -h * 0.55 + 18, label, opt.font || 13, '#1F4E79', 800);
    return g;
  }

  // Lọ nhỏ giọt (Lugol, thuốc nhuộm). Đầu nhỏ giọt ở (0,0) phía dưới khi cầm
  function dropper(api, parent, x, y, label, color) {
    const g = api.g(parent, x, y);
    api.el('rect', { x: -18, y: -10, width: 36, height: 50, rx: 8, fill: color, stroke: '#7A5A2A', 'stroke-width': 2 }, g);
    api.el('rect', { x: -7, y: -34, width: 14, height: 26, rx: 4, fill: '#333' }, g);
    api.el('rect', { x: -14, y: 6, width: 28, height: 16, rx: 3, fill: '#fff', opacity: .9 }, g);
    api.text(g, 0, 19, label, 10, '#5A3A10', 800);
    return g;
  }

  // Một giọt rơi từ (x,y1) xuống (x,y2) rồi gọi done
  function drop(api, parent, x, y1, y2, color, done) {
    const d = api.el('ellipse', { cx: x, cy: y1, rx: 5, ry: 7, fill: color }, parent);
    const t0 = performance.now();
    const f = now => {
      const k = Math.min(1, (now - t0) / 380);
      d.setAttribute('cy', y1 + (y2 - y1) * k * k);
      if (k < 1) requestAnimationFrame(f); else { d.remove(); done && done(); }
    };
    requestAnimationFrame(f);
  }

  return { tube, pipette, bottle, dropper, drop, LIQ, GLASS };
})();
