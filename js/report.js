// Biểu đồ cột (SVG) và bảng báo cáo vuốt từng trang.
window.NL = window.NL || {};
NL.chartSVG = function (spec, W, H) {
  if (spec.type === 'line') return NL.lineSVG(spec, W, H);
  const pad = { l: 46, r: 12, t: 30, b: 36 };
  const all = spec.series.flatMap(s => s.values);
  const top = Math.max(...all, 1) * 1.1;
  const stepV = spec.max ? spec.max / 4 : [1, 2, 5, 10, 20, 25, 50, 100].find(v => v * 4 >= top) || 100;
  const max = spec.max || stepV * 4;
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const n = spec.labels.length, gw = iw / Math.max(1, n), bw = Math.min(46, (gw * 0.7) / spec.series.length);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:${H}px;font-family:'Baloo 2',sans-serif">`;
  for (let k = 0; k <= 4; k++) {
    const v = Math.round(max * k / 4), y = pad.t + ih - ih * k / 4;
    s += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}" stroke="#E3ECF4"/>`;
    s += `<text x="${pad.l - 8}" y="${y + 4}" font-size="12" fill="#6C88A3" text-anchor="end">${v}</text>`;
  }
  spec.labels.forEach((lb, gi) => {
    const gx = pad.l + gi * gw + gw / 2, tot = bw * spec.series.length;
    spec.series.forEach((se, si) => {
      const v = se.values[gi], h = ih * v / max, x = gx - tot / 2 + si * bw, y = pad.t + ih - h;
      s += `<rect x="${x + 2}" y="${y}" width="${bw - 4}" height="${h}" rx="6" fill="${se.color}"><animate attributeName="height" from="0" to="${h}" dur=".6s"/><animate attributeName="y" from="${pad.t + ih}" to="${y}" dur=".6s"/></rect>`;
      s += `<text x="${x + bw / 2}" y="${y - 5}" font-size="13" font-weight="800" fill="#1F4E79" text-anchor="middle">${v}</text>`;
    });
    s += `<text x="${gx}" y="${H - pad.b + 20}" font-size="14" font-weight="800" fill="#1F4E79" text-anchor="middle">${lb}</text>`;
  });
  s += `<text x="${pad.l}" y="16" font-size="13" font-weight="800" fill="#6C88A3">${spec.yLabel || ''}</text>`;
  let lx = W - pad.r;
  spec.series.slice().reverse().forEach(se => {
    const w = se.name.length * 7 + 26; lx -= w;
    s += `<rect x="${lx}" y="6" width="12" height="12" rx="3" fill="${se.color}"/><text x="${lx + 16}" y="16" font-size="13" font-weight="800" fill="#1F4E79">${se.name}</text>`;
  });
  return s + '</svg>';
};

