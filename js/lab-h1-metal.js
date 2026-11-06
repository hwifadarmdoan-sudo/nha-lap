// Thí nghiệm H1: kim loại tác dụng với acid loãng, thu khí H₂, đo nhiệt độ, thử khí bằng que đóm.
(function () {
  const A = NL.art;
  // khả năng phản ứng (theo dãy hoạt động hóa học), Al có lớp oxide nên chậm vài giây đầu
  // Bảng kim loại theo dãy hoạt động hóa học (K Na Ca Mg Al Zn Fe Ni Sn Pb H Cu Ag Au). k: tốc độ; v: hóa trị trong muối; mm: khối lượng mol
  // Chế độ cơ bản dùng 5 kim loại đầu danh sách BASIC; chế độ Tự chọn cho chọn toàn bộ dãy
  const METAL = {
    K: { t: 'Potassium (K)', k: 0.6, dT: 40, col: '#B8B8B0', ion: 'K⁺', v: 1, mm: 39, delay: 0, danger: true },
    Na: { t: 'Sodium (Na)', k: 0.45, dT: 35, col: '#C8C8C0', ion: 'Na⁺', v: 1, mm: 23, delay: 0, danger: true },
    Ca: { t: 'Calcium (Ca)', k: 0.2, dT: 18, col: '#D0D0C8', ion: 'Ca²⁺', v: 2, mm: 40, delay: 0 },
    Mg: { t: 'Magnesium (Mg)', k: 0.075, dT: 9, col: '#C9CED6', ion: 'Mg²⁺', v: 2, mm: 24, delay: 0 },
    Al: { t: 'Aluminium (Al)', k: 0.05, dT: 7, col: '#D8DDE3', ion: 'Al³⁺', v: 3, mm: 27, delay: 4 },
    Zn: { t: 'Zinc (Zn)', k: 0.028, dT: 4, col: '#AEB8C2', ion: 'Zn²⁺', v: 2, mm: 65, delay: 0 },
    Fe: { t: 'Iron (Fe)', k: 0.011, dT: 2, col: '#7D7F82', ion: 'Fe²⁺', v: 2, mm: 56, delay: 0 },
    Ni: { t: 'Nickel (Ni)', k: 0.005, dT: 1, col: '#9EA3A8', ion: 'Ni²⁺', v: 2, mm: 59, delay: 0 },
    Sn: { t: 'Tin (Sn)', k: 0.003, dT: 0.6, col: '#B9BDC1', ion: 'Sn²⁺', v: 2, mm: 119, delay: 0 },
    Pb: { t: 'Lead (Pb)', k: 0, dT: 0, col: '#5F6670', ion: 'Pb²⁺', v: 2, mm: 207, delay: 0, passive: true },
    Cu: { t: 'Copper (Cu)', k: 0, dT: 0, col: '#C8743A', ion: 'Cu²⁺', v: 2, mm: 64, delay: 0 },
    Ag: { t: 'Silver (Ag)', k: 0, dT: 0, col: '#E6E8EA', ion: 'Ag⁺', v: 1, mm: 108, delay: 0 },
    Au: { t: 'Gold (Au)', k: 0, dT: 0, col: '#F2C94C', ion: 'Au³⁺', v: 3, mm: 197, delay: 0 }
  };
  const BASIC = ['Mg', 'Al', 'Zn', 'Fe', 'Cu'];
  const SERIES = Object.keys(METAL);
  // khối lượng mẩu ứng với 0,01 mol H₂: n(M) = 0,02/v mol
  const mass = m => { const M = METAL[m]; return 0.02 / M.v * M.mm; };
  const fmtG = m => NL.fmt(mass(m), 2) + ' g';
  const FORM = { vien: { t: 'Viên', f: 1 }, la: { t: 'Lá mỏng', f: 2 }, bot: { t: 'Bột', f: 4 } };
  const ACID = { HCl: { t: 'HCl 2 M', an: 'Cl⁻', col: 'rgba(200,230,250,.6)' }, H2SO4: { t: 'H₂SO₄ 1 M', an: 'SO₄²⁻', col: 'rgba(215,235,250,.6)' } };
  const VMAX = 248; // 0,01 mol H₂ ở 25 °C, 1 bar (24,79 L/mol)
  const DUR = 60;   // mỗi lần đo 60 giây (tua nhanh)
  const TX = 420;   // ống nghiệm
  let st;

  // tự viết và cân bằng phương trình theo hóa trị v của kim loại
  const SUB = '₀₁₂₃₄₅₆₇₈₉', sub = n => n === 1 ? '' : String(n).split('').map(d => SUB[d]).join('');
  function eq(m, a) {
    const M = METAL[m], v = M.v;
    if (!M.k) return `${m} + ${a === 'HCl' ? 'HCl' : 'H₂SO₄ loãng'} → không phản ứng${M.passive ? ' (muối ' + (a === 'HCl' ? 'PbCl₂' : 'PbSO₄') + ' ít tan bọc kín mẩu)' : ''}`;
    if (a === 'HCl') { const cM = v === 2 ? 1 : 2, cH = v === 2 ? 2 : 2 * v, cH2 = v === 2 ? 1 : v; return `${cM > 1 ? cM : ''}${m} + ${cH}HCl → ${cM > 1 ? cM : ''}${m}Cl${sub(v)} + ${cH2 > 1 ? cH2 : ''}H₂↑`; }
    const cM = v === 2 ? 1 : 2, cA = v === 2 ? 1 : v, cH2 = v === 2 ? 1 : v;
    const salt = v === 1 ? `${m}₂SO₄` : v === 2 ? `${m}SO₄` : `${m}₂(SO₄)₃`;
    return `${cM > 1 ? cM : ''}${m} + ${cA > 1 ? cA : ''}H₂SO₄ → ${salt} + ${cH2 > 1 ? cH2 : ''}H₂↑`;
  }
  const vol = (m, f, t) => { const M = METAL[m]; if (!M.k) return 0; const te = Math.max(0, t - M.delay); return VMAX * (1 - Math.exp(-M.k * FORM[f].f * te)); };

  function build(api) {
    const L = api.svg, el = api.el; api0 = api;
    st = { acid: 'HCl', metal: 'Mg', form: 'vien', runs: [], filled: false, free: false };
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
    // thu khí bằng cách đẩy nước: ống đong đầy nước úp ngược trong chậu nước, kẹp trên giá;
    // ống dẫn khí từ nút cao su của ống nghiệm đi xuống dưới mặt nước rồi luồn vào miệng ống đong
    el('rect', { x: TX - 28, y: 204, width: 56, height: 16, rx: 5, fill: '#5A4634' }, L); // nút cao su
    el('rect', { x: 580, y: 380, width: 170, height: 70, rx: 10, fill: 'rgba(150,210,245,.5)', stroke: '#8FBBD8', 'stroke-width': 4 }, L); // chậu nước
    api.text(L, 665, 466, 'Chậu nước', 12, '#6C88A3', 700);
    el('path', { d: `M${TX} 206 L${TX} 150 C ${TX} 110, 560 110, 560 200 L 560 438 Q 560 448 572 448 L 648 448 Q 660 448 660 436 L 660 420`, stroke: '#8FBBD8', 'stroke-width': 6, fill: 'none', 'stroke-linejoin': 'round' }, L);
    // giá và kẹp ống đong
    el('rect', { x: 760, y: 120, width: 10, height: 330, fill: '#6B7B8B' }, L); el('rect', { x: 735, y: 446, width: 60, height: 10, rx: 4, fill: '#4A5A6A' }, L);
    el('rect', { x: 690, y: 196, width: 72, height: 9, rx: 3, fill: '#6B7B8B' }, L);
    el('path', { d: 'M700 186 L690 186 L684 200 L690 214 L700 214', fill: 'none', stroke: '#4A5A6A', 'stroke-width': 4 }, L);
    el('path', { d: 'M630 186 L636 186 L642 200 L636 214 L630 214', fill: 'none', stroke: '#4A5A6A', 'stroke-width': 4 }, L);
    const cyl = api.g(L, 660, 0);
    el('rect', { x: -26, y: 150, width: 52, height: 280, rx: 6, fill: 'rgba(150,210,245,.55)', stroke: '#8FBBD8', 'stroke-width': 4 }, cyl);
    st.gas = el('rect', { x: -22, y: 154, width: 44, height: 0, fill: '#F7FBFF' }, cyl);
    st.cylBub = api.g(cyl, 0, 0);
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
    const lab = document.getElementById('h1Mass'); if (lab) lab.innerHTML = `${M.t}: mẩu <b>${fmtG(st.metal)}</b> (ứng với 0,01 mol H₂ = ${VMAX} mL nếu tan hết)${M.danger ? ' · <b style="color:#E5534B">kim loại kiềm, nguy hiểm</b>' : M.passive ? ' · muối ít tan bọc mẩu, coi như không phản ứng' : !M.k ? ' · đứng sau H, không phản ứng' : ''}`;
  }
  let api0;
  function ions(frac) {
    const M = METAL[st.metal], an = ACID[st.acid].an, h = Math.round(8 * (1 - frac)), mi = Math.round(4 * frac);
    return [{ f: 'H⁺', n: h }, { f: an, n: st.acid === 'HCl' ? 7 : 4 }, { f: M.ion, n: M.k ? mi : 0 }, { f: 'H₂', n: M.k ? Math.round(3 * frac) : 0 }];
  }
  function sideTable(api) {
    if (!st.tbl) st.tbl = api.table(['Kim loại', 'Mẩu', 'Acid', 'Dạng', 'Khí 60 s', 'ΔT']);
    st.tbl.set(st.runs.map(r => [r.metal, r.g, ACID[r.acid].t.split(' ')[0], FORM[r.form].t, r.V + ' mL', '+' + NL.fmt(r.dT, 1) + ' °C']));
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
        const build = () => {
          (st.ctls || []).forEach(c => c.remove());
          const list = st.free ? SERIES : BASIC;
          if (!list.includes(st.metal)) st.metal = list[0];
          st.ctls = [
            api.choices({ label: 'Chế độ', items: [{ t: '5 kim loại cơ bản', v: false }, { t: '🧪 Tự chọn cả dãy', v: true }], value: st.free, onPick(v) { st.free = v; build(); } }),
            api.choices({ label: 'Kim loại' + (st.free ? ' (theo dãy hoạt động, trái → phải yếu dần)' : ''), items: list.map(k => ({ t: k, v: k })), value: st.metal, onPick(v) { st.metal = v; drawPiece(); st.ctls && check(); } }),
            api.choices({ label: 'Dạng', items: Object.keys(FORM).map(k => ({ t: FORM[k].t, v: k })), value: st.form, onPick(v) { st.form = v; drawPiece(); st.ctls && check(); } }),
            api.panel('<div class="rep-sub" style="font-size:13px" id="h1Mass"></div>')
          ];
          drawPiece(); check();
        };
        build();
      },
      onNext(api) {
        st.ctls.forEach(c => c.remove()); st.ctls = null;
        const M = METAL[st.metal];
        if (M.danger) { api.lesson({ title: `Thả ${M.t} vào acid: nổ`, text: `${M.t} là kim loại kiềm, phản ứng mãnh liệt với cả nước lẫn acid: khí H₂ thoát ra ồ ạt, nhiệt tỏa ra làm H₂ bốc cháy, acid bắn tung tóe.`, sub: 'Bài học: không bao giờ thả kim loại kiềm vào acid trong phòng thí nghiệm. Phương trình: ' + eq(st.metal, st.acid) + '. Chọn kim loại khác nhé.', btn: '🔁 Chọn lại' }, () => api.goto(1)); return; }
        api.goto(2);
      }
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
          sub: 'Dãy hoạt động: K, Na, Ca, Mg, Al, Zn, Fe, Ni, Sn, Pb, H, Cu, Ag, Au. Chỉ kim loại đứng trước H mới đẩy được H ra khỏi acid loãng.',
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
      for (let i = bubbles.length - 1; i >= 0; i--) { const o = bubbles[i]; o.y -= o.v * dt; o.b.setAttribute('cy', o.y); if (o.y < (o.cyl ? 160 + Math.min(272, V * 0.88) : 340)) { o.b.remove(); bubbles.splice(i, 1); } }
      const frac = V / VMAX, T = 25 + M.dT * frac;
      st.tTxt.textContent = T.toFixed(1).replace('.', ',');
      st.gas.setAttribute('height', Math.min(272, V * 0.88)); st.vTxt.textContent = Math.round(V) + ' mL';
      if (rate > 0 && Math.random() < dt * rate * 1.2) { const cb = api.el('circle', { cx: Math.random() * 20 - 10, cy: 420, r: 2.5 + Math.random() * 2.5, fill: 'rgba(255,255,255,.9)', stroke: '#9CC7E3', 'stroke-width': 1 }, st.cylBub); bubbles.push({ b: cb, y: 420, v: 90 + Math.random() * 40, cyl: true }); }
      card.querySelector('#h1T').textContent = Math.min(DUR, Math.round(t)); card.querySelector('#h1V').textContent = Math.round(V);
      if (Math.random() < dt * 3) st.lens.set(ions(frac));
      if (m === 'Al' && t > 0.2 && t < M.delay && !st.alTold) { st.alTold = true; NL.game.toast('Aluminium có lớp oxide mỏng bảo vệ, vài giây đầu chưa sủi bọt'); }
      if (t >= DUR) {
        bubbles.forEach(o => o.b.remove()); card.remove();
        const r = { metal: m, acid: st.acid, form: f, V: Math.round(V), dT: M.dT * frac, g: fmtG(m) };
        st.runs.push(r); sideTable(api); st.lens.set(ions(frac));
        if (!M.k) {
          api.lesson({ title: `${M.t} không tác dụng với acid loãng`, text: M.passive ? `Chỉ sủi vài bọt rồi dừng! ${M.t} đứng trước H nhưng muối ${st.acid === 'HCl' ? 'PbCl₂' : 'PbSO₄'} tạo ra ít tan, bọc kín mẩu kim loại nên phản ứng gần như dừng ngay.` : `Không có bọt khí nào! ${M.t} đứng sau hydrogen trong dãy hoạt động hóa học nên không đẩy được H ra khỏi HCl hay H₂SO₄ loãng.`, sub: 'Thử lại với Mg, Al, Zn hoặc Fe nhé. Lần thử này vẫn được ghi vào bảng.', btn: 'Đã hiểu ➜' }, () => api.goto(4));
        } else api.goto(3);
        return false;
      }
    });
  }

  function result() {
    const rows = st.runs;
    return {
      title: 'Kim loại tác dụng với acid', param: 'Kim loại, dạng mẩu, acid loãng',
      table: { head: ['Lần', 'Kim loại', 'Khối lượng mẩu', 'Acid', 'Dạng', 'Thể tích H₂ sau 60 s (mL)', 'Nhiệt độ tăng (°C)', 'Phương trình'], rows: rows.map((r, i) => [i + 1, METAL[r.metal].t, r.g, ACID[r.acid].t, FORM[r.form].t, r.V, +r.dT.toFixed(1), eq(r.metal, r.acid)]) },
      chart: { labels: rows.map(r => `${r.metal} · ${FORM[r.form].t}`), yLabel: 'mL H₂ sau 60 giây', series: [{ name: 'Thể tích H₂', color: '#5BB4EA', values: rows.map(r => r.V) }] },
      conclusion: 'Kim loại đứng trước H trong dãy hoạt động hóa học tác dụng với acid loãng tạo muối và khí H₂, phản ứng tỏa nhiệt. Kim loại càng mạnh (Mg > Al > Zn > Fe) và mẩu càng nhỏ thì khí thoát ra càng nhanh. Cu đứng sau H nên không phản ứng',
      note: 'Fe tác dụng với HCl tạo FeCl₂ (sắt hóa trị II), không phải FeCl₃. HNO₃ và H₂SO₄ đặc tác dụng với kim loại theo cách khác, không giải phóng H₂.'
    };
  }

  NL.lab.register('H1', { goal: 'Kim loại nào "ăn" acid mạnh nhất? Khí thoát ra là khí gì?', build, steps });
})();
