// Khung chung cho bàn thí nghiệm góc nhìn POV: các bước, kéo thả, hai bàn tay, nút Bước tiếp theo.
window.NL = window.NL || {};
NL.lab = (function () {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const $ = id => document.getElementById(id);
  let svg, layer, handR, handL, cur = null, stepIdx = 0, active = [], nextCb = null, rafId = 0;
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
      h.style.pointerEvents = 'none';
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
    rafId = requestAnimationFrame(animHands);
  }

  // Kéo thả. Chỉ đồ vật đang sáng mới kéo được.
  function draggable(item, opt) {
    item.classList.add('drag');
    item._home = { x: item._x, y: item._y };
    // vùng chạm rộng hơn hình để dễ cầm trên điện thoại
    try { const bb = item.getBBox(); item.insertBefore(el('rect', { x: bb.x - 14, y: bb.y - 14, width: bb.width + 28, height: bb.height + 28, fill: 'transparent' }), item.firstChild); } catch (e) { /* chưa vẽ */ }
    item.addEventListener('pointerdown', e => {
      if (!item._on) return;
      e.preventDefault(); e.stopPropagation();
      layer.appendChild(item); layer.appendChild(handL); layer.appendChild(handR);
      item.setPointerCapture(e.pointerId);
      const p = toSvg(e), off = { x: item._x - p.x, y: item._y - p.y };
      NL.audio.play('click');
      const move = ev => { const q = toSvg(ev); place(item, q.x + off.x, q.y + off.y); moveHand(handR, q.x + 10, q.y + 46); if (opt.onMove) opt.onMove(item); };
      const up = ev => {
        item.removeEventListener('pointermove', move); item.removeEventListener('pointerup', up); item.removeEventListener('pointercancel', up);
        const q = toSvg(ev);
        const tg = opt.target, hit = tg && Math.hypot(item._x - tg.x, item._y - tg.y) < (tg.r || 90);
        if (hit) {
          if (opt.snap !== false) tween(item, tg.sx !== undefined ? tg.sx : tg.x, tg.sy !== undefined ? tg.sy : tg.y, 180);
          setOn(item, false); NL.audio.play('drop');
          opt.onDrop && opt.onDrop(item);
        } else tween(item, item._home.x, item._home.y, 260);
        restHands(); void q;
      };
      item.addEventListener('pointermove', move); item.addEventListener('pointerup', up); item.addEventListener('pointercancel', up);
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
    item.style.cursor = 'pointer';
    try { const bb = item.getBBox(); item.insertBefore(el('rect', { x: bb.x - 10, y: bb.y - 10, width: bb.width + 20, height: bb.height + 20, fill: 'transparent' }), item.firstChild); } catch (e) { /* chưa vẽ */ }
    item.addEventListener('pointerdown', e => { if (!item._on) return; e.stopPropagation(); setOn(item, false); NL.audio.play('click'); cb(item); });
  }

  // ---------- điều khiển bước ----------
  function setStep() {
    const st = cur.steps[stepIdx];
    active.forEach(a => setOn(a, false)); active = [];
    $('stepNo').textContent = st.label ? (typeof st.label === 'function' ? st.label() : st.label) : `Bước ${stepIdx + 1}/${cur.steps.length}`;
    say(st.text);
    $('btnNext').classList.add('hidden'); $('labHint').classList.add('hidden');
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
  const api = {
    say, ask, askAll, card: NL.learn.card,
    bank(n) { return NL.learn.bank(cur.id, n); },
    get prediction() { return cur.predict; },
    el, g, place, tween, draggable, setOn, tapable, moveHand, restHands,
    get svg() { return layer; },
    get side() { return $('labSide'); },
    done(label) {
      const b = $('btnNext');
      b.textContent = label || 'Bước tiếp theo ➜';
      b.classList.remove('hidden');
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
    // mặt bàn
    el('rect', { x: -400, y: 330, width: 1800, height: 400, fill: '#E9DCC0' }, svg);
    el('rect', { x: -400, y: 322, width: 1800, height: 14, fill: '#F7EEDB' }, svg);
    layer = el('g', {}, svg);
    active = [];
    mod.build(api);
    buildHands(NL.game.look.coat === '#FFFFFF' ? '#F4F8FB' : NL.game.look.coat);
    cancelAnimationFrame(rafId); animHands();
    stepIdx = 0; setStep();
    if (mod.goal) NL.learn.card({ kicker: '🔎 Mình đang tìm hiểu', text: mod.goal, btn: 'Bắt đầu ➜' });
    return true;
  }
  function close() {
    $('lab').classList.add('hidden'); cancelAnimationFrame(rafId); NL.learn.closeAll();
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
      $('btnNext').classList.add('hidden');
      const st = cur.steps[stepIdx];
      if (st.onNext) { st.onNext(api); return; }
      if (stepIdx < cur.steps.length - 1) { stepIdx++; setStep(); }
    });
  });

  return {
    register(id, mod) { modules[id] = mod; }, open, close, hint, showHint,
    get isOpen() { return !!cur; }, get current() { return cur && cur.id; }
  };
})();
