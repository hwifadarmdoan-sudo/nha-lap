// Thí nghiệm 2I: quan sát nguyên phân ở đỉnh rễ hành qua kính hiển vi ảo, nhận diện các kỳ.
(function () {
  const PH = ['Kỳ trung gian', 'Kỳ đầu', 'Kỳ giữa', 'Kỳ sau', 'Kỳ cuối'];
  const P_ODDS = [0.72, 0.1, 0.05, 0.05, 0.08];
  const HINT = [
    'Nhân còn nguyên, có hạch nhân, chưa thấy NST rõ: đó là Kỳ trung gian.',
    'NST bắt đầu co xoắn thành sợi, màng nhân mờ dần: đặc điểm của Kỳ đầu.',
    'Các NST co xoắn cực đại, xếp thành 1 hàng ở mặt phẳng xích đạo: đặc điểm của Kỳ giữa!',
    'Hai nhóm NST đang tách nhau đi về hai cực tế bào: đặc điểm của Kỳ sau.',
    'Hai nhân mới hình thành ở hai đầu, giữa tế bào xuất hiện vách ngăn: đặc điểm của Kỳ cuối.'
  ];
  const CW = 22, CH = 16, COLS = 30, ROWS = 20; // bản đồ tiêu bản
  const FX = 500, FY = 255, FR = 175;           // vi trường hình tròn
  const NST = '#5B2A86';
  let st;

  function pickPhase() { let r = Math.random(), k = 0; while (r > P_ODDS[k]) { r -= P_ODDS[k]; k++; } return k; }

  function drawCell(api, g, c) {
    const el = api.el, x = c.x, y = c.y, w = CW - 1.5, h = CH - 1.5, cx = x + w / 2, cy = y + h / 2;
    el('rect', { x, y, width: w, height: h, rx: 2, fill: '#F6DDE8', stroke: '#C79AB5', 'stroke-width': 0.9 }, g);
    const line = (x1, y1, x2, y2, sw) => el('line', { x1, y1, x2, y2, stroke: NST, 'stroke-width': sw || 1.1, 'stroke-linecap': 'round' }, g);
    const j = c.j; // biến thể ngẫu nhiên
    if (c.p === 0) {
      el('ellipse', { cx: cx + j * 1.5, cy, rx: 4.2 + j, ry: 3.6, fill: '#E3B8D4', stroke: NST, 'stroke-width': 0.6 }, g);
      el('circle', { cx: cx + j * 1.5 + 0.8, cy: cy - 0.5, r: 1.2, fill: NST }, g);
    } else if (c.p === 1) {
      el('ellipse', { cx, cy, rx: 5, ry: 4.2, fill: '#EBC6DD', stroke: NST, 'stroke-width': 0.35, 'stroke-dasharray': '1 1' }, g);
      for (let k = 0; k < 5; k++) {
        const a = k * 1.3 + j, r = 2.5;
        el('path', { d: `M${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} q${Math.cos(a + 1) * 2} ${Math.sin(a + 1) * 2} ${Math.cos(a + 2) * 3} ${Math.sin(a + 2) * 1.5}`, stroke: NST, 'stroke-width': 1.1, fill: 'none', 'stroke-linecap': 'round' }, g);
      }
    } else if (c.p === 2) {
      for (let k = -2; k <= 2; k++) line(cx - 1.6, cy + k * 1.9, cx + 1.6, cy + k * 1.9 + j * 0.4, 1.3);
      el('path', { d: `M${x + 2} ${cy} Q${cx} ${y + 1} ${x + w - 2} ${cy} Q${cx} ${y + h - 1} ${x + 2} ${cy}`, stroke: '#B48AC8', 'stroke-width': 0.4, fill: 'none' }, g);
    } else if (c.p === 3) {
      const d = 3.5 + Math.abs(j) * 2;
      [-1, 1].forEach(s => { for (let k = -2; k <= 2; k++) el('path', { d: `M${cx + s * (d + 1.5)} ${cy + k * 1.6} l${-s * 1.6} -0.7 M${cx + s * (d + 1.5)} ${cy + k * 1.6} l${-s * 1.6} 0.7`, stroke: NST, 'stroke-width': 1, fill: 'none' }, g); });
    } else {
      [-1, 1].forEach(s => el('ellipse', { cx: cx + s * 5.5, cy, rx: 2.8, ry: 3.3, fill: '#D9A6C8', stroke: NST, 'stroke-width': 0.8 }, g));
      line(cx, y + 2, cx, y + h - 2, 0.6 + Math.abs(j) * 0.6).setAttribute('stroke', '#A07A92');
    }
  }

  function build(api) {
    const L = api.svg, el = api.el;
    st = { mag: 10, coarse: 20, fine: 0, z0: 55 + Math.random() * 20, ids: [], found: new Set(), offX: -COLS * CW / 2, offY: -ROWS * CH / 2, warned: false, sel: null };
    // kính hiển vi
    const m = api.g(L, 160, 0);
    el('path', { d: 'M-70 452 L70 452 L60 430 L-60 430 Z', fill: '#2F3E4E' }, m);
    el('path', { d: 'M30 430 L30 250 Q30 200 -10 180', stroke: '#2F3E4E', 'stroke-width': 26, fill: 'none', 'stroke-linecap': 'round' }, m);
    el('rect', { x: -70, y: 330, width: 110, height: 12, rx: 4, fill: '#4A5A6A' }, m);
    el('rect', { x: -30, y: 120, width: 26, height: 90, rx: 6, fill: '#4A5A6A', transform: 'rotate(-15 -17 165)' }, m);
    st.objLbl = api.text(m, -12, 300, '10×', 14, '#fff', 800);
    el('rect', { x: -26, y: 230, width: 26, height: 60, rx: 6, fill: '#5A6A7A' }, m);
    el('circle', { cx: 46, cy: 370, r: 16, fill: '#6B7B8B', stroke: '#2F3E4E', 'stroke-width': 3 }, m);
    el('circle', { cx: 46, cy: 370, r: 7, fill: '#8A9AAA' }, m);
    st.stageSlide = el('rect', { x: -52, y: 324, width: 76, height: 8, rx: 2, fill: 'rgba(200,230,255,.9)', stroke: '#8FBBD8', opacity: 0 }, m);
    api.text(L, 160, 478, 'Kính hiển vi', 14, '#6C88A3', 700);
    st.slide = api.g(L, 160, 520);
    el('rect', { x: -40, y: -8, width: 80, height: 16, rx: 3, fill: 'rgba(200,230,255,.9)', stroke: '#8FBBD8', 'stroke-width': 2 }, st.slide);
    el('circle', { cx: 0, cy: 0, r: 4, fill: '#C88AB0' }, st.slide);
    api.text(st.slide, 0, 26, 'Tiêu bản rễ hành', 12, '#6C88A3', 700);
    // vi trường
    const defs = el('defs', {}, L);
    const cp = el('clipPath', { id: 'fovClip' }, defs); el('circle', { cx: FX, cy: FY, r: FR }, cp);
    st.blurF = el('feGaussianBlur', { stdDeviation: 6 }, el('filter', { id: 'fovBlur', x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs));
    el('circle', { cx: FX, cy: FY, r: FR + 12, fill: '#1E2A36' }, L);
    st.fov = el('g', { 'clip-path': 'url(#fovClip)' }, L);
    st.fovBg = el('circle', { cx: FX, cy: FY, r: FR, fill: '#FBF3F7' }, st.fov);
    st.mapWrap = el('g', { filter: 'url(#fovBlur)', opacity: 0 }, st.fov);
    st.map = el('g', {}, st.mapWrap);
    st.cells = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const cell = { id: st.cells.length + 1, x: c * CW + (r % 2) * 5, y: r * CH, p: pickPhase(), j: Math.random() * 2 - 1 };
      st.cells.push(cell); drawCell(api, st.map, cell);
    }
    st.selRing = el('rect', { width: CW, height: CH, rx: 3, fill: 'none', stroke: '#F2C94C', 'stroke-width': 1.6, opacity: 0 }, st.map);
    st.dark = el('circle', { cx: FX, cy: FY, r: FR, fill: '#111', opacity: .85 }, st.fov);
    el('circle', { cx: FX, cy: FY, r: FR, fill: 'none', stroke: '#33475B', 'stroke-width': 6 }, L);
    st.magTxt = api.text(L, FX, FY + FR + 36, 'Vật kính 10×', 15, '#6C88A3', 800);
    // kéo để di chuyển tiêu bản, chạm để chọn tế bào
    const hit = el('circle', { cx: FX, cy: FY, r: FR, fill: 'transparent' }, L);
    hit.style.cursor = 'grab';
    hit.addEventListener('pointerdown', e => {
      if (!st.ready) return;
      e.stopPropagation(); hit.setPointerCapture(e.pointerId);
      const s = svgPt(e), o = { x: st.offX, y: st.offY }; let moved = false;
      const mv = ev => { const q = svgPt(ev), sc = scale(); if (Math.hypot(q.x - s.x, q.y - s.y) > 6) moved = true; st.offX = o.x + (q.x - s.x) / sc; st.offY = o.y + (q.y - s.y) / sc; clampOff(); placeMap(); };
      const up = ev => { hit.removeEventListener('pointermove', mv); hit.removeEventListener('pointerup', up); if (!moved && st.onPick) { const q = svgPt(ev); st.onPick(cellAt(q.x, q.y)); } };
      hit.addEventListener('pointermove', mv); hit.addEventListener('pointerup', up);
    });
    st.svgEl = L.ownerSVGElement;
    placeMap();
  }
  const scale = () => st.mag === 10 ? 1.1 : 2.8;
  function svgPt(e) { const pt = st.svgEl.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(st.svgEl.getScreenCTM().inverse()); }
  function clampOff() { const W = COLS * CW, H = ROWS * CH; st.offX = Math.max(-W + 20, Math.min(-20, st.offX)); st.offY = Math.max(-H + 20, Math.min(-20, st.offY)); }
  function placeMap() { const sc = scale(); st.map.setAttribute('transform', `translate(${FX},${FY}) scale(${sc}) translate(${st.offX},${st.offY})`); }
  function cellAt(sx, sy) {
    if (Math.hypot(sx - FX, sy - FY) > FR) return null;
    const sc = scale(), mx = (sx - FX) / sc - st.offX, my = (sy - FY) / sc - st.offY;
    return st.cells.find(c => mx >= c.x && mx < c.x + CW && my >= c.y && my < c.y + CH) || null;
  }
  function blur() { const z = st.coarse + st.fine * 0.25; return Math.min(8, Math.abs(z - st.z0) * (st.mag === 10 ? 0.5 : 1.4)); }
  function sharp() { return blur() < 0.6; }
  function applyFocus() {
    const b = blur();
    st.blurF.setAttribute('stdDeviation', b.toFixed(2));
    // nét rồi thì bỏ bộ lọc cho kéo vi trường mượt hơn
    if (b < 0.3) st.mapWrap.removeAttribute('filter'); else st.mapWrap.setAttribute('filter', 'url(#fovBlur)');
  }
  // tế bào đang thấy trong vi trường
  function visibleCells() {
    const sc = scale();
    return st.cells.filter(c => Math.hypot((c.x + CW / 2 + st.offX) * sc, (c.y + CH / 2 + st.offY) * sc) < FR - 6);
  }

  function knobs(api, coarseOn) {
    st.cCtl = api.slider({
      label: 'Ốc thô (to)', min: 0, max: 100, value: st.coarse, unit: '',
      onInput(v, c) {
        if (st.mag === 40 && Math.abs(v - st.coarse) > 0.5) {
          c.card.querySelector('input[type=range]').value = st.coarse; c.card.querySelector('.num-in').value = st.coarse;
          if (!st.warned) { st.warned = true; api.card({ kicker: '⚠️ Cảnh báo thao tác', text: 'Với vật kính lớn chỉ dùng ốc vi cấp để lấy nét. Vặn ốc thô dễ làm vật kính đâm vỡ lam kính!' }); }
          return;
        }
        st.coarse = v; applyFocus(); st.onFocus && st.onFocus();
      }
    });
    if (!coarseOn) st.cCtl.card.style.opacity = .55;
    st.fCtl = api.slider({ label: 'Ốc vi cấp (nhỏ)', min: -20, max: 20, step: 0.5, value: st.fine, onInput(v) { st.fine = v; applyFocus(); st.onFocus && st.onFocus(); } });
  }
  function idTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['Tế bào', 'Em chọn', 'Đáp án', '']);
    st.tbl.set(st.ids.slice(-6).map(r => ['#' + r.id, r.em.replace('Kỳ ', ''), r.right.replace('Kỳ ', ''), r.ok ? '✅' : '❌']));
  }

  const steps = [
    {
      label: 'Chuẩn bị', text: 'Đặt tiêu bản đỉnh rễ hành lên bàn kính', hint: 'Kéo lam kính vào bàn kính của kính hiển vi',
      enter(api) {
        api.setOn(st.slide, true);
        api.draggable(st.slide, {
          target: { x: 150, y: 330, r: 90 }, snap: false, onDrop: () => {
            st.slide.style.display = 'none'; st.stageSlide.setAttribute('opacity', 1);
            st.dark.setAttribute('opacity', 0); st.mapWrap.setAttribute('opacity', 1); st.ready = true; applyFocus();
            api.say('Hình đang mờ. Vặn ốc thô để lấy nét'); api.done();
          }
        });
      }
    },
    {
      label: 'Lấy nét 10×', text: 'Vặn ốc thô rồi ốc vi cấp cho đến khi thấy rõ tế bào', hint: 'Kéo thanh Ốc thô tới khi hình gần rõ, rồi chỉnh Ốc vi cấp cho thật nét',
      enter(api) {
        knobs(api, true);
        st.onFocus = () => { if (sharp()) { api.done(); api.say('Đã nét! Kéo vi trường để xem các vùng khác'); } else api.hideNext(); };
        st.onFocus();
      },
      onNext(api) { st.onFocus = null; api.goto(2); }
    },
    {
      label: 'Đổi vật kính 40×', text: 'Chuyển sang vật kính 40× để thấy rõ nhiễm sắc thể', hint: 'Chọn 40×, rồi chỉ chỉnh Ốc vi cấp cho nét',
      enter(api) {
        api.choices({
          label: 'Vật kính', items: [{ t: '10×', v: 10 }, { t: '40×', v: 40 }], value: st.mag,
          onPick(v) {
            if (v === st.mag) return;
            NL.audio.play('click');
            st.mag = v; st.z0 += v === 40 ? 2.5 : -2.5; placeMap(); applyFocus();
            st.magTxt.textContent = 'Vật kính ' + v + '×'; st.objLbl.textContent = v + '×';
            st.onFocus && st.onFocus();
          }
        });
        knobs(api, false);
        st.onFocus = () => { if (st.mag === 40 && sharp()) { api.done(); api.say('Rõ rồi! Thấy cả nhiễm sắc thể màu tím'); } else api.hideNext(); };
        st.onFocus();
      },
      onNext(api) { st.onFocus = null; api.goto(3); }
    },
    {
      label: () => `Nhận diện · ${st.found.size}/4 kỳ phân chia`, text: 'Chạm vào một tế bào để đoán nó đang ở kỳ nào', hint: 'Kéo vi trường để tìm các tế bào có NST màu tím đậm. Cần tìm đủ 4 kỳ: đầu, giữa, sau, cuối',
      enter(api) {
        idTable(api);
        st.onPick = c => {
          if (!c) return;
          st.onPick = null;
          st.selRing.setAttribute('x', c.x - 0.5); st.selRing.setAttribute('y', c.y - 0.5); st.selRing.setAttribute('opacity', 1);
          let first = null;
          api.ask({
            kicker: `🔬 Tế bào #${c.id}`, q: 'Tế bào này đang ở kỳ nào của nguyên phân?',
            options: PH.map((t, k) => ({ t, ok: k === c.p, why: HINT[c.p] }))
          }, r => {
            first = r.answer;
            st.ids.push({ id: c.id, mag: st.mag, sharp: sharp(), em: first, right: PH[c.p], ok: r.firstTry });
            if (c.p) st.found.add(c.p);
            st.selRing.setAttribute('opacity', 0); idTable(api);
            if (st.found.size >= 4 || st.ids.length >= 12) { api.say(st.found.size >= 4 ? 'Em đã tìm đủ 4 kỳ phân chia!' : 'Em đã nhận diện 12 tế bào, đủ rồi!'); api.done('Đếm vi trường ➜'); }
            else { document.getElementById('stepNo').textContent = `Nhận diện · ${st.found.size}/4 kỳ phân chia`; api.say(c.p ? 'Tìm tiếp tế bào ở kỳ khác' : 'Đây là tế bào chưa phân chia. Tìm tế bào có NST tím đậm nhé'); st.onPick = pickFn; }
          });
        };
        const pickFn = st.onPick;
      },
      onNext(api) { st.onPick = null; api.goto(4); }
    },
    {
      label: 'Đếm vi trường', text: 'Đếm số tế bào ở từng kỳ trong vi trường đang xem', hint: 'Kỳ nào có nhiều tế bào nhất?',
      enter(api) {
        const vis = visibleCells(), cnt = PH.map((_, k) => vis.filter(c => c.p === k).length);
        st.count = { total: vis.length, cnt };
        api.table(['Kỳ', 'Số tế bào', '%']).set(PH.map((t, k) => [t, cnt[k], Math.round(cnt[k] / vis.length * 100) + '%']).concat([['Tổng', vis.length, '100%']]));
        api.ask({
          predict: true, kicker: '🤔 Em nghĩ sao', q: 'Phần lớn tế bào ở Kỳ trung gian. Điều đó cho biết gì?',
          options: [{ t: 'Kỳ trung gian kéo dài nhất trong chu kỳ tế bào' }, { t: 'Tế bào ở kỳ trung gian bị chết' }, { t: 'Kính hiển vi chỉ nhìn rõ kỳ trung gian' }]
        }, () => api.done('Xem biểu đồ ➜'));
      },
      onNext(api) { api.goto(5); }
    },
    {
      label: 'Kết quả', text: 'Tỉ lệ tế bào ở từng kỳ trong vi trường', hint: 'Cột cao nhất: kỳ chiếm thời gian dài nhất',
      enter(api) { api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Kỳ trung gian kéo dài nhất trong chu kỳ tế bào', truth: 'kỳ trung gian chiếm phần lớn thời gian của chu kỳ tế bào nên gặp nhiều nhất.',
          sub: 'Trong các kỳ phân chia, kỳ giữa và kỳ sau diễn ra nhanh nên ít gặp hơn.',
          quiz: QUIZ, bank: 4, result: result()
        });
      }
    }
  ];

  function result() {
    const c = st.count || { total: 1, cnt: [0, 0, 0, 0, 0] };
    return {
      title: 'Quan sát nguyên phân ở rễ hành', param: `Vật kính ${st.mag}×, ${st.ids.length} tế bào nhận diện, ${c.total} tế bào trong vi trường`,
      table: {
        head: ['Mã tế bào', 'Vật kính', 'Lấy nét', 'Em chọn', 'Đáp án', 'Kết quả'],
        rows: st.ids.map(r => ['#' + r.id, r.mag + '×', r.sharp ? 'Đã nét' : 'Chưa nét', r.em, r.right, r.ok ? 'Đúng' : 'Sai'])
          .concat(PH.map((t, k) => ['Vi trường', '', '', t, c.cnt[k] + ' tế bào', Math.round(c.cnt[k] / c.total * 100) + '%']))
      },
      chart: { labels: PH.map(t => t.replace('Kỳ ', '')), yLabel: '% tế bào trong vi trường', series: [{ name: 'Tỉ lệ', color: '#9B6BD6', values: c.cnt.map(n => Math.round(n / c.total * 100)) }] },
      conclusion: 'Nguyên phân gồm kỳ trung gian và 4 kỳ phân chia: đầu, giữa, sau, cuối. Kỳ trung gian chiếm nhiều thời gian nhất nên số tế bào ở kỳ này nhiều nhất',
      note: 'Đỉnh rễ hành có mô phân sinh, tế bào phân chia liên tục nên dễ quan sát nguyên phân.'
    };
  }

  const QUIZ = [
    {
      kicker: '❓ Vì sao?', q: 'Vì sao người ta thường chọn kỳ giữa để đếm và quan sát hình dạng nhiễm sắc thể?',
      options: [
        { t: 'NST co xoắn cực đại và xếp gọn một hàng nên dễ nhìn nhất', ok: true },
        { t: 'Kỳ giữa kéo dài nhất', why: 'Kỳ giữa diễn ra khá nhanh. Hãy nghĩ tới hình dạng NST lúc này.' },
        { t: 'Lúc này màng nhân dày lên', why: 'Ở kỳ giữa màng nhân đã biến mất. Hãy nhớ lại NST trông thế nào.' }
      ],
      explain: 'Ở kỳ giữa NST co ngắn, dày nhất và xếp ở mặt phẳng xích đạo nên thấy rõ số lượng và hình dạng.'
    }
  ];

  NL.lab.register('2I', {
    goal: 'Tế bào ở đỉnh rễ hành phân chia ra sao? Em có tìm đủ các kỳ không?', clearSide: true, build, steps,
    // dùng khi kiểm thử tự động
    auto(api) {
      if (st.onFocus) { st.coarse = st.z0 - (st.mag === 40 ? 0 : 0); st.fine = 0; st.fCtl && st.fCtl.set(0); applyFocus(); if (st.mag !== 40 && api.step === 2) { st.mag = 40; st.z0 = st.coarse; placeMap(); applyFocus(); } st.onFocus(); return 'focus'; }
      if (st.onPick) { const v = visibleCells(), want = v.find(c => c.p && !st.found.has(c.p)) || v[Math.floor(Math.random() * v.length)]; st.offX = -want.x - CW / 2; st.offY = -want.y - CH / 2; placeMap(); st.onPick(want); return 'pick'; }
      return false;
    }
  });
})();
