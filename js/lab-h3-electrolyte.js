// Thí nghiệm H3: thử tính dẫn điện bằng đèn LED để phân biệt chất điện li mạnh, yếu và không điện li.
(function () {
  const A = NL.art;
  // dòng điện mô phỏng (mA) với dung dịch 0,1 M, nguồn 6 V; kind: mạnh / yếu / không
  const SOL = {
    NaCl: { t: 'NaCl 0,1 M', kind: 'Điện li mạnh', mA: 12, col: 'rgba(200,230,250,.6)', p: [{ f: 'Na⁺', n: 6 }, { f: 'Cl⁻', n: 6 }, { f: 'H₂O', n: 4 }] },
    HCl: { t: 'HCl 0,1 M', kind: 'Điện li mạnh', mA: 30, col: 'rgba(205,232,250,.6)', p: [{ f: 'H⁺', n: 6 }, { f: 'Cl⁻', n: 6 }, { f: 'H₂O', n: 4 }] },
    AcOH: { t: 'CH₃COOH 0,1 M', kind: 'Điện li yếu', mA: 0.6, col: 'rgba(250,240,215,.6)', p: [{ f: 'CH₃COOH', n: 8 }, { f: 'H⁺', n: 1 }, { f: 'CH₃COO⁻', n: 1 }, { f: 'H₂O', n: 3 }] },
    Sug: { t: 'Đường 0,1 M', kind: 'Không điện li', mA: 0.002, col: 'rgba(250,245,225,.6)', p: [{ f: 'C₁₂H₂₂O₁₁', n: 6 }, { f: 'H₂O', n: 6 }] },
    W: { t: 'Nước cất', kind: 'Không điện li', mA: 0.001, col: 'rgba(220,240,255,.5)', p: [{ f: 'H₂O', n: 12 }] }
  };
  const KEYS = Object.keys(SOL), BX = k => 110 + k * 105, BY = 470;
  let st;

  function build(api) {
    const L = api.svg, el = api.el;
    st = { cur: null, done: {}, dirty: false, last: null, rows: [], on: false };
    // cốc
    st.beakers = KEYS.map((k, i) => {
      const g = api.g(L, BX(i), BY);
      el('path', { d: 'M-38 -90 L-34 0 L34 0 L38 -90', fill: 'rgba(220,240,255,.25)', stroke: A.GLASS, 'stroke-width': 3 }, g);
      el('rect', { x: -33, y: -60, width: 66, height: 58, fill: SOL[k].col }, g);
      api.text(g, 0, 24, SOL[k].t, 12, '#1F4E79', 800);
      return g;
    });
    // giá điện cực, dây, pin, LED
    const pr = api.g(L, 640, 170); st.probe = pr;
    el('rect', { x: -44, y: -14, width: 88, height: 20, rx: 6, fill: '#4A5A6A' }, pr);
    el('rect', { x: -26, y: 6, width: 10, height: 120, rx: 3, fill: '#333' }, pr); el('rect', { x: 16, y: 6, width: 10, height: 120, rx: 3, fill: '#333' }, pr);
    api.text(pr, 0, -22, 'Điện cực than chì', 13, '#6C88A3', 700);
    st.wire = el('path', { d: '', stroke: '#E5534B', 'stroke-width': 3, fill: 'none' }, L);
    const bat = api.g(L, 480, 70);
    el('rect', { x: -40, y: -18, width: 80, height: 36, rx: 6, fill: '#2F80C0' }, bat); api.text(bat, 0, 6, 'Pin 6 V', 14, '#fff', 800);
    const led = api.g(L, 720, 70); st.led = led;
    st.glow = el('circle', { r: 46, fill: '#FFE14D', opacity: 0 }, led);
    st.bulb = el('path', { d: 'M-14 10 L-14 -8 A14 14 0 0 1 14 -8 L14 10 Z', fill: '#E8E8E8', stroke: '#999', 'stroke-width': 2 }, led);
    el('rect', { x: -16, y: 10, width: 32, height: 8, fill: '#777' }, led); api.text(led, 0, 44, 'Đèn LED', 13, '#6C88A3', 700);
    st.sw = api.g(L, 600, 70);
    el('circle', { r: 16, fill: '#E5534B', stroke: '#fff', 'stroke-width': 3 }, st.sw); api.text(st.sw, 0, 6, '⏻', 15, '#fff', 800);
    st.mA = api.text(L, 720, 150, '', 16, '#1F4E79', 800);
    // bình tia nước cất
    st.wash = api.g(L, 640, 480); st.wash.style.display = 'none';
    el('path', { d: 'M-22 0 L-22 -60 Q0 -76 22 -60 L22 0 Z', fill: 'rgba(220,240,255,.6)', stroke: A.GLASS, 'stroke-width': 3 }, st.wash);
    el('path', { d: 'M8 -70 L30 -100', stroke: '#8FBBD8', 'stroke-width': 4 }, st.wash);
    api.text(st.wash, 0, 20, 'Bình tia nước cất', 12, '#6C88A3', 700);
    st.lens = NL.chem.lens(api, L, 130, 150, 78, { title: '🔍 Kính lúp hạt: trong cốc' }); st.lens.g.style.display = 'none';
    wires();
  }
  function wires() {
    const p = st.probe;
    st.wire.setAttribute('d', `M 440 70 L 380 70 L 380 40 L 800 40 L 800 70 L 736 70 M 704 70 L 616 70 M 584 70 L 520 70 M ${p._x - 21} ${p._y - 4} C ${p._x - 60} ${p._y - 60}, 400 120, 380 70 M ${p._x + 21} ${p._y - 4} C ${p._x + 60} ${p._y - 60}, 810 120, 800 70`);
  }
  function setLed(mA) {
    const b = mA <= 0.01 ? 0 : Math.min(1, Math.log10(mA * 100 + 1) / 3.5);
    st.glow.setAttribute('opacity', (b * 0.8).toFixed(2));
    st.bulb.setAttribute('fill', b > 0 ? `rgb(255,${Math.round(240 - 30 * b)},${Math.round(150 - 100 * b)})` : '#E8E8E8');
    st.mA.textContent = st.on ? (mA < 0.01 ? '≈ 0 mA' : (mA < 1 ? mA.toFixed(2) : mA.toFixed(0)).replace('.', ',') + ' mA') : '';
    return b;
  }
  function sideTable(api) {
    if (!st.tbl) st.tbl = api.table(['Dung dịch', 'Đèn', 'Em xếp vào']);
    st.tbl.set(st.rows.map(r => [SOL[r.k].t, r.b > 0.6 ? 'Sáng rõ' : r.b > 0.05 ? 'Sáng yếu' : 'Tắt', r.em]));
  }

  const steps = [
    {
      label: 'Chuẩn bị', text: 'Bật công tắc để nối pin, đèn LED và hai điện cực', hint: 'Chạm nút đỏ',
      enter(api) {
        sideTable(api);
        if (!api.prediction) api.ask({ predict: true, q: 'Nhúng hai điện cực vào nước cất. Em đoán đèn LED sẽ…?', options: [{ t: 'Sáng mạnh' }, { t: 'Sáng yếu' }, { t: 'Không sáng' }] });
        api.setOn(st.sw, true);
        api.tapable(st.sw, () => { st.on = true; NL.audio.play('hum'); setLed(0); api.say('Hai điện cực đang ở ngoài không khí: đèn tắt'); api.done(); });
      }
    },
    {
      label: () => `Cốc ${Object.keys(st.done).length + 1}/5`, text: 'Chọn cốc rồi kéo hai điện cực nhúng vào', hint: 'Chọn tên cốc bên phải, rồi kéo giá điện cực vào cốc đó',
      enter(api) {
        const left = KEYS.filter(k => !st.done[k]);
        if (!st.cur || st.done[st.cur]) st.cur = left[0];
        st.pick = api.choices({ label: 'Nhúng vào cốc', items: left.map(k => ({ t: SOL[k].t, v: k })), value: st.cur, onPick(v) { st.cur = v; target(api); } });
        target(api);
      }
    },
    {
      label: () => `Cốc ${Object.keys(st.done).length + 1}/5 · Xếp loại`, text: 'Nhìn đèn và kính lúp hạt, rồi xếp loại chất', hint: 'Đèn sáng rõ, sáng yếu hay tắt?',
      enter(api) {
        const k = st.cur, s = SOL[k];
        api.ask({
          q: `Đèn ${st.b > 0.6 ? 'sáng rõ' : st.b > 0.05 ? 'sáng yếu' : 'không sáng'} với ${s.t}. Chất này là gì?`,
          options: ['Điện li mạnh', 'Điện li yếu', 'Không điện li'].map(t => ({ t, ok: t === s.kind, why: 'Nhìn kính lúp hạt: có nhiều ion, ít ion hay không có ion?' })),
          explain: { 'Điện li mạnh': 'Tan trong nước phân li hoàn toàn thành ion, nhiều ion mang điện nên đèn sáng rõ.', 'Điện li yếu': 'Chỉ một phần nhỏ phân tử phân li thành ion, ít ion nên đèn sáng yếu.', 'Không điện li': 'Tan trong nước nhưng không tạo ion, không có hạt mang điện nên đèn tắt.' }[s.kind]
        }, r => {
          st.rows.push({ k, b: st.b, mA: s.mA, em: r.answer }); st.done[k] = 1; sideTable(api);
          if (Object.keys(st.done).length >= KEYS.length) { api.goto(4); return; }
          api.goto(3);
        });
      }
    },
    {
      label: 'Trước cốc tiếp theo', text: 'Rửa điện cực bằng nước cất, hoặc đo tiếp luôn', hint: 'Chạm bình tia nước cất để rửa. Bấm Đo tiếp luôn nếu em muốn bỏ qua',
      enter(api) {
        api.tween(st.probe, 640, 300, 400, wires);
        st.wash.style.display = ''; api.setOn(st.wash, true);
        st.dirty = !['Sug', 'W'].includes(st.last);
        api.tapable(st.wash, () => { st.dirty = false; NL.audio.play('bubble'); api.say('Đã rửa sạch điện cực'); st.wash.style.display = 'none'; skip.remove(); api.done('Đo cốc tiếp ➜'); });
        const skip = api.panel('<button class="btn small ghost pop">Đo tiếp luôn ➜</button>');
        skip.querySelector('button').addEventListener('click', () => { skip.remove(); st.wash.style.display = 'none'; api.goto(1); });
        st.skipBtn = skip;
      },
      onNext(api) { api.goto(1); }
    },
    {
      label: 'Kết quả', text: 'Dòng điện qua từng dung dịch', hint: 'Cột càng cao, dung dịch càng nhiều ion',
      enter(api) { st.lens.g.style.display = 'none'; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Không sáng', truth: 'nước cất gần như không có ion nên đèn không sáng.',
          sub: 'Nước máy, nước tay ướt có hòa tan muối khoáng nên có ion và dẫn điện. Vì vậy tay ướt chạm điện vẫn rất nguy hiểm.',
          result: result(),
          quiz: [{
            kicker: '❓ Vì sao?', q: 'Vì sao dung dịch đường không làm đèn sáng dù đường tan rất tốt?',
            options: [
              { t: 'Đường tan dưới dạng phân tử, không tạo ra ion', ok: true },
              { t: 'Đường quá ngọt nên cản dòng điện', why: 'Vị ngọt không liên quan tới dòng điện. Nhìn kính lúp: trong cốc đường có ion không?' },
              { t: 'Dung dịch đường chưa đủ đặc', why: 'Đường đặc hơn nữa đèn vẫn tắt. Cần hạt mang điện để dẫn điện.' }
            ],
            explain: 'Muốn dẫn điện phải có hạt mang điện chuyển động tự do. Đường tan thành các phân tử trung hòa nên không dẫn điện.'
          }]
        });
      }
    }
  ];

  function target(api) {
    const i = KEYS.indexOf(st.cur);
    api.setOn(st.probe, true);
    api.draggable(st.probe, { target: { x: BX(i), y: BY - 170, r: 70, sx: BX(i), sy: BY - 160 }, onMove: wires, onDrop: () => { st.pick.remove(); wires(); dip(api); } });
  }
  function dip(api) {
    const k = st.cur, s = SOL[k];
    let mA = s.mA;
    const contaminated = st.dirty && ['Sug', 'W'].includes(k);
    if (contaminated) mA = 0.15;
    st.lens.g.style.display = ''; st.lens.set(contaminated ? s.p.concat([{ f: 'Na⁺', n: 1 }, { f: 'Cl⁻', n: 1 }]) : s.p);
    st.b = setLed(mA); NL.audio.play(st.b > 0.05 ? 'ting' : 'click');
    wires();
    if (contaminated) {
      setTimeout(() => api.lesson({ title: 'Không rửa điện cực giữa hai cốc', text: `Ơ, ${s.t} mà đèn lại hơi sáng! Điện cực còn dính dung dịch của cốc trước nên mang ion sang cốc này.`, sub: 'Bài học: rửa điện cực bằng nước cất trước khi nhúng sang cốc mới, nếu không kết quả sẽ sai.', btn: '🚿 Rửa rồi đo lại' }, () => { st.dirty = false; st.b = setLed(s.mA); st.lens.set(s.p); api.goto(2); }), 700);
      return;
    }
    st.last = k;
    api.wait(1.2, () => api.goto(2));
  }

  function result() {
    const rows = KEYS.filter(k => st.rows.some(r => r.k === k)).map(k => st.rows.find(r => r.k === k));
    return {
      title: 'Chất điện li mạnh, yếu và không điện li', param: '5 dung dịch 0,1 M, nguồn 6 V, đèn LED',
      table: { head: ['Lần', 'Dung dịch', 'Dòng điện (mA, mô phỏng)', 'Đèn', 'Loại chất', 'Em xếp vào'], rows: rows.map((r, i) => [i + 1, SOL[r.k].t, SOL[r.k].mA, r.b > 0.6 ? 'Sáng rõ' : r.b > 0.05 ? 'Sáng yếu' : 'Tắt', SOL[r.k].kind, r.em]) },
      chart: { labels: rows.map(r => SOL[r.k].t), yLabel: 'Dòng điện (mA)', series: [{ name: 'Dòng điện', color: '#F2C230', values: rows.map(r => SOL[r.k].mA) }] },
      conclusion: 'Chất điện li mạnh (NaCl, HCl) phân li hoàn toàn thành ion nên dẫn điện tốt. Chất điện li yếu (CH₃COOH) chỉ phân li một phần nên dẫn điện kém. Đường và nước cất không tạo ion nên gần như không dẫn điện',
      note: 'HCl dẫn điện tốt hơn NaCl cùng nồng độ vì ion H⁺ di chuyển rất nhanh trong nước.'
    };
  }
  function auto(api) {
    if (st.skipBtn && st.skipBtn.isConnected) { st.wash._tapCb && st.wash._on && (api.setOn(st.wash, false), st.wash._tapCb(st.wash)); return 'wash'; }
    return false;
  }

  NL.lab.register('H3', { goal: 'Vì sao có dung dịch làm đèn sáng rõ, có dung dịch làm đèn tắt?', build, steps, auto });
})();