// Biểu đồ đường: series[].points = [[x, y], ...]
NL.lineSVG = function (spec, W, H) {
  const pad = { l: 50, r: 14, t: 30, b: 40 };
  const pts = spec.series.flatMap(s => s.points);
  const nice = v => [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000].find(k => k * 4 >= v) || Math.ceil(v / 4);
  const xMax = spec.xMax || nice(Math.max(...pts.map(p => p[0]), 1)) * 4, xMin = spec.xMin || 0;
  const yMax = spec.yMax || nice(Math.max(...pts.map(p => p[1]), 0.0001) * 1.1) * 4, yMin = spec.yMin || 0;
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const X = x => pad.l + (x - xMin) / (xMax - xMin) * iw, Y = y => pad.t + ih - (y - yMin) / (yMax - yMin) * ih;
  const fmt = v => Number.isInteger(+v.toFixed(6)) ? Math.round(v) : +v.toFixed(2);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:${H}px;font-family:'Baloo 2',sans-serif">`;
  for (let k = 0; k <= 4; k++) {
    const v = yMin + (yMax - yMin) * k / 4, y = Y(v), xv = xMin + (xMax - xMin) * k / 4;
    s += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}" stroke="#E3ECF4"/>`;
    s += `<text x="${pad.l - 8}" y="${y + 4}" font-size="12" fill="#6C88A3" text-anchor="end">${fmt(v)}</text>`;
    s += `<text x="${X(xv)}" y="${H - pad.b + 18}" font-size="12" fill="#6C88A3" text-anchor="middle">${fmt(xv)}</text>`;
  }
  (spec.marks || []).forEach(m => { s += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${Y(m.y)}" y2="${Y(m.y)}" stroke="${m.color || '#E5534B'}" stroke-dasharray="6 5" stroke-width="2"/><text x="${W - pad.r}" y="${Y(m.y) - 5}" font-size="12" font-weight="800" fill="${m.color || '#E5534B'}" text-anchor="end">${m.label || ''}</text>`; });
  spec.series.forEach(se => {
    if (!se.points.length) return;
    s += `<polyline fill="none" stroke="${se.color}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" points="${se.points.map(p => X(p[0]) + ',' + Y(p[1])).join(' ')}"/>`;
    if (se.points.length <= 24) se.points.forEach(p => { s += `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="4.5" fill="#fff" stroke="${se.color}" stroke-width="3"/>`; });
  });
  s += `<text x="${pad.l}" y="16" font-size="13" font-weight="800" fill="#6C88A3">${spec.yLabel || ''}</text>`;
  s += `<text x="${W - pad.r}" y="${H - 4}" font-size="13" font-weight="800" fill="#6C88A3" text-anchor="end">${spec.xLabel || ''}</text>`;
  let lx = W - pad.r;
  spec.series.slice().reverse().forEach(se => {
    const w = se.name.length * 7 + 26; lx -= w;
    s += `<rect x="${lx}" y="6" width="12" height="12" rx="3" fill="${se.color}"/><text x="${lx + 16}" y="16" font-size="13" font-weight="800" fill="#1F4E79">${se.name}</text>`;
  });
  return s + '</svg>';
};

// Tải bảng số liệu (mở được bằng Excel) và ảnh biểu đồ.
NL.exportData = {
  save(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  },
  fileName(res, ext) { return 'NhaLap-' + String(res.title || 'thi-nghiem').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^\w]+/g, '-') + '.' + ext; },
  csv(res) {
    const cell = v => { const t = String(v).replace(/<[^>]+>/g, ''); return /[",;\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
    const lines = [res.table.head].concat(res.table.rows).map(r => r.map(cell).join(','));
    this.save(new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), this.fileName(res, 'csv'));
  },
  jpg(res) {
    const W = 900, H = 500;
    let svg = NL.chartSVG(res.chart, W, H - 60).replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H - 60}" `).replace(/<animate[^>]*\/>/g, '');
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2;
      const x = c.getContext('2d'); x.scale(2, 2); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
      x.fillStyle = '#1F4E79'; x.font = "800 24px 'Baloo 2', sans-serif"; x.fillText(res.title || '', 20, 36);
      x.drawImage(img, 0, 50, W, H - 60);
      c.toBlob(b => this.save(b, this.fileName(res, 'jpg')), 'image/jpeg', 0.92);
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
};

