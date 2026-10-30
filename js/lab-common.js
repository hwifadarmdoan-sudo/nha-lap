// Khung chung cho bàn thí nghiệm góc nhìn POV: các bước, kéo thả, hai bàn tay, nút Bước tiếp theo.
window.NL = window.NL || {};
NL.lab = (function () {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const $ = id => document.getElementById(id);
  let autoT = 0, svg, layer, handR, handL, cur = null, stepIdx = 0, active = [], nextCb = null, rafId = 0;
  const modules = {};

  function el(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function g(parent, x, y) { const e = el('g', {}, parent); e._x = x || 0; e._y = y || 0; place(e); return e; }
  function place(e, x, y) { if (x !== undefined) { e._x = x; e._y = y; } e.setAttribute('transform', `translate(${e._x},${e._y})${e._extra || ''}`); }

  function toSvg(evt) {
    const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function buildHands(coat) {
    const mk = (flip) => {
      const h = g(layer, 0, 0);
      const inner = el('g', { transform: flip ? 'scale(-1,1)' : '' }, h);
      el('rect', { x: -22, y: 20, width: 44, height: 70, rx: 18, fill: coat, stroke: 'rgba(30,60,90,.25)', 'stroke-width': 2 }, inner);
      el('rect', { x: -24, y: 14, width: 48, height: 16, rx: 8, fill: '#fff', stroke: 'rgba(30,60,90,.2)', 'stroke-width': 2 }, inner);
      el('ellipse', { cx: 0, cy: 0, rx: 24, ry: 22, fill: '#FFE0C4', stroke: '#E8B998', 'stroke-width': 2 }, inner);
      // 4 ngón + ngón cái = 5 ngón
      [[-20, -30, 20], [-10, -38, 26], [0, -38, 26], [10, -33, 22]].forEach(([fx, fy, fh]) => el('rect', { x: fx, y: fy, width: 9, height: fh, rx: 4.5, fill: '#FFE0C4', stroke: '#E8B998', 'stroke-width': 1.5 }, inner));
      el('rect', { x: 16, y: -14, width: 9, height: 20, rx: 4.5, fill: '#FFE0C4', stroke: '#E8B998', 'stroke-width': 1.5, transform: 'rotate(40 20 -4)' }, inner);
      h.style.pointerEvents = 'none'; h.style.display = 'none'; // góp ý 30/10: bỏ bàn tay vì vướng, em dùng chuột trực tiếp
      return h;
    };
    handL = mk(true); handR = mk(false);
    handL._rest = { x: 140, y: 535 }; handR._rest = { x: 860, y: 535 };
    place(handL, 140, 535); place(handR, 860, 535);
  }
  function moveHand(h, x, y) { h._tx = x; h._ty = y; }
  function restHands() { moveHand(handL, handL._rest.x, handL._rest.y); moveHand(handR, handR._rest.x, handR._rest.y); }
  function animHands() {
    const t = performance.now() / 1000;
    [handL, handR].forEach((h, k) => {
      if (!h) return;
      const tx = h._tx !== undefined ? h._tx : h._rest.x, ty = (h._ty !== undefined ? h._ty : h._rest.y) + Math.sin(t * 2 + k) * 3;
      h._x += (tx - h._x) * 0.25; h._y += (ty - h._y) * 0.25; place(h);
    });
    ghostTick();
    rafId = requestAnimationFrame(animHands);
  }
  // Đứng yên vài giây mà chưa làm gì: hiện bàn tay mờ làm mẫu (kéo từ đồ vật tới đích, hoặc chạm vào đồ vật)
  let lastAct = 0, ghost = null, ghostRing = null, ghostHinted = false;
  const IDLE_GHOST = 6;
  function poke() { lastAct = performance.now(); hideGhost(); }
  function hideGhost() { if (ghost) ghost.style.display = 'none'; if (ghostRing) ghostRing.remove(); ghostRing = null; }
  function ghostTick() {
    const it = active.find(a => a._on && a.isConnected);
    const idle = (performance.now() - lastAct) / 1000;
    if (!it || idle < IDLE_GHOST || picked || document.querySelector('#lab .quiz') || NL.learn.busy) { hideGhost(); return; }
    if (!ghost || !ghost.isConnected) {
      ghost = el('text', { 'font-size': 46, 'text-anchor': 'middle', opacity: .85, 'pointer-events': 'none' }, svg); ghost.textContent = '👆';
    }
    svg.appendChild(ghost); ghost.style.display = '';
    if (!ghostHinted) { ghostHinted = true; showHint(); }
    const k = ((idle - IDLE_GHOST) % 2.2) / 2.2, tg = it._mode === 'drag' && it._dragOpt && it._dragOpt.target;
    const p0 = abs(it);
    let x = p0.x, y = p0.y;
    if (tg) {
      if (!ghostRing) ghostRing = el('circle', { cx: tg.x, cy: tg.y, r: Math.min(tg.r || 90, 60), class: 'drop-ring' }, svg);
      const e = k < 0.15 ? 0 : k > 0.8 ? 1 : (k - 0.15) / 0.65, ee = e * e * (3 - 2 * e);
      x = p0.x + (tg.x - p0.x) * ee; y = p0.y + (tg.y - p0.y) * ee;
      ghost.setAttribute('opacity', k > 0.9 ? (1 - k) * 8 : .85);
    } else { y += Math.sin(k * Math.PI * 4) * 8; ghost.setAttribute('opacity', .85); }
    ghost.setAttribute('x', x + 6); ghost.setAttribute('y', y + 44);
  }
  // toạ độ đồ vật trên toàn khung svg (cộng dồn translate của các nhóm cha)
  function abs(e) {
    let x = 0, y = 0, n = e;
    while (n && n !== svg) { if (n._x !== undefined) { x += n._x; y += n._y; } n = n.parentNode; }
    return { x, y };
  }

  // Kéo thả. Chỉ đồ vật đang sáng mới kéo được.
  // Gọi lại draggable trên cùng đồ vật để đổi đích (ví dụ: hút dung dịch rồi nhỏ vào ống).
  function draggable(item, opt) {
    item.classList.add('drag'); item._dragOpt = opt; item._mode = 'drag';
    item._home = { x: item._x, y: item._y };
    if (item._dragBound) return; item._dragBound = true;
    // vùng chạm rộng hơn hình để dễ cầm trên điện thoại
    try { const bb = item.getBBox(); item.insertBefore(el('rect', { x: bb.x - 14, y: bb.y - 14, width: bb.width + 28, height: bb.height + 28, fill: 'transparent' }), item.firstChild); } catch (e) { /* chưa vẽ */ }
    item.addEventListener('pointerdown', e => {
      if (!item._on) return;
      const opt = item._dragOpt;
      e.preventDefault(); e.stopPropagation();
      layer.appendChild(item); layer.appendChild(handL); layer.appendChild(handR);
      item.setPointerCapture(e.pointerId);
      const p = toSvg(e), off = { x: item._x - p.x, y: item._y - p.y };
      NL.audio.play('click');
      let moved = 0;
      const move = ev => { const q = toSvg(ev); moved = Math.max(moved, Math.hypot(q.x - p.x, q.y - p.y)); if (moved < 6) return; place(item, q.x + off.x, q.y + off.y); moveHand(handR, q.x + 10, q.y + 46); if (opt.onMove) opt.onMove(item); };
      const up = () => {
        item.removeEventListener('pointermove', move); item.removeEventListener('pointerup', up); item.removeEventListener('pointercancel', up);
        const tg = opt.target, hit = tg && Math.hypot(item._x - tg.x, item._y - tg.y) < (tg.r || 90);
        if (moved < 6 && tg && !hit) { pick(item); restHands(); return; } // chạm rồi chạm: chọn đồ trước, chạm chỗ đặt sau
        if (hit) {
          if (opt.snap !== false) tween(item, tg.sx !== undefined ? tg.sx : tg.x, tg.sy !== undefined ? tg.sy : tg.y, 180);
          setOn(item, false); NL.audio.play('drop');
          opt.onDrop && opt.onDrop(item);
        } else tween(item, item._home.x, item._home.y, 260);
        restHands();
      };
      item.addEventListener('pointermove', move); item.addEventListener('pointerup', up); item.addEventListener('pointercancel', up);
    });
  }
  // chế độ chạm–chạm thay cho kéo–thả
  let picked = null, ring = null;
  function pick(item) {
    unpick(); picked = item; item.classList.add('picked');
    const tg = item._dragOpt.target;
    ring = el('circle', { cx: tg.x, cy: tg.y, r: Math.min(tg.r || 90, 70), class: 'drop-ring' }, layer);
    NL.game.toast('Chạm vào vòng tròn để đặt vào đó');
  }
  function unpick() { if (picked) picked.classList.remove('picked'); picked = null; if (ring) ring.remove(); ring = null; }
  function tapPlace(e) {
    if (!picked) return;
    const item = picked, opt = item._dragOpt, tg = opt.target, q = toSvg(e);
    unpick();
    if (!item._on || Math.hypot(q.x - tg.x, q.y - tg.y) > (tg.r || 90) * 1.3) return;
    layer.appendChild(item);
    tween(item, tg.sx !== undefined ? tg.sx : tg.x, tg.sy !== undefined ? tg.sy : tg.y, 260, () => {
      if (opt.onMove) opt.onMove(item);
      setOn(item, false); NL.audio.play('drop'); opt.onDrop && opt.onDrop(item);
    });
  }
  function setOn(item, on) {
    item._on = on;
    item.classList.toggle('glow', on);
    item.style.pointerEvents = on ? 'auto' : 'none';
    if (on) { item._home = { x: item._x, y: item._y }; active.push(item); }
  }
  function tween(item, x, y, ms, done) {
    const x0 = item._x, y0 = item._y, t0 = performance.now();
    const f = now => {
      const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      place(item, x0 + (x - x0) * e, y0 + (y - y0) * e);
      if (k < 1) requestAnimationFrame(f); else if (done) done();
    };
    requestAnimationFrame(f);
  }
  function tapable(item, cb) {
    item.style.cursor = 'pointer'; item._tapCb = cb; item._mode = 'tap';
    if (item._tapBound) return; item._tapBound = true;
    try { const bb = item.getBBox(); item.insertBefore(el('rect', { x: bb.x - 10, y: bb.y - 10, width: bb.width + 20, height: bb.height + 20, fill: 'transparent' }), item.firstChild); } catch (e) { /* chưa vẽ */ }
    item.addEventListener('pointerdown', e => { if (!item._on) return; e.stopPropagation(); setOn(item, false); NL.audio.play('click'); item._tapCb(item); });
  }

  // ---------- điều khiển bước ----------
  function setStep() {
    const st = cur.steps[stepIdx];
    unpick(); poke(); unpick(); active.forEach(a => setOn(a, false)); active = [];
    if (cur.mod.clearSide) $('labSide').innerHTML = '';
    $('stepNo').textContent = st.label ? (typeof st.label === 'function' ? st.label() : st.label) : `Bước ${stepIdx + 1}/${cur.steps.length}`;
    say(st.text);
    clearTimeout(autoT); $('btnNext').classList.add('hidden'); $('labHint').classList.add('hidden');
    NL.game.setStatus(`TN ${cur.id} · ${$('stepNo').textContent.toLowerCase()}`);
    st.enter(api);
  }
  function say(text) { $('stepText').innerHTML = NL.learn.decorate(text || ''); NL.learn.bindTerms($('stepText')); }
  // Câu hỏi: ghi lại để báo cáo cuối có câu em sai lần đầu.
  function ask(opt, cb) {
    NL.learn.ask(opt, r => {
      if (!opt.predict) cur.quiz.push({ q: opt.q, ok: r.firstTry, answer: r.answer, right: r.right });
      else cur.predict = r.answer;
      cb && cb(r);
    });
  }
  function askAll(list, done) { let k = 0; const nx = () => { if (k >= list.length) { done(); return; } ask(list[k++], nx); }; nx(); }

  // ---------- công cụ chung cho các thí nghiệm ----------
  let loops = [];
  // vòng lặp hoạt hình, tự dừng khi đóng thí nghiệm; fn(dt) trả về false để dừng
  function loop(fn) {
    const o = { dead: false, stop() { o.dead = true; } }; let last = performance.now();
    const f = now => { if (o.dead || !cur) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; if (fn(dt, now) === false) { o.dead = true; return; } requestAnimationFrame(f); };
    requestAnimationFrame(f); loops.push(o); return o;
  }
  function wait(sec, fn) { let t = 0; return loop(dt => { t += dt; if (t >= sec) { fn(); return false; } }); }
  // thẻ bên phải
  function panel(html, cls) {
    const d = document.createElement('div'); d.className = cls || 'slider-card'; d.innerHTML = html || '';
    $('labSide').appendChild(d); return d;
  }
  // thanh trượt kèm ô gõ số: { label, min, max, step, value, unit, onInput(v) }
  function slider(o) {
    const d = panel(`<div>${o.label}</div><div class="big-num"><input class="num-in" type="number" min="${o.min}" max="${o.max}" step="${o.step || 1}" value="${+(Math.round(o.value / (o.step || 1)) * (o.step || 1)).toFixed(3)}"> <small>${o.unit || ''}</small></div><input type="range" min="${o.min}" max="${o.max}" step="${o.step || 1}" value="${o.value}"><div class="warn-line"></div>`);
    const r = d.querySelector('input[type=range]'), n = d.querySelector('.num-in');
    const ctl = {
      card: d, get value() { return +r.value; },
      set(v) { const sp = o.step || 1; v = Math.max(o.min, Math.min(o.max, +(Math.round(+v / sp) * sp).toFixed(3))); r.value = v; n.value = v; o.onInput && o.onInput(v, ctl); },
      warn(t) { d.querySelector('.warn-line').textContent = t || ''; },
      remove() { d.remove(); }
    };
    r.addEventListener('input', () => ctl.set(r.value));
    n.addEventListener('change', () => ctl.set(n.value));
    if (o.onInput) o.onInput(+o.value, ctl);
    return ctl;
  }
  // nhóm nút chọn một: { label, items:[{t, v}], value, onPick(v) }
  function choices(o) {
    const d = panel(`${o.label ? `<div>${o.label}</div>` : ''}<div class="seg">${o.items.map((it, i) => `<button class="seg-b pop" data-i="${i}">${it.t}</button>`).join('')}</div>`);
    const bs = [...d.querySelectorAll('.seg-b')];
    const ctl = {
      card: d, value: o.value,
      set(v) { ctl.value = v; bs.forEach((b, i) => b.classList.toggle('on', o.items[i].v === v)); o.onPick && o.onPick(v, ctl); },
      remove() { d.remove(); }
    };
    bs.forEach((b, i) => b.addEventListener('click', () => { NL.audio.play('click'); ctl.set(o.items[i].v); }));
    bs.forEach((b, i) => b.classList.toggle('on', o.items[i].v === o.value));
    return ctl;
  }
  // bảng số liệu bên phải, gọi set(rows) mỗi khi có số mới
  function table(head) {
    const d = panel('', 'data-card');
    const ctl = {
      card: d,
      set(rows) { d.innerHTML = `<table><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.length ? rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${head.length}">Chưa có số liệu</td></tr>`}</table>`; },
      remove() { d.remove(); }
    };
    ctl.set([]); return ctl;
  }
  // biểu đồ kết quả giữa bàn, kèm nút tải bảng và lưu ảnh
  function showChart(res) {
    const fo = el('foreignObject', { x: 120, y: 14, width: 760, height: 440 }, layer);
    const div = document.createElement('div');
    div.className = 'lab-chart';
    div.innerHTML = NL.chartSVG(res.chart, 720, 340).replace(/<animate[^>]*\/>/g, '') + `<div class="rep-dl"><button class="btn small pop">📥 Tải file Excel</button><button class="btn small pop">🖼 Lưu ảnh biểu đồ</button></div>`;
    const [b1, b2] = div.querySelectorAll('button');
    b1.onclick = () => NL.exportData.csv(res); b2.onclick = () => NL.exportData.jpg(res);
    fo.appendChild(div); return fo;
  }
  // kết thúc: so với dự đoán, câu hỏi riêng, rồi n câu trong ngân hàng
  function wrapUp(o) {
    const pred = cur.predict;
    const go = () => askAll((o.quiz || []).concat(NL.learn.bank(cur.id, o.bank === undefined ? 4 : o.bank)), () => api.finish(o.result));
    if (!o.right) { go(); return; }
    const okPred = pred && (Array.isArray(o.right) ? o.right.includes(pred) : pred === o.right);
    if (pred && o.result) o.result.predOk = !!okPred;
    api.card({
      kicker: '🔁 So với điều em đoán',
      text: pred ? `Em đoán "${pred}". ${okPred ? 'Đúng như em đoán! 🎯' : 'Kết quả đo: ' + o.truth}` : 'Kết quả đo: ' + o.truth,
      sub: o.sub
    }, go);
  }
  const api = {
    say, ask, askAll, card: NL.learn.card,
    bank(n) { return NL.learn.bank(cur.id, n); },
    get prediction() { return cur.predict; },
    el, g, place, tween, draggable, setOn, tapable, moveHand, restHands,
    loop, wait, panel, slider, choices, table, showChart, wrapUp,
    hideNext() { clearTimeout(autoT); $('btnNext').classList.add('hidden'); },
    get svg() { return layer; },
    get side() { return $('labSide'); },
    // Xong thao tác: tự sang bước sau, không bắt bấm xác nhận.
    // Chỉ giữ nút khi bên phải đang có thanh trượt / lựa chọn để em còn chỉnh tiếp.
    done(label) {
      const b = $('btnNext');
      b.textContent = label || 'Bước tiếp theo ➜';
      clearTimeout(autoT);
      if ($('labSide').querySelector('input, select, .seg button, .choice')) { b.classList.remove('hidden'); return; }
      const at = stepIdx, who = cur;
      $('labHint').textContent = '✅ Xong! Sang bước tiếp…'; $('labHint').classList.remove('hidden');
      autoT = setTimeout(() => { if (cur === who && stepIdx === at && !NL.learn.busy) b.click(); else if (cur === who && stepIdx === at) b.classList.remove('hidden'); }, 1100);
    },
    goto(idx) { stepIdx = idx; setStep(); },
    get step() { return stepIdx; },
    finish(result) {
      result.quiz = cur.quiz.slice(); if (cur.predict) result.predict = cur.predict;
      NL.game.finishExperiment(cur.id, result);
    },
    text(parent, x, y, str, size, color, weight) {
      const t = el('text', { x, y, 'font-size': size || 22, fill: color || '#1F4E79', 'font-weight': weight || 800, 'text-anchor': 'middle', 'font-family': "'Baloo 2', sans-serif" }, parent);
      t.textContent = str; return t;
    }
  };

  function open(id) {
    const mod = modules[id]; if (!mod) return false;
    cur = { id, steps: mod.steps, mod, quiz: [], predict: null };
    $('lab').classList.remove('hidden');
    const stage = $('labStage'); stage.innerHTML = ''; $('labSide').innerHTML = '';
    svg = el('svg', { viewBox: '0 0 1000 560', preserveAspectRatio: 'xMidYMid meet' }, stage);
    svg.addEventListener('pointerdown', tapPlace); unpick();
    $('lab').addEventListener('pointerdown', poke, true); poke(); ghostHinted = false; ghost = null;
    // mặt bàn
    el('rect', { x: -400, y: 330, width: 1800, height: 400, fill: '#E9DCC0' }, svg);
    el('rect', { x: -400, y: 322, width: 1800, height: 14, fill: '#F7EEDB' }, svg);
    layer = el('g', {}, svg);
    active = [];
    mod.build(api);
    buildHands(NL.game.look.coat === '#FFFFFF' ? '#F4F8FB' : NL.game.look.coat);
    cancelAnimationFrame(rafId); animHands();
    stepIdx = 0; setStep();
    if (mod.goal) { const ex = NL.EXPERIMENTS.find(x => x.id === id); NL.learn.card({ kicker: '🔎 Mình đang tìm hiểu', lead: ex && ex.hook, text: mod.goal, sub: ex && ex.grade ? '📘 ' + ex.grade : '', btn: 'Bắt đầu ➜' }); }
    return true;
  }
  function close() {
    $('lab').classList.add('hidden'); cancelAnimationFrame(rafId); NL.learn.closeAll();
    loops.forEach(o => o.stop()); loops = [];
    if (cur && cur.mod.cleanup) cur.mod.cleanup();
    cur = null; NL.game.setStatus('');
  }
  function hint() { return cur ? cur.steps[stepIdx].hint : null; }
  function showHint(txt) {
    const h = $('labHint'); h.textContent = '💡 ' + (txt || hint() || 'Làm theo dòng hướng dẫn ở trên nhé');
    h.classList.remove('hidden');
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('btnNext').addEventListener('click', () => {
      NL.audio.play('click');
      $('btnNext').classList.add('hidden'); $('labHint').classList.add('hidden'); clearTimeout(autoT);
      if (!cur) return;
      const st = cur.steps[stepIdx];
      if (st.onNext) { st.onNext(api); return; }
      if (stepIdx < cur.steps.length - 1) { stepIdx++; setStep(); }
    });
  });

  // Dùng khi kiểm thử tự động: làm hộ một thao tác đang sáng.
  function autoAct() {
    const it = active.find(a => a._on);
    if (!it) return cur && cur.mod.auto ? cur.mod.auto(api) : false;
    if (it._mode === 'tap') { setOn(it, false); it._tapCb(it); return 'tap'; }
    const o = it._dragOpt; if (!o) return false;
    const tg = o.target; place(it, tg.sx !== undefined ? tg.sx : tg.x, tg.sy !== undefined ? tg.sy : tg.y);
    setOn(it, false); o.onDrop && o.onDrop(it); return 'drag';
  }

  return {
    autoAct,
    register(id, mod) { modules[id] = mod; }, open, close, hint, showHint,
    get isOpen() { return !!cur; }, get current() { return cur && cur.id; }
  };
})();
