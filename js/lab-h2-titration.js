// Thí nghiệm H2: chuẩn độ HCl (nồng độ ngẫu nhiên) bằng NaOH 0,100 M, chỉ thị phenolphthalein.
(function () {
  const A = NL.art;
  const CB = 0.1, VA = 10;          // NaOH 0,100 M; 10,00 mL HCl
  const FX = 430, FY = 470;          // bình tam giác
  const DROP = 0.05;                 // 1 giọt ≈ 0,05 mL
  let st;

  const pH = V => {
    const nA = st.C * VA, nB = CB * V, Vt = VA + V;
    if (Math.abs(nA - nB) < 1e-9) return 7;
    return nA > nB ? -Math.log10((nA - nB) / Vt) : 14 + Math.log10((nB - nA) / Vt);
  };
  // phenolphthalein: không màu dưới pH 8,2, hồng dần tới khoảng pH 12
  const pink = p => Math.max(0, Math.min(1, (p - 8.2) / 5));
  const fmt = (v, d) => v.toFixed(d === undefined ? 2 : d).replace('.', ',');

  function build(api) {
    const L = api.svg, el = api.el;
    st = { C: Math.round((0.08 + Math.random() * 0.07) * 1000) / 1000, V: 0, runs: [], tries: 0, curve: [] };
    st.Veq = st.C * VA / CB;
    // giá và buret
    el('rect', { x: 250, y: 455, width: 120, height: 14, rx: 5, fill: '#4A5A6A' }, L);
    el('rect', { x: 268, y: 60, width: 10, height: 400, fill: '#6B7B8B' }, L);
    el('rect', { x: 276, y: 150, width: 150, height: 10, rx: 4, fill: '#6B7B8B' }, L);
    const bu = api.g(L, FX, 0); st.bu = bu;
    el('rect', { x: -12, y: 70, width: 24, height: 270, rx: 4, fill: 'rgba(220,240,255,.35)', stroke: A.GLASS, 'stroke-width': 3 }, bu);
    st.buLiq = el('rect', { x: -9, y: 74, width: 18, height: 0, fill: 'rgba(170,200,255,.55)' }, bu);
    for (let v = 0; v <= 25; v += 5) { const y = 80 + v * 10; el('line', { x1: 12, x2: 22, y1: y, y2: y, stroke: '#2F6E9C', 'stroke-width': 2 }, bu); api.text(bu, 36, y + 5, String(v), 12, '#2F6E9C', 700); }
    el('path', { d: 'M-6 340 L6 340 L3 372 L-3 372 Z', fill: 'rgba(220,240,255,.6)', stroke: A.GLASS, 'stroke-width': 2 }, bu);
    st.tap = el('rect', { x: -22, y: 346, width: 44, height: 10, rx: 5, fill: '#E5534B' }, bu);
    api.text(bu, -70, 64, 'Buret NaOH 0,100 M', 14, '#6C88A3', 700);
    st.vTxt = api.text(L, FX + 160, 410, '', 20, '#1F4E79', 800);
    // bình tam giác
    const fl = api.g(L, FX, FY); st.fl = fl;
    st.flLiq = el('path', { d: 'M-52 -6 L-30 -40 L30 -40 L52 -6 Z', fill: 'rgba(220,240,255,.0)' }, fl);
    el('path', { d: 'M-14 -110 L-14 -70 L-58 -4 Q-60 4 -50 4 L50 4 Q60 4 58 -4 L14 -70 L14 -110', fill: 'rgba(220,240,255,.25)', stroke: A.GLASS, 'stroke-width': 3.5 }, fl);
    api.text(fl, 0, 30, 'Bình tam giác', 14, '#6C88A3', 700);
    // cốc HCl + pipette, lọ phenolphthalein
    const bk = api.g(L, 110, 470);
    el('path', { d: 'M-40 -80 L-36 0 L36 0 L40 -80', fill: 'rgba(220,240,255,.3)', stroke: A.GLASS, 'stroke-width': 3 }, bk);
    el('rect', { x: -35, y: -50, width: 70, height: 48, fill: 'rgba(200,230,250,.6)' }, bk);
    api.text(bk, 0, 26, 'HCl chưa biết nồng độ', 13, '#6C88A3', 700);
    st.pip = A.pipette(api, L, 110, 380, { len: 150 });
    st.ph = A.dropper(api, L, 215, 505, 'Phenol.', '#F4F0FF');
    st.lens = NL.chem.lens(api, L, 640, 170, 82, { title: '🔍 Kính lúp hạt: trong bình' }); st.lens.g.style.display = 'none';
  }
  function setFlask(V) {
    const p = pH(V), k = pink(p), lvl = 40 + Math.min(40, V * 1.3);
    st.flLiq.setAttribute('d', `M-52 -6 L${-52 + lvl * 0.6} ${-lvl} L${52 - lvl * 0.6} ${-lvl} L52 -6 Z`);
    st.flLiq.setAttribute('fill', k > 0 ? `rgba(245,${Math.round(205 - 130 * k)},${Math.round(225 - 50 * k)},${0.3 + 0.6 * k})` : 'rgba(220,240,255,.6)');
    st.buLiq.setAttribute('y', 74 + V * 10); st.buLiq.setAttribute('height', Math.max(0, 260 - V * 10));
    st.vTxt.textContent = `V = ${fmt(V)} mL`;
    const nA = st.C * VA, nB = CB * V, tot = nA, h = Math.max(0, nA - nB) / tot, oh = Math.max(0, nB - nA) / tot;
    st.lens.set([{ f: 'H⁺', n: Math.round(8 * h) }, { f: 'Cl⁻', n: 6 }, { f: 'Na⁺', n: Math.round(6 * Math.min(1.4, nB / tot)) }, { f: 'OH⁻', n: Math.min(5, Math.round(10 * oh)) }, { f: 'H₂O', n: Math.round(5 * Math.min(1, nB / tot)) }]);
  }
  function sideTable(api) {
    if (!st.tbl) st.tbl = api.table(['Lần', 'V NaOH (mL)']);
    st.tbl.set(st.runs.map((v, i) => [i + 1, fmt(v)]));
  }

  const steps = [
    {
      label: 'Chuẩn bị 1/3', text: 'Dùng pipette lấy 10,00 mL HCl cho vào bình tam giác', hint: 'Kéo pipette vào cốc HCl rồi sang bình tam giác',
      enter(api) {
        sideTable(api);
        api.card({ kicker: '🥽 An toàn', text: 'HCl và NaOH đều ăn da. Đeo kính bảo hộ, không hút pipette bằng miệng, dùng quả bóp cao su.', btn: 'Đã đeo kính ➜' });
        api.setOn(st.pip, true);
        api.draggable(st.pip, {
          target: { x: 110, y: 440, r: 80 }, onDrop: () => {
            st.pip.fill('rgba(200,230,250,.9)');
            api.setOn(st.pip, true);
            api.draggable(st.pip, { target: { x: FX, y: FY - 70, r: 90 }, onDrop: () => { st.pip.empty(); setFlask(0); api.tween(st.pip, 110, 380, 400); api.done(); } });
          }
        });
      }
    },
    {
      label: 'Chuẩn bị 2/3', text: 'Nhỏ 2 giọt phenolphthalein vào bình', hint: 'Kéo lọ phenolphthalein vào miệng bình tam giác',
      enter(api) {
        api.setOn(st.ph, true);
        api.draggable(st.ph, { target: { x: FX, y: FY - 140, r: 90 }, onDrop: () => {
          A.drop(api, api.svg, FX, FY - 120, FY - 40, '#F4F0FF', () => A.drop(api, api.svg, FX, FY - 120, FY - 40, '#F4F0FF', () => { api.tween(st.ph, 215, 505, 400); api.say('Dung dịch acid vẫn không màu'); api.done(); }));
        } });
      }
    },
    {
      label: 'Chuẩn bị 3/3', text: 'Chạm vào buret để nạp NaOH 0,100 M tới vạch 0', hint: 'Chạm vào buret',
      enter(api) {
        if (!api.prediction) api.ask({ predict: true, q: 'Nhỏ NaOH tới khi vừa trung hòa hết HCl, dung dịch có phenolphthalein sẽ có màu gì?', options: [{ t: 'Hồng nhạt' }, { t: 'Xanh lam' }, { t: 'Vẫn không màu' }, { t: 'Đỏ đậm' }] });
        api.setOn(st.bu, true);
        api.tapable(st.bu, () => { st.V = 0; setFlask(0); api.done(); });
      }
    },
    {
      label: () => `Lần chuẩn độ ${st.runs.length + 1}/3`, get text() { return st.V < st.Veq - 1.5 ? 'Mở khóa buret cho NaOH chảy vào, lắc đều bình' : 'Gần rồi! Nhỏ từng giọt tới khi dung dịch hồng nhạt bền khoảng 30 giây'; },
      hint: 'Lúc đầu dùng +1 mL. Thấy màu hồng xuất hiện rồi mất khi lắc là sắp tới điểm tương đương: chuyển sang nhỏ từng giọt',
      enter(api) { titrate(api); }
    },
    {
      label: () => `Lần chuẩn độ ${st.runs.length}/3 · xong`, text: '', hint: 'Bấm nút ở góc dưới để đi tiếp',
      enter(api) {
        sideTable(api);
        const need = 3 - st.runs.length;
        document.getElementById('stepText').textContent = need > 0 ? `Đã ghi ${fmt(st.runs[st.runs.length - 1])} mL. Làm thêm ${need} lần để lấy trung bình` : 'Đủ 3 lần! Giờ tính nồng độ HCl';
        api.done(need > 0 ? 'Chuẩn độ lần nữa ➜' : 'Tính nồng độ ➜');
      },
      onNext(api) { if (st.runs.length < 3) { st.V = 0; st.curve = []; setFlask(0); api.goto(3); } else api.goto(5); }
    },
    {
      label: 'Tính nồng độ', text: 'Tính nồng độ HCl rồi nhập vào ô bên phải', hint: 'C(HCl) = C(NaOH) × V(NaOH) ÷ V(HCl). Nhớ đổi cùng đơn vị mL',
      enter(api) { compute(api); }
    },
    {
      label: 'Kết quả', text: 'Đường pH theo thể tích NaOH lần chuẩn độ cuối', hint: 'pH tăng vọt quanh điểm tương đương',
      enter(api) { st.lens.g.style.display = 'none'; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Hồng nhạt', truth: 'vừa quá điểm tương đương một giọt, phenolphthalein chuyển hồng nhạt.',
          sub: 'Phenolphthalein không màu trong acid và trung tính, hồng khi pH trên khoảng 8,2. Hồng đậm nghĩa là đã cho dư NaOH khá nhiều.',
          result: result(),
          quiz: [{
            kicker: '❓ Vì sao?', q: 'Vì sao gần điểm tương đương phải nhỏ từng giọt?',
            options: [
              { t: 'Gần điểm tương đương, chỉ một giọt dư cũng làm pH tăng vọt', ok: true },
              { t: 'Để NaOH kịp nguội', why: 'Phản ứng trung hòa có tỏa nhiệt nhưng rất ít. Nhìn lại đồ thị pH quanh điểm tương đương nhé.' },
              { t: 'Vì buret chỉ cho nhỏ giọt ở cuối', why: 'Khóa buret mở to hay nhỏ đều được. Vấn đề nằm ở pH thay đổi thế nào.' }
            ],
            explain: 'Quanh điểm tương đương, pH nhảy từ khoảng 4 lên 10 chỉ trong vài giọt, nên nhỏ nhanh rất dễ quá tay.'
          }]
        });
      }
    }
  ];

  function titrate(api) {
    st.lens.g.style.display = '';
    setFlask(st.V);
    const d = api.panel(`<div>Khóa buret</div><div class="l3-btns"><button class="btn small pop" data-v="1">+1 mL</button><button class="btn small pop" data-v="0.5">+0,5 mL</button><button class="btn small pop" data-v="${DROP}">+1 giọt</button></div><button class="btn small ghost pop" data-stop="1">✋ Dừng, ghi số</button>`);
    st.ctl = d;
    d.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => add(api, +b.dataset.v)));
    d.querySelector('[data-stop]').addEventListener('click', () => stop(api));
  }
  function add(api, dv) {
    NL.audio.play('drop');
    A.drop(api, api.svg, FX, 380, FY - 45, 'rgba(170,200,255,.9)');
    st.V = Math.round((st.V + dv) * 100) / 100; st.curve.push([st.V, +pH(st.V).toFixed(2)]);
    setFlask(st.V);
    api.say(steps[3].text);
    // trước điểm tương đương: chỗ giọt rơi thoáng hồng rồi mất khi lắc
    if (st.V < st.Veq && st.V > st.Veq - 1.5) {
      const fl = api.el('ellipse', { cx: FX, cy: FY - 30, rx: 22, ry: 8, fill: 'rgba(240,110,170,.7)' }, api.svg);
      let a = 0.7; api.loop(dt => { a -= dt * 0.8; fl.setAttribute('opacity', Math.max(0, a)); if (a <= 0) { fl.remove(); return false; } });
    }
    if (st.V - st.Veq > 0.15) {
      st.ctl.remove();
      api.lesson({ title: 'Mở khóa buret quá tay, vượt điểm tương đương', text: `Dung dịch hồng đậm rồi! Em đã cho dư khoảng ${fmt(st.V - st.Veq, 1)} mL NaOH nên số đo không còn đúng.`, sub: 'Bài học: gần điểm tương đương (khi màu hồng thoáng hiện rồi mất) phải chuyển sang nhỏ từng giọt. Làm lại với bình mới nhé.' }, () => { st.V = 0; st.curve = []; api.goto(3); });
    }
  }
  function stop(api) {
    if (pH(st.V) < 8.2) {
      api.lesson({ title: 'Dừng chuẩn độ khi chưa đổi màu', text: 'Dung dịch vẫn chưa có màu hồng, tức là acid chưa được trung hòa hết.', sub: 'Bài học: chỉ dừng khi màu hồng nhạt xuất hiện và bền khoảng 30 giây. Nhỏ tiếp nhé.', btn: 'Nhỏ tiếp ➜' });
      return;
    }
    st.ctl.remove(); st.runs.push(st.V); st.last = st.curve.slice(); NL.audio.play('ting');
    api.goto(4);
  }
  function compute(api) {
    const mean = st.runs.reduce((a, b) => a + b, 0) / st.runs.length;
    st.mean = mean;
    const d = api.panel(`<div>V(NaOH) trung bình = <b>${fmt(mean)}</b> mL</div><div style="margin:4px 0">${NL.learn.decorate('C(HCl) = C(NaOH) × V(NaOH) ÷ V(HCl)')}</div><div class="big-num"><input class="num-in" type="number" step="0.001" min="0" max="1" placeholder="0,000"> <small>M</small></div><button class="btn small pop">Kiểm tra</button>`);
    st.cctl = d;
    d.querySelector('.btn').addEventListener('click', () => {
      const v = parseFloat(String(d.querySelector('.num-in').value).replace(',', '.')), ref = CB * mean / VA;
      if (v > 0 && Math.abs(v - ref) / ref <= 0.02) {
        st.answer = v; d.remove(); NL.audio.play('success');
        api.card({ kicker: '🎯 Chính xác', text: `C(HCl) ≈ ${fmt(ref, 3)} M. Nồng độ thật của dung dịch là ${fmt(st.C, 3)} M, sai số ${fmt(Math.abs(ref - st.C) / st.C * 100, 1)}%.` }, () => api.goto(6));
      } else {
        api.lesson({ title: 'Tính sai nồng độ ở lần đầu', text: `Chưa đúng. Em nhập ${isNaN(v) ? 'chưa có số' : fmt(v, 3) + ' M'}.`, sub: `Thay số: 0,100 × ${fmt(mean)} ÷ 10,00. Thể tích cả hai đều tính bằng mL nên không cần đổi đơn vị.`, btn: 'Tính lại ➜' });
      }
    });
  }
  // tự động khi kiểm thử
  function auto(api) {
    if (st.ctl && st.ctl.isConnected) { if (st.V < st.Veq - 0.6) add(api, 1); else if (pH(st.V) < 8.2) add(api, DROP); else stop(api); return 'titrate'; }
    if (st.cctl && st.cctl.isConnected) { st.cctl.querySelector('.num-in').value = (CB * st.mean / VA).toFixed(3); st.cctl.querySelector('.btn').click(); return 'compute'; }
    return false;
  }

  function result() {
    const mean = st.mean || 0;
    return {
      title: 'Chuẩn độ acid – base', param: 'NaOH 0,100 M, 10,00 mL HCl, phenolphthalein',
      table: { head: ['Lần', 'V NaOH (mL)', 'V HCl (mL)', 'C NaOH (M)'], rows: st.runs.map((v, i) => [i + 1, v, VA, CB]).concat([['Trung bình', +mean.toFixed(2), VA, CB], ['C HCl em tính (M)', st.answer || '', '', ''], ['C HCl thật (M)', st.C, '', '']]) },
      chart: { type: 'line', title: 'pH theo thể tích NaOH', xLabel: 'V NaOH (mL)', yLabel: 'pH', yMax: 14, series: [{ name: 'pH', color: '#E86A92', points: (st.last || st.curve).length ? (st.last || st.curve) : [[0, 1]] }] },
      conclusion: 'Ở điểm tương đương, số mol NaOH bằng số mol HCl: C(HCl) × V(HCl) = C(NaOH) × V(NaOH). Phenolphthalein chuyển hồng nhạt khi vừa dư một giọt NaOH, báo điểm dừng',
      note: 'Làm 3 lần, các lần lệch nhau không quá 0,10 mL rồi lấy trung bình để giảm sai số.'
    };
  }

  NL.lab.register('H2', { goal: 'Chỉ dùng NaOH đã biết nồng độ và vài giọt chỉ thị, làm sao tìm ra nồng độ HCl?', build, steps, auto });
})();
