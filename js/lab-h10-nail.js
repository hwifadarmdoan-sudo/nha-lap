// Thí nghiệm H10: đinh sắt trong dung dịch CuSO₄. Đánh sạch đinh, cân trước và sau,
// thấy lớp đồng đỏ bám vào, dung dịch nhạt màu xanh và khối lượng đinh tăng.
(function () {
  const A = NL.art;
  const NX = 110, NY = 540, BX = 330, BY = 470, SX = 580, SY = 520;
  const M0 = 2.80, DM = 0.04;
  let st;

  function build(api) {
    const L = api.svg, el = api.el;
    st = { clean: 0, rows: [], m0: null, m1: null, failed: false };
    // khay
    el('rect', { x: NX - 60, y: NY - 4, width: 120, height: 14, rx: 5, fill: '#B8C4CE' }, L);
    api.text(L, NX, NY + 34, 'Đinh sắt cũ', 13, '#6C88A3', 700);
    // đinh: thân xám, lớp gỉ + dầu phủ ngoài, lớp đồng hiện dần
    const n = st.nail = api.g(L, NX, NY);
    el('path', { d: 'M-6 -150 L6 -150 L6 -14 L0 0 L-6 -14 Z', fill: '#8C8C8C', stroke: '#5A5A5A', 'stroke-width': 1.5 }, n);
    el('rect', { x: -14, y: -158, width: 28, height: 9, rx: 2, fill: '#6E6E6E' }, n);
    n.rust = api.g(n, 0, 0);
    [[-120, 22], [-88, 30], [-50, 18], [-26, 14]].forEach(([y, h]) => el('rect', { x: -6, y, width: 12, height: h, rx: 3, fill: '#A0522D', opacity: 0.85 }, n.rust));
    el('rect', { x: -6, y: -148, width: 12, height: 130, fill: 'rgba(200,170,60,.25)' }, n.rust);
    n.cu = el('path', { d: 'M-6 -100 L6 -100 L6 -14 L0 0 L-6 -14 Z', fill: '#B4561E', opacity: 0 }, n);
    n.specks = api.g(n, 0, 0);
    // giấy nhám
    st.paper = api.g(L, NX + 110, 470); st.paper.style.display = 'none';
    el('rect', { x: -26, y: -36, width: 52, height: 72, rx: 6, fill: '#D9B98A', stroke: '#A8875A', 'stroke-width': 2 }, st.paper);
    for (let i = 0; i < 18; i++) el('circle', { cx: Math.random() * 44 - 22, cy: Math.random() * 64 - 32, r: 1.4, fill: '#8A6A3A' }, st.paper);
    api.text(st.paper, 0, 56, 'Giấy nhám', 12, '#6C88A3', 700);
    // cốc CuSO₄
    const b = st.beaker = api.g(L, BX, BY);
    el('path', { d: 'M-70 -190 L-66 0 L66 0 L70 -190', fill: 'rgba(220,240,255,.25)', stroke: A.GLASS, 'stroke-width': 3.5 }, b);
    st.liq = el('rect', { x: -64, y: -140, width: 128, height: 137, fill: 'rgba(60,140,230,.7)' }, b);
    api.text(b, 0, 26, 'Dung dịch CuSO₄', 14, '#1F4E79', 800);
    // cân
    const sc = st.scale = api.g(L, SX, SY);
    el('rect', { x: -70, y: -20, width: 140, height: 40, rx: 8, fill: '#4A5A6A' }, sc);
    el('rect', { x: -60, y: -30, width: 120, height: 10, rx: 4, fill: '#B8C4CE' }, sc);
    el('rect', { x: -38, y: -12, width: 76, height: 24, rx: 4, fill: '#C8F0C0' }, sc);
    st.read = api.text(sc, 0, 6, '0,00 g', 16, '#1F4E79', 800);
    st.ff = api.g(L, BX, 210); st.ff.style.display = 'none';
    el('circle', { r: 28, fill: '#2F80C0', stroke: '#fff', 'stroke-width': 4 }, st.ff);
    api.text(st.ff, 0, 9, '⏩', 24, '#fff', 800);
    st.ffLbl = api.text(st.ff, 0, 48, 'Tua nhanh', 13, '#2F80C0', 800);
    st.lens = NL.chem.lens(api, L, 560, 225, 78, { title: '🔍 Kính lúp: bề mặt đinh' }); st.lens.g.style.display = 'none';
  }
  const fmt = v => v.toFixed(2).replace('.', ',');
  function sideTable(api) {
    if (!st.tbl) st.tbl = api.table(['Thời gian', 'Màu dung dịch', 'Bề mặt đinh']);
    st.tbl.set(st.rows.map(r => [r.t, r.c, r.s]));
  }
  function resetNail(api) {
    st.nail.cu.setAttribute('opacity', 0); st.nail.specks.innerHTML = '';
    api.place(st.nail, NX, NY);
  }

  const steps = [
    {
      label: 'Chuẩn bị', text: 'Chiếc đinh hơi gỉ và dính dầu. Em làm gì trước?', hint: 'Chọn một cách bên phải',
      enter(api) {
        sideTable(api);
        if (!api.prediction) api.ask({ predict: true, q: 'Ngâm đinh sắt trong CuSO₄, đồng bám lên đinh. Khối lượng đinh (cả lớp đồng) sẽ…?', options: [{ t: 'Tăng lên' }, { t: 'Giảm đi' }, { t: 'Không đổi' }] });
        const d = st.prep = api.panel('<div>Trước khi ngâm</div><div class="seg"><button class="seg-b pop" data-k="direct">Thả vào luôn cho nhanh</button><button class="seg-b pop" data-k="sand">Đánh giấy nhám cho sạch</button></div>');
        d.querySelectorAll('.seg-b').forEach(b => b.addEventListener('click', () => { NL.audio.play('click'); d.remove(); st.prep = null; api.goto(b.dataset.k === 'direct' ? 1 : 2); }));
      }
    },
    {
      label: 'Ngâm đinh', text: 'Thả đinh vào cốc CuSO₄', hint: 'Kéo đinh vào cốc',
      enter(api) {
        api.setOn(st.nail, true);
        api.draggable(st.nail, { target: { x: BX, y: BY - 10, r: 90, sx: BX, sy: BY - 10 }, onDrop: () => {
          NL.audio.play('drop');
          st.ff.style.display = ''; st.ffLbl.textContent = 'Tua nhanh 10 phút'; api.setOn(st.ff, true);
          api.say('Chạm ⏩ để tua nhanh 10 phút');
          api.tapable(st.ff, () => {
            st.ff.style.display = 'none'; NL.audio.play('hum');
            for (let i = 0; i < 4; i++) api.el('circle', { cx: Math.random() * 10 - 5, cy: -140 + Math.random() * 120, r: 2, fill: '#C8743A' }, st.nail.specks);
            st.lens.g.style.display = ''; st.lens.set([{ f: 'Cu²⁺', n: 6 }, { f: 'SO₄²⁻', n: 4 }]);
            api.say('10 phút rồi mà đinh gần như không đổi, dung dịch vẫn xanh đậm');
            api.wait(1.8, () => api.lesson({ title: 'Ngâm đinh gỉ, dính dầu', text: 'Lớp gỉ và dầu mỡ bọc ngoài đinh như một tấm áo, ngăn ion Cu²⁺ chạm vào sắt nên phản ứng gần như không xảy ra.', sub: 'Bài học: làm sạch bề mặt kim loại (đánh giấy nhám, rửa sạch) trước khi cho phản ứng.', btn: '🔁 Đánh nhám rồi làm lại' }, () => {
              st.failed = true; st.lens.g.style.display = 'none'; resetNail(api); api.goto(2);
            }));
          });
        } });
      }
    },
    {
      label: 'Đánh nhám', text: 'Chà giấy nhám lên đinh cho sạch gỉ và dầu', hint: 'Chạm giấy nhám nhiều lần',
      enter(api) {
        st.paper.style.display = ''; api.setOn(st.paper, true);
        const rub = () => {
          NL.audio.play('step');
          api.tween(st.paper, NX + 30, NY - 120, 160, () => api.tween(st.paper, NX + 30, NY - 40, 160, () => api.tween(st.paper, NX + 110, 470, 200)));
          st.clean++; st.nail.rust.setAttribute('opacity', Math.max(0, 1 - st.clean / 4));
          if (st.clean >= 4) { st.paper.style.display = 'none'; api.say('Đinh đã sáng bóng màu xám bạc'); api.done('Cân đinh ➜'); return; }
          api.say(`Chà thêm nào… (${st.clean}/4)`);
          api.setOn(st.paper, true);
        };
        api.tapable(st.paper, rub);
      }
    },
    {
      label: 'Cân trước', text: 'Đặt đinh lên cân để biết khối lượng ban đầu', hint: 'Kéo đinh lên mặt cân',
      enter(api) {
        api.setOn(st.nail, true);
        api.draggable(st.nail, { target: { x: SX, y: SY - 40, r: 80, sx: SX, sy: SY - 32 }, onDrop: () => {
          st.m0 = M0; st.read.textContent = fmt(M0) + ' g'; NL.audio.play('ting');
          api.say(`Khối lượng đinh ban đầu: ${fmt(M0)} g`); api.done('Ngâm đinh ➜');
        } });
      }
    },
    {
      label: 'Ngâm đinh', text: 'Thả đinh đã làm sạch vào cốc CuSO₄', hint: 'Kéo đinh vào cốc',
      enter(api) {
        st.read.textContent = '0,00 g';
        api.setOn(st.nail, true);
        api.draggable(st.nail, { target: { x: BX, y: BY - 10, r: 90, sx: BX, sy: BY - 10 }, onDrop: () => {
          NL.audio.play('drop'); api.svg.appendChild(st.nail);
          st.lens.g.style.display = ''; st.lens.set([{ f: 'Cu²⁺', n: 6 }, { f: 'SO₄²⁻', n: 4 }, { f: 'Fe', n: 3 }]);
          st.rows = [{ t: '0 phút', c: 'Xanh lam đậm', s: 'Xám bạc' }]; sideTable(api);
          api.done('Theo dõi ➜');
        } });
      }
    },
    {
      label: 'Theo dõi', text: 'Tua nhanh và quan sát đinh và màu dung dịch', hint: 'Chạm ⏩ để tua tới phút tiếp theo',
      enter(api) {
        const marks = [{ m: 2, k: 0.3, c: 'Xanh lam', s: 'Lấm tấm đỏ' }, { m: 5, k: 0.65, c: 'Xanh nhạt hơn', s: 'Phủ lớp đỏ' }, { m: 10, k: 1, c: 'Xanh rất nhạt, hơi lục', s: 'Đỏ nâu dày' }];
        let i = 0;
        const next = () => {
          const mk = marks[i];
          st.ff.style.display = ''; st.ffLbl.textContent = `Tua tới phút ${mk.m}`; api.setOn(st.ff, true);
          api.tapable(st.ff, () => {
            st.ff.style.display = 'none'; NL.audio.play('hum');
            const k0 = i ? marks[i - 1].k : 0;
            let t = 0; api.loop(dt => {
              t += dt; const k = k0 + (mk.k - k0) * Math.min(1, t / 1.5);
              st.nail.cu.setAttribute('opacity', (0.95 * k).toFixed(2));
              st.liq.setAttribute('fill', `rgba(${Math.round(60 + 110 * k)},${Math.round(140 + 75 * k)},${Math.round(230 - 40 * k)},${(0.7 - 0.25 * k).toFixed(2)})`);
              if (t >= 1.5) return false;
            });
            const c = Math.round(6 * (1 - mk.k)), f = Math.round(5 * mk.k);
            st.lens.set([{ f: 'Cu²⁺', n: Math.max(1, c) }, { f: 'Fe²⁺', n: Math.max(1, f) }, { f: 'Cu', n: Math.max(1, f) }, { f: 'SO₄²⁻', n: 4 }]);
            api.wait(1.6, () => {
              st.rows.push({ t: `${mk.m} phút`, c: mk.c, s: mk.s }); sideTable(api);
              i++;
              if (i < marks.length) { api.say(`Phút ${mk.m}: ${mk.s.toLowerCase()}, dung dịch ${mk.c.toLowerCase()}`); next(); return; }
              api.say('Fe + CuSO₄ → FeSO₄ + Cu. Sắt đẩy đồng ra khỏi muối: đồng đỏ bám lên đinh, màu xanh của Cu²⁺ nhạt dần');
              api.done('Cân lại đinh ➜');
            });
          });
        };
        next();
      }
    },
    {
      label: 'Cân sau', text: 'Lấy đinh ra, rửa nhẹ, để khô rồi đặt lên cân', hint: 'Kéo đinh lên mặt cân',
      enter(api) {
        api.setOn(st.nail, true);
        api.draggable(st.nail, { target: { x: SX, y: SY - 40, r: 80, sx: SX, sy: SY - 32 }, onDrop: () => {
          st.m1 = M0 + DM; st.read.textContent = fmt(st.m1) + ' g'; NL.audio.play('ting');
          api.say(`Khối lượng đinh sau: ${fmt(st.m1)} g, nặng hơn lúc đầu ${fmt(DM)} g`);
          api.wait(1, () => api.ask({
            q: 'Mỗi mol Fe tan ra (56 g) thì có 1 mol Cu (64 g) bám vào. Vậy mỗi mol phản ứng, đinh nặng thêm bao nhiêu gam?',
            options: [{ t: '8 g', ok: true }, { t: '56 g', why: '56 g là phần sắt mất đi. Phần đồng bám vào nặng bao nhiêu?' }, { t: '120 g', why: 'Sắt mất đi chứ không cộng thêm. Lấy phần bám vào trừ phần mất đi.' }],
            explain: `64 − 56 = 8 g mỗi mol. Đinh nặng thêm ${fmt(DM)} g nên số mol phản ứng là ${fmt(DM)} : 8 = 0,005 mol, tức có 0,32 g đồng bám vào.`
          }, () => api.done('Xem kết quả ➜')));
        } });
      }
    },
    {
      label: 'Kết quả', text: 'Khối lượng đinh trước và sau khi ngâm', hint: 'Đinh nặng hơn vì đồng nặng hơn sắt',
      enter(api) { st.lens.g.style.display = 'none'; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Tăng lên', truth: 'mỗi 56 g sắt tan ra thì có 64 g đồng bám vào, nên đinh nặng thêm.',
          sub: 'Ngày xưa người ta thu đồng bằng cách ngâm sắt vụn trong nước mỏ có muối đồng, chính là phản ứng này.',
          result: result(),
          quiz: [{
            kicker: '❓ Vì sao?', q: 'Vì sao màu xanh của dung dịch nhạt dần?',
            options: [
              { t: 'Ion Cu²⁺ (màu xanh) bị sắt đẩy ra thành đồng kim loại bám lên đinh', ok: true },
              { t: 'Nước bay hơi bớt', why: 'Nước bay hơi thì dung dịch còn đậm hơn. Ion nào tạo màu xanh?' },
              { t: 'Đinh sắt hút màu', why: 'Sắt không hút màu. Nhìn kính lúp: số ion Cu²⁺ thay đổi thế nào?' }
            ],
            explain: 'Màu xanh do ion Cu²⁺. Fe mạnh hơn Cu nên đẩy Cu ra khỏi dung dịch muối: Fe + Cu²⁺ → Fe²⁺ + Cu. Cu²⁺ ít đi nên màu nhạt dần, Fe²⁺ làm dung dịch hơi ngả lục.'
          }]
        });
      }
    }
  ];

  function result() {
    return {
      title: 'Đinh sắt trong dung dịch CuSO₄', param: 'Đinh sắt đã đánh sạch, ngâm 10 phút',
      table: { head: ['Thời gian', 'Màu dung dịch', 'Bề mặt đinh'], rows: st.rows.map(r => [r.t, r.c, r.s]) },
      chart: { labels: ['Trước khi ngâm', 'Sau 10 phút'], yLabel: 'Khối lượng đinh (g)', series: [{ name: 'Khối lượng', color: '#C8743A', values: [st.m0 || M0, st.m1 || M0 + DM] }] },
      conclusion: 'Sắt đứng trước đồng trong dãy hoạt động hóa học nên đẩy được đồng ra khỏi dung dịch muối: Fe + CuSO₄ → FeSO₄ + Cu. Đồng đỏ bám lên đinh, dung dịch nhạt màu xanh, khối lượng đinh tăng',
      note: 'Khối lượng trên cân là số liệu mô phỏng. Bề mặt đinh phải sạch gỉ và dầu thì phản ứng mới xảy ra rõ.'
    };
  }
  function auto(api) {
    if (st.prep && st.prep.isConnected) { st.prep.querySelector('[data-k="sand"]').click(); return 'sand'; }
    return false;
  }

  NL.lab.register('H10', { goal: 'Ngâm đinh sắt vào dung dịch màu xanh, chuyện gì xảy ra với đinh?', build, steps, auto });
})();
