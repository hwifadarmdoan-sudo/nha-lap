// Thí nghiệm H7: ăn mòn điện hóa. Đinh Fe để riêng và đinh Fe quấn dây Cu cùng nhúng vào H₂SO₄ loãng.
// Bọt H₂ thoát ra trên dây Cu, nhưng Fe mới là kim loại bị ăn mòn nhanh.
(function () {
  const A = NL.art;
  const B1 = 220, B2 = 470, BY = 470, ACID = 'rgba(205,232,250,.6)';
  let st;

  function beaker(api, L, x, label) {
    const g = api.g(L, x, BY);
    api.el('path', { d: 'M-72 -170 L-68 0 L68 0 L72 -170', fill: 'rgba(220,240,255,.25)', stroke: A.GLASS, 'stroke-width': 3.5 }, g);
    const liq = api.el('rect', { x: -66, y: -120, width: 132, height: 117, fill: ACID }, g);
    api.text(g, 0, 26, label, 14, '#1F4E79', 800);
    g.liq = liq; return g;
  }
  function nail(api, L, x, y) {
    const g = api.g(L, x, y);
    g.body = api.el('path', { d: 'M-5 -130 L5 -130 L5 -12 L0 0 L-5 -12 Z', fill: '#8C8C8C', stroke: '#5A5A5A', 'stroke-width': 1.5 }, g);
    api.el('rect', { x: -12, y: -138, width: 24, height: 8, rx: 2, fill: '#6E6E6E' }, g);
    g.coil = api.el('path', { d: Array.from({ length: 9 }, (_, i) => `M-8 ${-100 + i * 9} Q0 ${-104 + i * 9} 8 ${-96 + i * 9}`).join(' ') + ' M8 -100 L14 -126', stroke: '#C8743A', 'stroke-width': 3.5, fill: 'none', opacity: 0 }, g);
    return g;
  }
  function build(api) {
    const L = api.svg, el = api.el;
    st = { rows: [], mode: null, run: false, bub: [], loss1: 0, loss2: 0 };
    st.b1 = beaker(api, L, B1, 'Cốc 1: chỉ có Fe');
    st.b2 = beaker(api, L, B2, 'Cốc 2: Fe và Cu');
    api.text(L, (B1 + B2) / 2, 270, 'H₂SO₄ loãng', 13, '#6C88A3', 700);
    st.n1 = nail(api, L, 90, 540);
    st.n2 = nail(api, L, 345, 540);
    // dây Cu thả riêng (khi em chọn không quấn)
    st.loose = el('path', { d: `M${B2 + 30} 330 Q${B2 + 40} 380 ${B2 + 32} 455`, stroke: '#C8743A', 'stroke-width': 4, fill: 'none', opacity: 0 }, L);
    st.bubG = api.g(L, 0, 0);
    st.wireE = el('path', { d: '', stroke: '#FFD54A', 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '4 8', opacity: 0 }, L);
    st.ff = api.g(L, 345, 120); st.ff.style.display = 'none';
    el('circle', { r: 30, fill: '#2F80C0', stroke: '#fff', 'stroke-width': 4 }, st.ff);
    api.text(st.ff, 0, 9, '⏩', 26, '#fff', 800); api.text(st.ff, 0, 52, 'Tua nhanh 30 phút', 13, '#2F80C0', 800);
    st.lens = NL.chem.lens(api, L, 640, 220, 76, { title: '🔍 Kính lúp: cốc 2' }); st.lens.g.style.display = 'none';
  }
  // nguồn bọt khí: [{x, y1, y2, rate}]
  function bubbles(api) {
    let acc = st.src.map(() => 0);
    st.bubLoop = api.loop(dt => {
      st.src.forEach((s, i) => {
        acc[i] = (acc[i] || 0) + s.rate * dt;
        while (acc[i] > 1) { acc[i]--; const y = s.y1 + Math.random() * (s.y2 - s.y1); st.bub.push({ e: api.el('circle', { cx: s.x + (Math.random() * 8 - 4), cy: y, r: 2 + Math.random() * 2.5, fill: 'rgba(255,255,255,.95)', stroke: '#9CC7E3' }, st.bubG), y }); }
      });
      for (let i = st.bub.length - 1; i >= 0; i--) { const b = st.bub[i]; b.y -= 55 * dt; b.e.setAttribute('cy', b.y); if (b.y < 352) { b.e.remove(); st.bub.splice(i, 1); } }
    });
  }
  function sideTable(api) {
    if (!st.tbl) st.tbl = api.table(['Cốc', 'Bọt khí', 'Đinh Fe']);
    st.tbl.set(st.rows.map(r => [r.c, r.bub, r.fe]));
  }

  const steps = [
    {
      label: 'Cốc 1', text: 'Thả đinh sắt vào cốc 1 đựng H₂SO₄ loãng', hint: 'Kéo đinh sắt bên trái vào cốc 1',
      enter(api) {
        sideTable(api);
        if (!api.prediction) api.ask({ predict: true, q: 'Quấn dây đồng quanh đinh sắt rồi nhúng vào acid loãng. Kim loại nào bị ăn mòn nhanh?', options: [{ t: 'Sắt (Fe)' }, { t: 'Đồng (Cu)' }, { t: 'Cả hai như nhau' }] });
        api.setOn(st.n1, true);
        api.draggable(st.n1, { target: { x: B1, y: 455, r: 80, sx: B1, sy: 455 }, onDrop: () => {
          NL.audio.play('drop');
          st.src = [{ x: B1, y1: 360, y2: 450, rate: 2.5 }]; bubbles(api);
          api.say('Bọt khí H₂ thoát ra chậm, ngay trên bề mặt đinh sắt');
          api.done();
        } });
      }
    },
    {
      label: 'Cốc 2 · Chuẩn bị', text: 'Đặt dây đồng thế nào với đinh sắt thứ hai?', hint: 'Chọn một cách bên phải',
      enter(api) {
        const d = st.pick = api.panel('<div>Dây đồng</div><div class="seg"><button class="seg-b pop" data-k="loose">Thả riêng, không chạm đinh</button><button class="seg-b pop" data-k="wrap">Quấn chặt vào đinh</button></div>');
        d.querySelectorAll('.seg-b').forEach(b => b.addEventListener('click', () => {
          NL.audio.play('click'); st.mode = b.dataset.k; d.remove(); st.pick = null;
          st.n2.coil.setAttribute('opacity', st.mode === 'wrap' ? 1 : 0);
          api.goto(2);
        }));
      }
    },
    {
      label: 'Cốc 2', get text() { return st.mode === 'wrap' ? 'Thả đinh sắt đã quấn dây đồng vào cốc 2' : 'Thả đinh sắt vào cốc 2, dây đồng đã thả sẵn bên cạnh'; }, hint: 'Kéo đinh sắt vào cốc 2',
      enter(api) {
        st.loose.setAttribute('opacity', st.mode === 'loose' ? 1 : 0);
        api.setOn(st.n2, true);
        api.draggable(st.n2, { target: { x: B2 - 15, y: 455, r: 80, sx: B2 - 15, sy: 455 }, onDrop: () => { NL.audio.play('drop'); dip(api); } });
      }
    },
    {
      label: 'Quan sát', text: 'Bọt khí ở cốc 2 thoát ra ở đâu nhiều nhất?', hint: 'Nhìn thật kỹ cốc 2',
      enter(api) {
        api.ask({
          q: 'Ở cốc 2, bọt khí H₂ thoát ra nhiều nhất ở đâu?',
          options: [
            { t: 'Trên dây đồng', ok: true },
            { t: 'Trên đinh sắt', why: 'Nhìn lại: bọt dày đặc bám quanh phần màu cam là dây gì?' },
            { t: 'Không có bọt khí', why: 'Cốc 2 sủi bọt nhiều hơn hẳn cốc 1. Nhìn kỹ nhé.' }
          ],
          explain: 'Electron từ Fe chạy sang Cu. Ion H⁺ nhận electron ngay trên bề mặt Cu nên bọt H₂ thoát ra ở dây đồng.'
        }, () => {
          api.say('Fe → Fe²⁺ + 2e⁻ (ở đinh sắt) · 2H⁺ + 2e⁻ → H₂↑ (ở dây đồng)');
          api.done('Tua nhanh ➜');
        });
      }
    },
    {
      label: 'Tua nhanh', text: 'Tua nhanh 30 phút để xem đinh nào mòn nhiều hơn', hint: 'Chạm nút ⏩',
      enter(api) {
        st.ff.style.display = ''; api.setOn(st.ff, true);
        api.tapable(st.ff, () => {
          st.ff.style.display = 'none'; NL.audio.play('hum');
          let t = 0; api.loop(dt => {
            t += dt; const k = Math.min(1, t / 3);
            st.n1.body.setAttribute('transform', `scale(${1 - 0.12 * k} 1)`);
            st.n2.body.setAttribute('transform', `scale(${1 - 0.5 * k} 1)`);
            st.b2.liq.setAttribute('fill', `rgba(${205 - 40 * k},${232 + 10 * k},${250 - 60 * k},.65)`);
            if (k >= 1) return false;
          });
          api.wait(3.1, () => {
            st.loss1 = 0.05; st.loss2 = 0.27;
            st.rows.forEach(r => { r.fe = r.c === 'Cốc 1' ? 'Mòn ít (−0,05 g)' : 'Mòn nhiều (−0,27 g)'; }); sideTable(api);
            api.say('Đinh sắt cốc 2 mòn nhanh hơn nhiều, dung dịch ngả xanh nhạt vì có Fe²⁺. Dây đồng vẫn nguyên');
            api.done('Xem kết quả ➜');
          });
        });
      }
    },
    {
      label: 'Kết quả', text: 'Khối lượng đinh sắt bị mất sau 30 phút', hint: 'So sánh hai cột',
      enter(api) { st.lens.g.style.display = 'none'; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Sắt (Fe)', truth: 'Fe hoạt động mạnh hơn Cu nên Fe là cực âm, bị oxi hóa và tan ra. Cu chỉ là nơi H⁺ nhận electron.',
          sub: 'Vì vậy không nên nối ống sắt với ống đồng trong nhà. Ngược lại, người ta gắn khối kẽm vào vỏ tàu biển: Zn mạnh hơn Fe nên Zn bị ăn mòn thay cho vỏ tàu.',
          result: result(),
          quiz: [{
            kicker: '❓ Vì sao?', q: 'Muốn xảy ra ăn mòn điện hóa cần những điều kiện nào?',
            options: [
              { t: 'Hai kim loại khác nhau, tiếp xúc với nhau và cùng nhúng trong dung dịch chất điện li', ok: true },
              { t: 'Chỉ cần một kim loại nhúng trong acid', why: 'Cốc 1 chỉ có Fe: đó là ăn mòn hóa học, chậm hơn nhiều.' },
              { t: 'Hai kim loại để cạnh nhau trong không khí khô', why: 'Thiếu dung dịch chất điện li thì không có dòng ion, không thành pin.' }
            ],
            explain: 'Hai điện cực khác nhau, nối với nhau (trực tiếp hoặc qua dây dẫn), cùng tiếp xúc dung dịch chất điện li thì tạo thành một pin nhỏ: kim loại mạnh hơn bị ăn mòn.'
          }]
        });
      }
    }
  ];

  function dip(api) {
    if (st.mode === 'loose') {
      st.src.push({ x: B2 - 15, y1: 360, y2: 450, rate: 2.5 });
      st.lens.g.style.display = ''; st.lens.set([{ f: 'H⁺', n: 5 }, { f: 'Fe²⁺', n: 1 }, { f: 'H₂', n: 1 }]);
      api.say('Bọt khí chỉ thoát ra chậm trên đinh sắt, giống hệt cốc 1. Dây đồng không có bọt nào');
      api.wait(2.2, () => api.lesson({ title: 'Để Fe và Cu không chạm nhau', text: 'Cốc 2 giống hệt cốc 1! Dây đồng nằm riêng nên không có electron chạy từ sắt sang đồng.', sub: 'Bài học: ăn mòn điện hóa chỉ xảy ra khi hai kim loại tiếp xúc với nhau (hoặc nối bằng dây dẫn) và cùng nhúng trong dung dịch chất điện li.', btn: '🔁 Quấn dây đồng vào đinh' }, () => {
        st.src.pop(); st.loose.setAttribute('opacity', 0);
        api.place(st.n2, 345, 540); st.n2.coil.setAttribute('opacity', 1); st.mode = 'wrap'; st.lens.g.style.display = 'none';
        api.goto(2);
      }));
      return;
    }
    // quấn dây: bọt dày trên dây Cu, rất ít trên Fe
    st.src.push({ x: B2 - 15 + 10, y1: 360, y2: 440, rate: 30 }, { x: B2 - 15 - 6, y1: 430, y2: 452, rate: 1 });
    st.wireE.setAttribute('opacity', 1); st.wireE.setAttribute('d', `M${B2 - 15} 440 L${B2 - 15} 400`);
    let off = 0; api.loop(dt => { off -= 30 * dt; st.wireE.setAttribute('stroke-dashoffset', off); });
    st.lens.g.style.display = ''; st.lens.caption('🔍 Kính lúp: chỗ Fe chạm Cu');
    st.lens.set([{ f: 'Fe²⁺', n: 3 }, { f: 'e⁻', n: 4 }, { f: 'H⁺', n: 4 }, { f: 'H₂', n: 3 }]);
    st.rows = [{ c: 'Cốc 1', bub: 'Ít, trên Fe', fe: 'Đang theo dõi' }, { c: 'Cốc 2', bub: 'Nhiều, trên dây Cu', fe: 'Đang theo dõi' }];
    sideTable(api);
    api.say('Cốc 2 sủi bọt mạnh hơn hẳn cốc 1');
    api.wait(1.5, () => api.goto(3));
  }

  function result() {
    return {
      title: 'Ăn mòn điện hóa', param: 'Đinh sắt trong H₂SO₄ loãng, 30 phút (tua nhanh)',
      table: { head: ['Cốc', 'Điện cực', 'Bọt khí H₂', 'Khối lượng Fe giảm (mô phỏng)', 'Kiểu ăn mòn'], rows: [['1', 'Chỉ có Fe', 'Ít, trên Fe', '0,05 g', 'Ăn mòn hóa học'], ['2', 'Fe quấn Cu', 'Nhiều, trên Cu', '0,27 g', 'Ăn mòn điện hóa']] },
      chart: { labels: ['Cốc 1: chỉ Fe', 'Cốc 2: Fe + Cu'], yLabel: 'Khối lượng Fe mất (g)', series: [{ name: 'Fe mất', color: '#B5532E', values: [0.05, 0.27] }] },
      conclusion: 'Khi Fe tiếp xúc với Cu trong dung dịch chất điện li, Fe (kim loại mạnh hơn) là cực âm và bị ăn mòn nhanh hơn nhiều. Bọt H₂ lại thoát ra ở Cu, nơi H⁺ nhận electron',
      note: 'Số gam là số liệu mô phỏng để so sánh hai cốc.'
    };
  }
  function auto(api) {
    if (st.pick && st.pick.isConnected) { st.pick.querySelector('[data-k="wrap"]').click(); return 'wrap'; }
    return false;
  }

  NL.lab.register('H7', { goal: 'Quấn dây đồng vào đinh sắt thì sắt bền hơn hay mòn nhanh hơn?', build, steps, auto });
})();
