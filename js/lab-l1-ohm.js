// Thí nghiệm L1: định luật Ohm. Vặn U, đo I, vẽ đồ thị I(U); cấp đúng 1,5 A cho cánh tay robot.
(function () {
  const P = NL.phys, vn = P.vn;
  const CORES = { 5: '5 Ω', 10: '10 Ω', 15: '15 Ω' }, COL = { 5: '#E5534B', 10: '#2F80C0', 15: '#3FB37F', x: '#9B6BD6' };
  const I_MAX = 3;
  let st;

  function build(api) {
    const L = api.svg, el = api.el;
    st = { U: 3, core: 10, R: 10, K: false, amm: null, fuse: true, I: 0, over: 0, rows: [], rx: [6, 8, 12, 18][Math.floor(Math.random() * 4)], Um: 0, Im: 0, okT: 0, busy: false };
    // dây nối: + → cầu chì → ampe kế → khóa K → robot → lõi điện trở → −
    const wire = 'M190 220 L240 220 L240 80 L680 80 L680 200 M680 290 L560 290 M360 290 L190 290';
    el('path', { d: wire, stroke: '#E5534B', 'stroke-width': 5, fill: 'none', 'stroke-linejoin': 'round' }, L);
    // nguồn DC
    const sup = api.g(L, 110, 255);
    el('rect', { x: -80, y: -70, width: 160, height: 140, rx: 14, fill: '#4A5A6A' }, sup);
    el('rect', { x: -62, y: -54, width: 124, height: 46, rx: 6, fill: '#1B2833' }, sup);
    st.uTxt = api.text(sup, 0, -20, '3,0 V', 30, '#FF5A4A', 800);
    api.text(sup, -10, 30, 'Nguồn DC', 15, '#fff', 800); api.text(sup, -10, 52, '0 – 24 V', 13, '#C9D8E6', 700);
    api.text(sup, 66, -26, '+', 22, '#FF8A80', 800); api.text(sup, 66, 46, '−', 26, '#9EC5FF', 800);
    // cầu chì
    st.fuseG = api.g(L, 240, 150);
    el('rect', { x: -12, y: -26, width: 24, height: 52, rx: 8, fill: 'rgba(220,240,255,.7)', stroke: '#8FBBD8', 'stroke-width': 3 }, st.fuseG);
    st.fuseWire = el('line', { x1: 0, y1: -24, x2: 0, y2: 24, stroke: '#B8860B', 'stroke-width': 2.5 }, st.fuseG);
    api.text(st.fuseG, -32, 5, 'Cầu chì 3 A', 12, '#6C88A3', 700).setAttribute('text-anchor', 'end');
    // lõi điện trở trong ống thủy tinh
    const core = api.g(L, 460, 290);
    el('rect', { x: -100, y: -26, width: 200, height: 52, rx: 26, fill: 'rgba(220,240,255,.35)', stroke: '#8FBBD8', 'stroke-width': 3 }, core);
    let d = 'M-90 0'; for (let k = 0; k < 18; k++) d += ` L${-85 + k * 10} ${k % 2 ? 14 : -14}`; d += ' L90 0';
    st.coil = el('path', { d, fill: 'none', stroke: '#8A8F96', 'stroke-width': 4, 'stroke-linejoin': 'round' }, core);
    st.coreTxt = api.text(core, 0, 52, 'Lõi điện trở 10 Ω', 15, '#1F4E79', 800);
    st.coreG = core;
    // vôn kế song song với lõi
    el('path', { d: 'M360 290 L360 200 L406 200 M560 290 L560 200 L514 200', stroke: '#5B6B7B', 'stroke-width': 3, fill: 'none' }, L);
    st.V = P.meter(api, L, 460, 185, { label: 'Vôn kế', sym: 'V', unit: 'V', max: 25, r: 48, d: 1 });
    // chỗ mắc ampe kế: nối tiếp (trên dây) hoặc song song (sai)
        st.parLeads = el('path', { d: 'M360 290 L360 420 L406 420 M560 290 L560 420 L514 420', stroke: '#5B6B7B', 'stroke-width': 3, fill: 'none' }, L);
    st.parLeads.style.display = 'none';
    st.A = P.meter(api, L, 330, 84, { label: 'Ampe kế', sym: 'A', unit: 'A', max: 3.5, danger: 3, r: 48 });
    st.A.style.display = 'none';
    // khóa K
    st.sw = api.g(L, 540, 80);
    el('circle', { cx: -34, r: 9, fill: '#4A5A6A' }, st.sw); el('circle', { cx: 34, r: 9, fill: '#4A5A6A' }, st.sw);
    el('rect', { x: -48, y: -6, width: 96, height: 30, fill: '#E9DCC0', opacity: 0 }, st.sw);
    st.blade = el('line', { x1: -34, y1: 0, x2: 34, y2: 0, stroke: '#C9A227', 'stroke-width': 7, 'stroke-linecap': 'round', transform: 'rotate(-40 -34 0)' }, st.sw);
    el('circle', { cx: 30, cy: 0, r: 8, fill: '#E5534B', transform: 'rotate(-40 -34 0)' }, st.sw).setAttribute('class', 'k-knob');
    st.kTxt = api.text(st.sw, 0, -22, 'Khóa K: mở', 14, '#1F4E79', 800);
    // cánh tay robot
    const rb = api.g(L, 700, 330); st.rb = rb;
    el('ellipse', { cx: 0, cy: 0, rx: 70, ry: 16, fill: '#3A4652' }, rb);
    el('rect', { x: -40, y: -150, width: 80, height: 150, rx: 18, fill: '#7D8B99' }, rb);
    st.coreLamp = el('circle', { cx: 0, cy: -110, r: 20, fill: '#38424C', stroke: '#C9D8E6', 'stroke-width': 4 }, rb);
    el('rect', { x: -36, y: -66, width: 72, height: 26, rx: 6, fill: '#1B2833' }, rb);
    st.scr = api.text(rb, 0, -48, 'TẮT', 11, '#7CF29B', 800);
    st.arm1 = api.g(rb, 10, -150); st.arm1._extra = ' rotate(-75)';
    el('rect', { x: 0, y: -12, width: 90, height: 24, rx: 12, fill: '#F2C230' }, st.arm1);
    st.arm2 = api.g(st.arm1, 88, 0); st.arm2._extra = ' rotate(-70)';
    el('rect', { x: 0, y: -9, width: 70, height: 18, rx: 9, fill: '#F2A930' }, st.arm2);
    el('path', { d: 'M70 -14 L88 -20 M70 14 L88 20', stroke: '#4A5A6A', 'stroke-width': 6, 'stroke-linecap': 'round' }, st.arm2);
    api.place(st.arm1); api.place(st.arm2);
    api.text(rb, 0, 40, 'Mecha-Arm', 14, '#1F4E79', 800);
    // electron chạy từ cực âm qua mạch về cực dương
    st.flow = P.flow(api, L, 'M190 290 L560 290 L680 290 L680 80 L240 80 L240 220 L190 220', 30, '#4FE3FF');
    st.flow.show(false);
    api.loop(tick);
  }

  function setAmm(where) {
    st.amm = where;
    st.A.style.display = '';
    api_.place(st.A, where === 'ser' ? 330 : 460, where === 'ser' ? 84 : 432);
    st.parLeads.style.display = where === 'par' ? '' : 'none';
  }
  let api_;
  function setK(on) {
    st.K = on;
    st.blade.setAttribute('transform', on ? '' : 'rotate(-40 -34 0)');
    st.sw.querySelector('.k-knob').setAttribute('transform', on ? '' : 'rotate(-40 -34 0)');
    st.kTxt.textContent = 'Khóa K: ' + (on ? 'đóng' : 'mở');
    NL.audio.play('click');
  }
  function Rnow() { return st.amm === 'par' ? 0.05 : st.R; }
  let sampleT = 0, sw = 0;
  function tick(dt) {
    st.I = st.K && st.fuse ? st.U / Rnow() : 0;
    const I = st.amm === 'par' ? 0 : st.I; // ampe kế song song chỉ nhận một phần rất lớn, nhưng mình cho cháy cầu chì trước
    sampleT -= dt;
    if (sampleT <= 0) {
      sampleT = 0.3;
      const live = st.K && st.fuse;
      st.Um = live ? Math.max(0, P.measure(st.U, 0.015, 0.1)) : 0;
      st.Im = live ? Math.max(0, P.measure(I, 0.02, 0.02)) : 0;
      st.V.set(st.Um, vn(st.Um, 1) + ' V'); st.A.set(st.Im, vn(st.Im, 2) + ' A');
    }
    st.flow.show(st.K && st.fuse && st.I > 0); st.flow.speed(Math.min(st.I, 6) * 70);
    // cuộn dây nóng dần theo P = I²R
    const heat = Math.min(1, st.I * st.I * st.R / 60);
    st.coil.setAttribute('stroke', heat < 0.02 ? '#8A8F96' : `rgb(${140 + 115 * heat | 0},${143 - 40 * heat + 60 * Math.max(0, heat - 0.6) | 0},${150 - 130 * heat | 0})`);
    // robot
    const Ir = st.I;
    let lamp = '#38424C', txt = 'TẮT';
    if (Ir > 0 && Ir < 1.45) { lamp = '#3D7BD9'; txt = 'LOW POWER'; }
    else if (Ir >= 1.45 && Ir <= 1.55) { lamp = '#00FF88'; txt = 'ĐỦ 1,5 A'; }
    else if (Ir > 1.55) { lamp = '#FFB020'; txt = 'QUÁ MẠNH'; }
    st.coreLamp.setAttribute('fill', lamp); st.scr.textContent = st.fuse ? txt : 'HỎNG';
    sw += dt;
    if (st.fuse && Ir > 0 && Ir < 1.45) { st.arm1._extra = ` rotate(${-75 + Math.sin(sw * 30) * 1.2})`; api_.place(st.arm1); }
    // quá tải: cháy cầu chì
    if (st.fuse && st.I > I_MAX) { st.over += dt; if (st.over > 0.5 || st.amm === 'par') blow(); } else st.over = 0;
    if (st.onTick) st.onTick(dt);
  }
  function blow() {
    st.fuse = false; st.over = 0;
    const api = api_;
    st.fuseWire.setAttribute('y2', -6); st.fuseWire.setAttribute('stroke', '#333');
    P.spark(api, api.svg, 240, 150); P.smoke(api, api.svg, 460, 270); P.alarm(api);
    st.arm1._extra = ' rotate(10)'; st.arm2._extra = ' rotate(70)'; api.place(st.arm1); api.place(st.arm2);
    const par = st.amm === 'par';
    setTimeout(() => api.lesson(par ? {
      title: 'Mắc ampe kế song song làm chập mạch',
      text: 'Bụp! Ampe kế có điện trở rất nhỏ. Mắc song song với lõi thì dòng điện đi tắt qua ampe kế, gần như không có gì cản, nên dòng vọt lên và cầu chì cháy.',
      sub: 'Bài học: ampe kế luôn mắc nối tiếp. Vôn kế mới mắc song song.', btn: '🔧 Thay cầu chì, mắc lại'
    } : {
      title: 'Dòng điện vượt 3 A làm cháy cầu chì',
      text: `Bụp! Dòng điện lên tới ${vn(st.I, 1)} A, vượt mức 3 A mà cầu chì chịu được. Cầu chì đứt để cứu robot.`,
      sub: `Bài học: tính trước bằng I = U/R. Với lõi ${vn(st.R)} Ω, U chỉ được tới ${vn(3 * st.R)} V. Công suất tỏa nhiệt P = I²R tăng rất nhanh khi I lớn.`, btn: '🔧 Thay cầu chì, làm lại'
    }, () => fix(par)), 900);
  }
  function fix(par) {
    st.fuse = true; st.fuseWire.setAttribute('y2', 24); st.fuseWire.setAttribute('stroke', '#B8860B');
    st.arm1._extra = ' rotate(-75)'; st.arm2._extra = ' rotate(-70)'; api_.place(st.arm1); api_.place(st.arm2);
    if (st.uCtl) st.uCtl.set(0); else setU(0);
    if (par) { setK(false); api_.goto(0); }
  }
  function setU(v) { st.U = v; st.uTxt.textContent = vn(v, 1) + ' V'; }
  function setCore(k) {
    st.core = k; st.R = k === 'x' ? st.rx : k;
    st.coreTxt.textContent = k === 'x' ? 'Lõi bí ẩn Rₓ' : 'Lõi điện trở ' + k + ' Ω';
  }
  function controls(api, coresAllowed) {
    if (coresAllowed) st.coreCtl = api.choices({ label: 'Chọn lõi', items: coresAllowed.map(k => ({ t: k === 'x' ? 'Lõi bí ẩn' : CORES[k], v: k })), value: st.core, onPick(v) { setCore(v); if (st.uCtl) st.uCtl.set(0); } });
    st.uCtl = api.slider({ label: 'Hiệu điện thế nguồn U', min: 0, max: 24, step: 0.5, value: st.U, unit: 'V', onInput(v, c) { setU(v); c.warn(st.R && v / st.R > I_MAX && st.K ? '⚠ I sẽ vượt 3 A' : ''); } });
  }
  function sideTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['Lõi', 'U (V)', 'I (A)', 'U/I (Ω)']);
    st.tbl.set(st.rows.slice(-7).map(r => [r.core === 'x' ? 'Rₓ' : r.core + ' Ω', vn(r.U, 1), vn(r.I, 2), r.I ? vn(r.U / r.I, 1) : '—']));
  }
  function record(api) {
    if (!st.K || !st.fuse) { NL.game.toast('Đóng khóa K trước đã'); return false; }
    if (st.Im <= 0) { NL.game.toast('Chưa có dòng điện. Tăng U lên một chút'); return false; }
    if (st.rows.some(r => r.core === st.core && Math.abs(r.U - st.U) < 0.01)) { NL.game.toast('Mức U này đã ghi rồi. Đổi sang U khác nhé'); return false; }
    st.rows.push({ core: st.core, Uset: st.U, U: st.Um, I: st.Im }); sideTable(api); NL.audio.play('ting');
    return true;
  }

  const steps = [
    {
      label: 'Lắp mạch', text: 'Chọn chỗ mắc ampe kế, rồi chạm khóa K để đóng mạch', hint: 'Chọn một chỗ mắc ở cột phải, rồi chạm vào khóa K',
      enter(api) {
        api_ = api;
        if (!api.prediction) api.ask({ predict: true, q: 'Giữ nguyên lõi 10 Ω. Tăng hiệu điện thế U lên gấp đôi thì cường độ dòng điện I sẽ…?', options: [{ t: 'Tăng gấp đôi' }, { t: 'Không đổi' }, { t: 'Giảm một nửa' }, { t: 'Tăng gấp bốn' }] });
        setK(false); st.amm = null; st.A.style.display = 'none'; st.parLeads.style.display = 'none';
        api.choices({ label: 'Mắc ampe kế', items: [{ t: 'Nối tiếp với lõi', v: 'ser' }, { t: 'Song song với lõi', v: 'par' }], value: null, onPick(v) { setAmm(v); api.setOn(st.sw, true); } });
        api.tapable(st.sw, () => {
          if (!st.amm) { api.setOn(st.sw, true); NL.game.toast('Chọn chỗ mắc ampe kế trước'); return; }
          setK(true);
          if (st.amm === 'ser') { api.say('Mạch kín rồi: electron tự do chuyển động có hướng, tạo thành dòng điện; kim ampe kế lệch khỏi 0'); NL.audio.play('hum'); api.done(); }
        });
      }
    },
    {
      label: () => `Đo I theo U · ${P.cnt(st.rows.length, 5, 'điểm')}`, text: 'Đổi U, đọc hai đồng hồ rồi bấm Ghi số liệu. Ghi ít nhất 5 điểm', hint: 'Mỗi lần kéo U sang mức mới rồi bấm 📌 Ghi số liệu',
      enter(api) {
        sideTable(api); controls(api, [5, 10, 15]);
        P.recButton(api, '📌 Ghi số liệu', () => { if (record(api) && st.rows.length >= 5) { api.say('Đủ 5 điểm rồi. Em có thể đổi lõi đo thêm, hoặc sang nhiệm vụ robot'); api.done('Sang nhiệm vụ robot ➜'); } $('stepNo').textContent = `Đo I theo U · ${P.cnt(st.rows.length, 5, 'điểm')}`; });
      }
    },
    {
      label: 'Nhiệm vụ', text: 'Cấp đúng 1,5 A cho cánh tay robot (từ 1,45 đến 1,55 A)', hint: 'Dùng I = U/R để tính U cần đặt. Ví dụ lõi 10 Ω cần U = 15 V',
      enter(api) {
        sideTable(api); controls(api, [5, 10, 15]);
        st.okT = 0;
        st.onTick = dt => {
          if (st.fuse && st.I >= 1.45 && st.I <= 1.55) st.okT += dt; else st.okT = 0;
          if (st.okT > 0.8) { st.onTick = null; win(api); }
        };
      }
    },
    {
      label: () => `Lõi bí ẩn · ${P.cnt(st.rows.filter(r => r.core === 'x').length, 3, 'điểm')}`, text: 'Lắp lõi bí ẩn Rₓ. Đo 3 điểm rồi đoán xem Rₓ bằng bao nhiêu', hint: 'Tính U/I cho từng lần đo rồi lấy trung bình',
      enter(api) {
        setCore('x'); if (st.uCtl) st.uCtl.set(0);
        sideTable(api); controls(api, null);
        P.recButton(api, '📌 Ghi số liệu', () => {
          if (!record(api)) return;
          const xs = st.rows.filter(r => r.core === 'x');
          $('stepNo').textContent = `Lõi bí ẩn · ${P.cnt(xs.length, 3, 'điểm')}`;
          if (xs.length === 3) {
            const avg = xs.reduce((s, r) => s + r.U / r.I, 0) / 3; st.rxAvg = avg;
            api.ask({
              q: `Trung bình U/I của 3 lần đo là ${vn(avg, 1)} Ω. Lõi bí ẩn là loại nào?`,
              options: [6, 8, 12, 18].map(v => ({ t: v + ' Ω', ok: v === st.rx, why: 'So số đó với trung bình U/I em vừa tính. Sai số đo chỉ khoảng vài phần trăm thôi.' })),
              explain: `Điện trở R = U/I là đặc trưng riêng của lõi, không phụ thuộc U hay I. Lõi bí ẩn là ${st.rx} Ω.`
            }, () => api.goto(4));
          }
        });
      }
    },
    {
      label: 'Kết quả', text: 'Đồ thị I theo U của các lõi em đã đo', hint: 'Đường càng dốc thì điện trở càng nhỏ',
      enter(api) { st.onTick = null; if (st.uCtl) st.uCtl.set(0); setK(false); api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Tăng gấp đôi', truth: 'với cùng một lõi, U tăng gấp đôi thì I cũng tăng gấp đôi. I tỉ lệ thuận với U.',
          sub: 'Đồ thị I theo U là đường thẳng đi qua gốc tọa độ. Các điểm đo lệch nhẹ khỏi đường thẳng là do sai số của dụng cụ.',
          result: result(),
          quiz: [{
            kicker: '❓ Đọc đồ thị', q: 'Trên đồ thị, đường của lõi 5 Ω dốc hơn đường của lõi 15 Ω. Vì sao?',
            options: [
              { t: 'Cùng U, lõi 5 Ω cho dòng I lớn hơn vì cản trở ít hơn', ok: true },
              { t: 'Lõi 5 Ω được cấp hiệu điện thế lớn hơn', why: 'Hai lõi được so ở cùng một mức U. Nhìn xem ở cùng U, lõi nào cho I lớn hơn?' },
              { t: 'Lõi 5 Ω nóng hơn nên dẫn điện tốt hơn', why: 'Kim loại nóng lên thì điện trở tăng chứ không giảm. Hãy dùng I = U/R.' }
            ],
            explain: 'Hệ số góc của đường I(U) bằng 1/R. R càng nhỏ, đường càng dốc.'
          }]
        });
      }
    }
  ];
  const $ = id => document.getElementById(id);

  function win(api) {
    NL.audio.play('success'); api.say('Đèn lõi robot chuyển xanh lục, Mecha-Arm hoạt động trở lại! 🤖');
    let t = 0;
    api.loop(dt => {
      t += dt;
      st.arm1._extra = ` rotate(${-75 + Math.sin(t * 3) * 30})`; st.arm2._extra = ` rotate(${-70 + Math.sin(t * 3 + 1) * 45})`;
      st.rb._extra = ` translate(0,0)`; api.place(st.arm1); api.place(st.arm2);
      if (t > 3.2) { st.arm1._extra = ' rotate(-75)'; st.arm2._extra = ' rotate(-70)'; api.place(st.arm1); api.place(st.arm2); return false; }
    });
    api.done('Thử lõi bí ẩn ➜');
  }

  function result() {
    const keys = [5, 10, 15, 'x'].filter(k => st.rows.some(r => r.core === k));
    const series = [];
    keys.forEach(k => {
      const pts = st.rows.filter(r => r.core === k).map(r => [r.U, r.I]).sort((a, b) => a[0] - b[0]);
      const R = k === 'x' ? st.rx : k, name = k === 'x' ? 'Lõi bí ẩn Rₓ' : `Lõi ${k} Ω`;
      series.push({ name, color: COL[k], dots: true, points: pts });
      series.push({ name: '', color: COL[k], dash: true, points: [[0, 0], [Math.min(24, 3.2 * R), Math.min(24, 3.2 * R) / R]] });
    });
    return {
      title: 'Định luật Ohm: I theo U', param: 'Nguồn DC 0–24 V, lõi 5, 10, 15 Ω và lõi bí ẩn, cầu chì 3 A',
      table: { head: ['Lần', 'Lõi', 'U đo (V)', 'I đo (A)', 'R = U/I (Ω)'], rows: st.rows.map((r, i) => [i + 1, r.core === 'x' ? 'Rₓ' : r.core + ' Ω', vn(r.U, 1), vn(r.I, 2), vn(r.U / r.I, 2)]) },
      chart: { type: 'line', xLabel: 'U (V)', yLabel: 'I (A)', xMin: 0, xMax: 24, yMin: 0, yMax: 4, marks: [{ y: 3, label: 'Cầu chì 3 A' }], series },
      conclusion: 'Với một lõi điện trở cho trước, cường độ dòng điện I tỉ lệ thuận với hiệu điện thế U: I = U/R. Đồ thị I theo U là đường thẳng đi qua gốc tọa độ, lõi có R càng nhỏ thì đường càng dốc',
      note: st.rxAvg ? `Lõi bí ẩn: trung bình U/I = ${vn(st.rxAvg, 2)} Ω, giá trị thật ${st.rx} Ω.` : ''
    };
  }

  // kiểm thử tự động: làm hộ thao tác của từng bước
  function auto(api) {
    const k = api.step, btn = () => [...document.querySelectorAll('#labSide .btn')].find(b => b.offsetParent);
    if (k === 0 && !st.amm) { document.querySelector('#labSide .seg-b').click(); return 'pick-ser'; }
    if (k === 1 || k === 3) {
      const n = st.rows.filter(r => r.core === st.core).length, U = (k === 1 ? [2, 4, 6, 8, 10, 12] : [4, 8, 12])[n];
      if (U === undefined) return false;
      st.uCtl.set(U); st.Um = U; st.Im = U / st.R; btn().click(); return 'rec ' + U;
    }
    if (k === 2 && Math.abs(st.U - 1.5 * st.R) > 0.01) { st.uCtl.set(1.5 * st.R); return 'set 1.5A'; }
    return false;
  }

  NL.lab.register('L1', { clearSide: true, auto, goal: 'Dòng điện qua một lõi điện trở thay đổi thế nào khi em tăng hiệu điện thế?', build, steps });
})();
