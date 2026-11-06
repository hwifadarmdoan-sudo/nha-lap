// Dụng cụ dùng chung cho tầng Lí: đồng hồ đo kim + số, hạt điện tích chạy trong dây, tia lửa, sai số đo.
window.NL = window.NL || {};
NL.phys = (function () {
  // nhiễu Gauss (Box–Muller)
  function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  // giá trị đo: thật + nhiễu tỉ lệ, làm tròn theo độ chia nhỏ nhất
  function measure(v, rel, dc) { const m = v + gauss() * rel * Math.abs(v); return Math.round(m / dc) * dc; }
  const vn = (v, d) => (d === undefined ? String(v) : (+v).toFixed(d)).replace('.', ',');

  // Đồng hồ kim có mặt số và ô số. o: { label, unit, max, min (mặc định 0), r, d (số lẻ) }
  function meter(api, parent, x, y, o) {
    const el = api.el, g = api.g(parent, x, y), r = o.r || 58, min = o.min || 0, max = o.max;
    el('rect', { x: -r - 12, y: -r - 14, width: 2 * r + 24, height: 1.3 * r + 50, rx: 16, fill: '#F7F9FB', stroke: '#4A5A6A', 'stroke-width': 4 }, g);
    el('path', { d: `M ${-r * 0.92} 0 A ${r * 0.92} ${r * 0.92} 0 0 1 ${r * 0.92} 0`, fill: 'none', stroke: '#C9D8E6', 'stroke-width': 3 }, g);
    for (let k = 0; k <= 10; k++) {
      const a = Math.PI * (1 - k / 10), c = Math.cos(a), s = Math.sin(a), L = k % 5 ? 7 : 13;
      el('line', { x1: c * r * 0.92, y1: -s * r * 0.92, x2: c * (r * 0.92 - L), y2: -s * (r * 0.92 - L), stroke: '#1F4E79', 'stroke-width': k % 5 ? 1.5 : 2.5 }, g);
      if (k % 10 === 0) api.text(g, c * (r * 0.92 - 24), -s * (r * 0.92 - 24) + 5, vn(+(min + (max - min) * k / 10).toFixed(2)), 11, '#6C88A3', 700);
    }
    if (o.danger !== undefined) { const a = Math.PI * (1 - (o.danger - min) / (max - min)); el('path', { d: `M ${Math.cos(a) * r * 0.92} ${-Math.sin(a) * r * 0.92} A ${r * 0.92} ${r * 0.92} 0 0 1 ${r * 0.92} 0`, fill: 'none', stroke: '#E5534B', 'stroke-width': 5 }, g); }
    api.text(g, 0, -r * 0.32, o.sym || '', 22, '#1F4E79', 800);
    const nd = el('line', { x1: 0, y1: 0, x2: 0, y2: -r * 0.85, stroke: '#E5534B', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
    el('circle', { r: 6, fill: '#4A5A6A' }, g);
    el('rect', { x: -r * 0.75, y: 12, width: r * 1.5, height: 28, rx: 6, fill: '#1B2833' }, g);
    const num = api.text(g, 0, 33, '0', 18, '#7CF29B', 800);
    api.text(g, 0, -r - 22, o.label || '', 14, '#6C88A3', 800);
    let shown = 0, target = 0;
    g.set = (v, txt) => { target = v; num.textContent = txt !== undefined ? txt : vn(v, o.d === undefined ? 2 : o.d) + ' ' + (o.unit || ''); };
    api.loop(dt => {
      shown += (target - shown) * Math.min(1, dt * 9);
      const k = Math.max(-0.04, Math.min(1.04, (shown - min) / (max - min)));
      nd.setAttribute('transform', `rotate(${-90 + k * 180})`);
    });
    return g;
  }

  // Hạt sáng chạy dọc một đường path (dòng điện). flow.speed(px/s); âm thì chạy ngược
  function flow(api, parent, d, n, color) {
    const el = api.el, g = el('g', {}, parent);
    const p = el('path', { d, fill: 'none', stroke: 'none' }, g);
    let L = p.getTotalLength(), sp = 0, off = 0;
    const dots = Array.from({ length: n }, () => el('circle', { r: 4, fill: color || '#4FE3FF', opacity: .9 }, g));
    function draw() { dots.forEach((c, k) => { const s = ((off + k * L / n) % L + L) % L, q = p.getPointAtLength(s); c.setAttribute('cx', q.x); c.setAttribute('cy', q.y); }); }
    draw();
    api.loop(dt => { if (sp) { off += sp * dt; draw(); } });
    return { g, speed(v) { sp = v; }, path(dd) { p.setAttribute('d', dd); L = p.getTotalLength(); draw(); }, show(on) { g.style.display = on ? '' : 'none'; } };
  }

  // Tia lửa bắn ra ở (x,y)
  function spark(api, parent, x, y, n) {
    const el = api.el, g = el('g', {}, parent);
    const ps = Array.from({ length: n || 18 }, () => ({ a: Math.random() * Math.PI * 2, v: 120 + Math.random() * 220, c: el('circle', { r: 3 + Math.random() * 3, fill: Math.random() < 0.5 ? '#FFC93C' : '#FF8A3D' }, g) }));
    let t = 0; NL.audio.play('zap');
    api.loop(dt => {
      t += dt;
      ps.forEach(p => { p.c.setAttribute('cx', x + Math.cos(p.a) * p.v * t); p.c.setAttribute('cy', y + Math.sin(p.a) * p.v * t + 300 * t * t); p.c.setAttribute('opacity', Math.max(0, 1 - t * 1.6)); });
      if (t > 0.7) { g.remove(); return false; }
    });
  }
  // khói xám bốc lên
  function smoke(api, parent, x, y) {
    const el = api.el, g = el('g', {}, parent);
    const ps = Array.from({ length: 8 }, (_, k) => ({ d: k * 0.12, dx: (Math.random() - 0.5) * 30, c: el('circle', { r: 8, fill: '#7A8691', opacity: 0 }, g) }));
    let t = 0;
    api.loop(dt => {
      t += dt;
      ps.forEach(p => { const u = t - p.d; if (u < 0) return; p.c.setAttribute('cx', x + p.dx * u); p.c.setAttribute('cy', y - 70 * u); p.c.setAttribute('r', 8 + 18 * u); p.c.setAttribute('opacity', Math.max(0, 0.5 - u * 0.3)); });
      if (t > 2.6) { g.remove(); return false; }
    });
  }
  // viền đỏ nhấp nháy quanh khung thí nghiệm
  function alarm(api) {
    const r = api.el('rect', { x: 4, y: 4, width: 992, height: 552, rx: 18, fill: 'none', stroke: '#E5534B', 'stroke-width': 10 }, api.svg);
    let t = 0; NL.audio.play('alarm');
    api.loop(dt => { t += dt; r.setAttribute('opacity', 0.5 + 0.5 * Math.sin(t * 18)); if (t > 1.4) { r.remove(); return false; } });
  }
  // nút ghi số liệu ở cột phải
  function recButton(api, label, cb) {
    const d = api.panel(`<button class="btn pop">${label || '📌 Ghi số liệu'}</button>`);
    d.querySelector('button').addEventListener('click', () => { NL.audio.play('drop'); cb(); });
    return d;
  }
  // khớp đường thẳng qua gốc y = kx (bình phương tối thiểu)
  function fitK(pts) { let a = 0, b = 0; pts.forEach(([x, y]) => { a += x * y; b += x * x; }); return b ? a / b : 0; }

  // Nhãn đếm số lần đo: không vượt tổng, quá yêu cầu thì ghi "6 điểm (đủ 5)"
  function cnt(n, need, unit) { return n > need ? `${n} ${unit} (đủ ${need})` : `${n}/${need} ${unit}`; }
  return { gauss, measure, vn, meter, flow, spark, smoke, alarm, recButton, fitK, cnt };
})();
