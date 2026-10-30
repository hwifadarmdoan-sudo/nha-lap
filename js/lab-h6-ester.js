// Thí nghiệm H6: điều chế ethyl acetate. Acetic acid + ethanol, xúc tác H₂SO₄ đặc, đun cách thủy,
// thêm nước muối bão hòa để ester nổi thành lớp, rồi ngửi đúng cách bằng phẩy tay.
(function () {
  const A = NL.art;
  const TX = 300, TY = 440, MIX = 'rgba(250,245,225,.7)';
  let st;

  function build(api) {
    const L = api.svg, el = api.el;
    st = { acid: false, alc: false, cat: false, failed: false, runs: [] };
    // bếp điện + cốc nước nóng
    st.plate = api.g(L, TX, 500);
    el('rect', { x: -110, y: -30, width: 220, height: 34, rx: 8, fill: '#4A5A6A' }, st.plate);
    st.coil = el('rect', { x: -80, y: -36, width: 160, height: 8, rx: 4, fill: '#7A8A99' }, st.plate);
    st.knob = el('circle', { cx: 80, cy: -13, r: 10, fill: '#E5534B', stroke: '#fff', 'stroke-width': 2 }, st.plate);
    api.text(st.plate, -20, -6, 'Bếp điện', 13, '#fff', 700);
    el('path', { d: `M${TX - 90} 300 L${TX - 86} 462 L${TX + 86} 462 L${TX + 90} 300`, fill: 'rgba(220,240,255,.25)', stroke: A.GLASS, 'stroke-width': 3.5 }, L);
    el('rect', { x: TX - 84, y: 350, width: 168, height: 108, fill: 'rgba(150,210,245,.45)' }, L);
    st.bath = api.g(L, 0, 0);
    api.text(L, TX - 150, 300, 'Nồi cách thủy', 13, '#6C88A3', 700);
    st.tube = A.tube(api, L, TX, TY, { h: 210, w: 44 });
    st.layer = el('rect', { x: -20, y: 0, width: 40, height: 0, fill: 'rgba(250,215,120,.85)' }, st.tube);
    st.clock = api.text(L, TX, 150, '', 26, '#1F4E79', 800);
    // hóa chất
    st.bAcid = A.bottle(api, L, 450, 530, 'CH₃COOH', 'rgba(250,240,215,.8)', { w: 76, h: 80, font: 12 });
    st.bAlc = A.bottle(api, L, 545, 530, 'C₂H₅OH', 'rgba(220,240,255,.7)', { w: 76, h: 80, font: 12 });
    st.drop = A.dropper(api, L, 630, 470, 'H₂SO₄', '#F4E6B0');
    api.text(st.drop, 0, 62, 'H₂SO₄ đặc', 12, '#1F4E79', 800);
    st.salt = api.g(L, 710, 530);
    el('path', { d: 'M-30 -70 L-27 0 L27 0 L30 -70', fill: 'rgba(220,240,255,.3)', stroke: A.GLASS, 'stroke-width': 3 }, st.salt);
    el('rect', { x: -26, y: -46, width: 52, height: 44, fill: 'rgba(200,230,250,.7)' }, st.salt);
    api.text(st.salt, 0, 22, 'NaCl bão hòa', 12, '#1F4E79', 800);
    st.pip = A.pipette(api, L, 0, 0, { len: 130 }); st.pip.style.display = 'none';
    st.lens = NL.chem.lens(api, L, 520, 190, 84, { title: '🔍 Kính lúp hạt: trong ống' }); st.lens.g.style.display = 'none';
  }
  function pipetteFrom(api, bottle, x, color, k, cb) {
    st.pip.style.display = ''; st.pip.fill(color); api.place(st.pip, x, 380); api.setOn(st.pip, true);
    api.draggable(st.pip, { target: { x: TX, y: 215, r: 80, sx: TX, sy: 215 }, onDrop: () => {
      let n = 0; const one = () => A.drop(api, api.svg, TX, 222, 400, color, () => { NL.audio.play('drop'); if (++n < 3) one(); else { st.pip.empty(); st.pip.style.display = 'none'; st.tube.fill(MIX, k); cb(); } });
      one();
    } });
  }
  function sideTable(api) {
    if (!st.tbl) st.tbl = api.table(['Lần đun', 'H₂SO₄ đặc', 'Ester']);
    st.tbl.set(st.runs.map((r, i) => [i + 1, r.cat ? 'Có' : 'Không', r.cat ? 'Lớp ester rõ' : 'Gần như không có']));
  }
  function bubbles(api, sec, onTick, done) {
    let t = 0, acc = 0; const bs = [];
    api.loop(dt => {
      t += dt; acc += 10 * dt;
      while (acc > 1) { acc--; bs.push({ e: api.el('circle', { cx: TX - 75 + Math.random() * 150, cy: 455, r: 2 + Math.random() * 3, fill: 'rgba(255,255,255,.9)' }, st.bath), y: 455 }); }
      for (let i = bs.length - 1; i >= 0; i--) { bs[i].y -= 60 * dt; bs[i].e.setAttribute('cy', bs[i].y); if (bs[i].y < 355) { bs[i].e.remove(); bs.splice(i, 1); } }
      onTick(Math.min(1, t / sec));
      if (t >= sec) { bs.forEach(b => b.e.remove()); done(); return false; }
    });
  }
  function heat(api) {
    st.heating = true; st.coil.setAttribute('fill', '#E5534B'); NL.audio.play('hum');
    st.lens.g.style.display = '';
    const cat = st.cat;
    bubbles(api, cat ? 5 : 3.5, k => {
      st.clock.textContent = `⏱ ${Math.round(k * 10)} phút`;
      const e = cat ? Math.round(5 * k) : 0;
      st.lens.set([{ f: 'CH₃COOH', n: 4 - Math.min(3, e) }, { f: 'C₂H₅OH', n: 4 - Math.min(3, e) }, { f: 'CH₃COOC₂H₅', n: e }, { f: 'H₂O', n: e ? Math.max(1, e - 1) : 0 }]);
    }, () => {
      st.heating = false; st.coil.setAttribute('fill', '#7A8A99'); st.clock.textContent = '';
      st.runs.push({ cat }); sideTable(api);
      if (!cat) {
        st.failed = true;
        api.lesson({ title: 'Quên chất xúc tác H₂SO₄ đặc', text: 'Đun 10 phút rồi mà các phân tử acid và rượu va vào nhau gần như không tạo ra ester. Phản ứng này rất chậm nếu không có xúc tác.', sub: 'Bài học: H₂SO₄ đặc vừa là chất xúc tác làm phản ứng nhanh hơn, vừa hút nước giúp tạo nhiều ester hơn. Nhỏ vài giọt H₂SO₄ đặc rồi đun lại.', btn: '🔁 Thêm xúc tác' }, () => api.goto(2));
        return;
      }
      api.say('CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O (H₂SO₄ đặc, đun nóng)');
      api.done('Tách lớp ester ➜');
    });
  }

  const steps = [
    {
      label: 'Chuẩn bị 1/2', text: 'Lấy acetic acid (CH₃COOH) cho vào ống nghiệm', hint: 'Kéo pipette vào miệng ống nghiệm',
      enter(api) {
        sideTable(api);
        api.card({ kicker: '🥽 An toàn', text: 'Đeo kính và găng tay. H₂SO₄ đặc gây bỏng nặng, acetic acid có mùi rất hắc. Làm ở nơi thoáng khí.', btn: 'Đã hiểu ➜' });
        if (!api.prediction) api.ask({ predict: true, q: 'Ester ethyl acetate nhẹ hơn nước và rất ít tan trong nước. Khi đổ thêm nước muối, ester sẽ…?', options: [{ t: 'Nổi thành lớp ở trên' }, { t: 'Chìm thành lớp ở dưới' }, { t: 'Tan hết vào nước' }] });
        pipetteFrom(api, st.bAcid, 450, 'rgba(250,240,215,.95)', 0.22, () => { st.acid = true; api.done(); });
      }
    },
    {
      label: 'Chuẩn bị 2/2', text: 'Lấy ethanol (C₂H₅OH) cho vào cùng ống', hint: 'Kéo pipette vào miệng ống nghiệm',
      enter(api) { pipetteFrom(api, st.bAlc, 545, 'rgba(220,240,255,.95)', 0.44, () => { st.alc = true; st.lens.g.style.display = ''; st.lens.set([{ f: 'CH₃COOH', n: 4 }, { f: 'C₂H₅OH', n: 4 }]); api.done(); }); }
    },
    {
      label: 'Đun cách thủy', get text() { return st.failed ? 'Nhỏ vài giọt H₂SO₄ đặc rồi đun lại' : 'Có thể nhỏ H₂SO₄ đặc và bật bếp đun cách thủy'; }, get hint() { return st.failed ? 'Chạm lọ H₂SO₄ đặc trước, rồi chạm núm đỏ của bếp' : 'Chạm lọ H₂SO₄ đặc hoặc chạm núm đỏ của bếp'; },
      enter(api) {
        const plateOn = () => { api.setOn(st.plate, true); api.tapable(st.plate, () => { if (st.heating || st.dropping) return; api.setOn(st.drop, false); api.setOn(st.plate, false); heat(api); }); };
        if (!st.cat) {
          api.setOn(st.drop, true);
          api.tapable(st.drop, () => {
            if (st.heating || st.dropping) return;
            st.dropping = true;
            let n = 0; const one = () => A.drop(api, api.svg, TX, 240, 400, '#F4E6B0', () => { NL.audio.play('drop'); if (++n < 3) one(); else { st.cat = true; st.dropping = false; api.say('Đã nhỏ 3 giọt H₂SO₄ đặc. Giờ bật bếp đun cách thủy'); plateOn(); } });
            api.place(st.drop, TX, 250); one();
          });
        }
        if (!st.failed || st.cat) plateOn();
      }
    },
    {
      label: 'Tách lớp', text: 'Để nguội, rồi đổ nước muối NaCl bão hòa vào ống', hint: 'Kéo cốc NaCl bão hòa vào miệng ống nghiệm',
      enter(api) {
        api.place(st.drop, 630, 470);
        api.setOn(st.salt, true);
        api.draggable(st.salt, { target: { x: TX + 30, y: 240, r: 90 }, onDrop: () => {
          st.salt.style.display = 'none'; NL.audio.play('bubble');
          st.tube.fill('rgba(160,205,240,.95)', 0.8);
          let t = 0; api.loop(dt => { t += dt; const k = Math.min(1, t / 1.5); st.layer.setAttribute('y', -22 - 0.8 * 182); st.layer.setAttribute('height', 34 * k); if (k >= 1) return false; });
          st.lens.caption('🔍 Lớp trên cùng');
          st.lens.set([{ f: 'CH₃COOC₂H₅', n: 7 }]);
          api.say('Ester không tan trong nước muối, nhẹ hơn nên nổi thành lớp màu vàng nhạt ở trên');
          api.done('Ngửi mùi ester ➜');
        } });
      }
    },
    {
      label: 'Ngửi mùi', text: 'Em ngửi mùi ester trong ống thế nào?', hint: 'Chọn một cách ngửi bên phải',
      enter(api) {
        const d = st.smell = api.panel('<div>Cách ngửi</div><div class="seg"><button class="seg-b pop" data-k="nose">👃 Ghé mũi ngửi thẳng</button><button class="seg-b pop" data-k="fan">🖐️ Phẩy tay</button></div>');
        d.querySelectorAll('.seg-b').forEach(b => b.addEventListener('click', () => {
          if (b.dataset.k === 'nose') {
            NL.audio.play('click');
            api.lesson({ title: 'Ghé sát mũi ngửi thẳng vào ống', text: 'Ối, cay xè mũi! Trong ống vẫn còn hơi acetic acid và axit đặc, hít thẳng một luồng đậm rất hại đường thở.', sub: 'Bài học: không bao giờ ghé mũi vào miệng ống. Để ống cách mặt, dùng tay phẩy nhẹ cho một ít hơi bay tới mũi.', btn: '🔁 Ngửi lại cho đúng' }, () => b.remove());
            return;
          }
          d.remove(); st.smell = null; NL.audio.play('ting');
          api.say('Mùi thơm ngọt như keo dán, sơn móng tay: đó là mùi của ethyl acetate');
          api.done('Xem kết quả ➜');
        }));
      }
    },
    {
      label: 'Kết quả', text: 'Lượng ester thu được khi có và không có xúc tác', hint: 'So sánh hai cột',
      enter(api) { st.lens.g.style.display = 'none'; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Nổi thành lớp ở trên', truth: 'ethyl acetate nhẹ hơn nước (khoảng 0,9 g/mL) và rất ít tan, nên nổi thành lớp ở trên.',
          sub: 'Ester có mùi thơm của hoa quả nên được dùng làm hương liệu. Mùi chuối chín đến từ isoamyl acetate, mùi dứa từ ethyl butyrate.',
          result: result(),
          quiz: [{
            kicker: '❓ Vì sao?', q: 'Vì sao phải thêm H₂SO₄ đặc khi điều chế ester?',
            options: [
              { t: 'Làm xúc tác cho phản ứng nhanh hơn và hút nước để tạo nhiều ester hơn', ok: true },
              { t: 'Để ester có màu vàng', why: 'Màu không phải mục đích. Nhớ lại lần đun không có H₂SO₄: điều gì đã xảy ra?' },
              { t: 'Để trung hòa acetic acid', why: 'H₂SO₄ là acid, không trung hòa được acid khác. Nó giúp phản ứng diễn ra nhanh hơn.' }
            ],
            explain: 'Phản ứng ester hóa rất chậm và thuận nghịch. H₂SO₄ đặc làm xúc tác và hút bớt nước, giúp cân bằng chuyển về phía tạo ester.'
          }]
        });
      }
    }
  ];

  function result() {
    const runs = st.runs.slice();
    if (!runs.some(r => !r.cat)) runs.unshift({ cat: false, ref: true });
    return {
      title: 'Điều chế ethyl acetate', param: '2 mL CH₃COOH, 2 mL C₂H₅OH, đun cách thủy 10 phút',
      table: { head: ['Lần', 'H₂SO₄ đặc', 'Ester sau 10 phút (mô phỏng)', 'Ghi chú'], rows: runs.map((r, i) => [i + 1, r.cat ? 'Có' : 'Không', r.cat ? '≈ 65%' : '≈ 1%', r.ref ? 'Số liệu tham khảo' : 'Em làm']) },
      chart: { labels: runs.map(r => r.cat ? 'Có H₂SO₄ đặc' : 'Không xúc tác'), yLabel: 'Ester thu được (%)', series: [{ name: 'Ester', color: '#E8A33D', values: runs.map(r => r.cat ? 65 : 1) }] },
      conclusion: 'Acetic acid tác dụng với ethanol khi có H₂SO₄ đặc và đun nóng tạo ethyl acetate và nước. Phản ứng thuận nghịch nên không bao giờ chuyển hết thành ester. Ester nhẹ hơn nước, ít tan, có mùi thơm',
      note: 'Phần trăm ester là số liệu mô phỏng để so sánh, không phải số đo thật.'
    };
  }
  function auto(api) {
    if (st.smell && st.smell.isConnected) { st.smell.querySelector('[data-k="fan"]').click(); return 'fan'; }
    return false;
  }

  NL.lab.register('H6', { goal: 'Từ giấm và rượu, làm sao tạo ra chất có mùi thơm hoa quả?', build, steps, auto });
})();
