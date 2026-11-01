// Thí nghiệm L4: con lắc đơn. Đo chu kì bằng cổng quang, T không phụ thuộc m, góc lớn làm sai công thức, chỉnh đồng hồ đúng 2,00 s.
(function () {
  const P = NL.phys, vn = P.vn, D2R = Math.PI / 180;
  const PX = 300, PY = 64, G = { e: { t: 'Trái Đất', g: 9.8 }, m: { t: 'Mặt Trăng', g: 1.6 }, j: { t: 'Sao Mộc', g: 24.8 } };
  const MASS = [50, 200, 500, 1000];
  let st, api_;
  const $ = id => document.getElementById(id);
  const pxLen = l => 70 + l * 180;
  const Tth = () => 2 * Math.PI * Math.sqrt(st.l / G[st.g].g);

  function build(api) {
    api_ = api;
    const L = api.svg, el = api.el;
    st = { l: 0.6, m: 200, a0: 8, g: 'e', th: 8 * D2R, w: 0, run: false, rows: [], meas: null, clock: 0, method: 'gate', speed: 1 };
    // khung gỗ đồng hồ
    el('rect', { x: PX - 150, y: 30, width: 300, height: 26, rx: 8, fill: '#8A5A3B' }, L);
    el('rect', { x: PX - 150, y: 30, width: 20, height: 470, rx: 6, fill: '#8A5A3B' }, L);
    el('rect', { x: PX + 130, y: 30, width: 20, height: 470, rx: 6, fill: '#8A5A3B' }, L);
    el('circle', { cx: PX, cy: PY, r: 8, fill: '#C9A227' }, L);
    // cổng quang ở vị trí cân bằng
    st.gate = api.g(L, PX, 0);
    el('rect', { x: -70, y: -24, width: 14, height: 48, rx: 4, fill: '#4A5A6A' }, st.gate);
    el('rect', { x: 56, y: -24, width: 14, height: 48, rx: 4, fill: '#4A5A6A' }, st.gate);
    st.beam = el('line', { x1: -56, y1: 0, x2: 56, y2: 0, stroke: '#FF2D2D', 'stroke-width': 2, opacity: .8 }, st.gate);
    st.gateTxt = api.text(st.gate, 0, 44, 'Cổng quang', 12, '#6C88A3', 700);
    // dây và quả nặng
    st.rod = el('line', { x1: PX, y1: PY, stroke: '#4A5A6A', 'stroke-width': 2.5 }, L);
    st.bob = api.g(L, PX, PY + 100);
    st.bobC = el('circle', { r: 16, fill: '#C9A227', stroke: '#8A6A10', 'stroke-width': 3 }, st.bob);
    st.bobT = api.text(st.bob, 0, 5, '200 g', 10, '#5A3A10', 800);
    st.arc = el('path', { fill: 'none', stroke: '#2F80C0', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, L);
    // mặt đồng hồ thành phố
    const ck = api.g(L, 640, 150); st.ck = ck;
    el('circle', { r: 82, fill: '#FFF8E6', stroke: '#8A5A3B', 'stroke-width': 8 }, ck);
    for (let k = 0; k < 12; k++) { const a = k * 30 * D2R; el('line', { x1: Math.sin(a) * 66, y1: -Math.cos(a) * 66, x2: Math.sin(a) * 74, y2: -Math.cos(a) * 74, stroke: '#4A3A2A', 'stroke-width': 3 }, ck); }
    st.secH = el('line', { x1: 0, y1: 10, x2: 0, y2: -66, stroke: '#E5534B', 'stroke-width': 2.5 }, ck);
    st.minH = el('line', { x1: 0, y1: 0, x2: 0, y2: -52, stroke: '#4A3A2A', 'stroke-width': 5, 'stroke-linecap': 'round' }, ck);
    el('circle', { r: 6, fill: '#4A3A2A' }, ck);
    api.text(ck, 0, 112, 'Đại đồng hồ thành phố', 14, '#1F4E79', 800);
    st.drift = api.text(ck, 0, 134, '', 14, '#6C88A3', 700);
    // đồng hồ cổng quang
    const tm = api.g(L, 640, 360);
    el('rect', { x: -110, y: -46, width: 220, height: 104, rx: 14, fill: '#1B2833' }, tm);
    api.text(tm, 0, -24, 'Đồng hồ đo thời gian', 13, '#9AA9B7', 700);
    st.tmA = api.text(tm, 0, 8, '0,000 s', 26, '#7CF29B', 800);
    st.tmB = api.text(tm, 0, 40, '', 14, '#C9D8E6', 700);
    let tickAcc = 0;
    api.loop(dt => {
      const h = dt * (st.meas ? st.speed : 1) / 8;
      for (let k = 0; k < 8; k++) step(h);
      // kim giây nhảy mỗi lần quả lắc qua vị trí cân bằng
      draw();
      tickAcc += dt;
    });
    draw();
  }
  function acc(th) { return -G[st.g].g / st.l * Math.sin(th); }
  function step(h) {
    if (!st.run) return;
    const th0 = st.th;
    const k1v = acc(st.th), k1x = st.w;
    const k2v = acc(st.th + k1x * h / 2), k2x = st.w + k1v * h / 2;
    const k3v = acc(st.th + k2x * h / 2), k3x = st.w + k2v * h / 2;
    const k4v = acc(st.th + k3x * h), k4x = st.w + k3v * h;
    st.th += h / 6 * (k1x + 2 * k2x + 2 * k3x + k4x); st.w += h / 6 * (k1v + 2 * k2v + 2 * k3v + k4v);
    st.time = (st.time || 0) + h;
    if (th0 < 0 !== st.th < 0) cross(); // qua vị trí cân bằng
  }
  function cross() {
    st.clock += 1; // bộ thoát: mỗi nửa chu kì đẩy kim giây 1 s (đúng khi T = 2 s)
    NL.audio.play('tick');
    st.beam.setAttribute('opacity', 0.2); setTimeout(() => st.beam.setAttribute('opacity', 0.8), 60);
    const m = st.meas; if (!m) return;
    if (m.n === 0) m.t0 = st.time;
    m.n++;
    const per = (m.n - 1) / 2;
    if (m.method === 'gate') {
      st.tmA.textContent = vn(st.time - m.t0, 3) + ' s'; st.tmB.textContent = `Đã đếm ${Math.floor(per)}/10 chu kì`;
      if (per >= 10) finish(st.time - m.t0, 10);
    } else if (per >= 1) finish(st.time - m.t0 + P.gauss() * 0.14, 1);
  }
  function finish(t, N) {
    const m = st.meas; st.meas = null;
    const T = N === 10 ? Math.round((t / 10 + P.gauss() * 0.0004) * 1000) / 1000 : Math.round(t * 100) / 100;
    st.tmA.textContent = vn(t, N === 10 ? 3 : 2) + ' s'; st.tmB.textContent = `T = ${vn(T, N === 10 ? 3 : 2)} s`;
    m.cb && m.cb(T, N);
  }
  function draw() {
    const R = pxLen(st.l), x = PX + Math.sin(st.th) * R, y = PY + Math.cos(st.th) * R;
    st.rod.setAttribute('x2', x); st.rod.setAttribute('y2', y);
    api_.place(st.bob, x, y);
    api_.place(st.gate, PX, PY + R);
    const a = st.a0 * D2R;
    st.arc.setAttribute('d', `M ${PX - Math.sin(a) * R} ${PY + Math.cos(a) * R} A ${R} ${R} 0 0 0 ${PX + Math.sin(a) * R} ${PY + Math.cos(a) * R}`);
    st.secH.setAttribute('transform', `rotate(${st.clock * 6})`); st.minH.setAttribute('transform', `rotate(${st.clock * 0.1})`);
    const T = st.lastT;
    st.drift.textContent = T ? (Math.abs(2 / T - 1) < 0.0028 ? 'Chạy đúng giờ ✓' : `Chạy ${2 / T > 1 ? 'nhanh' : 'chậm'} ${Math.round(Math.abs(2 / T - 1) * 3600)} giây mỗi giờ`) : '';
  }
  function release() { st.th = st.a0 * D2R; st.w = 0; st.run = true; }
  function setMass(m) { st.m = m; const r = 10 + Math.cbrt(m) * 1.6; st.bobC.setAttribute('r', r); st.bobT.textContent = m + ' g'; }
  function measure(api, cb) {
    if (st.meas) return;
    release();
    st.speed = st.method === 'gate' ? 4 : 1;
    st.meas = { n: 0, method: st.method, cb: (T, N) => { st.lastT = T; cb(T, N); } };
    st.tmA.textContent = '0,000 s'; st.tmB.textContent = st.method === 'gate' ? 'Đang đếm… (tua nhanh ×4)' : 'Bấm tay khi quả lắc qua cổng…';
  }
  function controls(api, o) {
    o = o || {};
    if (o.l !== false) st.lC = api.slider({ label: 'Chiều dài dây l', min: 0.1, max: 2, step: 0.01, value: st.l, unit: 'm', onInput(v) { st.l = v; st.meas = null; release(); draw(); } });
    if (o.a) st.aC = api.slider({ label: 'Biên độ góc α₀', min: 2, max: 80, step: 1, value: st.a0, unit: '°', onInput(v, c) { st.a0 = v; st.meas = null; release(); draw(); c.warn(v > 15 ? '⚠ Góc lớn: công thức T = 2π√(l/g) kém chính xác' : ''); } });
    if (o.m) api.choices({ label: 'Quả nặng', items: MASS.map(m => ({ t: m + ' g', v: m })), value: st.m, onPick(v) { setMass(v); st.meas = null; release(); } });
    if (o.g) api.choices({ label: 'Nơi đặt đồng hồ', items: Object.keys(G).map(k => ({ t: G[k].t, v: k })), value: st.g, onPick(v) { st.g = v; st.meas = null; release(); } });
    if (o.method) api.choices({ label: 'Cách đo chu kì', items: [{ t: 'Bấm tay 1 chu kì', v: 'hand' }, { t: 'Cổng quang 10 chu kì', v: 'gate' }], value: st.method, onPick(v) { st.method = v; } });
  }
  function sideTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['l (m)', 'm (g)', 'α₀', 'T (s)']);
    st.tbl.set(st.rows.slice(-6).map(r => [vn(r.l, 2), r.m, r.a + '°', vn(r.T, r.N === 10 ? 3 : 2) + (r.g !== 'e' ? ' 🌙' : '')]));
  }
  function measBtn(api, cb) {
    return P.recButton(api, '⏱ Đo chu kì', () => measure(api, (T, N) => {
      const row = { l: st.l, m: st.m, a: st.a0, g: st.g, T, N };
      if (N === 1 && !st.handOnce) {
        st.handOnce = true;
        api.lesson({ title: 'Bấm giờ tay một chu kì sai số lớn', text: `Em bấm tay được T = ${vn(T, 2)} s, còn lí thuyết là ${vn(Tth(), 3)} s. Tay người bấm trễ khoảng 0,1 đến 0,2 s, so với chu kì chỉ 1–2 s thì sai rất nhiều.`, sub: 'Bài học: dùng cổng quang, và đo một lần cho 10 chu kì rồi chia 10 để sai số giảm 10 lần.', btn: '⏱ Chuyển sang cổng quang' }, () => { st.method = 'gate'; api.goto(api.step); });
        return;
      }
      cb(row);
    }));
  }

  const steps = [
    {
      label: 'Thả quả lắc', text: 'Chạm vào quả lắc để thả cho nó dao động', hint: 'Chạm quả lắc màu vàng',
      enter(api) {
        if (!api.prediction) api.ask({ predict: true, q: 'Giữ nguyên chiều dài dây, thay quả nặng 50 g bằng quả 1000 g. Chu kì dao động sẽ…?', options: [{ t: 'Không đổi' }, { t: 'Nhỏ hơn: quả nặng rơi nhanh hơn' }, { t: 'Lớn hơn: quả nặng khó kéo hơn' }] });
        st.th = st.a0 * D2R; draw();
        api.setOn(st.bob, true);
        api.tapable(st.bob, () => { release(); NL.audio.play('pop'); api.say('Quả lắc cắt tia laser của cổng quang mỗi khi qua vị trí thấp nhất, đúng lúc nó nhanh nhất'); api.done(); });
      }
    },
    {
      label: () => `T theo l · ${st.rows.filter(r => r.N === 10).length}/4 lần`, text: 'Đổi chiều dài dây rồi đo chu kì. Đo 4 chiều dài khác nhau', hint: 'Kéo thanh l, bấm ⏱ Đo chu kì và chờ đếm xong',
      enter(api) {
        sideTable(api); controls(api, { method: true });
        measBtn(api, row => {
          if (st.rows.some(r => r.N === 10 && Math.abs(r.l - row.l) < 0.05 && r.m === row.m)) { NL.game.toast('Chiều dài này đo rồi, chọn l khác xa hơn'); return; }
          st.rows.push(row); sideTable(api); NL.audio.play('ting');
          const n = st.rows.filter(r => r.N === 10).length; $('stepNo').textContent = `T theo l · ${n}/4 lần`;
          if (n >= 4) api.done('Thử đổi quả nặng ➜');
        });
      }
    },
    {
      label: 'Đổi quả nặng', text: 'Giữ nguyên dây, đo chu kì với một quả nặng khác', hint: 'Chọn quả nặng khác ở cột phải rồi đo',
      enter(api) {
        sideTable(api); controls(api, { l: false, m: true });
        const m0 = st.m, l0 = st.l;
        measBtn(api, row => {
          if (row.m === m0) { NL.game.toast('Đổi sang quả nặng khác rồi đo nhé'); return; }
          st.rows.push(row); sideTable(api);
          const prev = st.rows.filter(r => r.N === 10 && Math.abs(r.l - l0) < 0.005 && r.m === m0).pop();
          api.ask({
            q: `Dây ${vn(l0, 2)} m: quả ${m0} g có T ${prev ? '= ' + vn(prev.T, 3) + ' s' : 'như vừa đo'}, quả ${row.m} g có T = ${vn(row.T, 3)} s. Khối lượng ảnh hưởng thế nào?`,
            options: [{ t: 'Gần như không ảnh hưởng tới chu kì', ok: true }, { t: 'Quả càng nặng, chu kì càng nhỏ', why: 'So hai số T vừa đo: chênh lệch chỉ cỡ sai số đo.' }, { t: 'Quả càng nặng, chu kì càng lớn', why: 'So hai số T vừa đo: chênh lệch chỉ cỡ sai số đo.' }],
            explain: 'Quả nặng hơn bị Trái Đất hút mạnh hơn nhưng cũng khó tăng tốc hơn đúng bằng chừng đó, nên chuyển động như nhau. T = 2π√(l/g) không có m.'
          }, () => api.goto(3));
        });
      }
    },
    {
      label: 'Nhiệm vụ', text: 'Chỉnh con lắc để đại đồng hồ chạy đúng: chu kì T = 2,00 s', hint: 'T = 2,00 s khi l ≈ 0,99 m. Thả với góc nhỏ',
      enter(api) {
        st.a0 = 50; st.th = st.a0 * D2R; draw();
        api.panel('<div>⚙ Thợ cũ để quả lắc lệch 50°. Đồng hồ đang chạy sai.</div>');
        sideTable(api); controls(api, { a: true });
        measBtn(api, row => {
          st.rows.push(row); sideTable(api); draw();
          if (Math.abs(row.T - 2) <= 0.01) { NL.audio.play('success'); api.say(`T = ${vn(row.T, 3)} s. Đại đồng hồ chạy đúng giờ rồi! 🕰`); api.done('Mang đồng hồ lên Mặt Trăng ➜'); return; }
          const okL = Math.abs(2 * Math.PI * Math.sqrt(st.l / 9.8) - 2) <= 0.01;
          if (okL && st.a0 > 20 && !st.bigOnce) {
            st.bigOnce = true;
            api.lesson({ title: 'Góc lắc lớn làm chu kì lệch khỏi công thức', text: `Dây đã đúng ${vn(st.l, 2)} m mà vẫn đo được T = ${vn(row.T, 3)} s! Với góc ${st.a0}°, con lắc không còn dao động điều hòa nên chu kì dài hơn 2π√(l/g).`, sub: 'Bài học: công thức T = 2π√(l/g) chỉ đúng khi góc lệch nhỏ (khoảng dưới 10°).', btn: '↘ Giảm góc rồi đo lại' });
          } else NL.game.toast(row.T > 2 ? 'Chu kì dài quá, đồng hồ chạy chậm' : 'Chu kì ngắn quá, đồng hồ chạy nhanh');
        });
      }
    },
    {
      label: 'Lên Mặt Trăng', text: 'Mang đồng hồ lên Mặt Trăng rồi đo lại chu kì', hint: 'Chọn Mặt Trăng ở cột phải rồi đo',
      enter(api) {
        sideTable(api); controls(api, { l: false, g: true });
        measBtn(api, row => {
          if (row.g === 'e') { NL.game.toast('Chọn Mặt Trăng hoặc Sao Mộc rồi đo nhé'); return; }
          st.rows.push(row); sideTable(api); draw();
          if (row.g !== 'm') { NL.game.toast('Thử cả Mặt Trăng nữa nhé'); return; }
          api.ask({
            q: `Trên Mặt Trăng (g = 1,6 m/s²) đo được T = ${vn(row.T, 2)} s. Đại đồng hồ trên Mặt Trăng sẽ…?`,
            options: [{ t: 'Chạy chậm hơn rất nhiều', ok: true }, { t: 'Chạy nhanh hơn', why: 'T lớn hơn 2 s nghĩa là mỗi nhịp kéo dài hơn.' }, { t: 'Vẫn chạy đúng', why: 'Nhìn mặt đồng hồ: còn ghi "đúng giờ" không?' }],
            explain: 'g nhỏ hơn khoảng 6 lần nên T tăng khoảng √6 ≈ 2,5 lần. Đồng hồ quả lắc mang lên Mặt Trăng sẽ chạy rất chậm.'
          }, () => { st.g = 'e'; api.goto(5); });
        });
      }
    },
    {
      label: 'Kết quả', text: 'Đồ thị bình phương chu kì T² theo chiều dài dây l', hint: 'Các điểm nằm trên một đường thẳng đi qua gốc',
      enter(api) { st.run = false; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Không đổi', truth: 'chu kì con lắc đơn không phụ thuộc khối lượng quả nặng.',
          sub: 'T = 2π√(l/g): chỉ phụ thuộc chiều dài dây và gia tốc trọng trường, khi góc lệch nhỏ.',
          result: result(),
          quiz: [{
            kicker: '❓ Sửa đồng hồ', q: 'Đồng hồ quả lắc nhà em chạy nhanh. Em cần làm gì với quả lắc?',
            options: [{ t: 'Hạ quả lắc xuống để dây dài hơn', ok: true }, { t: 'Nâng quả lắc lên để dây ngắn hơn', why: 'Chạy nhanh nghĩa là T đang nhỏ quá. Muốn T lớn hơn thì l phải thế nào?' }, { t: 'Thay quả lắc nặng hơn', why: 'Khối lượng không ảnh hưởng tới chu kì.' }],
            explain: 'Chạy nhanh là chu kì quá ngắn. T tỉ lệ với √l nên phải tăng chiều dài, tức hạ quả lắc xuống.'
          }]
        });
      }
    }
  ];

  function result() {
    const pts = st.rows.filter(r => r.N === 10 && r.g === 'e' && r.a <= 15).map(r => [r.l, +(r.T * r.T).toFixed(3)]);
    return {
      title: 'Con lắc đơn: chu kì theo chiều dài', param: 'Quả nặng 50–1000 g, góc lệch nhỏ, g = 9,8 m/s², đo 10 chu kì bằng cổng quang',
      table: { head: ['Lần', 'Nơi', 'l (m)', 'm (g)', 'α₀ (°)', 'Cách đo', 'T (s)', 'T² (s²)'], rows: st.rows.map((r, k) => [k + 1, G[r.g].t, vn(r.l, 2), r.m, r.a, r.N === 10 ? 'Cổng quang 10T' : 'Bấm tay 1T', vn(r.T, 3), vn(r.T * r.T, 3)]) },
      chart: { type: 'line', xLabel: 'l (m)', yLabel: 'T² (s²)', xMin: 0, xMax: 2, yMin: 0, yMax: 8, series: [{ name: 'Lí thuyết 4π²l/g', color: '#9AA9B7', dash: true, points: [[0, 0], [2, 4 * Math.PI * Math.PI * 2 / 9.8]] }, { name: 'Em đo', color: '#2F80C0', dots: true, points: pts }] },
      conclusion: 'Với góc lệch nhỏ, chu kì con lắc đơn T = 2π√(l/g): tỉ lệ với căn bậc hai chiều dài dây, không phụ thuộc khối lượng quả nặng. Đồ thị T² theo l là đường thẳng đi qua gốc. Góc lệch lớn làm chu kì dài hơn công thức',
      note: 'Khi đo bằng cổng quang, mô phỏng tua nhanh ×4 để đỡ phải chờ.'
    };
  }
  function auto(api) {
    const k = api.step, btn = () => [...document.querySelectorAll('#labSide .btn')].find(b => b.offsetParent);
    if (st.meas) return 'wait-meas';
    if (k === 1) { st.method = 'gate'; st.lC.set([0.3, 0.6, 1.0, 1.5][st.rows.filter(r => r.N === 10).length % 4]); btn().click(); return 'meas'; }
    if (k === 2) { if (st.m === 200) [...document.querySelectorAll('#labSide .seg-b')].find(b => b.textContent === '1000 g').click(); btn().click(); return 'meas-m'; }
    if (k === 3) { if (st.l !== 0.99) st.lC.set(0.99); else if (st.bigOnce) st.aC.set(6); btn().click(); return 'meas-a'; }
    if (k === 4) { if (st.g !== 'm') [...document.querySelectorAll('#labSide .seg-b')].find(b => b.textContent === 'Mặt Trăng').click(); btn().click(); return 'meas-g'; }
    return false;
  }

  NL.lab.register('L4', { clearSide: true, auto, goal: 'Chu kì con lắc phụ thuộc vào chiều dài dây, khối lượng quả nặng hay góc thả?', build, steps });
})();
