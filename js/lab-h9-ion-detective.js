// Thí nghiệm H9: thám tử ion kim loại. 4 ống bí ẩn chứa Cu²⁺, Fe³⁺, Fe²⁺, Al³⁺.
// Nhỏ NaOH, nhỏ thêm NaOH dư, để ngoài không khí, rồi mới kết luận.
(function () {
  const A = NL.art;
  const ION = {
    'Cu²⁺': { salt: 'CuSO₄', an: 'SO₄²⁻', sol: 'rgba(90,165,235,.6)', ppt: '#3E8FD9', pf: 'Cu(OH)₂', see: 'Kết tủa xanh lam', eq: 'Cu²⁺ + 2OH⁻ → Cu(OH)₂↓' },
    'Fe³⁺': { salt: 'FeCl₃', an: 'Cl⁻', sol: 'rgba(225,170,60,.6)', ppt: '#A0461E', pf: 'Fe(OH)₃', see: 'Kết tủa nâu đỏ', eq: 'Fe³⁺ + 3OH⁻ → Fe(OH)₃↓' },
    'Fe²⁺': { salt: 'FeSO₄', an: 'SO₄²⁻', sol: 'rgba(170,215,170,.55)', ppt: '#C9DCC4', pf: 'Fe(OH)₂', see: 'Kết tủa trắng xanh', eq: 'Fe²⁺ + 2OH⁻ → Fe(OH)₂↓' },
    'Al³⁺': { salt: 'AlCl₃', an: 'Cl⁻', sol: 'rgba(225,240,255,.5)', ppt: '#F2F4F6', pf: 'Al(OH)₃', see: 'Kết tủa trắng dạng keo', eq: 'Al³⁺ + 3OH⁻ → Al(OH)₃↓' }
  };
  const IONS = Object.keys(ION), TX = i => 130 + i * 120, TY = 470;
  let st;

  function build(api) {
    const L = api.svg, el = api.el;
    const order = IONS.slice().sort(() => Math.random() - 0.5);
    st = { order, cur: 0, solved: {}, ev: {}, rows: [], tries: {} };
    st.tubes = order.map((ion, i) => {
      const t = A.tube(api, L, TX(i), TY, { h: 170, w: 42, label: `Ống ${i + 1}`, color: ION[ion].sol, k: 0.45 });
      t.ppt = el('path', { d: '', fill: ION[ion].ppt, stroke: '#B8C4CE', 'stroke-width': 1, opacity: 0 }, t);
      t.tag = api.text(t, 0, 30, '?', 18, '#9B6BD6', 800);
      return t;
    });
    st.naoh = A.dropper(api, L, 650, 470, 'NaOH', 'rgba(220,240,255,.9)');
    api.text(st.naoh, 0, 62, 'NaOH loãng', 12, '#1F4E79', 800);
    st.lens = NL.chem.lens(api, L, 600, 200, 78, { title: '🔍 Kính lúp hạt' }); st.lens.g.style.display = 'none';
  }
  const tube = () => st.tubes[st.cur], ionOf = () => st.order[st.cur];
  function pptShape(t, k) { t.ppt.setAttribute('d', `M-19 ${-21 - 30 * k} Q0 ${-26 - 30 * k} 19 ${-21 - 30 * k} L19 -21 A19 19 0 0 1 -19 -21 Z`); t.ppt.setAttribute('opacity', k ? 0.95 : 0); }
  function sideTable(api) {
    if (!st.tbl) st.tbl = api.table(['Ống', 'Dấu hiệu', 'Ion']);
    st.tbl.set(st.rows.map(r => [r.i + 1, r.see, r.ion]));
  }
  function drops(api, x, n, cb) {
    let k = 0; const one = () => A.drop(api, api.svg, x, 300, 400, 'rgba(200,225,250,.9)', () => { NL.audio.play('drop'); if (++k < n) one(); else cb(); });
    api.place(st.naoh, x, 255); one();
  }

  const steps = [
    {
      label: () => `Ống ${st.cur + 1} · Nhỏ NaOH`, get text() { return 'Chọn một ống bí ẩn rồi kéo lọ NaOH nhỏ vào'; }, hint: 'Chọn ống bên phải, kéo lọ NaOH lên miệng ống',
      enter(api) {
        sideTable(api);
        if (!api.prediction) api.ask({ predict: true, q: 'Nhỏ NaOH vào dung dịch chứa Fe²⁺. Kết tủa vừa tạo ra có màu gì?', options: [{ t: 'Trắng xanh' }, { t: 'Nâu đỏ' }, { t: 'Xanh lam' }] });
        api.place(st.naoh, 650, 470); st.lens.g.style.display = 'none';
        const left = st.order.map((_, i) => i).filter(i => !st.solved[i]);
        if (st.solved[st.cur]) st.cur = left[0];
        st.pick = api.choices({ label: 'Ống bí ẩn', items: left.map(i => ({ t: `Ống ${i + 1}`, v: i })), value: st.cur, onPick(v) { st.cur = v; target(api); } });
        target(api);
      }
    },
    {
      label: () => `Ống ${st.cur + 1} · Điều tra`, text: 'Thu thêm dấu hiệu, khi chắc chắn thì chọn ion', hint: 'Có thể nhỏ thêm NaOH dư hoặc để ống ngoài không khí một lúc',
      enter(api) { investigate(api); },
      onNext(api) { api.goto(Object.keys(st.solved).length >= 4 ? 2 : 0); }
    },
    {
      label: 'Kết quả', text: 'Màu kết tủa của từng ion với NaOH', hint: 'Mỗi ion có một "dấu vân tay" riêng',
      enter(api) { st.lens.g.style.display = 'none'; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Trắng xanh', truth: 'Fe(OH)₂ ban đầu màu trắng xanh, để ngoài không khí bị oxygen oxi hóa dần thành Fe(OH)₃ màu nâu đỏ.',
          sub: 'Vì vậy muốn phân biệt Fe²⁺ với Fe³⁺ phải nhìn ngay lúc đầu, rồi để một lúc xem màu có đổi không.',
          result: result(),
          quiz: [{
            kicker: '❓ Vì sao?', q: 'Cả Al³⁺ và Fe²⁺ đều cho kết tủa sáng màu. Làm sao chắc chắn ống nào chứa Al³⁺?',
            options: [
              { t: 'Nhỏ NaOH dư: kết tủa Al(OH)₃ tan ra, dung dịch trong trở lại', ok: true },
              { t: 'Ngửi mùi kết tủa', why: 'Không ngửi hóa chất. Al(OH)₃ có tính chất gì đặc biệt với NaOH dư?' },
              { t: 'Đun sôi ống nghiệm', why: 'Đun không giúp phân biệt rõ. Thử nhỏ thêm NaOH xem kết tủa nào tan.' }
            ],
            explain: 'Al(OH)₃ lưỡng tính nên tan trong NaOH dư: Al(OH)₃ + OH⁻ → [Al(OH)₄]⁻. Fe(OH)₂ không tan mà hóa nâu đỏ khi để ngoài không khí.'
          }]
        });
      }
    }
  ];

  function target(api) {
    api.setOn(st.naoh, true);
    const x = TX(st.cur);
    api.draggable(st.naoh, { target: { x, y: 255, r: 70, sx: x, sy: 255 }, onDrop: () => {
      st.pick.remove();
      const ion = ionOf(), t = tube(), d = ION[ion];
      st.ev[st.cur] = st.ev[st.cur] || { naoh: 0, wait: 0 };
      st.lens.g.style.display = ''; st.lens.caption(`🔍 Kính lúp: ống ${st.cur + 1}`);
      st.lens.set([{ f: ion, n: 4 }, { f: d.an, n: 3 }]);
      drops(api, x, 3, () => {
        st.ev[st.cur].naoh = 1;
        let k = 0; api.loop(dt => { k = Math.min(1, k + dt / 1.2); pptShape(t, k); if (k >= 1) return false; });
        st.lens.set([{ f: d.pf, n: 4 }, { f: 'Na⁺', n: 3 }, { f: d.an, n: 3 }]);
        api.say(`${d.see}. ${d.eq}`);
        api.wait(1.3, () => api.goto(1));
      });
    } });
  }
  function investigate(api) {
    const i = st.cur, ion = ionOf(), t = tube(), d = ION[ion], ev = st.ev[i];
    api.place(st.naoh, 650, 470);
    const p = st.inv = api.panel(`<div><b>Dấu hiệu thêm</b></div><div class="seg" style="margin-bottom:8px"><button class="seg-b pop" data-a="more">💧 Nhỏ thêm NaOH dư</button><button class="seg-b pop" data-a="wait">⏳ Để ngoài không khí</button></div><div><b>Ống ${i + 1} chứa ion</b></div><div class="seg">${IONS.map(x => `<button class="seg-b pop" data-ion="${x}">${NL.chem.colorize(x)}</button>`).join('')}</div>`);
    p.querySelector('[data-a="more"]').addEventListener('click', e => {
      e.currentTarget.disabled = true; ev.more = 1; st.busy = true;
      drops(api, TX(i), 4, () => {
        api.place(st.naoh, 650, 470); api.wait(1.6, () => { st.busy = false; });
        if (ion === 'Al³⁺') {
          let k = 1; api.loop(dt => { k = Math.max(0, k - dt / 1.5); pptShape(t, k); if (k <= 0) return false; });
          st.lens.set([{ f: 'Al(OH)₄⁻', n: 4 }, { f: 'Na⁺', n: 4 }, { f: 'Cl⁻', n: 3 }]);
          api.say('Kết tủa tan hết, dung dịch trong trở lại! Al(OH)₃ + OH⁻ → [Al(OH)₄]⁻');
        } else api.say('Nhỏ thêm NaOH dư: kết tủa không tan');
      });
    });
    p.querySelector('[data-a="wait"]').addEventListener('click', e => {
      e.currentTarget.disabled = true; ev.wait = 1; st.busy = true; NL.audio.play('hum');
      api.say('⏳ Để ống ngoài không khí…');
      api.wait(2, () => {
        api.wait(ion === 'Fe²⁺' ? 2.6 : 0.3, () => { st.busy = false; });
        if (ion === 'Fe²⁺') {
          let k = 0; api.loop(dt => {
            k = Math.min(1, k + dt / 2.5);
            t.ppt.setAttribute('fill', `rgb(${Math.round(201 - 41 * k)},${Math.round(220 - 150 * k)},${Math.round(196 - 166 * k)})`);
            if (k >= 1) return false;
          });
          st.lens.set([{ f: 'Fe(OH)₃', n: 4 }, { f: 'O₂', n: 2 }, { f: 'Na⁺', n: 3 }, { f: 'SO₄²⁻', n: 2 }]);
          api.say('Kết tủa trắng xanh chuyển dần sang nâu đỏ! 4Fe(OH)₂ + O₂ + 2H₂O → 4Fe(OH)₃');
        } else api.say('Sau một lúc, màu kết tủa không đổi');
      });
    });
    p.querySelectorAll('[data-ion]').forEach(b => b.addEventListener('click', () => {
      const pick = b.dataset.ion;
      if (st.busy) { api.say('Đợi xem dấu hiệu xong đã nhé'); return; }
      st.tries[i] = (st.tries[i] || 0) + 1;
      if (pick !== ion) {
        NL.audio.play('click');
        const hint = ion === 'Fe²⁺' && !ev.wait ? 'Kết tủa của Fe²⁺ lúc đầu trông gần giống Al³⁺. Để ống ngoài không khí một lúc xem màu có đổi không.'
          : ion === 'Al³⁺' && !ev.more ? 'Kết tủa trắng có thể là Al³⁺ hoặc Fe²⁺. Thử nhỏ NaOH dư xem kết tủa có tan không.'
          : 'So lại màu kết tủa: xanh lam là Cu²⁺, nâu đỏ ngay từ đầu là Fe³⁺, trắng xanh rồi hóa nâu là Fe²⁺, trắng rồi tan trong NaOH dư là Al³⁺.';
        api.lesson({ title: 'Kết luận khi chưa đủ dấu hiệu', text: `Chưa đúng: ống ${i + 1} không phải ${pick}.`, sub: hint + ' Bài học: thám tử giỏi thu đủ dấu hiệu rồi mới kết luận.', btn: '🔍 Điều tra tiếp' }, () => {});
        return;
      }
      NL.audio.play('success');
      p.remove(); st.inv = null; st.solved[i] = 1;
      t.tag.textContent = ion; t.tag.setAttribute('font-size', 15);
      st.rows.push({ i, ion, see: ion === 'Fe²⁺' ? 'Trắng xanh → nâu đỏ' : ion === 'Al³⁺' ? 'Trắng, tan trong NaOH dư' : d.see.replace('Kết tủa ', '') });
      sideTable(api);
      api.say(`Chính xác! Ống ${i + 1} chứa ${ion} (dung dịch ${d.salt})`);
      const all = Object.keys(st.solved).length >= 4;
      if (!all) st.cur = st.order.map((_, k) => k).find(k => !st.solved[k]);
      api.done(all ? 'Xem kết quả ➜' : 'Ống tiếp theo ➜');
    }));
  }

  function result() {
    const rows = st.rows.slice().sort((a, b) => a.i - b.i);
    return {
      title: 'Nhận biết ion kim loại bằng NaOH', param: '4 ống bí ẩn, thuốc thử NaOH loãng',
      table: { head: ['Ống', 'Ion', 'Dung dịch', 'Dấu hiệu với NaOH', 'Phương trình ion', 'Số lần chọn'], rows: rows.map(r => [r.i + 1, r.ion, ION[r.ion].salt, r.see, ION[r.ion].eq, st.tries[r.i] || 1]) },
      chart: { labels: rows.map(r => `Ống ${r.i + 1} (${r.ion})`), yLabel: 'Số lần chọn đến khi đúng', series: [{ name: 'Số lần chọn', color: '#9B6BD6', values: rows.map(r => st.tries[r.i] || 1) }] },
      conclusion: 'Với NaOH: Cu²⁺ cho kết tủa xanh lam, Fe³⁺ cho kết tủa nâu đỏ, Fe²⁺ cho kết tủa trắng xanh hóa nâu đỏ ngoài không khí, Al³⁺ cho kết tủa trắng keo tan trong NaOH dư',
      note: 'Cột bằng 1 là em đoán đúng ngay lần đầu.'
    };
  }
  function auto(api) {
    if (st.busy) return 'busy';
    if (st.inv && st.inv.isConnected) {
      const ion = ionOf(), ev = st.ev[st.cur];
      const btn = ion === 'Fe²⁺' && !ev.wait ? st.inv.querySelector('[data-a="wait"]') : ion === 'Al³⁺' && !ev.more ? st.inv.querySelector('[data-a="more"]') : st.inv.querySelector(`[data-ion="${ion}"]`);
      if (btn && !btn.disabled) { btn.click(); return 'inv'; }
    }
    return false;
  }

  NL.lab.register('H9', { goal: 'Chỉ với một lọ NaOH, làm sao nhận ra 4 ion kim loại bí ẩn?', build, steps, auto });
})();
