// Thí nghiệm 2E: điện di DNA trên gel agarose, soi UV, ước lượng kích thước đoạn DNA bằng thang chuẩn.
(function () {
  const A = NL.art;
  const LADDER = [10000, 5000, 3000, 2000, 1500, 1000, 500];
  const LANES = 6, X0 = 280, DX = 58, WELL_Y = 168, GEL_END = 432, MM = 60; // gel dài 60 mm
  const DYE = '#3A62D9';
  let st;

  // quãng đường tương đối: tỉ lệ nghịch với log kích thước; đoạn 300 bp đi cùng vạch màu nạp mẫu
  const mob = bp => (Math.log10(30000) - Math.log10(bp)) / (Math.log10(30000) - Math.log10(300));
  const laneX = k => X0 + k * DX;
  const yOf = (bp, prog) => WELL_Y + 6 + mob(bp) * prog * (GEL_END - WELL_Y - 6);

  function randomSamples() {
    const out = [];
    for (let k = 0; k < LANES - 1; k++) {
      const n = 1 + Math.floor(Math.random() * 3), set = new Set();
      while (set.size < n) set.add(Math.round((400 + Math.pow(Math.random(), 1.6) * 7600) / 50) * 50);
      out.push([...set].sort((a, b) => b - a));
    }
    return out;
  }

  function build(api) {
    const L = api.svg, el = api.el;
    st = { samples: randomSamples(), loaded: 0, V: 100, speed: 5, prog: 0, uv: false, t: 0, est: [] };
    st.lanes = [LADDER].concat(st.samples);
    // buồng điện di
    const box = api.g(L, 0, 0);
    el('rect', { x: 236, y: 112, width: 380, height: 352, rx: 18, fill: '#E3EEF7', stroke: '#9FB4C8', 'stroke-width': 4 }, box);
    st.gel = el('rect', { x: 250, y: 140, width: 352, height: 304, rx: 8, fill: 'rgba(235,245,255,.9)', stroke: '#C8DAEA', 'stroke-width': 2 }, box);
    el('rect', { x: 250, y: 120, width: 352, height: 8, rx: 4, fill: '#333' }, box);
    el('rect', { x: 250, y: 452, width: 352, height: 8, rx: 4, fill: '#E5534B' }, box);
    api.text(box, 630, 132, '−', 30, '#333', 800);
    api.text(box, 630, 466, '+', 30, '#E5534B', 800);
    st.wells = [];
    for (let k = 0; k < LANES; k++) {
      st.wells.push(el('rect', { x: laneX(k) - 18, y: WELL_Y - 8, width: 36, height: 10, rx: 3, fill: '#CFDDEA', stroke: '#9FB4C8', 'stroke-width': 1.5 }, box));
      api.text(box, laneX(k), 156, k ? String(k) : 'L', 14, '#6C88A3', 800);
    }
    st.dye = api.g(box, 0, 0);
    st.bands = api.g(box, 0, 0); st.bands.style.opacity = 0;
    st.guide = el('line', { x1: 252, x2: 600, y1: 0, y2: 0, stroke: '#FFE680', 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: 0 }, box);
    // ống mẫu trên giá
    const rack = api.g(L, 0, 0);
    el('rect', { x: 40, y: 430, width: 160, height: 14, rx: 5, fill: '#C99A6B' }, rack);
    el('rect', { x: 40, y: 520, width: 160, height: 14, rx: 5, fill: '#C99A6B' }, rack);
    st.tubes = [];
    for (let k = 0; k < LANES; k++) {
      const x = 70 + (k % 3) * 50, y = k < 3 ? 434 : 524;
      const t = A.tube(api, L, x, y, { h: 70, w: 24, k: 0.5, color: 'rgba(90,120,230,.55)' });
      api.text(t, 0, -78, k ? 'Mẫu ' + k : 'Thang', 12, '#1F4E79', 800);
      st.tubes.push(t);
    }
    st.pip = A.pipette(api, L, 690, 445, { bulb: '#9B6BD6', len: 130 });
    // công tắc UV
    st.uvBtn = api.g(L, 200, 160);
    el('rect', { x: -34, y: -22, width: 68, height: 44, rx: 12, fill: '#6B4BC8', stroke: '#fff', 'stroke-width': 3 }, st.uvBtn);
    api.text(st.uvBtn, 0, 7, 'UV', 20, '#fff', 800);
  }

  function drawDye() {
    st.dye.innerHTML = '';
    for (let k = 0; k < st.loaded; k++) {
      const y = Math.min(GEL_END + 4, yOf(300, st.prog));
      if (st.prog === 0) api0.el('rect', { x: laneX(k) - 16, y: WELL_Y - 6, width: 32, height: 6, rx: 2, fill: DYE }, st.dye);
      else if (y <= GEL_END) api0.el('rect', { x: laneX(k) - 16, y: y - 3, width: 32, height: 6, rx: 3, fill: DYE, opacity: .75 }, st.dye);
    }
  }
  let api0; // giữ api để vẽ trong vòng lặp
  function drawBands() {
    st.bands.innerHTML = '';
    const blur = st.V > 130 ? 9 : 5;
    let lastLab = -99;
    st.lanes.forEach((list, k) => list.forEach(bp => {
      const y = yOf(bp, st.prog);
      if (y > GEL_END) return; // chạy quá lâu, đoạn nhỏ đã ra khỏi gel
      api0.el('rect', { x: laneX(k) - 17, y: y - blur / 2, width: 34, height: blur, rx: 3, fill: '#FF8CF0', filter: 'url(#gelGlow)' }, st.bands);
      if (!k && y - lastLab > 12) { lastLab = y; api0.text(st.bands, 230, y + 4, bp, 11, '#6B4BC8', 800).setAttribute('text-anchor', 'end'); }
    }));
  }

  function loadWell(api, k, then) {
    const t = st.tubes[k], w = st.wells[k];
    w.setAttribute('stroke', '#F2C94C'); w.setAttribute('stroke-width', 3);
    api.setOn(st.pip, true);
    api.draggable(st.pip, {
      target: { x: t._x, y: t._y - 40, r: 60, sx: t._x, sy: t._y - 30 }, onDrop: () => {
        st.pip.fill('rgba(90,120,230,.8)'); NL.audio.play('bubble');
        api.tween(st.pip, st.pip._x, st.pip._y - 50, 200, () => {
          api.setOn(st.pip, true);
          api.draggable(st.pip, {
            target: { x: laneX(k), y: WELL_Y, r: 40, sx: laneX(k), sy: WELL_Y - 2 }, onDrop: () => {
              st.pip.empty(); w.setAttribute('stroke', '#9FB4C8'); w.setAttribute('stroke-width', 1.5);
              st.loaded = k + 1; drawDye(); NL.audio.play('drop');
              api.tween(st.pip, 690, 445, 300); then();
            }
          });
        });
      }
    });
  }
  function loadStep(k, text) {
    return {
      label: `Nạp mẫu ${k + 1}/3`, text, hint: 'Kéo pipette vào ống đang chọn để hút, rồi bơm vào giếng sáng viền vàng',
      enter(api) { loadWell(api, k, () => api.done()); }
    };
  }

  const steps = [
    loadStep(0, 'Hút thang chuẩn (Thang) và bơm vào giếng L'),
    loadStep(1, 'Hút mẫu 1, bơm vào giếng 1'),
    loadStep(2, 'Hút mẫu 2, bơm vào giếng 2'),
    {
      label: 'Cài nguồn điện', text: 'Chọn hiệu điện thế và tốc độ chạy', hint: 'DNA tích điện âm nên chạy từ cực − về cực +',
      enter(api) {
        if (st.loaded < LANES) { st.loaded = LANES; drawDye(); NL.game.toast('Mình nạp giúp 3 giếng còn lại'); }
        if (!api.prediction) api.ask({
          predict: true, q: 'Khi bật điện, đoạn DNA nào sẽ đi xa hơn?',
          options: [{ t: 'Đoạn ngắn (ít cặp base)' }, { t: 'Đoạn dài (nhiều cặp base)' }, { t: 'Đi xa như nhau' }]
        });
        api.slider({
          label: 'Hiệu điện thế', min: 50, max: 150, step: 5, value: st.V, unit: 'V',
          onInput(v, ctl) { st.V = v; ctl.warn(v > 130 ? 'Quá cao: gel nóng lên, băng DNA bị nhòe' : ''); }
        });
        api.choices({ label: 'Tốc độ thời gian', items: [1, 2, 5, 10].map(n => ({ t: n + '×', v: n })), value: st.speed, onPick(v) { st.speed = v; } });
        api.done('Bật nguồn ⏻');
      },
      onNext(api) {
        if (st.V > 130) api.card({ kicker: '⚠️ Cảnh báo an toàn', text: `${st.V} V vượt ngưỡng an toàn của bản gel. Gel sẽ nóng, băng DNA bị nhòe.`, sub: 'Thường chạy khoảng 80–120 V.', btn: 'Vẫn chạy ➜' }, () => api.goto(4));
        else api.goto(4);
      }
    },
    {
      label: 'Đang điện di', text: 'Theo dõi vạch màu xanh chạy về cực +. Tắt nguồn khi vạch gần tới đáy', hint: 'Dưới ánh sáng thường chỉ thấy vạch màu nạp mẫu, chưa thấy DNA',
      enter(api) {
        NL.audio.play('hum');
        const card = api.panel(`<div>⏱ Thời gian chạy</div><div class="big-num"><span id="gelT">0</span> phút</div><div class="rep-sub" style="font-size:13px">${st.V} V · ${st.speed}×</div>`);
        api.choices({ items: [1, 2, 5, 10].map(n => ({ t: n + '×', v: n })), value: st.speed, onPick(v) { st.speed = v; card.querySelector('.rep-sub').textContent = `${st.V} V · ${v}×`; } });
        const out = card.querySelector('#gelT');
        let shown = false;
        st.loop = api.loop(dt => {
          const simMin = dt * st.speed / 1.5; // 1× = 1 phút mỗi 1,5 giây
          st.t += simMin; st.prog += simMin * (st.V / 100) / 40;
          out.textContent = Math.floor(st.t); drawDye();
          if (st.prog > 0.75 && !shown) { shown = true; api.done('Tắt nguồn ⏻'); }
          if (st.prog >= 1.08) { NL.game.toast('Vạch màu đã chạy ra khỏi gel! Mình tắt nguồn giúp em'); api.goto(5); return false; }
        });
      },
      onNext(api) { st.loop.stop(); api.goto(5); }
    },
    {
      label: 'Soi UV', text: 'Bật đèn soi UV để thấy các băng DNA', hint: 'Chạm nút UV tím bên trái buồng điện di',
      enter(api) {
        NL.audio.play('click');
        api.setOn(st.uvBtn, true);
        api.tapable(st.uvBtn, () => {
          st.uv = true; NL.audio.play('unlock');
          st.gel.setAttribute('fill', '#1C1440'); st.dye.style.opacity = 0;
          drawBands(); st.bands.style.opacity = 1;
          api.say(st.prog > 1 ? 'Các đoạn nhỏ đã chạy ra khỏi gel nên mất băng. Lần sau tắt nguồn sớm hơn nhé' : 'Các băng DNA phát sáng! Đoạn nhỏ ở gần cực +');
          api.done();
        });
      }
    },
    {
      label: 'Đo kích thước', text: 'So băng DNA với thang chuẩn để ước lượng kích thước', hint: 'Vạch vàng nối ngang băng đang hỏi sang cột thang chuẩn L',
      enter(api) {
        const table = api.table(['Giếng', 'Số băng', 'Kích thước', 'Đi được']);
        const show = () => table.set(st.samples.map((s, i) => [i + 1, s.filter(bp => yOf(bp, st.prog) <= GEL_END).length, st.est[i] ? s.join(', ') + ' bp' : '?', st.est[i] ? s.map(bp => Math.round(mob(bp) * Math.min(1, st.prog) * MM) + '').join(', ') + ' mm' : '']));
        show();
        // hỏi băng lớn nhất của giếng 1 và băng nhỏ nhất của giếng 2
        const asks = [[0, st.samples[0][0]], [1, st.samples[1][st.samples[1].length - 1]]].filter(([, bp]) => yOf(bp, st.prog) <= GEL_END);
        const q = (k, bp) => {
          const lo = LADDER.filter(x => x <= bp)[0], hi = LADDER.slice().reverse().find(x => x >= bp);
          const right = !lo ? 'Nhỏ hơn 500 bp' : !hi ? 'Lớn hơn 10000 bp' : lo === hi ? `Khoảng ${lo} bp` : `Từ ${lo} đến ${hi} bp`;
          const pool = ['Nhỏ hơn 500 bp', 'Từ 500 đến 1000 bp', 'Từ 1000 đến 1500 bp', 'Từ 1500 đến 2000 bp', 'Từ 2000 đến 3000 bp', 'Từ 3000 đến 5000 bp', 'Từ 5000 đến 10000 bp'].filter(x => x !== right);
          const wrong = pool.sort(() => Math.random() - 0.5).slice(0, 2);
          return {
            kicker: '📏 Thước đo phân tử', q: `Băng có viền vàng ở giếng ${k + 1} có kích thước khoảng bao nhiêu?`,
            options: [{ t: right, ok: true }].concat(wrong.map(t => ({ t, why: 'Nhìn theo vạch vàng sang cột L: băng nằm giữa hai vạch nào của thang chuẩn?' }))).sort(() => Math.random() - 0.5),
            explain: `Đúng rồi, đoạn này dài ${bp} bp.`
          };
        };
        let i = 0;
        const next = () => {
          if (i >= asks.length) { st.guide.setAttribute('opacity', 0); st.est = st.samples.map(() => true); show(); api.done(); return; }
          const [k, bp] = asks[i++], y = yOf(bp, st.prog);
          st.guide.setAttribute('y1', y); st.guide.setAttribute('y2', y); st.guide.setAttribute('opacity', 1);
          st.mark && st.mark.remove();
          st.mark = api.el('rect', { x: laneX(k + 1) - 21, y: y - 7, width: 42, height: 14, rx: 4, fill: 'none', stroke: '#FFE680', 'stroke-width': 3 }, st.bands);
          api.ask(q(k, bp), () => { st.est[k] = true; show(); next(); });
        };
        next();
      }
    },
    {
      label: 'Kết quả', text: 'Quãng đường di chuyển theo kích thước đoạn DNA', hint: 'Đoạn càng ngắn càng đi xa',
      enter(api) { st.mark && st.mark.remove(); api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Đoạn ngắn (ít cặp base)', truth: 'đoạn DNA càng ngắn càng đi xa, đoạn dài ở lại gần giếng.',
          sub: 'Gel agarose như một tấm lưới: đoạn ngắn luồn qua lỗ dễ hơn nên chạy nhanh hơn.',
          quiz: QUIZ, bank: 4, result: result()
        });
      }
    }
  ];

  function result() {
    const p = Math.min(1, st.prog), dist = bp => +(mob(bp) * p * MM).toFixed(1);
    const rows = [['L (thang chuẩn)', LADDER.join(', '), LADDER.map(dist).join(', ')]].concat(st.samples.map((s, i) => ['Mẫu ' + (i + 1), s.join(', '), s.map(dist).join(', ')]));
    const sm = st.samples.flat().sort((a, b) => a - b);
    return {
      title: 'Điện di DNA trên gel agarose', param: `${st.V} V, chạy ${Math.floor(st.t)} phút`,
      table: { head: ['Giếng', 'Kích thước đoạn (bp)', 'Quãng đường (mm)'], rows },
      chart: {
        type: 'line', xLabel: 'Kích thước (bp)', yLabel: 'Quãng đường (mm)', xMax: 10000,
        series: [
          { name: 'Thang chuẩn', color: '#9B6BD6', points: LADDER.slice().reverse().map(bp => [bp, dist(bp)]) },
          { name: 'Mẫu của em', color: '#F2994A', points: sm.map(bp => [bp, dist(bp)]) }
        ]
      },
      conclusion: 'DNA tích điện âm nên chạy về cực dương. Đoạn càng ngắn đi càng xa; quãng đường tỉ lệ nghịch với logarit kích thước đoạn DNA',
      note: 'So với thang chuẩn đã biết kích thước, ta ước lượng được kích thước các đoạn DNA chưa biết.'
    };
  }

  const QUIZ = [
    {
      kicker: '❓ Vì sao?', q: 'Vì sao DNA chạy từ cực âm về cực dương?',
      options: [
        { t: 'Nhóm phosphate làm phân tử DNA tích điện âm', ok: true },
        { t: 'DNA nặng nên chìm xuống phía dưới', why: 'Gel nằm ngang trong dung dịch đệm, DNA bị kéo bởi điện trường chứ không phải trọng lực.' },
        { t: 'Dung dịch đệm chảy về cực dương', why: 'Dung dịch đệm đứng yên. Hãy nghĩ tới điện tích của DNA.' }
      ],
      explain: 'Mỗi nucleotide có một nhóm phosphate mang điện âm nên DNA bị hút về cực dương (+).'
    }
  ];

  NL.lab.register('2E', {
    goal: 'Làm sao biết một đoạn DNA dài bao nhiêu cặp base?', clearSide: true,
    build(api) {
      api0 = api; build(api);
      const defs = api.el('defs', {}, api.svg), f = api.el('filter', { id: 'gelGlow', x: '-50%', y: '-200%', width: '200%', height: '500%' }, defs);
      api.el('feGaussianBlur', { stdDeviation: 2.5, result: 'b' }, f);
      const m = api.el('feMerge', {}, f); api.el('feMergeNode', { in: 'b' }, m); api.el('feMergeNode', { in: 'SourceGraphic' }, m);
    },
    steps
  });
})();
