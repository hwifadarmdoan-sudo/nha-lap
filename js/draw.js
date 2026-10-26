// Hàm vẽ: phép chiếu isometric, khối hộp, tường, nhân vật chibi.
window.NL = window.NL || {};
NL.TW = 72; NL.TH = 36; NL.WALL = 120;
NL.HAIR_COLORS = ['#2B2B2B', '#6B4226', '#C98B3C', '#E86A92', '#4A7BD0', '#8E5BD8'];
NL.COAT_COLORS = ['#FFFFFF', '#A9DBF7', '#FFD6E0', '#C8F0D2', '#FFE8A3', '#D9CCFF'];
NL.HAIR_STYLES = ['Ngắn', 'Dài', 'Búi', 'Đuôi ngựa'];

NL.iso = function (x, y) { return { x: (x - y) * NL.TW / 2, y: (x + y) * NL.TH / 2 }; };

NL.shade = function (hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};

NL.poly = function (c, pts, fill, stroke) {
  c.beginPath(); c.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
  c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); }
};

NL.tile = function (c, x, y, fill, stroke) {
  const i = NL.iso;
  NL.poly(c, [i(x, y), i(x + 1, y), i(x + 1, y + 1), i(x, y + 1)], fill, stroke);
};

// Khối hộp: góc sau (x,y), rộng w theo trục x, sâu d theo trục y, cao h pixel.
NL.box = function (c, x, y, w, d, h, color, opt) {
  opt = opt || {};
  const z = opt.z || 0;
  const i = (a, b) => { const p = NL.iso(a, b); p.y -= z; return p; }, up = p => ({ x: p.x, y: p.y - h });
  const A = i(x, y), B = i(x + w, y), C = i(x + w, y + d), D = i(x, y + d);
  NL.poly(c, [D, C, up(C), up(D)], opt.left || NL.shade(color, -18));
  NL.poly(c, [C, B, up(B), up(C)], opt.right || NL.shade(color, -38));
  NL.poly(c, [up(A), up(B), up(C), up(D)], opt.top || color);
  if (opt.outline !== false) {
    c.strokeStyle = 'rgba(30,60,90,.18)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(up(A).x, up(A).y); c.lineTo(up(B).x, up(B).y); c.lineTo(up(C).x, up(C).y); c.lineTo(up(D).x, up(D).y); c.closePath();
    c.moveTo(up(C).x, up(C).y); c.lineTo(C.x, C.y); c.stroke();
  }
  return { A, B, C, D, up };
};

// Hình tứ giác nằm trên mặt tường. side 'N' = tường y=0 (theo x), 'W' = tường x=0 (theo y).
NL.wallQuad = function (c, side, a, b, h1, h2, fill, off) {
  off = off || 0;
  const i = NL.iso;
  const p1 = side === 'N' ? i(a, off) : i(off, a), p2 = side === 'N' ? i(b, off) : i(off, b);
  NL.poly(c, [
    { x: p1.x, y: p1.y - h1 }, { x: p2.x, y: p2.y - h1 },
    { x: p2.x, y: p2.y - h2 }, { x: p1.x, y: p1.y - h2 }
  ], fill);
};

NL.pill = function (c, cx, cy, text, bg, fg, size) {
  size = size || 14;
  c.font = `800 ${size}px 'Baloo 2', sans-serif`;
  const w = c.measureText(text).width + size * 1.1, h = size * 1.6;
  c.fillStyle = bg || 'rgba(255,255,255,.92)';
  NL.rr(c, cx - w / 2, cy - h / 2, w, h, h / 2); c.fill();
  c.fillStyle = fg || '#1F4E79'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(text, cx, cy + 1);
  return w;
};

NL.rr = function (c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
};

