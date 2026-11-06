// Thí nghiệm L10: hiện tượng quang điện. Tế bào quang điện, đèn đổi bước sóng và cường độ, đường I–U, hiệu điện thế hãm, tìm giới hạn quang điện của kim loại bí ẩn.
(function () {
  const P = NL.phys, vn = P.vn, HC = 1240; // eV·nm
  const MET = { Cs: { t: 'Caesium (Cs)', l0: 580 }, K: { t: 'Kali (K)', l0: 550 }, Na: { t: 'Sodium (Na)', l0: 500 }, Zn: { t: 'Kẽm (Zn)', l0: 350 } };
  const KX = 352, AX = 500, CY = 240;
  let st, api_;
  const $ = id => document.getElementById(id);

  function wl2rgb(l) {
    let r = 0, g = 0, b = 0;
    if (l < 380) return '#B57BFF';
    if (l < 440) { r = (440 - l) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = (510 - l) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = (645 - l) / 65; } else r = 1;
    const h = v => Math.round(255 * Math.pow(v, 0.8)).toString(16).padStart(2, '0');
    return '#' + h(r) + h(g) + h(b);
  }
  function build(api) {
    api_ = api;
    const L = api.svg, el = api.el;
    st = { on: false, lam: 680, pw: 0.5, U: 2, met: 'Cs', rows: [], es: [], acc: 0, t: 0, myst: null };
    // đèn
    st.lamp = api.g(L, 110, 120);
    el('rect', { x: -44, y: -30, width: 88, height: 60, rx: 12, fill: '#4A5A6A' }, st.lamp);
    st.lens = el('circle', { cx: 44, cy: 0, r: 20, fill: '#2A3642', stroke: '#9AA9B7', 'stroke-width': 3 }, st.lamp);
    st.lampT = api.text(st.lamp, 0, 52, '💡 Chạm để bật đèn', 13, '#1F4E79', 800);
    st.beam = el('path', { d: `M150 104 L${KX + 4} ${CY - 60} L${KX + 4} ${CY + 60} L150 136 Z`, fill: '#f00', opacity: 0 }, L);
    st.ph = el('g', {}, L);
    // tế bào quang điện
    el('ellipse', { cx: 426, cy: CY, rx: 120, ry: 92, fill: 'rgba(220,240,255,.35)', stroke: '#9AA9B7', 'stroke-width': 3 }, L);
    st.cath = el('path', { d: `M${KX} ${CY - 62} Q${KX - 26} ${CY} ${KX} ${CY + 62}`, fill: 'none', stroke: '#C9A227', 'stroke-width': 9 }, L);
    el('line', { x1: AX, y1: CY - 50, x2: AX, y2: CY + 50, stroke: '#6C7A88', 'stroke-width': 7 }, L);
    api.text(L, KX - 18, CY - 72, 'K', 15, '#1F4E79', 800); api.text(L, AX + 4, CY - 60, 'A', 15, '#1F4E79', 800);
    st.metT = api.text(L, KX - 10, CY + 104, '', 12, '#6C88A3', 800);
    st.eg = el('g', {}, L);
    // mạch ngoài
    el('path', { d: `M${KX} ${CY + 62} L${KX} 400 L380 400 M470 400 L${AX} 400 L${AX} ${CY + 50}`, fill: 'none', stroke: '#4A5A6A', 'stroke-width': 4 }, L);
    const src = api.g(L, 425, 400); el('rect', { x: -45, y: -18, width: 90, height: 36, rx: 8, fill: '#F7F9FB', stroke: '#4A5A6A', 'stroke-width': 3 }, src); st.srcT = api.text(src, 0, 6, '', 13, '#1F4E79', 800);
    st.uA = P.meter(api, L, 670, 120, { label: 'microampe kế', sym: 'μA', unit: 'μA', max: 60, r: 46, d: 1 });
    st.info = [0, 1].map(k => api.text(L, 425, 452 + k * 24, '', 14, k ? '#6C88A3' : '#1F4E79', 800));
    api.loop(tick);
  }
  const l0 = () => MET[st.myst || st.met].l0;
  function calc() {
    const eps = HC / st.lam, A = HC / l0(), K = eps - A;
    if (!st.on || K <= 0) return { eps, A, K: Math.max(0, K), Uh: 0, Ibh: 0, I: 0 };
    const Ibh = 48 * st.pw * st.lam / 550, Uh = K;
    const I = st.U <= -Uh ? 0 : Ibh * (1 - Math.exp(-(st.U + Uh) / 0.35));
    return { eps, A, K, Uh, Ibh, I };
  }
  function tick(dt) {
    const c = calc(), col = wl2rgb(st.lam), el = api_.el;
    st.t += dt;
    st.beam.setAttribute('fill', col); st.beam.setAttribute('opacity', st.on ? 0.12 + 0.3 * st.pw : 0);
    st.lens.setAttribute('fill', st.on ? col : '#2A3642');
    // photon chạy theo chùm sáng
    st.ph.innerHTML = '';
    if (st.on) { const n = Math.round(3 + 9 * st.pw); for (let k = 0; k < n; k++) { const u = ((st.t * 0.9 + k / n) % 1), y = 120 + (k % 5 - 2) * 10 * (0.3 + u); el('circle', { cx: 150 + u * (KX - 150), cy: y + (CY - 120) * u, r: 3.5, fill: col }, st.ph); } }
    // electron bứt ra khỏi cathode
    if (c.Ibh > 0) { st.acc += dt * c.Ibh * 0.35; while (st.acc > 1) { st.acc -= 1; st.es.push({ x: KX + 4, y: CY + (Math.random() - 0.5) * 100, v: Math.sqrt(Math.random() * c.K) * 160 + 10 }); } }
    const a = st.U * 25600 / (2 * (AX - KX));
    st.es = st.es.filter(e => { e.v += a * dt; e.x += e.v * dt; return e.x > KX && e.x < AX; });
    if (st.es.length > 80) st.es.splice(0, st.es.length - 80);
    st.eg.innerHTML = ''; st.es.forEach(e => el('circle', { cx: e.x, cy: e.y, r: 3.5, fill: '#4FE3FF', stroke: '#1F4E79', 'stroke-width': 1 }, st.eg));
    st.uA.set(c.I, vn(c.I, 1) + ' μA');
    st.srcT.textContent = `U_AK = ${vn(st.U, 1)} V`;
    st.metT.textContent = st.myst ? 'Cathode: kim loại bí ẩn' : 'Cathode: ' + MET[st.met].t;
    st.info[0].textContent = st.on ? `λ = ${st.lam} nm${st.lam < 380 ? ' (tử ngoại)' : ''} · cường độ ${Math.round(st.pw * 100)}%` : 'Đèn đang tắt';
    st.info[1].textContent = st.on ? `Năng lượng 1 photon ε = hc/λ = ${vn(c.eps, 2)} eV` : '';
  }
  function sideTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['U_AK (V)', 'I (μA)']);
    st.tbl.set(st.rows.slice(-6).map(r => [vn(r.U, 1), vn(r.I, 1)]));
  }
  function lamSlider(api, o) { st.cL = api.slider({ label: 'Bước sóng ánh sáng λ', min: 200, max: 700, step: 10, value: st.lam, unit: 'nm', onInput(v) { st.lam = v; o && o(v); } }); }
  function pwSlider(api, o) { st.cP = api.slider({ label: 'Cường độ đèn', min: 0, max: 100, step: 5, value: Math.round(st.pw * 100), unit: '%', onInput(v) { st.pw = v / 100; o && o(v); } }); }

  const steps = [
    {
      label: 'Bật đèn', text: 'Cathode làm bằng caesium, giới hạn quang điện λ₀ = 580 nm. Bật đèn đỏ chiếu vào cathode', hint: 'Chạm vào đèn',
      enter(api) {
        if (!api.prediction) api.ask({ predict: true, q: 'Chiếu ánh sáng đỏ (680 nm) thật mạnh vào cathode caesium có λ₀ = 580 nm. Có dòng quang điện không?', options: [{ t: 'Không, đèn mạnh mấy cũng không có' }, { t: 'Có, vì đèn rất mạnh' }, { t: 'Có nhưng rất yếu' }] });
        api.setOn(st.lamp, true);
        api.tapable(st.lamp, () => { st.on = true; st.lampT.textContent = '💡 Đèn đang sáng'; NL.audio.play('click'); api.say('Ánh sáng đỏ chiếu đầy cathode, nhưng kim microampe kế vẫn đứng ở 0'); api.done('Tìm cách tạo dòng điện ➜'); });
      }
    },
    {
      label: 'Tạo dòng điện', text: 'Kim vẫn đứng yên. Đổi đèn thế nào để có dòng quang điện?', hint: 'Thử cả hai thanh trượt: cường độ và bước sóng',
      enter(api) {
        st.lessonRed = false;
        pwSlider(api); lamSlider(api);
        let hold = 0;
        api.loop(dt => {
          const c = calc();
          if (st.pw >= 0.95 && c.Ibh === 0 && !st.lessonRed) { hold += dt; if (hold > 1) { st.lessonRed = true; P.alarm(api); api.lesson({ title: 'Ánh sáng có bước sóng dài hơn λ₀ thì đèn mạnh mấy cũng không bứt được electron', text: `Đèn đã bật hết cỡ mà kim vẫn ở 0. Mỗi photon chỉ có ${vn(c.eps, 2)} eV, ít hơn công thoát ${vn(c.A, 2)} eV của caesium.`, sub: 'Bài học: một photon chỉ trao năng lượng cho một electron. Đèn mạnh hơn là nhiều photon hơn, nhưng photon nào cũng yếu như nhau. Phải dùng ánh sáng có λ ≤ λ₀.', btn: '🎨 Thử đổi bước sóng' }, () => {}); } } else hold = 0;
          if (c.I > 2) { NL.audio.play('ting'); api.say(`Có dòng điện rồi! λ = ${st.lam} nm ngắn hơn λ₀ = 580 nm, electron bị bứt ra và bay sang anode`); api.done('Vẽ đường I–U ➜'); return false; }
        });
      }
    },
    {
      label: () => `Đường I–U · ${P.cnt(st.rows.length, 6, 'điểm')}`, text: 'Đèn lam 450 nm, cường độ 80%. Đổi U_AK rồi bấm Ghi. Ghi 6 điểm, có cả U_AK âm làm dòng về 0 và U_AK dương lớn', hint: 'U_AK âm thì điện trường đẩy electron quay về cathode',
      enter(api) {
        st.lam = 450; st.pw = 0.8; st.U = 0;
        sideTable(api);
        st.cU = api.slider({ label: 'Hiệu điện thế U_AK', min: -3, max: 5, step: 0.1, value: st.U, unit: 'V', onInput(v, ctl) { st.U = v; ctl.warn(v < 0 ? 'U_AK âm: điện trường hãm electron' : ''); } });
        P.recButton(api, '📌 Ghi số liệu', () => {
          const c = calc();
          if (st.rows.some(r => Math.abs(r.U - st.U) < 0.15)) { NL.game.toast('U_AK này gần lần trước, chọn giá trị khác'); return; }
          st.rows.push({ U: st.U, I: Math.max(0, P.measure(c.I, 0.015, 0.1)) }); sideTable(api); NL.audio.play('ting');
          $('stepNo').textContent = `Đường I–U · ${P.cnt(st.rows.length, 6, 'điểm')}`;
          if (st.rows.length >= 6) { const z = st.rows.some(r => r.U < 0 && r.I === 0), s = st.rows.some(r => r.U >= 2); if (z && s) api.done('Sang kim loại bí ẩn ➜'); else NL.game.toast(z ? 'Cần một điểm U_AK từ 2 V trở lên' : 'Cần một điểm U_AK âm mà dòng về đúng 0'); }
        });
      }
    },
    {
      label: 'Nhiệm vụ', text: 'Cathode đã được thay bằng một kim loại bí ẩn. Quét bước sóng để tìm giới hạn quang điện λ₀ rồi đoán xem đó là kim loại gì', hint: 'Tìm bước sóng dài nhất mà vẫn còn dòng điện',
      enter(api) {
        st.myst = ['Na', 'K', 'Zn'][Math.floor(Math.random() * 3)]; st.U = 1; st.pw = 0.8; st.lam = 650;
        lamSlider(api);
        const d = api.panel('<button class="btn pop">🔍 Đã tìm ra λ₀</button>');
        d.querySelector('button').addEventListener('click', () => api.ask({
          q: 'Kim loại bí ẩn làm cathode là?',
          options: ['Na', 'K', 'Zn'].map(k => ({ t: `${MET[k].t}, λ₀ = ${MET[k].l0} nm`, ok: k === st.myst, why: 'Quét lại λ: tìm chỗ dòng điện vừa mất. λ₀ là bước sóng dài nhất còn gây ra quang điện.' })),
          explain: `Dòng điện chỉ có khi λ ≤ ${MET[st.myst].l0} nm, nên đó là ${MET[st.myst].t}. Công thoát A = hc/λ₀ = ${vn(HC / MET[st.myst].l0, 2)} eV.`
        }, () => { st.myst = null; api.done('Xem kết quả ➜'); }));
      }
    },
    {
      label: 'Kết quả', text: 'Đường đặc trưng vôn–ampe của tế bào quang điện', hint: 'Dòng bão hòa khi U_AK lớn, về 0 khi U_AK ≤ −U_h',
      enter(api) { st.lam = 450; st.pw = 0.8; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Không, đèn mạnh mấy cũng không có', truth: 'Ánh sáng 680 nm có λ > λ₀ = 580 nm của caesium, nên dù cường độ lớn cũng không gây ra quang điện.',
          sub: 'Quang điện chỉ xảy ra khi λ ≤ λ₀. Cường độ sáng chỉ quyết định dòng bão hòa, không quyết định có hay không có quang điện.',
          result: result(),
          quiz: [{
            kicker: '❓ Cường độ', q: 'Giữ nguyên λ = 450 nm, tăng cường độ đèn gấp đôi. Đường I–U thay đổi thế nào?',
            options: [{ t: 'Dòng bão hòa tăng gấp đôi, U_h không đổi', ok: true }, { t: 'U_h tăng gấp đôi', why: 'U_h chỉ phụ thuộc năng lượng mỗi photon, tức phụ thuộc λ.' }, { t: 'Không đổi gì', why: 'Nhiều photon hơn thì nhiều electron bị bứt ra hơn.' }],
            explain: 'Cường độ sáng tăng thì số photon tăng, số electron bứt ra tăng, dòng bão hòa tăng. Động năng ban đầu cực đại của electron, và do đó U_h, chỉ phụ thuộc λ.'
          }]
        });
      }
    }
  ];

  function result() {
    const keep = { lam: st.lam, pw: st.pw, U: st.U, on: st.on, myst: st.myst }, th = [];
    Object.assign(st, { lam: 450, pw: 0.8, on: true, myst: null, met: 'Cs' });
    for (let U = -3; U <= 5.001; U += 0.1) { st.U = U; th.push([+U.toFixed(1), +calc().I.toFixed(2)]); }
    const Uh = calc().Uh; Object.assign(st, keep);
    return {
      title: 'Hiện tượng quang điện: đường I–U', param: 'Cathode caesium (λ₀ = 580 nm), ánh sáng 450 nm, cường độ 80%',
      table: { head: ['Lần', 'U_AK (V)', 'I (μA)'], rows: st.rows.map((r, k) => [k + 1, vn(r.U, 1), vn(r.I, 1)]) },
      chart: { type: 'line', xLabel: 'U_AK (V)', yLabel: 'I (μA)', xMin: -3, xMax: 5, yMin: 0, yMax: 50, marks: [], series: [{ name: `Lí thuyết, U_h = ${vn(Uh, 2)} V`, color: '#9AA9B7', dash: true, points: th }, { name: 'Em đo', color: '#E86A92', dots: true, points: st.rows.map(r => [r.U, r.I]) }] },
      conclusion: 'Hiện tượng quang điện chỉ xảy ra khi bước sóng ánh sáng λ ≤ λ₀ của kim loại. Khi U_AK đủ lớn, dòng quang điện đạt giá trị bão hòa tỉ lệ với cường độ sáng. Khi U_AK ≤ −U_h thì dòng bằng 0, với eU_h = hc/λ − A',
      note: `Với caesium và ánh sáng 450 nm: ε = ${vn(HC / 450, 2)} eV, A = ${vn(HC / 580, 2)} eV, nên U_h ≈ ${vn(Uh, 2)} V.`
    };
  }
  function auto(api) {
    const k = api.step;
    if (k === 1) { if (!st.lessonRed) { if (st.pw < 1) { st.cP.set(100); return 'max'; } return 'hold'; } if (st.lam > 450) { st.cL.set(450); return 'blue'; } return 'watch'; }
    if (k === 2) { const tg = [-2, -0.4, 0, 0.5, 1.5, 3][st.rows.length % 6]; if (Math.abs(st.U - tg) > 0.05) { st.cU.set(tg); return 'set'; } }
    if (k === 3) { if (st.lam !== 300) { st.cL.set(300); return 'scan'; } }
    return false;
  }

  NL.lab.register('L10', { clearSide: true, auto, goal: 'Ánh sáng có thể đánh bật electron ra khỏi kim loại không? Đèn mạnh hơn thì có chắc được không?', build, steps });
})();
