// Thí nghiệm 2J: quần thể bướm đêm, tần số allele qua các thế hệ dưới tác động của các nhân tố tiến hóa.
(function () {
  const COL = { AA: '#2B2B2B', Aa: '#8A8A8A', aa: '#F1ECDD' };
  const TRUNK = { x: 70, y: 70, w: 520, h: 380 };
  const MOTHS = 36;
  let st;

  function binom(n, p) {
    if (n * p * (1 - p) > 30) { // xấp xỉ chuẩn khi n lớn
      const z = Math.sqrt(-2 * Math.log(Math.random() || 1e-9)) * Math.cos(2 * Math.PI * Math.random());
      return Math.max(0, Math.min(n, Math.round(n * p + z * Math.sqrt(n * p * (1 - p)))));
    }
    let k = 0; for (let i = 0; i < n; i++) if (Math.random() < p) k++; return k;
  }
  function multi(n, f) { const a = binom(n, f[0]), b = binom(n - a, f[1] / Math.max(1e-9, f[1] + f[2])); return [a, b, n - a - b]; }

  // một thế hệ: giao phối → chọn lọc → đột biến → di nhập gene → biến động di truyền
  function nextGen(s, P) {
    let f;
    if (P.mating === 'self') f = [s.f[0] + s.f[1] / 4, s.f[1] / 2, s.f[2] + s.f[1] / 4];
    else { const p = s.p, q = 1 - p, F = P.mating === 'inbred' ? P.F : 0; f = [p * p + F * p * q, 2 * p * q * (1 - F), q * q + F * p * q]; }
    const w = [P.wAA, P.wAa, P.waa], wbar = f[0] * w[0] + f[1] * w[1] + f[2] * w[2] || 1e-9;
    let fs = f.map((x, i) => x * w[i] / wbar);
    let p = fs[0] + fs[1] / 2;
    const p2 = p - P.u * p + P.v * (1 - p);
    const p3 = (1 - P.m) * p2 + P.m * P.pm;
    // giữ thành phần kiểu gene (cho tự phối), chỉnh theo p mới
    if (p > 0 && p < 1) { const r = p3 / p, r2 = (1 - p3) / (1 - p); fs = [fs[0] * r, fs[1] * (r + r2) / 2, fs[2] * r2]; const t = fs[0] + fs[1] + fs[2]; fs = fs.map(x => x / t); }
    let obs;
    if (P.N < 10000) { obs = multi(P.N, fs).map(c => c / P.N); }
    else obs = fs;
    return { p: obs[0] + obs[1] / 2, f: obs };
  }

  function stats(g, N) {
    const p = g.p, q = 1 - p, e = [p * p, 2 * p * q, q * q];
    const mae = (Math.abs(g.f[0] - e[0]) + Math.abs(g.f[1] - e[1]) + Math.abs(g.f[2] - e[2])) / 3;
    let chi = 0; e.forEach((x, i) => { if (x > 1e-9) chi += Math.pow(g.f[i] * N - x * N, 2) / (x * N); });
    return { e, mae, chi };
  }

  function moth(api, parent, x, y) {
    const g = api.g(parent, x, y), el = api.el;
    g.wing = el('path', { d: 'M0 -4 L-17 8 L-6 9 L0 3 L6 9 L17 8 Z', stroke: '#555', 'stroke-width': 0.8 }, g);
    g.vein = el('path', { d: 'M-12 6 l3 -2 l3 2 l3 -2 M3 4 l3 -2 l3 2 l3 -2', stroke: 'rgba(0,0,0,.35)', 'stroke-width': 0.8, fill: 'none' }, g);
    el('ellipse', { cx: 0, cy: 2, rx: 2, ry: 7, fill: '#3A3A3A' }, g);
    el('path', { d: 'M-1 -4 q-4 -6 -7 -6 M1 -4 q4 -6 7 -6', stroke: '#3A3A3A', 'stroke-width': 0.8, fill: 'none' }, g);
    g.setAttribute('transform', `translate(${x},${y}) rotate(${Math.random() * 40 - 20}) scale(1.25)`);
    return g;
  }

  function build(api) {
    const L = api.svg, el = api.el;
    st = { runs: [], P: { N: 1000, p0: 0.5, mating: 'random', F: 0.5, wAA: 1, wAa: 1, waa: 1, u: 0, v: 0, m: 0, pm: 0.5, gens: 50 } };
    const tr = TRUNK;
    st.bark = el('rect', { x: tr.x, y: tr.y, width: tr.w, height: tr.h, rx: 30, fill: '#B9A584' }, L);
    for (let k = 0; k < 14; k++) el('path', { d: `M${tr.x + 20 + k * 37} ${tr.y + 10} q${10 - Math.random() * 20} ${tr.h / 2} 0 ${tr.h - 20}`, stroke: 'rgba(90,70,40,.35)', 'stroke-width': 3, fill: 'none' }, L);
    st.mothG = api.g(L, 0, 0);
    st.moths = [];
    for (let i = 0; i < MOTHS; i++) st.moths.push(moth(api, st.mothG, tr.x + 30 + Math.random() * (tr.w - 60), tr.y + 30 + Math.random() * (tr.h - 60)));
    st.bird = api.text(L, -200, 120, '🐦', 40, '#000', 800);
    st.genTxt = api.text(L, tr.x + tr.w / 2, tr.y + tr.h + 34, 'Thế hệ F₀', 18, '#1F4E79', 800);
    const lg = api.g(L, 0, 0);
    [['AA', 'đen'], ['Aa', 'xám'], ['aa', 'trắng']].forEach(([k, t], i) => {
      el('rect', { x: tr.x + 40 + i * 170, y: tr.y + tr.h + 52, width: 18, height: 14, rx: 3, fill: COL[k], stroke: '#555' }, lg);
      api.text(lg, tr.x + 90 + i * 170, tr.y + tr.h + 64, `${k}: bướm ${t}`, 13, '#6C88A3', 700);
    });
    api.text(lg, tr.x + tr.w / 2, tr.y + tr.h + 86, 'Giả định trội không hoàn toàn để nhìn thấy cả 3 kiểu gene (bướm bạch dương thật: allele đen trội)', 11, '#8A9AAD', 600);
    colorMoths([0.25, 0.5, 0.25]);
  }

  function colorMoths(f) {
    st.moths.forEach(m => {
      const r = Math.random(), k = r < f[0] ? 'AA' : r < f[0] + f[1] ? 'Aa' : 'aa';
      m.wing.setAttribute('fill', COL[k]); m.k = k;
    });
  }
  function bird(api, prey) {
    const target = st.moths.find(m => m.k === prey);
    if (!target) return;
    const tx = +target.getAttribute('transform').match(/translate\(([\d.]+),([\d.]+)\)/)[1], ty = +RegExp.$2;
    st.bird.setAttribute('x', tx - 140); st.bird.setAttribute('y', ty - 60);
    let k = 0;
    api.loop(dt => {
      k += dt * 2.2;
      st.bird.setAttribute('x', tx - 140 + 140 * Math.min(1, k) + Math.max(0, k - 1) * 260);
      st.bird.setAttribute('y', ty - 60 + 60 * Math.sin(Math.min(1, k) * Math.PI / 2) - Math.max(0, k - 1) * 120);
      if (k >= 1 && target.style.opacity !== '0') { target.style.opacity = 0; NL.audio.play('pop'); setTimeout(() => { target.style.opacity = 1; }, 600); }
      if (k > 2) { st.bird.setAttribute('x', -200); return false; }
    });
  }

  function paramPanel(api) {
    const P = st.P, card = api.panel('', 'slider-card cond-card');
    const seg = (key, items) => `<div class="seg">${items.map(([v, t]) => `<button class="seg-b pop ${String(P[key]) === String(v) ? 'on' : ''}" data-k="${key}" data-v="${v}">${t}</button>`).join('')}</div>`;
    const rng = (key, lab, min, max, step) => `<div class="cond-row"><span>${lab} <b>${P[key]}</b></span><input type="range" min="${min}" max="${max}" step="${step}" value="${P[key]}" data-r="${key}"></div>`;
    const draw = () => {
      card.innerHTML = `<div class="cond-row"><span>Số cá thể N</span>${seg('N', [[20, '20'], [100, '100'], [1000, '1000'], [10000, '10000']])}</div>`
        + rng('p0', 'Tần số A ban đầu p₀ =', 0, 1, 0.05)
        + `<div class="cond-row"><span>Giao phối</span>${seg('mating', [['random', 'Ngẫu phối'], ['inbred', 'Giao phối gần'], ['self', 'Tự phối']])}</div>`
        + (P.mating === 'inbred' ? rng('F', 'Hệ số nội phối F =', 0, 1, 0.05) : '')
        + `<div class="cond-row"><span>Giá trị thích nghi (chim ăn bướm)</span></div>` + rng('wAA', 'w(AA) đen =', 0, 1, 0.05) + rng('wAa', 'w(Aa) xám =', 0, 1, 0.05) + rng('waa', 'w(aa) trắng =', 0, 1, 0.05)
        + `<div class="cond-row"><span>Đột biến A→a (u) và a→A (v)</span>${seg('u', [[0, 'u = 0'], [0.0001, '10⁻⁴'], [0.001, '10⁻³']])}${seg('v', [[0, 'v = 0'], [0.0001, '10⁻⁴'], [0.001, '10⁻³']])}</div>`
        + rng('m', 'Di nhập gene m =', 0, 0.5, 0.05) + (P.m > 0 ? rng('pm', 'Tần số A nơi đến p(m) =', 0, 1, 0.05) : '')
        + `<div class="cond-row"><span>Số thế hệ</span>${seg('gens', [[10, '10'], [50, '50'], [100, '100'], [500, '500']])}</div>`;
      card.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
        NL.audio.play('click'); const k = b.dataset.k, v = b.dataset.v; P[k] = isNaN(+v) ? v : +v; draw();
        if (k === 'mating' && v === 'self') api.card({ kicker: '🔬 Giải thích khoa học', text: 'Tự phối qua các thế hệ làm bướm xám Aa giảm đi một nửa sau mỗi thế hệ, bướm đen AA và bướm trắng aa tăng lên.', sub: 'Quần thể sẽ lệch khỏi cân bằng Hardy–Weinberg (χ² vượt ngưỡng).' });
      });
      card.querySelectorAll('[data-r]').forEach(r => {
        r.oninput = () => { P[r.dataset.r] = +r.value; r.previousElementSibling.querySelector('b').textContent = r.value; };
        r.onchange = draw;
      });
    };
    draw();
  }

  function liveCard(api) {
    if (!st.live || !st.live.isConnected) st.live = api.panel('', 'data-card');
    return st.live;
  }
  function showLive(api, g, s, gen) {
    const c = liveCard(api), ok = s.chi <= 3.841;
    c.innerHTML = `<table><tr><th></th><th>Thực tế</th><th>HW</th></tr>
      <tr><td>p(A)</td><td>${g.p.toFixed(3)}</td><td></td></tr>
      <tr><td>AA đen</td><td>${g.f[0].toFixed(3)}</td><td>${s.e[0].toFixed(3)}</td></tr>
      <tr><td>Aa xám</td><td>${g.f[1].toFixed(3)}</td><td>${s.e[1].toFixed(3)}</td></tr>
      <tr><td>aa trắng</td><td>${g.f[2].toFixed(3)}</td><td>${s.e[2].toFixed(3)}</td></tr>
      <tr><td>χ²</td><td>${s.chi.toFixed(2)}</td><td style="color:${ok ? 'var(--ok)' : 'var(--red)'}">${ok ? 'Chưa thấy lệch HW' : 'Lệch HW'}</td></tr></table>`;
    st.genTxt.textContent = 'Thế hệ F' + gen;
  }

  function runSim(api) {
    const P = Object.assign({}, st.P), run = { P, hist: [] };
    let g = { p: P.p0, f: [P.p0 * P.p0, 2 * P.p0 * (1 - P.p0), (1 - P.p0) * (1 - P.p0)] };
    run.hist.push({ gen: 0, g, s: stats(g, P.N) });
    showLive(api, g, run.hist[0].s, 0); colorMoths(g.f);
    const ctl = api.panel('<button class="btn small pop" id="pgPause">⏸ Tạm dừng</button><button class="btn small pop" id="pgStep">+1 thế hệ</button>', 'slider-card');
    let paused = false, acc = 0, gen = 0, birdT = 0, fixedTold = false;
    const perSec = Math.max(8, P.gens / 6);
    const step = () => {
      gen++; g = nextGen(g, P); const s = stats(g, P.N); run.hist.push({ gen, g, s });
      if ((g.p <= 0 || g.p >= 1) && !fixedTold && P.N < 1000 && P.wAA === P.waa && P.wAA === P.wAa) {
        fixedTold = true; NL.audio.play('unlock');
        api.card({ kicker: '🔬 Giải thích khoa học', text: `Quần thể nhỏ (N = ${P.N}): yếu tố ngẫu nhiên đã làm allele ${g.p >= 1 ? 'a' : 'A'} mất hẳn ở thế hệ ${gen}, dù không có chọn lọc.`, sub: 'Đó là biến động di truyền (phiêu bạt di truyền).' });
      }
      return s;
    };
    ctl.querySelector('#pgPause').onclick = () => { paused = !paused; ctl.querySelector('#pgPause').textContent = paused ? '▶ Chạy tiếp' : '⏸ Tạm dừng'; };
    ctl.querySelector('#pgStep').onclick = () => { if (!paused) { paused = true; ctl.querySelector('#pgPause').textContent = '▶ Chạy tiếp'; } if (gen < P.gens) { const s = step(); showLive(api, g, s, gen); colorMoths(g.f); } };
    api.say('Đang chạy qua các thế hệ…');
    api.loop(dt => {
      if (gen >= P.gens) {
        ctl.remove(); st.runs.push(run); NL.audio.play('ting'); api.goto(2); return false;
      }
      if (paused) return;
      acc += dt * perSec; let s;
      while (acc >= 1 && gen < P.gens) { acc -= 1; s = step(); }
      if (s) { showLive(api, g, s, gen); colorMoths(g.f); }
      birdT += dt;
      const minW = Math.min(P.wAA, P.wAa, P.waa);
      if (minW < 1 && birdT > 1.6) { birdT = 0; bird(api, P.waa === minW ? 'aa' : P.wAA === minW ? 'AA' : 'Aa'); }
    });
  }

  const steps = [
    {
      label: () => `Lần chạy ${st.runs.length + 1}/3 · Cài đặt`, text: 'Chọn các nhân tố tác động lên quần thể bướm', hint: 'Lần 1 thử để mặc định. Lần 2 thử chọn lọc hoặc tự phối. Lần 3 thử N = 20',
      enter(api) {
        if (!st.runs.length && !api.prediction) api.ask({
          predict: true, q: 'Quần thể lớn, ngẫu phối, không có chọn lọc, đột biến hay di nhập gene. Qua 50 thế hệ, tần số allele A sẽ…?',
          options: [{ t: 'Gần như không đổi' }, { t: 'Tăng dần' }, { t: 'Giảm dần' }]
        });
        paramPanel(api);
        api.done('Chạy ▶');
      },
      onNext(api) { api.goto(1); }
    },
    {
      label: () => `Lần chạy ${st.runs.length + 1}/3 · Đang chạy`, text: 'Đang chạy qua các thế hệ…', hint: 'Bấm +1 thế hệ để dừng lại xem từng bước',
      enter(api) { runSim(api); }
    },
    {
      label: () => `Lần chạy ${st.runs.length}/3 · xong`, text: '', hint: 'Bấm nút ở góc dưới để đi tiếp',
      enter(api) {
        const r = st.runs[st.runs.length - 1], last = r.hist[r.hist.length - 1];
        showLive(api, last.g, last.s, last.gen);
        const need = 3 - st.runs.length;
        api.say(`p(A): ${r.P.p0} → ${last.g.p.toFixed(2)} sau ${r.P.gens} thế hệ. ` + (need > 0 ? `Chạy thêm ${need} lần với nhân tố khác` : 'Đủ 3 lần chạy!'));
        api.done(need > 0 ? 'Chạy lần nữa ➜' : 'Xem đồ thị ➜');
      },
      onNext(api) { api.goto(st.runs.length < 3 ? 0 : 3); }
    },
    {
      label: 'Kết quả', text: 'Tần số allele A qua các thế hệ', hint: 'Đường phẳng: quần thể cân bằng. Đường đi lên hoặc xuống: có nhân tố tiến hóa',
      enter(api) { api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Gần như không đổi', truth: 'khi không có nhân tố tiến hóa, tần số allele giữ nguyên qua các thế hệ (cân bằng Hardy–Weinberg).',
          sub: 'Chọn lọc, đột biến, di nhập gene, giao phối không ngẫu nhiên và yếu tố ngẫu nhiên làm quần thể thay đổi.',
          quiz: QUIZ, bank: 4, result: result()
        });
      }
    }
  ];

  function desc(P) {
    const a = [];
    if (P.N < 1000) a.push('N=' + P.N);
    if (P.mating !== 'random') a.push(P.mating === 'self' ? 'tự phối' : 'giao phối gần F=' + P.F);
    if (P.wAA < 1 || P.wAa < 1 || P.waa < 1) a.push(`w=${P.wAA}/${P.wAa}/${P.waa}`);
    if (P.u || P.v) a.push('đột biến');
    if (P.m) a.push('di nhập m=' + P.m);
    return a.join(', ') || 'không nhân tố';
  }
  function result() {
    const PAL = ['#2F80C0', '#E5534B', '#3FB37F'];
    const rows = [];
    st.runs.forEach((r, i) => {
      const every = Math.max(1, Math.round(r.P.gens / 10));
      r.hist.filter(h => h.gen % every === 0 || h.gen === r.P.gens).forEach(h => rows.push([i + 1, desc(r.P), 'F' + h.gen, h.g.p.toFixed(3), (1 - h.g.p).toFixed(3),
        `${h.g.f[0].toFixed(3)} / ${h.s.e[0].toFixed(3)}`, `${h.g.f[1].toFixed(3)} / ${h.s.e[1].toFixed(3)}`, `${h.g.f[2].toFixed(3)} / ${h.s.e[2].toFixed(3)}`, h.s.mae.toFixed(4), h.s.chi.toFixed(2)]));
    });
    const maxG = Math.max(...st.runs.map(r => r.P.gens));
    return {
      title: 'Tần số allele trong quần thể bướm đêm', param: st.runs.map((r, i) => `Lần ${i + 1}: ${desc(r.P)}`).join('; '),
      table: { head: ['Lần', 'Nhân tố', 'Thế hệ', 'p(A)', 'q(a)', 'AA thực tế / HW', 'Aa thực tế / HW', 'aa thực tế / HW', 'MAE', 'χ²'], rows },
      chart: {
        type: 'line', xLabel: 'Thế hệ', yLabel: 'Tần số allele A', xMax: maxG, yMax: 1,
        series: st.runs.map((r, i) => ({ name: `Lần ${i + 1}`, color: PAL[i], points: r.hist.filter((h, k) => r.hist.length < 120 || k % Math.ceil(r.hist.length / 120) === 0).map(h => [h.gen, +h.g.p.toFixed(3)]) }))
      },
      conclusion: 'Quần thể lớn, ngẫu phối, không chịu tác động của nhân tố tiến hóa thì tần số allele và thành phần kiểu gene giữ ổn định (p² : 2pq : q²). Chọn lọc, đột biến, di nhập gene, giao phối không ngẫu nhiên và yếu tố ngẫu nhiên làm thay đổi cấu trúc di truyền của quần thể',
      note: 'Tự phối và giao phối gần làm tăng đồng hợp, giảm dị hợp nhưng không đổi tần số allele. Quần thể càng nhỏ, yếu tố ngẫu nhiên càng mạnh.'
    };
  }

  const QUIZ = [
    {
      kicker: '❓ Vì sao?', q: 'Khi cây bị bám bụi than đen, chim dễ thấy bướm trắng hơn. Tần số allele A (cánh đen) sẽ thế nào?',
      options: [
        { t: 'Tăng dần vì bướm đen sống sót và sinh sản nhiều hơn', ok: true },
        { t: 'Giảm dần vì bướm đen bị ăn nhiều hơn', why: 'Trên nền thân cây đen, bướm nào khó bị chim phát hiện hơn?' },
        { t: 'Không đổi vì bướm không tự đổi màu được', why: 'Đúng là từng con không đổi màu, nhưng chọn lọc làm tỉ lệ các loại bướm trong quần thể thay đổi.' }
      ],
      explain: 'Chọn lọc tự nhiên giữ lại kiểu hình thích nghi với môi trường, nên tần số allele có lợi tăng dần qua các thế hệ.'
    }
  ];

  NL.lab.register('2J', { goal: 'Điều gì làm quần thể bướm thay đổi qua các thế hệ?', clearSide: true, build, steps });
})();