// Nhân vật chibi. (sx, sy) là điểm chân. o: {t, facing, anim, teacher, emote}
NL.drawChar = function (c, sx, sy, look, o) {
  o = o || {};
  const t = o.t || 0, anim = o.anim || 'idle', s = o.scale || 1;
  let bob = 0, sway = 0, legA = 0;
  if (anim === 'walk') { bob = Math.abs(Math.sin(t * 12)) * 3; legA = Math.sin(t * 12); }
  else if (anim === 'jump') { bob = Math.abs(Math.sin(t * 7)) * 16; }
  else if (anim === 'dance') { bob = Math.abs(Math.sin(t * 9)) * 8; sway = Math.sin(t * 4.5) * 0.18; legA = Math.sin(t * 9); }
  else if (anim === 'special') { bob = Math.abs(Math.sin(t * 6)) * 12; sway = Math.sin(t * 6) * 0.35; }
  else { bob = Math.sin(t * 2.2) * 1; }

  c.save();
  c.translate(sx, sy); c.scale(s, s);
  // bóng
  c.fillStyle = 'rgba(30,60,90,.22)';
  c.beginPath(); c.ellipse(0, 0, 15 - bob * 0.25, 6 - bob * 0.1, 0, 0, Math.PI * 2); c.fill();
  c.translate(0, -bob);
  c.rotate(sway);
  if (anim === 'special') c.scale(Math.cos(t * 6) > 0 ? 1 : -1, 1);
  if (o.facing < 0) c.scale(-1, 1);

  const coat = look.coat || '#FFFFFF', hair = look.hairColor || '#2B2B2B', skin = '#FFE0C4';
  const pants = o.teacher ? '#2E4057' : '#3E5C8A';
  // chân
  c.fillStyle = pants;
  NL.rr(c, -9, -12 + legA * 2, 7, 12 - legA * 2, 3); c.fill();
  NL.rr(c, 2, -12 - legA * 2, 7, 12 + legA * 2, 3); c.fill();
  c.fillStyle = '#334'; NL.rr(c, -10, -3 + (legA > 0 ? 0 : 0), 9, 4, 2); c.fill(); NL.rr(c, 1, -3, 9, 4, 2); c.fill();

  // tóc dài/đuôi ngựa phía sau
  if (look.hair === 1) { c.fillStyle = hair; NL.rr(c, -17, -60, 34, 34, 12); c.fill(); }
  if (look.hair === 3) {
    c.fillStyle = hair; c.beginPath();
    c.ellipse(-17, -46 + Math.sin(t * 5) * 1.5, 7, 14, -0.4, 0, Math.PI * 2); c.fill();
  }

  // thân (áo blouse)
  const coatC = o.teacher ? '#2F80C0' : coat;
  c.fillStyle = coatC; c.strokeStyle = 'rgba(30,60,90,.25)'; c.lineWidth = 1.2;
  NL.rr(c, -12, -33, 24, 24, 8); c.fill(); c.stroke();
  // cổ áo
  c.fillStyle = o.teacher ? '#fff' : NL.shade(coatC === '#FFFFFF' ? '#E6EEF5' : coatC, -12);
  c.beginPath(); c.moveTo(-6, -33); c.lineTo(0, -24); c.lineTo(6, -33); c.closePath(); c.fill();
  // tay
  const wave = o.emote === 'wave' ? Math.sin(t * 14) * 0.5 : 0;
  c.fillStyle = coatC;
  c.save(); c.translate(-12, -30); c.rotate(0.25 + (anim === 'dance' ? Math.sin(t * 9) * 0.8 : 0)); NL.rr(c, -4, 0, 7, 15, 3.5); c.fill(); c.stroke();
  c.fillStyle = skin; c.beginPath(); c.arc(-0.5, 16, 3.5, 0, 7); c.fill(); c.restore();
  c.save(); c.translate(12, -30);
  const raise = (o.emote === 'wave' || o.emote === 'five' || anim === 'jump') ? -2.6 + wave : (o.emote === 'poke' ? -1.4 : -0.25 - (anim === 'dance' ? Math.sin(t * 9 + 1) * 0.8 : 0));
  c.rotate(raise); c.fillStyle = coatC; NL.rr(c, -3, 0, 7, 15, 3.5); c.fill(); c.stroke();
  c.fillStyle = skin; c.beginPath(); c.arc(0.5, 16, 3.5, 0, 7); c.fill(); c.restore();

  // đầu
  c.fillStyle = skin; c.beginPath(); c.arc(0, -48, 16, 0, Math.PI * 2); c.fill();
  c.strokeStyle = 'rgba(30,60,90,.2)'; c.stroke();
  // mắt, má, miệng
  c.fillStyle = '#2B2B3A';
  c.beginPath(); c.ellipse(-6, -46, 2.3, 3, 0, 0, 7); c.fill();
  c.beginPath(); c.ellipse(6, -46, 2.3, 3, 0, 0, 7); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(-5.3, -47, 0.9, 0, 7); c.arc(6.7, -47, 0.9, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,120,140,.45)';
  c.beginPath(); c.ellipse(-10, -41, 3.2, 2, 0, 0, 7); c.ellipse(10, -41, 3.2, 2, 0, 0, 7); c.fill();
  c.strokeStyle = '#8A4B3C'; c.lineWidth = 1.4; c.beginPath();
  if (anim === 'jump' && o.help) c.ellipse(0, -39, 2.5, 3, 0, 0, 7); else c.arc(0, -41, 3, 0.2, Math.PI - 0.2);
  c.stroke();

  // tóc phía trên
  c.fillStyle = hair;
  c.beginPath(); c.arc(0, -50, 17, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-17, -51); c.quadraticCurveTo(-6, -44, 2, -55); c.quadraticCurveTo(8, -46, 17, -51); c.lineTo(17, -56); c.lineTo(-17, -56); c.fill();
  if (look.hair === 1) { NL.rr(c, -18, -54, 6, 22, 3); c.fill(); NL.rr(c, 12, -54, 6, 22, 3); c.fill(); }
  if (look.hair === 2) { c.beginPath(); c.arc(-12, -64, 7, 0, 7); c.arc(12, -64, 7, 0, 7); c.fill(); }
  if (look.hair === 0) { c.beginPath(); c.moveTo(-4, -66); c.quadraticCurveTo(2, -74, 6, -66); c.fill(); }
  if (o.teacher) { // kính
    c.strokeStyle = '#1F4E79'; c.lineWidth = 1.6;
    c.beginPath(); c.arc(-6, -46, 4.5, 0, 7); c.moveTo(10.5, -46); c.arc(6, -46, 4.5, 0, 7); c.moveTo(-1.5, -46); c.lineTo(1.5, -46); c.stroke();
  }
  c.restore();
};

