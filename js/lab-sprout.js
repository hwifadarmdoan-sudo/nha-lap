// Thí nghiệm 2H: điều kiện nảy mầm của hạt. Bốn đĩa Petri, mỗi đĩa một điều kiện, tua nhanh 10 ngày.
(function () {
  const DAYS = 10, DX = [110, 270, 430, 590], DY = 420;
  const WATER = { wet: '💧 Đủ ẩm', dry: '🏜 Khô', flood: '🌊 Ngập' };
  let st, api0;

  const fT = T => (T < 10 || T > 40) ? 0 : Math.max(0.15, 1 - Math.pow((T - 27.5) / 15, 2));
  const canGrow = d => d.water === 'wet' && d.o2 && d.good && fT(d.T) > 0;
  const tgOf = (d, s) => 1.2 * (2 - s.k) / Math.max(0.15, fT(d.T)); // ngày bắt đầu nhú rễ
  const lenAt = (d, s, day) => (!canGrow(d) || !s.viable || day < tgOf(d, s)) ? 0 : 8 * fT(d.T) * (d.light ? 1 : 2.8) * s.k * (day - tgOf(d, s));
  const stageTxt = d => !canGrow(d) ? 'Không nảy mầm' : d.light ? 'Thân ngắn mập, lá xanh' : 'Thân vọt dài, vàng nhạt';

  function newSeeds(d) {
    d.seeds = [];
    for (let i = 0; i < d.N; i++) {
      let x, y, tries = 0;
      do { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.82; x = Math.cos(a) * r * 64; y = Math.sin(a) * r * 40; tries++; }
      while (tries < 30 && d.seeds.some(s => Math.hypot(s.x - x, (s.y - y) * 1.5) < 13));
      const dl = (Math.random() + Math.random() + Math.random() - 1.5) * 0.3;
      d.seeds.push({ x, y, viable: Math.random() < 0.93, k: 1 + dl, lean: (Math.random() - 0.5) * 30, counted: false });
    }
  }

  function build(api) {
    api0 = api;
    const L = api.svg, el = api.el;
    st = { day: 0, sel: 0, speed: 1, dishes: [], hist: [] };
    for (let i = 0; i < 4; i++) {
      const d = { i, N: 10, water: 'wet', T: 27, o2: true, light: true, good: true, seeds: [] };
      const g = api.g(L, DX[i], DY);
      d.bg = el('ellipse', { cx: 0, cy: 0, rx: 74, ry: 48, fill: '#EAF3FA', stroke: '#9CC7E3', 'stroke-width': 4 }, g);
      d.cotton = el('ellipse', { cx: 0, cy: 2, rx: 66, ry: 41, fill: '#FFFFFF' }, g);
      d.flood = el('ellipse', { cx: 0, cy: 0, rx: 70, ry: 45, fill: 'rgba(90,170,230,.45)', opacity: 0 }, g);
      d.plants = api.g(g, 0, 0);
      d.jar = el('path', { d: 'M-80 30 L-80 -60 Q-80 -150 0 -150 Q80 -150 80 -60 L80 30', fill: 'rgba(200,225,245,.18)', stroke: '#9CC7E3', 'stroke-width': 3, opacity: 0 }, g);
      d.jarTxt = api.text(g, 0, -120, 'N₂, không O₂', 13, '#2F80C0', 800); d.jarTxt.setAttribute('opacity', 0);
      d.tag = api.text(g, 0, 78, '', 13, '#1F4E79', 800);
      api.text(g, 0, 96, 'Đĩa ' + (i + 1), 14, '#6C88A3', 800);
      d.g = g; st.dishes.push(d);
    }
    st.pack = api.g(L, 760, 470);
    el('rect', { x: -34, y: -44, width: 68, height: 56, rx: 8, fill: '#F2C94C', stroke: '#C99A1E', 'stroke-width': 3 }, st.pack);
    api.text(st.pack, 0, -12, '🫘', 22, '#333', 800);
    api.text(st.pack, 0, 30, 'Gói hạt', 13, '#6C88A3', 700);
    st.dishes.forEach(paint);
  }

  // vẽ lại một đĩa theo điều kiện và ngày hiện tại
  function paint(d) {
    const api = api0, dark = !d.light;
    d.bg.setAttribute('fill', dark ? '#2A2350' : '#EAF3FA');
    d.cotton.setAttribute('fill', d.water === 'dry' ? '#F4EEDF' : dark ? '#4A4180' : '#E8F4FF');
    d.flood.setAttribute('opacity', d.water === 'flood' ? 1 : 0);
    d.jar.setAttribute('opacity', d.o2 ? 0 : 1); d.jarTxt.setAttribute('opacity', d.o2 ? 0 : 1);
    d.tag.textContent = `${WATER[d.water].split(' ')[0]} ${d.T}°C ${d.o2 ? '' : 'không O₂ '}${d.light ? '☀️' : '🌑'}${d.good ? '' : ' luộc'}`;
    d.plants.innerHTML = '';
    d.seeds.forEach(s => {
      const Lmm = lenAt(d, s, st.day), h = Math.min(130, Lmm * 1.1);
      const g = api.g(d.plants, s.x, s.y), el = api.el;
      s.g = g;
      const rot = d.water === 'flood' && st.day > 3, swell = canGrow(d) && s.viable && st.day > tgOf(d, s) * 0.5;
      el('ellipse', { cx: 0, cy: 0, rx: swell ? 7 : 6, ry: swell ? 5.5 : 4.5, fill: rot ? '#7A6A4A' : d.good ? '#9BC25A' : '#C9B98A', stroke: '#5E7A2E', 'stroke-width': 1 }, g);
      if (Lmm > 0) {
        // rễ mầm
        el('path', { d: `M0 2 q${s.lean / 4} ${4 + Math.min(14, Lmm / 2)} ${s.lean / 6} ${6 + Math.min(18, Lmm / 1.5)}`, stroke: '#F4EBD0', 'stroke-width': 2, fill: 'none' }, g);
        if (Lmm > 4) {
          const top = -h, bend = s.lean;
          const stem = dark ? '#F3E58A' : '#5DB85A', leaf = dark ? '#FFF2A0' : '#3FA34D';
          el('path', { d: `M0 0 Q${bend / 2} ${top / 2} ${bend / 3} ${top}`, stroke: stem, 'stroke-width': dark ? 2 : 3.5, fill: 'none', 'stroke-linecap': 'round' }, g);
          if (dark) el('path', { d: `M${bend / 3} ${top} q6 -6 10 2`, stroke: stem, 'stroke-width': 2, fill: 'none' }, g); // ngọn cong móc câu
          if (Lmm > 12) [-1, 1].forEach(k => el('ellipse', { cx: bend / 3 + k * 7, cy: top - 2, rx: 7, ry: 3.5, fill: leaf, transform: `rotate(${k * 25} ${bend / 3 + k * 7} ${top - 2})` }, g));
          if (st.day > 7 && d.light && Lmm > 30) el('ellipse', { cx: bend / 3, cy: top - 9, rx: 5, ry: 8, fill: '#2E8B3E' }, g);
        }
      }
    });
  }

  function stats(d, day) {
    const g = d.seeds.filter(s => lenAt(d, s, day) > 0);
    return { n: g.length, pct: d.N ? Math.round(g.length / d.N * 100) : 0, avg: g.length ? g.reduce((a, s) => a + lenAt(d, s, day), 0) / g.length : 0 };
  }
  function table(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['Đĩa', 'Nảy mầm', '%', 'Dài TB']);
    st.tbl.set(st.dishes.map(d => { const s = stats(d, st.day); return [d.i + 1, `${s.n}/${d.N}`, s.pct + '%', s.avg.toFixed(0) + ' mm']; }));
  }

  // bảng chỉnh điều kiện cho đĩa đang chọn
  function setupPanel(api) {
    const card = api.panel('', 'slider-card cond-card');
    const row = (lab, key, items) => `<div class="cond-row"><span>${lab}</span><div class="seg">${items.map(([v, t]) => `<button class="seg-b pop" data-k="${key}" data-v="${v}">${t}</button>`).join('')}</div></div>`;
    const draw = () => {
      const d = st.dishes[st.sel];
      card.innerHTML = `<div class="seg">${st.dishes.map((x, i) => `<button class="seg-b pop ${i === st.sel ? 'on' : ''}" data-dish="${i}">Đĩa ${i + 1}</button>`).join('')}</div>`
        + row('Nước', 'water', Object.keys(WATER).map(k => [k, WATER[k]]))
        + row('Không khí', 'o2', [['1', 'Có O₂'], ['0', 'Không O₂']])
        + row('Ánh sáng', 'light', [['1', '☀️ Sáng'], ['0', '🌑 Tối']])
        + row('Hạt', 'good', [['1', 'Khỏe'], ['0', 'Luộc chín']])
        + `<div class="cond-row"><span>Nhiệt độ <b>${d.T}°C</b></span><input type="range" min="0" max="60" value="${d.T}" data-r="T"></div>`
        + `<div class="cond-row"><span>Số hạt <b>${d.N}</b></span><input type="range" min="5" max="30" value="${d.N}" data-r="N"></div>`;
      card.querySelectorAll('[data-k]').forEach(b => {
        const k = b.dataset.k, v = b.dataset.v, cur = k === 'water' ? d.water : d[k] ? '1' : '0';
        b.classList.toggle('on', cur === v);
        b.onclick = () => { NL.audio.play('click'); d[k] = k === 'water' ? v : v === '1'; paint(d); draw(); };
      });
      card.querySelectorAll('[data-dish]').forEach(b => { b.onclick = () => { NL.audio.play('click'); st.sel = +b.dataset.dish; draw(); }; });
      card.querySelectorAll('[data-r]').forEach(r => {
        r.oninput = () => { d[r.dataset.r] = +r.value; r.previousElementSibling.querySelector('b').textContent = r.value + (r.dataset.r === 'T' ? '°C' : ''); if (r.dataset.r === 'N') newSeeds(d); paint(d); };
        r.onchange = draw;
      });
    };
    draw();
  }

  const steps = [
    {
      label: 'Chuẩn bị', text: 'Rải hạt đậu lên lớp bông ẩm trong 4 đĩa Petri', hint: 'Kéo gói hạt vào khay đĩa',
      enter(api) {
        api.setOn(st.pack, true);
        api.draggable(st.pack, {
          target: { x: 350, y: 420, r: 260 }, snap: false, onDrop: () => {
            st.pack.style.display = 'none'; st.dishes.forEach(d => { newSeeds(d); paint(d); }); NL.audio.play('drop'); api.done();
          }
        });
      }
    },
    {
      label: 'Đặt điều kiện', text: 'Giữ Đĩa 1 làm đối chứng. Đổi một yếu tố ở mỗi đĩa còn lại', hint: 'Chọn đĩa ở hàng trên cùng, rồi bật tắt nước, không khí, ánh sáng, nhiệt độ',
      enter(api) {
        if (!api.prediction) api.ask({
          predict: true, q: 'Hạt cần những điều kiện nào để nảy mầm?',
          options: [{ t: 'Nước, không khí, nhiệt độ thích hợp' }, { t: 'Nước, ánh sáng, đất' }, { t: 'Chỉ cần nước' }]
        });
        setupPanel(api);
        api.done('Bắt đầu ⏵');
      },
      onNext(api) {
        const base = st.dishes[0], same = st.dishes.slice(1).filter(d => d.water === base.water && d.o2 === base.o2 && d.light === base.light && d.good === base.good && d.T === base.T);
        if (same.length === 3) {
          api.card({ kicker: '🤔 Khoan đã', text: 'Bốn đĩa đang giống hệt nhau nên không so sánh được.', sub: 'Mình đổi giúp em: Đĩa 2 để khô, Đĩa 3 để trong tối, Đĩa 4 không có O₂. Em vẫn chỉnh lại được.', btn: 'Đổi giúp em ➜' }, () => {
            const [, d2, d3, d4] = st.dishes; d2.water = 'dry'; d3.light = false; d4.o2 = false;
            st.dishes.forEach(paint); api.goto(1);
          });
          return;
        }
        api.goto(2);
      }
    },
    {
      label: 'Theo dõi', text: 'Tua nhanh 10 ngày và quan sát các đĩa', hint: 'Đĩa trong tối được soi bằng đèn buồng tối nên có màu tím',
      enter(api) {
        const card = api.panel(`<div>⏱ Thời gian</div><div class="big-num">Ngày <span id="spD">0</span></div><div class="rep-sub" id="spH"></div>`);
        api.choices({ label: 'Tốc độ', items: [{ t: '1 giờ/giây', v: 1 / 24 }, { t: '6 giờ/giây', v: 0.25 }, { t: '1 ngày/giây', v: 1 }], value: st.speed = 1, onPick(v) { st.speed = v; } });
        table(api);
        let nextLog = 0, darkTold = false, tick = 0;
        api.loop(dt => {
          st.day = Math.min(DAYS, st.day + dt * st.speed);
          card.querySelector('#spD').textContent = Math.floor(st.day);
          card.querySelector('#spH').textContent = Math.floor((st.day % 1) * 24) + ' giờ';
          if (st.day >= nextLog) { st.hist.push([nextLog, st.dishes.map(d => +stats(d, nextLog).avg.toFixed(1))]); nextLog += 1; }
          tick += dt; if (tick > 0.12) { tick = 0; st.dishes.forEach(paint); table(api); }
          if (!darkTold && st.day > 7 && st.dishes.some(d => !d.light && canGrow(d))) {
            darkTold = true;
            api.card({ kicker: '🔬 Giải thích khoa học', text: 'Trong tối, cây mầm dồn năng lượng để kéo dài thân, vươn tìm ánh sáng. Không có ánh sáng nên không tạo được diệp lục, thân vàng nhạt.', sub: 'Hiện tượng này gọi là cây bị vống (vọt mầm).' });
          }
          if (st.day >= DAYS) { st.dishes.forEach(paint); table(api); NL.audio.play('success'); api.done('Đếm mầm ➜'); return false; }
        });
      }
    },
    {
      label: 'Đếm mầm', text: 'Chạm vào từng hạt đã nảy mầm ở Đĩa 1 để đếm', hint: 'Hạt nảy mầm có rễ hoặc thân nhú ra. Đếm xong bấm Xong',
      enter(api) {
        table(api);
        const d = st.dishes[0];
        let n = 0;
        const card = api.panel(`<div>Em đếm ở Đĩa 1</div><div class="big-num"><span id="spC">0</span> hạt</div><button class="btn small pop" id="spOk">Xong</button>`);
        const hits = api.g(d.g, 0, 0);
        d.seeds.forEach(s => {
          const g = api.g(hits, s.x, s.y);
          const ring = api.el('circle', { r: 10, fill: 'none', stroke: '#F2C94C', 'stroke-width': 3, opacity: 0 }, g);
          api.el('circle', { r: 13, fill: 'transparent' }, g).style.cursor = 'pointer';
          g.addEventListener('pointerdown', e => {
            e.stopPropagation(); s.counted = !s.counted; n += s.counted ? 1 : -1; NL.audio.play('pop');
            ring.setAttribute('opacity', s.counted ? 1 : 0); card.querySelector('#spC').textContent = n;
          });
        });
        card.querySelector('#spOk').onclick = () => {
          const real = stats(d, DAYS).n; st.counted = n;
          NL.game.toast(n === real ? `Chính xác! Đĩa 1 có ${real}/${d.N} hạt nảy mầm` : `Đĩa 1 có ${real}/${d.N} hạt nảy mầm, em đếm ${n}`);
          card.remove(); api.done('Xem đồ thị ➜');
        };
      },
      onNext(api) { api.goto(4); }
    },
    {
      label: 'Kết quả', text: 'Chiều dài trung bình của mầm theo thời gian', hint: 'So đĩa trong tối với đĩa ngoài sáng',
      enter(api) { api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Nước, không khí, nhiệt độ thích hợp', truth: 'hạt cần đủ nước, đủ O₂ và nhiệt độ thích hợp. Ánh sáng không cần cho nảy mầm.',
          sub: 'Đĩa ngập nước thiếu O₂ nên hạt bị thối. Trong tối hạt vẫn nảy mầm nhưng thân vọt dài, vàng nhạt.',
          quiz: QUIZ, bank: 4, result: result()
        });
      }
    }
  ];

  function result() {
    const PAL = ['#3FB37F', '#5BB4EA', '#F2994A', '#9B6BD6'];
    return {
      title: 'Điều kiện nảy mầm của hạt', param: st.dishes.map(d => `Đĩa ${d.i + 1}: ${d.tag.textContent}`).join(' · '),
      table: {
        head: ['Đĩa', 'Số hạt', 'Nước', 'T (°C)', 'Không khí', 'Ánh sáng', 'Hạt', 'Ngày', 'Nảy mầm', 'Tỉ lệ (%)', 'Dài TB (mm)', 'Hình thái'],
        rows: st.dishes.map(d => { const s = stats(d, DAYS); return ['Đĩa ' + (d.i + 1), d.N, WATER[d.water].split(' ').slice(1).join(' '), d.T, d.o2 ? 'Có O₂' : 'Không O₂', d.light ? 'Sáng' : 'Tối', d.good ? 'Khỏe' : 'Luộc chín', DAYS, `${s.n}/${d.N}`, s.pct, s.avg.toFixed(1), stageTxt(d)]; })
      },
      chart: {
        type: 'line', xLabel: 'Thời gian (ngày)', yLabel: 'Chiều dài TB của mầm (mm)', xMax: DAYS,
        series: st.dishes.map((d, i) => ({ name: 'Đĩa ' + (i + 1), color: PAL[i], points: st.hist.map(h => [h[0], h[1][i]]) }))
      },
      conclusion: 'Hạt nảy mầm khi có đủ nước, đủ không khí (O₂) và nhiệt độ thích hợp (khoảng 25–30°C), hạt phải khỏe. Ánh sáng không cần cho nảy mầm nhưng cần cho cây con xanh và cứng cáp',
      note: 'Ngập nước làm thiếu O₂, hạt không hô hấp được nên bị thối.'
    };
  }

  const QUIZ = [
    {
      kicker: '❓ Vì sao?', q: 'Vì sao hạt ngập trong nước lại không nảy mầm, dù rất nhiều nước?',
      options: [
        { t: 'Ngập nước làm thiếu O₂, hạt không hô hấp được', ok: true },
        { t: 'Nước nhiều làm hạt bị lạnh', why: 'Nhiệt độ của đĩa ngập vẫn như đĩa khác. Thứ gì bị thiếu khi hạt chìm trong nước?' },
        { t: 'Hạt cần ánh sáng mà nước che mất', why: 'Đĩa trong tối vẫn nảy mầm. Hãy nghĩ tới không khí.' }
      ],
      explain: 'Hạt nảy mầm cần năng lượng từ hô hấp, mà hô hấp cần O₂. Ngập nước thì O₂ không vào được.'
    }
  ];

  NL.lab.register('2H', { goal: 'Hạt cần những gì để nảy mầm? Ánh sáng có cần không?', clearSide: true, build, steps });
})();
