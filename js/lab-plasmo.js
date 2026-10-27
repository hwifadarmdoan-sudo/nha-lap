// Thí nghiệm 2B: co và phản co nguyên sinh ở tế bào biểu bì lá thài lài tía.
(function () {
  const SOL = {
    nhuoc: { name: 'Nhược trương', color: '#BFE4FA', frac: 0, shrink: 1.0 },
    dang: { name: 'Đẳng trương', color: '#FFE8A3', frac: 0.1, shrink: 0.8 },
    uu: { name: 'Ưu trương', color: '#FFC9C9', frac: 0.9, shrink: 0.5 }
  };
  const STAGE = { x: 850, y: 300 };
  let st;

  function build(api) {
    const L = api.svg, el = api.el;
    st = { done: {}, cur: null, cells: [], needRecover: false };

    // kính hiển vi
    const mic = api.g(L, 850, 0);
    el('path', { d: 'M-70 452 L70 452 L56 432 L-56 432 Z', fill: '#4A5A6A' }, mic);
    el('path', { d: 'M30 432 L30 250 Q30 190 -10 170 L-26 190 Q4 206 4 250 L4 432 Z', fill: '#5E6E7E' }, mic);
    el('rect', { x: -60, y: 300, width: 100, height: 14, rx: 4, fill: '#3B4B5B' }, mic);
    el('rect', { x: -44, y: 120, width: 30, height: 110, rx: 8, fill: '#6B7B8B', transform: 'rotate(-18 -29 175)' }, mic);
    el('rect', { x: -40, y: 236, width: 18, height: 40, rx: 4, fill: '#8C9CAC' }, mic);
    el('circle', { cx: 30, cy: 330, r: 14, fill: '#8C9CAC' }, mic);
    api.text(mic, 0, 525, 'Kính hiển vi', 15, '#6C88A3', 700);

    // lá thài lài tía
    const leaf = api.g(L, 160, 440);
    el('path', { d: 'M-70 0 Q-10 -70 70 -20 Q10 30 -70 0 Z', fill: '#7A3E9D' }, leaf);
    el('path', { d: 'M-70 0 Q-10 -55 66 -20', fill: 'none', stroke: '#4FA36B', 'stroke-width': 4 }, leaf);
    api.text(leaf, 0, 85, 'Lá thài lài tía', 15, '#6C88A3', 700);
    st.leaf = leaf;
    st.peel = api.g(L, 150, 425); st.peel.style.display = 'none';
    el('path', { d: 'M-26 0 Q0 -14 26 -4 Q4 10 -26 0 Z', fill: 'rgba(170,90,210,.85)', stroke: '#fff', 'stroke-width': 2 }, st.peel);

    // kim mũi mác
    const nd = api.g(L, 310, 470);
    el('rect', { x: -60, y: -5, width: 80, height: 10, rx: 5, fill: '#C99A6B' }, nd);
    el('path', { d: 'M20 -3 L70 0 L20 3 Z', fill: '#9AA9B7' }, nd);
    api.text(nd, 0, 55, 'Kim mũi mác', 15, '#6C88A3', 700);
    st.needle = nd;

    // lam kính có giọt nước
    const sl = api.g(L, 470, 465);
    el('rect', { x: -80, y: -14, width: 160, height: 28, rx: 4, fill: 'rgba(210,240,255,.75)', stroke: '#8FBBD8', 'stroke-width': 3 }, sl);
    el('ellipse', { cx: 0, cy: 0, rx: 18, ry: 7, fill: 'rgba(120,190,240,.7)' }, sl);
    st.slPeel = el('path', { d: 'M-24 0 Q0 -10 24 -3 Q4 8 -24 0 Z', fill: 'rgba(170,90,210,.85)', style: 'display:none' }, sl);
    st.slLamen = el('rect', { x: -30, y: -12, width: 60, height: 24, rx: 2, fill: 'rgba(255,255,255,.55)', stroke: '#A8C8DE', 'stroke-width': 2, style: 'display:none' }, sl);
    api.text(sl, 0, 60, 'Lam kính', 15, '#6C88A3', 700);
    st.slide = sl;

    // lamen
    const lm = api.g(L, 640, 470);
    el('rect', { x: -32, y: -14, width: 64, height: 28, rx: 3, fill: 'rgba(255,255,255,.6)', stroke: '#A8C8DE', 'stroke-width': 3 }, lm);
    api.text(lm, 0, 55, 'Lamen', 15, '#6C88A3', 700);
    st.lamen = lm;

    // các lọ dung dịch + giấy thấm (hiện ra ở bước nhỏ dung dịch)
    st.bottles = {};
    const kinds = [['nhuoc', 90], ['dang', 190], ['uu', 290], ['cat', 390]];
    kinds.forEach(([k, x]) => {
      const b = api.g(L, x, 0); b.style.display = 'none';
      const col = k === 'cat' ? '#E8F6FF' : SOL[k].color;
      el('rect', { x: -30, y: 380, width: 60, height: 72, rx: 12, fill: col, stroke: '#9CC7E3', 'stroke-width': 3 }, b);
      el('rect', { x: -12, y: 350, width: 24, height: 34, rx: 4, fill: '#E5534B' }, b);
      el('ellipse', { cx: 0, cy: 346, rx: 13, ry: 9, fill: '#333' }, b);
      api.text(b, 0, 480, k === 'cat' ? 'Nước cất' : SOL[k].name, 14, '#1F4E79', 800);
      st.bottles[k] = b;
    });
    const paper = api.g(L, 560, 470); paper.style.display = 'none';
    el('rect', { x: -40, y: -16, width: 80, height: 32, rx: 4, fill: '#FFFFFF', stroke: '#E3D6B4', 'stroke-width': 3 }, paper);
    api.text(paper, 0, 52, 'Giấy thấm', 15, '#6C88A3', 700);
    st.paper = paper;
    const drop = api.g(L, 0, 0); drop.style.display = 'none';
    el('rect', { x: -6, y: -70, width: 12, height: 60, rx: 4, fill: 'rgba(255,255,255,.8)', stroke: '#9AA9B7', 'stroke-width': 2 }, drop);
    el('ellipse', { cx: 0, cy: -76, rx: 10, ry: 12, fill: '#E5534B' }, drop);
    st.dropper = drop;

    // khung nhìn qua kính hiển vi
    const view = api.g(L, 610, 190); view.style.display = 'none';
    const defs = el('defs', {}, L);
    const cp = el('clipPath', { id: 'microClip' }, defs); el('circle', { cx: 0, cy: 0, r: 150 }, cp);
    el('circle', { r: 160, fill: '#1F2A36' }, view);
    const inner = el('g', { 'clip-path': 'url(#microClip)' }, view);
    el('rect', { x: -160, y: -160, width: 320, height: 320, fill: '#F2F8E8' }, inner);
    let n = 0;
    for (let r = -3; r <= 3; r++) for (let c = -3; c <= 3; c++) {
      const x = c * 62 + (r % 2 ? 31 : 0), y = r * 44;
      if (Math.hypot(x, y) > 190) continue;
      const cell = el('g', { transform: `translate(${x},${y})` }, inner);
      el('rect', { x: -29, y: -20, width: 58, height: 40, rx: 8, fill: '#E6F2D6', stroke: '#7DB36A', 'stroke-width': 3 }, cell);
      const pr = el('rect', { x: -25, y: -16, width: 50, height: 32, rx: 7, fill: '#9B4FC4' }, cell);
      el('circle', { cx: -12, cy: -4, r: 4, fill: '#5E2A80' }, cell);
      st.cells.push({ pr, cur: 1, target: 1, seed: (n++ * 37) % 10 });
    }
    el('circle', { r: 150, fill: 'none', stroke: '#1F2A36', 'stroke-width': 6 }, view);
    st.viewLabel = api.text(view, 0, 186, '', 18, '#1F4E79', 800);
    st.view = view;
    st.raf = requestAnimationFrame(animCells);
  }

  function animCells() {
    st.cells.forEach(c => {
      c.cur += (c.target - c.cur) * 0.035;
      const s = c.cur, rx = 7 + (1 - s) * 30;
      c.pr.setAttribute('transform', `scale(${s.toFixed(3)})`);
      c.pr.setAttribute('rx', rx.toFixed(1));
    });
    st.raf = requestAnimationFrame(animCells);
  }
  function setCells(kind) {
    const s = SOL[kind];
    st.cells.forEach(c => { c.target = c.seed < s.frac * 10 ? s.shrink : 1; });
    const co = st.cells.filter(c => c.target < 0.9).length;
    return Math.round(co / st.cells.length * 100);
  }
  function resetCells() { st.cells.forEach(c => { c.target = 1; }); }

  function dropperTo(api, from, cb) {
    const d = st.dropper; d.style.display = '';
    api.place(d, from._x, 350); api.svg.appendChild(d);
    api.tween(d, STAGE.x - 20, STAGE.y - 6, 600, () => {
      NL.audio.play('drop');
      setTimeout(() => { d.style.display = 'none'; cb(); }, 350);
    });
  }

  const steps = [
    {
      label: 'Làm tiêu bản 1/4', text: 'Dùng kim mũi mác bóc lớp biểu bì của lá thài lài tía', hint: 'Kéo kim mũi mác đang sáng chạm vào chiếc lá tím',
      enter(api) {
        api.setOn(st.needle, true);
        api.draggable(st.needle, {
          target: { x: 160, y: 430, r: 100 }, snap: false,
          onDrop: () => { st.needle.style.display = 'none'; st.peel.style.display = ''; api.place(st.peel, 150, 425); api.done(); }
        });
      }
    },
    {
      label: 'Làm tiêu bản 2/4', text: 'Đặt lớp biểu bì lên giọt nước trên lam kính', hint: 'Kéo mảnh biểu bì màu tím vào giữa lam kính',
      enter(api) {
        api.setOn(st.peel, true);
        api.draggable(st.peel, { target: { x: 470, y: 465, r: 90 }, onDrop: () => { st.peel.style.display = 'none'; st.slPeel.style.display = ''; api.done(); } });
      }
    },
    {
      label: 'Làm tiêu bản 3/4', text: 'Đậy lamen lên', hint: 'Kéo lamen phủ lên mảnh biểu bì',
      enter(api) {
        api.setOn(st.lamen, true);
        api.draggable(st.lamen, { target: { x: 470, y: 465, r: 90 }, onDrop: () => { st.lamen.style.display = 'none'; st.slLamen.style.display = ''; api.done(); } });
      }
    },
    {
      label: 'Làm tiêu bản 4/4', text: 'Đặt lam kính lên bàn kính hiển vi', hint: 'Kéo lam kính lên bệ của kính hiển vi bên phải',
      enter(api) {
        api.setOn(st.slide, true);
        api.draggable(st.slide, {
          target: { x: STAGE.x, y: STAGE.y, r: 110, sx: STAGE.x - 20, sy: STAGE.y - 6 },
          onDrop: () => {
            st.leaf.style.display = 'none';
            st.view.style.display = ''; st.viewLabel.textContent = 'Tế bào bình thường';
            api.done();
          }
        });
      }
    },
    {
      label: () => `Thử lọ ${doneCount() + 1}/3`,
      text: 'Chọn một lọ dung dịch để nhỏ vào mép lamen', hint: 'Chạm vào một lọ đang sáng. Lọ nào làm rồi sẽ không sáng nữa',
      enter(api) {
        if (!doneCount() && !api.prediction) api.ask({
          predict: true, q: 'Nhỏ dung dịch ưu trương vào, tế bào sẽ…?',
          options: [{ t: 'Co lại vì nước đi ra' }, { t: 'Trương to vì nước đi vào' }, { t: 'Không thay đổi' }]
        });
        ['nhuoc', 'dang', 'uu'].forEach(k => {
          const b = st.bottles[k]; b.style.display = '';
          if (st.done[k] !== undefined) return;
          api.setOn(b, true);
          if (!b._tap) { b._tap = true; api.tapable(b, () => choose(api, k)); }
        });
        st.bottles.cat.style.display = '';
      }
    },
    {
      label: () => `Thử lọ ${doneCount() + 1}/3`, text: 'Đặt giấy thấm ở mép bên kia lamen', hint: 'Kéo giấy thấm lên bệ kính hiển vi để kéo dung dịch qua mẫu',
      enter(api) {
        const p = st.paper; p.style.display = ''; api.place(p, 560, 470);
        api.setOn(p, true);
        if (!p._drag) { p._drag = true; api.draggable(p, { target: { x: STAGE.x, y: STAGE.y, r: 120, sx: STAGE.x + 40, sy: STAGE.y - 4 }, onDrop: () => absorb(api) }); }
        else p._home = { x: 560, y: 470 };
      }
    },
    {
      label: () => `Thử lọ ${doneCount()}/3`, text: 'Nhỏ nước cất, rồi đặt giấy thấm để xem tế bào phản co', hint: 'Chạm lọ nước cất, sau đó kéo giấy thấm lên bệ kính',
      enter(api) {
        const b = st.bottles.cat; api.setOn(b, true);
        if (!b._tap) { b._tap = true; api.tapable(b, () => dropperTo(api, b, () => {
          const p = st.paper; p.style.display = ''; api.place(p, 560, 470); api.setOn(p, true); p._home = { x: 560, y: 470 };
          p._recover = true;
        })); }
      }
    },
    {
      label: () => `Thử lọ ${doneCount()}/3`, text: '', hint: 'Bấm nút ở góc dưới để đi tiếp',
      enter(api) {
        const left = ['nhuoc', 'dang', 'uu'].filter(k => st.done[k] === undefined).length;
        document.getElementById('stepText').textContent = left ? `Đã ghi kết quả. Còn ${left} lọ chưa thử` : 'Đã thử đủ 3 lọ!';
        sideTable(api);
        api.done(left ? 'Thử lọ khác ➜' : 'Xem biểu đồ ➜');
      },
      onNext(api) {
        const left = ['nhuoc', 'dang', 'uu'].some(k => st.done[k] === undefined);
        if (left) { resetCells(); st.viewLabel.textContent = 'Mẫu mới: tế bào bình thường'; NL.game.toast('Đã thay mẫu mới 🍃'); api.goto(4); }
        else api.goto(8);
      }
    },
    {
      label: 'Kết quả', text: 'Biểu đồ tỉ lệ tế bào co nguyên sinh', hint: 'So chiều cao 3 cột',
      enter(api) {
        st.view.style.display = 'none';
        Object.values(st.bottles).forEach(b => { b.style.display = 'none'; });
        st.paper.style.display = 'none';
        const res = result();
        const fo = api.el('foreignObject', { x: 150, y: 20, width: 700, height: 420 }, api.svg);
        const div = document.createElement('div');
        div.style.cssText = 'background:#fff;border-radius:20px;padding:10px 16px;box-shadow:0 6px 0 rgba(31,78,121,.18);font-family:Baloo 2;height:100%;box-sizing:border-box';
        div.innerHTML = NL.chartSVG(res.chart, 660, 360);
        fo.appendChild(div);
        api.done('Trả lời câu hỏi ➜');
      },
      onNext(api) { afterChart(api); }
    }
  ];

  const doneCount = () => ['nhuoc', 'dang', 'uu'].filter(k => st.done[k] !== undefined).length;

  // Sau biểu đồ: so với điều em đã đoán, hỏi vì sao, rồi câu kiểm tra.
  function afterChart(api) {
    const pred = api.prediction, right = 'Co lại vì nước đi ra';
    api.card({
      kicker: '🔁 So với điều em đoán',
      text: pred ? (pred === right ? `Em đoán "${pred}". Kết quả: đúng như em đoán! 🎯` : `Em đoán "${pred}". Kết quả: trong dung dịch ưu trương, tế bào co nguyên sinh.`) : 'Kết quả: trong dung dịch ưu trương, tế bào co nguyên sinh.',
      sub: 'Khi nhỏ nước cất vào, tế bào phản co trở lại như cũ.'
    }, () => api.askAll(QUIZ, () => api.finish(result())));
  }
  const QUIZ = [
    {
      kicker: '❓ Vì sao?', q: 'Vì sao trong dung dịch ưu trương, tế bào co nguyên sinh?',
      options: [
        { t: 'Bên ngoài đậm chất tan hơn nên nước đi ra khỏi tế bào, chất nguyên sinh co lại', ok: true },
        { t: 'Chất tan đi vào làm tế bào nặng và co lại', why: 'Thứ di chuyển qua màng nhiều nhất ở đây là nước. Nước đi từ nơi loãng sang nơi đậm hay ngược lại?' },
        { t: 'Thành tế bào bị vỡ', why: 'Nếu thành tế bào vỡ thì tế bào có phản co được khi thêm nước cất không?' }
      ],
      explain: 'Nước đi từ nơi có nồng độ chất tan thấp sang nơi có nồng độ chất tan cao. Dung dịch ưu trương đậm hơn dịch tế bào nên kéo nước ra.'
    },
    {
      q: 'Dung dịch nhược trương có nồng độ chất tan … so với dịch tế bào',
      options: [{ t: 'Thấp hơn', ok: true }, { t: 'Cao hơn', why: '"Nhược" nghĩa là yếu, ít. Dung dịch có ít hay nhiều chất tan?' }, { t: 'Bằng', why: 'Bằng dịch tế bào là dung dịch đẳng trương.' }],
      explain: 'Nhược trương: ít chất tan hơn nên nước đi vào tế bào, tế bào không co.'
    },
    {
      q: 'Tế bào đã co mà nhỏ nước cất vào lại phản co. Điều đó cho thấy…',
      options: [
        { t: 'Tế bào vẫn còn sống', ok: true },
        { t: 'Tế bào đã chết', why: 'Tế bào chết thì màng sinh chất không còn điều khiển nước ra vào. Nó có trở lại như cũ được không?' },
        { t: 'Nước cất rất đậm chất tan', why: 'Nước cất gần như không có chất tan, nó là dung dịch nhược trương.' }
      ],
      explain: 'Chỉ tế bào sống mới co và phản co nguyên sinh được. Đây cũng là cách kiểm tra tế bào sống hay chết.'
    }
  ];

  function choose(api, k) {
    st.cur = k;
    ['nhuoc', 'dang', 'uu'].forEach(x => { if (x !== k) api.setOn(st.bottles[x], false); });
    dropperTo(api, st.bottles[k], () => api.goto(5));
  }

  function absorb(api) {
    if (st.paper._recover) { // phản co
      st.paper._recover = false;
      resetCells(); st.viewLabel.textContent = 'Tế bào phản co nguyên sinh';
      st.recovered = true;
      setTimeout(() => { st.paper.style.display = 'none'; api.done(); }, 1600);
      return;
    }
    const pct = setCells(st.cur);
    st.done[st.cur] = pct;
    st.viewLabel.textContent = 'Đang quan sát…';
    setTimeout(() => {
      st.viewLabel.textContent = `${SOL[st.cur].name}: ${pct}% tế bào co nguyên sinh`;
      st.paper.style.display = 'none';
      if (st.cur === 'uu') { document.getElementById('stepText').textContent = 'Tế bào co nguyên sinh rồi!'; st.needRecover = true; api.done(); }
      else api.done();
    }, 2200);
  }

  // Sau bước giấy thấm: nếu vừa nhỏ ưu trương thì sang bước phản co, không thì sang bước ghi kết quả.
  steps[5].onNext = api => { if (st.needRecover) { st.needRecover = false; api.goto(6); } else api.goto(7); };
  steps[6].onNext = api => api.goto(7);

  function sideTable(api) {
    let card = api.side.querySelector('.data-card');
    if (!card) { card = document.createElement('div'); card.className = 'data-card'; api.side.appendChild(card); }
    const rows = ['nhuoc', 'dang', 'uu'].map(k => `<tr><td>${SOL[k].name}</td><td>${st.done[k] === undefined ? '…' : st.done[k] + '%'}</td></tr>`).join('');
    card.innerHTML = `<table><tr><th>Dung dịch</th><th>Tế bào co</th></tr>${rows}</table>`;
  }

  function result() {
    const ks = ['nhuoc', 'dang', 'uu'];
    return {
      title: 'Co và phản co nguyên sinh', param: 'Loại dung dịch',
      table: { head: ['Dung dịch', 'Tế bào co'], rows: ks.map(k => [SOL[k].name, (st.done[k] || 0) + '%']).concat([['Nước cất sau ưu trương', st.recovered ? 'Phản co ✓' : '…']]) },
      chart: { labels: ks.map(k => SOL[k].name), yLabel: '% tế bào co', max: 100, series: [{ name: 'Tế bào co nguyên sinh', color: '#9B4FC4', values: ks.map(k => st.done[k] || 0) }] },
      conclusion: 'Dung dịch ưu trương → nước đi ra khỏi tế bào → co nguyên sinh; thêm nước cất → nước đi vào → phản co'
    };
  }

  NL.lab.register('2B', { goal: 'Tế bào thay đổi thế nào khi ở trong dung dịch đậm hơn hoặc loãng hơn dịch tế bào?', build, steps, cleanup() { if (st && st.raf) cancelAnimationFrame(st.raf); } });
})();
