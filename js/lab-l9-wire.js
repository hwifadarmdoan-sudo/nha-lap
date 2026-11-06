// Thí nghiệm L9: điện trở dây dẫn phụ thuộc chiều dài, tiết diện, vật liệu (R = ρl/S). Xưởng amply: luật kiểm soát biến, dây đồng ngắn chập mạch.
(function () {
  const P = NL.phys, vn = P.vn;
  const MAT = { Cu: { t: 'Đồng', rho: 0.017, c: '#D9822B' }, Al: { t: 'Nhôm', rho: 0.028, c: '#B8C2CC' }, Co: { t: 'Constantan', rho: 0.5, c: '#C9A66B' }, Ni: { t: 'Nichrome', rho: 1.1, c: '#6F7B87' } }; // ρ: Ω·mm²/m
  const LS = [0.5, 1, 1.5, 2], SS = [0.1, 0.2, 0.3, 0.5], E = 3, RIN = 0.3, R0 = 10, FUSE = 2;
  const BX = 80, TY = 200, BY = 300, LPX = 320;
  let st, api_;
  const $ = id => document.getElementById(id);

  function build(api) {
    api_ = api;
    const L = api.svg, el = api.el;
    st = { mat: 'Co', l: 1, S: 0.2, k: false, r0: false, rows: [], broke: false, few: false };
    el('rect', { x: 40, y: 250 + 72, width: 740, height: 10, rx: 4, fill: '#8A6A4A' }, L);
    st.wireBg = el('path', { fill: 'none', stroke: '#4A5A6A', 'stroke-width': 4, 'stroke-linejoin': 'round' }, L);
    st.flow = P.flow(api, L, 'M0 0 L1 0', 22, '#4FE3FF');
    st.sample = el('line', { x1: BX, y1: BY, x2: BX, y2: BY, 'stroke-linecap': 'round' }, L);
    st.glow = el('line', { x1: BX, y1: BY, x2: BX, y2: BY, stroke: '#FF5A2A', 'stroke-width': 14, opacity: 0, 'stroke-linecap': 'round' }, L);
    // pin
    const bat = api.g(L, BX, 250);
    el('rect', { x: -18, y: -30, width: 36, height: 60, rx: 6, fill: '#3A4A5A' }, bat); el('rect', { x: -8, y: -36, width: 16, height: 7, fill: '#9AA9B7' }, bat);
    api.text(bat, 0, 5, '3 V', 13, '#F2C230', 800);
    // khóa K
    st.K = api.g(L, 150, TY);
    el('rect', { x: -22, y: -20, width: 44, height: 34, fill: 'transparent' }, st.K);
    el('circle', { cx: -14, cy: 0, r: 5, fill: '#4A5A6A' }, st.K); el('circle', { cx: 14, cy: 0, r: 5, fill: '#4A5A6A' }, st.K);
    st.lever = el('line', { x1: -14, y1: 0, x2: 12, y2: -16, stroke: '#E5534B', 'stroke-width': 5, 'stroke-linecap': 'round' }, st.K);
    api.text(st.K, 0, -26, 'K', 14, '#1F4E79', 800);
    // ampe kế nhỏ trên dây, vôn kế mắc song song với mẫu dây
    const am = api.g(L, 230, TY); el('circle', { r: 15, fill: '#fff', stroke: '#1F4E79', 'stroke-width': 3 }, am); api.text(am, 0, 6, 'A', 15, '#1F4E79', 800);
    st.vLead = el('path', { fill: 'none', stroke: '#9B6BD6', 'stroke-width': 2.5 }, L);
    st.vm = api.g(L, 0, BY + 48); el('circle', { r: 15, fill: '#fff', stroke: '#9B6BD6', 'stroke-width': 3 }, st.vm); api.text(st.vm, 0, 6, 'V', 15, '#9B6BD6', 800);
    // điện trở bảo vệ (xuất hiện sau bài học chập mạch)
    st.r0g = api.g(L, 320, TY); st.r0g.style.display = 'none';
    el('rect', { x: -28, y: -11, width: 56, height: 22, rx: 5, fill: '#D9B988', stroke: '#6A4A2A', 'stroke-width': 2 }, st.r0g); api.text(st.r0g, 0, -18, 'R₀ = 10 Ω', 12, '#6A4A2A', 800);
    // đồng hồ hiển thị
    st.A = P.meter(api, L, 470, 110, { label: 'Ampe kế', sym: 'A', unit: 'A', max: 2, danger: 1.6, r: 46, d: 3 });
    st.V = P.meter(api, L, 660, 110, { label: 'Vôn kế', sym: 'V', unit: 'V', max: 3, r: 46, d: 3 });
    st.info = api.text(L, 400, 390, '', 15, '#1F4E79', 800);
    st.info2 = api.text(L, 400, 416, '', 14, '#6C88A3', 700);
    geo(); api.loop(tick);
  }
  const Rw = () => MAT[st.mat].rho * st.l / st.S;
  function calc() { const R = Rw(), Rt = R + RIN + (st.r0 ? R0 : 0), I = st.k && !st.broke ? E / Rt : 0; return { R, I, U: I * R }; }
  function geo() {
    const xr = BX + st.l * LPX;
    st.sample.setAttribute('x2', xr); st.glow.setAttribute('x2', xr);
    st.sample.setAttribute('stroke', MAT[st.mat].c); st.sample.setAttribute('stroke-width', 3 + st.S * 18);
    const d = `M${BX} 280 L${BX} ${TY} L${xr} ${TY} L${xr} ${BY} L${BX} ${BY} L${BX} 280`;
    st.wireBg.setAttribute('d', `M${BX} 220 L${BX} ${TY} L${xr} ${TY} L${xr} ${BY}`);
    st.flow.path(d.replace(/ L\d+ 280$/, ' Z'));
    st.vLead.setAttribute('d', `M${BX + 4} ${BY} L${BX + 4} ${BY + 48} L${xr - 4} ${BY + 48} L${xr - 4} ${BY}`);
    api_.place(st.vm, (BX + xr) / 2, BY + 48);
  }
  function tick() {
    const c = calc();
    st.A.set(c.I, vn(c.I, 3) + ' A');
    st.V.set(c.U, c.U < 1 ? vn(c.U * 1000, 1) + ' mV' : vn(c.U, 3) + ' V');
    st.flow.speed(c.I * 140);
    st.info.textContent = `Dây ${MAT[st.mat].t} · l = ${vn(st.l)} m · S = ${vn(st.S)} mm²`;
    st.info2.textContent = st.k && !st.broke ? `R = U/I ≈ ${vn(c.U / c.I, c.R < 1 ? 3 : 2)} Ω` : (st.broke ? 'Mạch hỏng' : 'Khóa K đang mở');
    if (c.I > FUSE && !st.broke) short(c);
  }
  function short(c) {
    st.broke = true; const api = api_;
    st.glow.setAttribute('opacity', 0.8); P.spark(api, api.svg, BX + st.l * LPX / 2, BY, 22); P.smoke(api, api.svg, BX + st.l * LPX / 2, BY - 10); P.alarm(api);
    setTimeout(() => api.lesson({ title: 'Dây có điện trở quá nhỏ nối thẳng vào pin thì chập mạch', text: `Dây ${MAT[st.mat].t.toLowerCase()} chỉ có R ≈ ${vn(c.R, 3)} Ω. Nối thẳng vào pin, dòng điện vọt lên ${vn(c.I, 1)} A, dây nóng đỏ và bốc khói.`, sub: 'Bài học: dây dẫn tốt có điện trở rất nhỏ, nối thẳng hai cực nguồn là đoản mạch. Phải mắc thêm điện trở bảo vệ R₀ để giới hạn dòng điện.', btn: '🔧 Lắp điện trở bảo vệ R₀' }, () => { st.broke = false; st.r0 = true; st.r0g.style.display = ''; st.glow.setAttribute('opacity', 0); }), 900);
  }
  function controls(api) {
    st.cM = api.choices({ label: 'Vật liệu dây', items: Object.keys(MAT).map(k => ({ t: MAT[k].t, v: k })), value: st.mat, onPick(v) { st.mat = v; geo(); } });
    st.cL = api.choices({ label: 'Chiều dài l (m)', items: LS.map(v => ({ t: vn(v), v })), value: st.l, onPick(v) { st.l = v; geo(); } });
    st.cS = api.choices({ label: 'Tiết diện S (mm²)', items: SS.map(v => ({ t: vn(v), v })), value: st.S, onPick(v) { st.S = v; geo(); } });
    st.cM.set(st.mat); st.cL.set(st.l); st.cS.set(st.S);
  }
  function sideTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['Dây', 'l (m)', 'S (mm²)', 'R (Ω)']);
    st.tbl.set(st.rows.slice(-5).map(r => [MAT[r.mat].t, vn(r.l), vn(r.S), vn(r.R, r.R < 1 ? 3 : 2)]));
  }
  const diff = (a, b) => ['mat', 'l', 'S'].filter(k => a[k] !== b[k]);

  const steps = [
    {
      label: 'Đóng mạch', text: 'Mẫu dây constantan dài 1 m đã nối vào pin 3 V. Chạm khóa K để đóng mạch', hint: 'Chạm vào khóa K',
      enter(api) {
        if (!api.prediction) api.ask({ predict: true, q: 'Giữ nguyên tiết diện và vật liệu, tăng gấp đôi chiều dài dây. Điện trở R của dây sẽ…?', options: [{ t: 'Tăng gấp đôi' }, { t: 'Giảm một nửa' }, { t: 'Không đổi' }] });
        api.setOn(st.K, true);
        api.tapable(st.K, () => { st.k = true; st.lever.setAttribute('x2', 14); st.lever.setAttribute('y2', 0); NL.audio.play('click'); api.say('Kim nhích lên. Điện trở dây tính bằng R = U/I'); api.done('Bắt đầu đo ➜'); });
      }
    },
    {
      label: () => `Đo điện trở · ${P.cnt(st.rows.length, 6, 'lần')}`, text: 'Đổi dây rồi bấm Ghi. Mỗi lần chỉ được đổi MỘT thứ: vật liệu, chiều dài hoặc tiết diện. Ghi 6 lần, đổi đủ cả ba thứ', hint: 'Đổi một thứ, ghi, rồi mới đổi thứ khác',
      enter(api) {
        sideTable(api); controls(api);
        P.recButton(api, '📌 Ghi số liệu', () => {
          if (st.broke) { NL.game.toast('Mạch đang hỏng'); return; }
          const c = calc(), cur = { mat: st.mat, l: st.l, S: st.S }, last = st.rows[st.rows.length - 1];
          if (last) {
            const d = diff(cur, last);
            if (!d.length) { NL.game.toast('Dây này vừa đo xong, đổi một thứ rồi đo tiếp'); return; }
            if (d.length > 1) {
              const nm = { mat: 'vật liệu', l: 'chiều dài', S: 'tiết diện' };
              if (!st.few) { st.few = true; api.lesson({ title: 'Đổi hai thứ cùng lúc thì không so sánh được', text: `So với lần trước em đổi cả ${d.map(k => nm[k]).join(' và ')}. R thay đổi rồi, nhưng không biết do thứ nào gây ra.`, sub: 'Bài học (kiểm soát biến): muốn biết R phụ thuộc vào một đại lượng thì chỉ đổi đại lượng đó, giữ nguyên các đại lượng còn lại.', btn: '↩ Chỉ đổi một thứ' }, () => {}); }
              else NL.game.toast('Không so sánh được: chỉ đổi một thứ so với lần trước');
              return;
            }
            cur.kind = d[0];
          }
          const U = P.measure(c.U, 0.004, 0.0001), I = P.measure(c.I, 0.004, 0.0001);
          Object.assign(cur, { U, I, R: U / I }); st.rows.push(cur); sideTable(api); NL.audio.play('ting');
          $('stepNo').textContent = `Đo điện trở · ${P.cnt(st.rows.length, 6, 'lần')}`;
          if (st.rows.length >= 6) { const ks = new Set(st.rows.map(r => r.kind).filter(Boolean)); if (ks.size === 3) api.done('Sang nhiệm vụ xưởng amply ➜'); else NL.game.toast('Cần có lần chỉ đổi ' + ['mat', 'l', 'S'].filter(k => !ks.has(k)).map(k => ({ mat: 'vật liệu', l: 'chiều dài', S: 'tiết diện' })[k]).join(', ')); }
        });
      }
    },
    {
      label: 'Nhiệm vụ', text: 'Xưởng amply cần một cuộn điện trở đúng 8 Ω (sai lệch không quá 0,5 Ω) để lắp loa. Chọn dây rồi bấm Lắp', hint: 'R = ρl/S. Dây đồng, nhôm điện trở quá nhỏ. Thử nichrome hoặc constantan',
      enter(api) {
        controls(api);
        const d = api.panel('<button class="btn pop">🔊 Lắp vào amply</button>');
        d.querySelector('button').addEventListener('click', () => {
          const R = Rw();
          if (Math.abs(R - 8) <= 0.5) {
            NL.audio.play('success'); api.say(`R = ${vn(R, 2)} Ω, vừa khít! Loa amply phát nhạc rõ ràng 🎵`);
            api.wait(1.2, () => api.ask({
              q: 'Vì sao dây điện trong nhà làm bằng đồng, còn dây nung của bếp điện làm bằng nichrome?',
              options: [{ t: 'Đồng điện trở suất nhỏ nên ít tỏa nhiệt trên đường dây, nichrome điện trở suất lớn nên tỏa nhiều nhiệt', ok: true }, { t: 'Đồng rẻ hơn nichrome, ngoài ra không khác gì', why: 'Xem cột R trong bảng: cùng kích thước, R của nichrome lớn gấp khoảng 65 lần đồng.' }, { t: 'Nichrome dẫn điện tốt hơn đồng', why: 'Ngược lại: nichrome có điện trở suất lớn, dẫn điện kém hơn đồng nhiều.' }],
              explain: 'Nhiệt tỏa ra Q = I²Rt. Dây dẫn cần R nhỏ để không nóng và không hao phí, nên dùng đồng (ρ ≈ 1,7·10⁻⁸ Ω·m). Dây nung cần R lớn và chịu nhiệt, nên dùng nichrome (ρ ≈ 1,1·10⁻⁶ Ω·m).'
            }, () => api.done('Xem kết quả ➜')));
          } else { NL.audio.play('pop'); api.say(R < 8 ? `R = ${vn(R, R < 1 ? 3 : 2)} Ω, nhỏ quá: loa rè và amply nóng. Cần R lớn hơn` : `R = ${vn(R, 2)} Ω, lớn quá: loa kêu rất nhỏ. Cần R nhỏ hơn`); }
        });
      }
    },
    {
      label: 'Kết quả', text: 'Điện trở theo tỉ số l/S cho từng vật liệu', hint: 'Mỗi vật liệu một đường thẳng, độ dốc là điện trở suất ρ',
      enter(api) { api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Tăng gấp đôi', truth: 'R = ρl/S tỉ lệ thuận với chiều dài l: dây dài gấp đôi thì R gấp đôi.',
          sub: 'Điện trở tỉ lệ thuận với chiều dài, tỉ lệ nghịch với tiết diện và phụ thuộc vật liệu làm dây.',
          result: result(),
          quiz: [{
            kicker: '❓ Tiết diện', q: 'Giữ nguyên vật liệu và chiều dài, dùng dây có tiết diện lớn gấp đôi. R sẽ…?',
            options: [{ t: 'Giảm một nửa', ok: true }, { t: 'Tăng gấp đôi', why: 'Dây to hơn thì dòng điện có nhiều "lối đi" hơn.' }, { t: 'Không đổi', why: 'R = ρl/S phụ thuộc S.' }],
            explain: 'R = ρl/S tỉ lệ nghịch với S: tiết diện gấp đôi thì điện trở giảm một nửa.'
          }]
        });
      }
    }
  ];

  function result() {
    const rs = st.rows, series = [];
    Object.keys(MAT).forEach(k => {
      const m = MAT[k], pts = rs.filter(r => r.mat === k).map(r => [r.l / r.S, r.R]);
      if (!pts.length) return;
      const xe = Math.min(20, 24 / m.rho); series.push({ name: '', color: m.c, dash: true, points: [[0, 0], [xe, m.rho * xe]] });
      series.push({ name: m.t, color: m.c, dots: true, points: pts });
    });
    return {
      title: 'Điện trở dây dẫn phụ thuộc l, S và vật liệu', param: 'Nguồn 3 V, dây đồng, nhôm, constantan, nichrome; l từ 0,5 đến 2 m; S từ 0,1 đến 0,5 mm²',
      table: { head: ['Lần', 'Dây', 'l (m)', 'S (mm²)', 'U (V)', 'I (A)', 'R (Ω)'], rows: rs.map((r, i) => [i + 1, MAT[r.mat].t, vn(r.l), vn(r.S), vn(r.U, 4), vn(r.I, 4), vn(r.R, r.R < 1 ? 3 : 2)]) },
      chart: { type: 'line', xLabel: 'l/S (m/mm²)', yLabel: 'R (Ω)', xMin: 0, xMax: 20, yMin: 0, yMax: 24, series },
      conclusion: 'Điện trở dây dẫn R = ρl/S: tỉ lệ thuận với chiều dài l, tỉ lệ nghịch với tiết diện S, và phụ thuộc vật liệu qua điện trở suất ρ. Đồng, nhôm có ρ rất nhỏ nên làm dây dẫn; constantan, nichrome có ρ lớn nên làm điện trở, dây nung',
      note: 'Muốn tìm sự phụ thuộc vào một đại lượng, mỗi lần chỉ đổi đại lượng đó (kiểm soát biến).'
    };
  }
  function auto(api) {
    const k = api.step;
    if (k === 1) {
      const plan = [['Cu', 1, 0.2], ['Co', 1, 0.2], ['Co', 2, 0.2], ['Ni', 1, 0.3], ['Co', 2, 0.1], ['Ni', 2, 0.1], ['Ni', 1, 0.1]];
      st.ai = st.ai || 0; if (st.ai >= plan.length || st.broke) return st.broke ? 'wait2' : false;
      const p = plan[st.ai];
      if (st.mat !== p[0] || st.l !== p[1] || st.S !== p[2]) { st.cM.set(p[0]); st.cL.set(p[1]); st.cS.set(p[2]); return 'set'; }
      if (!st.r0 && p[0] === 'Cu') return 'wait';
      const b = [...document.querySelectorAll('#labSide .btn')].find(x => x.offsetParent); b.click(); st.ai++; return 'rec';
    }
    if (k === 2) { if (st.mat !== 'Ni' || st.l !== 1.5 || st.S !== 0.2) { st.cM.set('Ni'); st.cL.set(1.5); st.cS.set(0.2); return 'set'; } }
    return false;
  }

  NL.lab.register('L9', { clearSide: true, auto, goal: 'Vì sao dây điện trong nhà làm bằng đồng, còn dây bếp điện làm bằng nichrome?', build, steps });
})();
