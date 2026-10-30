// Thí nghiệm H8: đốt cháy hydrocarbon. Đốt CH₄, C₂H₂ và nến, thử sản phẩm bằng cốc khô lạnh,
// nước vôi trong và đĩa sứ hứng muội. Chất càng giàu carbon càng nhiều muội.
(function () {
  const A = NL.art;
  const FX = 300, FY = 430;
  const FUEL = {
    CH4: { t: 'CH₄ (khí metan, biogas)', s: 'CH₄', flame: '#4A8FE7', core: '#BFE0FF', h: 70, soot: 0, smoke: 0, pctC: 75, eq: 'CH₄ + 2O₂ → CO₂ + 2H₂O', see: 'Lửa xanh, không khói', sootTxt: 'Không có' },
    C2H2: { t: 'C₂H₂ (khí acetylene)', s: 'C₂H₂', flame: '#FFC531', core: '#FFF4C2', h: 120, soot: 1, smoke: 1, pctC: 92.3, eq: '2C₂H₂ + 5O₂ → 4CO₂ + 2H₂O', see: 'Lửa vàng sáng, nhiều khói đen', sootTxt: 'Rất nhiều' },
    WAX: { t: 'Nến (paraffin)', s: 'C₂₅H₅₂', flame: '#FFA531', core: '#FFE9B0', h: 80, soot: 0.45, smoke: 0.3, pctC: 85.2, eq: 'C₂₅H₅₂ + 38O₂ → 25CO₂ + 26H₂O', see: 'Lửa vàng, hơi có khói', sootTxt: 'Một ít' }
  };
  const KEYS = Object.keys(FUEL);
  let st;

  function build(api) {
    const L = api.svg, el = api.el;
    st = { rows: [], fuel: 'CH4', done: {}, first: true, glass: null };
    // đầu đốt khí và cây nến
    st.jet = api.g(L, FX, FY);
    el('rect', { x: -9, y: 0, width: 18, height: 70, fill: '#7F8C9A' }, st.jet);
    el('rect', { x: -40, y: 64, width: 80, height: 12, rx: 4, fill: '#4A5A6A' }, st.jet);
    el('path', { d: 'M9 50 Q60 50 80 80', stroke: '#E07B00', 'stroke-width': 6, fill: 'none' }, st.jet);
    st.wax = api.g(L, FX, FY); st.wax.style.display = 'none';
    el('rect', { x: -22, y: 0, width: 44, height: 76, rx: 4, fill: '#F4EBD0', stroke: '#D8C9A0', 'stroke-width': 2 }, st.wax);
    el('path', { d: 'M0 0 L0 -10', stroke: '#333', 'stroke-width': 2 }, st.wax);
    st.fl = api.g(L, FX, FY - 4); st.fl.style.display = 'none';
    st.fOut = el('path', { d: '', fill: '#4A8FE7', opacity: 0.85 }, st.fl);
    st.fIn = el('path', { d: '', fill: '#BFE0FF' }, st.fl);
    st.smokeG = api.g(L, 0, 0);
    // bật lửa
    st.lighter = api.g(L, 440, 480);
    el('rect', { x: -14, y: -40, width: 28, height: 50, rx: 6, fill: '#E5534B' }, st.lighter);
    el('rect', { x: -10, y: -52, width: 20, height: 14, rx: 3, fill: '#8C8C8C' }, st.lighter);
    api.text(st.lighter, 0, 30, 'Bật lửa', 12, '#6C88A3', 700);
    // cốc thủy tinh úp ngược
    st.glass = api.g(L, 120, 300); st.glass.style.display = 'none';
    el('path', { d: 'M-42 -60 L-38 50 L38 50 L42 -60 Z', fill: 'rgba(220,240,255,.3)', stroke: A.GLASS, 'stroke-width': 3.5 }, st.glass);
    st.fog = el('path', { d: 'M-38 -56 L-35 46 L35 46 L38 -56 Z', fill: 'rgba(255,255,255,.0)' }, st.glass);
    st.drops = api.g(st.glass, 0, 0);
    st.lime = el('rect', { x: -36, y: -56, width: 72, height: 0, fill: 'rgba(240,248,255,.9)' }, st.glass);
    st.glassLbl = api.text(st.glass, 0, 78, 'Cốc thủy tinh', 12, '#6C88A3', 700);
    // lọ nước vôi
    st.bLime = A.bottle(api, L, 560, 530, 'Nước vôi trong', 'rgba(230,245,255,.8)', { w: 84, h: 80, font: 11 }); st.bLime.style.display = 'none';
    // đĩa sứ
    st.dish = api.g(L, 140, 520); st.dish.style.display = 'none';
    el('ellipse', { rx: 56, ry: 12, fill: '#FAFAFA', stroke: '#B8C4CE', 'stroke-width': 3 }, st.dish);
    st.sootSpot = el('ellipse', { rx: 0, ry: 0, fill: '#222', opacity: 0.85 }, st.dish);
    api.text(st.dish, 0, 32, 'Đĩa sứ', 12, '#6C88A3', 700);
    st.lens = NL.chem.lens(api, L, 600, 210, 80, { title: '🔍 Kính lúp: trên ngọn lửa' }); st.lens.g.style.display = 'none';
  }
  function setFlame(k) {
    const f = FUEL[k], h = f.h, w = h * 0.28;
    st.fOut.setAttribute('d', `M0 0 C ${-w} ${-h * 0.25}, ${-w * 0.6} ${-h * 0.7}, 0 ${-h} C ${w * 0.6} ${-h * 0.7}, ${w} ${-h * 0.25}, 0 0 Z`);
    st.fIn.setAttribute('d', `M0 0 C ${-w * 0.45} ${-h * 0.2}, ${-w * 0.3} ${-h * 0.4}, 0 ${-h * 0.55} C ${w * 0.3} ${-h * 0.4}, ${w * 0.45} ${-h * 0.2}, 0 0 Z`);
    st.fOut.setAttribute('fill', f.flame); st.fIn.setAttribute('fill', f.core);
  }
  function light(api) {
    const f = FUEL[st.fuel];
    st.fl.style.display = ''; setFlame(st.fuel); NL.audio.play('pop');
    let t = 0; const ps = [];
    if (st.smokeLoop) st.smokeLoop.stop();
    st.smokeLoop = api.loop(dt => {
      t += dt;
      st.fl.setAttribute('transform', `translate(${FX} ${FY - 4}) scale(${1 + Math.sin(t * 13) * 0.03} ${1 + Math.sin(t * 9) * 0.05})`);
      if (f.smoke && Math.random() < f.smoke * 0.35 && !st.cover) ps.push({ e: api.el('circle', { cx: FX + Math.random() * 10 - 5, cy: FY - f.h, r: 4, fill: '#333', opacity: 0.5 }, st.smokeG), y: FY - f.h, x: FX, a: 0.5 });
      for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; p.y -= 50 * dt; p.x += Math.sin(p.y / 15) * 0.6; p.a -= 0.25 * dt; p.e.setAttribute('cy', p.y); p.e.setAttribute('cx', p.x); p.e.setAttribute('r', 4 + (FY - f.h - p.y) / 12); p.e.setAttribute('opacity', Math.max(0, p.a)); if (p.a <= 0) { p.e.remove(); ps.splice(i, 1); } }
    });
    st.lens.g.style.display = '';
    const prod = [{ f: 'CO₂', n: 4 }, { f: 'H₂O', n: 4 }, { f: 'O₂', n: 2 }];
    if (f.soot) prod.push({ f: 'C', n: Math.round(4 * f.soot) + 1 });
    st.lens.set([{ f: f.s, n: 2 }].concat(prod));
    api.say(`${f.see}. ${f.eq}`);
  }
  function sideTable(api) {
    if (!st.tbl) st.tbl = api.table(['Chất đốt', 'Ngọn lửa', 'Muội than']);
    st.tbl.set(st.rows.map(r => [FUEL[r.k].s, FUEL[r.k].see.split(',')[0], FUEL[r.k].sootTxt]));
  }
  function moveTo(api, g, x, y) { api.place(g, x, y); }

  const steps = [
    {
      label: () => `Chất đốt ${st.rows.length + 1}/3`, text: 'Chọn chất đốt rồi chạm bật lửa để đốt', hint: 'Chọn một chất bên phải, rồi chạm bật lửa đỏ',
      enter(api) {
        sideTable(api);
        if (!api.prediction) api.ask({ predict: true, q: 'Đốt chất nào trong không khí sẽ có nhiều khói đen (muội than) nhất?', options: [{ t: 'CH₄ (khí metan)' }, { t: 'C₂H₂ (khí acetylene)' }, { t: 'Cả hai như nhau' }] });
        st.fl.style.display = 'none'; st.smokeG.innerHTML = ''; st.lens.g.style.display = 'none';
        st.sootSpot.setAttribute('rx', 0); st.sootSpot.setAttribute('ry', 0);
        const left = KEYS.filter(k => !st.done[k]);
        st.fuel = left[0];
        const show = k => { st.jet.style.display = k === 'WAX' ? 'none' : ''; st.wax.style.display = k === 'WAX' ? '' : 'none'; };
        show(st.fuel);
        st.pick = api.choices({ label: 'Chất đốt', items: left.map(k => ({ t: FUEL[k].t, v: k })), value: st.fuel, onPick(v) { st.fuel = v; show(v); } });
        api.setOn(st.lighter, true);
        api.tapable(st.lighter, () => { st.pick.remove(); light(api); api.wait(1.5, () => api.goto(st.first ? 1 : 3)); });
      }
    },
    {
      label: 'Thử nước', text: 'Úp một cốc thủy tinh lên trên ngọn lửa. Em dùng cốc nào?', hint: 'Chọn cốc bên phải',
      enter(api) {
        const d = st.gPick = api.panel('<div>Chọn cốc</div><div class="seg"><button class="seg-b pop" data-k="wet">Cốc vừa rửa, còn ướt</button><button class="seg-b pop" data-k="dry">Cốc khô, để lạnh</button></div>');
        d.querySelectorAll('.seg-b').forEach(b => b.addEventListener('click', () => {
          NL.audio.play('click'); d.remove(); st.gPick = null; st.wet = b.dataset.k === 'wet';
          st.glass.style.display = ''; moveTo(api, st.glass, 120, 300);
          st.fog.setAttribute('fill', st.wet ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,0)');
          st.drops.innerHTML = '';
          if (st.wet) for (let i = 0; i < 10; i++) api.el('circle', { cx: Math.random() * 64 - 32, cy: Math.random() * 90 - 50, r: 2.5, fill: 'rgba(160,210,245,.9)' }, st.drops);
          api.say(st.wet ? 'Kéo cốc úp lên trên ngọn lửa' : 'Kéo cốc khô úp lên trên ngọn lửa');
          api.setOn(st.glass, true);
          api.draggable(st.glass, { target: { x: FX, y: FY - FUEL[st.fuel].h - 70, r: 90, sx: FX, sy: FY - FUEL[st.fuel].h - 70 }, onDrop: () => cover(api) });
        }));
      }
    },
    {
      label: 'Thử CO₂', text: 'Lật cốc lại, chạm lọ nước vôi trong để rót vào cốc', hint: 'Chạm lọ nước vôi trong',
      enter(api) {
        st.cover = false;
        moveTo(api, st.glass, 440, 330); st.glass.setAttribute('transform', st.glass.getAttribute('transform') + ' rotate(180)');
        st.glassLbl.style.display = 'none';
        st.bLime.style.display = ''; api.setOn(st.bLime, true);
        api.tapable(st.bLime, () => {
          NL.audio.play('drop');
          let t = 0; api.loop(dt => { t += dt; const k = Math.min(1, t / 1.5); st.lime.setAttribute('height', 40 * k); st.lime.setAttribute('fill', `rgba(${240 - 10 * k},${248 - 8 * k},255,${0.5 + 0.45 * k})`); if (k >= 1) return false; });
          api.wait(1.6, () => { st.lime.setAttribute('fill', 'rgba(250,250,250,.97)'); api.say('Nước vôi trong vẩn đục: sản phẩm có CO₂. CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O'); api.done('Thử muội than ➜'); });
        });
      }
    },
    {
      label: 'Thử muội', text: 'Hơ đĩa sứ trắng ngay trên ngọn lửa', hint: 'Kéo đĩa sứ lên trên ngọn lửa',
      enter(api) {
        st.glass.style.display = 'none'; st.bLime.style.display = 'none';
        st.dish.style.display = ''; moveTo(api, st.dish, 140, 520); api.svg.appendChild(st.dish);
        api.setOn(st.dish, true);
        const f = FUEL[st.fuel];
        api.draggable(st.dish, { target: { x: FX, y: FY - f.h * 0.75, r: 90, sx: FX, sy: FY - f.h * 0.75 }, onDrop: () => {
          st.cover = true;
          let t = 0; api.loop(dt => { t += dt; const k = Math.min(1, t / 2); st.sootSpot.setAttribute('rx', 40 * f.soot * k); st.sootSpot.setAttribute('ry', 8 * f.soot * k); if (k >= 1) return false; });
          api.wait(2.1, () => {
            st.cover = false;
            api.say(f.soot > 0.8 ? 'Đáy đĩa đen kịt muội than: chất giàu carbon cháy không hết, còn lại C' : f.soot ? 'Đáy đĩa có một vệt muội than' : 'Đáy đĩa vẫn trắng: CH₄ cháy hết thành CO₂ và H₂O');
            st.rows.push({ k: st.fuel }); st.done[st.fuel] = 1; st.first = false; sideTable(api);
            api.done(st.rows.length >= 3 ? 'Xem kết quả ➜' : 'Đốt chất tiếp theo ➜');
          });
        } });
      },
      onNext(api) { st.dish.style.display = 'none'; api.goto(st.rows.length >= 3 ? 4 : 0); }
    },
    {
      label: 'Kết quả', text: 'Phần trăm khối lượng carbon trong mỗi chất', hint: 'Cột càng cao, càng dễ có muội',
      enter(api) { st.fl.style.display = 'none'; st.smokeG.innerHTML = ''; st.lens.g.style.display = 'none'; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'C₂H₂ (khí acetylene)', truth: 'C₂H₂ có tỉ lệ carbon cao nhất (khoảng 92%), không khí không đủ oxygen để đốt hết nên còn nhiều muội than.',
          sub: 'Bếp gas, biogas cháy lửa xanh vì CH₄ ít carbon và đủ không khí. Lửa vàng có khói là dấu hiệu cháy không hết, dễ sinh khí CO rất độc.',
          result: result(),
          quiz: [{
            kicker: '❓ Vì sao?', q: 'Vì sao phải dùng cốc khô để thử sản phẩm có nước?',
            options: [
              { t: 'Cốc ướt có sẵn nước nên không biết giọt nước là do phản ứng tạo ra', ok: true },
              { t: 'Cốc ướt làm tắt lửa', why: 'Vài giọt nước trên thành cốc không làm tắt lửa. Vấn đề là kết luận thí nghiệm.' },
              { t: 'Cốc ướt dễ vỡ hơn', why: 'Điều đó không phải lý do chính. Nghĩ xem: giọt nước trên cốc ướt từ đâu ra?' }
            ],
            explain: 'Muốn chứng minh phản ứng tạo ra nước thì lúc đầu cốc phải khô. Cốc lạnh giúp hơi nước ngưng tụ thành giọt nhanh hơn.'
          }]
        });
      }
    }
  ];

  function cover(api) {
    st.cover = true;
    if (st.wet) {
      api.say('Thành cốc có giọt nước… nhưng cốc vốn đã ướt sẵn');
      api.wait(1.2, () => api.lesson({ title: 'Dùng cốc ướt để thử nước', text: 'Cốc đã có nước từ trước, nên giọt nước em thấy không chứng minh được gì về phản ứng cháy.', sub: 'Bài học: muốn chứng minh có chất mới tạo thành thì dụng cụ ban đầu phải sạch và không chứa sẵn chất đó. Dùng cốc khô, để lạnh cho hơi nước ngưng tụ.', btn: '🔁 Lấy cốc khô' }, () => {
        st.cover = false; st.glass.style.display = 'none'; api.goto(1);
      }));
      return;
    }
    let t = 0; api.loop(dt => {
      t += dt; const k = Math.min(1, t / 2);
      st.fog.setAttribute('fill', `rgba(255,255,255,${0.45 * k})`);
      if (Math.random() < 0.15) api.el('circle', { cx: Math.random() * 64 - 32, cy: Math.random() * 90 - 50, r: 1.5 + Math.random() * 2, fill: 'rgba(160,210,245,.9)' }, st.drops);
      if (k >= 1) return false;
    });
    api.wait(2.1, () => { api.say('Thành cốc mờ đi và đọng giọt nước: sản phẩm có H₂O'); api.done('Thử CO₂ ➜'); });
  }

  function result() {
    const ks = KEYS.filter(k => st.done[k]);
    return {
      title: 'Đốt cháy hydrocarbon', param: 'Đốt trong không khí: CH₄, C₂H₂, nến paraffin',
      table: { head: ['Chất', 'Phương trình cháy hoàn toàn', '% khối lượng C', 'Ngọn lửa', 'Muội than'], rows: ks.map(k => [FUEL[k].s, FUEL[k].eq, String(FUEL[k].pctC).replace('.', ','), FUEL[k].see, FUEL[k].sootTxt]) },
      chart: { labels: ks.map(k => FUEL[k].s), yLabel: '% khối lượng carbon', series: [{ name: '% C', color: '#3B3B3B', values: ks.map(k => FUEL[k].pctC) }] },
      conclusion: 'Hydrocarbon cháy hoàn toàn tạo CO₂ và H₂O. Chất có phần trăm carbon càng cao thì càng khó cháy hết trong không khí, lửa vàng và sinh nhiều muội than',
      note: 'Nến là hỗn hợp nhiều alkane, C₂₅H₅₂ chỉ là công thức đại diện.'
    };
  }
  function auto(api) {
    if (st.gPick && st.gPick.isConnected) { st.gPick.querySelector('[data-k="dry"]').click(); return 'dry'; }
    return false;
  }

  NL.lab.register('H8', { goal: 'Vì sao bếp gas cháy lửa xanh, còn nến lại có muội đen?', build, steps, auto });
})();
