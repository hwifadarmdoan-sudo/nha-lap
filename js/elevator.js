// Thang máy nhìn từ bên trong (góc POV): cửa trước mặt, bảng nút bên phải, bàn tay bấm nút.
window.NL = window.NL || {};
NL.elevator = (function () {
  const SVGNS = 'http://www.w3.org/2000/svg';
  const $ = id => document.getElementById(id);
  const NAMES = { 1: 'Sảnh', 2: 'Vật lí', 3: 'Hóa học', 4: 'Sinh học' };
  const COLS = { 1: '#5BB4EA', 2: '#3FB37F', 3: '#9B6BD6', 4: '#3D8BD9' };
  let svg, busy = false, cur = 1, opts = null, hand, screen, outsideSign, outsideWall;

  function el(tag, a, p) { const e = document.createElementNS(SVGNS, tag); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function txt(p, x, y, s, size, fill, anchor) { const t = el('text', { x, y, 'font-size': size, fill, 'font-weight': 800, 'text-anchor': anchor || 'middle', 'font-family': "'Baloo 2', sans-serif" }, p); t.textContent = s; return t; }

  function build() {
    svg = $('elevSvg'); svg.innerHTML = '';
    const cab = el('g', { class: 'cabin' }, svg);
    // trần, sàn, hai vách
    el('polygon', { points: '0,0 1000,0 700,90 300,90', fill: '#E9EEF2' }, cab);
    el('rect', { x: 420, y: 22, width: 160, height: 30, rx: 8, fill: '#FFFBE8' }, cab);
    el('polygon', { points: '0,560 300,470 700,470 1000,560', fill: '#B7A58A' }, cab);
    for (let k = 1; k < 6; k++) el('line', { x1: 300 + k * 66.7, y1: 470, x2: k * 166.7, y2: 560, stroke: '#A8967B', 'stroke-width': 2 }, cab);
    el('polygon', { points: '0,0 300,90 300,470 0,560', fill: '#C9D3DC' }, cab);
    el('polygon', { points: '1000,0 700,90 700,470 1000,560', fill: '#BFCAD4' }, cab);
    el('line', { x1: 40, y1: 400, x2: 290, y2: 352, stroke: '#E6ECF1', 'stroke-width': 10, 'stroke-linecap': 'round' }, cab);
    el('line', { x1: 960, y1: 400, x2: 710, y2: 352, stroke: '#E6ECF1', 'stroke-width': 10, 'stroke-linecap': 'round' }, cab);
    // vách trước + khung cửa
    el('rect', { x: 300, y: 90, width: 400, height: 380, fill: '#D5DEE6' }, cab);
    el('rect', { x: 370, y: 128, width: 260, height: 342, fill: '#9AA9B7' }, cab);
    // khung cảnh bên ngoài cửa (hành lang của tầng)
    const out = el('g', {}, cab);
    const clip = el('clipPath', { id: 'doorClip' }, el('defs', {}, svg)); el('rect', { x: 378, y: 134, width: 244, height: 336 }, clip);
    out.setAttribute('clip-path', 'url(#doorClip)');
    outsideWall = el('rect', { x: 378, y: 134, width: 244, height: 230, fill: '#FBF3DC' }, out);
    el('rect', { x: 378, y: 364, width: 244, height: 106, fill: '#EFE8D6' }, out);
    el('rect', { x: 378, y: 356, width: 244, height: 10, fill: '#E6D6A8' }, out);
    el('circle', { cx: 590, cy: 320, r: 22, fill: '#4FA36B' }, out); el('rect', { x: 575, y: 330, width: 30, height: 34, rx: 4, fill: '#E08A5A' }, out);
    outsideSign = el('g', {}, out);
    // hai cánh cửa
    const dl = el('rect', { x: 378, y: 134, width: 122, height: 336, fill: '#E3E9EF', stroke: '#9AA9B7', 'stroke-width': 2, class: 'door-l' }, cab);
    const dr = el('rect', { x: 500, y: 134, width: 122, height: 336, fill: '#E3E9EF', stroke: '#9AA9B7', 'stroke-width': 2, class: 'door-r' }, cab);
    dl.style.transform = 'translateX(-118px)'; dr.style.transform = 'translateX(118px)';
    // màn hình tầng
    el('rect', { x: 452, y: 96, width: 96, height: 28, rx: 6, fill: '#14273A' }, cab);
    screen = txt(cab, 500, 117, '1', 20, '#7CF29A');
    // bảng nút bên phải
    el('polygon', { points: '740,150 880,120 880,410 740,390', fill: '#E7ECF0', stroke: '#A9B6C2', 'stroke-width': 3 }, cab);
    [4, 3, 2, 1].forEach((f, k) => {
      const y = 180 + k * 58, ready = f === 1 || NL.SUBJECTS[f].ready || (opts && opts.allowAll);
      const b = el('g', { class: 'fbtn', 'data-f': f }, cab);
      el('circle', { cx: 778, cy: y, r: 22, fill: 'transparent' }, b);
      el('circle', { cx: 778, cy: y, r: 19, fill: '#F7F9FB', stroke: ready ? COLS[f] : '#B5C0CA', 'stroke-width': 4, class: 'face' }, b);
      txt(b, 778, y + 7, String(f), 20, ready ? '#1F4E79' : '#9AA9B7');
      if (ready) txt(b, 806, y + 6, NAMES[f], 14, '#1F4E79', 'start');
      else { txt(b, 806, y - 1, NAMES[f], 13, '#9AA9B7', 'start'); txt(b, 806, y + 15, 'Sắp có', 12, '#E0A100', 'start'); }
      b._ready = ready; b._y = y;
      b.addEventListener('pointerdown', e => { e.stopPropagation(); press(f, b); });
    });
    // bàn tay (5 ngón, ngón trỏ chỉ ra)
    hand = el('g', {}, svg); hand.style.pointerEvents = 'none';
    el('rect', { x: -22, y: 30, width: 44, height: 90, rx: 18, fill: '#F4F8FB', stroke: 'rgba(30,60,90,.25)', 'stroke-width': 2 }, hand);
    el('rect', { x: -24, y: 22, width: 48, height: 16, rx: 8, fill: '#fff', stroke: 'rgba(30,60,90,.2)', 'stroke-width': 2 }, hand);
    // nắm tay, ngón trỏ duỗi ở mép trái (không để ngón chỉ nằm giữa), ba ngón gập, ngón cái vắt ngang
    const SK = { fill: '#FFE0C4', stroke: '#E8B998', 'stroke-width': 2 };
    el('rect', Object.assign({ x: -28, y: -6, width: 52, height: 42, rx: 16 }, SK), hand);
    el('rect', Object.assign({ x: -26, y: -48, width: 14, height: 50, rx: 7 }, SK), hand); // ngón trỏ
    [-10, 1, 12].forEach(fx => el('rect', Object.assign({ x: fx, y: -12, width: 11, height: 18, rx: 5.5 }, SK), hand)); // 3 ngón gập
    el('rect', Object.assign({ x: -20, y: 10, width: 34, height: 12, rx: 6, transform: 'rotate(-12 -3 16)' }, SK), hand); // ngón cái
    hand._x = 880; hand._y = 620; placeHand();
  }
  function placeHand() { hand.setAttribute('transform', `translate(${hand._x},${hand._y})`); }
  function moveHand(x, y, ms, done) {
    const x0 = hand._x, y0 = hand._y, t0 = performance.now();
    const f = now => { const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3); hand._x = x0 + (x - x0) * e; hand._y = y0 + (y - y0) * e; placeHand(); if (k < 1) requestAnimationFrame(f); else if (done) done(); };
    requestAnimationFrame(f);
  }

  function setOutside(f) {
    outsideSign.innerHTML = '';
    const col = COLS[f];
    el('rect', { x: 410, y: 190, width: 140, height: 40, rx: 20, fill: col }, outsideSign);
    txt(outsideSign, 480, 217, 'Tầng ' + f + ' · ' + NAMES[f], 17, '#fff');
    screen.textContent = f;
  }

  function press(f, b) {
    if (busy) return;
    NL.audio.play('click');
    moveHand(778 + 19, b._y + 46, 280, () => {
      b.querySelector('.face').setAttribute('fill', b._ready ? '#FFE9A8' : '#FFD6D6');
      setTimeout(() => moveHand(880, 620, 400), 250);
      if (!b._ready) { NL.helpers.toast('Tầng ' + f + ' sắp có, em lên tầng 4 nhé'); setTimeout(() => b.querySelector('.face').setAttribute('fill', '#F7F9FB'), 600); return; }
      if (f === cur) { $('elevTip').textContent = 'Em đang ở tầng này rồi'; setTimeout(() => b.querySelector('.face').setAttribute('fill', '#F7F9FB'), 600); return; }
      ride(f, b);
    });
  }

  function ride(to, b) {
    busy = true; $('elevTip').textContent = 'Thang đang chạy…';
    NL.audio.play('door');
    const box = $('elevator'); box.classList.add('closed');
    let f = cur; const dir = to > cur ? 1 : -1;
    setTimeout(() => {
      box.classList.add('moving');
      (function stepF() {
        f += dir; screen.textContent = f + (f === to ? '' : dir > 0 ? ' ▲' : ' ▼');
        if (f !== to) { setTimeout(stepF, 700); return; }
        setTimeout(() => {
          box.classList.remove('moving');
          NL.audio.play('ting');
          cur = to; setOutside(to);
          b.querySelector('.face').setAttribute('fill', '#F7F9FB');
          box.classList.remove('closed');
          $('elevTip').textContent = 'Tới tầng ' + to + ' rồi!';
          setTimeout(() => { busy = false; close(); opts.onArrive(to); }, 1300);
        }, 500);
      })();
    }, 1000);
  }

  function open(o) {
    opts = o; cur = o.floor; busy = false;
    build(); setOutside(cur);
    $('elevTip').textContent = 'Bấm số tầng muốn lên';
    const box = $('elevator'); box.classList.remove('closed', 'moving', 'hidden');
  }
  function close() { $('elevator').classList.add('hidden'); }
  function isOpen() { return !$('elevator').classList.contains('hidden'); }

  document.addEventListener('DOMContentLoaded', () => {
    $('elevClose').addEventListener('click', () => { if (busy) return; NL.audio.play('click'); close(); opts && opts.onExit(); });
  });
  return { open, close, isOpen, get busy() { return busy; } };
})();
