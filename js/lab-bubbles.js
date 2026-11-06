// Thí nghiệm 2A: đếm bọt khí của cành rong theo khoảng cách đèn.
(function () {
  const BX = 480;                 // tâm cốc
  let st;                          // trạng thái riêng của lần làm này

  // số bọt trong 15 giây: tăng theo cường độ sáng rồi chững lại (điểm bão hoà ánh sáng)
  // nhiệt độ: tối ưu khoảng 30 °C, trên 45 °C enzyme quang hợp bị biến tính
  function fT(T) { if (T <= 0 || T > 45) return 0; const x = T / 30; let f = x * Math.exp(1 - x); if (T > 35) f *= (45 - T) / 10; return f; }
  // NaHCO₃ cung cấp CO₂ cho quang hợp
  function gC(C) { return 0.15 + 0.85 * C / (C + 0.8); }
  function rate(d, T, C) {
    const I = Math.pow(10 / d, 2);
    return 40 * I / (I + 0.35) * fT(T === undefined ? st.T : T) * gC(C === undefined ? st.C : C);
  }
  const LX = cm => 605 + cm * 3.2;
  const DUR = 15; // mỗi lần đếm 15 giây

  // Cành rong vẽ dốc ngược: ngọn ở dưới, đầu cắt vát hướng lên (bọt O₂ thoát ra từ vết cắt)
  function drawElodea(api, g) {
    const el = api.el;
    const stemD = 'M0 0 C 3 -20, -4 -45, 1 -70 C 4 -85, -2 -95, 0 -100';
    el('path', { d: stemD, stroke: '#1F6E3C', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g);
    el('path', { d: stemD, stroke: '#5DBB7A', 'stroke-width': 1.2, fill: 'none', opacity: .7 }, g);
    const sx = y => { const t = -y / 100; return 3 * Math.sin(t * Math.PI) * (t < 0.7 ? 1 : -1) * 0.6; }; // thân hơi cong
    // các đốt: mỗi đốt một vòng 8–10 lá sợi xẻ đôi; càng về ngọn (y gần 0) càng dày, lá ngắn
    for (let k = 0; k < 9; k++) {
      const y = -8 - k * 11, n = k < 3 ? 10 : 8, len = k < 3 ? 14 + k * 3 : 22 + (k % 2) * 3, cx = sx(y);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + k * 0.4, dx = Math.cos(a), dy = Math.sin(a) * 0.45 - 0.55; // lá hơi hướng lên theo thân (ngọn xuống dưới)
        const x1 = cx + dx * len, y1 = y + dy * len, mx = cx + dx * len * 0.55, my = y + dy * len * 0.55;
        const col = i % 3 === 0 ? '#2E9E5B' : i % 3 === 1 ? '#49B873' : '#7FD39A';
        el('path', { d: `M${cx} ${y} Q${mx + dy * 3} ${my - dx * 3} ${x1} ${y1}`, stroke: col, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }, g);
        // lá xẻ nhánh: nhánh phụ ở giữa lá
        el('path', { d: `M${mx} ${my} l${dx * len * 0.35 - dy * 5} ${dy * len * 0.35 + dx * 5}`, stroke: col, 'stroke-width': 1.2, fill: 'none', 'stroke-linecap': 'round' }, g);
      }
      el('circle', { cx, cy: y, r: 2, fill: '#1F6E3C' }, g);
    }
    // đầu cắt vát ở trên
    el('path', { d: 'M-3 -100 L4 -104', stroke: '#E8F5E9', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
    el('path', { d: 'M-3 -101 L4 -105', stroke: '#1F6E3C', 'stroke-width': 1, 'stroke-linecap': 'round' }, g);
  }

  function build(api) {
    const L = api.svg, el = api.el;
    st = { d: 25, T: 25, C: 2, auto: true, rows: [], lampOn: false, bubbles: [], timer: null };
    // thước đo
    const ruler = api.g(L, 0, 0);
    el('rect', { x: 592, y: 470, width: 352, height: 26, rx: 6, fill: '#FFF3C9', stroke: '#E2C779', 'stroke-width': 2 }, ruler);
    for (let cm = 10; cm <= 100; cm += 5) {
      const x = LX(cm);
      el('line', { x1: x, y1: 470, x2: x, y2: cm % 10 ? 478 : 484, stroke: '#8A6D1E', 'stroke-width': 2 }, ruler);
      if (cm % 20 === 0 || cm === 10) api.text(ruler, x, 494, cm + '', 13, '#8A6D1E', 700);
    }
    api.text(ruler, 592, 512, 'cm', 13, '#8A6D1E', 700);

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
    api.text(bk, 0, 525, 'Cốc nước có NaHCO₃', 15, '#6C88A3', 700);
    st.beaker = bk;
    // phễu thủy tinh úp ngược trong cốc (SGK Sinh học 11, Bài 5): cành rong đặt trong phễu, ống nghiệm úp lên cuống phễu
    st.funnel = api.g(L, BX, 0);
    el('path', { d: 'M-64 438 L-10 332 L-10 262 L10 262 L10 332 L64 438 Z', fill: 'rgba(225,240,250,.35)', stroke: '#8FBBD8', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, st.funnel);
    el('line', { x1: -6, y1: 268, x2: -6, y2: 330, stroke: 'rgba(255,255,255,.7)', 'stroke-width': 2 }, st.funnel);
    api.text(st.funnel, -96, 300, 'Phễu', 13, '#6C88A3', 700);
    // bình nước chắn nhiệt giữa đèn và cốc: hấp thụ bớt tia nhiệt để nước trong cốc không nóng lên
    const shield = api.g(L, 582, 0);
    el('rect', { x: -14, y: 246, width: 28, height: 204, rx: 8, fill: 'rgba(150,210,245,.5)', stroke: '#9CC7E3', 'stroke-width': 3 }, shield);
    el('rect', { x: -9, y: 232, width: 18, height: 16, rx: 3, fill: '#9CC7E3' }, shield);
    el('rect', { x: -9, y: 258, width: 4, height: 180, rx: 2, fill: 'rgba(255,255,255,.6)' }, shield);
    api.text(shield, 0, 225, 'Chắn nhiệt', 11, '#6C88A3', 700);

    // cành rong đuôi chó (Ceratophyllum demersum): thân mảnh, lá dạng sợi xẻ nhánh mọc vòng quanh đốt, ngọn xếp dày
    const jar = api.g(L, 200, 0);
    el('rect', { x: -40, y: 380, width: 80, height: 72, rx: 10, fill: 'rgba(150,210,245,.5)', stroke: '#9CC7E3', 'stroke-width': 4 }, jar);
    api.text(jar, 0, 525, 'Cành rong', 15, '#6C88A3', 700);
    const rong = api.g(L, 200, 445);
    st.rong = rong; drawElodea(api, rong);

    // ống nghiệm trong giá (đầy nước, sẽ úp lên cuống phễu)
    const rack = api.g(L, 330, 0);
    el('rect', { x: -40, y: 420, width: 80, height: 34, rx: 6, fill: '#C99A6B' }, rack);
    api.text(rack, 0, 525, 'Ống nghiệm', 15, '#6C88A3', 700);
    const tube = api.g(L, 330, 430);
    el('path', { d: 'M-22 0 L-22 -200 A22 22 0 0 1 22 -200 L22 0', fill: 'rgba(200,235,255,.35)', stroke: '#8FBBD8', 'stroke-width': 4 }, tube);
    el('rect', { x: -14, y: -190, width: 6, height: 170, rx: 3, fill: 'rgba(255,255,255,.7)' }, tube);
    st.gas = el('rect', { x: -18, y: -210, width: 36, height: 0, rx: 14, fill: 'rgba(255,255,255,.95)' }, tube);
    st.tube = tube;

    // đèn
    const lamp = api.g(L, LX(st.d), 0);
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
    const rows = st.rows.map(r => `<tr><td>${r.d} cm</td><td>${r.T}°C</td><td>${r.C}%</td><td>${r.em}</td><td>${r.real}</td></tr>`).join('') || '<tr><td colspan="5">Chưa có số liệu</td></tr>';
    st.tableCard.innerHTML = `<table><tr><th>Đèn</th><th>T</th><th>NaHCO₃</th><th>Em đếm</th><th>Thực tế</th></tr>${rows}</table>`;
  }

  const steps = [
    {
      label: 'Chuẩn bị 1/3', text: 'Đặt cành rong (đầu cắt vát hướng lên) vào trong phễu úp ngược', hint: 'Giữ cành rong đang sáng, kéo thả vào giữa cốc nước, dưới phễu',
      enter(api) {
        sideCards(api);
        api.setOn(st.rong, true);
        api.draggable(st.rong, { target: { x: BX, y: 445, r: 110 }, onDrop: () => { st.funnel.parentNode.appendChild(st.funnel); api.done(); } });
      }
    },
    {
      label: 'Chuẩn bị 2/3', text: 'Úp ống nghiệm đầy nước lên cuống phễu', hint: 'Kéo ống nghiệm đang sáng vào cốc, trùm lên cuống phễu',
      enter(api) {
        api.setOn(st.tube, true);
        api.draggable(st.tube, { target: { x: BX, y: 332, r: 120 }, onDrop: () => api.done() });
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
      text: 'Chọn khoảng cách đèn, nhiệt độ và lượng NaHCO₃', hint: 'Mỗi lần đo chỉ đổi một yếu tố để so sánh, ví dụ chỉ đổi khoảng cách đèn',
      enter(api) {
        if (!st.rows.length && !api.prediction) api.ask({
          predict: true, q: 'Đèn càng gần cốc nước thì bọt khí sẽ…?',
          options: [{ t: 'Nhiều hơn' }, { t: 'Ít hơn' }, { t: 'Không thay đổi' }]
        });
        let tWarned = false;
        const check = () => {
          const dup = st.rows.some(x => Math.abs(x.d - st.d) < 5 && x.T === st.T && x.C === st.C);
          st.ctls[0].warn(dup ? 'Lần trước đã đo như vậy, đổi một yếu tố nhé' : '');
          if (dup) api.hideNext(); else api.done('Bắt đầu đếm ➜');
        };
        st.ctls = [
          api.slider({ label: 'Khoảng cách đèn', min: 10, max: 100, value: st.d, unit: 'cm', onInput(v) { st.d = v; api.tween(st.lamp, LX(v), 0, 60, updateLight); st.ctls && check(); } }),
          api.slider({
            label: 'Nhiệt độ nước', min: 0, max: 60, value: st.T, unit: '°C', onInput(v, c) {
              st.T = v; updateLight();
              c.warn(v > 45 ? 'Quá nóng: enzyme bị biến tính, rong ngừng quang hợp' : v < 5 ? 'Quá lạnh: quang hợp gần như dừng' : '');
              if (v > 45 && !tWarned) { tWarned = true; api.card({ kicker: '⚠️ Cảnh báo khoa học', text: 'Trên 45°C, enzyme tham gia quang hợp bị biến tính nên rong gần như không thải O₂ nữa.' }); }
              st.ctls && check();
            }
          }),
          api.slider({ label: 'NaHCO₃ (nguồn CO₂)', min: 0, max: 5, step: 0.5, value: st.C, unit: '%', onInput(v) { st.C = v; updateLight(); st.ctls && check(); } }),
          api.choices({ label: 'Cách đếm', items: [{ t: '🤖 Máy đếm', v: true }, { t: '👆 Tự đếm (thử thách)', v: false }], value: st.auto, onPick(v) { st.auto = v; } })
        ];
        check();
      },
      onNext(api) { (st.ctls || []).forEach(c => c.remove()); st.ctls = null; api.goto(4); }
    },
    {
      label: () => `Lần đo ${Math.min(3, st.rows.length + 1)}/3`,
      get text() { return st.auto ? 'Máy đang đếm bọt khí O₂ trong 15 giây' : 'Chạm vào từng bọt khí O₂ để đếm!'; }, get hint() { return st.auto ? 'Quan sát bọt khí nổi lên. Đèn càng gần, bọt càng nhiều?' : 'Mỗi bọt khí nổi lên trong ống, chạm vào là được tính. Hết 15 giây thì dừng'; },
      enter(api) { runCount(api); }
    },
    {
      label: () => `Lần đo ${st.rows.length}/3`,
      text: '', hint: 'Bấm nút ở góc dưới để đi tiếp',
      enter(api) {
        sideCards(api);
        const need = 3 - st.rows.length;
        document.getElementById('stepText').textContent = need > 0 ? `Đã ghi vào bảng. Đo thêm ${need} lần nữa, đổi một yếu tố` : 'Đủ 3 lần đo rồi!';
        api.done(need > 0 ? 'Đo lần nữa ➜' : 'Xem biểu đồ ➜');
      },
      onNext(api) { api.goto(st.rows.length < 3 ? 3 : 6); }
    },
    {
      label: 'Thử khí', text: 'Khí thu được trong ống nghiệm là gì? Đưa que đóm còn tàn đỏ vào miệng ống', hint: 'Chạm vào que đóm rồi chạm vào miệng ống nghiệm',
      enter(api) {
        st.gasH = Math.max(st.gasH || 0, 90); st.gas.setAttribute('height', st.gasH);
        api.say('Nhấc ống nghiệm ra, lật miệng ống lên trên rồi đưa que đóm còn tàn đỏ vào');
        const L = api.svg, el = api.el;
        st.gas.setAttribute('y', -st.gasH); st.tube._extra = ' rotate(180)'; api.tween(st.tube, BX + 60, 150, 700);
        const q = api.g(L, 760, 150);
        el('rect', { x: -4, y: -70, width: 8, height: 140, rx: 3, fill: '#C99A6B' }, q);
        st.ember = el('ellipse', { cx: 0, cy: -72, rx: 5, ry: 8, fill: '#E5534B' }, q);
        api.text(q, 0, 92, 'Que đóm còn tàn đỏ', 12, '#6C88A3', 700);
        api.setOn(q, true);
        api.tapable(q, () => {
          api.tween(q, BX + 60, 222, 500, () => {
            const fl = api.g(L, BX + 60, 150);
            el('path', { d: 'M0 0 C -14 -16, -10 -36, 0 -48 C 10 -36, 14 -16, 0 0 Z', fill: '#F7A531' }, fl);
            el('path', { d: 'M0 -4 C -7 -14, -5 -26, 0 -32 C 5 -26, 7 -14, 0 -4 Z', fill: '#FFE37A' }, fl);
            NL.audio.play('success');
            api.card({ kicker: '🔥 Que đóm bùng cháy', text: 'Que đóm còn tàn đỏ đưa vào miệng ống thì bùng cháy thành ngọn lửa: khí trong ống là O₂, sản phẩm của quang hợp.', sub: 'O₂ duy trì sự cháy. Nếu là CO₂ thì que đóm sẽ tắt.', btn: 'Xem biểu đồ ➜' }, () => { fl.remove(); q.remove(); api.goto(7); });
          });
        });
      }
    },
    {
      label: 'Kết quả', text: 'Biểu đồ số bọt khí theo khoảng cách đèn', hint: 'So cột xanh dương (em đếm) và cột xanh lá (thực tế)',
      enter(api) {
        api.showChart(result());
        api.done('Trả lời câu hỏi ➜');
      },
      onNext(api) { afterChart(api); }
    }
  ];

  function runCount(api) {
    const card = document.createElement('div'); card.className = 'slider-card';
    card.innerHTML = `<div>⏱ còn <span id="tVal">${DUR}</span> giây</div><div class="big-num">${st.auto ? 'Máy đếm' : 'Em đếm'}: <span id="cVal">0</span></div>`;
    api.side.prepend(card);
    const L = api.svg, per = rate(st.d) * (0.92 + Math.random() * 0.16);
    let t = 0, next = 0.6, em = 0, real = 0, last = performance.now(); st.gasH = st.gasH || 0;
    const bubbles = [];
    const tick = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      if (t < DUR) {
        next -= dt;
        if (next <= 0) {
          next = (DUR / per) * (0.6 + Math.random() * 0.8);
          real++;
          if (st.auto) { em++; card.querySelector('#cVal').textContent = em; }
          const gB = api.g(L, BX + (Math.random() * 8 - 4), 340);
          const r = 9 + Math.random() * 4;
          api.el('circle', { r: 32, fill: 'transparent' }, gB);
          api.el('circle', { r, fill: 'rgba(255,255,255,.85)', stroke: '#7FB9DC', 'stroke-width': 2 }, gB);
          api.el('circle', { r: r * 0.3, cx: -r * 0.3, cy: -r * 0.3, fill: '#fff' }, gB);
          gB.style.cursor = 'pointer';
          const b = { g: gB, vy: 70 + Math.random() * 30, wob: Math.random() * 6 };
          if (!st.auto) gB.addEventListener('pointerdown', e => {
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
        if (b.g._y < 150 + st.gasH && !b.dead) { b.dead = true; b.g.remove(); st.gasH = Math.min(150, st.gasH + 1.2); st.gas.setAttribute('height', st.gasH); }
      });
      card.querySelector('#tVal').textContent = Math.max(0, Math.ceil(DUR - t));
      if (t < DUR + 2.5) st.raf = requestAnimationFrame(tick);
      else {
        bubbles.forEach(b => b.g.remove());
        st.rows.push({ d: st.d, T: st.T, C: st.C, auto: st.auto, em, real }); st.rows.sort((a, b) => a.d - b.d);
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
      title: 'Đếm bọt khí rong', param: 'Khoảng cách đèn, nhiệt độ, NaHCO₃',
      table: { head: ['Lần', 'Khoảng cách đèn (cm)', 'Nhiệt độ (°C)', 'NaHCO₃ (%)', 'Thời gian (giây)', 'Em đếm', 'Thực tế', 'Cách đếm'], rows: rows.map((r, i) => [i + 1, r.d, r.T, r.C, DUR, r.em, r.real, r.auto ? 'Máy' : 'Tự đếm']) },
      chart: {
        labels: rows.map(r => `${r.d}cm·${r.T}°·${r.C}%`), yLabel: 'Số bọt / 15 giây',
        series: [{ name: 'Em đếm', color: '#5BB4EA', values: rows.map(r => r.em) }, { name: 'Thực tế', color: '#3FB37F', values: rows.map(r => r.real) }]
      },
      conclusion: 'Trong một giới hạn: ánh sáng càng mạnh (đèn càng gần), nhiệt độ thích hợp (khoảng 25–35°C) và đủ CO₂ (NaHCO₃) thì càng nhiều bọt khí O₂, quang hợp càng mạnh',
      note: 'Quá điểm bão hoà ánh sáng thì quang hợp không tăng nữa. Trên 45°C enzyme bị biến tính nên quang hợp gần như dừng.'
    };
  }

  // Sau biểu đồ: so với điều em đã đoán, hỏi vì sao, rồi 3 câu kiểm tra.
  function afterChart(api) {
    const pred = api.prediction, right = 'Nhiều hơn';
    api.card({
      kicker: '🔁 So với điều em đoán',
      text: pred ? (pred === right ? `Em đoán "${pred}". Kết quả đo: đúng như em đoán! 🎯` : `Em đoán "${pred}". Kết quả đo: đèn gần thì bọt khí nhiều hơn.`) : 'Kết quả đo: đèn gần thì bọt khí nhiều hơn.',
      sub: 'Nhưng chỉ tăng trong một giới hạn: tới điểm bão hoà ánh sáng thì gần như không tăng nữa.'
    }, () => api.askAll(QUIZ.slice(0, 2).concat(api.bank(3)), () => api.finish(result())));
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
