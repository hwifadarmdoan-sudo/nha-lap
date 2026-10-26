// Thí nghiệm 2A: đếm bọt khí của cành rong theo khoảng cách đèn.
(function () {
  const BX = 480;                 // tâm cốc
  let st;                          // trạng thái riêng của lần làm này

  function rate(d) { const I = Math.pow(10 / d, 2); return 60 * I / (I + 0.35); } // số bọt / phút

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
      text: 'Kéo cành rong vào cốc nước', hint: 'Giữ cành rong đang sáng, kéo thả vào giữa cốc nước',
      enter(api) {
        sideCards(api);
        api.setOn(st.rong, true);
        api.draggable(st.rong, { target: { x: BX, y: 440, r: 110 }, onDrop: () => api.done() });
      }
    },
    {
      text: 'Úp ống nghiệm lên cành rong', hint: 'Kéo ống nghiệm đang sáng vào cốc, trùm lên cành rong',
      enter(api) {
        api.setOn(st.tube, true);
        api.draggable(st.tube, { target: { x: BX, y: 430, r: 120 }, onDrop: () => api.done() });
      }
    },
    {
      text: 'Bật đèn', hint: 'Chạm vào nút đỏ ở chân đèn',
      enter(api) {
        api.setOn(st.sw, true);
        api.tapable(st.sw, () => { st.lampOn = true; NL.audio.play('hum'); updateLight(); api.done(); });
      }
    },
    {
      text: 'Kéo thanh để chọn khoảng cách đèn', hint: 'Kéo thanh trượt bên phải. Mỗi lần đo chọn một khoảng cách khác nhau',
      enter(api) {
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
      text: 'Chạm vào từng bọt khí để đếm!', hint: 'Mỗi bọt khí nổi lên trong ống, chạm vào là được tính. Hết 1 phút thì dừng',
      enter(api) { runCount(api); }
    },
    {
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
      text: 'Biểu đồ số bọt khí theo khoảng cách đèn', hint: 'So cột xanh dương (em đếm) và cột xanh lá (thực tế)',
      enter(api) {
        const res = result();
        const fo = api.el('foreignObject', { x: 150, y: 20, width: 700, height: 420 }, api.svg);
        const div = document.createElement('div');
        div.style.cssText = 'background:#fff;border-radius:20px;padding:10px 16px;box-shadow:0 6px 0 rgba(31,78,121,.18);font-family:Baloo 2;height:100%;box-sizing:border-box';
        div.innerHTML = NL.chartSVG(res.chart, 660, 330) + `<div style="font-weight:800;color:#1F4E79;font-size:17px;text-align:center">${res.conclusion}</div>`;
        fo.appendChild(div);
        api.done('Hoàn thành 🎉');
      },
      onNext(api) { api.finish(result()); }
    }
  ];

  function runCount(api) {
    const card = document.createElement('div'); card.className = 'slider-card';
    card.innerHTML = `<div>⏱ <span id="tVal">0:00</span> / 1:00</div><div class="big-num">Em đếm: <span id="cVal">0</span></div>`;
    api.side.prepend(card);
    const L = api.svg, per = rate(st.d) * (0.92 + Math.random() * 0.16);
    const DUR = 20; // 1 phút thí nghiệm = 20 giây thật
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
          const r = 6 + Math.random() * 4;
          api.el('circle', { r: 24, fill: 'transparent' }, gB);
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
      const sec = Math.min(60, Math.floor(t / DUR * 60));
      card.querySelector('#tVal').textContent = '0:' + String(sec).padStart(2, '0');
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
      table: { head: ['Khoảng cách', 'Em đếm', 'Thực tế'], rows: rows.map(r => [r.d + ' cm', r.em, r.real]) },
      chart: {
        labels: rows.map(r => r.d + ' cm'), yLabel: 'Số bọt / phút',
        series: [{ name: 'Em đếm', color: '#5BB4EA', values: rows.map(r => r.em) }, { name: 'Thực tế', color: '#3FB37F', values: rows.map(r => r.real) }]
      },
      conclusion: 'Đèn càng gần → càng nhiều bọt khí (O₂) → quang hợp càng mạnh'
    };
  }

  NL.lab.register('2A', { build, steps, cleanup() { if (st && st.raf) cancelAnimationFrame(st.raf); } });
})();
