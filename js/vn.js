// Số thập phân hiển thị cho học sinh dùng dấu phẩy (1,5 thay vì 1.5), thống nhất toàn web.
// Cách làm: số trong code vẫn tính bằng dấu chấm; chỉ khi chữ hiện ra (text node, chữ vẽ trên canvas) mới đổi dấu.
window.NL = window.NL || {};
(function () {
  const RX = /(\d)\.(\d)/g;
  const conv = s => s.replace(RX, '$1,$2');
  NL.fmt = (v, d) => (d === undefined ? String(v) : (+v).toFixed(d)).replace('.', ',');
  NL.vn = conv;

  // Chữ vẽ trên canvas (đồ thị trong mô hình 3D, biển hiệu)
  const P = CanvasRenderingContext2D.prototype;
  ['fillText', 'strokeText', 'measureText'].forEach(k => {
    const o = P[k]; P[k] = function (t, ...a) { return o.call(this, typeof t === 'string' ? conv(t) : t, ...a); };
  });

  // Mọi text node trong trang: đổi ngay khi được thêm hoặc sửa
  const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1 };
  const fix = n => {
    if (n.nodeType === 3) { const p = n.parentNode; if (p && !SKIP[p.nodeName] && !(p.closest && p.closest('[data-nofmt]'))) { const d = n.data; if (RX.test(d)) { RX.lastIndex = 0; n.data = conv(d); } RX.lastIndex = 0; } }
    else if (n.nodeType === 1 && !SKIP[n.nodeName]) { const w = document.createTreeWalker(n, 4); let t; while ((t = w.nextNode())) fix(t); }
  };
  const start = () => {
    fix(document.body);
    new MutationObserver(ms => { for (const m of ms) { if (m.type === 'characterData') fix(m.target); else m.addedNodes.forEach(fix); } })
      .observe(document.body, { childList: true, subtree: true, characterData: true });
  };
  if (document.body) start(); else addEventListener('DOMContentLoaded', start);
})();
