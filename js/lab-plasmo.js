// Thí nghiệm 2B: co và phản co nguyên sinh ở tế bào biểu bì lá thài lài tía.
(function () {
  const STAGE = { x: 850, y: 300 };
  let st;

  function build(api) {
    const L = api.svg, el = api.el;
    st = { runs: [], C: 5, zoom: 10, cells: [], speed: 5 };

    // kính hiển vi
    const mic = api.g(L, 850, 0);
    el('path', { d: 'M-70 452 L70 452 L56 432 L-56 432 Z', fill: '#4A5A6A' }, mic);
    el('path', { d: 'M30 432 L30 250 Q30 190 -10 170 L-26 190 Q4 206 4 250 L4 432 Z', fill: '#5E6E7E' }, mic);
    el('rect', { x: -60, y: 300, width: 100, height: 14, rx: 4, fill: '#3B4B5B' }, mic);
    el('rect', { x: -44, y: 120, width: 30, height: 110, rx: 8, fill: '#6B7B8B', transform: 'rotate(-18 -29 175)' }, mic);
    el('rect', { x: -40, y: 236, width: 18, height: 40, rx: 4, fill: '#8C9CAC' }, mic);
    el('circle', { cx: 30, cy: 330, r: 14, fill: '#8C9CAC' }, mic);
    api.text(mic, 0, 525, 'Kính hiển vi', 15, '#6C88A3', 700);

    // lá thài lài tía
    const leaf = api.g(L, 160, 440);
    el('path', { d: 'M-70 0 Q-10 -70 70 -20 Q10 30 -70 0 Z', fill: '#7A3E9D' }, leaf);
    el('path', { d: 'M-70 0 Q-10 -55 66 -20', fill: 'none', stroke: '#4FA36B', 'stroke-width': 4 }, leaf);
    api.text(leaf, 0, 85, 'Lá thài lài tía', 15, '#6C88A3', 700);
    st.leaf = leaf;
    st.peel = api.g(L, 150, 425); st.peel.style.display = 'none';
    el('path', { d: 'M-26 0 Q0 -14 26 -4 Q4 10 -26 0 Z', fill: 'rgba(170,90,210,.85)', stroke: '#fff', 'stroke-width': 2 }, st.peel);

    // kim mũi mác
    const nd = api.g(L, 310, 470);
    el('rect', { x: -60, y: -5, width: 80, height: 10, rx: 5, fill: '#C99A6B' }, nd);
    el('path', { d: 'M20 -3 L70 0 L20 3 Z', fill: '#9AA9B7' }, nd);
    api.text(nd, 0, 55, 'Kim mũi mác', 15, '#6C88A3', 700);
    st.needle = nd;

    // lam kính có giọt nước
    const sl = api.g(L, 470, 465);
    el('rect', { x: -80, y: -14, width: 160, height: 28, rx: 4, fill: 'rgba(210,240,255,.75)', stroke: '#8FBBD8', 'stroke-width': 3 }, sl);
    el('ellipse', { cx: 0, cy: 0, rx: 18, ry: 7, fill: 'rgba(120,190,240,.7)' }, sl);
    st.slPeel = el('path', { d: 'M-24 0 Q0 -10 24 -3 Q4 8 -24 0 Z', fill: 'rgba(170,90,210,.85)', style: 'display:none' }, sl);
    st.slLamen = el('rect', { x: -30, y: -12, width: 60, height: 24, rx: 2, fill: 'rgba(255,255,255,.55)', stroke: '#A8C8DE', 'stroke-width': 2, style: 'display:none' }, sl);
    api.text(sl, 0, 60, 'Lam kính', 15, '#6C88A3', 700);
    st.slide = sl;

    // lamen
    const lm = api.g(L, 640, 470);
    el('rect', { x: -32, y: -14, width: 64, height: 28, rx: 3, fill: 'rgba(255,255,255,.6)', stroke: '#A8C8DE', 'stroke-width': 3 }, lm);
    api.text(lm, 0, 55, 'Lamen', 15, '#6C88A3', 700);
    st.lamen = lm;

    // lọ NaCl, nước cất, giấy thấm (hiện ra ở bước nhỏ dung dịch)
    st.bottles = {};
    [['nacl', 300, '#FFC9C9', 'NaCl'], ['cat', 400, '#E8F6FF', 'Nước cất']].forEach(([k, x, col, name]) => {
      const b = api.g(L, x, 0); b.style.display = 'none';
      el('rect', { x: -30, y: 380, width: 60, height: 72, rx: 12, fill: col, stroke: '#9CC7E3', 'stroke-width': 3 }, b);
      el('rect', { x: -12, y: 350, width: 24, height: 34, rx: 4, fill: '#E5534B' }, b);
      el('ellipse', { cx: 0, cy: 346, rx: 13, ry: 9, fill: '#333' }, b);
      b.lab = api.text(b, 0, 480, name, 14, '#1F4E79', 800);
      st.bottles[k] = b;
    });
    const paper = api.g(L, 560, 470); paper.style.display = 'none';
    el('rect', { x: -40, y: -16, width: 80, height: 32, rx: 4, fill: '#FFFFFF', stroke: '#E3D6B4', 'stroke-width': 3 }, paper);
    api.text(paper, 0, 52, 'Giấy thấm', 15, '#6C88A3', 700);
    st.paper = paper;
    const drop = api.g(L, 0, 0); drop.style.display = 'none';
    el('rect', { x: -6, y: -70, width: 12, height: 60, rx: 4, fill: 'rgba(255,255,255,.8)', stroke: '#9AA9B7', 'stroke-width': 2 }, drop);
    el('ellipse', { cx: 0, cy: -76, rx: 10, ry: 12, fill: '#E5534B' }, drop);
    st.dropper = drop;

    // khung nhìn qua kính hiển vi
    const view = api.g(L, 540, 190); view.style.display = 'none';
    const defs = el('defs', {}, L);
    const cp = el('clipPath', { id: 'microClip' }, defs); el('circle', { cx: 0, cy: 0, r: 150 }, cp);
    el('circle', { r: 160, fill: '#1F2A36' }, view);
    const inner = el('g', { 'clip-path': 'url(#microClip)' }, view);
    el('rect', { x: -160, y: -160, width: 320, height: 320, fill: '#F2F8E8' }, inner);
    st.zoomG = el('g', {}, inner);
    let n = 0;
    for (let r = -5; r <= 5; r++) for (let c = -4; c <= 4; c++) {
      const x = c * 62 + (r % 2 ? 31 : 0), y = r * 44;
      if (Math.hypot(x, y) > 290) continue;
      const cell = el('g', { transform: `translate(${x},${y})` }, st.zoomG);
      el('rect', { x: -29, y: -20, width: 58, height: 40, rx: 4, fill: '#E6F2D6', stroke: '#6E9E5A', 'stroke-width': 3.2 }, cell);
      const pr = el('path', { d: '', fill: '#9B4FC4' }, cell);
      const nu = el('circle', { cx: -10, cy: -3, r: 4, fill: '#5E2A80' }, cell);
      st.cells.push({ pr, nu, p: Object.assign({}, FORM.normal), tp: FORM.normal, sev: 0.85 + ((n++ * 37) % 10) / 33 });
    }
    el('circle', { r: 150, fill: 'none', stroke: '#1F2A36', 'stroke-width': 6 }, view);
    // thước đo vi trường
    const scale = api.g(view, -10, -16);
    el('rect', { x: -66, y: 110, width: 150, height: 28, rx: 8, fill: 'rgba(255,255,255,.85)' }, scale);
    el('line', { x1: -60, y1: 128, x2: 40, y2: 128, stroke: '#1F4E79', 'stroke-width': 3 }, scale);
    for (let k = 0; k <= 10; k++) el('line', { x1: -60 + k * 10, y1: 122, x2: -60 + k * 10, y2: k % 5 ? 128 : 118, stroke: '#1F4E79', 'stroke-width': 1.5 }, scale);
    st.scaleTxt = api.text(scale, 70, 133, '', 12, '#1F4E79', 800);
    st.viewLabel = api.text(view, 0, 186, '', 18, '#1F4E79', 800);
    st.view = view;
    setZoom(10);
    st.raf = requestAnimationFrame(animCells);
  }

  // hình chất nguyên sinh: nửa rộng w, nửa cao h, bo góc r, độ lõm cạnh k
  const FORM = {
    normal: { w: 25, h: 16, r: 6, k: 0 },
    nhuoc: { w: 26, h: 17, r: 5, k: 0 },
    dang: { w: 24.5, h: 15.5, r: 6, k: 0 },
    goc: { w: 22.5, h: 14, r: 11, k: 0 },
    lom: { w: 19, h: 11.5, r: 8, k: 7 },
    loi: { w: 12.5, h: 10.5, r: 10.5, k: 0 }
  };
  const FORM_NAME = { nhuoc: 'Không co (trương nước)', dang: 'Không co', goc: 'Co góc', lom: 'Co lõm', loi: 'Co lồi' };
  function formOf(C) { return C < 0.5 ? 'nhuoc' : C < 1.5 ? 'dang' : C < 5 ? 'goc' : C < 12.5 ? 'lom' : 'loi'; }
  function pathOf(p) {
    const { w, h, k } = p, r = Math.min(p.r, w, h);
    return `M${-w + r} ${-h} Q0 ${-h + k * 2} ${w - r} ${-h} Q${w} ${-h} ${w} ${-h + r} Q${w - k * 2} 0 ${w} ${h - r} Q${w} ${h} ${w - r} ${h} Q0 ${h - k * 2} ${-w + r} ${h} Q${-w} ${h} ${-w} ${h - r} Q${-w + k * 2} 0 ${-w} ${-h + r} Q${-w} ${-h} ${-w + r} ${-h} Z`;
  }
  function setZoom(z) {
    st.zoom = z;
    st.zoomG.setAttribute('transform', `scale(${z === 10 ? 0.62 : 1.25})`);
    st.scaleTxt.textContent = z === 10 ? '100 µm' : '25 µm';
  }

  // chất nguyên sinh co dần về hình đích; st.rate do đồng hồ đặt (tua nhanh thì co nhanh)
  function animCells() {
    const k = st.rate || 0.035;
    st.cells.forEach(c => {
      ['w', 'h', 'r', 'k'].forEach(q => { c.p[q] += (c.tp[q] - c.p[q]) * k; });
      c.pr.setAttribute('d', pathOf(c.p));
      c.nu.setAttribute('cx', -10 * c.p.w / 25); c.nu.setAttribute('cy', -3 * c.p.h / 16);
    });
    st.raf = requestAnimationFrame(animCells);
  }
  // mỗi tế bào co mạnh nhẹ khác nhau một chút
  // cùng một dạng co, nồng độ càng cao (trong khoảng của dạng đó) thì co mạnh hơn chút
  const BAND = { goc: [1.5, 5], lom: [5, 12.5], loi: [12.5, 20] };
  function setForm(f, C) {
    const b = BAND[f], g = b && C != null ? 0.85 + 0.3 * Math.min(1, Math.max(0, (C - b[0]) / (b[1] - b[0]))) : 1;
    st.cells.forEach(c => {
      const t = FORM[f], n = FORM.normal, s = Math.min(1.25, c.sev * g);
      c.tp = { w: n.w + (t.w - n.w) * s, h: n.h + (t.h - n.h) * s, r: n.r + (t.r - n.r) * s, k: t.k * s };
    });
  }
  const settled = () => st.cells.every(c => Math.abs(c.p.w - c.tp.w) < 0.25 && Math.abs(c.p.h - c.tp.h) < 0.25);
  const shrinkPct = () => Math.round(100 * (1 - st.cells.reduce((a, c) => a + c.tp.w * c.tp.h, 0) / st.cells.length / (25 * 16)));

  function dropperTo(api, from, cb) {
    const d = st.dropper; d.style.display = '';
    api.place(d, from._x, 350); api.svg.appendChild(d);
    api.tween(d, STAGE.x - 20, STAGE.y - 6, 600, () => {
      NL.audio.play('drop');
      setTimeout(() => { d.style.display = 'none'; cb(); }, 350);
    });
  }

  const steps = [
    {
      label: 'Làm tiêu bản 1/4', text: 'Dùng kim mũi mác bóc lớp biểu bì của lá thài lài tía', hint: 'Kéo kim mũi mác đang sáng chạm vào chiếc lá tím',
      enter(api) {
        api.setOn(st.needle, true);
        api.draggable(st.needle, {
          target: { x: 160, y: 430, r: 100 }, snap: false,
          onDrop: () => { st.needle.style.display = 'none'; st.peel.style.display = ''; api.place(st.peel, 150, 425); api.done(); }
        });
      }
    },
    {
      label: 'Làm tiêu bản 2/4', text: 'Đặt lớp biểu bì lên giọt nước trên lam kính', hint: 'Kéo mảnh biểu bì màu tím vào giữa lam kính',
      enter(api) {
        api.setOn(st.peel, true);
        api.draggable(st.peel, { target: { x: 470, y: 465, r: 90 }, onDrop: () => { st.peel.style.display = 'none'; st.slPeel.style.display = ''; api.done(); } });
      }
    },
    {
      label: 'Làm tiêu bản 3/4', text: 'Đậy lamen lên', hint: 'Kéo lamen phủ lên mảnh biểu bì',
      enter(api) {
        api.setOn(st.lamen, true);
        api.draggable(st.lamen, { target: { x: 470, y: 465, r: 90 }, onDrop: () => { st.lamen.style.display = 'none'; st.slLamen.style.display = ''; api.done(); } });
      }
    },
    {
      label: 'Làm tiêu bản 4/4', text: 'Đặt lam kính lên bàn kính hiển vi', hint: 'Kéo lam kính lên bệ của kính hiển vi bên phải',
      enter(api) {
        api.setOn(st.slide, true);
        api.draggable(st.slide, {
          target: { x: STAGE.x, y: STAGE.y, r: 110, sx: STAGE.x - 20, sy: STAGE.y - 6 },
          onDrop: () => {
            st.leaf.style.display = 'none';
            st.view.style.display = ''; st.viewLabel.textContent = 'Tế bào bình thường';
            api.done();
          }
        });
      }
    },
    {
      label: () => `Lần thử ${st.runs.length + 1}/3 · Nồng độ`,
      text: 'Chọn nồng độ dung dịch NaCl để nhỏ vào mép lamen', hint: 'Kéo thanh nồng độ. Thử cả nồng độ thấp và cao, ví dụ 1%, 5%, 20%',
      enter(api) {
        sideTable(api);
        if (!st.runs.length && !api.prediction) api.ask({
          predict: true, q: 'Nhỏ dung dịch NaCl 20% (ưu trương) vào, tế bào sẽ…?',
          options: [{ t: 'Co lại vì nước đi ra' }, { t: 'Trương to vì nước đi vào' }, { t: 'Không thay đổi' }]
        });
        st.bottles.nacl.style.display = ''; st.bottles.cat.style.display = '';
        st.ctl = [
          api.slider({
            label: 'Nồng độ NaCl', min: 0, max: 20, step: 0.1, value: st.C, unit: '%',
            onInput(v, c) {
              st.C = v; st.bottles.nacl.lab.textContent = `NaCl ${v}%`;
              const dup = st.runs.some(r => Math.abs(r.C - v) < 1);
              c.warn(dup ? 'Chọn nồng độ cách lần trước ít nhất 1% nhé' : v < 0.5 ? 'Nhược trương' : v < 1.5 ? 'Gần đẳng trương (với tế bào này)' : 'Ưu trương');
              if (dup) api.hideNext(); else api.done('Nhỏ dung dịch ➜');
            }
          }),
          api.choices({ label: 'Vật kính', items: [{ t: '10×', v: 10 }, { t: '40×', v: 40 }], value: st.zoom, onPick(v) { NL.audio.play('click'); setZoom(v); } })
        ];
      },
      onNext(api) {
        st.ctl.forEach(c => c.remove());
        dropperTo(api, st.bottles.nacl, () => api.goto(5));
      }
    },
    {
      label: () => `Lần thử ${st.runs.length + 1}/3 · ${st.C}%`, text: 'Đặt giấy thấm ở mép bên kia lamen để kéo dung dịch qua mẫu', hint: 'Kéo giấy thấm lên bệ kính hiển vi',
      enter(api) {
        sideTable(api);
        const p = st.paper; p.style.display = ''; api.place(p, 560, 470);
        api.setOn(p, true);
        api.draggable(p, { target: { x: STAGE.x, y: STAGE.y, r: 120, sx: STAGE.x + 40, sy: STAGE.y - 4 }, onDrop: () => soak(api) });
      }
    },
    {
      label: () => `Lần thử ${st.runs.length}/3 · xong`, text: '', hint: 'Bấm nút ở góc dưới để đi tiếp',
      enter(api) {
        sideTable(api);
        const left = 3 - st.runs.length;
        api.say(left ? `Đã ghi kết quả. Thử thêm ${left} nồng độ nữa` : 'Đã thử đủ 3 nồng độ! Giờ nhỏ nước cất xem tế bào có phản co không');
        api.done(left ? 'Thử nồng độ khác ➜' : 'Nhỏ nước cất ➜');
      },
      onNext(api) {
        if (st.runs.length < 3) { setForm('normal'); st.rate = 0.2; st.viewLabel.textContent = 'Mẫu mới: tế bào bình thường'; NL.game.toast('Đã thay mẫu mới 🍃'); api.goto(4); }
        else api.goto(7);
      }
    },
    {
      label: 'Phản co nguyên sinh', text: 'Nhỏ nước cất vào mẫu vừa thử, rồi đặt giấy thấm', hint: 'Chạm lọ nước cất, sau đó kéo giấy thấm lên bệ kính',
      enter(api) {
        sideTable(api);
        const b = st.bottles.cat; api.setOn(b, true);
        api.tapable(b, () => dropperTo(api, b, () => {
          const p = st.paper; p.style.display = ''; api.place(p, 560, 470); api.setOn(p, true);
          api.draggable(p, {
            target: { x: STAGE.x, y: STAGE.y, r: 120, sx: STAGE.x + 40, sy: STAGE.y - 4 }, onDrop: () => {
              const last = st.runs[st.runs.length - 1];
              st.rate = 0.03;
              if (last.form === 'loi') {
                st.recovered = false; st.viewLabel.textContent = 'Tế bào hầu như không phản co';
                api.card({ kicker: '🔬 Giải thích khoa học', text: 'Ở dạng co lồi, chất nguyên sinh tách khỏi thành ở mọi phía. Tế bào thường khó hoặc không phản co, tùy mức tổn thương và thời gian ngâm trong dung dịch ưu trương.', sub: 'Mẫu co góc hoặc co lõm, ngâm chưa lâu, thường phản co tốt hơn.' });
              } else { setForm('normal'); st.recovered = true; st.viewLabel.textContent = 'Tế bào phản co nguyên sinh'; }
              api.wait(1.8, () => { st.paper.style.display = 'none'; api.done('Xem biểu đồ ➜'); });
            }
          });
        }));
      },
      onNext(api) { api.goto(8); }
    },
    {
      label: 'Kết quả', text: 'Mức co của chất nguyên sinh theo nồng độ NaCl', hint: 'Nồng độ càng cao, chất nguyên sinh co càng nhiều',
      enter(api) {
        st.view.style.display = 'none';
        Object.values(st.bottles).forEach(b => { b.style.display = 'none'; });
        st.paper.style.display = 'none';
        api.showChart(result());
        api.done('Trả lời câu hỏi ➜');
      },
      onNext(api) { afterChart(api); }
    }
  ];

  // dung dịch ngấm dần qua mẫu: đếm giờ tới khi tế bào ổn định, rồi em gọi tên dạng co
  function soak(api) {
    st.paper.style.display = 'none';
    const f = formOf(st.C);
    // dạng co tiến triển theo thời gian: góc → lõm → lồi; nồng độ quyết định dạng cuối đạt tới trong thời gian quan sát
    const ORDER = ['goc', 'lom', 'loi'], seq = ORDER.includes(f) ? ORDER.slice(0, ORDER.indexOf(f) + 1) : [f];
    let si = 0, tStage = 0;
    setForm(seq[0], st.C); st.viewLabel.textContent = 'Dung dịch đang ngấm…';
    const card = api.panel(`<div>⏱ Thời gian tác động</div><div class="big-num"><span id="plT">0</span> giây</div>`);
    st.speed = 5;
    const sp = api.choices({ label: 'Tốc độ', items: [{ t: '1×', v: 1 }, { t: '5×', v: 5 }, { t: '10×', v: 10 }], value: 5, onPick(v) { st.speed = v; } });
    let t = 0;
    api.loop(dt => {
      t += dt * st.speed; st.rate = Math.min(0.5, 0.004 * st.speed);
      card.querySelector('#plT').textContent = Math.floor(t);
      if (si < seq.length - 1 && settled() && t - tStage > 8) {
        si++; tStage = t; setForm(seq[si], st.C); st.viewLabel.textContent = `Ngâm lâu hơn: chuyển sang ${FORM_NAME[seq[si]].toLowerCase()}…`;
      }
      if (si === seq.length - 1 && t > 20 && settled()) {
        card.remove(); sp.remove(); st.rate = 0.035;
        st.viewLabel.textContent = 'Tế bào đã ổn định';
        const right = f === 'nhuoc' || f === 'dang' ? 'Không co' : FORM_NAME[f];
        api.ask({
          kicker: '🔬 Em quan sát', q: 'Chất nguyên sinh của tế bào đang ở dạng nào?',
          options: ['Không co', 'Co góc', 'Co lõm', 'Co lồi'].map(x => ({ t: x, ok: x === right, why: WHY[f] })),
          explain: EXPLAIN[f]
        }, r => {
          st.runs.push({ C: st.C, sec: Math.round(t), form: f, pct: Math.max(0, shrinkPct()), em: r.answer });
          st.viewLabel.textContent = `NaCl ${st.C}%: ${FORM_NAME[f]}`;
          api.goto(6);
        });
        return false;
      }
    });
  }
  const WHY = {
    nhuoc: 'Chất nguyên sinh vẫn áp sát thành tế bào, thậm chí hơi phình ra: tế bào không co.',
    dang: 'Chất nguyên sinh vẫn áp sát thành tế bào: tế bào không co.',
    goc: 'Nhìn kỹ các góc tế bào: màng sinh chất chỉ tách khỏi thành ở các góc.',
    lom: 'Các cạnh của chất nguyên sinh bị lõm vào phía trong, nhưng vẫn còn vài điểm bám vào thành.',
    loi: 'Chất nguyên sinh co tròn thành một khối ở giữa, tách hẳn khỏi thành ở mọi phía.'
  };
  const EXPLAIN = {
    nhuoc: 'Nhược trương: nước đi vào, tế bào trương nước, không co.',
    dang: 'Gần đẳng trương với tế bào này: nước ra vào cân bằng, tế bào giữ nguyên. Đẳng trương hay không còn tùy loại tế bào (0,9% NaCl chỉ đẳng trương với tế bào người).',
    goc: 'Co góc: nước mới đi ra ít, màng sinh chất mới tách khỏi thành ở các góc. Ở nồng độ này, trong thời gian quan sát tế bào dừng ở co góc.',
    lom: 'Co lõm: tế bào co góc trước, nước tiếp tục đi ra nên các mặt bên lõm vào. Dạng co tiến triển theo thời gian; nồng độ cao hơn thì tới dạng này nhanh hơn.',
    loi: 'Co lồi: tế bào đi qua co góc, co lõm rồi chất nguyên sinh co tròn, tách khỏi thành ở mọi phía. Nồng độ càng cao thì càng nhanh tới dạng này.'
  };

  // Sau biểu đồ: so với điều em đã đoán, hỏi vì sao, rồi câu trong ngân hàng.
  function afterChart(api) {
    api.wrapUp({
      right: 'Co lại vì nước đi ra', truth: 'trong dung dịch ưu trương, tế bào co nguyên sinh; theo thời gian dạng co tiến dần góc → lõm → lồi, nồng độ càng cao thì càng nhanh tới dạng co mạnh.',
      sub: st.recovered === false ? 'Mẫu co lồi hầu như không phản co khi nhỏ nước cất: tế bào có thể đã tổn thương, tùy mức co và thời gian ngâm.' : 'Khi nhỏ nước cất vào, tế bào phản co trở lại như cũ.',
      quiz: QUIZ, bank: 3, result: result()
    });
  }
  const QUIZ = [
    {
      kicker: '❓ Vì sao?', q: 'Vì sao trong dung dịch ưu trương, tế bào co nguyên sinh?',
      options: [
        { t: 'Bên ngoài đậm chất tan hơn nên nước đi ra khỏi tế bào, chất nguyên sinh co lại', ok: true },
        { t: 'Chất tan đi vào làm tế bào nặng và co lại', why: 'Thứ di chuyển qua màng nhiều nhất ở đây là nước. Nước đi từ nơi loãng sang nơi đậm hay ngược lại?' },
        { t: 'Thành tế bào bị vỡ', why: 'Thành tế bào vẫn giữ nguyên hình. Chỉ có phần bên trong co lại.' }
      ],
      explain: 'Nước đi từ nơi có nồng độ chất tan thấp sang nơi có nồng độ chất tan cao. Dung dịch ưu trương đậm hơn dịch tế bào nên kéo nước ra.'
    },
    {
      q: 'Vì sao khi co nguyên sinh, thành tế bào vẫn giữ nguyên hình dạng?',
      options: [
        { t: 'Thành cellulose cứng, chỉ chất nguyên sinh co lại', ok: true },
        { t: 'Thành tế bào cũng co theo nhưng chậm hơn', why: 'Nhìn lại vi trường: khung thành tế bào có nhỏ đi không?' },
        { t: 'Thành tế bào hút nước vào', why: 'Trong dung dịch ưu trương nước đi ra chứ không đi vào.' }
      ],
      explain: 'Thành tế bào bằng cellulose khá cứng nên giữ hình; màng sinh chất và chất nguyên sinh mất nước, tách khỏi thành.'
    }
  ];

  function sideTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['NaCl', 'Thời gian', 'Dạng co', 'Co rút']);
    st.tbl.set(st.runs.map(r => [r.C + '%', r.sec + ' s', FORM_NAME[r.form].replace(' (trương nước)', ''), r.pct + '%']));
  }

  function result() {
    const rows = st.runs.slice().sort((a, b) => a.C - b.C);
    return {
      title: 'Co và phản co nguyên sinh', param: 'Nồng độ NaCl: ' + rows.map(r => r.C + '%').join(', '),
      table: {
        head: ['Lần', 'Nồng độ NaCl (%)', 'Thời gian tác động (giây)', 'Dạng co nguyên sinh', 'Em nhận ra', 'Thể tích chất nguyên sinh co rút (%)'],
        rows: st.runs.map((r, i) => [i + 1, r.C, r.sec, FORM_NAME[r.form], r.em, r.pct]).concat([['Nước cất', 0, '', st.recovered ? 'Phản co ✓' : st.recovered === false ? 'Hầu như không phản co (co lồi)' : '…', '', '']])
      },
      chart: { labels: rows.map(r => `${r.C}% · ${FORM_NAME[r.form].split(' (')[0]}`), yLabel: '% thể tích chất nguyên sinh co rút', max: 100, series: [{ name: 'Mức co rút', color: '#9B4FC4', values: rows.map(r => r.pct) }] },
      conclusion: 'Trong dung dịch ưu trương nước đi ra khỏi tế bào nên tế bào co nguyên sinh. Dạng co tiến triển theo thời gian (co góc → co lõm → co lồi); nồng độ càng cao thì càng nhanh và càng dễ tới dạng co mạnh. Nhỏ nước cất (nhược trương) thì nước đi vào, tế bào phản co. Mẫu co lồi thường khó hoặc không phản co, tùy mức tổn thương và thời gian ngâm',
      note: 'Chỉ tế bào sống mới co và phản co nguyên sinh được.'
    };
  }

  NL.lab.register('2B', { goal: 'Tế bào thay đổi thế nào khi dung dịch bên ngoài đậm dần lên?', clearSide: true, build, steps, cleanup() { if (st && st.raf) cancelAnimationFrame(st.raf); } });
})();
