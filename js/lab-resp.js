// Thí nghiệm 2F: hô hấp tế bào ở hạt nảy mầm. Đo O₂ bằng giọt mực, thử CO₂ bằng nước vôi, đo nhiệt.
(function () {
  const A = NL.art;
  const S = 0.02;            // tiết diện ống mao dẫn: V (mL) = s (mm) × 0,02
  const RUN_MIN = 30;        // mỗi lần đo 30 phút
  const RX0 = 640, RX1 = 260; // vạch 0 mm ở bên phải, 100 mm sát bình
  const mmX = mm => RX0 - (RX0 - RX1) * mm / 100;
  let st;

  // tốc độ hô hấp tương đối theo nhiệt độ: tối ưu 35 °C, trên 55 °C enzyme biến tính
  function fT(T) {
    if (T <= 0 || T >= 55) return 0;
    const x = T / 35; let f = x * Math.exp(1 - x);
    if (T > 35) f *= Math.exp(-Math.pow((T - 35) / 10, 2));
    return f;
  }
  const sAt = (r, min) => Math.min(100, 0.8 * r.m * fT(r.T) * r.noise * (r.alive ? 1 : 0) * min / RUN_MIN);

  function seedsIn(api, g, x, y, w, n, color) {
    for (let i = 0; i < n; i++) api.el('ellipse', { cx: x + (Math.random() - 0.5) * w, cy: y - Math.random() * 14, rx: 7, ry: 5, fill: color, stroke: '#4E7A2E', 'stroke-width': 1, transform: `rotate(${Math.random() * 180} ${x} ${y})` }, g);
  }
  function flask(api, parent, x, y, label) {
    const g = api.g(parent, x, y), el = api.el;
    el('path', { d: 'M-16 -170 L-16 -110 L-70 0 L70 0 L16 -110 L16 -170 Z', fill: 'rgba(220,240,255,.35)', stroke: A.GLASS, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, g);
    el('line', { x1: -52, y1: -42, x2: 52, y2: -42, stroke: '#9AA9B7', 'stroke-width': 3, 'stroke-dasharray': '4 3' }, g);
    if (label) api.text(g, 0, 26, label, 14, '#6C88A3', 700);
    return g;
  }

  function build(api) {
    const L = api.svg, el = api.el;
    st = { runs: [], m: 50, T: 30, alive: true, speed: 300, part: 1 };
    // ---- phần 1: bình đo O₂ ----
    const p1 = st.p1 = api.g(L, 0, 0);
    st.fl = flask(api, p1, 190, 450, 'Bình kín');
    st.flSeeds = api.g(st.fl, 0, 0);
    st.flKoh = api.g(st.fl, 0, 0);
    // ống mao dẫn và thước
    el('rect', { x: 206, y: 270, width: 450, height: 14, rx: 7, fill: 'rgba(220,240,255,.5)', stroke: A.GLASS, 'stroke-width': 2.5 }, p1);
    el('rect', { x: 196, y: 270, width: 14, height: 18, fill: 'rgba(220,240,255,.5)', stroke: A.GLASS, 'stroke-width': 2.5 }, p1);
    const ruler = api.g(p1, 0, 0);
    el('rect', { x: RX1 - 10, y: 290, width: RX0 - RX1 + 20, height: 26, rx: 5, fill: '#FFF3C9', stroke: '#E2C779', 'stroke-width': 2 }, ruler);
    for (let mm = 0; mm <= 100; mm += 2) {
      const x = mmX(mm), big = mm % 10 === 0;
      el('line', { x1: x, y1: 290, x2: x, y2: big ? 302 : mm % 5 === 0 ? 298 : 295, stroke: '#8A6D1E', 'stroke-width': big ? 2 : 1 }, ruler);
      if (big) api.text(ruler, x, 314, mm + '', 11, '#8A6D1E', 700);
    }
    api.text(ruler, RX0 + 24, 314, 'mm', 11, '#8A6D1E', 700);
    st.ink = el('rect', { x: mmX(0) - 6, y: 272, width: 12, height: 10, rx: 5, fill: '#E5534B', opacity: 0 }, p1);
    st.cork = api.g(p1, 300, 200);
    el('path', { d: 'M-18 0 L18 0 L14 26 L-14 26 Z', fill: '#8B5E3C' }, st.cork);
    api.text(st.cork, 0, -8, 'Nút cao su', 12, '#6C88A3', 700);
    st.bowl = api.g(p1, 420, 450);
    el('path', { d: 'M-50 -30 Q0 20 50 -30 Z', fill: '#E9F2F8', stroke: '#9FB4C8', 'stroke-width': 3 }, st.bowl);
    seedsIn(api, st.bowl, 0, -22, 70, 12, '#B9D96B');
    api.text(st.bowl, 0, 20, 'Hạt đậu xanh', 13, '#6C88A3', 700);
    st.koh = api.g(p1, 540, 450);
    el('rect', { x: -22, y: -40, width: 44, height: 40, rx: 6, fill: 'rgba(220,240,255,.4)', stroke: A.GLASS, 'stroke-width': 3 }, st.koh);
    el('rect', { x: -19, y: -24, width: 38, height: 21, rx: 4, fill: 'rgba(200,170,240,.6)' }, st.koh);
    api.text(st.koh, 0, 20, 'KOH 10%', 13, '#6C88A3', 700);
    // ---- phần 2: nước vôi ----
    const p2 = st.p2 = api.g(L, 0, 0); p2.style.display = 'none';
    st.lime = [];
    [[170, 'Hạt nảy mầm'], [450, 'Hạt luộc chín']].forEach(([x, lab], i) => {
      const f = flask(api, p2, x, 450, lab);
      seedsIn(api, f, 0, -46, 70, 12, i ? '#C9B98A' : '#B9D96B');
      el('path', { d: `M${x + 10} 285 L${x + 10} 250 L${x + 130} 250 L${x + 130} 420`, stroke: '#9FB4C8', 'stroke-width': 4, fill: 'none' }, p2);
      const t = A.tube(api, p2, x + 130, 448, { h: 130, w: 34, k: 0.7, color: 'rgba(210,235,250,.7)', label: 'Nước vôi' });
      st.lime.push(t);
    });
    st.pump = api.g(p2, 330, 170);
    el('rect', { x: -44, y: -24, width: 88, height: 48, rx: 14, fill: '#2F80C0', stroke: '#fff', 'stroke-width': 3 }, st.pump);
    api.text(st.pump, 0, 7, 'Bơm khí', 16, '#fff', 800);
    // ---- phần 3: bình cách nhiệt ----
    const p3 = st.p3 = api.g(L, 0, 0); p3.style.display = 'none';
    st.therm = [];
    [[200, 'Hạt nảy mầm'], [460, 'Hạt luộc chín']].forEach(([x, lab]) => {
      el('rect', { x: x - 60, y: 280, width: 120, height: 170, rx: 26, fill: '#F4F0E6', stroke: '#C9BFA6', 'stroke-width': 4 }, p3);
      el('rect', { x: x - 40, y: 268, width: 80, height: 20, rx: 6, fill: '#C9BFA6' }, p3);
      el('rect', { x: x - 5, y: 150, width: 10, height: 190, rx: 5, fill: '#fff', stroke: '#9FB4C8', 'stroke-width': 2 }, p3);
      const col = el('rect', { x: x - 3, y: 300, width: 6, height: 40, rx: 3, fill: '#E5534B' }, p3);
      el('rect', { x: x + 14, y: 160, width: 74, height: 34, rx: 8, fill: '#1E2A36' }, p3);
      const led = api.text(p3, x + 51, 184, '25.0°C', 16, '#59F28A', 800);
      api.text(p3, x, 476, lab, 14, '#6C88A3', 700);
      st.therm.push({ col, led });
    });
  }

  function inkTo(mm) { st.ink.setAttribute('x', mmX(mm) - 6); }
  function logTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['Lần', 'Hạt', 'm', 'T', 's (mm)', 'V (mL)']);
    st.tbl.set(st.runs.map((r, i) => [i + 1, r.alive ? 'Nảy mầm' : 'Luộc', r.m + ' g', r.T + '°C', r.s.toFixed(0), (r.s * S).toFixed(2)]));
  }

  const steps = [
    {
      label: 'Chuẩn bị 1/3', text: 'Cho hạt đậu xanh đang nảy mầm vào bình', hint: 'Kéo bát hạt vào bình tam giác',
      enter(api) {
        api.setOn(st.bowl, true);
        api.draggable(st.bowl, {
          target: { x: 190, y: 400, r: 110 }, snap: false, onDrop: () => {
            st.bowl.style.display = 'none'; seedsIn(api, st.flSeeds, 0, -46, 80, 16, '#B9D96B'); NL.audio.play('drop'); api.done();
          }
        });
      }
    },
    {
      label: 'Chuẩn bị 2/3', text: 'Đặt cốc KOH 10% dưới lưới để hút khí CO₂', hint: 'Kéo cốc KOH vào đáy bình',
      enter(api) {
        api.setOn(st.koh, true);
        api.draggable(st.koh, {
          target: { x: 190, y: 430, r: 110 }, snap: false, onDrop: () => {
            st.koh.style.display = 'none';
            api.el('rect', { x: -18, y: -30, width: 36, height: 26, rx: 5, fill: 'rgba(200,170,240,.7)', stroke: A.GLASS, 'stroke-width': 2 }, st.flKoh);
            api.card({ kicker: '💡 Vì sao cần KOH?', text: 'Hạt lấy O₂ và thải ra CO₂ gần bằng nhau. KOH hút hết CO₂, nên trong bình chỉ còn thấy O₂ bị lấy đi.', sub: 'Thiếu KOH thì áp suất gần như không đổi, giọt mực sẽ đứng yên!' }, () => api.done());
          }
        });
      }
    },
    {
      label: 'Chuẩn bị 3/3', text: 'Đậy nút cao su cho bình thật kín', hint: 'Chạm vào nút cao su',
      enter(api) {
        api.setOn(st.cork, true);
        api.tapable(st.cork, () => {
          api.tween(st.cork, 190, 262, 300, () => { NL.audio.play('drop'); st.ink.setAttribute('opacity', 1); inkTo(0); api.say('Bình đã kín. Giọt mực đỏ đang ở vạch 0'); api.done(); });
        });
      }
    },
    {
      label: () => `Lần đo ${st.runs.length + 1}/3 · Cài đặt`, text: 'Chọn khối lượng hạt, nhiệt độ và loại hạt', hint: 'Mỗi lần đo đổi một yếu tố để so sánh',
      enter(api) {
        logTable(api);
        if (!st.runs.length && !api.prediction) api.ask({
          predict: true, q: 'Khi hạt nảy mầm hô hấp trong bình kín có KOH, giọt mực sẽ…?',
          options: [{ t: 'Di chuyển về phía bình' }, { t: 'Di chuyển ra xa bình' }, { t: 'Đứng yên' }]
        });
        const check = () => {
          const dup = st.runs.some(r => r.m === st.m && r.T === st.T && r.alive === st.alive);
          if (dup) { api.hideNext(); NL.game.toast('Đổi khối lượng, nhiệt độ hoặc loại hạt so với lần trước nhé'); } else api.done('Bắt đầu đo ➜');
        };
        api.slider({ label: 'Khối lượng hạt', min: 10, max: 100, step: 5, value: st.m, unit: 'g', onInput(v) { st.m = v; check(); } });
        api.slider({ label: 'Nhiệt độ', min: 0, max: 60, value: st.T, unit: '°C', onInput(v, c) { st.T = v; c.warn(v > 50 ? 'Quá nóng: enzyme hô hấp bị biến tính' : v < 5 ? 'Quá lạnh: hô hấp gần như dừng' : ''); check(); } });
        api.choices({ label: 'Loại hạt', items: [{ t: '🌱 Nảy mầm', v: true }, { t: '🍲 Luộc chín', v: false }], value: st.alive, onPick(v) { st.alive = v; check(); } });
      },
      onNext(api) { api.goto(4); }
    },
    {
      label: () => `Lần đo ${st.runs.length + 1}/3 · Đang đo`, text: 'Quan sát giọt mực trong 30 phút', hint: 'Giọt mực bị kéo về phía bình vì O₂ trong bình bị hạt lấy đi',
      enter(api) {
        logTable(api);
        const r = { m: st.m, T: st.T, alive: st.alive, noise: 0.95 + Math.random() * 0.1, pts: [[0, 0]] };
        st.cur = r; inkTo(0);
        if (!r.alive) { st.flSeeds.innerHTML = ''; seedsIn(api, st.flSeeds, 0, -46, 80, 16, '#C9B98A'); }
        else { st.flSeeds.innerHTML = ''; seedsIn(api, st.flSeeds, 0, -46, 80, Math.round(6 + r.m / 7), '#B9D96B'); }
        const card = api.panel(`<div>⏱ Thời gian thí nghiệm</div><div class="big-num"><span id="rsT">0</span> phút</div>`);
        api.choices({ label: 'Tốc độ', items: [{ t: '10×', v: 10 }, { t: '60×', v: 60 }, { t: '300×', v: 300 }], value: st.speed, onPick(v) { st.speed = v; } });
        let t = 0, nextPt = 5;
        api.loop(dt => {
          t = Math.min(RUN_MIN, t + dt * st.speed / 60);
          card.querySelector('#rsT').textContent = Math.floor(t);
          inkTo(sAt(r, t));
          if (t >= nextPt) { r.pts.push([nextPt, +(sAt(r, nextPt) * S).toFixed(3)]); nextPt += 5; }
          if (t >= RUN_MIN) {
            NL.audio.play('ting'); card.remove();
            r.s = sAt(r, RUN_MIN);
            readInk(api, r);
            return false;
          }
        });
      }
    },
    {
      label: () => `Lần đo ${st.runs.length}/3 · xong`, text: '', hint: 'Bấm nút ở góc dưới để đi tiếp',
      enter(api) {
        logTable(api);
        const need = 3 - st.runs.length;
        api.say(need > 0 ? `Đã ghi vào bảng. Đo thêm ${need} lần với điều kiện khác` : 'Đủ 3 lần đo! Giờ thử thêm hai cách chứng minh khác');
        api.done(need > 0 ? 'Đo lần nữa ➜' : 'Thử CO₂ ➜');
      },
      onNext(api) {
        if (st.runs.length < 3) { st.ink.setAttribute('opacity', 1); inkTo(0); api.goto(3); return; }
        st.p1.style.display = 'none'; st.p2.style.display = ''; api.goto(6);
      }
    },
    {
      label: 'Thải khí CO₂', text: 'Bơm khí trong hai bình qua ống nước vôi trong', hint: 'Chạm nút Bơm khí',
      enter(api) {
        logTable(api);
        api.setOn(st.pump, true);
        api.tapable(st.pump, () => {
          NL.audio.play('bubble');
          let k = 0;
          api.loop(dt => {
            k = Math.min(1, k + dt / 3);
            st.lime[0].fill(`rgba(${210 + 40 * k},${235 + 15 * k},${250},${0.7 + 0.25 * k})`, 0.7);
            if (Math.random() < 0.3) NL.audio.play('bubble');
            if (k >= 1) {
              api.say('Ống bên hạt nảy mầm vẩn đục trắng, ống bên hạt luộc vẫn trong');
              st.co2 = true; api.done('Thử nhiệt ➜'); return false;
            }
          });
        });
      },
      onNext(api) { st.p2.style.display = 'none'; st.p3.style.display = ''; api.goto(7); }
    },
    {
      label: 'Thải nhiệt', text: 'Theo dõi nhiệt kế trong hai bình cách nhiệt suốt 24 giờ', hint: 'Bấm Bắt đầu rồi xem nhiệt độ thay đổi',
      enter(api) {
        logTable(api);
        api.done('Bắt đầu ⏵');
      },
      onNext(api) {
        const card = api.panel(`<div>⏱ Thời gian</div><div class="big-num"><span id="rsH">0</span> giờ</div><div class="rep-sub">1 giờ ảo = 0,25 giây</div>`);
        let h = 0;
        api.loop(dt => {
          h = Math.min(24, h + dt * 4);
          const T1 = 25 + 7 * (1 - Math.exp(-h / 10)), T2 = 25;
          [T1, T2].forEach((T, i) => { st.therm[i].led.textContent = T.toFixed(1) + '°C'; st.therm[i].col.setAttribute('y', 340 - (T - 15) * 6); st.therm[i].col.setAttribute('height', (T - 15) * 6); });
          card.querySelector('#rsH').textContent = Math.floor(h);
          if (h >= 24) { st.heat = T1; NL.audio.play('ting'); api.say(`Sau 24 giờ: bình hạt nảy mầm ${T1.toFixed(1)}°C, bình hạt luộc vẫn 25.0°C`); api.done('Xem đồ thị ➜'); st.heatDone = true; return false; }
        });
        api.hideNext();
        st.afterHeat = () => api.goto(8);
      }
    },
    {
      label: 'Kết quả', text: 'Thể tích O₂ hạt lấy vào theo thời gian', hint: 'Đường dốc hơn: hô hấp mạnh hơn',
      enter(api) { api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Di chuyển về phía bình', truth: 'giọt mực bị kéo về phía bình vì hạt lấy O₂, còn CO₂ thải ra bị KOH hút mất.',
          sub: 'Hạt luộc chín không hô hấp nên giọt mực đứng yên, nước vôi không đục, nhiệt độ không tăng.',
          quiz: QUIZ, bank: 4, result: result()
        });
      }
    }
  ];
  // bước 7 dùng nút Bước tiếp theo hai lần: lần đầu chạy đồng hồ, lần sau sang kết quả
  const heatStep = steps[7], onNext0 = heatStep.onNext;
  heatStep.onNext = api => { if (st.heatDone) st.afterHeat(); else onNext0(api); };

  // học sinh tự đọc vạch giọt mực
  function readInk(api, r) {
    api.say('Đọc vị trí giọt mực trên thước rồi nhập số mm');
    const card = api.panel(`<div>Giọt mực đi được</div><div class="big-num"><input class="num-in" type="number" min="0" max="100" step="1" id="rsIn"> <small>mm</small></div><button class="btn small pop" id="rsOk">Ghi số</button><div class="warn-line" id="rsW"></div>`);
    const go = () => {
      const v = +card.querySelector('#rsIn').value;
      if (card.querySelector('#rsIn').value === '') return;
      const ok = Math.abs(v - r.s) <= 3;
      r.em = v;
      NL.audio.play(ok ? 'ting' : 'pop');
      NL.game.toast(ok ? `Chính xác! Giọt mực ở ${r.s.toFixed(0)} mm` : `Giọt mực ở khoảng ${r.s.toFixed(0)} mm, em đọc ${v} mm`);
      st.runs.push(r); card.remove(); api.goto(5);
    };
    card.querySelector('#rsOk').onclick = go;
    card.querySelector('#rsIn').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    api.readInk = () => { card.querySelector('#rsIn').value = Math.round(r.s); go(); }; // dùng khi kiểm thử
  }

  function result() {
    const PAL = ['#5BB4EA', '#3FB37F', '#F2994A'];
    return {
      title: 'Hô hấp tế bào ở hạt nảy mầm', param: st.runs.map(r => `${r.alive ? 'nảy mầm' : 'luộc'} ${r.m} g, ${r.T}°C`).join('; '),
      table: {
        head: ['Lần', 'Loại hạt', 'm (g)', 'T (°C)', 't (phút)', 's (mm)', 'Em đọc (mm)', 'V O₂ (mL)'],
        rows: st.runs.map((r, i) => [i + 1, r.alive ? 'Nảy mầm' : 'Luộc chín', r.m, r.T, RUN_MIN, r.s.toFixed(1), r.em === undefined ? '' : r.em, (r.s * S).toFixed(2)])
          .concat(st.heat ? [['Nhiệt', 'Nảy mầm / Luộc', '', '25', '24 giờ', '', '', `T bình: ${st.heat.toFixed(1)} / 25.0 °C`]] : [])
      },
      chart: {
        type: 'line', xLabel: 'Thời gian (phút)', yLabel: 'Thể tích O₂ (mL)', xMax: RUN_MIN,
        series: st.runs.map((r, i) => ({ name: `${r.alive ? '' : 'Luộc '}${r.m}g ${r.T}°C`, color: PAL[i], points: r.pts }))
      },
      conclusion: 'Hạt nảy mầm hô hấp mạnh: lấy O₂, thải CO₂ (làm đục nước vôi) và tỏa nhiệt. Hô hấp mạnh hơn khi nhiều hạt hơn và nhiệt độ gần tối ưu (khoảng 35°C)',
      note: 'Hạt luộc chín đã chết, enzyme bị biến tính nên không hô hấp; đó là bình đối chứng.'
    };
  }

  const QUIZ = [
    {
      kicker: '❓ Vì sao?', q: 'Vì sao giọt mực bị kéo về phía bình chứa hạt?',
      options: [
        { t: 'Hạt lấy O₂, CO₂ thải ra bị KOH hút, nên khí trong bình giảm', ok: true },
        { t: 'Hạt thải nhiều khí nên đẩy giọt mực', why: 'Nếu khí nhiều lên thì giọt mực bị đẩy ra xa chứ không bị kéo về. Khí trong bình nhiều lên hay ít đi?' },
        { t: 'Hạt hút nước trong ống', why: 'Ống mao dẫn chứa không khí và một giọt mực, hạt không hút được. Hãy nghĩ tới O₂ và KOH.' }
      ],
      explain: 'O₂ bị lấy đi, CO₂ bị KOH giữ lại, nên áp suất trong bình giảm và giọt mực bị kéo vào.'
    }
  ];

  NL.lab.register('2F', { goal: 'Hạt đang nảy mầm có "thở" không? Làm sao chứng minh?', clearSide: true, build, steps });
})();
