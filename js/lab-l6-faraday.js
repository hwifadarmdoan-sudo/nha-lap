// Thí nghiệm L6: cảm ứng điện từ trên bàn của Faraday. Kéo nam châm ra vào cuộn dây, điện kế số 0 ở giữa, định luật Lenz, đèn pin không cần pin.
(function () {
  const P = NL.phys, vn = P.vn;
  const CX = 300, CY = 270, HALF = 90, XMIN = 70, XMAX = 560, K = 0.0009, FULL = 1.15, Q_FULL = 1;
  let st, api_;
  const $ = id => document.getElementById(id);

  function build(api) {
    api_ = api;
    const L = api.svg, el = api.el;
    st = { x: 480, xp: 480, v: 0, I: 0, N: 200, pol: 1, rows: [], peak: null, over: 0, still: 0, drag: false, canDrag: false, q: 0, mode: 'free', move: null };
    // giá đỡ cuộn dây
    el('rect', { x: CX - 70, y: CY + 52, width: 16, height: 330 - CY - 52, fill: '#8A6A4A' }, L);
    el('rect', { x: CX + 54, y: CY + 52, width: 16, height: 330 - CY - 52, fill: '#8A6A4A' }, L);
    // dây nối cuộn dây với điện kế, hạt điện tích chạy theo chiều dòng điện
    const wire = 'M590 180 L590 205 L390 205 L390 218 L210 218 L210 22 L720 22 L720 205 L650 205 L650 180';
    el('path', { d: wire, fill: 'none', stroke: '#B87333', 'stroke-width': 4, 'stroke-linejoin': 'round' }, L);
    st.flow = P.flow(api, L, wire + ' Z', 26, '#4FE3FF');
    st.coilBack = el('g', {}, L);
    // nam châm thẳng
    st.mag = api.g(L, st.x, CY);
    st.magL = el('rect', { x: -75, y: -20, width: 75, height: 40, rx: 6, fill: '#E5534B' }, st.mag);
    st.magR = el('rect', { x: 0, y: -20, width: 75, height: 40, rx: 6, fill: '#3D8BD9' }, st.mag);
    st.tL = api.text(st.mag, -40, 7, 'N', 20, '#fff', 800); st.tR = api.text(st.mag, 40, 7, 'S', 20, '#fff', 800);
    el('rect', { x: -85, y: -30, width: 170, height: 60, fill: 'transparent' }, st.mag);
    st.mag.style.cursor = 'grab';
    st.coilFront = el('g', {}, L);
    st.face = [api.text(L, CX - HALF - 22, CY + 80, '', 20, '#E5534B', 800), api.text(L, CX + HALF + 22, CY + 80, '', 20, '#E5534B', 800)];
    drawCoil();
    // điện kế số 0 ở giữa
    st.G = P.meter(api, L, 620, 120, { label: 'Điện kế G · số 0 ở giữa', sym: 'G', unit: 'mA', min: -1, max: 1, r: 58, d: 2 });
    // đèn pin và thanh nạp năng lượng (chỉ hiện ở nhiệm vụ)
    st.lamp = api.g(L, 0, 0); st.lamp.style.display = 'none';
    el('rect', { x: 120, y: 392, width: 330, height: 26, rx: 13, fill: '#E3EAF1', stroke: '#9AA9B7', 'stroke-width': 2 }, st.lamp);
    st.bar = el('rect', { x: 123, y: 395, width: 0, height: 20, rx: 10, fill: '#F2C230' }, st.lamp);
    st.barTxt = api.text(st.lamp, 285, 444, 'Năng lượng nạp: 0%', 14, '#1F4E79', 800);
    const fl = api.g(st.lamp, 520, 405);
    el('rect', { x: -30, y: -16, width: 60, height: 32, rx: 8, fill: '#4A5A6A' }, fl);
    el('path', { d: 'M30 -22 L52 -30 L52 30 L30 22 Z', fill: '#6C7A88' }, fl);
    st.beam = el('path', { d: 'M52 -26 L190 -70 L190 70 L52 26 Z', fill: '#FFE680', opacity: 0 }, fl);
    st.info = api.text(L, CX, 372, '', 15, '#1F4E79', 800);
    // kéo nam châm bằng tay
    const toX = e => { const p = api.svg.ownerSVGElement.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(api.svg.getScreenCTM().inverse()).x; };
    st.mag.addEventListener('pointerdown', e => {
      if (!st.canDrag) return; e.stopPropagation(); e.preventDefault();
      const off = st.x - toX(e); st.drag = true; st.move = null; st.mag.classList.remove('glow'); st.mag.style.cursor = 'grabbing';
      const mv = ev => { st.x = Math.max(XMIN, Math.min(XMAX, toX(ev) + off)); };
      const up = () => { st.drag = false; st.mag.style.cursor = 'grab'; window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    });
    api.loop(tick);
  }
  function drawCoil() {
    const el = api_.el, n = { 100: 8, 200: 12, 400: 18 }[st.N], gap = 2 * HALF / (n - 1);
    st.coilBack.innerHTML = ''; st.coilFront.innerHTML = '';
    for (let k = 0; k < n; k++) {
      const x = CX - HALF + k * gap;
      el('ellipse', { cx: x, cy: CY, rx: 9, ry: 52, fill: 'none', stroke: '#8A5A2B', 'stroke-width': 4 }, st.coilBack);
      el('path', { d: `M${x} ${CY - 52} A9 52 0 0 1 ${x} ${CY + 52}`, fill: 'none', stroke: '#C98A4B', 'stroke-width': 4.5 }, st.coilFront);
    }
  }
  const dBdx = d => { const u = d / 70, q = 1 + u * u; return -2 * d / 4900 / (q * q); };
  function tick(dt) {
    if (!dt) return;
    if (st.move) { const s = Math.sign(st.move.to - st.x), nx = st.x + s * st.move.v * dt; if ((st.move.to - nx) * s <= 0) { st.x = st.move.to; st.move = null; } else st.x = nx; }
    const vr = (st.x - st.xp) / dt; st.xp = st.x;
    st.v += (vr - st.v) * Math.min(1, dt / 0.06);
    const d = st.x - CX;
    st.I = st.broke ? 0 : -K * st.N * st.pol * dBdx(d) * st.v;
    api_.place(st.mag, st.x, CY);
    st.G.set(st.I, vn(st.I, 2) + ' mA');
    st.flow.speed(st.I * 320);
    // định luật Lenz: mặt cuộn dây gần nam châm hiện cực
    st.face.forEach(t => (t.textContent = ''));
    if (Math.abs(st.I) > 0.06 && Math.abs(d) > 40) {
      const near = d > 0 ? 1 : 0, facing = (d > 0) === (st.pol > 0) ? 'N' : 'S', other = facing === 'N' ? 'S' : 'N', toward = d * st.v < 0;
      st.face[near].textContent = toward ? facing : other; st.face[near].setAttribute('fill', (toward ? facing : other) === 'N' ? '#E5534B' : '#3D8BD9');
    }
    // đỉnh dòng điện kể từ lần ghi trước
    if (!st.peak || Math.abs(st.I) > Math.abs(st.peak.I)) if (Math.abs(st.I) > 0.03) st.peak = { I: st.I, v: Math.abs(st.v) / 10, dir: d * st.v < 0 ? 'vào' : 'ra' };
    // kim đập vạch
    if (Math.abs(st.I) > FULL && !st.broke) { st.over += dt; if (st.over > 0.1) slam(); } else st.over = 0;
    // đứng yên trong lòng cuộn
    if (Math.abs(d) < 70 && Math.abs(st.v) < 6) st.still += dt; else st.still = 0;
    if (st.mode === 'charge' && !st.full) {
      st.q = Math.min(Q_FULL, st.q + Math.abs(st.I) * dt);
      st.bar.setAttribute('width', 324 * st.q / Q_FULL); st.barTxt.textContent = `Năng lượng nạp: ${Math.round(st.q / Q_FULL * 100)}%`;
      st.beam.setAttribute('opacity', Math.min(0.5, Math.abs(st.I)));
    }
    st.info.textContent = `Cuộn dây ${st.N} vòng · cực hướng vào cuộn: ${(d > 0) === (st.pol > 0) ? 'N' : 'S'}`;
  }
  function slam() {
    st.broke = true; st.move = null; const api = api_;
    NL.audio.play('tick'); P.alarm(api); P.spark(api, api.svg, 620, 70, 10);
    setTimeout(() => api.lesson({ title: 'Đẩy nam châm quá nhanh làm kim điện kế đập vạch', text: 'Cạch! Kim điện kế vọt quá vạch cuối và đập vào chốt chặn. Đồng hồ thật có thể bị cong kim.', sub: 'Bài học: dòng cảm ứng tỉ lệ với tốc độ biến thiên từ thông. Đẩy càng nhanh, cuộn càng nhiều vòng thì dòng càng lớn. Đẩy chậm lại hoặc dùng cuộn ít vòng hơn.', btn: '🔁 Đẩy chậm hơn' }, () => { st.broke = false; st.over = 0; st.peak = null; }), 500);
  }
  function enableDrag(on) { st.canDrag = on; st.mag.classList.toggle('glow', on); }
  function controls(api) {
    st.cN = api.choices({ label: 'Số vòng dây', items: [{ t: '100', v: 100 }, { t: '200', v: 200 }, { t: '400', v: 400 }], value: st.N, onPick(v) { st.N = v; drawCoil(); } });
    st.cP = api.choices({ label: 'Đầu nam châm hướng vào cuộn', items: [{ t: 'Cực N', v: 1 }, { t: 'Cực S', v: -1 }], value: st.pol, onPick(v) { setPol(v); } });
    st.cN.set(st.N); st.cP.set(st.pol);
  }
  function setPol(v) { st.pol = v; const l = v > 0; st.magL.setAttribute('fill', l ? '#E5534B' : '#3D8BD9'); st.magR.setAttribute('fill', l ? '#3D8BD9' : '#E5534B'); st.tL.textContent = l ? 'N' : 'S'; st.tR.textContent = l ? 'S' : 'N'; }
  function sideTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['N', 'Cực', 'Chiều', 'v (cm/s)', 'I (mA)']);
    st.tbl.set(st.rows.slice(-6).map(r => [r.N, r.pol > 0 ? 'N' : 'S', r.dir, vn(r.v, 0), vn(r.I, 2)]));
  }

  const steps = [
    {
      label: 'Đẩy nam châm', text: 'Kéo nam châm vào trong cuộn dây rồi giữ yên ở đó. Nhìn kim điện kế', hint: 'Giữ tay trên nam châm và kéo sang trái',
      enter(api) {
        if (!api.prediction) api.ask({ predict: true, q: 'Đẩy nam châm vào trong cuộn dây rồi giữ yên ở đó. Kim điện kế sẽ…?', options: [{ t: 'Lệch rồi trở về 0' }, { t: 'Lệch và đứng yên ở vạch đó' }, { t: 'Không lệch chút nào' }] });
        enableDrag(true); st.seen = false;
        api.loop(() => {
          if (Math.abs(st.I) > 0.1 && !st.seen) { st.seen = true; api.say('Kim lệch rồi! Giờ giữ yên nam châm trong cuộn dây'); }
          if (st.seen && st.still > 1.2) {
            api.lesson({ title: 'Nam châm đứng yên thì không có dòng cảm ứng', text: 'Nam châm vẫn nằm trong cuộn dây, từ trường trong cuộn rất mạnh, nhưng kim đã về 0.', sub: 'Bài học: dòng điện chỉ sinh ra khi từ thông qua cuộn dây BIẾN THIÊN. Từ trường mạnh mà không đổi thì không có dòng.', btn: 'Đã hiểu ➜' }, () => api.done('Đo dòng cảm ứng ➜'));
            return false;
          }
        });
      }
    },
    {
      label: () => `Đo dòng · ${st.rows.length}/6 lần`, text: 'Mỗi lần đẩy vào hoặc kéo ra, bấm Ghi để lưu số chỉ lớn nhất của kim. Ghi 6 lần, đổi số vòng dây, có cả đẩy vào và kéo ra', hint: 'Thử đẩy nhanh, đẩy chậm, đổi cực nam châm',
      enter(api) {
        enableDrag(true); sideTable(api); controls(api); st.peak = null;
        P.recButton(api, '📌 Ghi lần vừa đẩy', () => {
          const p = st.peak; if (!p || Math.abs(p.I) < 0.05) { NL.game.toast('Đẩy hoặc kéo nam châm trước rồi mới ghi'); return; }
          st.rows.push({ N: st.N, pol: st.pol, dir: p.dir, v: p.v, I: P.measure(p.I, 0.02, 0.01) }); st.peak = null; sideTable(api); NL.audio.play('ting');
          $('stepNo').textContent = `Đo dòng · ${st.rows.length}/6 lần`;
          if (st.rows.length >= 6) {
            const dirs = new Set(st.rows.map(r => r.dir)), ns = new Set(st.rows.map(r => r.N));
            if (dirs.size > 1 && ns.size > 1) api.done('Sang nhiệm vụ đèn pin ➜');
            else NL.game.toast(dirs.size < 2 ? 'Cần có cả lần đẩy vào và lần kéo ra' : 'Cần đổi số vòng dây ít nhất một lần');
          }
        });
      }
    },
    {
      label: 'Nhiệm vụ', text: 'Đèn pin hết pin! Đẩy kéo nam châm để nạp đầy năng lượng cho đèn', hint: 'Phải chuyển động liên tục. Cuộn 400 vòng nạp nhanh hơn, nhưng đừng đẩy quá mạnh',
      enter(api) {
        enableDrag(true); controls(api); st.mode = 'charge'; st.q = 0; st.full = false; st.lamp.style.display = '';
        api.loop(() => {
          if (st.q < Q_FULL) return;
          st.full = true; st.mode = 'free'; st.beam.setAttribute('opacity', 0.75); NL.audio.play('success');
          api.say('Đèn pin sáng rực mà không cần pin! 🔦 Đèn đạp xe và máy phát điện chạy theo đúng cách này');
          api.wait(1.2, () => api.ask({
            q: 'Lúc đẩy nam châm vào, em thấy hơi nặng tay, như cuộn dây đẩy lại. Vì sao?',
            options: [{ t: 'Dòng cảm ứng tạo từ trường chống lại chuyển động của nam châm', ok: true }, { t: 'Cuộn dây bằng sắt nên hút nam châm', why: 'Cuộn dây bằng đồng, đồng không bị nam châm hút. Lực đẩy chỉ có khi đang có dòng điện.' }, { t: 'Không khí trong lòng cuộn dây cản lại', why: 'Không khí cản rất nhỏ. Nhìn chữ N, S hiện ở đầu cuộn dây lúc em đẩy.' }],
            explain: 'Định luật Lenz: dòng cảm ứng có chiều sao cho từ trường của nó chống lại sự biến thiên từ thông. Đẩy cực N vào thì đầu cuộn dây cũng thành cực N để đẩy ra. Công em bỏ ra để thắng lực đẩy biến thành điện năng.'
          }, () => api.done('Xem kết quả ➜'))); return false;
        });
      }
    },
    {
      label: 'Kết quả', text: 'Dòng cảm ứng lớn nhất theo tốc độ đẩy nam châm', hint: 'Mỗi số vòng dây một đường',
      enter(api) { enableDrag(false); api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Lệch rồi trở về 0', truth: 'Kim chỉ lệch khi nam châm đang chuyển động. Nam châm đứng yên trong cuộn thì từ thông không đổi, kim về 0.',
          sub: 'Dòng điện cảm ứng chỉ xuất hiện khi từ thông qua mạch kín biến thiên.',
          result: result(),
          quiz: [{
            kicker: '❓ Đổi chiều', q: 'Đẩy cực N vào cuộn dây thì kim lệch sang phải. Kéo cực N ra thì kim sẽ…?',
            options: [{ t: 'Lệch sang trái', ok: true }, { t: 'Lệch sang phải', why: 'Từ thông đang giảm chứ không tăng nữa. Xem lại bảng số liệu cột Chiều.' }, { t: 'Đứng yên ở 0', why: 'Nam châm vẫn chuyển động nên từ thông vẫn biến thiên.' }],
            explain: 'Đẩy vào thì từ thông tăng, kéo ra thì từ thông giảm, nên dòng cảm ứng đổi chiều. Đổi cực nam châm cũng làm dòng đổi chiều.'
          }]
        });
      }
    }
  ];

  function result() {
    const cols = { 100: '#9B6BD6', 200: '#3D8BD9', 400: '#E86A92' }, k = K * 0.00919 * 10, series = [];
    [100, 200, 400].forEach(N => {
      const pts = st.rows.filter(r => r.N === N).map(r => [r.v, Math.abs(r.I)]);
      series.push({ name: '', color: cols[N], dash: true, points: [[0, 0], [Math.min(80, 1.2 / (k * N)), Math.min(1.2, 80 * k * N)]] });
      if (pts.length) series.push({ name: `${N} vòng`, color: cols[N], dots: true, points: pts });
    });
    return {
      title: 'Cảm ứng điện từ: dòng cảm ứng theo tốc độ và số vòng dây', param: 'Nam châm thẳng, cuộn dây 100, 200, 400 vòng nối điện kế số 0 ở giữa',
      table: { head: ['Lần', 'N (vòng)', 'Cực', 'Chiều', 'v (cm/s)', 'I (mA)'], rows: st.rows.map((r, i) => [i + 1, r.N, r.pol > 0 ? 'N' : 'S', r.dir, vn(r.v, 0), vn(r.I, 2)]) },
      chart: { type: 'line', xLabel: 'Tốc độ đẩy v (cm/s)', yLabel: '|I| lớn nhất (mA)', xMin: 0, xMax: 80, yMin: 0, yMax: 1.2, marks: [{ y: 1, label: 'Kim chạm vạch cuối' }], series },
      conclusion: 'Dòng điện cảm ứng chỉ xuất hiện khi từ thông qua cuộn dây biến thiên. Đẩy nam châm càng nhanh và cuộn dây càng nhiều vòng thì dòng cảm ứng càng lớn. Đẩy vào và kéo ra cho dòng ngược chiều nhau',
      note: 'Suất điện động cảm ứng e = −N·ΔΦ/Δt (định luật Faraday), dấu trừ thể hiện định luật Lenz.'
    };
  }
  function auto(api) {
    const k = api.step;
    if (st.move || st.broke) return st.move ? 'move' : false;
    if (k === 0) { if (st.x > CX + 5) { st.move = { to: CX, v: 220 }; return 'push'; } return false; }
    if (k === 1) {
      const n = st.rows.length;
      if (!st.peak) { st.N = [100, 200, 200, 400, 100, 200][n % 6]; drawCoil(); st.move = { to: st.x > CX + 100 ? CX : XMAX, v: [260, 200, 380, 180, 420, 300][n % 6] }; return 'push'; }
      const b = [...document.querySelectorAll('#labSide .btn')].find(x => x.offsetParent); if (b) { b.click(); return 'rec'; }
    }
    if (k === 2 && !st.full) { st.N = 400; drawCoil(); st.move = { to: st.x > CX + 100 ? CX : XMAX, v: 260 }; return 'shake'; }
    return false;
  }

  NL.lab.register('L6', { clearSide: true, auto, goal: 'Làm sao sinh ra dòng điện chỉ bằng một nam châm và một cuộn dây, không cần pin?', build, steps });
})();
