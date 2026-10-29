// Thí nghiệm 2G: nhịp tim, huyết áp và điện tâm đồ khi nghỉ, đi bộ, chạy.
(function () {
  const ACT = {
    rest: { t: '🧍 Nghỉ ngơi', met: 1, leg: 0, f: 0, belt: 0 },
    walk: { t: '🚶 Đi bộ 4 km/h', met: 3.5, leg: 22, f: 1.7, belt: 60 },
    run: { t: '🏃 Chạy 10 km/h', met: 8, leg: 42, f: 2.8, belt: 160 }
  };
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
    // máy chạy bộ
    el('path', { d: 'M40 452 L300 452 L290 424 L60 424 Z', fill: '#4A5A6A' }, L);
    st.belt = api.g(L, 0, 0);
    for (let k = 0; k < 12; k++) el('rect', { x: 64 + k * 20, y: 426, width: 8, height: 6, fill: '#6B7B8B' }, st.belt);
    el('rect', { x: 286, y: 300, width: 10, height: 128, fill: '#6B7B8B' }, L);
    el('rect', { x: 262, y: 288, width: 60, height: 22, rx: 6, fill: '#334455' }, L);
    st.man = person(api, 170, 424);
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
      const a = ACT[st.act]; legT += dt * a.f * Math.PI * 2;
      const sw = Math.sin(legT) * a.leg;
      st.legF._extra = ` rotate(${sw})`; st.legB._extra = ` rotate(${-sw})`; st.armF._extra = ` rotate(${-sw * 0.8})`; st.armB._extra = ` rotate(${sw * 0.8})`;
      [st.legF, st.legB, st.armF, st.armB].forEach(e => api.place(e));
      st.man._y = 424 - Math.abs(Math.sin(legT)) * (a.leg / 6); api.place(st.man);
      st.sweat.style.opacity = st.HR > 120 ? 1 : st.HR > 95 ? 0.5 : 0;
      beltX = (beltX - a.belt * dt) % 20; st.belt._x = beltX; api.place(st.belt);
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
      label: 'Chuẩn bị', text: 'Quấn băng đo huyết áp lên cánh tay bạn đang đứng trên máy chạy', hint: 'Kéo băng quấn màu xanh vào cánh tay',
      enter(api) {
        sim(api);
        api.setOn(st.cuff, true);
        api.draggable(st.cuff, {
          target: { x: 170, y: 300, r: 110 }, snap: false, onDrop: () => {
            st.cuff.style.display = 'none'; st.cuffOn.setAttribute('opacity', 1);
            st.cuffed = true; st.ecgOff.remove(); NL.audio.play('ting');
            api.say('Đã gắn xong! Màn hình đang hiện điện tâm đồ'); api.done();
          }
        });
      }
    },
    {
      label: () => `Lần đo ${st.meas.length + 1}/3 · Vận động`, text: 'Chọn mức vận động, đợi nhịp tim ổn định', hint: 'Mỗi lần đo chọn một mức vận động khác nhau',
      enter(api) {
        logTable(api);
        if (!st.meas.length && !api.prediction) api.ask({
          predict: true, q: 'Khi chuyển từ nghỉ ngơi sang chạy nhanh, nhịp tim sẽ…?',
          options: [{ t: 'Tăng lên' }, { t: 'Giảm xuống' }, { t: 'Không đổi' }]
        });
        const card = api.panel(`<div>⏱ Giữ trạng thái</div><div class="big-num"><span id="htHeld">0</span> giây</div><div class="rep-sub" style="font-size:13px" id="htNote"></div>`);
        const ready = () => {
          const dup = st.meas.some(m => m.act === st.act && m.prof === st.prof);
          card.querySelector('#htHeld').textContent = Math.floor(st.held);
          card.querySelector('#htNote').textContent = dup ? 'Đã đo trạng thái này, chọn mức khác' : st.held < NEED ? 'Đợi đủ 60 giây cho nhịp tim ổn định' : 'Ổn định rồi, đo được!';
          if (!dup && st.held >= NEED) { if (document.getElementById('btnNext').classList.contains('hidden')) api.done('Đo huyết áp ➜'); } else api.hideNext();
        };
        st.onTick = ready;
        api.choices({ label: 'Mức vận động', items: Object.keys(ACT).map(k => ({ t: ACT[k].t, v: k })), value: st.act, onPick(v) { if (v !== st.act) { st.act = v; st.held = 0; } } });
        api.choices({ label: 'Thể trạng', items: Object.keys(PROF).map(k => ({ t: PROF[k].t, v: k })), value: st.prof, onPick(v) { if (v !== st.prof) { st.prof = v; st.held = 0; } } });
        api.choices({ label: 'Tốc độ thời gian', items: [1, 5, 10].map(n => ({ t: n + '×', v: n })), value: st.speed, onPick(v) { st.speed = v; } });
      },
      onNext(api) { st.onTick = null; api.goto(2); }
    },
    {
      label: () => `Lần đo ${st.meas.length + 1}/3 · Huyết áp`, text: 'Bóp bóng bơm băng quấn lên khoảng 180 mmHg', hint: 'Bóp bóng nhiều lần, rồi bấm Xả khí. Nghe tiếng đập đầu tiên: bấm Tâm thu. Hết tiếng: bấm Tâm trương',
      enter(api) { measure(api); }
    },
    {
      label: () => `Lần đo ${st.meas.length}/3 · xong`, text: '', hint: 'Bấm nút ở góc dưới để đi tiếp',
      enter(api) {
        logTable(api);
        const need = 3 - st.meas.length;
        api.say(need > 0 ? `Đã ghi. Đổi mức vận động và đo thêm ${need} lần` : 'Đủ 3 lần! Giờ cho bạn nghỉ và xem tim hồi phục');
        api.done(need > 0 ? 'Đo lần nữa ➜' : 'Xem hồi phục ➜');
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

  // đo huyết áp bằng tay: bơm, xả khí, nghe tiếng Korotkoff
  function measure(api) {
    logTable(api);
    st.measuring = true;
    const tSBP = Math.round(st.SBP * (0.98 + Math.random() * 0.04)), tDBP = Math.round(st.DBP * (0.98 + Math.random() * 0.04)), hr = Math.round(st.HR);
    let P = 0, phase = 'pump', sys = null, dia = null, warned = false;
    const card = api.panel(`<div>Áp suất băng quấn</div><div class="big-num"><span id="htP">0</span> <small>mmHg</small></div>
      <button class="btn small pop hidden" id="htRel">Xả khí 💨</button><button class="btn small pop" id="htPump">Bóp bóng 💪</button>
      <button class="btn small pop hidden" id="htSys">Tâm thu (tiếng đầu tiên)</button><button class="btn small pop hidden" id="htDia">Tâm trương (hết tiếng)</button><div class="warn-line" id="htW"></div>`);
    const $c = s => card.querySelector(s);
    const show = () => { $c('#htP').textContent = Math.round(P); st.pTxt.textContent = `Áp suất ${Math.round(P)} mmHg`; st.cuffOn.setAttribute('width', 18 + Math.min(10, P / 20)); st.cuffOn.setAttribute('x', -9 - Math.min(5, P / 40)); };
    $c('#htPump').onclick = () => {
      P += 30; NL.audio.play('pop'); show();
      if (P >= 150) $c('#htRel').classList.remove('hidden');
      if (P > 220 && !warned) { warned = true; api.card({ kicker: '⚠️ Cảnh báo an toàn', text: 'Bơm áp suất quá cao gây chèn ép cơ và động mạch cánh tay, làm người đo bị đau!', btn: 'Xả bớt ➜' }); P = 200; show(); }
    };
    $c('#htRel').onclick = () => {
      phase = 'release';
      $c('#htW').textContent = P < tSBP + 10 ? 'Bơm chưa đủ cao nên có thể nghe tiếng đập ngay từ đầu. Lần sau bơm cao hơn nhé' : '';
      ['#htRel', '#htPump'].forEach(s => $c(s).classList.add('hidden'));
      $c('#htSys').classList.remove('hidden'); $c('#htDia').classList.remove('hidden');
      api.say('Đang xả khí… Lắng nghe tiếng đập (Korotkoff)');
      let beat = 0;
      const lp = api.loop(dt => {
        P = Math.max(0, P - dt * 9); show();
        beat += dt * hr / 60;
        if (beat >= 1) { beat -= 1; if (P <= tSBP && P >= tDBP) { NL.audio.play('tick'); st.man.style.filter = 'drop-shadow(0 0 6px #F2C94C)'; setTimeout(() => { st.man.style.filter = ''; }, 120); } }
        if (P <= 40) { lp.stop(); finish(); }
      });
      st.relLoop = lp;
    };
    $c('#htSys').onclick = () => { sys = Math.round(P); $c('#htSys').disabled = true; $c('#htSys').textContent = `Tâm thu: ${sys}`; NL.audio.play('click'); };
    $c('#htDia').onclick = () => { if (sys === null) return; dia = Math.round(P); $c('#htDia').disabled = true; $c('#htDia').textContent = `Tâm trương: ${dia}`; NL.audio.play('click'); if (st.relLoop) st.relLoop.stop(); finish(); };
    const finish = () => {
      if (phase === 'done') return; phase = 'done';
      st.measuring = false; P = 0; show(); card.remove();
      st.bpTxt.textContent = `${tSBP} / ${tDBP}`;
      const okS = sys !== null && Math.abs(sys - tSBP) <= 8, okD = dia !== null && Math.abs(dia - tDBP) <= 8;
      st.meas.push({ act: st.act, prof: st.prof, hr, sbp: tSBP, dbp: tDBP, emS: sys, emD: dia, min: +(st.held / 60).toFixed(1) });
      NL.game.toast(okS && okD ? `Chính xác! Huyết áp ${tSBP}/${tDBP} mmHg` : `Máy đo: ${tSBP}/${tDBP} mmHg. Em ghi: ${sys ?? '–'}/${dia ?? '–'}`);
      api.goto(3);
    };
  }

  function result() {
    const pts = k => st.log.map(r => [r[0], r[k]]);
    return {
      title: 'Nhịp tim và huyết áp khi vận động', param: st.meas.map(m => ACT[m.act].t.split(' ').slice(1, 3).join(' ')).join(', ') + ' · ' + PROF[st.prof].t,
      table: {
        head: ['Lần', 'Trạng thái', 'Luyện tập', 'Thời gian (phút)', 'HR (bpm)', 'SBP (mmHg)', 'DBP (mmHg)', 'R−R (s)', 'Em đo'],
        rows: st.meas.map((m, i) => [i + 1, ACT[m.act].t.split(' ').slice(1, 3).join(' '), PROF[m.prof].t, m.min, m.hr, m.sbp, m.dbp, (60 / m.hr).toFixed(2), `${m.emS ?? '–'}/${m.emD ?? '–'}`])
          .concat(st.rec3 ? [['', 'Hồi phục 3 phút', '', 3, `${st.peak} → ${st.rec3}`, '', '', '', '']] : [])
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
