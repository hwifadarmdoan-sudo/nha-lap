// Các khung cảnh: trước tòa A1, sảnh, 3 tầng môn học, phòng lab.
window.NL = window.NL || {};
(function () {
  const i = NL.iso;
  const WALL_C = '#FBF3DC', WALL_SIDE = '#F1E5C2';
  NL.SUBJECTS = {
    2: { name: 'Sinh học', color: '#3FB37F', icon: '🌿', A: 'Đếm bọt khí rong', B: 'Co nguyên sinh', ready: true },
    3: { name: 'Hóa học', color: '#9B6BD6', icon: '⚗️', A: 'Chuẩn độ axit–bazơ', B: 'Màu ngọn lửa', ready: false },
    4: { name: 'Vật lí', color: '#3D8BD9', icon: '🧲', A: 'Con lắc đơn', B: 'Khúc xạ ánh sáng', ready: false }
  };
  // Tầng 2 Sinh: 10 phòng theo thứ tự trong bản đặc tả "Môn Sinh" (29/10). Mã phòng 2A, 2B giữ như cũ để không mất kết quả đã lưu.
  NL.EXPERIMENTS = [
    { id: '2A', floor: 2, no: 1, short: 'Quang hợp', name: 'Đếm bọt khí rong', icon: '🌿', ready: true },
    { id: '2C', floor: 2, no: 2, short: 'Enzyme', name: 'Nhiệt độ và enzyme amylase', icon: '🧪', ready: true },
    { id: '2B', floor: 2, no: 3, short: 'Co nguyên sinh', name: 'Co và phản co nguyên sinh', icon: '🔬', ready: true },
    { id: '2D', floor: 2, no: 4, short: 'Mendel', name: 'Di truyền Mendel ở đậu Hà Lan', icon: '🫛', ready: true },
    { id: '2E', floor: 2, no: 5, short: 'Điện di DNA', name: 'Điện di DNA', icon: '🧬', ready: true },
    { id: '2F', floor: 2, no: 6, short: 'Hô hấp hạt', name: 'Hô hấp tế bào ở hạt nảy mầm', icon: '🌰', ready: true },
    { id: '2G', floor: 2, no: 7, short: 'Nhịp tim', name: 'Huyết áp và nhịp tim', icon: '❤️', ready: true },
    { id: '2H', floor: 2, no: 8, short: 'Nảy mầm', name: 'Điều kiện nảy mầm của hạt', icon: '🌱', ready: true },
    { id: '2I', floor: 2, no: 9, short: 'Nguyên phân', name: 'Quan sát nguyên phân', icon: '🔍', ready: true },
    { id: '2J', floor: 2, no: 10, short: 'Quần thể', name: 'Tần số allele qua các thế hệ', icon: '🦋', ready: true },
    { id: '3A', floor: 3, name: 'Chuẩn độ axit–bazơ', ready: false },
    { id: '3B', floor: 3, name: 'Thử màu ngọn lửa', ready: false },
    { id: '4A', floor: 4, name: 'Con lắc đơn', ready: false },
    { id: '4B', floor: 4, name: 'Khúc xạ qua lăng kính', ready: false }
  ];

  // ---------- vẽ đồ vật ----------
  const D = {
    box(c, o) { NL.box(c, o.x, o.y, o.w, o.d, o.h, o.color); },
    plant(c, o, t) {
      NL.box(c, o.x + 0.15, o.y + 0.15, 0.5, 0.5, 18, '#E08A5A');
      const p = i(o.x + 0.4, o.y + 0.4); const sw = Math.sin(t * 1.5 + o.x) * 1.5;
      c.fillStyle = '#4FA36B';
      [[0, -38, 13], [-10, -30, 10], [10, -30, 10], [0, -50, 9]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(p.x + dx + sw, p.y + dy, r, 0, 7); c.fill(); });
      c.fillStyle = '#6CC08A'; c.beginPath(); c.arc(p.x - 4 + sw, p.y - 42, 5, 0, 7); c.fill();
    },
    tree(c, o, t) {
      const p = i(o.x + 0.5, o.y + 0.5); const sw = Math.sin(t * 1.2 + o.x) * 2;
      c.fillStyle = 'rgba(30,60,90,.18)'; c.beginPath(); c.ellipse(p.x, p.y, 34, 15, 0, 0, 7); c.fill();
      c.fillStyle = '#8A5A3B'; NL.rr(c, p.x - 6, p.y - 50, 12, 50, 5); c.fill();
      c.fillStyle = '#5DB36F';
      [[0, -92, 36], [-24, -70, 26], [24, -70, 26], [0, -120, 24]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(p.x + dx + sw, p.y + dy, r, 0, 7); c.fill(); });
      c.fillStyle = '#7FCB8C'; c.beginPath(); c.arc(p.x - 10 + sw, p.y - 104, 12, 0, 7); c.fill();
    },
    bush(c, o) {
      const p = i(o.x + 0.5, o.y + 0.5);
      c.fillStyle = '#5DB36F'; [[-12, -10, 14], [12, -10, 14], [0, -18, 16]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(p.x + dx, p.y + dy, r, 0, 7); c.fill(); });
    },
    sofa(c, o) {
      NL.box(c, o.x, o.y, o.w, o.d, 18, '#7FB6E0');
      NL.box(c, o.x, o.y, o.w, 0.3, 40, '#6AA6D6');
    },
    desk(c, o) {
      NL.box(c, o.x, o.y, o.w, o.d, o.h, '#F6E7C1', { top: '#FFFFFF' });
      const p = i(o.x + o.w / 2, o.y + o.d / 2); NL.pill(c, p.x, p.y - o.h - 18, o.label, '#2F80C0', '#fff', 13);
    },
    // bục trưng bày mô hình 3D: hình nổi lơ lửng phía trên
    stand(c, o, t) {
      NL.box(c, o.x, o.y, o.w, o.d, o.h, '#D7E6F2', { top: '#FFFFFF' });
      const p = i(o.x + o.w / 2, o.y + o.d / 2), b = Math.sin(t * 2 + o.x * 1.7) * 4, top = p.y - o.h;
      const gr = c.createRadialGradient(p.x, top - 30 + b, 4, p.x, top - 30 + b, 34);
      gr.addColorStop(0, 'rgba(120,230,255,.55)'); gr.addColorStop(1, 'rgba(120,230,255,0)');
      c.fillStyle = gr; c.beginPath(); c.arc(p.x, top - 30 + b, 34, 0, 7); c.fill();
      c.fillStyle = 'rgba(120,220,255,.35)'; c.beginPath(); c.moveTo(p.x - 18, top - 4); c.lineTo(p.x + 18, top - 4); c.lineTo(p.x + 8, top - 26 + b); c.lineTo(p.x - 8, top - 26 + b); c.fill();
      c.font = "30px 'Segoe UI Emoji','Apple Color Emoji',sans-serif"; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(o.icon, p.x, top - 32 + b);
      NL.pill(c, p.x, top - 66, o.no + ' · ' + o.short, o.done ? '#3FB37F' : '#2F80C0', '#fff', 12);
    },
    bench(c, o, t) {
      NL.box(c, o.x, o.y, o.w, o.d, o.h, '#E8EEF3', { top: '#FFFFFF' });
      const p = i(o.x + o.w / 2, o.y + o.d / 2), top = p.y - o.h;
      if (o.exp === '2A') { // cốc, rong, đèn
        c.fillStyle = 'rgba(170,220,250,.8)'; NL.rr(c, p.x - 10, top - 26, 20, 24, 4); c.fill();
        c.fillStyle = '#3FB37F'; c.fillRect(p.x - 2, top - 22, 4, 16);
        c.fillStyle = '#FFD54A'; c.beginPath(); c.arc(p.x + 34, top - 26, 7, 0, 7); c.fill();
        c.strokeStyle = '#555'; c.lineWidth = 3; c.beginPath(); c.moveTo(p.x + 34, top - 20); c.lineTo(p.x + 34, top - 4); c.stroke();
      } else if (o.exp === '2B') { // kính hiển vi
        c.fillStyle = '#4A5A6A'; NL.rr(c, p.x - 8, top - 10, 22, 8, 3); c.fill();
        c.save(); c.translate(p.x + 2, top - 10); c.rotate(-0.4); NL.rr(c, -4, -30, 8, 30, 3); c.fill(); c.restore();
        c.fillStyle = '#8E5BD8'; c.beginPath(); c.ellipse(p.x - 30, top - 6, 12, 5, 0, 0, 7); c.fill();
        c.fillStyle = '#5DB36F'; c.beginPath(); c.ellipse(p.x - 30, top - 9, 9, 4, 0.4, 0, 7); c.fill();
      } else { // các phòng khác: biểu tượng thí nghiệm trên bàn
        const e = NL.EXPERIMENTS.find(x => x.id === o.exp);
        c.font = '26px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText(e ? e.icon : '🧪', p.x, top - 4);
      }
      if (o.glow) {
        const k = 0.5 + Math.sin(t * 4) * 0.5;
        c.strokeStyle = `rgba(255,213,74,${0.4 + k * 0.5})`; c.lineWidth = 4;
        const A = i(o.x, o.y), B = i(o.x + o.w, o.y), C = i(o.x + o.w, o.y + o.d), Dd = i(o.x, o.y + o.d);
        c.beginPath(); [A, B, C, Dd].forEach((q, n) => n ? c.lineTo(q.x, q.y - o.h) : c.moveTo(q.x, q.y - o.h)); c.closePath(); c.stroke();
      }
    },
    shelf(c, o) {
      NL.box(c, o.x, o.y, o.w, o.d, o.h, '#D8C3A0');
      const cols = ['#5BB4EA', '#3FB37F', '#E86A92', '#FFD54A', '#9B6BD6'];
      for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) {
        const p = i(o.x + o.w, o.y + 0.3 + k * (o.d - 0.4) / 4);
        c.fillStyle = cols[(r + k) % 5]; NL.rr(c, p.x - 3, p.y - 22 - r * 26, 7, 14, 3); c.fill();
      }
    },
    sink(c, o) { NL.box(c, o.x, o.y, o.w, o.d, o.h, '#DDE6EE', { top: '#F4F8FB' }); const p = i(o.x + o.w / 2, o.y + o.d / 2); c.fillStyle = '#BFD3E3'; c.beginPath(); c.ellipse(p.x, p.y - o.h, 14, 7, 0, 0, 7); c.fill(); },
    seat(c, o) { NL.box(c, o.x, o.y, o.w, o.d, 16, '#C99A6B'); },
    railing(c, o) {
      const a = i(o.x1, o.y), b = i(o.x2, o.y);
      c.strokeStyle = '#FFFFFF'; c.lineWidth = 3;
      const n = Math.round((o.x2 - o.x1) * 2);
      for (let k = 0; k <= n; k++) { const p = i(o.x1 + k / 2, o.y); c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x, p.y - 34); c.stroke(); }
      c.strokeStyle = '#E3D6B4'; c.lineWidth = 6; c.beginPath(); c.moveTo(a.x, a.y - 36); c.lineTo(b.x, b.y - 36); c.stroke();
      c.strokeStyle = 'rgba(169,219,247,.35)'; c.lineWidth = 1;
    },
    building(c, o, t) {
      const H = o.h;
      const r = NL.box(c, o.x, o.y, o.w, o.d, H, '#F4E9C8', { top: '#EADDB5', left: '#F7EDCF', right: '#E6D6A8' });
      // cửa sổ mặt trái (dọc theo y = o.y + o.d)
      for (let f = 0; f < 4; f++) {
        for (let k = 0; k < 12; k++) {
          const x0 = o.x + 0.3 + k, h1 = 22 + f * 72, h2 = h1 + 40;
          if (f === 0 && k >= 4 && k <= 7) continue;
          const p1 = i(x0, o.y + o.d), p2 = i(x0 + 0.62, o.y + o.d);
          NL.poly(c, [{ x: p1.x, y: p1.y - h1 }, { x: p2.x, y: p2.y - h1 }, { x: p2.x, y: p2.y - h2 }, { x: p1.x, y: p1.y - h2 }], f === 3 ? '#A9DBF7' : '#8EC9EE');
          NL.poly(c, [{ x: p1.x, y: p1.y - h2 + 4 }, { x: p2.x, y: p2.y - h2 + 4 }, { x: p2.x, y: p2.y - h2 }, { x: p1.x, y: p1.y - h2 }], 'rgba(255,255,255,.7)');
        }
        for (let k = 0; k < 3; k++) {
          const y0 = o.y + 0.4 + k * 1.1, h1 = 22 + f * 72, h2 = h1 + 40;
          const p1 = i(o.x + o.w, y0), p2 = i(o.x + o.w, y0 + 0.6);
          NL.poly(c, [{ x: p1.x, y: p1.y - h1 }, { x: p2.x, y: p2.y - h1 }, { x: p2.x, y: p2.y - h2 }, { x: p1.x, y: p1.y - h2 }], '#7DBBE3');
        }
        // gờ tầng
        const a = i(o.x, o.y + o.d), b = i(o.x + o.w, o.y + o.d), cc = i(o.x + o.w, o.y);
        c.strokeStyle = '#E2D2A2'; c.lineWidth = 3; c.beginPath();
        c.moveTo(a.x, a.y - 72 * (f + 1) + 8); c.lineTo(b.x, b.y - 72 * (f + 1) + 8); c.lineTo(cc.x, cc.y - 72 * (f + 1) + 8); c.stroke();
      }
      // cửa chính
      const d1 = i(o.x + 5.4, o.y + o.d), d2 = i(o.x + 6.6, o.y + o.d);
      NL.poly(c, [{ x: d1.x, y: d1.y }, { x: d2.x, y: d2.y }, { x: d2.x, y: d2.y - 62 }, { x: d1.x, y: d1.y - 62 }], '#5FA6D6');
      const m = i(o.x + 6, o.y + o.d);
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(m.x, m.y - 62); c.stroke();
      // mái hiên + biển A1
      NL.box(c, o.x + 5.05, o.y + o.d + 0.45, 0.12, 0.12, 70, '#FFFFFF');
      NL.box(c, o.x + 6.85, o.y + o.d + 0.45, 0.12, 0.12, 70, '#FFFFFF');
      NL.box(c, o.x + 4.9, o.y + o.d, 2.2, 0.7, 8, '#FFFFFF', { z: 70, left: '#F1F1F1', right: '#E3E3E3' });
      const s = i(o.x + 6, o.y + o.d + 0.3);
      NL.pill(c, s.x, s.y - 122, 'A1', '#2F80C0', '#fff', 26);
      NL.pill(c, s.x, s.y - 156, 'Trường Đại học Sư phạm Hà Nội', 'rgba(255,255,255,.95)', '#1F4E79', 13);
    }
  };
  NL.drawObject = function (c, o, t) { (D[o.kind] || D.box)(c, o, t); };

  // ---------- trang trí tường ----------
  let labels = [];
  const later = f => labels.push(f);
  function wallDeco(c, w, t) {
    if (w.kind === 'window') {
      NL.wallQuad(c, w.side, w.a, w.b, 34, 96, '#BFE4FA');
      NL.wallQuad(c, w.side, w.a, w.b, 88, 96, 'rgba(255,255,255,.8)');
      const m = (w.a + w.b) / 2; NL.wallQuad(c, w.side, m - 0.03, m + 0.03, 34, 96, '#FFFFFF');
    } else if (w.kind === 'elevator') {
      NL.wallQuad(c, w.side, w.a - 0.15, w.b + 0.15, 0, 100, '#B9C6D2');
      NL.wallQuad(c, w.side, w.a, w.b, 0, 88, '#DCE4EC');
      const m = (w.a + w.b) / 2;
      NL.wallQuad(c, w.side, m - 0.02, m + 0.02, 0, 88, '#9AA9B7');
      const p = w.side === 'N' ? i(m, 0) : i(0, m);
      c.fillStyle = '#14273A'; NL.rr(c, p.x - 16, p.y - 112, 32, 16, 4); c.fill();
      c.fillStyle = '#7CF29A'; c.font = "800 12px 'Baloo 2'"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(w.floorLabel || '▲', p.x, p.y - 103);
      later(() => NL.pill(c, p.x, p.y - 132, '🛗 Thang máy', '#fff', '#1F4E79', 13));
    } else if (w.kind === 'door') {
      NL.wallQuad(c, w.side, w.a - 0.1, w.b + 0.1, 0, 92, '#FFFFFF');
      NL.wallQuad(c, w.side, w.a, w.b, 0, 84, w.locked ? '#C9D3DD' : '#9FD3F2');
      NL.wallQuad(c, w.side, w.a + 0.15, w.b - 0.15, 40, 76, 'rgba(255,255,255,.55)');
      const m = (w.a + w.b) / 2, p = w.side === 'N' ? i(m, 0) : i(0, m);
      const ly = p.y - (w.high ? 138 : 112);
      later(() => { NL.pill(c, p.x, ly, w.label, w.locked ? '#9AA9B7' : (w.color || '#2F80C0'), '#fff', 13); if (w.sub) NL.pill(c, p.x, p.y - 46, w.sub, '#fff', '#1F4E79', 12); });
    } else if (w.kind === 'board') {
      NL.wallQuad(c, w.side, w.a, w.b, 40, 96, '#FFFFFF');
      NL.wallQuad(c, w.side, w.a + 0.08, w.b - 0.08, 46, 90, w.color || '#E8F4FC');
      const m = (w.a + w.b) / 2, p = w.side === 'N' ? i(m, 0) : i(0, m);
      (w.lines || []).forEach((ln, k) => later(() => NL.pill(c, p.x, p.y - 82 + k * 20 - (w.lines.length - 1) * 4, ln, k === 0 && w.lines.length > 1 ? (w.head || '#2F80C0') : 'rgba(255,255,255,.95)', k === 0 && w.lines.length > 1 ? '#fff' : '#1F4E79', 12)));
    }
  }

  // Phần tòa nhà bên dưới phòng + mặt đất có cỏ, để thấy phòng nằm trong tòa A1 đứng trên mặt đất.
  const STOREY = 76;
  function drawBase(c, s, t) {
    const f = s.floor || 1, H = (f - 1) * STOREY + 14, w = s.w, d = s.d;
    const gp = (x, y) => { const p = i(x, y); p.y += H; return p; };
    NL.poly(c, [gp(-14, -14), gp(w + 14, -14), gp(w + 14, d + 14), gp(-14, d + 14)], '#A6DB8F');
    NL.poly(c, [gp(-1.4, -1.4), gp(w + 1.4, -1.4), gp(w + 1.4, d + 1.4), gp(-1.4, d + 1.4)], '#E7DCC0');
    // cây trên mặt đất
    [[w + 4, 1], [w + 5, d - 1], [-3, d + 4], [3, d + 5], [w - 3, d + 4.5], [w + 3.5, d + 3]].forEach(([x, y], k) => {
      const p = gp(x, y), sw = Math.sin(t * 1.2 + k) * 2;
      c.fillStyle = '#9C6B43'; c.fillRect(p.x - 4, p.y - 26, 8, 26);
      c.fillStyle = '#4FA36B'; c.beginPath(); c.arc(p.x + sw, p.y - 40, 22, 0, 7); c.fill();
      c.fillStyle = '#62B77C'; c.beginPath(); c.arc(p.x - 8 + sw, p.y - 46, 12, 0, 7); c.fill();
    });
    // khối tòa nhà các tầng bên dưới
    NL.box(c, 0, 0, w, d, H, '#F4E9C8', { z: -H, top: '#EADDB5', left: '#F7EDCF', right: '#E6D6A8' });
    const win = (pa, pb, e1, e2, col) => NL.poly(c, [{ x: pa.x, y: pa.y - e1 }, { x: pb.x, y: pb.y - e1 }, { x: pb.x, y: pb.y - e2 }, { x: pa.x, y: pa.y - e2 }], col);
    for (let k = 0; k < f - 1; k++) {
      const e1 = -H + 14 + k * STOREY + 20, e2 = e1 + 38;
      for (let x = 0.5; x < w - 0.6; x += 1.5) {
        if (k === 0 && x > w / 2 - 1.5 && x < w / 2 + 0.6) continue;
        win(i(x, d), i(x + 0.8, d), e1, e2, '#8EC9EE');
      }
      for (let y = 0.5; y < d - 0.5; y += 1.5) win(i(w, y), i(w, y + 0.8), e1, e2, '#7DBBE3');
      const a = i(0, d), b = i(w, d), cc = i(w, 0), e = -H + 14 + (k + 1) * STOREY - 6;
      c.strokeStyle = '#E2D2A2'; c.lineWidth = 3; c.beginPath();
      c.moveTo(a.x, a.y - e); c.lineTo(b.x, b.y - e); c.lineTo(cc.x, cc.y - e); c.stroke();
    }
    if (f > 1) { // cửa chính tầng 1
      const a = i(w / 2 - 0.7, d), b = i(w / 2 + 0.7, d);
      win(a, b, -H, -H + 56, '#5FA6D6');
    }
  }

  function drawRoom(c, s, t) {
    if (s.walls && s.floor) drawBase(c, s, t);
    // sàn
    for (let y = 0; y < s.d; y++) for (let x = 0; x < s.w; x++) {
      NL.tile(c, x, y, s.floorColor(x, y), 'rgba(30,60,90,.06)');
    }
    if (s.walls) {
      // tường bắc (y = 0) và tây (x = 0)
      const H = NL.WALL;
      NL.wallQuad(c, 'N', 0, s.w, 0, H, WALL_C);
      NL.wallQuad(c, 'W', 0, s.d, 0, H, WALL_SIDE);
      NL.wallQuad(c, 'N', 0, s.w, 0, 10, '#E6D6A8');
      NL.wallQuad(c, 'W', 0, s.d, 0, 10, '#DCCB98');
      const top0 = i(0, 0), topN = i(s.w, 0), topW = i(0, s.d);
      c.strokeStyle = '#E2D2A2'; c.lineWidth = 4; c.beginPath();
      c.moveTo(topW.x, topW.y - H); c.lineTo(top0.x, top0.y - H); c.lineTo(topN.x, topN.y - H); c.stroke();
      labels = [];
      (s.deco || []).forEach(w => wallDeco(c, w, t));
      labels.forEach(f => f());
    }
  }

  // ---------- định nghĩa khung cảnh ----------
  const S = {};
  S.outside = {
    id: 'outside', title: 'Trước tòa A1', w: 16, d: 13, walls: false, outdoor: true, camZoom: 0.72, camShift: { x: -1.2, y: -2.2 },
    floorColor(x, y) {
      if (y >= 4 && x >= 6 && x <= 9) return (x + y) % 2 ? '#EFE6CF' : '#E7DCC0';
      if (y >= 4 && y <= 5) return (x + y) % 2 ? '#EFE6CF' : '#E7DCC0';
      return (x + y) % 2 ? '#A6DB8F' : '#9CD385';
    },
    objects: [
      { kind: 'building', x: 2, y: 0, w: 12, d: 3.6, h: 300, solid: true },
      { kind: 'tree', x: 1, y: 6, w: 1, d: 1, solid: true }, { kind: 'tree', x: 13.5, y: 6.5, w: 1, d: 1, solid: true },
      { kind: 'tree', x: 2.5, y: 10, w: 1, d: 1, solid: true }, { kind: 'tree', x: 12.5, y: 10.5, w: 1, d: 1, solid: true },
      { kind: 'bush', x: 4.5, y: 6.5, w: 1, d: 1 }, { kind: 'bush', x: 10.5, y: 6.5, w: 1, d: 1 }, { kind: 'bush', x: 4.5, y: 9, w: 1, d: 1 }, { kind: 'bush', x: 10.5, y: 9.2, w: 1, d: 1 }
    ],
    // chỉ cho đi trên lối vào: dẫn đường cố định
    block(x, y) { return !(y >= 3.7 && ((x >= 6 && x <= 10) || (y <= 5.9 && x >= 2 && x <= 14))); },
    triggers: [{ x1: 6.6, y1: 3.5, x2: 9.4, y2: 4.3, type: 'goto', to: 'lobby', spawn: 'fromOut' }],
    spawns: { default: { x: 8, y: 11.5 }, fromLobby: { x: 8, y: 5 } },
    guide: { x: 8, y: 4.1, text: 'Đi tới cửa tòa nhà' }
  };
  S.lobby = {
    id: 'lobby', title: 'Tầng 1 · Sảnh', floor: 1, w: 12, d: 9, walls: true,
    floorColor(x, y) { return (x + y) % 2 ? '#F7F2E6' : '#EFE8D6'; },
    deco: [
      { kind: 'board', side: 'N', a: 1.2, b: 3.6, lines: ['Bảng tin', 'Chào mừng đến Nhà Láp!', 'Tầng 2 Sinh · 3 Hóa · 4 Lý'] },
      { kind: 'elevator', side: 'N', a: 5.2, b: 6.8, floorLabel: '1' },
      { kind: 'window', side: 'N', a: 8.4, b: 11.2 },
      { kind: 'board', side: 'W', a: 2.5, b: 6.5, lines: ['NHÀ A1', 'Trường ĐHSP Hà Nội'], head: '#2F80C0' }
    ],
    objects: [
      { kind: 'desk', x: 1.2, y: 4, w: 1.1, d: 2.6, h: 40, label: 'Lễ tân', solid: true },
      { kind: 'sofa', x: 8.5, y: 5.2, w: 2.4, d: 1, solid: true },
      { kind: 'plant', x: 0.3, y: 0.3, w: 0.8, d: 0.8, solid: true }, { kind: 'plant', x: 11, y: 0.3, w: 0.8, d: 0.8, solid: true },
      { kind: 'plant', x: 4.2, y: 0.3, w: 0.8, d: 0.8, solid: true }, { kind: 'plant', x: 7.2, y: 0.3, w: 0.8, d: 0.8, solid: true }
    ],
    triggers: [
      { x1: 4.7, y1: 0, x2: 7.3, y2: 1.0, type: 'elevator' },
      { x1: 4.8, y1: 8.4, x2: 7.2, y2: 9, type: 'goto', to: 'outside', spawn: 'fromLobby' }
    ],
    mats: [{ x: 5, y: 8, w: 2, label: 'Lối ra' }],
    spawns: { default: { x: 6, y: 7.4 }, fromOut: { x: 6, y: 7.6 }, fromElev: { x: 6, y: 1.5 } },
    guide: { x: 6, y: 0.9, text: 'Vào thang máy' }
  };

  function floorScene(f) {
    const sub = NL.SUBJECTS[f];
    return {
      id: 'f' + f, title: `Tầng ${f} · ${sub.name}`, floor: f, w: 16, d: 8, walls: true, subject: sub,
      floorColor(x, y) {
        if (y >= 5) return (x + y) % 2 ? '#E2C499' : '#D9B988';
        return (x + y) % 2 ? '#F7F7F2' : '#EDEEE8';
      },
      deco: [
        { kind: 'door', side: 'N', a: 1.4, b: 3.1, label: 'A · ' + sub.A, color: sub.color, locked: !sub.ready, sub: sub.ready ? null : 'Sắp có' },
        { kind: 'board', side: 'N', a: 4, b: 6.6, lines: [sub.icon + ' ' + sub.name, '⬅ Phòng A', 'Phòng B ➡'], head: sub.color },
        { kind: 'elevator', side: 'N', a: 7.2, b: 8.8, floorLabel: String(f) },
        { kind: 'window', side: 'N', a: 9.6, b: 12 },
        { kind: 'door', side: 'N', a: 12.9, b: 14.6, label: 'B · ' + sub.B, color: sub.color, locked: !sub.ready, sub: sub.ready ? null : 'Sắp có' },
        { kind: 'window', side: 'W', a: 1, b: 3.6 }
      ],
      objects: [
        { kind: 'railing', x1: 0, x2: 16, y: 7.85 },
        { kind: 'plant', x: 1.5, y: 6.3, w: 0.8, d: 0.8, solid: true }, { kind: 'plant', x: 5, y: 6.6, w: 0.8, d: 0.8, solid: true },
        { kind: 'plant', x: 11, y: 6.4, w: 0.8, d: 0.8, solid: true }, { kind: 'plant', x: 14.5, y: 6.2, w: 0.8, d: 0.8, solid: true },
        { kind: 'seat', x: 7.2, y: 6.6, w: 1.6, d: 0.7, solid: true },
        { kind: 'plant', x: 6.4, y: 0.25, w: 0.7, d: 0.7, solid: true }, { kind: 'plant', x: 9, y: 0.25, w: 0.7, d: 0.7, solid: true }
      ],
      block(x, y) { return y > 7.6; },
      tags: [{ x: 3.3, y: 5.5, label: '🌤 Ban công' }, { x: 12.8, y: 5.5, label: '🌤 Ban công' }],
      triggers: [
        { x1: 6.7, y1: 0, x2: 9.3, y2: 1.0, type: 'elevator' },
        { x1: 0.9, y1: 0, x2: 3.6, y2: 0.9, type: sub.ready ? 'goto' : 'locked', to: 'lab-' + f + 'A', spawn: 'default' },
        { x1: 12.4, y1: 0, x2: 15.1, y2: 0.9, type: sub.ready ? 'goto' : 'locked', to: 'lab-' + f + 'B', spawn: 'default' },
        { x1: 0, y1: 4.8, x2: 16, y2: 7.6, type: 'balcony' }
      ],
      spawns: { default: { x: 8, y: 1.6 }, fromElev: { x: 8, y: 1.6 }, fromLabA: { x: 2.25, y: 1.5 }, fromLabB: { x: 13.75, y: 1.5 } }
    };
  }
  [3, 4].forEach(f => { S['f' + f] = floorScene(f); });

  // Tầng 2 Sinh: hành lang dài, 5 phòng mỗi bên thang máy.
  function sinhFloor() {
    const sub = NL.SUBJECTS[2], W = 28, exps = NL.EXPERIMENTS.filter(e => e.floor === 2);
    const doorX = k => k < 5 ? 0.6 + k * 2.45 : 15.6 + (k - 5) * 2.45;
    const s = {
      id: 'f2', title: `Tầng 2 · ${sub.name}`, floor: 2, w: W, d: 8, walls: true, subject: sub,
      floorColor(x, y) {
        if (y >= 5) return (x + y) % 2 ? '#E2C499' : '#D9B988';
        return (x + y) % 2 ? '#F7F7F2' : '#EDEEE8';
      },
      deco: [
        { kind: 'elevator', side: 'N', a: 12.9, b: 14.5, floorLabel: '2' },
        { kind: 'door', side: 'W', a: 1.4, b: 3.4, label: '🧊 Phòng Mô hình 3D', color: '#2F80C0' },
        { kind: 'board', side: 'W', a: 4.9, b: 7.5, lines: [sub.icon + ' ' + sub.name, '10 phòng thí nghiệm', '10 mô hình 3D'], head: sub.color }
      ],
      objects: [
        { kind: 'railing', x1: 0, x2: W, y: 7.85 },
        { kind: 'seat', x: 6.2, y: 6.6, w: 1.6, d: 0.7, solid: true }, { kind: 'seat', x: 20.2, y: 6.6, w: 1.6, d: 0.7, solid: true }
      ],
      block(x, y) { return y > 7.6; },
      tags: [{ x: 3.3, y: 5.5, label: '🌤 Ban công' }, { x: 13.7, y: 5.6, label: '🌤 Ban công' }, { x: 24.5, y: 5.5, label: '🌤 Ban công' }],
      triggers: [
        { x1: 12.4, y1: 0, x2: 15.0, y2: 1.0, type: 'elevator' },
        { x1: 0, y1: 1.3, x2: 0.75, y2: 3.5, type: 'goto', to: 'models', spawn: 'default' },
        { x1: 0, y1: 4.8, x2: W, y2: 7.6, type: 'balcony' }
      ],
      spawns: { default: { x: 13.7, y: 1.6 }, fromElev: { x: 13.7, y: 1.6 }, fromModels: { x: 1.6, y: 2.4 } },
      doors: {}
    };
    [1.6, 11, 17.2, 26.4].forEach(x => s.objects.push({ kind: 'plant', x, y: 6.3, w: 0.8, d: 0.8, solid: true }));
    exps.forEach((e, k) => {
      const a = doorX(k), b = a + 1.7, m = (a + b) / 2;
      s.deco.push({ kind: 'door', side: 'N', a, b, label: e.no + ' · ' + e.short, color: sub.color, locked: !e.ready, sub: e.ready ? null : 'Sắp có', high: k % 2 === 1 });
      s.triggers.push({ x1: a - 0.15, y1: 0, x2: b + 0.15, y2: 0.9, type: e.ready ? 'goto' : 'locked', to: 'lab-' + e.id, spawn: 'default' });
      s.spawns['fromLab' + e.id] = { x: m, y: 1.5 };
      s.doors[e.id] = { x: m, y: 0.7 };
    });
    return s;
  }
  S.f2 = sinhFloor();


  function labScene(e) {
    const f = e.floor, sub = NL.SUBJECTS[f], exp = e.id, name = e.name, ab = String(e.no);
    return {
      id: 'lab-' + exp, title: `Phòng ${ab} · ${name}`, floor: f, w: 10, d: 8, walls: true, lab: exp,
      floorColor(x, y) { return (x + y) % 2 ? '#F2F6F9' : '#E6EDF2'; },
      deco: [
        { kind: 'window', side: 'N', a: 1, b: 3.4 },
        { kind: 'board', side: 'N', a: 4, b: 6.4, lines: ['Phòng ' + ab, e.short], head: sub.color },
        { kind: 'window', side: 'N', a: 7, b: 9.4 },
        { kind: 'board', side: 'W', a: 4.2, b: 6.8, lines: ['🥽 An toàn', 'Đeo kính bảo hộ', 'Làm theo từng bước'], head: '#E5534B' }
      ],
      objects: [
        { kind: 'bench', x: 3.4, y: 3, w: 3.2, d: 1.4, h: 40, exp, glow: true, solid: true },
        { kind: 'shelf', x: 0.15, y: 0.8, w: 0.7, d: 2.6, h: 100, solid: true },
        { kind: 'sink', x: 8.2, y: 2.2, w: 1.4, d: 1, h: 42, solid: true },
        { kind: 'plant', x: 0.3, y: 6.8, w: 0.8, d: 0.8, solid: true }, { kind: 'plant', x: 9, y: 6.8, w: 0.8, d: 0.8, solid: true }
      ],
      triggers: [
        { x1: 3.2, y1: 4.4, x2: 6.8, y2: 5.4, type: 'bench', exp },
        { x1: 4, y1: 7.5, x2: 6, y2: 8, type: 'goto', to: 'f' + f, spawn: 'fromLab' + exp }
      ],
      mats: [{ x: 4, y: 7.2, w: 2, label: 'Ra hành lang' }],
      spawns: { default: { x: 5, y: 6.6 } },
      guide: { x: 5, y: 4.9, text: 'Tới bàn thí nghiệm' }
    };
  }
  NL.EXPERIMENTS.filter(e => e.floor === 2 && e.ready).forEach(e => { S['lab-' + e.id] = labScene(e); });

  // Phòng Mô hình 3D: 10 bục trưng bày, đi tới bục nào thì xem mô hình đó
  function modelRoom() {
    const s = {
      id: 'models', title: 'Tầng 2 · Phòng Mô hình 3D', floor: 2, w: 14, d: 9, walls: true,
      floorColor(x, y) { return (x + y) % 2 ? '#EEF4FA' : '#E2ECF5'; },
      deco: [
        { kind: 'board', side: 'N', a: 1, b: 4.4, lines: ['🧊 Phòng Mô hình 3D', 'Đi tới bục để xem'], head: '#2F80C0' },
        { kind: 'window', side: 'N', a: 5.2, b: 8.4 },
        { kind: 'window', side: 'N', a: 9.4, b: 12.6 },
        { kind: 'window', side: 'W', a: 2, b: 4.6 }
      ],
      objects: [
        { kind: 'plant', x: 0.3, y: 7.9, w: 0.8, d: 0.8, solid: true }, { kind: 'plant', x: 12.9, y: 7.9, w: 0.8, d: 0.8, solid: true },
        { kind: 'plant', x: 12.9, y: 0.3, w: 0.8, d: 0.8, solid: true }
      ],
      triggers: [{ x1: 12.4, y1: 8.4, x2: 14, y2: 9, type: 'goto', to: 'f2', spawn: 'fromModels' }],
      mats: [{ x: 12, y: 8, w: 2, label: 'Ra hành lang' }],
      spawns: { default: { x: 13, y: 7.4 } },
      guide: { x: 2.3, y: 2.7, text: 'Tới bục mô hình' }
    };
    NL.MODELS.forEach((m, k) => {
      const row = k < 5 ? 0 : 1, x = 1 + (k % 5) * 2.4, y = row ? 4.9 : 1.2;
      s.objects.push({ kind: 'stand', x, y, w: 1, d: 1, h: 26, icon: m.icon, no: m.no, short: m.short, model: m.id, solid: true });
      s.triggers.push({ x1: x - 0.35, y1: y + 1, x2: x + 1.35, y2: y + 1.8, type: 'model', model: m.id });
    });
    return s;
  }
  if (NL.MODELS) S.models = modelRoom();
  NL.scenes = S;

  // ---------- đi lại ----------
  NL.walkable = function (s, x, y) {
    if (x < 0.3 || y < 0.3 || x > s.w - 0.3 || y > s.d - 0.2) return false;
    if (s.block && s.block(x, y)) return false;
    for (const o of s.objects) {
      if (!o.solid) continue;
      if (x > o.x - 0.2 && x < o.x + o.w + 0.2 && y > o.y - 0.2 && y < o.y + o.d + 0.2) return false;
    }
    return true;
  };
  // Tìm đường trên lưới 0.5 ô (BFS).
  NL.findPath = function (s, sx, sy, tx, ty) {
    const R = 2, W = s.w * R, H = s.d * R;
    const key = (x, y) => y * W + x;
    const cx = v => Math.max(0, Math.min(W - 1, Math.floor(v * R))), cy = v => Math.max(0, Math.min(H - 1, Math.floor(v * R)));
    const ok = (gx, gy) => NL.walkable(s, (gx + 0.5) / R, (gy + 0.5) / R);
    let ex = cx(tx), ey = cy(ty);
    if (!ok(ex, ey)) { // tìm ô đi được gần đích nhất
      let best = null, bd = 1e9;
      for (let gy = 0; gy < H; gy++) for (let gx = 0; gx < W; gx++) if (ok(gx, gy)) { const dd = (gx - ex) ** 2 + (gy - ey) ** 2; if (dd < bd) { bd = dd; best = [gx, gy]; } }
      if (!best) return null; [ex, ey] = best;
    }
    const st = [cx(sx), cy(sy)], prev = new Map(), q = [st]; prev.set(key(st[0], st[1]), null);
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    while (q.length) {
      const [x, y] = q.shift();
      if (x === ex && y === ey) break;
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H || prev.has(key(nx, ny)) || !ok(nx, ny)) continue;
        if (dx && dy && (!ok(x + dx, y) || !ok(x, y + dy))) continue;
        prev.set(key(nx, ny), [x, y]); q.push([nx, ny]);
      }
    }
    if (!prev.has(key(ex, ey))) return null;
    const path = []; let cur = [ex, ey];
    while (cur) { path.unshift({ x: (cur[0] + 0.5) / R, y: (cur[1] + 0.5) / R }); cur = prev.get(key(cur[0], cur[1])); }
    path.shift();
    return path;
  };

  NL.randomSpot = function (s, rnd) {
    for (let k = 0; k < 60; k++) {
      const x = 0.5 + rnd() * (s.w - 1), y = 0.5 + rnd() * (s.d - 1);
      // không đứng chắn cửa, thang máy, bàn thí nghiệm
      const nearTrig = s.triggers.some(tr => tr.type !== 'balcony' && x > tr.x1 - 0.7 && x < tr.x2 + 0.7 && y > tr.y1 - 0.7 && y < tr.y2 + 0.9);
      if (NL.walkable(s, x, y) && !nearTrig) return { x, y };
    }
    return s.spawns.default;
  };

  NL.drawScene = function (c, s, t, chars) {
    drawRoom(c, s, t);
    (s.mats || []).forEach(m => {
      for (let k = 0; k < m.w; k++) NL.tile(c, m.x + k, m.y, '#5BB4EA');
      const p = i(m.x + m.w / 2, m.y + 0.5); NL.pill(c, p.x, p.y, m.label, 'rgba(255,255,255,.9)', '#1F4E79', 12);
    });
    (s.tags || []).forEach(tg => { const p = i(tg.x, tg.y); NL.pill(c, p.x, p.y, tg.label, 'rgba(255,255,255,.85)', '#1F4E79', 12); });
    const items = [];
    s.objects.forEach(o => {
      const key = o.kind === 'railing' ? o.y + 100 : (o.x + o.w / 2) + (o.y + o.d / 2) + (o.kind === 'building' ? -3 : 0);
      items.push({ key, draw: () => NL.drawObject(c, o, t) });
    });
    chars.forEach(ch => items.push({ key: ch.x + ch.y, draw: ch.draw }));
    items.sort((a, b) => a.key - b.key).forEach(it => it.draw());
  };
})();
