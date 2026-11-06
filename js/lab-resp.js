// Thí nghiệm 2F: hô hấp tế bào ở hạt nảy mầm. Đo O₂ bằng giọt mực, thử CO₂ bằng nước vôi trong, đo nhiệt.
// Sửa 6/11: ống mao dẫn Ø 3 mm (S = π·r² = 0,00707 mL/mm), tốc độ hút O₂ ≈ 0,45 mL/g/giờ ở 25 °C, Q10 ≈ 2 tới 35 °C rồi giảm;
// giọt mực chạy hết ống thì phải làm lại; thí nghiệm CO₂ và nhiệt có điều khiển (chọn hạt, khối lượng, nhiệt độ, thời gian), ghi bảng, xem lại.
(function () {
  const A = NL.art, vn = (x, d) => NL.fmt(x, d);
  const D_MM = 3, S = +(Math.PI * (D_MM / 2) * (D_MM / 2) / 1000).toFixed(5); // mm² → mL/mm: 0,00707
  const TUBE_MM = 100;       // ống dài 100 mm
  const RUN_MIN = 10;        // mỗi lần đo O₂ 10 phút
  const V25 = 0.45;          // mL O₂ / g / giờ ở 25 °C (hạt đậu xanh nảy mầm: 0,3–0,6)
  const RX0 = 640, RX1 = 260; // vạch 0 mm ở bên phải, 100 mm sát bình
  const mmX = mm => RX0 - (RX0 - RX1) * mm / 100;
  const KINDS = [{ t: '🌱 Nảy mầm', v: 'alive' }, { t: '🌰 Khô', v: 'dry' }, { t: '🍲 Luộc chín', v: 'boiled' }];
  const kindName = k => ({ alive: 'Nảy mầm', dry: 'Khô', boiled: 'Luộc chín' })[k];
  const kindK = k => ({ alive: 1, dry: 0.03, boiled: 0 })[k];
  let st;

  // hệ số theo nhiệt độ so với 25 °C: Q10 ≈ 2 tới 35 °C, trên đó enzyme biến tính dần, từ 55 °C dừng hẳn
  function fT(T) {
    if (T <= 0 || T >= 55) return 0;
    let f = Math.pow(2, (Math.min(T, 35) - 25) / 10);
    if (T > 35) f *= Math.exp(-Math.pow((T - 35) / 8, 2));
    return f;
  }
  // tốc độ hút O₂ (mL/giờ) của một lần đo
  const rate = r => V25 * r.m * fT(r.T) * kindK(r.kind) * r.noise;
  // quãng đường giọt mực (mm) sau t phút
  const sAt = (r, min) => rate(r) * min / 60 / S;

  // hạt đậu xanh xếp đều một lớp: hạt nảy mầm xanh tươi có rễ mầm trắng, hạt khô xanh sẫm nhỏ, hạt luộc vàng nhạt
  function seedsIn(api, g, x, y, w, n, kind) {
    const col = kind === 'boiled' ? '#E3D7A6' : kind === 'dry' ? '#7FA648' : '#B9D96B', edge = kind === 'boiled' ? '#B8A66A' : '#4E7A2E';
    const perRow = Math.max(3, Math.round(w / 16)), rows = Math.ceil(n / perRow);
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / perRow), inRow = Math.min(perRow, n - row * perRow), col0 = i % perRow;
      const cx = x + (col0 - (inRow - 1) / 2) * 16 + (row % 2 ? 4 : 0), cy = y - row * 9;
      const sg = api.g(g, cx, cy);
      if (kind === 'alive') api.el('path', { d: `M${6} 0 q6 ${i % 2 ? 5 : -5} 10 ${i % 2 ? 7 : -7}`, stroke: '#F4F1E6', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, sg);
      api.el('ellipse', { cx: 0, cy: 0, rx: kind === 'dry' ? 6 : 7, ry: kind === 'dry' ? 4 : 5, fill: col, stroke: edge, 'stroke-width': 1, transform: `rotate(${(i * 37) % 40 - 20})` }, sg);
      api.el('ellipse', { cx: -2, cy: -1.5, rx: 2, ry: 1, fill: 'rgba(255,255,255,.55)' }, sg);
    }
  }
  function flask(api, parent, x, y, label) {
    const g = api.g(parent, x, y), el = api.el;
    el('path', { d: 'M-16 -170 L-16 -110 L-70 0 L70 0 L16 -110 L16 -170 Z', fill: 'rgba(220,240,255,.35)', stroke: A.GLASS, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, g);
    el('line', { x1: -52, y1: -42, x2: 52, y2: -42, stroke: '#9AA9B7', 'stroke-width': 3, 'stroke-dasharray': '4 3' }, g);
    g.label = label ? api.text(g, 0, 26, label, 14, '#6C88A3', 700) : null;
    return g;
  }

  function build(api) {
    const L = api.svg, el = api.el;
    st = { runs: [], co2Runs: [], heatRuns: [], m: 5, T: 25, kind: 'alive', speed: 60, part: 1, c: { m: 10, T: 25, kind: 'alive', min: 30 }, h: { m: 50, T: 25, kind: 'alive', hrs: 24 } };
    // ---- phần 1: bình đo O₂ ----
    const p1 = st.p1 = api.g(L, 0, 0);
    st.fl = flask(api, p1, 190, 450, 'Bình kín');
    st.flSeeds = api.g(st.fl, 0, 0);
    st.flKoh = api.g(st.fl, 0, 0);
    // ống mao dẫn Ø 3 mm và thước
    el('rect', { x: 206, y: 270, width: 450, height: 14, rx: 7, fill: 'rgba(220,240,255,.5)', stroke: A.GLASS, 'stroke-width': 2.5 }, p1);
    el('rect', { x: 196, y: 270, width: 14, height: 18, fill: 'rgba(220,240,255,.5)', stroke: A.GLASS, 'stroke-width': 2.5 }, p1);
    api.text(p1, 430, 258, `Ống mao dẫn Ø ${D_MM} mm · S = π·r² = ${vn(S, 5)} mL/mm`, 12, '#6C88A3', 700);
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
    seedsIn(api, st.bowl, 0, -22, 70, 12, 'alive');
    api.text(st.bowl, 0, 20, 'Hạt đậu xanh', 13, '#6C88A3', 700);
    st.koh = api.g(p1, 540, 450);
    el('rect', { x: -22, y: -40, width: 44, height: 40, rx: 6, fill: 'rgba(220,240,255,.4)', stroke: A.GLASS, 'stroke-width': 3 }, st.koh);
    el('rect', { x: -19, y: -24, width: 38, height: 21, rx: 4, fill: 'rgba(200,170,240,.6)' }, st.koh);
    api.text(st.koh, 0, 20, 'KOH 10%', 13, '#6C88A3', 700);
    // ---- phần 2: nước vôi trong (bình thí nghiệm bên trái, bình đối chứng hạt luộc bên phải) ----
    const p2 = st.p2 = api.g(L, 0, 0); p2.style.display = 'none';
    st.lime = []; st.limeSeeds = []; st.limeFl = [];
    [[170, 'Hạt nảy mầm'], [450, 'Đối chứng: hạt luộc chín']].forEach(([x, lab], i) => {
      const f = flask(api, p2, x, 450, lab); st.limeFl.push(f);
      const sg = api.g(f, 0, 0); st.limeSeeds.push(sg); seedsIn(api, sg, 0, -46, 70, 12, i ? 'boiled' : 'alive');
      el('path', { d: `M${x + 10} 285 L${x + 10} 250 L${x + 130} 250 L${x + 130} 420`, stroke: '#9FB4C8', 'stroke-width': 4, fill: 'none' }, p2);
      const t = A.tube(api, p2, x + 130, 448, { h: 130, w: 34, k: 0.7, color: 'rgba(210,235,250,.7)', label: 'Nước vôi trong' });
      st.lime.push(t);
    });
    st.pump = api.g(p2, 330, 170);
    el('rect', { x: -44, y: -24, width: 88, height: 48, rx: 14, fill: '#2F80C0', stroke: '#fff', 'stroke-width': 3 }, st.pump);
    api.text(st.pump, 0, 7, 'Bơm khí', 16, '#fff', 800);
    // ---- phần 3: bình cách nhiệt ----
    const p3 = st.p3 = api.g(L, 0, 0); p3.style.display = 'none';
    st.therm = [];
    [[200, 'Hạt nảy mầm'], [460, 'Đối chứng: hạt luộc chín']].forEach(([x, lab]) => {
      el('rect', { x: x - 60, y: 280, width: 120, height: 170, rx: 26, fill: '#F4F0E6', stroke: '#C9BFA6', 'stroke-width': 4 }, p3);
      el('rect', { x: x - 40, y: 268, width: 80, height: 20, rx: 6, fill: '#C9BFA6' }, p3);
      const sg = api.g(p3, x, 440); seedsIn(api, sg, 0, 0, 90, 16, 'alive');
      el('rect', { x: x - 5, y: 150, width: 10, height: 190, rx: 5, fill: '#fff', stroke: '#9FB4C8', 'stroke-width': 2 }, p3);
      const col = el('rect', { x: x - 3, y: 300, width: 6, height: 40, rx: 3, fill: '#E5534B' }, p3);
      el('rect', { x: x + 14, y: 160, width: 74, height: 34, rx: 8, fill: '#1E2A36' }, p3);
      const led = api.text(p3, x + 51, 184, '25,0 °C', 15, '#59F28A', 800);
      const label = api.text(p3, x, 476, lab, 14, '#6C88A3', 700);
      st.therm.push({ col, led, label, seeds: sg });
    });
  }

  function inkTo(mm) { st.ink.setAttribute('x', mmX(Math.min(TUBE_MM, mm)) - 6); }
  function logTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['Lần', 'Hạt', 'm', 'T', 's (mm)', 'V O₂ (mL)']);
    st.tbl.set(st.runs.map((r, i) => [i + 1, kindName(r.kind), r.m + ' g', r.T + ' °C', vn(r.s, 0), vn(r.s * S, 2)]));
  }
  function setTherm(i, T) { st.therm[i].led.textContent = vn(T, 1) + ' °C'; st.therm[i].col.setAttribute('y', 340 - (T - 15) * 6); st.therm[i].col.setAttribute('height', Math.max(2, (T - 15) * 6)); }
  // độ đục nước vôi 0–3 theo thể tích CO₂ (RQ ≈ 1 nên V CO₂ ≈ V O₂)
  const turb = v => v < 0.3 ? 0 : v < 1 ? 1 : v < 3 ? 2 : 3;
  const TURB = ['trong', 'hơi vẩn', 'đục', 'đục trắng'];
  function limeColor(k) { return `rgba(${210 + 40 * k},${235 + 15 * k},250,${0.7 + 0.25 * k})`; }

  const steps = [
    {
      label: 'Chuẩn bị 1/3', text: 'Cho hạt đậu xanh đang nảy mầm vào bình', hint: 'Kéo bát hạt vào bình tam giác',
      enter(api) {
        api.setOn(st.bowl, true);
        api.draggable(st.bowl, {
          target: { x: 190, y: 400, r: 110 }, snap: false, onDrop: () => {
            st.bowl.style.display = 'none'; seedsIn(api, st.flSeeds, 0, -46, 80, 12, 'alive'); NL.audio.play('drop'); api.done();
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
    { // 3
      label: () => `Lần đo ${Math.min(st.runs.length + 1, 3)}/3 · Cài đặt`, text: 'Chọn khối lượng hạt, nhiệt độ và loại hạt', hint: 'Mỗi lần đo đổi một yếu tố để so sánh',
      enter(api) {
        logTable(api);
        if (!st.runs.length && !api.prediction) api.ask({
          predict: true, q: 'Khi hạt nảy mầm hô hấp trong bình kín có KOH, giọt mực sẽ…?',
          options: [{ t: 'Di chuyển về phía bình' }, { t: 'Di chuyển ra xa bình' }, { t: 'Đứng yên' }]
        });
        let mC;
        const check = () => {
          const dup = st.runs.some(r => r.m === st.m && r.T === st.T && r.kind === st.kind);
          // dự báo: ước lượng giọt mực đi được bao xa trong 10 phút; quá 100 mm thì nhắc trước (nhưng vẫn cho đo để em tự thấy)
          const pred = sAt({ m: st.m, T: st.T, kind: st.kind, noise: 1 }, RUN_MIN);
          if (mC) mC.warn(pred > TUBE_MM ? `Ước tính giọt mực đi ≈ ${vn(pred, 0)} mm, quá ống ${TUBE_MM} mm: nên bớt hạt hoặc hạ nhiệt độ` : pred > 0 && pred < 5 ? 'Giọt mực sẽ đi rất ít, khó đọc' : '');
          if (dup) { api.hideNext(); NL.game.toast('Đổi khối lượng, nhiệt độ hoặc loại hạt so với lần trước nhé'); } else api.done('Bắt đầu đo ➜');
        };
        mC = api.slider({ label: 'Khối lượng hạt', min: 1, max: 20, step: 1, value: st.m, unit: 'g', onInput(v) { st.m = v; check(); } });
        api.slider({ label: 'Nhiệt độ', min: 0, max: 60, value: st.T, unit: '°C', onInput(v, c) { st.T = v; c.warn(v > 50 ? 'Quá nóng: enzyme hô hấp bị biến tính' : v < 5 ? 'Quá lạnh: hô hấp gần như dừng' : ''); check(); } });
        api.choices({ label: 'Loại hạt', items: KINDS, value: st.kind, onPick(v) { st.kind = v; check(); } });
      },
      onNext(api) { api.goto(4); }
    },
    { // 4
      label: () => `Lần đo ${Math.min(st.runs.length + 1, 3)}/3 · Đang đo`, text: `Quan sát giọt mực trong ${RUN_MIN} phút`, hint: 'Giọt mực bị kéo về phía bình vì O₂ trong bình bị hạt lấy đi',
      enter(api) {
        logTable(api);
        const r = { m: st.m, T: st.T, kind: st.kind, alive: st.kind === 'alive', noise: 0.95 + Math.random() * 0.1, pts: [[0, 0]] };
        st.cur = r; inkTo(0);
        st.flSeeds.innerHTML = ''; seedsIn(api, st.flSeeds, 0, -46, 84, Math.round(4 + r.m * 1.2), r.kind);
        const card = api.panel(`<div>⏱ Thời gian thí nghiệm</div><div class="big-num"><span id="rsT">0</span> phút</div>`);
        api.choices({ label: 'Tốc độ', items: [{ t: '10×', v: 10 }, { t: '60×', v: 60 }, { t: '300×', v: 300 }], value: st.speed, onPick(v) { st.speed = v; } });
        let t = 0, nextPt = 1;
        api.loop(dt => {
          t = Math.min(RUN_MIN, t + dt * st.speed / 60);
          card.querySelector('#rsT').textContent = Math.floor(t);
          const s = sAt(r, t); inkTo(s);
          if (t >= nextPt) { r.pts.push([nextPt, +(sAt(r, nextPt) * S).toFixed(3)]); nextPt += 1; }
          // FAIL FAST: giọt mực chạy hết ống trước khi hết giờ thì lần đo này hỏng, phải giảm hạt hoặc hạ nhiệt độ
          if (s >= TUBE_MM) {
            card.remove(); NL.audio.play('pop');
            api.lesson({ title: 'Giọt mực chạy hết ống', text: `Mới ${Math.floor(t)} phút giọt mực đã tới vạch ${TUBE_MM} mm, không đo tiếp được. Lượng O₂ hạt hút vào vượt thể tích ống (${vn(TUBE_MM * S, 2)} mL).`, sub: 'Giảm khối lượng hạt (hoặc hạ nhiệt độ) rồi đo lại. Trong phòng thí nghiệm thật người ta cũng chọn lượng hạt sao cho giọt mực không chạy hết thước.' }, () => { inkTo(0); api.goto(3); });
            return false;
          }
          if (t >= RUN_MIN) {
            NL.audio.play('ting'); card.remove();
            r.s = s;
            readInk(api, r);
            return false;
          }
        });
      }
    },
    { // 5
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
    { // 6: thải CO₂, có điều khiển
      label: () => `Thải CO₂ · lần ${st.co2Runs.length + 1}`, text: 'Chọn hạt, khối lượng, nhiệt độ, thời gian rồi bơm khí qua nước vôi trong', hint: 'Bình bên phải là đối chứng: hạt luộc chín',
      enter(api) {
        const c = st.c;
        const redraw = () => { st.limeSeeds[0].innerHTML = ''; seedsIn(api, st.limeSeeds[0], 0, -46, 70, Math.round(6 + c.m / 4), c.kind); st.limeFl[0].label.textContent = `Hạt ${kindName(c.kind).toLowerCase()} ${c.m} g · ${c.T} °C`; };
        api.choices({ label: 'Loại hạt', items: KINDS, value: c.kind, onPick(v) { c.kind = v; redraw(); } });
        api.choices({ label: 'Khối lượng hạt', items: [{ t: '5 g', v: 5 }, { t: '10 g', v: 10 }, { t: '20 g', v: 20 }], value: c.m, onPick(v) { c.m = v; redraw(); } });
        api.slider({ label: 'Nhiệt độ', min: 5, max: 50, step: 5, value: c.T, unit: '°C', onInput(v) { c.T = v; redraw(); } });
        api.choices({ label: 'Thời gian', items: [{ t: '10 phút', v: 10 }, { t: '20 phút', v: 20 }, { t: '30 phút', v: 30 }], value: c.min, onPick(v) { c.min = v; } });
        redraw(); st.lime[0].fill(limeColor(0), 0.7); st.lime[1].fill(limeColor(0), 0.7);
        if (!st.c2tbl || !st.c2tbl.card.isConnected) st.c2tbl = api.table(['Lần', 'Hạt', 'm', 'T', 't', 'Nước vôi']);
        st.c2tbl.set(st.co2Runs.map((r, i) => [i + 1, kindName(r.kind), r.m + ' g', r.T + ' °C', r.min + "'", `${r.k}/3 ${TURB[r.k]}`]));
        api.hideNext();
        api.setOn(st.pump, true);
        api.tapable(st.pump, () => {
          api.setOn(st.pump, false);
          const r = { kind: c.kind, m: c.m, T: c.T, min: c.min, noise: 0.95 + Math.random() * 0.1 };
          r.v = rate(r) * r.min / 60; r.k = turb(r.v); st.co2Runs.push(r);
          replayCO2(api, r, () => {
            st.c2tbl.set(st.co2Runs.map((r, i) => [i + 1, kindName(r.kind), r.m + ' g', r.T + ' °C', r.min + "'", `${r.k}/3 ${TURB[r.k]}`]));
            api.say(`Ống bên hạt ${kindName(r.kind).toLowerCase()}: nước vôi ${TURB[r.k]} (mức ${r.k}/3, ≈ ${vn(r.v, 2)} mL CO₂). Ống đối chứng vẫn trong`);
            const bar = api.panel('<button class="btn small ghost pop" id="rsRe">👁 Xem lại hiện tượng</button> <button class="btn small pop" id="rsNew">🔁 Làm lần mới</button>');
            bar.querySelector('#rsRe').onclick = () => { NL.audio.play('click'); replayCO2(api, r); };
            bar.querySelector('#rsNew').onclick = () => { NL.audio.play('click'); api.goto(6); };
            if (st.co2Runs.length >= 2) api.done('Thử nhiệt ➜'); else NL.game.toast('Làm thêm một lần với điều kiện khác để so sánh nhé');
          });
        });
      },
      onNext(api) { st.p2.style.display = 'none'; st.p3.style.display = ''; api.goto(7); }
    },
    { // 7: thải nhiệt, có điều khiển
      label: () => `Thải nhiệt · lần ${st.heatRuns.length + 1}`, text: 'Chọn hạt, khối lượng, nhiệt độ phòng, thời gian rồi bấm Bắt đầu', hint: 'Bình bên phải là đối chứng: hạt luộc chín',
      enter(api) {
        const h = st.h;
        const redraw = () => { st.therm[0].seeds.innerHTML = ''; seedsIn(api, st.therm[0].seeds, 0, 0, 90, Math.round(8 + h.m / 8), h.kind); st.therm[0].label.textContent = `Hạt ${kindName(h.kind).toLowerCase()} ${h.m} g`; setTherm(0, h.T); setTherm(1, h.T); };
        api.choices({ label: 'Loại hạt', items: KINDS, value: h.kind, onPick(v) { h.kind = v; redraw(); } });
        api.choices({ label: 'Khối lượng hạt', items: [{ t: '20 g', v: 20 }, { t: '50 g', v: 50 }, { t: '100 g', v: 100 }], value: h.m, onPick(v) { h.m = v; redraw(); } });
        api.slider({ label: 'Nhiệt độ phòng', min: 10, max: 40, step: 5, value: h.T, unit: '°C', onInput(v) { h.T = v; redraw(); } });
        api.choices({ label: 'Thời gian', items: [{ t: '6 giờ', v: 6 }, { t: '12 giờ', v: 12 }, { t: '24 giờ', v: 24 }], value: h.hrs, onPick(v) { h.hrs = v; } });
        redraw();
        if (!st.htbl || !st.htbl.card.isConnected) st.htbl = api.table(['Lần', 'Hạt', 'm', 'T phòng', 't', 'T bình']);
        st.htbl.set(st.heatRuns.map((r, i) => [i + 1, kindName(r.kind), r.m + ' g', r.T + ' °C', r.hrs + ' h', vn(r.Tend, 1) + ' °C']));
        api.done('Bắt đầu ⏵');
      },
      onNext(api) {
        if (st.heatRuns.length >= 2 && st.heatReady) { api.goto(8); return; }
        const h = st.h, r = { kind: h.kind, m: h.m, T: h.T, hrs: h.hrs, noise: 0.95 + Math.random() * 0.1 };
        // nhiệt tỏa ra tỉ lệ với tốc độ hô hấp; bình cách nhiệt tốt: ΔT tiến tới ΔTmax ≈ 0,11 °C mỗi gam (ở 25 °C) theo hàm mũ, τ ≈ 8 giờ
        r.dTmax = 0.11 * r.m * fT(r.T) * kindK(r.kind) * r.noise;
        r.Tend = r.T + r.dTmax * (1 - Math.exp(-r.hrs / 8));
        st.heatRuns.push(r);
        replayHeat(api, r, () => {
          st.htbl.set(st.heatRuns.map((r, i) => [i + 1, kindName(r.kind), r.m + ' g', r.T + ' °C', r.hrs + ' h', vn(r.Tend, 1) + ' °C']));
          api.say(`Sau ${r.hrs} giờ: bình hạt ${kindName(r.kind).toLowerCase()} ${vn(r.Tend, 1)} °C, bình đối chứng vẫn ${vn(r.T, 1)} °C`);
          const bar = api.panel('<button class="btn small ghost pop" id="rsRe">👁 Xem lại hiện tượng</button> <button class="btn small pop" id="rsNew">🔁 Làm lần mới</button>');
          bar.querySelector('#rsRe').onclick = () => { NL.audio.play('click'); replayHeat(api, r); };
          bar.querySelector('#rsNew').onclick = () => { NL.audio.play('click'); st.heatReady = false; api.goto(7); };
          if (st.heatRuns.length >= 2) { st.heatReady = true; api.done('Xem đồ thị ➜'); } else NL.game.toast('Làm thêm một lần với điều kiện khác để so sánh nhé');
        });
        api.hideNext();
      }
    },
    { // 8
      label: 'Kết quả', text: 'Thể tích O₂ hạt lấy vào theo thời gian', hint: 'Đường dốc hơn: hô hấp mạnh hơn',
      enter(api) { api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Di chuyển về phía bình', truth: 'giọt mực bị kéo về phía bình vì hạt lấy O₂, còn CO₂ thải ra bị KOH hút mất.',
          sub: 'Hạt luộc chín (đã khử trùng để vi sinh vật không phát triển trên hạt) không hô hấp nên giọt mực đứng yên, nước vôi không đục, nhiệt độ không tăng.',
          quiz: QUIZ, bank: 4, result: result()
        });
      }
    }
  ];

  // chạy lại hoạt cảnh bơm khí qua nước vôi (3 giây)
  function replayCO2(api, r, cb) {
    NL.audio.play('bubble'); st.lime[0].fill(limeColor(0), 0.7); st.lime[1].fill(limeColor(0), 0.7);
    let k = 0;
    api.loop(dt => {
      k = Math.min(1, k + dt / 3);
      st.lime[0].fill(limeColor(k * r.k / 3), 0.7);
      if (Math.random() < 0.3) NL.audio.play('bubble');
      if (k >= 1) { cb && cb(); return false; }
    });
  }
  // chạy lại hoạt cảnh nhiệt kế (1 giờ ảo = 0,25 giây)
  function replayHeat(api, r, cb) {
    const card = api.panel(`<div>⏱ Thời gian</div><div class="big-num"><span id="rsH">0</span> giờ</div><div class="rep-sub">1 giờ ảo = 0,25 giây</div>`);
    let h = 0;
    api.loop(dt => {
      h = Math.min(r.hrs, h + dt * 4);
      setTherm(0, r.T + r.dTmax * (1 - Math.exp(-h / 8))); setTherm(1, r.T);
      card.querySelector('#rsH').textContent = Math.floor(h);
      if (h >= r.hrs) { NL.audio.play('ting'); card.remove(); cb && cb(); return false; }
    });
  }

  // học sinh tự đọc vạch giọt mực; đọc sai quá 3 mm thì được gợi ý và đọc lại một lần
  function readInk(api, r) {
    api.say('Đọc vị trí giọt mực trên thước rồi nhập số mm');
    const card = api.panel(`<div>Giọt mực đi được</div><div class="big-num"><input class="num-in" type="number" min="0" max="100" step="1" id="rsIn"> <small>mm</small></div><button class="btn small pop" id="rsOk">Ghi số</button><div class="warn-line" id="rsW"></div>`);
    let retried = false;
    const go = () => {
      const v = +card.querySelector('#rsIn').value;
      if (card.querySelector('#rsIn').value === '' || r.logged) return;
      const ok = Math.abs(v - r.s) <= 3;
      if (!ok && !retried) {
        retried = true; NL.audio.play('pop');
        const lo = Math.floor(r.s / 10) * 10;
        card.querySelector('#rsW').textContent = `Em nhìn lại nhé: giọt mực nằm giữa vạch ${lo} và ${lo + 10} mm. Đọc lại một lần`;
        return;
      }
      r.em = v; r.logged = true;
      NL.audio.play(ok ? 'ting' : 'pop');
      NL.game.toast(ok ? `Chính xác! Giọt mực ở ${vn(r.s, 0)} mm` : `Giọt mực ở khoảng ${vn(r.s, 0)} mm, em đọc ${v} mm`);
      st.runs.push(r); card.remove(); api.goto(5);
    };
    card.querySelector('#rsOk').onclick = go;
    card.querySelector('#rsIn').addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
    api.readInk = () => { card.querySelector('#rsIn').value = Math.round(r.s); go(); }; // dùng khi kiểm thử
  }

  function result() {
    const PAL = ['#5BB4EA', '#3FB37F', '#F2994A'];
    return {
      title: 'Hô hấp tế bào ở hạt nảy mầm', param: st.runs.map(r => `${kindName(r.kind).toLowerCase()} ${r.m} g, ${r.T} °C`).join('; '),
      table: {
        head: ['Lần', 'Loại hạt', 'm (g)', 'T (°C)', 't', 's (mm)', 'Em đọc (mm)', 'Kết quả'],
        rows: st.runs.map((r, i) => [i + 1, kindName(r.kind), r.m, r.T, RUN_MIN + ' phút', vn(r.s, 1), r.em === undefined ? '' : r.em, `V O₂ = ${vn(r.s * S, 3)} mL (≈ ${vn(rate(r) / r.m, 2)} mL/g/giờ)`])
          .concat(st.co2Runs.map((r, i) => [`CO₂ ${i + 1}`, kindName(r.kind), r.m, r.T, r.min + ' phút', '', '', `Nước vôi ${TURB[r.k]} (${r.k}/3), đối chứng trong`]))
          .concat(st.heatRuns.map((r, i) => [`Nhiệt ${i + 1}`, kindName(r.kind), r.m, r.T, r.hrs + ' giờ', '', '', `T bình ${vn(r.Tend, 1)} °C, đối chứng ${vn(r.T, 1)} °C`]))
      },
      chart: {
        type: 'line', xLabel: 'Thời gian (phút)', yLabel: 'Thể tích O₂ (mL)', xMax: RUN_MIN,
        series: st.runs.map((r, i) => ({ name: `${r.kind === 'alive' ? '' : kindName(r.kind) + ' '}${r.m} g ${r.T} °C`, color: PAL[i], points: r.pts }))
      },
      conclusion: `Hạt nảy mầm hô hấp mạnh: lấy O₂ (khoảng ${vn(V25, 2)} mL/g/giờ ở 25 °C), thải CO₂ (làm đục nước vôi) và tỏa nhiệt. Hô hấp mạnh hơn khi nhiều hạt hơn và nhiệt độ gần tối ưu (khoảng 35 °C, Q10 ≈ 2); hạt khô hô hấp rất yếu, hạt luộc chín không hô hấp`,
      note: `Ống mao dẫn Ø ${D_MM} mm nên S = π·r² = ${vn(S, 5)} mL/mm. Hạt luộc chín đã chết, enzyme bị biến tính nên không hô hấp; đó là bình đối chứng. Hạt luộc phải được khử trùng (ví dụ tráng cồn hoặc dung dịch thuốc tím loãng), nếu không vi khuẩn, nấm mọc trên hạt cũng hô hấp và làm sai kết quả.`
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
