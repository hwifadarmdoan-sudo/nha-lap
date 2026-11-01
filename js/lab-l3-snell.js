// Thí nghiệm L3: khúc xạ ánh sáng. Đo i và r, tính chiết suất, bắn laser trúng cảm biến dưới nước, phản xạ toàn phần.
(function () {
  const P = NL.phys, vn = P.vn, D2R = Math.PI / 180;
  const OX = 310, OY = 260, TOP = 80, BOT = 470, LEFT = 50, RIGHT = 570, RAD = 175;
  const MED = { w: { t: 'Nước', n: 1.33, col: 'rgba(90,170,230,.35)' }, g: { t: 'Thủy tinh', n: 1.5, col: 'rgba(160,220,210,.4)' }, x: { t: 'Nhựa bí ẩn', n: 1.46, col: 'rgba(230,200,140,.35)' } };
  let st, api_;
  const $ = id => document.getElementById(id);

  function build(api) {
    api_ = api;
    const L = api.svg, el = api.el;
    st = { i: 40, med: 'w', up: false, on: false, rows: [], xn: [1.4, 1.6, 1.8][Math.floor(Math.random() * 3)], target: null, shot: null, rm: 0 };
    MED.x.n = st.xn;
    el('rect', { x: LEFT, y: TOP, width: RIGHT - LEFT, height: BOT - TOP, rx: 10, fill: 'rgba(235,245,255,.6)', stroke: '#8FBBD8', 'stroke-width': 4 }, L);
    st.low = el('rect', { x: LEFT + 2, y: OY, width: RIGHT - LEFT - 4, height: BOT - OY - 2, fill: MED.w.col }, L);
    st.lowTxt = api.text(L, LEFT + 60, BOT - 16, 'Nước', 16, '#1F4E79', 800);
    st.upTxt = api.text(L, LEFT + 60, TOP + 28, 'Không khí', 16, '#1F4E79', 800);
    // thước đo độ và pháp tuyến
    const pr = el('g', {}, L);
    el('circle', { cx: OX, cy: OY, r: RAD, fill: 'none', stroke: 'rgba(31,78,121,.25)', 'stroke-width': 2 }, pr);
    for (let a = 0; a < 360; a += 5) {
      const big = a % 30 === 0, c = Math.cos(a * D2R), s = Math.sin(a * D2R), L1 = big ? 14 : 6;
      el('line', { x1: OX + s * RAD, y1: OY - c * RAD, x2: OX + s * (RAD - L1), y2: OY - c * (RAD - L1), stroke: 'rgba(31,78,121,.45)', 'stroke-width': big ? 2 : 1 }, pr);
      if (big) { const deg = a <= 90 ? a : a <= 270 ? Math.abs(180 - a) : 360 - a; api.text(pr, OX + s * (RAD - 28), OY - c * (RAD - 28) + 5, deg + '°', 11, '#6C88A3', 700); }
    }
    el('line', { x1: OX, y1: TOP + 4, x2: OX, y2: BOT - 4, stroke: '#6C88A3', 'stroke-width': 2, 'stroke-dasharray': '8 6' }, L);
    api.text(L, OX + 8, TOP + 20, 'pháp tuyến', 12, '#6C88A3', 700).setAttribute('text-anchor', 'start');
    // cảm biến dưới đáy
    st.sensor = api.g(L, -200, BOT - 14);
    el('rect', { x: -18, y: -10, width: 36, height: 20, rx: 5, fill: '#4A5A6A' }, st.sensor);
    st.sensLamp = el('circle', { cy: -10, r: 7, fill: '#E5534B' }, st.sensor);
    // tia sáng
    st.inc = el('line', { stroke: '#FF2D2D', 'stroke-width': 5, 'stroke-linecap': 'round' }, L);
    st.ref = el('line', { stroke: '#FF2D2D', 'stroke-width': 4, 'stroke-linecap': 'round' }, L);
    st.rfr = el('line', { stroke: '#FF2D2D', 'stroke-width': 5, 'stroke-linecap': 'round' }, L);
    st.tirTxt = api.text(L, OX + 140, OY - 18, '', 15, '#E5534B', 800);
    // drone laser
    st.drone = api.g(L, 0, 0);
    el('rect', { x: -26, y: -10, width: 52, height: 20, rx: 8, fill: '#2F80C0' }, st.drone);
    el('line', { x1: -34, y1: -14, x2: 34, y2: -14, stroke: '#4A5A6A', 'stroke-width': 4 }, st.drone);
    st.drLamp = el('circle', { cx: 26, r: 6, fill: '#FFB3B3' }, st.drone);
    // bảng đọc số
    const info = api.g(L, 680, 160);
    el('rect', { x: -95, y: -70, width: 190, height: 210, rx: 16, fill: '#fff', stroke: '#C9D8E6', 'stroke-width': 2 }, info);
    api.text(info, 0, -42, '📐 Thước đo góc', 16, '#1F4E79', 800);
    st.rI = api.text(info, 0, -8, '', 18, '#1F4E79', 800); st.rR = api.text(info, 0, 26, '', 18, '#1F4E79', 800);
    st.rS = api.text(info, 0, 62, '', 14, '#6C88A3', 700); st.rN = api.text(info, 0, 92, '', 14, '#6C88A3', 700);
    st.rM = api.text(info, 0, 122, '', 13, '#6C88A3', 700);
    let tS = 0;
    api.loop(dt => { tS -= dt; if (tS <= 0) { tS = 0.35; read(); } });
    draw();
  }
  const n1 = () => st.up ? MED[st.med].n : 1, n2 = () => st.up ? 1 : MED[st.med].n;
  function rAngle(i) { const s = n1() / n2() * Math.sin(i * D2R); return s > 1 ? null : Math.asin(s) / D2R; }
  function fresnel(i, r) {
    if (r === null) return 1; const a = n1(), b = n2(), ci = Math.cos(i * D2R), ct = Math.cos(r * D2R);
    const rs = ((a * ci - b * ct) / (a * ci + b * ct)) ** 2, rp = ((a * ct - b * ci) / (a * ct + b * ci)) ** 2; return (rs + rp) / 2;
  }
  function seg(line, x1, y1, ang, len, op) { line.setAttribute('x1', x1); line.setAttribute('y1', y1); line.setAttribute('x2', x1 + Math.cos(ang) * len); line.setAttribute('y2', y1 + Math.sin(ang) * len); line.setAttribute('opacity', op); }
  // độ dài tia từ O tới thành bể theo hướng ang
  function toWall(ang) { const dx = Math.cos(ang), dy = Math.sin(ang); let t = 1e9; if (dx > 0) t = Math.min(t, (RIGHT - 6 - OX) / dx); if (dx < 0) t = Math.min(t, (LEFT + 6 - OX) / dx); if (dy > 0) t = Math.min(t, (BOT - 6 - OY) / dy); if (dy < 0) t = Math.min(t, (TOP + 6 - OY) / dy); return t; }
  function draw() {
    const i = st.i, r = rAngle(i), sgn = st.up ? 1 : -1; // sgn: phía nguồn (trên = −1)
    const dX = OX - Math.sin(i * D2R) * (RAD + 40), dY = OY + sgn * Math.cos(i * D2R) * (RAD + 40);
    st.drone._extra = ` rotate(${(st.up ? -90 + i : 90 - i) * (st.up ? 1 : -1) * 0 + (st.up ? -(90 - i) : 90 - i)})`;
    api_.place(st.drone, dX, dY);
    const on = st.on;
    const aIn = Math.atan2(OY - dY, OX - dX);
    seg(st.inc, dX, dY, aIn, Math.hypot(OX - dX, OY - dY), on ? 1 : 0);
    const R = fresnel(i, r);
    const aRef = Math.atan2(sgn * Math.cos(i * D2R), Math.sin(i * D2R));
    seg(st.ref, OX, OY, aRef, toWall(aRef), on ? Math.max(0.12, R) : 0);
    if (r !== null) { const aR = Math.atan2(-sgn * Math.cos(r * D2R), Math.sin(r * D2R)); seg(st.rfr, OX, OY, aR, toWall(aR), on ? Math.max(0.15, 1 - R) : 0); st.aR = aR; }
    else st.rfr.setAttribute('opacity', 0);
    st.tirTxt.textContent = on && r === null ? 'Phản xạ toàn phần!' : '';
    st.drLamp.setAttribute('fill', on ? '#FF2D2D' : '#FFB3B3');
  }
  function read() {
    const r = rAngle(st.i);
    st.im = Math.round((st.i + P.gauss() * 0.2) * 2) / 2; st.rm = r === null ? null : Math.max(0, Math.round((r + P.gauss() * 0.2) * 2) / 2);
    if (!st.on) { st.rI.textContent = 'Laser đang tắt'; st.rR.textContent = ''; st.rS.textContent = ''; st.rN.textContent = ''; return; }
    st.rI.textContent = `Góc tới i ≈ ${vn(st.im, 1)}°`;
    st.rR.textContent = st.rm === null ? 'Không có tia khúc xạ' : `Góc khúc xạ r ≈ ${vn(st.rm, 1)}°`;
    st.rS.textContent = st.rm ? `sin i / sin r ≈ ${vn(Math.sin(st.im * D2R) / Math.sin(st.rm * D2R), 3)}` : '';
    st.rN.textContent = (st.up ? `Từ ${MED[st.med].t} ra không khí` : `Từ không khí vào ${MED[st.med].t}`);
  }
  function setMed(k) { st.med = k; st.low.setAttribute('fill', MED[k].col); st.lowTxt.textContent = MED[k].t; draw(); }
  function slider(api, o) { st.iC = api.slider(Object.assign({ label: 'Góc tới i', min: 0, max: 89, step: 0.5, value: st.i, unit: '°', onInput(v) { st.i = v; draw(); } }, o || {})); }
  function sideTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['Môi trường', 'i', 'r', 'sin i / sin r']);
    st.tbl.set(st.rows.slice(-6).map(x => [MED[x.med].t, vn(x.i, 1) + '°', vn(x.r, 1) + '°', vn(x.k, 3)]));
  }
  function record(api) {
    if (!st.on) { NL.game.toast('Bật laser trước đã'); return false; }
    if (st.i < 5) { NL.game.toast('Góc tới quá nhỏ, khó đo r. Chọn i từ 10° trở lên'); return false; }
    if (st.rows.some(x => x.med === st.med && Math.abs(x.i - st.i) < 2)) { NL.game.toast('Góc này đã đo rồi, chọn góc khác cách xa hơn'); return false; }
    st.rows.push({ med: st.med, i: st.im, r: st.rm, k: Math.sin(st.im * D2R) / Math.sin(st.rm * D2R) }); sideTable(api); NL.audio.play('ting'); return true;
  }

  const steps = [
    {
      label: 'Bật laser', text: 'Chạm vào drone để bật tia laser chiếu xiên xuống mặt nước', hint: 'Chạm vào drone màu xanh',
      enter(api) {
        if (!api.prediction) api.ask({ predict: true, q: 'Chiếu tia sáng xiên từ không khí vào nước. Đi vào nước, tia sáng sẽ…?', options: [{ t: 'Lệch lại gần pháp tuyến' }, { t: 'Lệch ra xa pháp tuyến' }, { t: 'Đi thẳng, không đổi hướng' }] });
        api.setOn(st.drone, true);
        api.tapable(st.drone, () => { st.on = true; NL.audio.play('pop'); draw(); read(); api.say('Tia sáng bị gãy khúc ở mặt nước, một phần nhỏ phản xạ ngược lên'); api.done(); });
      }
    },
    {
      label: () => `Đo góc · ${st.rows.length}/4 lần`, text: 'Đổi góc tới i, đọc góc khúc xạ r rồi bấm Ghi. Đo 4 góc, có thể đổi sang thủy tinh', hint: 'Kéo thanh góc tới, rồi bấm 📌 Ghi số liệu',
      enter(api) {
        sideTable(api);
        api.choices({ label: 'Khối bên dưới', items: [{ t: 'Nước', v: 'w' }, { t: 'Thủy tinh', v: 'g' }], value: st.med, onPick: setMed });
        slider(api);
        P.recButton(api, '📌 Ghi số liệu', () => { if (record(api)) { $('stepNo').textContent = `Đo góc · ${st.rows.length}/4 lần`; if (st.rows.length >= 4) api.done('Đo khối nhựa bí ẩn ➜'); } });
      }
    },
    {
      label: () => `Khối bí ẩn · ${st.rows.filter(x => x.med === 'x').length}/3 lần`, text: 'Thay bằng khối nhựa bí ẩn. Đo 3 góc rồi tìm chiết suất n của nó', hint: 'n = sin i / sin r, lấy trung bình 3 lần đo',
      enter(api) {
        setMed('x'); sideTable(api); slider(api);
        P.recButton(api, '📌 Ghi số liệu', () => {
          if (!record(api)) return;
          const xs = st.rows.filter(x => x.med === 'x'); $('stepNo').textContent = `Khối bí ẩn · ${xs.length}/3 lần`;
          if (xs.length < 3) return;
          const avg = xs.reduce((s, x) => s + x.k, 0) / 3; st.xAvg = avg;
          api.ask({
            q: `Trung bình sin i / sin r là ${vn(avg, 3)}. Chiết suất của khối nhựa bí ẩn là bao nhiêu?`,
            options: [1.4, 1.6, 1.8, 2.4].map(v => ({ t: 'n = ' + vn(v, 2), ok: v === st.xn, why: 'Ánh sáng đi từ không khí (n = 1) vào khối nên sin i / sin r chính là chiết suất của khối.' })),
            explain: `Theo định luật Snell: 1·sin i = n·sin r, nên n = sin i / sin r ≈ ${vn(st.xn, 2)}.`
          }, () => api.goto(3));
        });
      }
    },
    {
      label: 'Nhiệm vụ', text: 'Bắn laser trúng trạm cảm biến dưới đáy nước để nạp năng lượng', hint: 'Tia bị bẻ về phía pháp tuyến khi vào nước, nên ngắm thẳng sẽ trượt',
      enter(api) {
        setMed('w');
        const rT = 34 + Math.random() * 8, tx = OX + (BOT - 14 - OY) * Math.tan(rT * D2R); st.target = tx; api.place(st.sensor, tx, BOT - 14); st.sensLamp.setAttribute('fill', '#E5534B');
        const straight = Math.atan((tx - OX) / (BOT - 14 - OY)) / D2R; st.straight = straight;
        st.i = Math.round(straight * 2) / 2; st.on = false; draw();
        api.panel('<div>🎯 Hệ thống tự ngắm thẳng vào cảm biến. Có trúng không?</div>');
        slider(api);
        api.panel('<button class="btn pop">🔫 Bắn laser</button>').querySelector('button').addEventListener('click', () => fire(api));
      }
    },
    {
      label: 'Từ nước ra không khí', text: 'Đặt laser dưới nước chiếu lên. Tăng dần góc tới, xem tia khúc xạ ra sao', hint: 'Kéo góc tới lên quá 50°',
      enter(api) {
        st.up = true; st.on = true; setMed('w'); api.place(st.sensor, -200, 0); st.i = 20; draw();
        st.upTxt.textContent = 'Không khí'; st.asked = false;
        slider(api, { onInput(v) {
          st.i = v; draw();
          if (rAngle(v) === null && !st.asked) {
            st.asked = true;
            api.wait(1.2, () => api.ask({
              q: 'Tia khúc xạ biến mất, toàn bộ ánh sáng hắt ngược vào nước. Góc tới hạn của nước (n = 1,33) khoảng bao nhiêu?',
              options: [{ t: '48,8°', ok: true }, { t: '41,8°', why: 'Đó là góc tới hạn của thủy tinh n = 1,5. Tính sin i_gh = 1/1,33.' }, { t: '33,3°', why: 'sin i_gh = n₂/n₁ = 1/1,33 ≈ 0,75.' }, { t: '90°', why: 'Ở 90° tia đã sát mặt nước. Tia khúc xạ biến mất sớm hơn nhiều.' }],
              explain: 'Đi từ môi trường chiết quang hơn sang kém hơn, khi i ≥ i_gh với sin i_gh = n₂/n₁ = 1/1,33 thì xảy ra phản xạ toàn phần. Cáp quang dẫn sáng nhờ hiện tượng này.'
            }, () => api.done('Xem kết quả ➜')));
          }
        } });
      }
    },
    {
      label: 'Kết quả', text: 'Đồ thị sin i theo sin r', hint: 'Đường càng dốc thì chiết suất càng lớn',
      enter(api) { api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Lệch lại gần pháp tuyến', truth: 'đi từ không khí vào nước, tia sáng lệch lại gần pháp tuyến (r < i).',
          sub: 'Ánh sáng đi chậm hơn trong nước (v = c/n), nên bị bẻ hướng ở mặt phân cách. Chiếc đũa trong cốc trông như gãy cũng vì vậy.',
          result: result(),
          quiz: [{
            kicker: '❓ Đời thật', q: 'Người bắt cá bằng lao phải phóng lao vào chỗ nào so với chỗ mình nhìn thấy con cá?',
            options: [{ t: 'Thấp hơn chỗ nhìn thấy', ok: true }, { t: 'Đúng chỗ nhìn thấy', why: 'Em vừa thấy ngắm thẳng thì trượt. Ánh sáng từ cá bị bẻ khi ra khỏi mặt nước.' }, { t: 'Cao hơn chỗ nhìn thấy', why: 'Ảnh của cá trông nông hơn chỗ cá thật.' }],
            explain: 'Ánh sáng từ cá bị khúc xạ khi ra khỏi nước nên mắt thấy ảnh của cá nông hơn vị trí thật. Phải phóng lao thấp hơn chỗ nhìn thấy.'
          }]
        });
      }
    }
  ];

  function fire(api) {
    st.on = true; draw(); read();
    const hitX = OX + (BOT - 14 - OY) * Math.tan(rAngle(st.i) * D2R), miss = hitX - st.target;
    NL.audio.play('pop');
    if (Math.abs(miss) < 12) {
      st.sensLamp.setAttribute('fill', '#3FE07F'); NL.audio.play('success');
      api.say(`Trúng! Trạm cảm biến đã nhận năng lượng. Góc tới em dùng là ${vn(st.i, 1)}°, lớn hơn góc ngắm thẳng ${vn(st.straight, 1)}°`);
      api.done('Thử chiếu từ dưới nước lên ➜'); return;
    }
    if (Math.abs(st.i - st.straight) < 1.5 && !st.missOnce) {
      st.missOnce = true;
      api.wait(0.9, () => api.lesson({ title: 'Ngắm thẳng nên laser bắn trượt', text: `Trượt rồi! Tia laser vào nước bị bẻ về phía pháp tuyến nên rơi gần chân pháp tuyến hơn cảm biến ${Math.round(Math.abs(miss) / 3)} mm.`, sub: 'Bài học: tia sáng đổi hướng ở mặt nước. Muốn trúng cảm biến ở xa hơn, phải tăng góc tới i.', btn: '🎯 Chỉnh góc rồi bắn lại' }));
    } else NL.game.toast(miss < 0 ? 'Tia rơi gần quá, tăng góc tới i' : 'Tia rơi xa quá, giảm góc tới i');
  }

  function result() {
    const ser = [], col = { w: '#2F80C0', g: '#3FB37F', x: '#E8A33D' };
    ['w', 'g', 'x'].forEach(k => {
      const xs = st.rows.filter(x => x.med === k); if (!xs.length) return;
      ser.push({ name: MED[k].t, color: col[k], dots: true, points: xs.map(x => [+Math.sin(x.r * D2R).toFixed(3), +Math.sin(x.i * D2R).toFixed(3)]) });
      ser.push({ name: '', color: col[k], dash: true, points: [[0, 0], [1 / MED[k].n, 1]] });
    });
    return {
      title: 'Khúc xạ ánh sáng: định luật Snell', param: 'Laser đỏ, chiếu từ không khí vào nước (n = 1,33), thủy tinh (n = 1,5) và khối nhựa bí ẩn',
      table: { head: ['Lần', 'Môi trường', 'i (°)', 'r (°)', 'sin i', 'sin r', 'sin i / sin r'], rows: st.rows.map((x, k) => [k + 1, MED[x.med].t, vn(x.i, 1), vn(x.r, 1), vn(Math.sin(x.i * D2R), 3), vn(Math.sin(x.r * D2R), 3), vn(x.k, 3)]) },
      chart: { type: 'line', xLabel: 'sin r', yLabel: 'sin i', xMin: 0, xMax: 1, yMin: 0, yMax: 1, series: ser },
      conclusion: 'Tia khúc xạ nằm trong mặt phẳng tới, và tỉ số sin i / sin r không đổi với hai môi trường cho trước: n₁ sin i = n₂ sin r. Đi từ môi trường chiết quang hơn sang kém hơn với góc tới đủ lớn thì xảy ra phản xạ toàn phần',
      note: st.xAvg ? `Khối nhựa bí ẩn: đo được n ≈ ${vn(st.xAvg, 3)}, giá trị thật ${vn(st.xn, 2)}.` : ''
    };
  }
  function auto(api) {
    const k = api.step, btn = () => [...document.querySelectorAll('#labSide .btn')].find(b => b.offsetParent);
    if (k === 1 || k === 2) { const n = st.rows.filter(x => x.med === st.med).length; st.iC.set([20, 35, 50, 65][n % 4]); read(); btn().click(); return 'rec'; }
    if (k === 3) { st.iC.set(st.missOnce ? Math.atan(Math.sin(Math.atan((st.target - OX) / (BOT - 14 - OY))) * 1.33 / Math.sqrt(1 - (Math.sin(Math.atan((st.target - OX) / (BOT - 14 - OY))) * 1.33) ** 2)) / D2R : st.i); btn().click(); return 'fire'; }
    if (k === 4 && !st.asked) { st.iC.set(55); return 'tir'; }
    return false;
  }

  NL.lab.register('L3', { clearSide: true, auto, goal: 'Tia sáng đi từ không khí vào nước thì đổi hướng thế nào, và có lúc nào không ló ra được?', build, steps });
})();
