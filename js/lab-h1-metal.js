// Thí nghiệm H1: kim loại tác dụng với acid loãng, thu khí H₂, đo nhiệt độ, thử khí bằng que đóm.
(function () {
  const A = NL.art;
  // khả năng phản ứng (theo dãy hoạt động hóa học), Al có lớp oxide nên chậm vài giây đầu
  const METAL = {
    Mg: { t: 'Magnesium (Mg)', k: 0.075, dT: 9, col: '#C9CED6', ion: 'Mg²⁺', v: 2, delay: 0 },
    Al: { t: 'Nhôm (Al)', k: 0.05, dT: 7, col: '#D8DDE3', ion: 'Al³⁺', v: 3, delay: 4 },
    Zn: { t: 'Kẽm (Zn)', k: 0.028, dT: 4, col: '#AEB8C2', ion: 'Zn²⁺', v: 2, delay: 0 },
    Fe: { t: 'Sắt (Fe)', k: 0.011, dT: 2, col: '#7D7F82', ion: 'Fe²⁺', v: 2, delay: 0 },
    Cu: { t: 'Đồng (Cu)', k: 0, dT: 0, col: '#C8743A', ion: 'Cu²⁺', v: 2, delay: 0 }
  };
  const FORM = { vien: { t: 'Viên', f: 1 }, la: { t: 'Lá mỏng', f: 2 }, bot: { t: 'Bột', f: 4 } };
  const ACID = { HCl: { t: 'HCl 2 M', an: 'Cl⁻', col: 'rgba(200,230,250,.6)' }, H2SO4: { t: 'H₂SO₄ 1 M', an: 'SO₄²⁻', col: 'rgba(215,235,250,.6)' } };
  const VMAX = 248; // 0,01 mol H₂ ở 25 °C, 1 bar (24,79 L/mol)
  const DUR = 60;   // mỗi lần đo 60 giây (tua nhanh)
  const TX = 420;   // ống nghiệm
  let st;

  function eq(m, a) {
    if (a === 'HCl') return { Mg: 'Mg + 2HCl → MgCl₂ + H₂↑', Al: '2Al + 6HCl → 2AlCl₃ + 3H₂↑', Zn: 'Zn + 2HCl → ZnCl₂ + H₂↑', Fe: 'Fe + 2HCl → FeCl₂ + H₂↑', Cu: 'Cu + HCl → không phản ứng' }[m];
    return { Mg: 'Mg + H₂SO₄ → MgSO₄ + H₂↑', Al: '2Al + 3H₂SO₄ → Al₂(SO₄)₃ + 3H₂↑', Zn: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑', Fe: 'Fe + H₂SO₄ → FeSO₄ + H₂↑', Cu: 'Cu + H₂SO₄ loãng → không phản ứng' }[m];
  }
  const vol = (m, f, t) => { const M = METAL[m]; if (!M.k) return 0; const te = Math.max(0, t - M.delay); return VMAX * (1 - Math.exp(-M.k * FORM[f].f * te)); };

  function build(api) {
    const L = api.svg, el = api.el; api0 = api;
    st = { acid: 'HCl', metal: 'Mg', form: 'vien', runs: [], filled: false };
    // giá ống nghiệm
    el('rect', { x: TX - 70, y: 300, width: 140, height: 18, rx: 6, fill: '#C99A6B' }, L);
    el('rect', { x: TX - 62, y: 318, width: 10, height: 132, fill: '#B5865A' }, L); el('rect', { x: TX + 52, y: 318, width: 10, height: 132, fill: '#B5865A' }, L);
    st.tube = A.tube(api, L, TX, 440, { h: 230, w: 52, label: 'Ống nghiệm' });
    st.bub = api.g(L, 0, 0);
    st.piece = api.g(L, TX, 428); st.piece.style.display = 'none';
    // nhiệt kế số
    el('rect', { x: TX + 10, y: 250, width: 7, height: 180, rx: 3, fill: '#E5534B', opacity: .85 }, L);
    el('path', { d: `M${TX + 13} 250 C ${TX + 40} 230, ${TX + 70} 290, ${TX + 95} 300`, stroke: '#24323F', 'stroke-width': 3, fill: 'none' }, L);
    const th = api.g(L, TX + 125, 0);
    el('rect', { x: -32, y: 282, width: 64, height: 58, rx: 10, fill: '#24323F' }, th);
    st.tTxt = api.text(th, 0, 316, '25,0', 18, '#59F28A', 800); api.text(th, 0, 333, '°C', 11, '#9FD6B0', 700);
    // ống dẫn khí và ống đong úp ngược trong chậu nước
    el('path', { d: `M${TX + 6} 214 C ${TX + 40} 140, 640 140, 660 250 L 660 420`, stroke: '#8FBBD8', 'stroke-width': 6, fill: 'none' }, L);
    el('rect', { x: 580, y: 380, width: 170, height: 70, rx: 10, fill: 'rgba(150,210,245,.5)', stroke: '#8FBBD8', 'stroke-width': 4 }, L);
    const cyl = api.g(L, 660, 0);
    el('rect', { x: -26, y: 150, width: 52, height: 280, rx: 6, fill: 'rgba(150,210,245,.55)', stroke: '#8FBBD8', 'stroke-width': 4 }, cyl);
    st.gas = el('rect', { x: -22, y: 154, width: 44, height: 0, fill: '#F7FBFF' }, cyl);
    for (let v = 0; v <= 300; v += 50) { const y = 154 + v * 0.88; el('line', { x1: 14, x2: 24, y1: y, y2: y, stroke: '#2F6E9C', 'stroke-width': 2 }, cyl); api.text(cyl, 44, y + 5, String(v), 12, '#2F6E9C', 700); }
    api.text(cyl, 0, 140, 'Khí thu (mL)', 14, '#6C88A3', 700);
    st.vTxt = api.text(cyl, 0, 470, '0 mL', 17, '#1F4E79', 800);
    // lọ acid và khay kim loại
    st.bottle = A.bottle(api, L, 110, 450, 'HCl 2 M', '#CFE8F8');
    api.text(L, 110, 476, 'Acid loãng', 13, '#6C88A3', 700);
    st.tray = api.g(L, 230, 70);
    el('rect', { x: -70, y: 250, width: 140, height: 26, rx: 8, fill: '#F2F4F6', stroke: '#C9D3DC', 'stroke-width': 2 }, st.tray);
    st.tw = api.g(L, 230, 332); // kẹp gắp mẩu kim loại
    st.twPiece = el('rect', { x: -12, y: -8, width: 24, height: 16, rx: 3, fill: METAL.Mg.col, stroke: '#666', 'stroke-width': 1.5 }, st.tw);
    el('path', { d: 'M-4 -10 L-14 -70 M4 -10 L14 -70', stroke: '#6C7A89', 'stroke-width': 4, 'stroke-linecap': 'round' }, st.tw);
    api.text(L, 230, 370, 'Kẹp mẩu kim loại', 13, '#6C88A3', 700);
    // que đóm
    st.splint = api.g(L, 330, 290); st.splint.style.display = 'none';
    el('rect', { x: -4, y: -110, width: 8, height: 110, rx: 3, fill: '#C99A6B' }, st.splint);
    st.flame = el('path', { d: 'M0 -112 C -10 -126, -4 -140, 0 -150 C 4 -140, 10 -126, 0 -112 Z', fill: '#FFB020' }, st.splint);
    st.lens = NL.chem.lens(api, L, 175, 165, 82, { title: '🔍 Kính lúp hạt: trong ống nghiệm' });
    st.lens.g.style.display = 'none';
  }
  function drawPiece() {
    const M = METAL[st.metal], f = st.form;
    st.piece.innerHTML = '';
    if (f === 'bot') for (let k = 0; k < 14; k++) api0.el('circle', { cx: Math.random() * 30 - 15, cy: Math.random() * 6, r: 2.2, fill: M.col }, st.piece);
    else api0.el('rect', { x: f === 'la' ? -16 : -9, y: f === 'la' ? 0 : -6, width: f === 'la' ? 32 : 18, height: f === 'la' ? 4 : 12, rx: 2, fill: M.col, stroke: '#666', 'stroke-width': 1 }, st.piece);
    st.twPiece.setAttribute('fill', M.col);
  }
  let api0;
  function ions(frac) {
    const M = METAL[st.metal], an = ACID[st.acid].an, h = Math.round(8 * (1 - frac)), mi = Math.round(4 * frac);
    return [{ f: 'H⁺', n: h }, { f: an, n: st.acid === 'HCl' ? 7 : 4 }, { f: M.ion, n: M.k ? mi : 0 }, { f: 'H₂', n: M.k ? Math.round(3 * frac) : 0 }];
  }
  function sideTable(api) {
    if (!st.tbl) st.tbl = api.table(['Kim loại', 'Acid', 'Dạng', 'Khí 60 s', 'ΔT']);
    st.tbl.set(st.runs.map(r => [r.metal, ACID[r.acid].t.split(' ')[0], FORM[r.form].t, r.V + ' mL', '+' + r.dT.toFixed(1) + '°C']));
  }

  const steps = [
    {
      label: 'Chuẩn bị', text: 'Chọn acid rồi kéo lọ acid rót vào ống nghiệm', hint: 'Chọn HCl hoặc H₂SO₄ loãng ở bên phải, rồi kéo lọ acid vào ống nghiệm',
      enter(api) {
        sideTable(api);
        api.card({ kicker: '🥽 An toàn', text: 'Acid loãng vẫn ăn da và làm hỏng mắt. Luôn đeo kính bảo hộ, găng tay, cầm ống nghiệm hướng miệng ra xa người.', btn: 'Đã đeo kính ➜' });
        st.ctl = api.choices({ label: 'Acid loãng', items: [{ t: 'HCl 2 M', v: 'HCl' }, { t: 'H₂SO₄ 1 M', v: 'H2SO4' }], value: st.acid, onPick(v) { st.acid = v; st.bottle.querySelector('text').textContent = ACID[v].t; } });
        api.setOn(st.bottle, true);
        api.draggable(st.bottle, {
          target: { x: TX, y: 200, r: 110 }, onDrop: () => {
            st.ctl.remove(); NL.audio.play('pour');
            st.tube.fill(ACID[st.acid].col, 0.42); st.filled = true;
            api.tween(st.bottle, 110, 450, 500);
            api.done();
          }
        });
      }
    },
    {
      label: () => `Lần thử ${st.runs.length + 1}/3 · Chọn kim loại`, text: 'Chọn kim loại và dạng của mẩu kim loại', hint: 'Mỗi lần thử nên đổi một thứ: đổi kim loại hoặc đổi dạng (viên, lá, bột)',
      enter(api) {
        if (!st.runs.length && !api.prediction) api.ask({
          predict: true, q: 'Thả lần lượt Mg, Fe, Cu vào acid loãng. Em đoán kim loại nào sủi bọt mạnh nhất?',
          options: [{ t: 'Mg' }, { t: 'Fe' }, { t: 'Cu' }, { t: 'Cả ba như nhau' }]
        });
        const check = () => {
          const dup = st.runs.some(r => r.metal === st.metal && r.form === st.form && r.acid === st.acid);
          st.ctls[0].card.querySelector('div').textContent = dup ? 'Kim loại · lần trước đã thử, đổi một thứ nhé' : 'Kim loại';
          if (dup) api.hideNext(); else api.done('Gắp vào ống ➜');
        };
        st.ctls = [
          api.choices({ label: 'Kim loại', items: Object.keys(METAL).map(k => ({ t: k, v: k })), value: st.metal, onPick(v) { st.metal = v; drawPiece(); st.ctls && check(); } }),
          api.choices({ label: 'Dạng', items: Object.keys(FORM).map(k => ({ t: FORM[k].t, v: k })), value: st.form, onPick(v) { st.form = v; drawPiece(); st.ctls && check(); } })
        ];
        drawPiece(); check();
      },
      onNext(api) { st.ctls.forEach(c => c.remove()); st.ctls = null; api.goto(2); }
    },
    {
      label: () => `Lần thử ${st.runs.length + 1}/3 · Thả kim loại`, text: 'Kéo kẹp, thả mẩu kim loại vào ống nghiệm', hint: 'Kéo cái kẹp vào miệng ống nghiệm',
      enter(api) {
        st.tw.style.display = '';
        api.setOn(st.tw, true);
        api.draggable(st.tw, { target: { x: TX, y: 190, r: 110 }, onDrop: () => { st.tw.style.display = 'none'; api.place(st.tw, 230, 332); react(api); } });
      }
    },
    {
      label: () => `Lần thử ${st.runs.length}/3 · Thử khí`, text: 'Đưa que đóm đang cháy lại gần miệng ống đong khí', hint: 'Kéo que đóm tới miệng ống đong',
      enter(api) {
        st.splint.style.display = ''; api.place(st.splint, 330, 290);
        api.setOn(st.splint, true);
        api.draggable(st.splint, {
          target: { x: 660, y: 430, r: 120 }, snap: false, onDrop: () => {
            NL.audio.play('pop');
            const boom = api.el('circle', { cx: 660, cy: 430, r: 10, fill: '#FFD54A', opacity: .9 }, api.svg);
            let k = 0; api.loop(dt => { k += dt * 3; boom.setAttribute('r', 10 + k * 50); boom.setAttribute('opacity', Math.max(0, .9 - k)); if (k > 1) { boom.remove(); return false; } });
            st.gas.setAttribute('height', 0); st.vTxt.textContent = '0 mL';
            api.say('Nổ "bép" nhỏ: khí H₂ cháy với O₂ trong không khí tạo ra nước');
            api.tween(st.splint, 330, 290, 600, () => { st.splint.style.display = 'none'; });
            api.done();
          }
        });
      },
      onNext(api) { api.goto(4); }
    },
    {
      label: () => `Lần thử ${st.runs.length}/3 · Phương trình`, text: '', hint: 'Bấm nút ở góc dưới để đi tiếp',
      enter(api) {
        const r = st.runs[st.runs.length - 1];
        document.getElementById('stepText').innerHTML = NL.learn.decorate(eq(r.metal, r.acid));
        sideTable(api);
        const need = 3 - st.runs.length;
        api.done(need > 0 ? 'Thử kim loại khác ➜' : 'Xem biểu đồ ➜');
      },
      onNext(api) {
        resetTube();
        if (st.runs.length < 3) api.goto(1); else api.goto(5);
      }
    },
    {
      label: 'Kết quả', text: 'Thể tích khí H₂ thu được sau 60 giây', hint: 'Cột càng cao, kim loại phản ứng càng mạnh',
      enter(api) { st.lens.g.style.display = 'none'; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Mg', truth: 'Mg sủi bọt mạnh nhất, Fe chậm hơn nhiều, còn Cu không phản ứng.',
          sub: 'Dãy hoạt động: K, Na, Mg, Al, Zn, Fe, … H, Cu, Ag. Chỉ kim loại đứng trước H mới đẩy được H ra khỏi acid loãng.',
          result: result(),
          quiz: [{
            kicker: '❓ Vì sao?', q: 'Vì sao dạng bột phản ứng nhanh hơn dạng viên?',
            options: [
              { t: 'Bột có diện tích tiếp xúc với acid lớn hơn', ok: true },
              { t: 'Bột là một kim loại khác mạnh hơn', why: 'Vẫn là cùng một kim loại, chỉ khác kích thước mẩu. Thứ gì thay đổi khi nghiền nhỏ?' },
              { t: 'Bột nặng hơn nên chìm nhanh hơn', why: 'Khối lượng như nhau. Nghĩ tới phần bề mặt chạm vào acid nhé.' }
            ],
            explain: 'Nghiền nhỏ làm diện tích bề mặt tăng, nhiều nguyên tử kim loại chạm acid cùng lúc nên phản ứng nhanh hơn.'
          }]
        });
      }
    }
  ];

  function resetTube() {
    st.piece.style.display = 'none'; st.bub.innerHTML = '';
    st.tTxt.textContent = '25,0'; st.gas.setAttribute('height', 0); st.vTxt.textContent = '0 mL';
  }

  function react(api) {
    const M = METAL[st.metal], m = st.metal, f = st.form;
    st.piece.style.display = ''; drawPiece(); api.place(st.piece, TX, 426);
    st.lens.g.style.display = ''; st.lens.set(ions(0));
    api.say(M.k ? 'Quan sát bọt khí, nhiệt độ và khí thu được…' : 'Quan sát xem có gì xảy ra…');
    const card = api.panel(`<div>⏱ <span id="h1T">0</span> / ${DUR} giây</div><div class="big-num" style="font-size:22px"><span id="h1V">0</span> mL H₂</div>`);
    let t = 0, nb = 0;
    const bubbles = [];
    api.loop(dt => {
      t += dt * 5;
      const V = vol(m, f, Math.min(t, DUR)), rate = M.k ? Math.max(0, vol(m, f, t + 1) - vol(m, f, t)) : 0;
      nb += rate * dt * 2.2;
      while (nb > 1) { nb--; const b = api.el('circle', { cx: TX + (Math.random() * 30 - 15), cy: 425, r: 3 + Math.random() * 4, fill: 'rgba(255,255,255,.9)', stroke: '#9CC7E3', 'stroke-width': 1.5 }, st.bub); bubbles.push({ b, y: 425, v: 60 + Math.random() * 50 }); }
      for (let i = bubbles.length - 1; i >= 0; i--) { const o = bubbles[i]; o.y -= o.v * dt; o.b.setAttribute('cy', o.y); if (o.y < 340) { o.b.remove(); bubbles.splice(i, 1); } }
      const frac = V / VMAX, T = 25 + M.dT * frac;
      st.tTxt.textContent = T.toFixed(1).replace('.', ',');
      st.gas.setAttribute('height', Math.min(272, V * 0.88)); st.vTxt.textContent = Math.round(V) + ' mL';
      card.querySelector('#h1T').textContent = Math.min(DUR, Math.round(t)); card.querySelector('#h1V').textContent = Math.round(V);
      if (Math.random() < dt * 3) st.lens.set(ions(frac));
      if (m === 'Al' && t > 0.2 && t < M.delay && !st.alTold) { st.alTold = true; NL.game.toast('Nhôm có lớp oxide mỏng bảo vệ, vài giây đầu chưa sủi bọt'); }
      if (t >= DUR) {
        bubbles.forEach(o => o.b.remove()); card.remove();
        const r = { metal: m, acid: st.acid, form: f, V: Math.round(V), dT: M.dT * frac };
        st.runs.push(r); sideTable(api); st.lens.set(ions(frac));
        if (!M.k) {
          api.lesson({ title: 'Cu không tác dụng với acid loãng', text: 'Không có bọt khí nào! Đồng (Cu) đứng sau hydrogen trong dãy hoạt động hóa học nên không đẩy được H ra khỏi HCl hay H₂SO₄ loãng.', sub: 'Thử lại với Mg, Al, Zn hoặc Fe nhé. Lần thử này vẫn được ghi vào bảng.', btn: 'Đã hiểu ➜' }, () => api.goto(4));
        } else api.goto(3);
        return false;
      }
    });
  }

  function result() {
    const rows = st.runs;
    return {
      title: 'Kim loại tác dụng với acid', param: 'Kim loại, dạng mẩu, acid loãng',
      table: { head: ['Lần', 'Kim loại', 'Acid', 'Dạng', 'Thể tích H₂ sau 60 s (mL)', 'Nhiệt độ tăng (°C)', 'Phương trình'], rows: rows.map((r, i) => [i + 1, r.metal, ACID[r.acid].t, FORM[r.form].t, r.V, +r.dT.toFixed(1), eq(r.metal, r.acid)]) },
      chart: { labels: rows.map(r => `${r.metal} · ${FORM[r.form].t}`), yLabel: 'mL H₂ sau 60 giây', series: [{ name: 'Thể tích H₂', color: '#5BB4EA', values: rows.map(r => r.V) }] },
      conclusion: 'Kim loại đứng trước H trong dãy hoạt động hóa học tác dụng với acid loãng tạo muối và khí H₂, phản ứng tỏa nhiệt. Kim loại càng mạnh (Mg > Al > Zn > Fe) và mẩu càng nhỏ thì khí thoát ra càng nhanh. Cu đứng sau H nên không phản ứng',
      note: 'Fe tác dụng với HCl tạo FeCl₂ (sắt hóa trị II), không phải FeCl₃. HNO₃ và H₂SO₄ đặc tác dụng với kim loại theo cách khác, không giải phóng H₂.'
    };
  }

  NL.lab.register('H1', { goal: 'Kim loại nào "ăn" acid mạnh nhất? Khí thoát ra là khí gì?', build, steps });
})();
