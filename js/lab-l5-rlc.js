// Thí nghiệm L5: mạch RLC nối tiếp và cộng hưởng điện. Vặn tụ xoay bắt đài radio, giản đồ vectơ, tụ bị đánh thủng khi R quá nhỏ.
(function () {
  const P = NL.phys, vn = P.vn, TAU = Math.PI * 2;
  const U = 10, UC_MAX = 400; // nguồn 10 V hiệu dụng, tụ chịu tối đa 400 V
  const ST = { 50: 'Đài Phố Cổ · 50 Hz', 80: 'Đài Sóng Xanh · 80 Hz' };
  let st, api_;
  const $ = id => document.getElementById(id);

  function build(api) {
    api_ = api;
    const L = api.svg, el = api.el;
    st = { on: false, f: 50, C: 4, R: 50, core: true, rows: [], t: 0, broken: false };
    // radio gỗ
    el('rect', { x: 30, y: 50, width: 400, height: 280, rx: 26, fill: '#8A5A3B' }, L);
    el('rect', { x: 50, y: 70, width: 360, height: 170, rx: 14, fill: 'rgba(220,240,255,.55)', stroke: '#C9A227', 'stroke-width': 3 }, L);
    // mạch bên trong: R – L – C nối tiếp
    el('path', { d: 'M80 200 L80 110 L380 110 L380 200 Z', fill: 'none', stroke: '#C9A227', 'stroke-width': 4 }, L);
    const r = api.g(L, 140, 110); el('rect', { x: -26, y: -10, width: 52, height: 20, rx: 5, fill: '#D9B988', stroke: '#6A4A2A', 'stroke-width': 2 }, r); api.text(r, 0, -16, 'R', 15, '#1F4E79', 800);
    const lg = api.g(L, 230, 110);
    for (let k = 0; k < 6; k++) el('ellipse', { cx: -25 + k * 10, cy: 0, rx: 6, ry: 14, fill: 'none', stroke: '#B87333', 'stroke-width': 4 }, lg);
    st.coreBar = el('rect', { x: -34, y: -4, width: 68, height: 8, rx: 3, fill: '#5A6672' }, lg);
    api.text(lg, 0, -22, 'L', 15, '#1F4E79', 800);
    const cg = api.g(L, 320, 110); st.capG = cg;
    st.plates = [];
    for (let k = 0; k < 5; k++) st.plates.push(el('path', { d: 'M0 0 L0 -20 A20 20 0 0 1 17 -10 Z', fill: '#C9D8E6', stroke: '#6C88A3', 'stroke-width': 1.5, transform: `translate(${-12 + k * 6},12)` }, cg));
    api.text(cg, 0, -18, 'C', 15, '#1F4E79', 800);
    api.text(L, 230, 222, 'Mạch chọn sóng RLC nối tiếp', 13, '#6C88A3', 700);
    // mặt số và loa
    el('rect', { x: 60, y: 256, width: 220, height: 56, rx: 10, fill: '#F7EEDB', stroke: '#6A4A2A', 'stroke-width': 3 }, L);
    st.needle = el('line', { x1: 0, y1: 260, x2: 0, y2: 308, stroke: '#E5534B', 'stroke-width': 3 }, L);
    for (let k = 0; k <= 10; k++) el('line', { x1: 70 + k * 20, y1: 300, x2: 70 + k * 20, y2: 308, stroke: '#6A4A2A', 'stroke-width': 1.5 }, L);
    st.dialTxt = api.text(L, 170, 285, '', 12, '#6A4A2A', 800);
    st.spk = api.g(L, 355, 284);
    el('circle', { r: 34, fill: '#3A2618' }, st.spk); for (let k = 1; k < 4; k++) el('circle', { r: k * 9, fill: 'none', stroke: '#6A4A2A', 'stroke-width': 2 }, st.spk);
    st.waves = el('g', {}, st.spk);
    for (let k = 1; k <= 3; k++) el('path', { d: `M${36 + k * 10} -${10 + k * 6} Q${44 + k * 12} 0 ${36 + k * 10} ${10 + k * 6}`, fill: 'none', stroke: '#F2C230', 'stroke-width': 3 }, st.waves);
    st.pw = api.g(L, 230, 370);
    el('rect', { x: -70, y: -22, width: 140, height: 44, rx: 22, fill: '#E5534B' }, st.pw); st.pwTxt = api.text(st.pw, 0, 7, '⏻ Bật radio', 16, '#fff', 800);
    // màn hologram: dao động kí và giản đồ vectơ
    el('rect', { x: 455, y: 50, width: 320, height: 300, rx: 16, fill: '#10202C' }, L);
    api.text(L, 615, 72, 'Dao động kí: u (vàng), i (xanh)', 12, '#9AA9B7', 700);
    st.uWave = el('path', { fill: 'none', stroke: '#F2C230', 'stroke-width': 2.5 }, L); st.iWave = el('path', { fill: 'none', stroke: '#4FE3FF', 'stroke-width': 2.5 }, L);
    el('line', { x1: 470, y1: 135, x2: 760, y2: 135, stroke: '#2C4A5E' }, L);
    api.text(L, 615, 208, 'Giản đồ vectơ', 12, '#9AA9B7', 700);
    st.ph = el('g', {}, L);
    st.info = [0, 1, 2, 3].map(k => api.text(L, 615, 382 + k * 22, '', 15, '#1F4E79', 800));
    api.loop(dt => { st.t += dt; draw(); });
  }
  const Lh = () => st.core ? 1 : 0.25; // H
  function calc() {
    const w = TAU * st.f, ZL = w * Lh(), ZC = 1 / (w * st.C * 1e-6), Z = Math.hypot(st.R, ZL - ZC), I = st.on && !st.broken ? U / Z : 0;
    return { ZL, ZC, Z, I, phi: Math.atan2(ZL - ZC, st.R), UC: I * ZC, UL: I * ZL, UR: I * st.R, Imax: U / st.R };
  }
  function arrow(g, x1, y1, x2, y2, col, lab) {
    const el = api_.el, a = Math.atan2(y2 - y1, x2 - x1), len = Math.hypot(x2 - x1, y2 - y1);
    el('line', { x1, y1, x2, y2, stroke: col, 'stroke-width': 3.5 }, g);
    if (len > 8) el('path', { d: `M${x2} ${y2} L${x2 - 10 * Math.cos(a - 0.4)} ${y2 - 10 * Math.sin(a - 0.4)} L${x2 - 10 * Math.cos(a + 0.4)} ${y2 - 10 * Math.sin(a + 0.4)} Z`, fill: col }, g);
    if (lab) api_.text(g, x2 + 14 * Math.cos(a) + 4, y2 + 14 * Math.sin(a) + 5, lab, 12, col, 800);
  }
  function draw() {
    const c = calc(), k = c.Imax ? c.I / c.Imax : 0;
    // dao động kí
    let du = '', di = ''; const A = 40, w = 2 * TAU / 290, ph = st.t * 3;
    for (let x = 0; x <= 290; x += 5) { du += (x ? ' L' : 'M') + (470 + x) + ' ' + (135 - (st.on ? A * Math.sin(w * x - ph) : 0)); di += (x ? ' L' : 'M') + (470 + x) + ' ' + (135 - A * k * Math.sin(w * x - ph - c.phi)); }
    st.uWave.setAttribute('d', du); st.iWave.setAttribute('d', di);
    // giản đồ vectơ, gốc tại (560, 285), thang theo U
    st.ph.innerHTML = '';
    if (st.on && !st.broken) {
      const s = 7, ox = 545, oy = 285, cl = v => Math.max(-62, Math.min(62, v));
      arrow(st.ph, ox, oy, ox + c.UR * s, oy, '#4FE3FF', 'U_R');
      arrow(st.ph, ox + 2, oy, ox + 2, oy - cl(c.UL * s / 4), '#E86A92', 'U_L');
      arrow(st.ph, ox - 2, oy, ox - 2, oy + cl(c.UC * s / 4), '#9B6BD6', 'U_C');
      const uy = oy - cl((c.UL - c.UC) * s / 4); arrow(st.ph, ox, oy, ox + c.UR * s, uy, '#F2C230'); api_.text(st.ph, ox + c.UR * s / 2, uy - 10 + (uy > oy ? 26 : 0), 'U', 13, '#F2C230', 800);
      api_.text(st.ph, 700, 236, '(U_L, U_C thu nhỏ ¼)', 10, '#6C88A3', 700);
    }
    st.waves.setAttribute('opacity', st.on ? k : 0);
    st.spk._extra = ` scale(${1 + 0.04 * k * Math.sin(st.t * 40)})`; api_.place(st.spk);
    st.needle.setAttribute('transform', `translate(${70 + (st.C - 1) / 29 * 200},0)`);
    st.dialTxt.textContent = `C = ${vn(st.C, 1)} μF`;
    st.plates.forEach((p, n) => p.setAttribute('transform', `translate(${-12 + n * 6},12) rotate(${(1 - (st.C - 1) / 29) * 120})`));
    st.coreBar.style.display = st.core ? '' : 'none';
    st.info[0].textContent = `${ST[st.f] || st.f + ' Hz'}   ·   R = ${vn(st.R)} Ω`;
    st.info[1].textContent = `Z_L = ${vn(c.ZL, 0)} Ω   ·   Z_C = ${vn(c.ZC, 0)} Ω`;
    st.info[2].textContent = st.on ? `I = ${vn(c.I, 3)} A   ·   U_C = ${vn(c.UC, 0)} V` : 'Radio đang tắt';
    st.info[3].textContent = st.on ? `Độ lệch pha φ = ${vn(c.phi * 180 / Math.PI, 0)}°` : '';
    if (st.on && !st.broken && c.UC > UC_MAX) burst(c);
  }
  function burst(c) {
    st.broken = true; const api = api_;
    P.spark(api, api.svg, 320, 110, 26); P.smoke(api, api.svg, 320, 100); P.alarm(api);
    setTimeout(() => api.lesson({ title: 'Điện trở quá nhỏ làm tụ bị đánh thủng lúc cộng hưởng', text: `Bụp! Điện áp trên tụ vọt lên ${vn(c.UC, 0)} V, vượt mức ${UC_MAX} V mà tụ chịu được, lớp cách điện bị đánh thủng.`, sub: 'Bài học: lúc cộng hưởng I = U/R rất lớn khi R nhỏ, và U_C = I·Z_C có thể lớn gấp nhiều lần điện áp nguồn. Luôn giữ đủ điện trở trong mạch.', btn: '🔧 Thay tụ mới, tăng R' }, () => { st.broken = false; if (st.rC) st.rC.set(50); else st.R = 50; }), 900);
  }
  function controls(api, o) {
    o = o || {};
    st.cC = api.slider({ label: 'Tụ xoay C', min: 1, max: 30, step: 0.1, value: st.C, unit: 'μF', onInput(v) { st.C = v; } });
    if (o.R) st.rC = api.slider({ label: 'Điện trở R', min: 1, max: 100, step: 1, value: st.R, unit: 'Ω', onInput(v, c) { st.R = v; c.warn(v < 10 ? '⚠ R nhỏ: lúc cộng hưởng điện áp trên tụ rất lớn' : ''); } });
    if (o.core) api.choices({ label: 'Lõi sắt trong cuộn dây', items: [{ t: 'Có lõi (L = 1 H)', v: true }, { t: 'Rút lõi (L = 0,25 H)', v: false }], value: st.core, onPick(v) { st.core = v; o.core(v); } });
  }
  function sideTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['f (Hz)', 'C (μF)', 'R (Ω)', 'I (A)']);
    st.tbl.set(st.rows.slice(-6).map(r => [r.f, vn(r.C, 1), r.R, vn(r.I, 3)]));
  }

  const steps = [
    {
      label: 'Bật radio', text: 'Bật radio. Máy đang bắt sóng của Đài Phố Cổ, tần số 50 Hz', hint: 'Chạm nút đỏ ⏻',
      enter(api) {
        if (!api.prediction) api.ask({ predict: true, q: 'Giữ nguyên tần số, vặn tụ xoay để tăng dần điện dung C. Cường độ dòng điện trong mạch sẽ…?', options: [{ t: 'Lớn nhất ở một giá trị C nhất định' }, { t: 'Tăng mãi theo C' }, { t: 'Không đổi' }] });
        api.setOn(st.pw, true);
        api.tapable(st.pw, () => { st.on = true; st.pwTxt.textContent = '📻 Đang phát'; NL.audio.play('hum'); api.say('Loa kêu rè rè, tiếng rất nhỏ: mạch chưa bắt đúng sóng'); api.done(); });
      }
    },
    {
      label: () => `Dò đài · ${P.cnt(st.rows.length, 6, 'điểm')}`, text: 'Vặn tụ xoay C, đọc I rồi bấm Ghi. Ghi 6 điểm, có cả hai phía của điểm I lớn nhất', hint: 'Thử C nhỏ (2–6 μF) và C lớn (15–30 μF), rồi tìm chỗ I lớn nhất',
      enter(api) {
        sideTable(api); controls(api, { R: true });
        P.recButton(api, '📌 Ghi số liệu', () => {
          const c = calc(); if (!c.I) { NL.game.toast('Radio đang tắt hoặc hỏng'); return; }
          if (st.rows.some(r => Math.abs(r.C - st.C) < 0.4 && r.f === st.f)) { NL.game.toast('Giá trị C này gần với lần trước, chọn C khác'); return; }
          st.rows.push({ f: st.f, C: st.C, R: st.R, I: Math.max(0, P.measure(c.I, 0.01, 0.001)) }); sideTable(api); NL.audio.play('ting');
          $('stepNo').textContent = `Dò đài · ${P.cnt(st.rows.length, 6, 'điểm')}`;
          const C0 = 1e6 / ((TAU * 50) ** 2 * Lh()), lo = st.rows.some(r => r.C < C0 * 0.9), hi = st.rows.some(r => r.C > C0 * 1.1);
          if (st.rows.length >= 6) { if (lo && hi) api.done('Sang nhiệm vụ bắt đài ➜'); else NL.game.toast('Cần thêm điểm ở phía ' + (lo ? 'C lớn' : 'C nhỏ') + ' của đỉnh'); }
        });
      }
    },
    {
      label: 'Nhiệm vụ', text: 'Đổi sang Đài Sóng Xanh (80 Hz). Vặn tụ xoay cho tới khi loa nghe rõ nhất', hint: 'Cộng hưởng khi Z_L = Z_C. Tần số cao hơn thì cần C nhỏ hơn',
      enter(api) {
        st.f = 80; if (st.R < 20) st.R = 50;
        controls(api);
        st.okT = 0;
        api.loop(dt => {
          const c = calc();
          if (c.I >= 0.97 * c.Imax) st.okT += dt; else st.okT = 0;
          if (st.okT > 0.8) {
            NL.audio.play('success'); api.say('Loa phát rõ Đài Sóng Xanh! 🎶 Nhìn giản đồ vectơ: U_L và U_C dài bằng nhau, ngược chiều');
            api.wait(1.2, () => api.ask({
              q: 'Lúc bắt đài rõ nhất (cộng hưởng), điều nào ĐÚNG?',
              options: [{ t: 'Z_L = Z_C, u cùng pha với i, I lớn nhất', ok: true }, { t: 'Cuộn cảm và tụ không còn điện áp', why: 'Đọc U_C trên bảng: vẫn rất lớn. U_L và U_C chỉ triệt tiêu nhau về vectơ.' }, { t: 'Dòng điện không đi qua tụ nữa', why: 'Dòng vẫn chạy qua cả R, L, C vì chúng mắc nối tiếp.' }],
              explain: 'Khi Z_L = Z_C, tổng trở nhỏ nhất Z = R nên I = U/R lớn nhất, u và i cùng pha (φ = 0). Tần số cộng hưởng f₀ = 1/(2π√(LC)).'
            }, () => api.done('Thử rút lõi sắt ➜'))); return false;
          }
        });
      }
    },
    {
      label: 'Rút lõi sắt', text: 'Rút lõi sắt ra khỏi cuộn dây. Loa thay đổi thế nào?', hint: 'Chọn "Rút lõi" ở cột phải',
      enter(api) {
        controls(api, { core: v => {
          if (v || st.askedCore) return; st.askedCore = true;
          api.wait(1.2, () => api.ask({
            q: 'Rút lõi sắt ra, loa nhỏ hẳn đi. Vì sao?',
            options: [{ t: 'L giảm nên Z_L ≠ Z_C, mạch hết cộng hưởng', ok: true }, { t: 'Lõi sắt là nơi phát ra âm thanh', why: 'Âm thanh phát ra ở loa. Lõi sắt làm thay đổi độ tự cảm L.' }, { t: 'Điện trở R tăng lên', why: 'R không đổi. Nhìn Z_L trên bảng trước và sau khi rút lõi.' }],
            explain: 'Lõi sắt làm độ tự cảm L tăng mạnh. Rút lõi ra thì L giảm, Z_L giảm, không còn bằng Z_C nên I giảm. Muốn bắt lại đài phải vặn C cho f₀ = 1/(2π√(LC)) trở về 80 Hz.'
          }, () => { st.core = true; api.goto(4); }));
        } });
      }
    },
    {
      label: 'Kết quả', text: 'Đường cong cộng hưởng: I theo C ở tần số 50 Hz', hint: 'Đỉnh đường cong là điểm cộng hưởng',
      enter(api) { st.on = false; st.pwTxt.textContent = '⏻ Đã tắt'; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Lớn nhất ở một giá trị C nhất định', truth: 'I đạt lớn nhất khi Z_L = Z_C (cộng hưởng), ở hai bên điểm đó I đều giảm.',
          sub: 'Dò đài radio chính là vặn tụ xoay để tần số cộng hưởng của mạch trùng tần số đài cần nghe.',
          result: result(),
          quiz: [{
            kicker: '❓ Điện trở', q: 'Tăng R của mạch lên, đỉnh đường cong cộng hưởng sẽ…?',
            options: [{ t: 'Thấp xuống và tù hơn', ok: true }, { t: 'Cao lên và nhọn hơn', why: 'I lớn nhất bằng U/R. R tăng thì đỉnh thế nào?' }, { t: 'Dịch sang C khác', why: 'Vị trí đỉnh chỉ phụ thuộc L, C và f, không phụ thuộc R.' }],
            explain: 'Ở cộng hưởng I_max = U/R, nên R lớn thì đỉnh thấp, đường cong tù, radio chọn đài kém hơn. Vị trí đỉnh không đổi.'
          }]
        });
      }
    }
  ];

  function result() {
    const rs = st.rows.filter(r => r.f === 50), R0 = rs.length ? rs[rs.length - 1].R : 50, th = [];
    for (let C = 1; C <= 30; C += 0.25) { const w = TAU * 50, Z = Math.hypot(R0, w - 1 / (w * C * 1e-6)); th.push([C, +(U / Z).toFixed(4)]); }
    return {
      title: 'Cộng hưởng điện trong mạch RLC', param: `Nguồn 10 V, f = 50 Hz, L = 1 H, R = ${R0} Ω, C từ 1 đến 30 μF`,
      table: { head: ['Lần', 'f (Hz)', 'C (μF)', 'R (Ω)', 'I (A)'], rows: st.rows.map((r, k) => [k + 1, r.f, vn(r.C, 1), r.R, vn(r.I, 3)]) },
      chart: { type: 'line', xLabel: 'C (μF)', yLabel: 'I (A)', xMin: 0, xMax: 30, yMin: 0, yMax: Math.max(0.25, Math.ceil(U / R0 * 12) / 10), series: [{ name: `Lí thuyết R = ${R0} Ω`, color: '#9AA9B7', dash: true, points: th }, { name: 'Em đo', color: '#E86A92', dots: true, points: rs.map(r => [r.C, r.I]) }] },
      conclusion: 'Trong mạch RLC nối tiếp, cường độ dòng điện lớn nhất khi Z_L = Z_C, tức tần số của nguồn bằng tần số riêng f₀ = 1/(2π√(LC)). Khi đó u cùng pha với i và tổng trở nhỏ nhất bằng R',
      note: 'Lúc cộng hưởng, điện áp trên tụ U_C = I·Z_C có thể lớn hơn điện áp nguồn nhiều lần.'
    };
  }
  function auto(api) {
    const k = api.step, btn = () => [...document.querySelectorAll('#labSide .btn')].find(b => b.offsetParent);
    if (k === 1) { st.cC.set([3, 6, 9, 10.1, 14, 24, 28][st.rows.length % 7]); btn().click(); return 'rec'; }
    if (k === 2) { const C0 = 1e6 / ((TAU * 80) ** 2 * Lh()); if (Math.abs(st.C - C0) > 0.05) { st.cC.set(+C0.toFixed(1)); return 'tune'; } }
    if (k === 3 && !st.askedCore) { [...document.querySelectorAll('#labSide .seg-b')][1].click(); return 'core'; }
    return false;
  }

  NL.lab.register('L5', { clearSide: true, auto, goal: 'Vặn núm dò đài radio thực chất là làm gì với mạch điện bên trong?', build, steps });
})();
