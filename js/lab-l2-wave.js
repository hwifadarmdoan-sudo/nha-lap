// Thí nghiệm L2: giao thoa sóng nước. Hai nguồn kết hợp, đếm vân cực đại, đảo pha, neo tàu cứu nạn trên vân cực đại.
(function () {
  const P = NL.phys, vn = P.vn;
  const CW = 260, CH = 190, SC = 2, X0 = 40, Y0 = 60; // ô lưới 0,1 cm; khung nước 520×380
  const V = 30; // tốc độ truyền sóng 30 cm/s
  const SY = 172; // hàng đặt hai nguồn (gần bờ)
  let st;
  const $ = id => document.getElementById(id);

  function build(api) {
    api_ = api;
    const L = api.svg, el = api.el;
    st = { f: 10, a: 6, phase: 0, mode: null, rows: [], t: 0, dirty: true, ship: null, showMax: false, mission: false };
    el('rect', { x: X0 - 10, y: Y0 - 10, width: CW * SC + 20, height: CH * SC + 20, rx: 14, fill: '#4A5A6A' }, L);
    const fo = el('foreignObject', { x: X0, y: Y0, width: CW * SC, height: CH * SC }, L);
    const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
    cv.style.cssText = `width:${CW * SC}px;height:${CH * SC}px;display:block;image-rendering:auto;touch-action:none`;
    fo.appendChild(cv); st.cv = cv; st.ctx = cv.getContext('2d'); st.img = st.ctx.createImageData(CW, CH);
    // bờ biển và hai trạm phát
    el('rect', { x: X0, y: Y0 + (SY + 8) * SC, width: CW * SC, height: (CH - SY - 8) * SC, fill: '#E2C499', opacity: .9 }, L);
    st.ov = el('g', {}, L);
    st.s1 = api.g(L, 0, 0); st.s2 = api.g(L, 0, 0);
    [st.s1, st.s2].forEach((s, k) => { el('circle', { r: 10, fill: '#F2C230', stroke: '#fff', 'stroke-width': 3 }, s); api.text(s, 0, 30, 'S' + (k + 1), 15, '#1F4E79', 800); });
    // tàu cứu nạn
    st.shipG = api.g(L, -100, -100);
    el('path', { d: 'M-22 0 L22 0 L14 12 L-14 12 Z', fill: '#E5534B', stroke: '#fff', 'stroke-width': 2 }, st.shipG);
    el('rect', { x: -6, y: -16, width: 12, height: 16, fill: '#fff' }, st.shipG);
    el('line', { x1: 0, y1: -16, x2: 0, y2: -30, stroke: '#4A5A6A', 'stroke-width': 2 }, st.shipG);
    st.sig = api.text(st.shipG, 0, -36, '', 13, '#fff', 800);
    // bảng số đo bên phải khung nước
    const info = api.g(L, 680, 120);
    el('rect', { x: -100, y: -50, width: 200, height: 190, rx: 16, fill: '#fff', stroke: '#C9D8E6', 'stroke-width': 2 }, info);
    api.text(info, 0, -22, '📡 Bảng radar', 16, '#1F4E79', 800);
    st.iL = api.text(info, 0, 12, '', 15, '#1F4E79', 700);
    st.iA = api.text(info, 0, 42, '', 15, '#1F4E79', 700);
    st.iR = api.text(info, 0, 72, '', 15, '#1F4E79', 700);
    st.iM = api.text(info, 0, 108, '', 14, '#6C88A3', 700);
    api.text(L, 680, 330, 'Sáng = sóng mạnh', 13, '#6C88A3', 700); api.text(L, 680, 350, 'Phẳng lặng = vân cực tiểu', 13, '#6C88A3', 700);
    cv.addEventListener('pointerdown', e => {
      if (!st.mission) return;
      const r = cv.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * CW, py = (e.clientY - r.top) / r.height * CH;
      if (py > SY - 6) { NL.game.toast('Neo tàu ngoài biển, xa bờ hơn một chút'); return; }
      st.onShip && st.onShip(px, py);
    });
    geom(); api.loop(dt => draw(dt));
  }
  const lam = () => V / st.f; // cm
  const srcX = k => CW / 2 + (k ? 1 : -1) * st.a * 5; // a cm = 10a ô, mỗi nguồn cách tâm 5a ô
  function geom() {
    st.r1 = new Float32Array(CW * CH); st.r2 = new Float32Array(CW * CH);
    const x1 = srcX(0), x2 = srcX(1);
    for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) { const i = y * CW + x; st.r1[i] = Math.hypot(x - x1, y - SY) / 10; st.r2[i] = Math.hypot(x - x2, y - SY) / 10; }
    api_.place(st.s1, X0 + x1 * SC, Y0 + SY * SC); api_.place(st.s2, X0 + x2 * SC, Y0 + SY * SC);
    const l = lam(); st.iL.textContent = `λ = v/f = ${vn(l, 2)} cm`; st.iA.textContent = `S₁S₂ = a = ${vn(st.a, 1)} cm`; st.iR.textContent = `a/λ = ${vn(st.a / l, 2)}`;
    overlay();
  }
  // vẽ các đường cực đại (hyperbol) khi em bật trợ giúp
  function overlay() {
    st.ov.innerHTML = '';
    const el = api_.el, l = lam(), x1 = srcX(0), x2 = srcX(1), c = (x2 - x1) / 2, cx = (x1 + x2) / 2;
    el('line', { x1: X0 + x1 * SC, y1: Y0 + SY * SC, x2: X0 + x2 * SC, y2: Y0 + SY * SC, stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: .8 }, st.ov);
    if (!st.showMax) return;
    const half = st.phase ? 0.5 : 0;
    for (let k = -20; k <= 20; k++) {
      const dd = (k + half) * l * 10; // hiệu đường đi, đơn vị ô
      if (Math.abs(dd) >= 2 * c) continue;
      const A = dd / 2, B2 = c * c - A * A; let d = '';
      for (let s = 0; s <= 40; s++) { const yy = s * 4.6; const xx = A === 0 ? 0 : Math.sign(A) * Math.abs(A) * Math.sqrt(1 + yy * yy / B2); d += (s ? ' L' : 'M') + (X0 + (cx + xx) * SC) + ' ' + (Y0 + (SY - yy) * SC); }
      el('path', { d, fill: 'none', stroke: '#FFE14D', 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: .9 }, st.ov);
    }
  }
  function draw(dt) {
    st.t += dt;
    const d = st.img.data, k = 2 * Math.PI / lam(), w1 = 2 * Math.PI * st.f * 0.12, f2 = st.mode === 'sep' ? 1.06 : 1, w2 = w1 * f2, t = st.t, on = !!st.mode;
    for (let i = 0; i < CW * CH; i++) {
      const r1 = st.r1[i], r2 = st.r2[i];
      // sóng chạy chậm lại 0,12 lần để mắt kịp nhìn
      let z = on ? (Math.cos(w1 * t - k * r1) / Math.sqrt(1 + r1 * 0.6) + Math.cos(w2 * t - k * r2 * f2 + st.phase) / Math.sqrt(1 + r2 * 0.6)) : 0;
      const b = Math.max(-1, Math.min(1, z * 0.75)), j = i * 4;
      d[j] = 40 + 90 * Math.max(0, b); d[j + 1] = 110 + 70 * b; d[j + 2] = 170 + 60 * b; d[j + 3] = 255;
    }
    st.ctx.putImageData(st.img, 0, 0);
    if (st.ship) {
      const amp = ampAt(st.ship.x, st.ship.y);
      api_.place(st.shipG, X0 + st.ship.x * SC, Y0 + st.ship.y * SC + Math.sin(st.t * 6) * 9 * amp);
      st.shipG._extra = ` rotate(${Math.sin(st.t * 6 + 1) * 10 * amp})`; api_.place(st.shipG);
      st.sig.textContent = 'Tín hiệu ' + Math.round(amp * 100) + '%';
    }
  }
  // biên độ tổng hợp (0..1) tại một điểm
  function ampAt(x, y) {
    const k = 2 * Math.PI / lam(), r1 = Math.hypot(x - srcX(0), y - SY) / 10, r2 = Math.hypot(x - srcX(1), y - SY) / 10;
    const re = Math.cos(k * r1) + Math.cos(k * r2 - st.phase), im = Math.sin(k * r1) + Math.sin(k * r2 - st.phase);
    return Math.hypot(re, im) / 2;
  }
  let api_;
  function controls(api, phase) {
    st.fC = api.slider({ label: 'Tần số f của hai nguồn', min: 5, max: 20, step: 0.5, value: st.f, unit: 'Hz', onInput(v) { st.f = v; geom(); } });
    st.aC = api.slider({ label: 'Khoảng cách hai nguồn a', min: 2, max: 12, step: 0.5, value: st.a, unit: 'cm', onInput(v) { st.a = v; geom(); } });
    api.choices({ label: 'Trợ giúp', items: [{ t: 'Ẩn đường cực đại', v: false }, { t: 'Hiện đường cực đại', v: true }], value: st.showMax, onPick(v) { st.showMax = v; overlay(); } });
    if (phase) api.choices({ label: 'Pha của S₂ so với S₁', items: [{ t: 'Cùng pha', v: 0 }, { t: 'Ngược pha', v: Math.PI }], value: st.phase, onPick(v) { st.phase = v; overlay(); phase(v); } });
  }
  function nMax() { const r = st.a / lam(); return 2 * Math.floor(r - 1e-9) + 1; }
  function sideTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['f (Hz)', 'λ (cm)', 'a (cm)', 'Cực đại']);
    st.tbl.set(st.rows.map(r => [vn(r.f), vn(r.l, 2), vn(r.a, 1), r.n]));
  }

  const steps = [
    {
      label: 'Bật trạm phát', text: 'Chọn cách nối hai trạm phát sóng S₁ và S₂', hint: 'Chọn một cách ở cột phải rồi nhìn mặt nước',
      enter(api) {
        api_ = api;
        if (!api.prediction) api.ask({ predict: true, q: 'Hai nguồn giống hệt nhau cùng dao động. Một điểm nằm cách đều hai nguồn sẽ…?', options: [{ t: 'Dao động mạnh nhất' }, { t: 'Đứng yên' }, { t: 'Lúc mạnh lúc yếu, không theo quy luật' }] });
        st.mode = null;
        api.choices({ label: 'Nối hai trạm phát', items: [{ t: 'Hai máy phát riêng', v: 'sep' }, { t: 'Chung một máy phát', v: 'one' }], value: null, onPick(v) {
          st.mode = v; NL.audio.play('bubble');
          if (v === 'sep') {
            api.say('Hai máy phát riêng chạy lệch nhau một chút…');
            api.wait(3, () => api.lesson({ title: 'Hai nguồn không kết hợp thì không có vân ổn định', text: 'Các vệt sóng cứ trôi đi trôi lại, không đứng yên được! Hai máy phát riêng không bao giờ cùng tần số tuyệt đối, nên độ lệch pha thay đổi liên tục.', sub: 'Bài học: muốn có vân giao thoa ổn định, hai nguồn phải là nguồn kết hợp: cùng tần số và độ lệch pha không đổi. Cách dễ nhất là dùng chung một máy phát.', btn: '🔌 Nối chung một máy phát' }, () => { st.mode = 'one'; api.goto(1); }));
          } else { api.say('Mặt nước hiện các dải sóng mạnh và dải lặng xen kẽ, đứng yên tại chỗ'); api.done(); }
        } });
      }
    },
    {
      label: () => `Đếm vân · ${st.rows.length}/3 lần`, text: 'Đổi f hoặc a, đếm số dải sóng mạnh cắt qua đoạn S₁S₂ rồi bấm Ghi. Làm 3 lần', hint: 'Bật "Hiện đường cực đại" nếu khó đếm. Đếm cả dải chính giữa',
      enter(api) {
        st.mode = 'one'; sideTable(api); controls(api);
        P.recButton(api, '📌 Ghi và đếm vân', () => {
          const r = st.a / lam(), fr = r - Math.floor(r);
          if (fr < 0.06 || fr > 0.94) { NL.game.toast('a/λ đang gần số nguyên, vân sát ngay nguồn khó đếm. Chỉnh a hoặc f lệch một chút'); return; }
          if (st.rows.some(x => x.f === st.f && x.a === st.a)) { NL.game.toast('Cách đặt này đã ghi rồi. Đổi f hoặc a nhé'); return; }
          const N = nMax(), opts = [N - 2, N, N + 2, N + 4].filter(n => n > 0);
          api.ask({
            q: `Có bao nhiêu dải sóng mạnh (vân cực đại) cắt qua đoạn S₁S₂? Bảng radar: a/λ = ${vn(r, 2)}`,
            options: opts.map(n => ({ t: n + ' vân', ok: n === N, why: 'Đếm lại trên đoạn nét đứt nối S₁ và S₂. Vân cực đại nằm ở chỗ hiệu đường đi bằng kλ, với −a/λ < k < a/λ.' })),
            explain: `Hai vân cực đại liền kề trên S₁S₂ cách nhau λ/2. Với a/λ = ${vn(r, 2)}, k nhận các giá trị từ −${Math.floor(r)} đến ${Math.floor(r)}, tức ${N} vân.`
          }, res => {
            st.rows.push({ f: st.f, l: lam(), a: st.a, n: N, r }); sideTable(api);
            $('stepNo').textContent = `Đếm vân · ${st.rows.length}/3 lần`;
            if (st.rows.length >= 3) api.done('Thử đảo pha ➜');
          });
        });
      }
    },
    {
      label: 'Đảo pha', text: 'Cho S₂ dao động ngược pha với S₁. Nhìn đường chính giữa hai nguồn', hint: 'Chọn "Ngược pha" ở cột phải',
      enter(api) {
        controls(api, v => {
          if (v !== Math.PI || st.askedPhase) return; st.askedPhase = true;
          api.wait(1.5, () => api.ask({
            q: 'Khi hai nguồn ngược pha, đường chính giữa (cách đều S₁, S₂) bây giờ là gì?',
            options: [{ t: 'Một vân cực tiểu: nước gần như đứng yên', ok: true }, { t: 'Vẫn là vân cực đại', why: 'Nhìn kỹ dải chính giữa: còn sáng mạnh không? Đỉnh sóng của nguồn này tới cùng lúc với hõm sóng của nguồn kia.' }, { t: 'Không còn vân nào nữa', why: 'Các vân vẫn còn, chỉ đổi chỗ cho nhau.' }],
            explain: 'Hai sóng đi quãng đường bằng nhau nhưng xuất phát ngược pha, nên tới nơi vẫn ngược pha và triệt tiêu nhau. Cực đại và cực tiểu đổi chỗ cho nhau.'
          }, () => { st.phase = 0; overlay(); api.done('Sang nhiệm vụ cứu nạn ➜'); }));
        });
      }
    },
    {
      label: 'Nhiệm vụ', text: 'Chạm lên mặt biển để neo tàu cứu nạn ở chỗ sóng tín hiệu mạnh', hint: 'Neo tàu lên một dải sóng sáng mạnh. Tránh dải nước lặng',
      enter(api) {
        st.phase = 0; overlay(); st.mission = true;
        api.panel('<div>🚢 Tàu cần tín hiệu từ 80% trở lên</div>');
        st.onShip = (x, y) => {
          st.ship = { x, y }; NL.audio.play('drop');
          const a = ampAt(x, y);
          if (a < 0.35) {
            st.onShip = null;
            api.wait(1.4, () => api.lesson({ title: 'Neo tàu vào vân cực tiểu', text: `Tín hiệu chỉ còn ${Math.round(a * 100)}%! Tàu nằm trên dải nước lặng: sóng từ hai trạm tới đây ngược pha nên triệt tiêu nhau.`, sub: 'Bài học: vân cực tiểu không phải chỗ sóng không tới. Sóng của cả hai trạm vẫn tới, nhưng chúng ngược pha nên cộng lại gần bằng 0.', btn: '🚢 Neo lại' }, () => { st.ship = null; api.goto(3); }));
          } else if (a >= 0.8) {
            st.onShip = null; st.mission = false; NL.audio.play('success');
            api.say(`Tín hiệu ${Math.round(a * 100)}%: tàu nằm trên vân cực đại, nhận được đường dẫn về bờ! 🎉`); api.done('Xem kết quả ➜');
          } else NL.game.toast(`Tín hiệu ${Math.round(a * 100)}%, chưa đủ. Dịch sang giữa dải sáng gần đó`);
        };
      }
    },
    {
      label: 'Kết quả', text: 'Số vân cực đại trên S₁S₂ theo tỉ số a/λ', hint: 'a/λ càng lớn, càng nhiều vân',
      enter(api) { st.mission = false; api.showChart(result()); api.done('Trả lời câu hỏi ➜'); },
      onNext(api) {
        api.wrapUp({
          right: 'Dao động mạnh nhất', truth: 'khi hai nguồn cùng pha, điểm cách đều hai nguồn nhận hai sóng cùng pha nên dao động mạnh nhất (vân cực đại giữa).',
          sub: 'Ở điểm có hiệu đường đi d₂ − d₁ = kλ, hai sóng tăng cường nhau. Ở điểm có d₂ − d₁ = (k + ½)λ, chúng triệt tiêu nhau.',
          result: result(),
          quiz: [{
            kicker: '❓ Dự đoán', q: 'Giữ nguyên a, giảm tần số f của hai nguồn. Số vân cực đại trên S₁S₂ sẽ…?',
            options: [{ t: 'Giảm đi', ok: true }, { t: 'Tăng lên', why: 'f giảm thì λ = v/f lớn lên. Vân cách nhau λ/2 nên thưa ra.' }, { t: 'Không đổi', why: 'Nhìn bảng radar: a/λ thay đổi khi f thay đổi.' }],
            explain: 'f giảm làm λ tăng, các vân giãn xa nhau (cách nhau λ/2) nên trên đoạn S₁S₂ có ít vân hơn.'
          }]
        });
      }
    }
  ];

  function result() {
    const pts = st.rows.map(r => [+r.r.toFixed(2), r.n]).sort((a, b) => a[0] - b[0]);
    const th = []; for (let x = 0.05; x <= 4; x += 0.05) th.push([+x.toFixed(2), 2 * Math.floor(x) + 1]);
    return {
      title: 'Giao thoa sóng nước', param: 'Hai nguồn kết hợp, tốc độ truyền sóng 30 cm/s, f 5–20 Hz, a 2–12 cm',
      table: { head: ['Lần', 'f (Hz)', 'λ (cm)', 'a (cm)', 'a/λ', 'Số vân cực đại'], rows: st.rows.map((r, i) => [i + 1, vn(r.f), vn(r.l, 2), vn(r.a, 1), vn(r.r, 2), r.n]) },
      chart: { type: 'line', xLabel: 'a/λ', yLabel: 'Số vân cực đại trên S₁S₂', xMin: 0, xMax: 4, yMin: 0, yMax: 10, series: [{ name: 'Lí thuyết', color: '#9AA9B7', dash: true, points: th }, { name: 'Em đếm', color: '#2F80C0', dots: true, points: pts }] },
      conclusion: 'Hai nguồn kết hợp tạo ra hệ vân cực đại và cực tiểu đứng yên, có dạng hyperbol. Trên đoạn nối hai nguồn, hai vân cực đại liền kề cách nhau λ/2, nên a/λ càng lớn thì càng nhiều vân. Khi hai nguồn ngược pha, cực đại và cực tiểu đổi chỗ cho nhau',
      note: 'Mặt nước mô phỏng chạy chậm lại để dễ quan sát.'
    };
  }
  function auto(api) {
    const k = api.step;
    if (k === 0 && !st.mode) { document.querySelectorAll('#labSide .seg-b')[1].click(); return 'one'; }
    if (k === 1) { const fs = [8, 12, 16]; if (st.rows.length < 3) { st.fC.set(fs[st.rows.length]); st.aC.set(6.8); [...document.querySelectorAll('#labSide .btn')].pop().click(); return 'rec'; } }
    if (k === 2 && !st.askedPhase) { const b = [...document.querySelectorAll('#labSide .seg-b')].find(x => x.textContent === 'Ngược pha'); b.click(); return 'phase'; }
    if (k === 3 && st.onShip) { st.onShip(CW / 2, 80); return 'ship'; }
    return false;
  }

  NL.lab.register('L2', { clearSide: true, auto, goal: 'Hai nguồn sóng giống nhau gặp nhau trên mặt nước thì tạo ra hình ảnh gì?', build, steps });
})();
