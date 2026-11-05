// Vuốt để cuộn các bảng trên điện thoại. Trang chặn thao tác chạm mặc định để không bị kéo, phóng cả trang,
// nên một số trình duyệt (nhất là Safari trên iPhone) không cho cuộn các bảng điều khiển. Tệp này tự cuộn
// bảng gần nhất theo ngón tay; nếu trình duyệt đã tự cuộn được thì nó nhường lại (sự kiện pointercancel).
(function () {
  const SKIP = 'canvas, svg, input[type=range], .joy, textarea, .drag';
  const scroller = el => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 2) return n;
    }
    return null;
  };
  let cur = null, moved = false;
  addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch' || !e.isPrimary || e.target.closest(SKIP)) { cur = null; return; }
    const sc = scroller(e.target); if (!sc) { cur = null; return; }
    cur = { sc, y: e.clientY, y0: e.clientY, top: sc.scrollTop, id: e.pointerId, t: performance.now(), v: 0 }; moved = false;
  }, true);
  addEventListener('pointermove', e => {
    if (!cur || e.pointerId !== cur.id) return;
    const dy = e.clientY - cur.y;
    if (!moved && Math.abs(e.clientY - cur.y0) < 8) return;
    moved = true;
    const now = performance.now(); cur.v = dy / Math.max(1, now - cur.t); cur.t = now;
    cur.sc.scrollTop -= dy; cur.y = e.clientY;
  }, true);
  const end = e => {
    if (!cur || e.pointerId !== cur.id) return;
    if (e.type === 'pointerup' && moved) { // trượt quán tính một chút cho mượt
      let v = -cur.v * 16; const sc = cur.sc;
      const step = () => { if (Math.abs(v) < 0.5) return; sc.scrollTop += v; v *= 0.92; requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }
    cur = null;
  };
  addEventListener('pointerup', end, true);
  addEventListener('pointercancel', e => { cur = null; moved = false; void e; }, true);
  // vừa vuốt xong thì không tính là bấm nút
  addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
})();