NL.report = (function () {
  const $ = id => document.getElementById(id);
  let page = 0, pages = 0;

  function avatar(look) {
    const cv = document.createElement('canvas'); cv.width = 90; cv.height = 110;
    const c = cv.getContext('2d'); NL.drawChar(c, 45, 100, look, { t: 0 });
    return cv;
  }

  function open() {
    const g = NL.game, box = $('reportPages');
    box.innerHTML = '';
    const p0 = document.createElement('div'); p0.className = 'rep-page';
    const ready = NL.EXPERIMENTS.filter(e => e.ready), done = ready.filter(e => g.results[e.id]).length;
    p0.innerHTML = `<div class="rep-head"><div id="repAv"></div><div><h3>Báo cáo của ${esc(g.name)}</h3><div class="rep-sub">Nhà Láp · Đã hoàn thành ${done}/${ready.length} thí nghiệm</div><div class="rep-sub">${new Date().toLocaleDateString('vi-VN')}</div></div></div>
      <ul class="rep-list">${ready.map(e => {
        const r = g.results[e.id], ord = g.order.indexOf(e.id);
        return `<li><span class="st ${r ? 'ok' : ''}">${r ? '✓' : ''}</span>Tầng ${e.floor} · ${e.name}${r ? ` <span class="rep-sub">(lần ${ord + 1})</span>` : ''}</li>`;
      }).join('')}<li class="rep-sub">Tầng 3 Hóa, tầng 4 Lý: sắp có</li></ul>`;
    box.appendChild(p0);
    p0.querySelector('#repAv').appendChild(avatar(g.look));
    g.order.forEach(id => {
      const r = g.results[id]; if (!r) return;
      const p = document.createElement('div'); p.className = 'rep-page';
      const tb = `<table><tr>${r.table.head.map(h => `<th>${h}</th>`).join('')}</tr>${r.table.rows.map(row => `<tr>${row.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</table>`;
      p.innerHTML = `<h3>✓ ${r.title}</h3><div class="rep-sub">Thông số em chọn: ${r.param} · ${esc(g.name)}</div>
        <div class="rep-flex"><div>${tb}</div><div style="flex:1;min-width:260px">${NL.chartSVG(r.chart, 420, 200)}</div></div>
        <div style="font-weight:800;color:#1F4E79;margin-top:6px">Kết luận: ${r.conclusion}</div>${r.note ? `<div class="rep-sub">${r.note}</div>` : ''}${quizBlock(r)}
        <div class="rep-dl"><button class="btn small pop" data-csv="${id}">📥 Tải bảng (Excel)</button><button class="btn small pop" data-jpg="${id}">🖼 Lưu ảnh biểu đồ</button></div>`;
      p.querySelector('[data-csv]').onclick = () => NL.exportData.csv(r);
      p.querySelector('[data-jpg]').onclick = () => NL.exportData.jpg(r);
      box.appendChild(p);
    });
    pages = box.children.length; page = 0; go(0);
    $('report').classList.remove('hidden');
  }
  // Câu hỏi cuối thí nghiệm: số câu đúng ngay lần đầu và những câu em chọn sai.
  function quizBlock(r) {
    if (!r.quiz || !r.quiz.length) return '';
    const wrong = r.quiz.filter(x => !x.ok), right = r.quiz.length - wrong.length;
    return `<div class="rep-quiz"><b>Câu hỏi: đúng ngay ${right}/${r.quiz.length} câu</b>${r.predict ? ` · Em đã đoán: "${esc(r.predict)}"` : ''}
      ${wrong.length ? `<ul>${wrong.map(x => `<li>${esc(x.q)}<br><span class="rep-sub">Em chọn: ${esc(x.answer)} → Đáp án: ${esc(x.right)}</span></li>`).join('')}</ul>` : ' 🌟'}</div>`;
  }
  function go(k) {
    page = Math.max(0, Math.min(pages - 1, k));
    $('reportPages').style.transform = `translateX(${-page * 100}%)`;
    $('repDots').innerHTML = Array.from({ length: pages }, (_, i) => `<span class="${i === page ? 'on' : ''}"></span>`).join('');
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])); }

  document.addEventListener('DOMContentLoaded', () => {
    $('reportClose').onclick = () => { NL.audio.play('click'); $('report').classList.add('hidden'); };
    $('repPrev').onclick = () => go(page - 1);
    $('repNext').onclick = () => go(page + 1);
    let sx = null;
    $('reportPages').addEventListener('pointerdown', e => { sx = e.clientX; });
    $('reportPages').addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; if (Math.abs(dx) > 50) go(page + (dx < 0 ? 1 : -1)); sx = null; });
  });
  return { open, esc };
})();
