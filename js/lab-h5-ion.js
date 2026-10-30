// Thí nghiệm H5: phản ứng trao đổi ion. Trộn hai dung dịch, thấy kết tủa, khí, nước hoặc không có gì,
// rồi chọn đúng các ion thật sự kết hợp để ghép phương trình ion thu gọn.
(function () {
  const A = NL.art, C = NL.chem.colorize;
  const SOL = {
    CuSO4: { t: 'CuSO₄', col: 'rgba(70,150,230,.65)', ions: ['Cu²⁺', 'SO₄²⁻'] },
    NaOH: { t: 'NaOH', col: 'rgba(220,240,255,.55)', ions: ['Na⁺', 'OH⁻'] },
    BaCl2: { t: 'BaCl₂', col: 'rgba(220,240,255,.55)', ions: ['Ba²⁺', 'Cl⁻'] },
    Na2CO3: { t: 'Na₂CO₃', col: 'rgba(220,240,255,.55)', ions: ['Na⁺', 'CO₃²⁻'] },
    HCl: { t: 'HCl', col: 'rgba(220,240,255,.55)', ions: ['H⁺', 'Cl⁻'] },
    NaCl: { t: 'NaCl', col: 'rgba(220,240,255,.55)', ions: ['Na⁺', 'Cl⁻'] },
    KNO3: { t: 'KNO₃', col: 'rgba(220,240,255,.55)', ions: ['K⁺', 'NO₃⁻'] }
  };
  const KEYS = Object.keys(SOL), BX = i => 80 + i * 95, BY = 525;
  // các cặp ion kết hợp được với nhau; type: kt (kết tủa), khi, nuoc
  const RULES = [
    { a: 'Cu²⁺', b: 'OH⁻', type: 'kt', prod: 'Cu(OH)₂', col: '#3E8FD9', eq: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓', see: 'Kết tủa xanh lam' },
    { a: 'Ba²⁺', b: 'SO₄²⁻', type: 'kt', prod: 'BaSO₄', col: '#F4F6F8', eq: 'Ba²⁺ + SO₄²⁻ → BaSO₄↓', see: 'Kết tủa trắng' },
    { a: 'Ba²⁺', b: 'CO₃²⁻', type: 'kt', prod: 'BaCO₃', col: '#F4F6F8', eq: 'Ba²⁺ + CO₃²⁻ → BaCO₃↓', see: 'Kết tủa trắng' },
    { a: 'Cu²⁺', b: 'CO₃²⁻', type: 'kt', prod: 'CuCO₃', col: '#5FB8A8', eq: 'Cu²⁺ + CO₃²⁻ → CuCO₃↓', see: 'Kết tủa xanh lục', note: 'Thực tế kết tủa là muối carbonate base của đồng, sách phổ thông viết gọn là CuCO₃.' },
    { a: 'H⁺', b: 'CO₃²⁻', type: 'khi', prod: 'CO₂', eq: '2H⁺ + CO₃²⁻ → CO₂↑ + H₂O', see: 'Sủi bọt khí' },
    { a: 'H⁺', b: 'OH⁻', type: 'nuoc', prod: 'H₂O', eq: 'H⁺ + OH⁻ → H₂O', see: 'Không thấy gì, nhưng ống ấm lên' }
  ];
  const TYPE = { kt: 'Kết tủa', khi: 'Sủi khí', nuoc: 'Tạo nước', none: 'Không phản ứng' };
  const MISSION = ['kt', 'khi', 'none'];
  // cặp gợi sẵn khi mở bảng chọn, để lần đầu bấm là trộn được ngay
  const SUGGEST = [['CuSO4', 'NaOH'], ['Na2CO3', 'HCl'], ['NaCl', 'KNO3'], ['BaCl2', 'CuSO4'], ['HCl', 'NaOH'], ['BaCl2', 'Na2CO3']];
  let st;

  const ruleOf = (a, b) => {
    const ions = SOL[a].ions.concat(SOL[b].ions);
    return RULES.find(r => ions.includes(r.a) && ions.includes(r.b)) || null;
  };

  function build(api) {
    const L = api.svg, el = api.el;
    st = { rows: [], found: {}, tried: {}, a: null, b: null, warned: false };
    st.bottles = KEYS.map((k, i) => A.bottle(api, L, BX(i), BY, SOL[k].t, SOL[k].col, { w: 64, h: 74, font: 13 }));
    st.badge = { A: api.text(L, 0, 0, 'A', 18, '#fff', 800), B: api.text(L, 0, 0, 'B', 18, '#fff', 800) };
    st.badgeBg = { A: el('circle', { r: 14, fill: '#2F80C0' }, L), B: el('circle', { r: 14, fill: '#E07B00' }, L) };
    ['A', 'B'].forEach(k => { L.appendChild(st.badge[k]); st.badgeBg[k].style.display = st.badge[k].style.display = 'none'; });
    // ống trộn
    st.tube = A.tube(api, L, 330, 400, { h: 230, w: 60, label: 'Ống trộn' });
    st.ppt = el('path', { d: '', fill: '#fff', opacity: 0 }, st.tube);
    st.bub = api.g(st.tube, 0, 0);
    st.heat = api.text(L, 420, 300, '', 16, '#E5534B', 800);
    st.pip = A.pipette(api, L, 0, 0, { len: 130, bulb: '#E07B00' }); st.pip.style.display = 'none';
    st.lens = NL.chem.lens(api, L, 590, 190, 86, { title: '🔍 Kính lúp hạt: trong ống trộn' }); st.lens.g.style.display = 'none';
  }
  function badge(k, key) {
    const bg = st.badgeBg[k], t = st.badge[k];
    if (!key) { bg.style.display = t.style.display = 'none'; return; }
    const x = BX(KEYS.indexOf(key)) + (k === 'A' ? -18 : 18), y = BY - 108;
    bg.style.display = t.style.display = '';
    bg.setAttribute('cx', x); bg.setAttribute('cy', y); t.setAttribute('x', x); t.setAttribute('y', y + 6);
  }
  function sideTable(api) {
    if (!st.tbl) st.tbl = api.table(['Trộn', 'Thấy', 'Loại']);
    st.tbl.set(st.rows.map(r => [C(`${SOL[r.a].t} + ${SOL[r.b].t}`), r.see, TYPE[r.type]]));
  }
  const missionHtml = () => '<div><b>Nhiệm vụ:</b> tìm đủ 3 kiểu</div><div style="margin-top:4px">' + MISSION.map(m => `${st.found[m] ? '✅' : '⬜'} ${TYPE[m]}`).join(' &nbsp; ') + '</div>';
  function reset() {
    st.tube.fill(null, 0); st.ppt.setAttribute('opacity', 0); st.bub.innerHTML = ''; st.heat.textContent = '';
    st.lens.set([]); st.lens.g.style.display = 'none';
  }
  function suggest() {
    const s = SUGGEST.find(p => !st.tried[p.join('+')] && !st.tried[p[1] + '+' + p[0]]) || SUGGEST[0];
    st.a = s[0]; st.b = s[1];
  }

  const steps = [
    {
      label: () => `Lần trộn ${st.rows.length + 1}`, text: 'Chọn dung dịch A trong ống và dung dịch B trong pipette, rồi kéo pipette nhỏ vào ống', hint: 'Chọn A, chọn B bên phải, rồi kéo pipette cam vào miệng ống trộn',
      enter(api) {
        sideTable(api); reset();
        if (!api.prediction) api.ask({ predict: true, q: 'Trộn dung dịch NaCl với dung dịch KNO₃ (đều trong suốt). Em đoán sẽ thấy gì?', options: [{ t: 'Có kết tủa trắng' }, { t: 'Sủi bọt khí' }, { t: 'Không có hiện tượng gì' }] });
        suggest();
        st.mis = api.panel(missionHtml());
        const items = KEYS.map(k => ({ t: C(SOL[k].t), v: k }));
        st.pickA = api.choices({ label: 'A: trong ống trộn', items, value: st.a, onPick(v) { st.a = v; ready(api); } });
        st.pickB = api.choices({ label: 'B: trong pipette', items, value: st.b, onPick(v) { st.b = v; ready(api); } });
        ready(api);
      }
    },
    {
      label: () => `Lần trộn ${st.rows.length + 1} · Phương trình`, text: 'Ion nào thật sự kết hợp với nhau? Chạm đúng 2 ion', hint: 'Nhìn kính lúp: hạt nào biến mất để tạo ra chất mới?',
      enter(api) {
        const r = st.rule;
        if (!r) {
          api.say('Không có kết tủa, khí hay nước tạo thành: không có phản ứng');
          api.card({ kicker: '🤷 Không có phản ứng', text: 'Bốn ion vẫn bơi tự do như trước khi trộn, không cặp nào kết hợp thành kết tủa, khí hay nước.', sub: 'Đây cũng là một kết quả đáng ghi lại!', btn: 'Ghi vào bảng ➜' }, () => record(api, 'Không có hiện tượng', 'none'));
          return;
        }
        chips(api);
      },
      onNext(api) { if (st.mis2) { st.mis2.remove(); st.mis2 = null; } api.goto(st.all ? 2 : 0); }
    },
    {
      label: 'Kết quả', text: 'Các kiểu phản ứng em đã tìm thấy', hint: 'Phản ứng trao đổi ion chỉ xảy ra khi tạo kết tủa, khí hoặc nước',
      enter(api) { st.lens.g.style.display = 'none'; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Không có hiện tượng gì', truth: 'Na⁺, Cl⁻, K⁺, NO₃⁻ không kết hợp được thành kết tủa, khí hay nước, nên chúng vẫn bơi tự do: không có phản ứng.',
          sub: 'Điều kiện để phản ứng trao đổi ion xảy ra: sản phẩm có chất kết tủa, chất khí hoặc chất điện li yếu như H₂O.',
          result: result(),
          quiz: [{
            kicker: '❓ Vì sao?', q: 'Trong phương trình ion thu gọn Cu²⁺ + 2OH⁻ → Cu(OH)₂↓, vì sao không viết Na⁺ và SO₄²⁻?',
            options: [
              { t: 'Vì chúng vẫn ở dạng ion tự do trước và sau phản ứng, không tham gia phản ứng', ok: true },
              { t: 'Vì chúng bay hơi mất', why: 'Ion trong dung dịch không bay hơi. Nhìn lại kính lúp: Na⁺ và SO₄²⁻ có thay đổi không?' },
              { t: 'Vì chúng quá nhỏ', why: 'Kích thước không quyết định. Câu hỏi là ion đó có kết hợp tạo chất mới hay không.' }
            ],
            explain: 'Na⁺ và SO₄²⁻ là ion khán giả: có mặt trong dung dịch nhưng không đổi. Phương trình ion thu gọn chỉ giữ những ion thật sự tạo ra chất mới.'
          }]
        });
      }
    }
  ];

  function ready(api) {
    badge('A', st.a); badge('B', st.b);
    st.tube.fill(SOL[st.a].col, 0.35);
    st.pip.style.display = 'none';
    if (st.a === st.b) { api.say('Chọn hai dung dịch khác nhau nhé'); return; }
    api.say(C(`Trộn ${SOL[st.a].t} với ${SOL[st.b].t}`));
    const bx = BX(KEYS.indexOf(st.b));
    st.pip.style.display = ''; st.pip.fill(SOL[st.b].col.replace(/[\d.]+\)$/, '.9)'));
    api.place(st.pip, bx, BY - 130); api.setOn(st.pip, true);
    api.draggable(st.pip, { target: { x: 330, y: 150, r: 80, sx: 330, sy: 150 }, onDrop: () => mix(api) });
  }
  function mix(api) {
    st.pickA.remove(); st.pickB.remove(); st.mis.remove();
    const a = st.a, b = st.b, r = st.rule = ruleOf(a, b);
    st.tried[a + '+' + b] = 1;
    let n = 0;
    const one = () => A.drop(api, api.svg, 330, 158, 290, SOL[b].col, () => { NL.audio.play('drop'); if (++n < 3) one(); else after(); });
    one();
    function after() {
      st.pip.empty(); st.pip.style.display = 'none';
      st.tube.fill(SOL[a].col, 0.6);
      const ions = SOL[a].ions.concat(SOL[b].ions);
      st.lens.g.style.display = ''; st.lens.set(ions.map(f => ({ f, n: 3 })));
      api.wait(1.2, () => {
        if (r && r.type === 'kt') {
          st.ppt.setAttribute('fill', r.col); st.ppt.setAttribute('stroke', '#C9D3DC');
          let t = 0; api.loop(dt => { t += dt; const k = Math.min(1, t / 1.5); st.ppt.setAttribute('opacity', 0.95); st.ppt.setAttribute('d', `M-27 ${-30 - 40 * k} Q0 ${-36 - 40 * k} 27 ${-30 - 40 * k} L27 -30 A27 27 0 0 1 -27 -30 Z`); if (k >= 1) return false; });
          NL.audio.play('pop');
        } else if (r && r.type === 'khi') {
          let t = 0, acc = 0; const bs = [];
          api.loop(dt => {
            t += dt; acc += 14 * dt;
            while (acc > 1) { acc--; bs.push({ e: api.el('circle', { cx: Math.random() * 36 - 18, cy: -20, r: 2 + Math.random() * 3, fill: 'rgba(255,255,255,.95)', stroke: '#9CC7E3' }, st.bub), y: -20 }); }
            for (let i = bs.length - 1; i >= 0; i--) { bs[i].y -= 80 * dt; bs[i].e.setAttribute('cy', bs[i].y); if (bs[i].y < -135) { bs[i].e.remove(); bs.splice(i, 1); } }
            if (t > 6) { bs.forEach(x => x.e.remove()); return false; }
          });
          NL.audio.play('bubble');
        } else if (r && r.type === 'nuoc') {
          st.heat.textContent = '🌡️ ống ấm lên'; NL.audio.play('hum');
        }
        api.say(r ? r.see : 'Không thấy gì thay đổi');
        api.wait(1, () => api.goto(1));
      });
    }
  }
  function chips(api) {
    const r = st.rule, ions = SOL[st.a].ions.concat(SOL[st.b].ions);
    const picked = {};
    const d = st.chip = api.panel(`<div>Chạm 2 ion kết hợp với nhau</div><div class="seg">${ions.map((f, i) => `<button class="seg-b pop ion-chip" data-i="${i}">${C(f)}</button>`).join('')}</div>`);
    d.querySelectorAll('.seg-b').forEach(btn => btn.addEventListener('click', () => {
      const f = ions[+btn.dataset.i];
      if (f === r.a || f === r.b) {
        NL.audio.play('ting'); picked[f] = 1; btn.classList.add('on'); btn.disabled = true;
        if (picked[r.a] && picked[r.b]) solved(api);
        return;
      }
      NL.audio.play('click');
      if (!st.warned) {
        st.warned = true;
        api.lesson({ title: 'Chọn nhầm ion khán giả', text: `${f} vẫn bơi tự do trong dung dịch cả trước và sau khi trộn. Nó không kết hợp với ion nào cả.`, sub: 'Bài học: phương trình ion thu gọn chỉ giữ những ion thật sự kết hợp thành kết tủa, khí hoặc nước. Ion không đổi gọi là ion khán giả, được bỏ đi.', btn: '🔁 Chọn lại' }, () => {});
      } else api.say(`${f} là ion khán giả, nó không đổi. Chọn ion khác nhé`);
      btn.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300 });
    }));
  }
  function solved(api) {
    const r = st.rule, ions = SOL[st.a].ions.concat(SOL[st.b].ions);
    st.chip.remove();
    // ion khán giả mờ dần, chỉ còn sản phẩm
    st.lens.set([{ f: r.prod === 'H₂O' ? 'H₂O' : r.prod, n: 4 }].concat(ions.filter(f => f !== r.a && f !== r.b).map(f => ({ f, n: 1 }))));
    api.wait(1.2, () => st.lens.set([{ f: r.prod, n: 4 }]));
    api.say(r.eq);
    const spect = ions.filter(f => f !== r.a && f !== r.b).filter((f, i, a) => a.indexOf(f) === i);
    api.card({ kicker: '✨ Phương trình ion thu gọn', text: r.eq, sub: `Ion khán giả (bỏ đi): ${spect.join(', ')}.` + (r.note ? ' ' + r.note : ''), btn: 'Ghi vào bảng ➜' }, () => record(api, r.see, r.type));
  }
  function record(api, see, type) {
    st.rows.push({ a: st.a, b: st.b, see, type, eq: st.rule ? st.rule.eq : '' }); st.found[type] = 1; sideTable(api);
    const all = st.all = MISSION.every(m => st.found[m]);
    if (st.mis2) st.mis2.remove();
    st.mis2 = api.panel(missionHtml());
    api.done(all ? 'Xem kết quả ➜' : 'Trộn cặp khác ➜');
  }

  function result() {
    const cnt = t => st.rows.filter(r => r.type === t).length;
    return {
      title: 'Phản ứng trao đổi ion trong dung dịch', param: `${st.rows.length} lần trộn, 7 dung dịch`,
      table: { head: ['Lần', 'Trộn', 'Hiện tượng', 'Phương trình ion thu gọn'], rows: st.rows.map((r, i) => [i + 1, `${SOL[r.a].t} + ${SOL[r.b].t}`, r.see, r.eq || 'Không phản ứng']) },
      chart: { labels: ['Kết tủa', 'Sủi khí', 'Tạo nước', 'Không phản ứng'], yLabel: 'Số lần trộn', series: [{ name: 'Số lần', color: '#9B6BD6', values: ['kt', 'khi', 'nuoc', 'none'].map(cnt) }] },
      conclusion: 'Phản ứng trao đổi ion chỉ xảy ra khi các ion kết hợp được thành chất kết tủa, chất khí hoặc chất điện li yếu (như H₂O). Phương trình ion thu gọn chỉ ghi những ion đó, bỏ các ion khán giả',
      note: 'Muốn biết chất nào kết tủa, dùng bảng tính tan ở cuối sách giáo khoa.'
    };
  }
  function auto(api) {
    if (st.chip && st.chip.isConnected) {
      const btn = [...st.chip.querySelectorAll('.seg-b')].find(b => !b.disabled && b.textContent && [st.rule.a, st.rule.b].includes(b.textContent));
      if (btn) { btn.click(); return 'chip'; }
    }
    return false;
  }

  NL.lab.register('H5', { goal: 'Trộn hai dung dịch trong suốt, khi nào mới có phản ứng?', build, steps, auto });
})();
