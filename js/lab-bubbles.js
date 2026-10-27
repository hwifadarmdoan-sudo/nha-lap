// Thí nghiệm 2A: đếm bọt khí của cành rong theo khoảng cách đèn.
(function () {
  const BX = 480;                 // tâm cốc
  let st;                          // trạng thái riêng của lần làm này

  // số bọt trong 15 giây: tăng theo cường độ sáng rồi chững lại (điểm bão hoà ánh sáng)
  function rate(d) { const I = Math.pow(10 / d, 2); return 30 * I / (I + 0.35); }
  const DUR = 15; // mỗi lần đếm 15 giây

  function build(api) {
    const L = api.svg, el = api.el;
    st = { d: 25, rows: [], lampOn: false, bubbles: [], timer: null };
    // thước đo
    const ruler = api.g(L, 0, 0);
    el('rect', { x: 548, y: 470, width: 380, height: 26, rx: 6, fill: '#FFF3C9', stroke: '#E2C779', 'stroke-width': 2 }, ruler);
    for (let cm = 10; cm <= 50; cm += 5) {
      const x = 560 + cm * 7;
      el('line', { x1: x, y1: 470, x2: x, y2: cm % 10 ? 478 : 484, stroke: '#8A6D1E', 'stroke-width': 2 }, ruler);
      if (cm % 10 === 0) api.text(ruler, x, 494, cm + '', 13, '#8A6D1E', 700);
    }
    api.text(ruler, 548, 512, 'cm', 13, '#8A6D1E', 700);

    // ánh sáng (vẽ trước cốc)
    st.light = el('polygon', { points: '', fill: 'url(#lightGrad)', opacity: 0 }, L);
    const defs = el('defs', {}, L);
    const lg = el('linearGradient', { id: 'lightGrad', x1: '1', y1: '0', x2: '0', y2: '0' }, defs);
    el('stop', { offset: '0', 'stop-color': '#FFE680', 'stop-opacity': '.9' }, lg);
    el('stop', { offset: '1', 'stop-color': '#FFE680', 'stop-opacity': '0' }, lg);

    // cốc nước
    const bk = api.g(L, BX, 0);
    el('rect', { x: -75, y: 240, width: 150, height: 210, rx: 10, fill: 'rgba(150,210,245,.55)' }, bk);
    el('rect', { x: -78, y: 215, width: 156, height: 238, rx: 12, fill: 'none', stroke: '#9CC7E3', 'stroke-width': 5 }, bk);
    el('rect', { x: -60, y: 250, width: 10, height: 180, rx: 5, fill: 'rgba(255,255,255,.6)' }, bk);
    api.text(bk, 0, 525, 'Cốc nước', 15, '#6C88A3', 700);
    st.beaker = bk;

    // cành rong (lúc đầu nằm trong lọ bên trái)
    const jar = api.g(L, 200, 0);
    el('rect', { x: -40, y: 380, width: 80, height: 72, rx: 10, fill: 'rgba(150,210,245,.5)', stroke: '#9CC7E3', 'stroke-width': 4 }, jar);
    api.text(jar, 0, 525, 'Cành rong', 15, '#6C88A3', 700);
    const rong = api.g(L, 200, 440);
    el('path', { d: 'M0 0 C -4 -40, 4 -70, 0 -110', stroke: '#2E8B57', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, rong);
    for (let k = 0; k < 7; k++) {
      const y = -12 - k * 14;
      [-1, 1].forEach(s => el('ellipse', { cx: s * 13, cy: y, rx: 14, ry: 4, fill: k % 2 ? '#3FB37F' : '#58C08A', transform: `rotate(${s * -25} ${s * 13} ${y})` }, rong));
    }
    st.rong = rong;

    // ống nghiệm trong giá
    const rack = api.g(L, 330, 0);
    el('rect', { x: -40, y: 420, width: 80, height: 34, rx: 6, fill: '#C99A6B' }, rack);
    api.text(rack, 0, 525, 'Ống nghiệm', 15, '#6C88A3', 700);
    const tube = api.g(L, 330, 430);
    el('path', { d: 'M-22 0 L-22 -290 A22 22 0 0 1 22 -290 L22 0', fill: 'rgba(200,235,255,.35)', stroke: '#8FBBD8', 'stroke-width': 4 }, tube);
    el('rect', { x: -14, y: -280, width: 6, height: 250, rx: 3, fill: 'rgba(255,255,255,.7)' }, tube);
    st.gas = el('rect', { x: -18, y: -300, width: 36, height: 0, rx: 14, fill: 'rgba(255,255,255,.95)' }, tube);
    st.tube = tube;

    // đèn
    const lamp = api.g(L, 560 + st.d * 7, 0);
    el('rect', { x: -30, y: 440, width: 60, height: 14, rx: 7, fill: '#4A5A6A' }, lamp);
    el('rect', { x: -4, y: 250, width: 8, height: 192, fill: '#6B7B8B' }, lamp);
    el('path', { d: 'M4 236 L-46 216 L-46 300 L4 280 Z', fill: '#2F80C0' }, lamp);
    st.bulb = el('ellipse', { cx: -46, cy: 258, rx: 10, ry: 40, fill: '#DDD' }, lamp);
    const sw = api.g(lamp, 0, 0);
    el('circle', { cx: 0, cy: 425, r: 16, fill: '#E5534B', stroke: '#fff', 'stroke-width': 4 }, sw);
    api.text(sw, 0, 431, '⏻', 16, '#fff', 800);
    api.text(lamp, 0, 205, 'Đèn', 15, '#6C88A3', 700);
    st.lamp = lamp; st.sw = sw;
  }

  function updateLight() {
    const lx = st.lamp._x - 46;
    st.light.setAttribute('points', `${lx},218 ${lx},298 ${BX + 30},460 ${BX + 30},120`);
    st.light.setAttribute('opacity', st.lampOn ? Math.min(1, 0.25 + rate(st.d) / 60) : 0);
    st.bulb.setAttribute('fill', st.lampOn ? '#FFE680' : '#DDD');
  }

  function sideCards(api) {
    const side = api.side;
    if (!st.tableCard) {
      st.tableCard = document.createElement('div'); st.tableCard.className = 'data-card';
      side.appendChild(st.tableCard);
    }
    const rows = st.rows.map(r => `<tr><td>${r.d} cm</td><td>${r.em}</td><td>${r.real}</td></tr>`).join('') || '<tr><td colspan="3">Chưa có số liệu</td></tr>';
    st.tableCard.innerHTML = `<table><tr><th>Khoảng cách</th><th>Em đếm</th><th>Thực tế</th></tr>${rows}</table>`;
  }

  const steps = [
    {
      label: 'Chuẩn bị 1/3', text: 'Kéo cành rong vào cốc nước', hint: 'Giữ cành rong đang sáng, kéo thả vào giữa cốc nước',
      enter(api) {
        sideCards(api);
        api.setOn(st.rong, true);
        api.draggable(st.rong, { target: { x: BX, y: 440, r: 110 }, onDrop: () => api.done() });
      }
    },
    {
      label: 'Chuẩn bị 2/3', text: 'Úp ống nghiệm lên cành rong', hint: 'Kéo ống nghiệm đang sáng vào cốc, trùm lên cành rong',
      enter(api) {
        api.setOn(st.tube, true);
        api.draggable(st.tube, { target: { x: BX, y: 430, r: 120 }, onDrop: () => api.done() });
      }
    },
    {
      label: 'Chuẩn bị 3/3', text: 'Bật đèn', hint: 'Chạm vào nút đỏ ở chân đèn',
      enter(api) {
        api.setOn(st.sw, true);
        api.tapable(st.sw, () => { st.lampOn = true; NL.audio.play('hum'); updateLight(); api.done(); });
      }
    },
    {
      label: () => `Lần đo ${Math.min(3, st.rows.length + 1)}/3`,
      text: 'Kéo thanh để chọn khoảng cách đèn', hint: 'Kéo thanh trượt bên phải. Mỗi lần đo chọn một khoảng cách khác nhau',
      enter(api) {
        if (!st.rows.length && !api.prediction) api.ask({
          predict: true, q: 'Đèn càng gần cốc nước thì bọt khí sẽ…?',
          options: [{ t: 'Nhiều hơn' }, { t: 'Ít hơn' }, { t: 'Không thay đổi' }]
        });
        const card = document.createElement('div'); card.className = 'slider-card';
        card.innerHTML = `<div>Khoảng cách đèn</div><div class="big-num"><span id="dVal">${st.d}</span> cm</div><input type="range" min="10" max="50" step="1" value="${st.d}" id="dRange"><div id="dWarn" style="color:#E5534B;font-size:14px"></div>`;
        api.side.prepend(card); st.slider = card;
        const r = card.querySelector('#dRange');
        const check = () => {
          st.d = +r.value; card.querySelector('#dVal').textContent = st.d;
          api.tween(st.lamp, 560 + st.d * 7, 0, 60, updateLight);
          const dup = st.rows.some(x => Math.abs(x.d - st.d) < 5);
          card.querySelector('#dWarn').textContent = dup ? 'Chọn khoảng cách khác lần trước nhé' : '';
          if (dup) document.getElementById('btnNext').classList.add('hidden'); else api.done('Bắt đầu đếm ➜');
        };
        r.addEventListener('input', check); check();
      },
      onNext(api) { if (st.slider) { st.slider.remove(); st.slider = null; } api.goto(4); }
    },
    {
      label: () => `Lần đo ${Math.min(3, st.rows.length + 1)}/3`,
      text: 'Chạm vào từng bọt khí O₂ để đếm!', hint: 'Mỗi bọt khí nổi lên trong ống, chạm vào là được tính. Hết 15 giây thì dừng',
      enter(api) { runCount(api); }
    },
    {
      label: () => `Lần đo ${st.rows.length}/3`,
      text: '', hint: 'Bấm nút ở góc dưới để đi tiếp',
      enter(api) {
        sideCards(api);
        const need = 3 - st.rows.length;
        document.getElementById('stepText').textContent = need > 0 ? `Đã ghi vào bảng. Đo thêm ${need} khoảng cách nữa` : 'Đủ 3 khoảng cách rồi!';
        api.done(need > 0 ? 'Đo khoảng cách khác ➜' : 'Xem biểu đồ ➜');
      },
      onNext(api) { api.goto(st.rows.length < 3 ? 3 : 6); }
    },
    {
      label: 'Kết quả', text: 'Biểu đồ số bọt khí theo khoảng cách đèn', hint: 'So cột xanh dương (em đếm) và cột xanh lá (thực tế)',
      enter(api) {
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

  function runCount(api) {
    const card = document.createElement('div'); card.className = 'slider-card';
    card.innerHTML = `<div>⏱ còn <span id="tVal">${DUR}</span> giây</div><div class="big-num">Em đếm: <span id="cVal">0</span></div>`;
    api.side.prepend(card);
    const L = api.svg, per = rate(st.d) * (0.92 + Math.random() * 0.16);
    let t = 0, next = 0.6, em = 0, real = 0, last = performance.now(), gasH = 0;
    const bubbles = [];
    const tick = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      if (t < DUR) {
        next -= dt;
        if (next <= 0) {
          next = (DUR / per) * (0.6 + Math.random() * 0.8);
          real++;
          const gB = api.g(L, BX + (Math.random() * 12 - 6), 330);
          const r = 9 + Math.random() * 4;
          api.el('circle', { r: 32, fill: 'transparent' }, gB);
          api.el('circle', { r, fill: 'rgba(255,255,255,.85)', stroke: '#7FB9DC', 'stroke-width': 2 }, gB);
          api.el('circle', { r: r * 0.3, cx: -r * 0.3, cy: -r * 0.3, fill: '#fff' }, gB);
          gB.style.cursor = 'pointer';
          const b = { g: gB, vy: 70 + Math.random() * 30, wob: Math.random() * 6 };
          gB.addEventListener('pointerdown', e => {
            e.stopPropagation(); if (b.dead) return; b.dead = true; em++;
            NL.audio.play('bubble'); card.querySelector('#cVal').textContent = em;
            gB.style.transition = 'opacity .15s'; gB.style.opacity = 0; setTimeout(() => gB.remove(), 160);
          });
          bubbles.push(b);
        }
      }
      bubbles.forEach(b => {
        if (b.dead && !b.g.parentNode) return;
        b.g._y -= b.vy * dt; b.g._x += Math.sin(t * 6 + b.wob) * 0.3; api.place(b.g);
        if (b.g._y < 150 && !b.dead) { b.dead = true; b.g.remove(); gasH = Math.min(60, gasH + 0.8); st.gas.setAttribute('height', gasH); }
      });
      card.querySelector('#tVal').textContent = Math.max(0, Math.ceil(DUR - t));
      if (t < DUR + 2.5) st.raf = requestAnimationFrame(tick);
      else {
        bubbles.forEach(b => b.g.remove());
        st.rows.push({ d: st.d, em, real }); st.rows.sort((a, b) => a.d - b.d);
        card.remove(); NL.audio.play('pop');
        NL.game.toast(`Em đếm ${em} bọt, thực tế có ${real} bọt`);
        api.goto(5);
      }
    };
    st.raf = requestAnimationFrame(tick);
  }

  function result() {
    const rows = st.rows.slice().sort((a, b) => a.d - b.d);
    return {
      title: 'Đếm bọt khí rong', param: 'Khoảng cách đèn',
      table: { head: ['Khoảng cách', 'Em đếm (15 giây)', 'Thực tế'], rows: rows.map(r => [r.d + ' cm', r.em, r.real]) },
      chart: {
        labels: rows.map(r => r.d + ' cm'), yLabel: 'Số bọt / 15 giây',
        series: [{ name: 'Em đếm', color: '#5BB4EA', values: rows.map(r => r.em) }, { name: 'Thực tế', color: '#3FB37F', values: rows.map(r => r.real) }]
      },
      conclusion: 'Trong một giới hạn: đèn càng gần → ánh sáng càng mạnh → càng nhiều bọt khí O₂ → quang hợp càng mạnh',
      note: 'Quá điểm bão hoà ánh sáng thì quang hợp không tăng nữa; đèn quá gần còn làm nóng nước.'
    };
  }

  // Sau biểu đồ: so với điều em đã đoán, hỏi vì sao, rồi 3 câu kiểm tra.
  function afterChart(api) {
    const pred = api.prediction, right = 'Nhiều hơn';
    api.card({
      kicker: '🔁 So với điều em đoán',
      text: pred ? (pred === right ? `Em đoán "${pred}". Kết quả đo: đúng như em đoán! 🎯` : `Em đoán "${pred}". Kết quả đo: đèn gần thì bọt khí nhiều hơn.`) : 'Kết quả đo: đèn gần thì bọt khí nhiều hơn.',
      sub: 'Nhưng chỉ tăng trong một giới hạn: tới điểm bão hoà ánh sáng thì gần như không tăng nữa.'
    }, () => api.askAll(QUIZ, () => api.finish(result())));
  }
  const QUIZ = [
    {
      kicker: '❓ Vì sao?', q: 'Vì sao đèn càng gần thì bọt khí càng nhiều?',
      options: [
        { t: 'Ánh sáng mạnh hơn nên rong quang hợp mạnh hơn, thải nhiều O₂ hơn', ok: true },
        { t: 'Đèn làm nước nóng lên và sôi ra bọt', why: 'Nước trong cốc chỉ ấm lên chút ít, chưa thể sôi. Bọt khí này sinh ra từ lá rong.' },
        { t: 'Rong hô hấp mạnh hơn nên thải nhiều CO₂', why: 'Khí thu được trong ống làm que đóm còn tàn đỏ bùng cháy. Khí nào giúp sự cháy?' }
      ],
      explain: 'Ánh sáng là nguồn năng lượng cho quang hợp. Sáng mạnh hơn thì quang hợp nhanh hơn, thải nhiều O₂ hơn (trong một giới hạn).'
    },
    {
      q: 'Bọt khí nổi lên từ cành rong chủ yếu là khí gì?',
      options: [{ t: 'Khí O₂', ok: true }, { t: 'Khí CO₂', why: 'CO₂ là khí cây lấy vào để quang hợp. Cây thải ra khí nào?' }, { t: 'Hơi nước', why: 'Hơi nước không tạo bọt trong nước lạnh. Nhớ lại sản phẩm khí của quang hợp nhé.' }],
      explain: 'Quang hợp lấy CO₂, thải ra O₂.'
    },
    {
      q: 'Nếu cứ đưa đèn sát hơn nữa, số bọt khí sẽ thế nào?',
      options: [
        { t: 'Tăng mãi không ngừng', why: 'Quang hợp có tăng mãi được không? Nhớ lại điểm bão hoà ánh sáng.' },
        { t: 'Tăng tới một mức rồi gần như không tăng nữa', ok: true },
        { t: 'Giảm ngay về 0', why: 'Đèn gần hơn thì ánh sáng mạnh hơn, quang hợp không thể dừng ngay được.' }
      ],
      explain: 'Đến điểm bão hoà ánh sáng thì quang hợp không tăng nữa. Đèn quá gần còn làm nóng nước, có hại cho rong.'
    },
    {
      q: 'Trong thí nghiệm này, em đã thay đổi yếu tố nào?',
      options: [{ t: 'Khoảng cách từ đèn tới cốc', ok: true }, { t: 'Loại cây rong', why: 'Em dùng một cành rong suốt cả bài. Em đã kéo thanh trượt để đổi gì?' }, { t: 'Lượng nước trong cốc', why: 'Cốc nước giữ nguyên. Em đã kéo thanh trượt để đổi gì?' }],
      explain: 'Chỉ thay đổi một yếu tố (khoảng cách đèn), giữ nguyên các yếu tố khác thì mới so sánh được.'
    }
  ];

  NL.lab.register('2A', { goal: 'Ánh sáng mạnh hay yếu ảnh hưởng thế nào tới quang hợp của cành rong?', build, steps, cleanup() { if (st && st.raf) cancelAnimationFrame(st.raf); } });
})();
