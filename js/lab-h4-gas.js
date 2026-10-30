// Thí nghiệm H4: điều chế O₂ (nhiệt phân KMnO₄, thu bằng đẩy nước) và CO₂ (CaCO₃ + HCl, thu bằng đẩy không khí), thử khí.
(function () {
  const A = NL.art;
  let st;

  function build(api) {
    const L = api.svg, el = api.el;
    st = { rows: [], fails: 0 };
    // ---------- phần O₂ ----------
    const gA = st.gA = api.g(L, 0, 0);
    el('rect', { x: 60, y: 455, width: 70, height: 12, rx: 5, fill: '#4A5A6A' }, gA);
    el('rect', { x: 84, y: 150, width: 9, height: 310, fill: '#6B7B8B' }, gA);
    // ống nghiệm nằm nghiêng, miệng hơi chúi xuống
    const tb = st.tubeA = api.g(gA, 120, 285); tb._extra = ' rotate(100)'; api.place(tb);
    el('path', { d: 'M-16 -170 L-16 -16 A16 16 0 0 0 16 -16 L16 -170', fill: 'rgba(220,240,255,.3)', stroke: A.GLASS, 'stroke-width': 3 }, tb);
    st.kmn = el('path', { d: 'M-13 -40 L-13 -14 A13 13 0 0 0 13 -14 L13 -40 Z', fill: '#5B2A6E', opacity: 0 }, tb);
    el('rect', { x: 88, y: 284, width: 110, height: 10, rx: 4, fill: '#6B7B8B' }, gA);
    st.pipeA = api.el('g', { opacity: 0 }, gA);
    el('path', { d: 'M 290 316 L 420 316 C 470 316, 480 350, 490 405', stroke: A.GLASS, 'stroke-width': 6, fill: 'none' }, st.pipeA);
    el('rect', { x: 280, y: 302, width: 16, height: 28, rx: 3, fill: '#5A4A3A', transform: 'rotate(10 288 316)' }, st.pipeA);
    // đèn cồn
    const lamp = st.lamp = api.g(gA, 150, 440);
    el('path', { d: 'M-34 0 L-26 -46 L26 -46 L34 0 Z', fill: 'rgba(220,240,255,.5)', stroke: A.GLASS, 'stroke-width': 3 }, lamp);
    el('rect', { x: -4, y: -62, width: 8, height: 18, fill: '#EEE' }, lamp);
    st.fire = el('path', { d: 'M0 -62 C -14 -80, -6 -100, 0 -118 C 6 -100, 14 -80, 0 -62 Z', fill: '#FFB020', opacity: 0 }, lamp);
    api.text(lamp, 0, 22, 'Đèn cồn', 13, '#6C88A3', 700);
    // chậu nước + bình thu úp ngược
    el('rect', { x: 400, y: 380, width: 200, height: 80, rx: 10, fill: 'rgba(150,210,245,.5)', stroke: A.GLASS, 'stroke-width': 4 }, gA);
    const jar = st.jarA = api.g(gA, 500, 0);
    el('rect', { x: -36, y: 220, width: 72, height: 190, rx: 10, fill: 'rgba(150,210,245,.55)', stroke: A.GLASS, 'stroke-width': 4 }, jar);
    st.gasA = el('rect', { x: -32, y: 224, width: 64, height: 0, fill: '#F7FBFF' }, jar);
    api.text(jar, 0, 210, 'Bình thu khí', 13, '#6C88A3', 700);
    st.bubA = api.g(gA, 0, 0);
    st.spoon = api.g(gA, 330, 500);
    el('path', { d: 'M-40 0 L20 0', stroke: '#8C8C8C', 'stroke-width': 4 }, st.spoon); el('ellipse', { cx: 26, cy: 0, rx: 10, ry: 6, fill: '#5B2A6E' }, st.spoon);
    api.text(st.spoon, 0, 22, 'Thìa KMnO₄', 12, '#6C88A3', 700);
    // ---------- phần CO₂ ----------
    const gB = st.gB = api.g(L, 0, 0); gB.style.display = 'none';
    const fl = st.flB = api.g(gB, 240, 460);
    st.liqB = el('path', { d: 'M-48 -8 L-34 -34 L34 -34 L48 -8 Z', fill: 'rgba(200,230,250,0)' }, fl);
    el('path', { d: 'M-14 -130 L-14 -70 L-56 -4 Q-58 4 -48 4 L48 4 Q58 4 56 -4 L14 -70 L14 -130', fill: 'rgba(220,240,255,.25)', stroke: A.GLASS, 'stroke-width': 3.5 }, fl);
    st.chalk = api.g(fl, 0, -14); st.chalk.style.display = 'none';
    [[-18, 0], [0, -4], [16, 1]].forEach(([x, y]) => el('path', { d: `M${x - 9} ${y + 6} L${x - 6} ${y - 6} L${x + 7} ${y - 7} L${x + 9} ${y + 6} Z`, fill: '#EDEDE6', stroke: '#B8B8AA', 'stroke-width': 1.5 }, st.chalk));
    el('path', { d: 'M-4 -130 L-4 -200 L-22 -230 L22 -230 L4 -200 L4 -130', fill: 'rgba(220,240,255,.35)', stroke: A.GLASS, 'stroke-width': 2.5 }, fl);
    api.text(fl, 0, 26, 'Bình tam giác + phễu', 13, '#6C88A3', 700);
    st.bubB = api.g(gB, 0, 0);
    el('path', { d: 'M 254 340 C 300 300, 420 300, 450 340 L 450 400', stroke: A.GLASS, 'stroke-width': 6, fill: 'none' }, gB);
    st.jarB = api.g(gB, 450, 470);
    st.jarShape = el('path', { d: 'M-34 0 L-34 -110 Q-34 -118 -24 -118 L24 -118 Q34 -118 34 -110 L34 0 Z', fill: 'rgba(220,240,255,.3)', stroke: A.GLASS, 'stroke-width': 3.5 }, st.jarB);
    st.gasB = el('rect', { x: -31, y: -3, width: 62, height: 0, fill: 'rgba(180,180,180,.35)' }, st.jarB);
    api.text(st.jarB, 0, 22, 'Bình thu khí', 13, '#6C88A3', 700);
    st.hcl = A.bottle(api, gB, 110, 460, 'HCl 2 M', '#CFE8F8');
    st.rock = api.g(gB, 110, 330);
    [[-12, 0], [8, -3]].forEach(([x, y]) => el('path', { d: `M${x - 9} ${y + 6} L${x - 6} ${y - 6} L${x + 7} ${y - 7} L${x + 9} ${y + 6} Z`, fill: '#EDEDE6', stroke: '#B8B8AA', 'stroke-width': 1.5 }, st.rock));
    api.text(st.rock, 0, 26, 'Đá vôi CaCO₃', 12, '#6C88A3', 700);
    st.lime = A.tube(api, gB, 620, 470, { h: 150, w: 34, label: 'Nước vôi trong', color: 'rgba(235,245,250,.8)', k: 0.55 });
    // que đóm dùng chung
    st.splint = api.g(L, 640, 300); st.splint.style.display = 'none';
    el('rect', { x: -4, y: -110, width: 8, height: 110, rx: 3, fill: '#C99A6B' }, st.splint);
    st.tip = el('path', { d: '', fill: '#FFB020' }, st.splint);
    st.lens = NL.chem.lens(api, L, 680, 150, 70, { title: '🔍 Trong bình thu' }); st.lens.g.style.display = 'none';
  }
  const setTip = kind => st.tip.setAttribute('d', kind === 'ember' ? 'M-5 -110 L5 -110 L4 -118 L-4 -118 Z' : 'M0 -112 C -10 -126, -4 -140, 0 -150 C 4 -140, 10 -126, 0 -112 Z');
  function splint(api, kind, x, y, cb) {
    setTip(kind); st.tip.setAttribute('fill', kind === 'ember' ? '#E5534B' : '#FFB020');
    st.splint.style.display = ''; api.place(st.splint, 640, 330); api.setOn(st.splint, true);
    api.draggable(st.splint, { target: { x, y, r: 110 }, snap: false, onDrop: () => cb() });
  }
  function bubbles(api, grp, x, y, top, rate, sec, onTick, done) {
    let t = 0, acc = 0; const bs = [];
    api.loop(dt => {
      t += dt; acc += rate * dt;
      while (acc > 1) { acc--; bs.push({ e: api.el('circle', { cx: x + Math.random() * 16 - 8, cy: y, r: 3 + Math.random() * 3, fill: 'rgba(255,255,255,.9)', stroke: '#9CC7E3' }, grp), y }); }
      for (let i = bs.length - 1; i >= 0; i--) { bs[i].y -= 70 * dt; bs[i].e.setAttribute('cy', bs[i].y); if (bs[i].y < top) { bs[i].e.remove(); bs.splice(i, 1); } }
      onTick && onTick(Math.min(1, t / sec));
      if (t >= sec) { bs.forEach(b => b.e.remove()); done(); return false; }
    });
  }
  function sideTable(api) {
    if (!st.tbl) st.tbl = api.table(['Khí', 'Cách thu', 'Thử bằng', 'Hiện tượng']);
    st.tbl.set(st.rows.map(r => [r.g, r.m, r.t, r.p]));
  }

  const steps = [
    {
      label: 'O₂ · 1/4', text: 'Cho một thìa KMnO₄ (thuốc tím) vào ống nghiệm', hint: 'Kéo thìa vào miệng ống nghiệm',
      enter(api) {
        sideTable(api);
        api.card({ kicker: '🥽 An toàn', text: 'Đeo kính bảo hộ. Ống nghiệm đặt hơi chúi miệng xuống để hơi nước không chảy ngược làm nứt ống. Không thổi tắt đèn cồn, đậy nắp để tắt.', btn: 'Đã hiểu ➜' });
        if (!api.prediction) api.ask({ predict: true, q: 'Khí CO₂ nặng hơn không khí. Thu CO₂ vào bình bằng cách đẩy không khí thì đặt bình thế nào?', options: [{ t: 'Đặt ngửa bình' }, { t: 'Úp ngược bình' }, { t: 'Đặt thế nào cũng được' }] });
        api.setOn(st.spoon, true);
        api.draggable(st.spoon, { target: { x: 240, y: 300, r: 100 }, onDrop: () => { st.kmn.setAttribute('opacity', 1); st.spoon.style.display = 'none'; api.done(); } });
      }
    },
    {
      label: 'O₂ · 2/4', text: 'Chạm vào ống nghiệm để đậy nút có ống dẫn, đưa đầu ống dẫn vào dưới bình thu', hint: 'Chạm ống nghiệm',
      enter(api) { api.setOn(st.tubeA, true); api.tapable(st.tubeA, () => { st.pipeA.setAttribute('opacity', 1); api.done(); }); }
    },
    {
      label: 'O₂ · 3/4', text: 'Châm đèn cồn để đun nóng KMnO₄', hint: 'Chạm vào đèn cồn',
      enter(api) {
        api.setOn(st.lamp, true);
        api.tapable(st.lamp, () => {
          st.fire.setAttribute('opacity', 1);
          api.say('Bọt khí thoát ra, đẩy nước ra khỏi bình thu…');
          st.lens.g.style.display = ''; st.lens.set([{ f: 'H₂O', n: 6 }]);
          bubbles(api, st.bubA, 500, 400, 230, 6, 7, k => { st.gasA.setAttribute('height', 175 * k); if (k > 0.3) st.lens.set([{ f: 'O₂', n: Math.round(8 * k) }, { f: 'H₂O', n: Math.round(6 * (1 - k)) }]); }, () => { api.say('2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑ (đun nóng)'); api.done('Thử khí ➜'); });
        });
      }
    },
    {
      label: 'O₂ · 4/4', text: 'Đưa que đóm còn tàn đỏ vào miệng bình khí', hint: 'Kéo que đóm vào bình thu',
      enter(api) {
        splint(api, 'ember', 500, 300, () => {
          setTip('flame'); st.tip.setAttribute('fill', '#FFB020'); NL.audio.play('ting');
          api.say('Que đóm bùng cháy: khí O₂ duy trì sự cháy');
          st.rows.push({ g: 'O₂', m: 'Đẩy nước', t: 'Que đóm tàn đỏ', p: 'Bùng cháy' }); sideTable(api);
          api.wait(1.2, () => { st.splint.style.display = 'none'; api.done('Kết thúc phần O₂ ➜'); });
        });
      }
    },
    {
      label: 'Kết thúc phần O₂', text: 'Dừng thí nghiệm: em làm việc nào trước?', hint: 'Nghĩ xem nếu ống nghiệm nguội đi khi ống dẫn còn nhúng trong nước thì sao',
      enter(api) {
        const c = api.panel(`<div>Làm việc nào trước?</div><button class="btn small pop" data-k="lamp">🔥 Tắt đèn cồn</button><button class="btn small pop" data-k="pipe">🧪 Rút ống dẫn khỏi nước</button>`);
        st.endCtl = c;
        c.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { c.remove(); end(api, b.dataset.k); }));
      }
    },
    {
      label: 'CO₂ · 1/3', text: 'Cho vài mẩu đá vôi vào bình tam giác', hint: 'Kéo đá vôi vào bình tam giác',
      enter(api) {
        st.gA.style.display = 'none'; st.gB.style.display = ''; st.lens.set([]); st.lens.g.style.display = 'none';
        api.setOn(st.rock, true);
        api.draggable(st.rock, { target: { x: 240, y: 380, r: 90 }, onDrop: () => { st.rock.style.display = 'none'; st.chalk.style.display = ''; api.done(); } });
      }
    },
    {
      label: 'CO₂ · 2/3', text: 'Chọn cách đặt bình thu, rồi rót HCl qua phễu', hint: 'Chọn Ngửa hoặc Úp ở bên phải, rồi kéo lọ HCl vào miệng phễu',
      enter(api) {
        st.up = st.up || 'nguoc';
        st.pos = api.choices({ label: 'Bình thu đặt', items: [{ t: '⬆ Ngửa', v: 'ngua' }, { t: '⬇ Úp ngược', v: 'nguoc' }], value: st.up, onPick(v) { st.up = v; st.jarB._extra = v === 'nguoc' ? ' scale(1,-1) translate(0,118)' : ''; api.place(st.jarB); } });
        st.pos.set(st.up);
        api.setOn(st.hcl, true);
        api.draggable(st.hcl, { target: { x: 240, y: 230, r: 90 }, onDrop: () => { st.pos.remove(); api.tween(st.hcl, 110, 460, 400); pourB(api); } });
      }
    },
    {
      label: 'CO₂ · 3/3', text: 'Thử khí: que đóm đang cháy rồi nước vôi trong', hint: 'Kéo que đóm đang cháy vào miệng bình thu',
      enter(api) {
        splint(api, 'flame', 450, 340, () => {
          st.tip.setAttribute('d', ''); NL.audio.play('pop');
          api.say('Que đóm tắt: CO₂ không duy trì sự cháy. Giờ chạm ống nước vôi trong để dẫn khí vào');
          api.wait(0.8, () => { st.splint.style.display = 'none'; api.setOn(st.lime, true); api.tapable(st.lime, () => {
            let k = 0; api.loop(dt => { k += dt / 2; st.lime.fill(`rgba(245,245,240,${0.6 + 0.35 * Math.min(1, k)})`, 0.55); if (k >= 1) return false; });
            api.say('Nước vôi trong vẩn đục: CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O');
            st.rows.push({ g: 'CO₂', m: 'Đẩy không khí, bình ngửa', t: 'Que đóm cháy, nước vôi trong', p: 'Que đóm tắt, nước vôi đục' }); sideTable(api);
            api.wait(2, () => api.done('Xem kết quả ➜'));
          }); });
        });
      }
    },
    {
      label: 'Kết quả', text: 'Khối lượng mol của khí so với không khí', hint: 'Khí nặng hơn không khí thì chìm xuống đáy bình',
      enter(api) { st.lens.g.style.display = 'none'; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Đặt ngửa bình', truth: 'CO₂ (44 g/mol) nặng hơn không khí (khoảng 29 g/mol) nên chìm xuống, phải đặt ngửa bình.',
          sub: 'O₂ ít tan trong nước nên thu được bằng cách đẩy nước. CO₂ tan được một phần trong nước nên thường thu bằng cách đẩy không khí.',
          result: result(),
          quiz: [{
            kicker: '❓ Vì sao?', q: 'Vì sao phải rút ống dẫn ra khỏi nước trước rồi mới tắt đèn cồn?',
            options: [
              { t: 'Để nước không bị hút ngược vào ống nghiệm đang nóng làm nứt ống', ok: true },
              { t: 'Để khí O₂ trong bình không bay mất', why: 'Bình thu đã úp trong nước nên khí không thoát. Điều gì xảy ra khi ống nghiệm nguội đi?' },
              { t: 'Để đèn cồn tắt nhanh hơn', why: 'Thứ tự này không làm đèn tắt nhanh hơn. Nghĩ tới áp suất khí trong ống khi nguội.' }
            ],
            explain: 'Tắt đèn trước thì khí trong ống nguội và co lại, áp suất giảm, nước trong chậu bị hút ngược vào ống nghiệm nóng, làm ống nứt vỡ.'
          }]
        });
      }
    }
  ];

  function end(api, k) {
    if (k === 'lamp') {
      st.fire.setAttribute('opacity', 0);
      const back = api.el('path', { d: 'M 490 405 C 480 350, 470 316, 420 316 L 290 316', stroke: 'rgba(120,190,240,.95)', 'stroke-width': 5, fill: 'none', 'stroke-dasharray': 300, 'stroke-dashoffset': 300 }, st.gA);
      let t = 0; api.loop(dt => { t += dt; back.setAttribute('stroke-dashoffset', Math.max(0, 300 - t * 260)); if (t > 1.3) return false; });
      api.wait(1.4, () => {
        const crack = api.el('path', { d: 'M 190 292 l 10 -8 l 6 10 l 10 -9', stroke: '#333', 'stroke-width': 2.5, fill: 'none' }, st.gA);
        NL.audio.play('pop');
        api.lesson({ title: 'Tắt đèn cồn trước khi rút ống dẫn', text: 'Nước trong chậu bị hút ngược vào ống nghiệm đang nóng, ống bị nứt!', sub: 'Khí trong ống nguội đi thì co lại, áp suất giảm nên nước bị hút vào. Bài học: luôn rút ống dẫn ra khỏi nước trước, rồi mới tắt đèn cồn.', btn: '🔁 Làm lại bước này' }, () => {
          back.remove(); crack.remove(); st.fire.setAttribute('opacity', 1); api.goto(4);
        });
      });
      return;
    }
    st.pipeA.setAttribute('opacity', 0.4);
    api.wait(0.5, () => { st.fire.setAttribute('opacity', 0); NL.audio.play('ting'); api.say('Đúng thứ tự: rút ống dẫn trước, đậy nắp tắt đèn cồn sau'); api.done('Sang phần CO₂ ➜'); });
  }
  function pourB(api) {
    st.liqB.setAttribute('fill', 'rgba(200,230,250,.6)');
    const up = st.up === 'ngua';
    api.say('Đá vôi sủi bọt: CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O');
    st.lens.g.style.display = '';
    bubbles(api, st.bubB, 240, 440, 380, 8, 5, k => {
      st.gasB.setAttribute('height', up ? 110 * k : 0); st.gasB.setAttribute('y', up ? -3 - 110 * k : -3);
      st.lens.set(up ? [{ f: 'CO₂', n: Math.round(8 * k) }, { f: 'N₂', n: Math.round(4 * (1 - k)) }, { f: 'O₂', n: Math.round(1 - k) }] : [{ f: 'N₂', n: 4 }, { f: 'O₂', n: 1 }, { f: 'CO₂', n: 1 }]);
    }, () => {
      if (!up) {
        api.lesson({ title: 'Úp ngược bình khi thu CO₂', text: 'Bình gần như không giữ được CO₂: khí nặng hơn không khí nên chảy xuống và thoát ra ngoài qua miệng bình úp.', sub: 'Bài học: khí nặng hơn không khí (CO₂, M = 44) thì đặt ngửa bình. Khí nhẹ hơn (H₂) mới úp ngược bình.', btn: '🔁 Thu lại' }, () => {
          st.chalk.style.display = ''; st.gasB.setAttribute('height', 0); st.up = 'ngua'; api.goto(6);
        });
        return;
      }
      api.done('Thử khí ➜');
    });
  }

  function result() {
    return {
      title: 'Điều chế và thử khí O₂, CO₂', param: 'Nhiệt phân KMnO₄; CaCO₃ + HCl',
      table: { head: ['Lần', 'Khí', 'Cách thu', 'Thử bằng', 'Hiện tượng'], rows: st.rows.map((r, i) => [i + 1, r.g, r.m, r.t, r.p]) },
      chart: { labels: ['Không khí', 'O₂', 'CO₂'], yLabel: 'Khối lượng mol (g/mol)', series: [{ name: 'M', color: '#9B6BD6', values: [29, 32, 44] }] },
      conclusion: 'O₂ ít tan trong nước, thu bằng cách đẩy nước; O₂ làm que đóm còn tàn đỏ bùng cháy. CO₂ nặng hơn không khí, thu bằng cách đẩy không khí với bình đặt ngửa; CO₂ làm tắt que đóm đang cháy và làm vẩn đục nước vôi trong',
      note: 'Dẫn CO₂ dư vào nước vôi trong thì dung dịch trong trở lại vì CaCO₃ tan thành Ca(HCO₃)₂.'
    };
  }
  function auto(api) {
    if (st.endCtl && st.endCtl.isConnected) { st.endCtl.querySelector('[data-k="pipe"]').click(); return 'end'; }
    return false;
  }

  NL.lab.register('H4', { goal: 'Làm sao tạo ra và nhận biết khí O₂, khí CO₂?', build, steps, auto });
})();
