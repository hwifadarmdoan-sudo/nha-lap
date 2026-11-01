// Thí nghiệm L7: giao thoa ánh sáng khe Young trong phòng tối. Đeo kính bảo hộ, đo khoảng vân qua nhiều vân, che một khe, tìm bước sóng laser bí ẩn.
(function () {
  const P = NL.phys, vn = P.vn;
  const LASERS = [{ t: 'Đỏ 650 nm', v: 650, c: '#FF3B30' }, { t: 'Lục 532 nm', v: 532, c: '#34C759' }, { t: 'Lam 450 nm', v: 450, c: '#4A7BFF' }];
  const MYST = [480, 580, 680];
  const SX0 = 60, SX1 = 760, SC = 410, PXMM = 20, SY = 382, SH = 74, B = 0.04; // dải phóng to: 20 px = 1 mm
  let st, api_;
  const $ = id => document.getElementById(id);

  function build(api) {
    api_ = api;
    const L = api.svg, el = api.el;
    st = { on: false, gog: false, lam: 650, col: '#FF3B30', a: 0.5, D: 1.2, block: false, rows: [], A: null, myst: null, few: false };
    el('rect', { x: 20, y: 52, width: 760, height: 490, rx: 18, fill: '#0F1A24' }, L);
    // nhìn ngang: laser, tấm hai khe, màn
    st.las = api.g(L, 90, 200);
    el('rect', { x: -50, y: -20, width: 100, height: 40, rx: 8, fill: '#4A5A6A' }, st.las);
    el('rect', { x: 50, y: -7, width: 14, height: 14, fill: '#2A3642' }, st.las);
    st.pw = api.g(L, 90, 262); st.pw.id = 'l7laser';
    el('rect', { x: -48, y: -17, width: 96, height: 34, rx: 17, fill: '#E5534B' }, st.pw); st.pwT = api.text(st.pw, 0, 6, '⏻ Bật laser', 14, '#fff', 800);
    st.gogG = api.g(L, 90, 120);
    el('path', { d: 'M-40 0 Q-40 -16 -20 -16 L20 -16 Q40 -16 40 0 Q40 14 22 14 Q8 14 0 4 Q-8 14 -22 14 Q-40 14 -40 0 Z', fill: '#7CC4FF', stroke: '#1F4E79', 'stroke-width': 3, opacity: .9 }, st.gogG);
    api.text(st.gogG, 0, 34, 'Kính bảo hộ', 12, '#9AA9B7', 700);
    st.beam = el('line', { x1: 154, y1: 200, x2: 240, y2: 200, stroke: '#FF3B30', 'stroke-width': 4, opacity: 0 }, L);
    st.fan = el('path', { d: '', fill: '#FF3B30', opacity: 0 }, L);
    el('rect', { x: 236, y: 110, width: 8, height: 180, fill: '#9AA9B7' }, L);
    st.slit = [el('rect', { x: 236, y: 190, width: 8, height: 6, fill: '#0F1A24' }, L), el('rect', { x: 236, y: 204, width: 8, height: 6, fill: '#0F1A24' }, L)];
    st.cover = el('rect', { x: 232, y: 202, width: 16, height: 12, rx: 3, fill: '#E5A23B', style: 'display:none' }, L);
    api.text(L, 240, 100, 'Hai khe S₁ S₂', 12, '#9AA9B7', 700);
    st.scr = api.g(L, 600, 200);
    el('rect', { x: -6, y: -110, width: 12, height: 220, fill: '#E8EEF4' }, st.scr);
    st.scrPat = el('g', {}, st.scr);
    st.dTxt = api.text(L, 420, 318, '', 13, '#9AA9B7', 700);
    st.dLine = el('line', { x1: 240, y1: 304, x2: 600, y2: 304, stroke: '#6C88A3', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, L);
    // dải màn phóng to + thước
    api.text(L, SC, SY - 36, 'Màn quan sát phóng to (chạm hai vân sáng để đo)', 13, '#9AA9B7', 700);
    el('rect', { x: SX0, y: SY, width: SX1 - SX0, height: SH, fill: '#05090D' }, L);
    st.pat = el('g', {}, L);
    for (let x = SX0; x < SX1; x += 2) el('rect', { x, y: SY, width: 2, height: SH, fill: '#000', opacity: 0 }, st.pat);
    for (let m = 0; m <= 35; m++) { const x = SX0 + m * PXMM; el('line', { x1: x, y1: SY + SH, x2: x, y2: SY + SH + (m % 5 ? 6 : 12), stroke: '#C9D8E6', 'stroke-width': m % 5 ? 1 : 2 }, L); if (m % 5 === 0) api.text(L, x, SY + SH + 26, String(m), 11, '#C9D8E6', 700); }
    api.text(L, SX1 - 4, SY + SH + 42, 'mm', 11, '#9AA9B7', 700);
    st.mk = el('g', {}, L);
    st.read = api.text(L, SC, 528, '', 14, '#F2C230', 800);
    const hit = el('rect', { x: SX0, y: SY - 8, width: SX1 - SX0, height: SH + 16, fill: 'transparent' }, L);
    const toX = e => { const p = api.svg.ownerSVGElement.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(api.svg.getScreenCTM().inverse()).x; };
    hit.addEventListener('pointerdown', e => { if (!st.meas) return; e.stopPropagation(); pickX(toX(e)); });
    st.key = ''; api.loop(draw);
  }
  const ipx = () => st.lam * st.D / st.a * 1e-3 * PXMM; // khoảng vân (px)
  function inten(x) {
    const y = (x - SC) / PXMM, lD = st.lam * 1e-6 * st.D * 1e3; // mm
    const u = Math.PI * B * y / lD, env = u ? (Math.sin(u) / u) ** 2 : 1;
    return st.block ? env * 0.5 : env * Math.cos(Math.PI * st.a * y / lD) ** 2;
  }
  function draw() {
    const xs = 240 + st.D * 220, col = st.myst ? '#F4F4F4' : st.col;
    api_.place(st.scr, xs, 200);
    st.dLine.setAttribute('x2', xs); st.dTxt.textContent = `D = ${vn(st.D, 2)} m · a = ${vn(st.a, 2)} mm`;
    st.beam.setAttribute('stroke', col); st.beam.setAttribute('opacity', st.on ? 0.95 : 0);
    st.fan.setAttribute('d', `M244 ${st.block ? 193 : 200} L${xs - 6} 92 L${xs - 6} 308 Z`); st.fan.setAttribute('fill', col); st.fan.setAttribute('opacity', st.on ? 0.12 : 0);
    st.cover.style.display = st.block ? '' : 'none';
    const key = [st.on, st.lam, st.a, st.D, st.block, col].join();
    if (key === st.key) return; st.key = key;
    const rs = st.pat.children;
    for (let k = 0; k < rs.length; k++) { const x = SX0 + k * 2 + 1; rs[k].setAttribute('fill', col); rs[k].setAttribute('opacity', st.on ? Math.min(1, inten(x) * 1.05) : 0); }
    // vân trên màn nhìn ngang (thu nhỏ 1/4)
    st.scrPat.innerHTML = '';
    if (st.on) for (let y = -108; y < 108; y += 2) api_.el('rect', { x: -6, y, width: 12, height: 2, fill: col, opacity: inten(SC + y * 4) }, st.scrPat);
    clearMarks();
  }
  function clearMarks() { st.A = null; st.mk.innerHTML = ''; st.read.textContent = ''; }
  function mark(x, lab) {
    const el = api_.el;
    el('path', { d: `M${x} ${SY - 2} L${x - 7} ${SY - 14} L${x + 7} ${SY - 14} Z`, fill: '#F2C230' }, st.mk);
    el('line', { x1: x, y1: SY, x2: x, y2: SY + SH, stroke: '#F2C230', 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, st.mk);
    api_.text(st.mk, x, SY - 18, lab, 12, '#F2C230', 800);
  }
  function pickX(x) {
    const i = ipx(), k = Math.round((x - SC) / i), xx = SC + k * i;
    if (st.block) { NL.game.toast('Đang che một khe, không có vân để đo'); return; }
    if (xx < SX0 || xx > SX1 || inten(xx) < 0.08) { NL.game.toast('Vân này quá mờ, chọn vân sáng rõ hơn'); return; }
    pick(k);
  }
  function pick(k) {
    const xx = SC + k * ipx();
    NL.audio.play('tick');
    if (st.A === null) { st.mk.innerHTML = ''; st.A = k; mark(xx, 'A'); st.read.textContent = 'Chạm vân sáng thứ hai'; return; }
    const n = Math.abs(k - st.A); if (!n) return;
    mark(xx, 'B');
    if (n < 5) {
      const a = st.A; st.A = null;
      if (!st.few) {
        st.few = true;
        api_.lesson({ title: 'Đo qua ít vân thì sai số lớn', text: `Em đo qua ${n} khoảng vân. Khoảng vân chỉ cỡ ${vn(ipx() / PXMM, 2)} mm, thước chia 1 mm nên sai một chút là lệch rất nhiều.`, sub: 'Bài học: đo khoảng cách qua nhiều vân (ví dụ 11 vân sáng là 10 khoảng vân) rồi chia ra. Sai số của thước được chia nhỏ theo.', btn: '📏 Đo qua nhiều vân hơn' }, () => clearMarks());
      } else { NL.game.toast('Chọn hai vân cách nhau ít nhất 5 khoảng vân'); setTimeout(clearMarks, 600); }
      return a;
    }
    const iT = st.lam * st.D / st.a * 1e-3, Lm = Math.round(n * iT * (1 + P.gauss() * 0.008) / 0.05) * 0.05, iM = Lm / n;
    st.read.textContent = `L = ${vn(Lm, 2)} mm qua ${n} khoảng vân → i = L/${n} = ${vn(iM, 3)} mm`;
    st.A = null;
    st.onMeasure && st.onMeasure({ lam: st.myst || st.lam, a: st.a, D: st.D, n, L: Lm, i: iM, th: iT, myst: !!st.myst });
  }
  function controls(api, o) {
    o = o || {};
    if (!o.noColor) st.cL = api.choices({ label: 'Màu laser', items: LASERS.map(l => ({ t: l.t, v: l.v })), value: st.lam, onPick(v) { st.lam = v; st.col = LASERS.find(l => l.v === v).c; } });
    st.cA = api.slider({ label: 'Khoảng cách hai khe a', min: 0.3, max: 1, step: 0.05, value: st.a, unit: 'mm', onInput(v) { st.a = v; } });
    st.cD = api.slider({ label: 'Khoảng cách tới màn D', min: 0.8, max: 2, step: 0.05, value: st.D, unit: 'm', onInput(v) { st.D = v; } });
    if (!o.noColor) st.cL.set(st.lam);
  }
  function sideTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['λ (nm)', 'a (mm)', 'D (m)', 'i (mm)']);
    st.tbl.set(st.rows.slice(-5).map(r => [r.myst ? '?' : r.lam, vn(r.a, 2), vn(r.D, 2), vn(r.i, 3)]));
  }

  const steps = [
    {
      label: 'Chuẩn bị', text: 'Phòng tối có tia laser. Chuẩn bị an toàn rồi bật laser', hint: 'Chạm vào kính bảo hộ trước',
      enter(api) {
        if (!api.prediction) api.ask({ predict: true, q: 'Giữ nguyên màu laser và khoảng cách tới màn, tăng khoảng cách hai khe a. Khoảng vân i sẽ…?', options: [{ t: 'Giảm' }, { t: 'Tăng' }, { t: 'Không đổi' }] });
        const ready = () => { if (st.gog && st.on) api.done('Bắt đầu đo ➜'); };
        api.setOn(st.gogG, true);
        api.tapable(st.gogG, () => { st.gog = true; st.gogG.style.opacity = 0.3; api.say('Đã đeo kính bảo hộ 🥽'); if (!st.on) { api.setOn(st.pw, true); } ready(); });
        api.setOn(st.pw, true);
        api.tapable(st.pw, () => {
          if (!st.gog) {
            P.alarm(api); api.setOn(st.pw, false);
            api.lesson({ title: 'Bật laser khi chưa đeo kính bảo hộ', text: 'Tia laser hội tụ năng lượng vào một điểm rất nhỏ. Nếu lỡ chiếu vào mắt hoặc phản xạ từ mặt kim loại vào mắt, võng mạc có thể bị tổn thương vĩnh viễn.', sub: 'Bài học: đeo kính bảo hộ trước khi bật laser, không bao giờ nhìn thẳng vào tia laser hay chiếu vào mắt người khác.', btn: '🥽 Đeo kính trước' }, () => {});
            return;
          }
          st.on = true; st.pwT.textContent = '● Đang chiếu'; NL.audio.play('hum'); api.say('Trên màn hiện ra các vạch sáng tối xen kẽ: vân giao thoa'); ready();
        });
      }
    },
    {
      label: () => `Đo khoảng vân · ${st.rows.length}/4 lần`, text: 'Chọn màu, a và D. Chạm hai vân sáng cách xa nhau trên màn phóng to để đo khoảng vân i. Đo 4 lần với cách đặt khác nhau', hint: 'Chọn hai vân cách nhau nhiều khoảng vân thì đo chính xác hơn',
      enter(api) {
        sideTable(api); controls(api); st.meas = true;
        st.onMeasure = r => {
          if (st.rows.some(q => q.lam === r.lam && q.a === r.a && q.D === r.D)) { NL.game.toast('Cách đặt này đã đo rồi, đổi màu, a hoặc D'); return; }
          st.rows.push(r); sideTable(api); NL.audio.play('ting');
          $('stepNo').textContent = `Đo khoảng vân · ${st.rows.length}/4 lần`;
          if (st.rows.length >= 4) api.done('Thử che một khe ➜');
        };
      }
    },
    {
      label: 'Che một khe', text: 'Dán băng dính che khe S₂ lại. Vân trên màn thay đổi thế nào?', hint: 'Chọn "Che khe S₂" ở cột phải',
      enter(api) {
        st.meas = false; st.onMeasure = null;
        api.choices({ label: 'Hai khe', items: [{ t: 'Mở cả hai', v: false }, { t: 'Che khe S₂', v: true }], value: false, onPick(v) {
          st.block = v; if (!v || st.askedBlock) return; st.askedBlock = true;
          api.wait(1.2, () => api.ask({
            q: 'Che một khe, các vạch tối biến mất, chỉ còn một vệt sáng mờ trải rộng. Vì sao?',
            options: [{ t: 'Phải có hai sóng kết hợp gặp nhau mới giao thoa được', ok: true }, { t: 'Laser yếu đi một nửa nên không đủ sáng tạo vân', why: 'Vệt sáng vẫn rõ. Vấn đề là chỉ còn một nguồn sóng.' }, { t: 'Băng dính làm đổi màu ánh sáng', why: 'Ánh sáng qua khe còn lại vẫn cùng màu. Cái thiếu là nguồn thứ hai.' }],
            explain: 'Vân sáng tối là chỗ sóng từ S₁ và S₂ tăng cường hoặc triệt tiêu nhau. Che một khe thì chỉ còn một sóng, không còn giao thoa. Đây là bằng chứng ánh sáng có tính chất sóng.'
          }, () => { st.block = false; api.done('Sang laser bí ẩn ➜'); }));
        } });
      }
    },
    {
      label: 'Nhiệm vụ', text: 'Laser bí ẩn đã được phủ kính mờ, chỉ thấy vân trắng. Đo khoảng vân rồi tìm bước sóng λ = a·i/D', hint: 'Đo i qua nhiều vân. Đổi i ra mét hoặc giữ mm cho a và i, D tính bằng m',
      enter(api) {
        st.myst = MYST[Math.floor(Math.random() * 3)]; st.lam = st.myst; st.a = 0.5; st.D = 1.5; st.key = '';
        controls(api, { noColor: true }); st.meas = true;
        st.onMeasure = r => {
          if (r.n < 5) return;
          st.rows.push(r); sideTable(api); st.meas = false;
          api.wait(1, () => api.ask({
            q: `Em đo được i = ${vn(r.i, 3)} mm với a = ${vn(r.a, 2)} mm, D = ${vn(r.D, 2)} m. Bước sóng của laser bí ẩn là?`,
            options: MYST.map(m => ({ t: `${m} nm`, ok: m === st.myst, why: `Tính λ = a·i/D = ${vn(r.a, 2)} × ${vn(r.i, 3)} / ${vn(r.D, 2)} (đơn vị mm·mm/m = μm).` })),
            explain: `λ = a·i/D = ${vn(r.a, 2)} mm × ${vn(r.i, 3)} mm / ${vn(r.D, 2)} m ≈ ${vn(r.a * r.i / r.D, 3)} μm = ${st.myst} nm. Laser này màu ${st.myst < 500 ? 'lam' : st.myst < 600 ? 'vàng' : 'đỏ'}.`
          }, () => { st.myst = null; st.lam = 650; st.col = '#FF3B30'; api.done('Xem kết quả ➜'); }));
        };
      }
    },
    {
      label: 'Kết quả', text: 'Khoảng vân đo được so với giá trị λD/a', hint: 'Các điểm nằm trên đường i = λD/a',
      enter(api) { st.meas = false; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Giảm', truth: 'Khoảng vân i = λD/a tỉ lệ nghịch với a: hai khe càng xa nhau, vân càng sít lại.',
          sub: 'Đo khoảng vân là cách đo bước sóng ánh sáng, một đại lượng chỉ cỡ phần nghìn milimét.',
          result: result(),
          quiz: [{
            kicker: '❓ Màu sắc', q: 'Giữ nguyên a và D, đổi laser đỏ sang laser lam. Vân sẽ…?',
            options: [{ t: 'Sít lại gần nhau hơn', ok: true }, { t: 'Giãn xa nhau hơn', why: 'Ánh sáng lam có bước sóng ngắn hơn ánh sáng đỏ.' }, { t: 'Không đổi', why: 'i = λD/a phụ thuộc bước sóng.' }],
            explain: 'λ lam ≈ 450 nm nhỏ hơn λ đỏ ≈ 650 nm, nên khoảng vân i = λD/a nhỏ hơn, vân sít lại.'
          }]
        });
      }
    }
  ];

  function result() {
    const rs = st.rows, mx = Math.ceil(Math.max(2, ...rs.map(r => r.th)) * 1.15 * 2) / 2;
    return {
      title: 'Giao thoa khe Young: đo khoảng vân', param: 'Laser đỏ 650 nm, lục 532 nm, lam 450 nm; a từ 0,3 đến 1 mm; D từ 0,8 đến 2 m',
      table: { head: ['Lần', 'λ (nm)', 'a (mm)', 'D (m)', 'Số khoảng vân', 'L (mm)', 'i (mm)'], rows: rs.map((r, k) => [k + 1, r.lam, vn(r.a, 2), vn(r.D, 2), r.n, vn(r.L, 2), vn(r.i, 3)]) },
      chart: { type: 'line', xLabel: 'λD/a (mm)', yLabel: 'i đo được (mm)', xMin: 0, xMax: mx, yMin: 0, yMax: mx, series: [{ name: '', color: '#9AA9B7', dash: true, points: [[0, 0], [mx, mx]] }, { name: 'Em đo', color: '#E86A92', dots: true, points: rs.map(r => [r.th, r.i]) }] },
      conclusion: 'Khoảng vân i = λD/a: tỉ lệ thuận với bước sóng λ và khoảng cách tới màn D, tỉ lệ nghịch với khoảng cách hai khe a. Che một khe thì mất vân giao thoa, chứng tỏ ánh sáng có tính chất sóng',
      note: 'Đo L qua n khoảng vân rồi lấy i = L/n giúp giảm sai số của thước.'
    };
  }
  function auto(api) {
    const k = api.step;
    if (k === 1) {
      const set = [[650, 0.5, 1.2], [650, 0.8, 1.2], [532, 0.5, 1.6], [450, 0.4, 2]][st.rows.length % 4];
      if (st.lam !== set[0] || st.a !== set[1] || st.D !== set[2]) { st.cL.set(set[0]); st.cA.set(set[1]); st.cD.set(set[2]); return 'set'; }
      pick(-3); pick(3); return 'meas';
    }
    if (k === 2 && !st.askedBlock) { [...document.querySelectorAll('#labSide .seg-b')][1].click(); return 'block'; }
    if (k === 3 && st.meas) { pick(-3); pick(3); return 'meas'; }
    return false;
  }

  NL.lab.register('L7', { clearSide: true, auto, goal: 'Làm sao đo được bước sóng ánh sáng, nhỏ hơn một phần nghìn milimét, bằng một cây thước kẻ?', build, steps });
})();