// Nhãn tên và bóng nói phía trên đầu.
NL.drawTag = function (c, sx, sy, name, o) {
  o = o || {};
  const top = sy - 82 - (o.lift || 0);
  NL.pill(c, sx, top, name, o.teacher ? '#2F80C0' : 'rgba(255,255,255,.92)', o.teacher ? '#fff' : '#1F4E79', 13);
  if (o.help) {
    const yy = top - 26 + Math.sin(o.t * 8) * 3;
    NL.pill(c, sx, yy, 'Help teacher! 🙋', '#E5534B', '#fff', 14);
  } else if (o.bubble) {
    const k = Math.min(1, o.bubbleAge * 6);
    c.save(); c.translate(sx, top - 28); c.scale(k, k);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.fill();
    c.beginPath(); c.moveTo(-5, 14); c.lineTo(0, 24); c.lineTo(5, 14); c.fill();
    c.font = '22px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.bubble, 0, 1);
    c.restore();
  }
  if (o.status) NL.pill(c, sx, sy + 16, o.status, 'rgba(31,78,121,.85)', '#fff', 11);
};

// Mũi tên dẫn đường nhún nhảy.
NL.drawArrow = function (c, sx, sy, t) {
  const y = sy - 20 - Math.abs(Math.sin(t * 4)) * 14;
  c.save(); c.translate(sx, y);
  c.fillStyle = '#FFD54A'; c.strokeStyle = '#C99A00'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-14, -26); c.lineTo(14, -26); c.lineTo(14, -6); c.lineTo(24, -6); c.lineTo(0, 16); c.lineTo(-24, -6); c.lineTo(-14, -6); c.closePath();
  c.fill(); c.stroke(); c.restore();
  c.fillStyle = 'rgba(255,213,74,.35)';
  c.beginPath(); c.ellipse(sx, sy, 26 + Math.sin(t * 4) * 4, 13 + Math.sin(t * 4) * 2, 0, 0, 7); c.fill();
};
