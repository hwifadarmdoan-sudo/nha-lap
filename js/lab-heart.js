// Thí nghiệm 2G: nhịp tim, huyết áp và điện tâm đồ khi nghỉ, đi bộ, chạy.
(function () {
  const ACT = {
    rest: { t: '🧍 Nghỉ ngơi', met: 1, leg: 0, f: 0, belt: 0, kmh: 0 },
    walk: { t: '🚶 Đi bộ 4 km/h', met: 3.5, leg: 22, f: 1.7, belt: 60, kmh: 4 },
    run: { t: '🏃 Chạy 10 km/h', met: 8, leg: 42, f: 2.8, belt: 160, kmh: 10 }
  };
  const ORDER = ['rest', 'walk', 'run']; // lần 1 nghỉ, lần 2 đi bộ, lần 3 chạy để thấy rõ sự thay đổi
  const PROF = { normal: { t: 'Bình thường', hr: 72, run: 78, walk: 30 }, athlete: { t: 'Vận động viên', hr: 54, run: 72, walk: 25 } };
  const NEED = 60; // giữ một trạng thái ít nhất 60 giây cho nhịp tim ổn định
  let st;

  function target() {
    const p = PROF[st.prof], a = st.act;
    const hr = p.hr + (a === 'run' ? p.run : a === 'walk' ? p.walk : 0);
    const sbp = 113 + 7 * (ACT[a].met - 1) - (st.prof === 'athlete' ? 4 : 0);
    const dbp = 77 + (a === 'run' ? 3 : a === 'walk' ? 1 : 0) - (st.prof === 'athlete' ? 2 : 0);
    return { hr, sbp, dbp };
  }
  // dạng sóng một nhịp tim: P, QRS, T
  function ecg(ph) {
    const gs = (c, w, a) => a * Math.exp(-Math.pow((ph - c) / w, 2));
    return gs(0.16, 0.03, 0.12) + gs(0.3, 0.01, -0.1) + gs(0.32, 0.011, 1) + gs(0.345, 0.012, -0.22) + gs(0.56, 0.05, 0.28);
  }

  function person(api, x, y) {
    const g = api.g(api.svg, x, y), el = api.el;
    const mkLimb = (ox, oy, len, w, color) => { const l = api.g(g, ox, oy); el('rect', { x: -w / 2, y: 0, width: w, height: len, rx: w / 2, fill: color }, l); return l; };
    st.legB = mkLimb(0, -70, 70, 15, '#2E4A70'); st.armB = mkLimb(0, -138, 56, 12, '#E9B48E');
    el('rect', { x: -20, y: -145, width: 40, height: 80, rx: 16, fill: '#5BB4EA' }, g);
    el('circle', { cx: 0, cy: -168, r: 22, fill: '#FFE0C4', stroke: '#E8B998', 'stroke-width': 2 }, g);
    el('path', { d: 'M-22 -172 Q-20 -196 2 -194 Q24 -192 22 -170 Q12 -184 -22 -172 Z', fill: '#3A2A20' }, g);
    el('circle', { cx: 8, cy: -168, r: 2.5, fill: '#333' }, g);
    st.legF = mkLimb(0, -70, 70, 15, '#36557F'); st.armF = mkLimb(0, -138, 56, 12, '#FFD3B0');
    st.cuffOn = el('rect', { x: -9, y: 8, width: 18, height: 20, rx: 4, fill: '#2F80C0', opacity: 0 }, st.armF);
    st.sweat = api.g(g, 0, 0); st.sweat.style.opacity = 0;
    [[-28, -178], [26, -186], [30, -160]].forEach(([sx, sy]) => el('path', { d: `M${sx} ${sy} q-4 7 0 10 q4 -3 0 -10 Z`, fill: '#7FC8F0' }, st.sweat));
    return g;
  }

  function build(api) {
    const L = api.svg, el = api.el;
    st = { act: 'rest', prof: 'normal', speed: 5, t: 0, held: 0, HR: 72, SBP: 113, DBP: 77, log: [], meas: [], ecgBuf: new Array(300).fill(0), cur: 0, ph: 0, cuffed: false };
    // máy chạy bộ kiểu phòng gym: sàn chạy, nắp động cơ, cột, tay vịn, bảng điều khiển
    el('ellipse', { cx: 180, cy: 458, rx: 160, ry: 9, fill: '#000', opacity: 0.12 }, L);
    el('line', { x1: 292, y1: 412, x2: 318, y2: 300, stroke: '#7D889B', 'stroke-width': 12, 'stroke-linecap': 'round' }, L);
    el('rect', { x: 38, y: 422, width: 262, height: 26, rx: 12, fill: '#3B4250' }, L);
    el('rect', { x: 46, y: 438, width: 246, height: 4, rx: 2, fill: '#5BB4EA' }, L);
    el('rect', { x: 52, y: 448, width: 18, height: 8, rx: 3, fill: '#2A2F38' }, L);
    el('rect', { x: 268, y: 448, width: 18, height: 8, rx: 3, fill: '#2A2F38' }, L);
    el('rect', { x: 50, y: 416, width: 214, height: 10, rx: 5, fill: '#1F242C' }, L);
    const clip = el('clipPath', { id: 'beltClip' }, L); el('rect', { x: 52, y: 416, width: 210, height: 10, rx: 5 }, clip);
    const beltWrap = api.g(L, 0, 0); beltWrap.setAttribute('clip-path', 'url(#beltClip)');
    st.belt = api.g(beltWrap, 0, 0);
    for (let k = 0; k < 13; k++) el('rect', { x: 52 + k * 20, y: 418, width: 3, height: 6, fill: '#3E4653' }, st.belt);
    el('rect', { x: 256, y: 398, width: 52, height: 50, rx: 16, fill: '#4A5262' }, L);
    el('rect', { x: 266, y: 410, width: 32, height: 6, rx: 3, fill: '#5BB4EA', opacity: 0.8 }, L);
    st.man = person(api, 160, 416);
    el('line', { x1: 298, y1: 412, x2: 326, y2: 300, stroke: '#9AA5B8', 'stroke-width': 12, 'stroke-linecap': 'round' }, L);
    el('path', { d: 'M318 312 L222 322', stroke: '#B8C2D0', 'stroke-width': 8, 'stroke-linecap': 'round', fill: 'none' }, L);
    el('path', { d: 'M262 318 L226 322', stroke: '#2B3240', 'stroke-width': 10, 'stroke-linecap': 'round', fill: 'none' }, L);
    el('rect', { x: 290, y: 270, width: 84, height: 44, rx: 10, fill: '#2B3240' }, L);
    el('rect', { x: 298, y: 277, width: 56, height: 24, rx: 5, fill: '#10221A' }, L);
    el('circle', { cx: 364, cy: 289, r: 5, fill: '#E5534B' }, L);
    st.kmh = api.text(L, 326, 294, '0 km/h', 13, '#59F28A', 800);
    // màn hình ECG
    el('rect', { x: 360, y: 96, width: 330, height: 180, rx: 14, fill: '#0E1A14', stroke: '#33475B', 'stroke-width': 5 }, L);
    for (let i = 0; i <= 30; i++) el('line', { x1: 375 + i * 10, y1: 110, x2: 375 + i * 10, y2: 262, stroke: i % 5 ? '#123A24' : '#1E5A36', 'stroke-width': 1 }, L);
    for (let j = 0; j <= 15; j++) el('line', { x1: 375, y1: 110 + j * 10, x2: 675, y2: 110 + j * 10, stroke: j % 5 ? '#123A24' : '#1E5A36', 'stroke-width': 1 }, L);
    st.ecgA = el('polyline', { points: '', fill: 'none', stroke: '#59F28A', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, L);
    st.ecgB = el('polyline', { points: '', fill: 'none', stroke: '#59F28A', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, L);
    st.hrTxt = api.text(L, 640, 132, '-- bpm', 18, '#59F28A', 800);
    st.ecgOff = api.text(L, 525, 196, 'Chưa gắn thiết bị', 18, '#59F28A', 800);
    // máy đo huyết áp
    el('rect', { x: 400, y: 330, width: 190, height: 118, rx: 14, fill: '#E3EEF7', stroke: '#9FB4C8', 'stroke-width': 3 }, L);
    el('rect', { x: 414, y: 342, width: 162, height: 64, rx: 8, fill: '#C9E2B8' }, L);
    st.bpTxt = api.text(L, 495, 372, '--- / ---', 24, '#22381A', 800);
    st.pTxt = api.text(L, 495, 398, 'Áp suất 0 mmHg', 13, '#22381A', 700);
    api.text(L, 495, 436, 'Máy đo huyết áp', 13, '#6C88A3', 700);
    st.cuff = api.g(L, 640, 430);
    el('rect', { x: -30, y: -40, width: 60, height: 40, rx: 10, fill: '#2F80C0' }, st.cuff);
    el('path', { d: 'M0 -40 C 0 -70, -60 -70, -80 -50', stroke: '#333', 'stroke-width': 4, fill: 'none' }, st.cuff);
    api.text(st.cuff, 0, 20, 'Băng quấn', 13, '#6C88A3', 700);
  }

  // mô phỏng chạy liên tục: nhịp tim, huyết áp tiến dần tới mức của trạng thái hiện tại
  function sim(api) {
    let beltX = 0, legT = 0, logT = 0, lastBeat = 0;
    api.loop(dt => {
      const sdt = dt * st.speed, tg = target(), up = tg.hr > st.HR;
      const tau = up ? 30 : 70; // lên nhanh, hồi phục chậm (3–5 phút)
      st.HR += (tg.hr - st.HR) * (1 - Math.exp(-sdt / tau));
      st.SBP += (tg.sbp - st.SBP) * (1 - Math.exp(-sdt / tau));
      st.DBP += (tg.dbp - st.DBP) * (1 - Math.exp(-sdt / tau));
      st.t += sdt; st.held += sdt; logT += sdt;
      if (logT >= 5) { logT = 0; st.log.push([+(st.t / 60).toFixed(2), Math.round(st.HR), Math.round(st.SBP), Math.round(st.DBP)]); }
      // người và máy chạy
      const a = st.stopped ? ACT.rest : ACT[st.act]; legT += dt * a.f * Math.PI * 2;
      const sw = Math.sin(legT) * a.leg;
      st.legF._extra = ` rotate(${sw})`; st.legB._extra = ` rotate(${-sw})`; st.armF._extra = ` rotate(${-sw * 0.8})`; st.armB._extra = ` rotate(${sw * 0.8})`;
      [st.legF, st.legB, st.armF, st.armB].forEach(e => api.place(e));
      st.man._y = 416 - Math.abs(Math.sin(legT)) * (a.leg / 6); api.place(st.man);
      st.sweat.style.opacity = st.HR > 120 ? 1 : st.HR > 95 ? 0.5 : 0;
      beltX = (beltX - a.belt * dt) % 20; st.belt._x = beltX; api.place(st.belt);
      st.kmh.textContent = a.kmh + ' km/h';
      // điện tâm đồ quét 4 giây trên màn
      if (st.cuffed) {
        const px = dt * 75;
        for (let k = 0; k < px; k++) {
          st.ph += (st.HR / 60) / 75; if (st.ph >= 1) st.ph -= 1;
          st.ecgBuf[st.cur] = ecg(st.ph); st.cur = (st.cur + 1) % 300;
        }
        const pt = i => `${375 + i},${222 - st.ecgBuf[i] * 90}`;
        const a1 = [], b1 = [];
        for (let i = 0; i < 300; i++) { if (i < st.cur - 1) a1.push(pt(i)); else if (i > st.cur + 8) b1.push(pt(i)); }
        st.ecgA.setAttribute('points', a1.join(' ')); st.ecgB.setAttribute('points', b1.join(' '));
        st.hrTxt.textContent = Math.round(st.HR) + ' bpm';
        const beatAt = performance.now();
        if (st.ph > 0.32 && st.ph < 0.34 && beatAt - lastBeat > 250) { lastBeat = beatAt; if (!st.measuring) NL.audio.play('tick'); }
      }
      if (st.onTick) st.onTick();
    });
  }

  function logTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['Trạng thái', 'HR', 'Huyết áp', 'R−R']);
    st.tbl.set(st.meas.map(m => [ACT[m.act].t.split(' ').slice(1, 3).join(' '), m.hr, `${m.sbp}/${m.dbp}`, (60 / m.hr).toFixed(2) + ' s']));
  }

  const steps = [
    {
      label: 'Chuẩn bị', text: 'Quấn băng đo huyết áp lên cánh tay bạn đang đứng trên máy chạy (điện cực ECG đã dán sẵn trên ngực bạn)', hint: 'Kéo băng quấn màu xanh vào cánh tay',
      enter(api) {
        sim(api);
        api.setOn(st.cuff, true);
        api.draggable(st.cuff, {
          target: { x: 170, y: 300, r: 110 }, snap: false, onDrop: () => {
            st.cuff.style.display = 'none'; st.cuffOn.setAttribute('opacity', 1);
            st.cuffed = true; st.ecgOff.remove(); NL.audio.play('ting');
            api.say('Đã gắn xong! Điện tâm đồ lấy từ các điện cực dán trên ngực; băng quấn chỉ dùng để đo huyết áp'); api.done();
          }
        });
      }
    },
    {
      label: () => `Lần đo ${st.meas.length + 1}/3 · ${ACT[ORDER[st.meas.length]].t.split(' ')[1]}`,
      get text() { return ['Lần 1: bạn đứng yên trên máy. Đợi nhịp tim ổn định rồi đo', 'Lần 2: máy chạy 4 km/h, bạn đi bộ. Đợi ổn định rồi đo', 'Lần 3: máy chạy 10 km/h, bạn chạy. Đợi ổn định rồi đo'][Math.min(2, st.meas.length)]; },
      hint: 'Nhìn số bpm trên màn hình: tăng dần rồi đứng yên là ổn định',
      enter(api) {
        logTable(api);
        const want = ORDER[Math.min(2, st.meas.length)];
        if (st.act !== want) { st.act = want; st.held = 0; }
        if (!st.meas.length && !api.prediction) api.ask({
          predict: true, q: 'Khi chuyển từ nghỉ ngơi sang chạy nhanh, nhịp tim sẽ…?',
          options: [{ t: 'Tăng lên' }, { t: 'Giảm xuống' }, { t: 'Không đổi' }]
        });
        const card = api.panel(`<div>${ACT[st.act].t}</div><div>⏱ Giữ trạng thái</div><div class="big-num"><span id="htHeld">0</span> giây</div><div class="rep-sub" style="font-size:13px" id="htNote"></div>`);
        const ready = () => {
          card.querySelector('#htHeld').textContent = Math.floor(st.held);
          card.querySelector('#htNote').textContent = st.held < NEED ? 'Đợi đủ 60 giây cho nhịp tim ổn định' : 'Ổn định rồi, đo được!';
          if (st.held >= NEED) { if (document.getElementById('btnNext').classList.contains('hidden')) api.done('Đo huyết áp ➜'); } else api.hideNext();
        };
        st.onTick = ready;
        if (!st.meas.length) api.choices({ label: 'Thể trạng', items: Object.keys(PROF).map(k => ({ t: PROF[k].t, v: k })), value: st.prof, onPick(v) { if (v !== st.prof) { st.prof = v; st.held = 0; } } });
        api.choices({ label: 'Tốc độ thời gian', items: [1, 5, 10].map(n => ({ t: n + '×', v: n })), value: st.speed, onPick(v) { st.speed = v; } });
      },
      onNext(api) { st.onTick = null; api.goto(2); }
    },
    {
      label: () => `Lần đo ${st.meas.length + 1}/3 · Huyết áp`, get text() { return st.act === 'rest' ? 'Bấm Đo trên máy đo huyết áp' : 'Bấm Đo: máy chạy dừng lại và đo ngay sau vận động'; }, hint: 'Băng quấn tự bơm căng rồi xả dần. Máy ghi tâm thu (số trên) và tâm trương (số dưới)',
      enter(api) { measure(api); }
    },
    {
      label: () => `Lần đo ${st.meas.length}/3 · xong`, text: '', hint: 'Bấm nút ở góc dưới để đi tiếp',
      enter(api) {
        logTable(api);
        const need = 3 - st.meas.length;
        api.say(need > 0 ? `Đã ghi. Tiếp theo: ${need === 2 ? 'cho bạn đi bộ 4 km/h' : 'cho bạn chạy 10 km/h'}` : 'Đủ 3 lần! Giờ cho bạn nghỉ và xem tim hồi phục');
        api.done(need > 0 ? (need === 2 ? 'Bật máy chạy 4 km/h ➜' : 'Tăng lên 10 km/h ➜') : 'Xem hồi phục ➜');
      },
      onNext(api) { api.goto(st.meas.length < 3 ? 1 : 4); }
    },
    {
      label: 'Hồi phục', text: 'Bạn dừng chạy và nghỉ. Nhịp tim có về ngay không?', hint: 'Quan sát số bpm giảm dần trong 3 phút',
      enter(api) {
        logTable(api);
        const peak = Math.round(st.HR); st.act = 'rest'; st.held = 0; st.recStart = st.t; st.peak = peak;
        const card = api.panel(`<div>⏱ Thời gian nghỉ</div><div class="big-num"><span id="htRec">0:00</span></div><div class="rep-sub">Từ ${peak} bpm</div>`);
        api.choices({ label: 'Tốc độ thời gian', items: [1, 5, 10].map(n => ({ t: n + '×', v: n })), value: Math.max(5, st.speed), onPick(v) { st.speed = v; } });
        st.speed = Math.max(5, st.speed);
        st.onTick = () => {
          const s = st.t - st.recStart;
          card.querySelector('#htRec').textContent = Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
          if (s >= 180) { st.onTick = null; st.rec3 = Math.round(st.HR); api.say(`Sau 3 phút nghỉ: ${st.peak} → ${st.rec3} bpm. Tim hồi phục từ từ`); api.done('Xem đồ thị ➜'); }
        };
      },
      onNext(api) { api.goto(5); }
    },
    {
      label: 'Kết quả', text: 'Nhịp tim và huyết áp theo thời gian', hint: 'Đoạn đi lên: lúc vận động. Đoạn đi xuống: lúc hồi phục',
      enter(api) { api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Tăng lên', truth: 'chạy nhanh làm nhịp tim tăng mạnh, khoảng R−R trên điện tâm đồ ngắn lại.',
          sub: 'Cơ cần nhiều O₂ hơn nên tim đập nhanh, mạnh hơn; huyết áp tâm thu tăng, tâm trương gần như giữ nguyên.',
          quiz: QUIZ, bank: 4, result: result()
        });
      }
    }
  ];

  // đo huyết áp bằng máy tự động: băng quấn bơm lên 180 mmHg rồi xả dần
  function measure(api) {
    logTable(api);
    st.measuring = true;
    const tSBP = Math.round(st.SBP * (0.99 + Math.random() * 0.02)), tDBP = Math.round(st.DBP * (0.99 + Math.random() * 0.02)), hr = Math.round(st.HR);
    let P = 0, phase = 'idle', gotS = false;
    const card = api.panel(`<div>Áp suất băng quấn</div><div class="big-num"><span id="htP">0</span> <small>mmHg</small></div>
      <button class="btn small pop" id="htGo">Đo ▶</button><div class="rep-sub" style="font-size:13px" id="htS"></div>`);
    const $c = s => card.querySelector(s);
    const show = () => { $c('#htP').textContent = Math.round(P); st.pTxt.textContent = `Áp suất ${Math.round(P)} mmHg`; st.cuffOn.setAttribute('width', 18 + Math.min(10, P / 20)); st.cuffOn.setAttribute('x', -9 - Math.min(5, P / 40)); };
    $c('#htGo').onclick = () => {
      if (phase !== 'idle') return;
      phase = 'pump'; $c('#htGo').classList.add('hidden'); st.bpTxt.textContent = '--- / ---';
      if (st.act !== 'rest') { st.stopped = true; NL.game.toast('Dừng máy chạy và đo ngay: đang chạy thì tay rung, máy đo không chính xác'); }
      $c('#htS').textContent = 'Đang bơm căng băng quấn…'; NL.audio.play('click');
      const lp = api.loop(dt => {
        if (phase === 'pump') { P = Math.min(180, P + dt * 70); if (P >= 180) { phase = 'release'; $c('#htS').textContent = 'Đang xả khí, máy nghe mạch đập…'; } }
        else if (phase === 'release') {
          P -= dt * 14;
          if (!gotS && P <= tSBP) { gotS = true; NL.audio.play('tick'); $c('#htS').textContent = `Mạch bắt đầu đập: tâm thu ${tSBP}`; st.bpTxt.textContent = `${tSBP} / ---`; }
          if (P <= tDBP) { lp.stop(); finish(); return; }
        }
        show();
      });
    };
    const finish = () => {
      phase = 'done'; st.measuring = false; st.stopped = false; P = 0; show(); card.remove();
      st.bpTxt.textContent = `${tSBP} / ${tDBP}`; st.pTxt.textContent = `Mạch ${hr} lần/phút`;
      st.meas.push({ act: st.act, prof: st.prof, hr, sbp: tSBP, dbp: tDBP, min: +(st.held / 60).toFixed(1) });
      const r = st.meas[0], d = (a, b) => (a - b >= 0 ? '+' : '') + (a - b);
      NL.audio.play('ting');
      NL.game.toast(st.meas.length === 1 ? `Lúc nghỉ: huyết áp ${tSBP}/${tDBP} mmHg, nhịp tim ${hr}` : `So với lúc nghỉ: nhịp tim ${d(hr, r.hr)}, tâm thu ${d(tSBP, r.sbp)}, tâm trương ${d(tDBP, r.dbp)}`);
      api.goto(3);
    };
  }

  function result() {
    const pts = k => st.log.map(r => [r[0], r[k]]);
    return {
      title: 'Nhịp tim và huyết áp khi vận động', param: st.meas.map(m => ACT[m.act].t.split(' ').slice(1, 3).join(' ')).join(', ') + ' · ' + PROF[st.prof].t,
      table: {
        head: ['Lần', 'Trạng thái', 'Luyện tập', 'Thời gian (phút)', 'HR (bpm)', 'SBP (mmHg)', 'DBP (mmHg)', 'R−R (s)'],
        rows: st.meas.map((m, i) => [i + 1, ACT[m.act].t.split(' ').slice(1, 3).join(' '), PROF[m.prof].t, m.min, m.hr, m.sbp, m.dbp, (60 / m.hr).toFixed(2)])
          .concat(st.rec3 ? [['', 'Hồi phục 3 phút', '', 3, `${st.peak} → ${st.rec3}`, '', '', '']] : [])
      },
      chart: {
        type: 'line', xLabel: 'Thời gian (phút)', yLabel: 'bpm · mmHg', yMin: 40, yMax: 200,
        series: [{ name: 'Nhịp tim', color: '#E5534B', points: pts(1) }, { name: 'Tâm thu', color: '#2F80C0', points: pts(2) }, { name: 'Tâm trương', color: '#5BB4EA', points: pts(3) }]
      },
      conclusion: 'Vận động càng mạnh, nhịp tim và huyết áp tâm thu càng tăng (khoảng R−R ngắn lại); huyết áp tâm trương thay đổi ít. Sau vận động, tim hồi phục dần trong vài phút',
      note: 'Vận động viên có nhịp tim nghỉ thấp hơn vì tim khỏe, mỗi nhịp bơm được nhiều máu hơn.'
    };
  }

  const QUIZ = [
    {
      kicker: '❓ Vì sao?', q: 'Vì sao khi chạy nhanh tim phải đập nhanh hơn?',
      options: [
        { t: 'Cơ hoạt động mạnh cần nhiều O₂ và chất dinh dưỡng, cần thải nhiều CO₂', ok: true },
        { t: 'Vì người chạy bị sợ hãi', why: 'Cảm xúc có thể làm tim đập nhanh, nhưng ở đây nguyên nhân chính là nhu cầu của cơ.' },
        { t: 'Vì máu chảy ngược về tim', why: 'Van tim ngăn máu chảy ngược. Hãy nghĩ tới nhu cầu O₂ của cơ khi chạy.' }
      ],
      explain: 'Tim đập nhanh, mạnh hơn để đưa nhiều máu giàu O₂ tới cơ và mang CO₂ đi.'
    }
  ];

  NL.lab.register('2G', { goal: 'Khi chạy nhanh, tim và huyết áp thay đổi thế nào? Nghỉ bao lâu thì về bình thường?', clearSide: true, build, steps });
})();
