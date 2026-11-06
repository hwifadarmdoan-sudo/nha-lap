// Thí nghiệm 2D: lai đậu Hà Lan 1 và 2 cặp tính trạng, đếm đời con, kiểm định χ².
(function () {
  const CROSS = {
    1: ['Aa × Aa', 'Aa × aa', 'AA × aa', 'AA × Aa'],
    2: ['AaBb × AaBb', 'AaBb × aabb', 'AABb × AaBb']
  };
  const NS = [10, 50, 100, 500, 1000, 5000, 10000];
  const CRIT = { 1: 3.841, 2: 5.991, 3: 7.815 };
  const YEL = '#F2C94C', GRN = '#7CC36E';
  let st;

  // ---------- di truyền ----------
  const pairs = g => g.match(/[A-Za-z]{2}/g);
  const canon = p => p[0] < p[1] ? p : p[1] + p[0]; // chữ hoa đứng trước
  function gametes(g) { // mọi giao tử, xác suất bằng nhau
    return pairs(g).reduce((acc, p) => acc.flatMap(x => [x + p[0], x + p[1]]), ['']);
  }
  function child(g1, g2) {
    const p1 = pairs(g1), p2 = pairs(g2);
    return p1.map((p, i) => canon(p[Math.random() < 0.5 ? 0 : 1] + p2[i][Math.random() < 0.5 ? 0 : 1])).join('');
  }
  function pheno(g) {
    const p = pairs(g), seed = p[0].includes('A') ? 'Vàng' : 'Xanh';
    return p.length === 1 ? seed : seed + '-' + (p[1].includes('B') ? 'trơn' : 'nhăn');
  }
  const PH = { 1: ['Vàng', 'Xanh'], 2: ['Vàng-trơn', 'Vàng-nhăn', 'Xanh-trơn', 'Xanh-nhăn'] };
  function expected(cross) {
    const [g1, g2] = cross.split(' × '), ga = gametes(g1), gb = gametes(g2), ph = {}, gt = {};
    ga.forEach(a => gb.forEach(b => {
      const g = a.split('').map((x, i) => canon(x + b[i])).join('');
      // ghép lại theo cặp: a = "AB", b = "ab" → "AaBb"
      const pr = pheno(g), w = 1 / (ga.length * gb.length);
      ph[pr] = (ph[pr] || 0) + w; gt[g] = (gt[g] || 0) + w;
    }));
    return { ph, gt };
  }
  function run(cross, N) {
    const [g1, g2] = cross.split(' × '), ph = {}, gt = {};
    for (let i = 0; i < N; i++) { const g = child(g1, g2), pr = pheno(g); ph[pr] = (ph[pr] || 0) + 1; gt[g] = (gt[g] || 0) + 1; }
    return { ph, gt };
  }
  const ratio = (cls, obs) => {
    const vals = cls.map(c => obs[c] || 0), min = Math.min(...vals.filter(v => v > 0));
    return vals.map(v => NL.fmt(+(v / min).toFixed(2), 2).replace(/,?0+$/, '')).join(' : ');
  };

  // ---------- hình vẽ ----------
  function seed(api, parent, x, y, r, ph) {
    const yel = ph.startsWith('Vàng'), wr = ph.endsWith('nhăn');
    const c = api.el('circle', { cx: x, cy: y, r, fill: yel ? YEL : GRN, stroke: yel ? '#C99A1E' : '#4E9A45', 'stroke-width': 1.5 }, parent);
    if (wr) api.el('path', { d: `M${x - r * .6} ${y} q${r * .3} ${-r * .5} ${r * .6} 0 q${r * .3} ${r * .5} ${r * .6} 0`, stroke: yel ? '#B08518' : '#3F7F38', 'stroke-width': 1.5, fill: 'none' }, parent);
    return c;
  }
  // Hoa đậu Hà Lan dạng cánh bướm: cánh cờ (to, phía sau), hai cánh bên, cánh thìa ôm nhị và nhụy; có bản hoa tím và hoa trắng
  function peaFlower(api, parent, color) {
    const el = api.el, fl = api.g(parent, 0, 0), purple = color === 'purple';
    const std = purple ? '#B06BD6' : '#F6F2FF', stdS = purple ? '#7E3FA8' : '#C9B8E0', wing = purple ? '#8E44AD' : '#EFE9FF', keel = purple ? '#E9D5F5' : '#FFFFFF';
    el('path', { d: 'M0 -4 C -26 -8, -30 -36, -16 -46 C -8 -52, 8 -52, 16 -46 C 30 -36, 26 -8, 0 -4 Z', fill: std, stroke: stdS, 'stroke-width': 1.5 }, fl); // cánh cờ
    el('path', { d: 'M0 -8 C -4 -22, -2 -34, 0 -44', stroke: stdS, 'stroke-width': 1, fill: 'none', opacity: .6 }, fl);
    el('path', { d: 'M-2 -2 C -22 -4, -30 12, -20 22 C -12 28, -4 18, -2 -2 Z', fill: wing, stroke: stdS, 'stroke-width': 1.3 }, fl); // cánh bên trái
    el('path', { d: 'M2 -2 C 22 -4, 30 12, 20 22 C 12 28, 4 18, 2 -2 Z', fill: wing, stroke: stdS, 'stroke-width': 1.3 }, fl); // cánh bên phải
    el('path', { d: 'M-8 -2 C -12 10, -6 24, 4 26 C 12 24, 14 12, 8 -2 Z', fill: keel, stroke: stdS, 'stroke-width': 1.3 }, fl); // cánh thìa ôm nhị, nhụy
    fl.stamens = api.g(fl, 0, 0);
    [-3, 0, 3].forEach(x => { el('line', { x1: x, y1: 10, x2: x * 1.4, y2: 0, stroke: '#D9C27A', 'stroke-width': 1 }, fl.stamens); el('circle', { cx: x * 1.4, cy: 0, r: 1.6, fill: '#F2C94C' }, fl.stamens); });
    el('line', { x1: 0, y1: 12, x2: 0, y2: -1, stroke: '#7FBF7F', 'stroke-width': 1.3 }, fl); el('circle', { cx: 0, cy: -2, r: 1.8, fill: '#6DB36D' }, fl); // nhụy
    el('path', { d: 'M-7 18 L0 30 L7 18 Z', fill: '#6DB36D' }, fl); // đài
    el('path', { d: 'M0 30 C 2 40, -2 48, 0 56', stroke: '#3D9A5B', 'stroke-width': 2, fill: 'none' }, fl); // cuống
    return fl;
  }
  function plant(api, x, who, color) {
    const g = api.g(api.svg, x, 0), el = api.el;
    el('path', { d: 'M-34 400 L34 400 L26 452 L-26 452 Z', fill: '#C9714A' }, g);
    el('rect', { x: -38, y: 392, width: 76, height: 14, rx: 5, fill: '#B5603C' }, g);
    el('path', { d: 'M0 395 C -6 330, 8 280, 0 210', stroke: '#3D9A5B', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, g);
    // lá kép có tua cuốn, lá kèm to
    [[-1, 350], [1, 320], [-1, 285], [1, 250]].forEach(([s, y]) => {
      el('path', { d: `M0 ${y} C ${s * 14} ${y - 4}, ${s * 26} ${y - 2}, ${s * 40} ${y}`, stroke: '#3D9A5B', 'stroke-width': 2.5, fill: 'none' }, g);
      [0.35, 0.7].forEach(k => el('ellipse', { cx: s * 40 * k, cy: y - 2, rx: 11, ry: 6.5, fill: '#58C08A', stroke: '#3D9A5B', 'stroke-width': 1, transform: `rotate(${s * -22} ${s * 40 * k} ${y - 2})` }, g));
      el('path', { d: `M${s * 40} ${y} q${s * 8} -4 ${s * 10} 2 q-2 6 ${s * -6} 4`, stroke: '#3D9A5B', 'stroke-width': 1.3, fill: 'none' }, g); // tua cuốn
    });
    const fl = api.g(g, 0, 205); fl.stamens = peaFlower(api, fl, color || 'purple').stamens;
    const bud = api.g(g, -14, 232); // nụ
    el('path', { d: 'M0 0 C -5 -8, -3 -18, 0 -22 C 3 -18, 5 -8, 0 0 Z', fill: color === 'white' ? '#F6F2FF' : '#C48BE0', stroke: '#6DB36D', 'stroke-width': 1.2 }, bud);
    el('path', { d: 'M0 0 C 4 4, 8 2, 12 -2', stroke: '#3D9A5B', 'stroke-width': 1.5, fill: 'none' }, bud);
    g.pod = api.g(g, 30, 300);
    g.lab = api.text(g, 0, 478, '', 16, '#1F4E79', 800);
    api.text(g, 0, 500, who, 13, '#6C88A3', 700);
    g.flower = fl;
    return g;
  }
  // Quả đậu tách vỏ: hai mảnh vỏ mở ra, hạt gắn vào mép vỏ bằng cuống nhỏ; màu và hình dạng hạt theo kiểu gene
  function drawPod(api, p, geno) {
    p.pod.innerHTML = '';
    const el = api.el;
    el('path', { d: 'M0 0 C 18 -14, 50 -12, 66 2 C 50 8, 18 10, 0 0 Z', fill: '#79BF72', stroke: '#4E9A45', 'stroke-width': 2 }, p.pod); // mảnh vỏ sau
    el('path', { d: 'M0 0 C 16 16, 48 20, 66 2 C 50 26, 16 28, 0 0 Z', fill: '#9BD894', stroke: '#4E9A45', 'stroke-width': 2 }, p.pod); // mảnh vỏ trước mở ra
    el('path', { d: 'M0 0 L-8 -3', stroke: '#4E9A45', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, p.pod);
    [14, 30, 46].forEach(x => { el('line', { x1: x, y1: 2, x2: x, y2: 8, stroke: '#4E9A45', 'stroke-width': 1.5 }, p.pod); seed(api, p.pod, x, 12, 6, pheno(geno)); });
    p.lab.textContent = geno + ' · ' + pheno(geno).toLowerCase();
  }

  function build(api) {
    const L = api.svg, el = api.el;
    st = { mode: 1, cross: 'Aa × Aa', N: 100, runs: [], pollinated: false };
    st.p1 = plant(api, 130, 'Cây mẹ (P₁)', 'purple');
    st.p2 = plant(api, 420, 'Cây bố (P₂)', 'white');
    api.text(L, 275, 250, '×', 54, '#E5534B', 800);
    // cọ lông thụ phấn: cán gỗ, đai kim loại, đầu lông nâu
    st.brush = api.g(L, 275, 420);
    el('path', { d: 'M-4 -2 L-5 -70 L5 -70 L4 -2 Z', fill: '#C99A6B', stroke: '#8E6A3E', 'stroke-width': 1 }, st.brush);
    el('line', { x1: -1, y1: -8, x2: -2, y2: -64, stroke: '#E0B98A', 'stroke-width': 1.2 }, st.brush);
    el('rect', { x: -6, y: -84, width: 12, height: 16, rx: 2, fill: '#C0C8D0', stroke: '#8A949E', 'stroke-width': 1 }, st.brush);
    el('path', { d: 'M-6 -84 C -7 -96, -4 -104, 0 -108 C 4 -104, 7 -96, 6 -84 Z', fill: '#7A4B24' }, st.brush);
    [-3, 0, 3].forEach(x => el('line', { x1: x, y1: -86, x2: x * 0.4, y2: -104, stroke: '#A2693A', 'stroke-width': 1 }, st.brush));
    st.brushTip = el('circle', { cx: 0, cy: -106, r: 3.5, fill: '#F2C94C', opacity: 0 }, st.brush);
    api.text(L, 275, 440, 'Cọ thụ phấn', 13, '#6C88A3', 700);
    // khay hạt đời con
    st.tray = api.g(L, 0, 0);
    el('rect', { x: 40, y: 506, width: 560, height: 52, rx: 14, fill: '#FFFFFF', stroke: '#D5DEE8', 'stroke-width': 3 }, st.tray);
    st.seeds = api.g(st.tray, 0, 0);
    st.trayLab = api.text(st.tray, 530, 528, 'Khay hạt', 14, '#6C88A3', 800);
    st.trayLab2 = api.text(st.tray, 530, 546, 'đời con', 13, '#6C88A3', 700);
    setCross(api);
  }
  function setCross(api) {
    const [g1, g2] = st.cross.split(' × ');
    drawPod(api, st.p1, g1); drawPod(api, st.p2, g2);
  }

  function pourSeeds(api, obs, done) {
    st.seeds.innerHTML = '';
    const cls = PH[st.mode], total = st.N, show = Math.min(total, 120), list = [];
    cls.forEach(c => { const n = Math.round((obs[c] || 0) / total * show); for (let i = 0; i < n; i++) list.push(c); });
    list.sort(() => Math.random() - 0.5);
    let k = 0;
    NL.audio.play('bubble');
    api.loop(() => {
      for (let j = 0; j < 4 && k < list.length; j++, k++) {
        const col = k % 30, row = Math.floor(k / 30);
        seed(api, st.seeds, 58 + col * 13.4, 517 + row * 11, 5, list[k]);
      }
      if (k >= list.length) { done(); return false; }
    });
  }

  function chiSquare(r) {
    const cls = PH[st.mode].filter(c => r.exp.ph[c] > 0);
    const rows = cls.map(c => { const O = r.obs.ph[c] || 0, E = r.exp.ph[c] * r.N; return { c, O, E, part: (O - E) * (O - E) / E }; });
    const chi = rows.reduce((s, x) => s + x.part, 0), df = cls.length - 1;
    return { rows, chi, df, crit: CRIT[df], accept: df > 0 ? chi < CRIT[df] : true };
  }

  function historyRows() {
    return st.runs.map((r, i) => [i + 1, r.mode + ' cặp', r.cross, r.N, ratio(PH[r.mode].filter(c => r.exp.ph[c] > 0), r.obs.ph), r.cs.df ? r.cs.chi.toFixed(2) : '–', r.cs.df ? (r.cs.accept ? 'Chưa đủ cơ sở bác bỏ' : 'Bác bỏ') : 'Không cần']);
  }

  const steps = [
    {
      label: () => `Lần lai ${st.runs.length + 1}/3 · Chọn phép lai`, text: 'Chọn số cặp tính trạng và kiểu gene của cây bố mẹ', hint: 'A: hạt vàng, a: hạt xanh. B: hạt trơn, b: hạt nhăn',
      enter(api) {
        if (!st.runs.length && !api.prediction) api.ask({
          predict: true, q: 'Lai hai cây hạt vàng Aa × Aa. Đời con hạt vàng : hạt xanh khoảng bao nhiêu?',
          options: [{ t: '3 : 1' }, { t: '1 : 1' }, { t: 'Toàn hạt vàng' }]
        });
        let crossCtl;
        const mk = () => {
          if (crossCtl) crossCtl.remove();
          crossCtl = api.choices({ label: 'Kiểu gene P₁ × P₂', items: CROSS[st.mode].map(c => ({ t: c, v: c })), value: st.cross, onPick(v) { st.cross = v; setCross(api); } });
        };
        api.choices({
          label: 'Số cặp tính trạng', items: [{ t: '1 cặp (màu hạt)', v: 1 }, { t: '2 cặp (màu + hình dạng)', v: 2 }], value: st.mode,
          onPick(v) { st.mode = v; if (!CROSS[v].includes(st.cross)) st.cross = CROSS[v][0]; setCross(api); mk(); }
        });
        mk();
        if (st.runs.length) api.table(['Lần', 'P', 'N', 'Tỉ lệ', 'χ²', 'Kết luận']).set(historyRows().map(r => [r[0], r[2], r[3], r[4], r[5], r[6]]));
        api.done('Chọn xong ➜');
      },
      onNext(api) { api.goto(st.pollinated ? 2 : 1); }
    },
    {
      label: 'Thụ phấn',
      get text() { return ['Chạm hoa cây mẹ để khử nhị: cắt bỏ nhị khi hoa còn nụ, chưa kịp tự thụ phấn', 'Kéo cọ lấy phấn hoa cây bố, chấm lên đầu nhụy hoa cây mẹ', 'Chạm hoa cây mẹ để trùm túi giấy, ngăn phấn lạ bay vào'][st.ph || 0]; },
      get hint() { return ['Đậu Hà Lan tự thụ phấn từ khi hoa còn nụ, nên phải bỏ nhị cây mẹ trước', 'Kéo cọ vào bông hoa cây bố (bên phải), rồi kéo sang bông hoa cây mẹ (bên trái)', 'Bao hoa để chắc chắn hạt sinh ra chỉ do phấn cây bố'][st.ph || 0]; },
      enter(api) {
        const fl = st.p1.flower, self = this;
        const phase = n => { st.ph = n; api.say(self.text); };
        st.ph = 0;
        api.tapable(fl, () => {
          NL.audio.play('pop'); fl.stamens.style.opacity = 0.15; fl.stamens.querySelectorAll('circle').forEach(c => c.setAttribute('fill', '#D9CDB8'));
          phase(1);
          api.setOn(st.brush, true);
          api.draggable(st.brush, {
            target: { x: 420, y: 300, r: 80, sx: 420, sy: 300 }, onDrop: () => {
              NL.audio.play('pop'); st.brushTip.setAttribute('opacity', 1);
              api.tween(st.brush, 420, 280, 200, () => {
                api.setOn(st.brush, true);
                api.draggable(st.brush, {
                  target: { x: 130, y: 300, r: 80, sx: 130, sy: 300 }, onDrop: () => {
                    NL.audio.play('ting'); st.brushTip.setAttribute('opacity', 0);
                    api.tween(st.brush, 275, 420, 500);
                    phase(2);
                    api.tapable(fl, () => {
                      st.pollinated = true; NL.audio.play('ting');
                      api.el('path', { d: 'M-22 14 L-18 -34 Q0 -44 18 -34 L22 14 Z', fill: '#EAD9B8', stroke: '#B89A68', 'stroke-width': 2, opacity: 0.92 }, fl);
                      api.say('Khử nhị, thụ phấn, bao hoa xong! Từ lần sau mình làm giúp em'); api.done();
                    });
                    api.setOn(fl, true);
                  }
                });
              });
            }
          });
        });
        api.setOn(fl, true);
      }
    },
    {
      label: () => `Lần lai ${st.runs.length + 1}/3 · Số hạt`, text: 'Chọn số hạt đời con muốn đếm (N)', hint: 'Thử cả N nhỏ (10, 50) và N lớn (1000 trở lên) để so sánh',
      enter(api) {
        api.choices({
          label: 'Số hạt đời con N', items: NS.map(n => ({ t: n.toLocaleString('vi-VN'), v: n })), value: st.N,
          onPick(v) { st.N = v; }
        });
        api.done('Thu hạt ➜');
      },
      onNext(api) {
        const go = () => api.goto(3);
        if (st.N <= 50) api.card({ kicker: '⚠️ Mẫu nhỏ', text: `N = ${st.N} là quá ít. Mẫu nhỏ dễ lệch ngẫu nhiên, có thể làm χ² cao và bác bỏ giả thuyết Mendel.`, sub: 'Cứ thử để thấy. Sau đó tăng lên N ≥ 1.000 để thấy quy luật số lớn!', btn: 'Vẫn đếm ➜' }, go);
        else go();
      }
    },
    {
      label: () => `Lần lai ${st.runs.length + 1}/3 · Đếm hạt`, text: 'Tách quả trên cây mẹ, đếm hạt đời con. Màu và hình dạng hạt nhìn ngay trên hạt, không cần gieo', hint: 'Đợi hạt rơi xong',
      enter(api) {
        const r = { mode: st.mode, cross: st.cross, N: st.N, obs: run(st.cross, st.N), exp: expected(st.cross) };
        r.cs = chiSquare(r);
        st.cur = r;
        pourSeeds(api, r.obs.ph, () => {
          st.trayLab.textContent = `${st.N.toLocaleString('vi-VN')} hạt`; st.trayLab2.textContent = st.N > 120 ? '(vẽ tượng trưng)' : 'đời con';
          const cls = PH[st.mode].filter(c => r.exp.ph[c] > 0 || r.obs.ph[c]);
          api.table(['Kiểu hình', 'Đếm (O)', 'Lý thuyết (E)', '(O−E)²/E']).set(
            r.cs.rows.map(x => [x.c, x.O, x.E.toFixed(1), x.part.toFixed(2)]).concat(r.cs.df ? [['<b>χ²</b>', '', '', `<b>${r.cs.chi.toFixed(2)}</b>`]] : []));
          const gcd = (a, b) => b ? gcd(b, a % b) : a, tv = cls.map(c => Math.round(r.exp.ph[c] * 16)), tg = tv.reduce((a, b) => gcd(a, b));
          const theo = tv.map(v => v / tg).join(' : ');
          api.panel(`<div>Tỉ lệ thực tế</div><div class="big-num" style="font-size:24px">${ratio(cls, r.obs.ph)}</div><div class="rep-sub" style="font-size:13px">Lí thuyết: <b>${theo}</b> (${cls.join(' : ')})</div><div class="rep-sub" style="font-size:13px">Kiểu gene: ${Object.keys(r.obs.gt).sort().map(g => `${g} ${r.obs.gt[g]}`).join(' · ')}</div><div class="rep-sub" style="font-size:12px;opacity:.8">Kiểu gene của mỗi cây con được mô phỏng ngẫu nhiên theo xác suất Mendel nên tỉ lệ mỗi lần có thể lệch một chút</div>`);
          api.done('Kiểm định χ² ➜');
        });
      },
      onNext(api) {
        const r = st.cur;
        const fin = () => { st.runs.push(r); api.goto(4); };
        if (!r.cs.df) { api.card({ kicker: 'ℹ️ Không cần kiểm định', text: 'Đời con chỉ có một kiểu hình, khớp đúng lý thuyết nên không cần tính χ².' }, fin); return; }
        const c = r.cs.chi.toFixed(2);
        api.ask({
          kicker: '📐 Kiểm định χ²', q: `χ² = ${c}, bậc tự do df = ${r.cs.df}, giá trị tới hạn = ${r.cs.crit}. Em kết luận gì?`,
          options: [
            { t: 'Chưa đủ cơ sở bác bỏ giả thuyết Mendel', ok: r.cs.accept, why: `${c} lớn hơn ${r.cs.crit}: khác biệt quá lớn, không thể chỉ do ngẫu nhiên.` },
            { t: 'Bác bỏ giả thuyết Mendel', ok: !r.cs.accept, why: `${c} nhỏ hơn ${r.cs.crit}: chênh lệch nhỏ, chỉ do ngẫu nhiên.` }
          ],
          explain: r.cs.accept ? `χ² nhỏ hơn ${r.cs.crit} nên sai khác giữa thực tế và lý thuyết không có ý nghĩa thống kê.` : `χ² lớn hơn ${r.cs.crit}. ${r.N <= 100 ? 'Mẫu nhỏ nên lệch ngẫu nhiên nhiều. Thử lại với N lớn hơn nhé.' : 'Trường hợp hiếm do ngẫu nhiên.'}`
        }, r2 => { if ((r2.chosen === 0) === r.cs.accept) NL.audio.play('success'); fin(); });
      }
    },
    {
      label: () => `Lần lai ${st.runs.length}/3 · xong`, text: '', hint: 'Bấm nút ở góc dưới để đi tiếp',
      enter(api) {
        api.table(['Lần', 'P', 'N', 'Tỉ lệ', 'χ²', 'Kết luận']).set(historyRows().map(r => [r[0], r[2], r[3], r[4], r[5], r[6]]));
        const need = 3 - st.runs.length;
        api.say(need > 0 ? `Đã ghi lần lai. Lai thêm ${need} lần nữa, thử đổi số hạt N` : 'Đủ 3 lần lai rồi!');
        api.done(need > 0 ? 'Lai lần nữa ➜' : 'Xem biểu đồ ➜');
      },
      onNext(api) { st.seeds.innerHTML = ''; st.trayLab.textContent = 'Khay hạt'; st.trayLab2.textContent = 'đời con'; api.goto(st.runs.length < 3 ? 0 : 5); }
    },
    {
      label: 'Kết quả', text: 'So sánh tỉ lệ kiểu hình thực tế và lý thuyết', hint: 'N càng lớn thì cột thực tế càng sát cột lý thuyết',
      enter(api) { api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: '3 : 1', truth: 'Aa × Aa cho đời con xấp xỉ 3 hạt vàng : 1 hạt xanh.',
          sub: 'Số hạt càng nhiều thì tỉ lệ đếm được càng sát tỉ lệ lý thuyết của Mendel.',
          quiz: QUIZ, bank: 4, result: result()
        });
      }
    }
  ];

  function result() {
    const last = st.runs[st.runs.length - 1], same0 = st.runs.filter(r => r.cross === last.cross).sort((a, b) => a.N - b.N);
    const same = same0.length > 1 && same0[0].N !== same0[same0.length - 1].N ? [same0[0], same0[same0.length - 1]] : [last];
    const cls = PH[last.mode].filter(c => last.exp.ph[c] > 0);
    const PAL = ['#5BB4EA', '#2F80C0', '#9B6BD6'];
    return {
      title: 'Lai đậu Hà Lan theo Mendel', param: st.runs.map(r => `${r.cross} (N=${r.N})`).join(', '),
      table: { head: ['Lần lai', 'Chế độ', 'Kiểu gene P', 'N', 'Tỉ lệ kiểu hình thực tế', 'χ²', 'Kết luận'], rows: historyRows() },
      chart: {
        labels: cls, yLabel: `% kiểu hình · ${last.cross}`, max: 100,
        series: same.map((r, i) => ({ name: 'N=' + r.N, color: PAL[i], values: cls.map(c => Math.round((r.obs.ph[c] || 0) / r.N * 100)) }))
          .concat([{ name: 'Lý thuyết', color: '#3FB37F', values: cls.map(c => Math.round(last.exp.ph[c] * 100)) }])
      },
      conclusion: 'Các cặp allele phân li đồng đều về giao tử (1 : 1) và tổ hợp ngẫu nhiên khi thụ tinh. Số cá thể càng lớn, tỉ lệ thực tế càng gần tỉ lệ lý thuyết (3 : 1; 9 : 3 : 3 : 1)',
      note: 'χ² nhỏ hơn giá trị tới hạn (3,841 với df = 1; 7,815 với df = 3) thì chưa đủ cơ sở bác bỏ giả thuyết Mendel: sai lệch có thể chỉ do ngẫu nhiên. Kiểm định không chứng minh giả thuyết chắc chắn đúng.'
    };
  }

  const QUIZ = [
    {
      kicker: '❓ Vì sao?', q: 'Vì sao gieo 10 hạt thì tỉ lệ hay lệch xa 3 : 1, còn 10 000 hạt thì rất sát?',
      options: [
        { t: 'Mỗi lần thụ tinh là ngẫu nhiên; càng nhiều lần thì sai lệch ngẫu nhiên càng bù trừ nhau', ok: true },
        { t: 'Cây sinh nhiều hạt thì gene trội mạnh hơn', why: 'Gene trội không mạnh lên theo số hạt. Hãy nghĩ tới việc tung đồng xu 10 lần và 10 000 lần.' },
        { t: 'Máy tính đếm sai khi số hạt ít', why: 'Phép đếm vẫn đúng. Sai lệch đến từ sự kết hợp ngẫu nhiên của giao tử.' }
      ],
      explain: 'Giống tung đồng xu: tung ít lần dễ lệch, tung càng nhiều lần thì tỉ lệ càng gần 1 : 1. Đó là quy luật số lớn.'
    }
  ];

  NL.lab.register('2D', { goal: 'Đếm thật nhiều hạt đậu đời con, tỉ lệ có đúng như Mendel nói không?', clearSide: true, build, steps });
})();
