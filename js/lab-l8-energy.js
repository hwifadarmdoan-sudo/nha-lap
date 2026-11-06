// Thí nghiệm L8: bảo toàn cơ năng trên máng trượt ván. Ba cột năng lượng Wđ, Wt, W chạy theo ván, đỉnh sau cao hơn chỗ thả, ma sát biến cơ năng thành nhiệt.
(function () {
  const P = NL.phys, vn = P.vn, G = 9.8, M = 50;
  const TRACKS = {
    U: { t: 'Máng chữ U', pts: [[0, 4], [5, 0], [10, 4]] },
    B: { t: 'Đồi thấp 2,5 m', pts: [[0, 4], [3, 0], [5.5, 2.5], [8, 0], [10, 4]] },
    C: { t: 'Đồi cao 4,4 m', pts: [[0, 4], [3, 0], [5.5, 4.4], [8, 0], [10, 4]] }
  };
  const X = x => 60 + x * 68, Y = h => 318 - h * 52;
  let st, api_;
  const $ = id => document.getElementById(id);

  function hAt(x) {
    const p = TRACKS[st.tr].pts; x = Math.max(0, Math.min(10, x));
    for (let k = 0; k < p.length - 1; k++) if (x <= p[k + 1][0]) { const t = (x - p[k][0]) / (p[k + 1][0] - p[k][0]); return p[k][1] + (p[k + 1][1] - p[k][1]) * (1 - Math.cos(Math.PI * t)) / 2; }
    return p[p.length - 1][1];
  }
  const slope = x => (hAt(x + 0.001) - hAt(x - 0.001)) / 0.002;
  // điểm thả trên sườn trái có độ cao h0
  function xOf(h0) { const p = TRACKS[st.tr].pts; const t = Math.acos(1 - 2 * (p[0][1] - h0) / (p[0][1] - p[1][1])) / Math.PI; return p[0][0] + t * (p[1][0] - p[0][0]); }

  function build(api) {
    api_ = api;
    const L = api.svg, el = api.el;
    st = { tr: 'U', h0: 4, x: 0, v: 0, run: false, mu: 0, heat: 0, rows: [], t: 0 };
    el('rect', { x: 20, y: 52, width: 760, height: 280, rx: 18, fill: '#EAF4FC' }, L);
    for (let h = 0; h <= 4; h++) { el('line', { x1: 40, y1: Y(h), x2: 770, y2: Y(h), stroke: '#C9D8E6', 'stroke-dasharray': '4 6' }, L); api.text(L, 34, Y(h) + 4, h + ' m', 11, '#6C88A3', 700); }
    st.track = el('path', { fill: '#C9A27A', stroke: '#8A5A3B', 'stroke-width': 5 }, L);
    st.mark0 = el('line', { x1: 40, y1: 0, x2: 770, y2: 0, stroke: '#E5534B', 'stroke-width': 2, 'stroke-dasharray': '8 5' }, L);
    st.mark0T = api.text(L, 640, 0, '', 12, '#E5534B', 800);
    st.flag = api.g(L, X(9.8), Y(4)); el('line', { x1: 0, y1: 0, x2: 0, y2: -40, stroke: '#4A5A6A', 'stroke-width': 3 }, st.flag); el('path', { d: 'M0 -40 L26 -32 L0 -24 Z', fill: '#34C759' }, st.flag); st.flag.style.display = 'none';
    // ván và người
    st.sk = api.g(L, 0, 0);
    const body = el('g', {}, st.sk); st.body = body;
    el('rect', { x: -22, y: -8, width: 44, height: 7, rx: 3, fill: '#E86A92' }, body);
    el('circle', { cx: -13, cy: 1, r: 4, fill: '#333' }, body); el('circle', { cx: 13, cy: 1, r: 4, fill: '#333' }, body);
    el('path', { d: 'M-8 -8 L0 -30 L8 -8 M-12 -24 L0 -30 L12 -22', fill: 'none', stroke: '#1F4E79', 'stroke-width': 4, 'stroke-linecap': 'round' }, body);
    el('circle', { cx: 0, cy: -40, r: 9, fill: '#FFD6B0', stroke: '#1F4E79', 'stroke-width': 2 }, body);
    el('path', { d: 'M-9 -43 Q0 -55 9 -43 Z', fill: '#F2C230' }, body);
    // bốn cột năng lượng nằm ngang
    st.bars = [['Wđ động năng', '#E86A92'], ['Wt thế năng', '#3D8BD9'], ['W cơ năng', '#F2C230'], ['Nhiệt do ma sát', '#E5734B']].map(([t, c], k) => {
      const y = 368 + k * 36; api.text(L, 110, y + 15, t, 13, '#1F4E79', 800);
      el('rect', { x: 180, y, width: 500, height: 22, rx: 11, fill: '#E3EAF1' }, L);
      const b = el('rect', { x: 180, y, width: 0, height: 22, rx: 11, fill: c }, L), v = api.text(L, 730, y + 16, '', 13, '#1F4E79', 800);
      return { b, v };
    });
    st.info = api.text(L, 400, 516, '', 14, '#6C88A3', 800);
    setTrack('U');
    api.loop(tick);
  }
  function setTrack(k) {
    st.tr = k; st.run = false; st.v = 0;
    let d = `M${X(0)} ${Y(hAt(0))}`; for (let x = 0.1; x <= 10.001; x += 0.1) d += ` L${X(x)} ${Y(hAt(x))}`;
    st.track.setAttribute('d', d + ` L${X(10)} 330 L${X(0)} 330 Z`);
    reset();
  }
  function reset() { st.run = false; st.v = 0; st.heat = 0; st.x = Math.max(0.12, xOf(Math.min(st.h0, TRACKS[st.tr].pts[0][1]))); st.hs = hAt(st.x); st.W0 = M * G * st.hs; st.maxR = 0; place(); }
  function place() {
    const h = hAt(st.x), a = Math.atan(slope(st.x) * 52 / 68);
    api_.place(st.sk, X(st.x), Y(h));
    st.body.setAttribute('transform', `rotate(${-a * 180 / Math.PI})`);
    st.mark0.setAttribute('y1', Y(st.hs)); st.mark0.setAttribute('y2', Y(st.hs)); st.mark0T.setAttribute('y', Y(st.hs) - 6); st.mark0T.textContent = `thả ${vn(st.hs, 1)} m`;
  }
  function tick(dt) {
    if (st.paused) dt = 0; else if (st.slow) dt *= 0.25;
    if (st.run && dt > 0) {
      const n = Math.ceil(dt / 0.002), h = dt / n;
      for (let k = 0; k < n; k++) {
        const s = slope(st.x), q = Math.sqrt(1 + s * s), prev = st.v;
        let acc = -G * s / q;
        if (st.mu) { const f = st.mu * G / q; if (Math.abs(st.v) < 0.05 && Math.abs(acc) <= f) { st.v = 0; acc = 0; } else acc -= f * Math.sign(st.v || acc); }
        st.v += acc * h; const dx = st.v * h / q;
        if (st.mu) st.heat += st.mu * M * G / q * Math.abs(st.v * h);
        st.x += dx;
        if (st.x <= 0) { st.x = 0; st.v = Math.max(0, st.v); } if (st.x >= 10) { st.x = 10; st.v = Math.min(0, st.v); }
        if (prev > 0 && st.v <= 0) st.onTurn && st.onTurn(st.x);
      }
      st.maxR = Math.max(st.maxR, st.x > 5 ? hAt(st.x) : 0);
      st.onMove && st.onMove();
    }
    place();
    const e = energies(), sc = 500 / 2200;
    [e.K, e.U, e.W, st.heat].forEach((v, k) => { st.bars[k].b.setAttribute('width', Math.max(0, v * sc)); st.bars[k].v.textContent = Math.round(v) + ' J'; });
    st.info.textContent = `m = ${M} kg · h = ${vn(e.h, 2)} m · v = ${vn(e.v, 1)} m/s${st.mu ? ' · có ma sát' : ''}${st.paused ? ' · tạm dừng' : st.slow ? ' · chậm 0,25×' : ''}`;
  }
  function energies() {
    const h = hAt(st.x), s = slope(st.x), U = M * G * h;
    // động năng lấy từ bảo toàn năng lượng (chính xác hơn tích phân số)
    const K = st.run ? Math.max(0, st.W0 - st.heat - U) : 0;
    return { h, U, K, W: U + K, v: Math.sqrt(2 * K / M) };
  }
  function release(api) {
    reset(); st.run = true; NL.audio.play('step');
    // vận tốc khởi đầu = 0, đẩy nhẹ cho khỏi kẹt ở đỉnh
    st.v = 0.4;
  }
  function controls(api, o) {
    o = o || {};
    if (o.track) api.choices({ label: 'Kiểu máng', items: Object.keys(TRACKS).map(k => ({ t: TRACKS[k].t, v: k })), value: st.tr, onPick(v) { setTrack(v); o.track(v); } });
    if (o.h0) st.cH = api.slider({ label: 'Độ cao thả h₀', min: 1, max: 4, step: 0.1, value: st.h0, unit: 'm', onInput(v) { st.h0 = v; reset(); o.h0(v); } });
  }
  function sideTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['h (m)', 'v (m/s)', 'Wđ (J)', 'Wt (J)', 'W (J)']);
    st.tbl.set(st.rows.slice(-5).map(r => [vn(r.h, 2), vn(r.v, 1), r.K, r.U, r.W]));
  }
  function armTap(api, cb) { api.setOn(st.sk, true); api.tapable(st.sk, () => { release(api); cb && cb(); }); }

  const steps = [
    {
      label: 'Thả ván', text: 'Máng chữ U, không ma sát. Chạm vào ván để thả từ độ cao 4 m', hint: 'Nhìn ba cột năng lượng ở dưới',
      enter(api) {
        if (!api.prediction) api.ask({ predict: true, q: 'Thả ván từ độ cao 4 m trên máng chữ U không ma sát. Ván lên tới độ cao bao nhiêu ở bờ bên kia?', options: [{ t: 'Đúng 4 m' }, { t: 'Thấp hơn 4 m' }, { t: 'Cao hơn 4 m' }] });
        armTap(api, () => {
          st.onTurn = x => { if (x > 5) { st.onTurn = null; api.say(`Ván lên tới ${vn(hAt(x), 2)} m, đúng bằng chỗ thả! Wđ và Wt đổi cho nhau, W không đổi`); api.done('Ghi số liệu ➜'); } };
        });
      }
    },
    {
      label: () => `Ghi năng lượng · ${P.cnt(st.rows.length, 5, 'lần')}`, text: 'Ván đang trượt qua lại. Bấm Ghi ở 5 độ cao khác nhau, có cả gần đáy và gần đỉnh', hint: 'Bấm lúc ván ở các độ cao khác nhau',
      enter(api) {
        sideTable(api);
        if (!st.run) release(api);
        st.paused = false; st.slow = false;
        api.choices({ label: 'Tốc độ', items: [{ t: '▶ Chạy', v: 'run' }, { t: '🐢 Chậm 0,25×', v: 'slow' }, { t: '⏸ Tạm dừng', v: 'pause' }], value: 'run', onPick(v) { st.paused = v === 'pause'; st.slow = v === 'slow'; } });
        P.recButton(api, '📌 Ghi lúc này', () => {
          const e = energies();
          if (st.rows.some(r => Math.abs(r.h - e.h) < 0.4)) { NL.game.toast('Độ cao này gần lần trước, chờ ván tới chỗ khác'); return; }
          // h, v, Wđ, Wt lấy từ cùng một trạng thái: Wđ = ½mv², Wt = mgh
          const v = Math.round(e.v * 10) / 10, K = Math.round(0.5 * M * v * v), U = Math.round(e.U);
          st.rows.push({ h: e.h, v, K, U, W: K + U }); sideTable(api); NL.audio.play('ting');
          $('stepNo').textContent = `Ghi năng lượng · ${P.cnt(st.rows.length, 5, 'lần')}`;
          if (st.rows.length >= 5) { const hs = st.rows.map(r => r.h); if (Math.min(...hs) < 1.2 && Math.max(...hs) > 2.5) { st.paused = false; st.slow = false; api.done('Sang nhiệm vụ cắm cờ ➜'); } else NL.game.toast('Cần thêm một lần ' + (Math.min(...hs) >= 1.2 ? 'gần đáy (dưới 1,2 m)' : 'gần đỉnh (trên 2,5 m)')); }
        });
      }
    },
    {
      label: 'Nhiệm vụ', text: 'Chọn máng và độ cao thả để ván vượt đồi giữa, chạm lá cờ ở đỉnh bên phải', hint: 'Không ma sát thì ván chỉ lên được tới đúng độ cao thả',
      enter(api) {
        st.run = false; st.flag.style.display = ''; setTrack('C');
        const go = () => {
          let turns = 0;
          armTap(api, () => {
            st.onMove = () => { if (st.x >= 9.6) { st.onMove = null; st.onTurn = null; st.run = false; NL.audio.play('success'); api.say('Ván chạm cờ! 🚩 Đỉnh giữa thấp hơn chỗ thả nên ván vượt qua được'); api.done('Thử bật ma sát ➜'); } };
            st.onTurn = x => {
              const hill = TRACKS[st.tr].pts[2];
              if (st.tr === 'U') { if (++turns < 2) return; st.onTurn = null; st.onMove = null; api.wait(0.6, () => { st.run = false; api.lesson({ title: 'Máng chữ U không có đồi giữa', text: 'Ván chỉ chạy qua lại giữa hai bờ, không có đồi để vượt và không chạm được cờ.', sub: 'Hãy chọn máng có đồi ở giữa rồi chỉnh độ cao thả.', btn: '🔁 Chọn máng có đồi' }, () => { reset(); api.say('Chọn máng có đồi giữa rồi chạm ván để thử lại'); }); }); return; }
              if (x > hill[0]) return;
              st.onTurn = null; st.onMove = null;
              api.wait(0.8, () => { st.run = false; api.lesson({ title: 'Đỉnh phía trước cao hơn chỗ thả nên ván không qua được', text: `Ván leo tới ${vn(hAt(x), 2)} m thì dừng rồi trôi ngược về, vì đỉnh đồi cao ${vn(hill[1], 1)} m.`, sub: 'Bài học: không ma sát thì cơ năng không đổi. Ván chỉ lên được tới đúng độ cao thả, muốn vượt đỉnh thì phải thả cao hơn đỉnh.', btn: '🔁 Chọn máng hoặc độ cao khác' }, () => { reset(); api.say('Đổi kiểu máng hoặc độ cao thả rồi chạm ván để thử lại'); }); });
            };
          });
        };
        const re = () => { st.onMove = null; st.onTurn = null; go(); };
        controls(api, { track: re, h0: re });
        go();
      }
    },
    {
      label: 'Bật ma sát', text: 'Bật ma sát giữa bánh xe và máng rồi thả ván trên máng chữ U', hint: 'Nhìn cột Nhiệt',
      enter(api) {
        st.flag.style.display = 'none'; st.h0 = 4; setTrack('U'); st.mu = 0.06; st.onMove = null;
        api.panel('<div>Ma sát: <b>đang bật</b></div>');
        armTap(api, () => {
          st.onTurn = x => {
            if (x <= 5) return; st.onTurn = null;
            api.say(`Ván chỉ lên tới ${vn(hAt(x), 2)} m, thấp hơn 4 m. Cột Nhiệt dâng lên`);
            api.wait(1.5, () => api.ask({
              q: 'Cơ năng của ván bị hụt đi. Phần hụt đó đi đâu?',
              options: [{ t: 'Biến thành nhiệt do ma sát ở bánh xe và máng', ok: true }, { t: 'Biến mất hoàn toàn', why: 'Năng lượng không tự mất đi. Nhìn cột Nhiệt.' }, { t: 'Chuyển thành thế năng', why: 'Thế năng chỉ phụ thuộc độ cao, mà ván lên thấp hơn trước.' }],
              explain: 'Có ma sát thì cơ năng giảm dần, phần giảm đúng bằng nhiệt tỏa ra. Năng lượng toàn phần (cơ năng + nhiệt) vẫn bảo toàn.'
            }, () => { st.run = false; st.mu = 0; api.done('Xem kết quả ➜'); }));
          };
        });
      }
    },
    {
      label: 'Kết quả', text: 'Động năng, thế năng và cơ năng theo độ cao', hint: 'Đường cơ năng nằm ngang',
      enter(api) { st.run = false; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Đúng 4 m', truth: 'Không ma sát thì cơ năng bảo toàn, ván lên tới đúng độ cao thả ở bờ bên kia.',
          sub: 'Động năng và thế năng chuyển hóa qua lại, tổng của chúng (cơ năng) không đổi.',
          result: result(),
          quiz: [{
            kicker: '❓ Tốc độ', q: 'Không ma sát, ván qua đáy máng (h = 0) sau khi thả từ 4 m. Tốc độ ở đáy gần bằng?',
            options: [{ t: '8,9 m/s', ok: true }, { t: '4 m/s', why: 'Dùng ½mv² = mgh để tính v.' }, { t: '39 m/s', why: 'Nhớ lấy căn bậc hai: v = √(2gh).' }],
            explain: 'Thế năng ở đỉnh biến hết thành động năng ở đáy: mgh = ½mv², nên v = √(2gh) = √(2 × 9,8 × 4) ≈ 8,9 m/s, không phụ thuộc khối lượng.'
          }]
        });
      }
    }
  ];

  function result() {
    const W = M * G * 4, rs = st.rows;
    return {
      title: 'Bảo toàn cơ năng trên máng trượt', param: `m = ${M} kg, thả từ h₀ = 4 m, máng chữ U không ma sát, g = 9,8 m/s²`,
      table: { head: ['Lần', 'h (m)', 'v (m/s)', 'Wđ (J)', 'Wt (J)', 'W (J)'], rows: rs.map((r, k) => [k + 1, vn(r.h, 2), vn(r.v, 1), r.K, r.U, r.W]) },
      chart: { type: 'line', xLabel: 'Độ cao h (m)', yLabel: 'Năng lượng (J)', xMin: 0, xMax: 4, yMin: 0, yMax: 2200, series: [
        { name: '', color: '#3D8BD9', dash: true, points: [[0, 0], [4, W]] }, { name: '', color: '#E86A92', dash: true, points: [[0, W], [4, 0]] }, { name: '', color: '#F2C230', dash: true, points: [[0, W], [4, W]] },
        { name: 'Wt', color: '#3D8BD9', dots: true, points: rs.map(r => [r.h, r.U]) }, { name: 'Wđ', color: '#E86A92', dots: true, points: rs.map(r => [r.h, r.K]) }, { name: 'W', color: '#F2C230', dots: true, points: rs.map(r => [r.h, r.W]) }] },
      conclusion: 'Khi chỉ có trọng lực sinh công, cơ năng W = Wđ + Wt được bảo toàn: xuống thấp thì thế năng giảm, động năng tăng đúng bằng phần đó. Có ma sát thì cơ năng giảm, phần giảm biến thành nhiệt',
      note: `Cơ năng ban đầu W = mgh₀ = ${M} × 9,8 × 4 = ${Math.round(W)} J.`
    };
  }
  function auto(api) {
    const k = api.step;
    if (k === 1) {
      const e = energies(), tg = [0.4, 1.2, 2, 2.8, 3.5][st.rows.length % 5];
      if (Math.abs(e.h - tg) < 0.2) { const b = [...document.querySelectorAll('#labSide .btn')].find(x => x.offsetParent); b.click(); return 'rec'; }
      return 'watch';
    }
    if (k === 2 && !st.run && st.tr === 'C') { [...document.querySelectorAll('#labSide .seg-b')][1].click(); return 'trackB'; }
    if (k === 2) return 'watch';
    return false;
  }

  NL.lab.register('L8', { clearSide: true, auto, goal: 'Thả ván từ đỉnh dốc, nó lên được tới đâu ở bờ bên kia? Năng lượng biến đi đâu?', build, steps });
})();
