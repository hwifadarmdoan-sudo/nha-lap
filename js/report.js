// Biểu đồ cột (SVG) và bảng báo cáo vuốt từng trang.
window.NL = window.NL || {};
NL.chartSVG = function (spec, W, H) {
  if (spec.type === 'line') return NL.lineSVG(spec, W, H);
  if (spec.type === 'pie') return NL.pieSVG(spec, W, H);
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

// Biểu đồ hình quạt: { labels, values, colors, title }
NL.pieSVG = function (spec, W, H) {
  const tot = spec.values.reduce((a, b) => a + b, 0) || 1, cx = H / 2 + 10, cy = H / 2 + 6, r = H / 2 - 22;
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-height:${H}px;font-family:'Baloo 2',sans-serif">`, a0 = -Math.PI / 2;
  spec.values.forEach((v, k) => {
    const a1 = a0 + 2 * Math.PI * v / tot, big = a1 - a0 > Math.PI ? 1 : 0, col = spec.colors[k % spec.colors.length];
    if (v / tot > 0.9995) s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>`;
    else if (v > 0) s += `<path d="M${cx} ${cy} L${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A${r} ${r} 0 ${big} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z" fill="${col}" stroke="#fff" stroke-width="2"/>`;
    const am = (a0 + a1) / 2;
    if (v / tot > 0.045) s += `<text x="${cx + r * 0.66 * Math.cos(am)}" y="${cy + r * 0.66 * Math.sin(am) + 5}" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">${Math.round(v / tot * 100)}%</text>`;
    a0 = a1;
  });
  const lx = cx + r + 30, n = spec.labels.length, step = Math.min(26, (H - 20) / n);
  spec.labels.forEach((lb, k) => {
    const y = H / 2 - (n - 1) * step / 2 + k * step;
    s += `<rect x="${lx}" y="${y - 7}" width="14" height="14" rx="3" fill="${spec.colors[k % spec.colors.length]}"/><text x="${lx + 20}" y="${y + 5}" font-size="14" font-weight="700" fill="#1F4E79">${lb} · ${+(spec.values[k] / tot * 100).toFixed(1)}%</text>`;
  });
  if (spec.title) s += `<text x="8" y="16" font-size="13" font-weight="800" fill="#6C88A3">${spec.title}</text>`;
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

// Nén zip kiểu lưu thẳng (không nén), đủ cho tệp .xlsx. files: [[tên, chuỗi]]
NL.zipStore = function (files) {
  const enc = new TextEncoder(), T = NL.zipStore.crcT || (NL.zipStore.crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })());
  const crc = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = T[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const parts = [], central = []; let off = 0;
  files.forEach(([name, text]) => {
    const nb = enc.encode(name), db = enc.encode(text), cr = crc(db);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint32(14, cr, true); h.setUint32(18, db.length, true); h.setUint32(22, db.length, true); h.setUint16(26, nb.length, true);
    parts.push(new Uint8Array(h.buffer), nb, db);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true);
    c.setUint32(16, cr, true); c.setUint32(20, db.length, true); c.setUint32(24, db.length, true); c.setUint16(28, nb.length, true); c.setUint32(42, off, true);
    central.push(new Uint8Array(c.buffer), nb);
    off += 30 + nb.length + db.length;
  });
  const csize = central.reduce((a, b) => a + b.length, 0), e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csize, true); e.setUint32(16, off, true);
  const all = parts.concat(central, [new Uint8Array(e.buffer)]), out = new Uint8Array(all.reduce((a, b) => a + b.length, 0));
  let p = 0; all.forEach(b => { out.set(b, p); p += b.length; });
  return out;
};

// Tải bảng số liệu (.xlsx mở bằng Excel) và ảnh biểu đồ.
NL.exportData = {
  save(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  },
  fileName(res, ext) { return 'NhaLap-' + String(res.title || 'thi-nghiem').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^\w]+/g, '-') + '.' + ext; },
  // Tệp .xlsx thật (zip không nén). sheets: [{ name, head, rows }]
  xlsx(res) {
    const sheets = res.sheets || [{ name: 'Số liệu', head: res.table.head, rows: res.table.rows }];
    const esc = v => String(v).replace(/<[^>]+>/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const col = n => { let s = ''; n++; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = (n - m - 1) / 26; } return s; };
    const cell = (v, r, c, st) => {
      const ref = col(c) + (r + 1);
      if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}"${st ? ' s="1"' : ''}><v>${v}</v></c>`;
      const t = String(v == null ? '' : v).replace(/<[^>]+>/g, '');
      if (/^-?\d+([.,]\d+)?$/.test(t.trim()) && t.trim().length < 15) return `<c r="${ref}"${st ? ' s="1"' : ''}><v>${t.trim().replace(',', '.')}</v></c>`;
      return `<c r="${ref}" t="inlineStr"${st ? ' s="1"' : ''}><is><t xml:space="preserve">${esc(t)}</t></is></c>`;
    };
    const sheetXml = sh => {
      const all = [sh.head].concat(sh.rows);
      const widths = sh.head.map((_, c) => Math.min(60, Math.max(8, ...all.map(r => String(r[c] == null ? '' : r[c]).replace(/<[^>]+>/g, '').length + 2))));
      return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>' +
        widths.map((w, c) => `<col min="${c + 1}" max="${c + 1}" width="${w}" customWidth="1"/>`).join('') + '</cols><sheetData>' +
        all.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => cell(v, ri, ci, ri === 0)).join('')}</row>`).join('') + '</sheetData></worksheet>';
    };
    const names = sheets.map((sh, k) => esc(String(sh.name || 'Sheet' + (k + 1)).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31)));
    const files = [
      ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + sheets.map((_, k) => `<Override PartName="/xl/worksheets/sheet${k + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') + '</Types>'],
      ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + names.map((n, k) => `<sheet name="${n}" sheetId="${k + 1}" r:id="rId${k + 1}"/>`).join('') + '</sheets></workbook>'],
      ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map((_, k) => `<Relationship Id="rId${k + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${k + 1}.xml"/>`).join('') + `<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
      ['xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2F80C0"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>']
    ].concat(sheets.map((sh, k) => ['xl/worksheets/sheet' + (k + 1) + '.xml', sheetXml(sh)]));
    this.save(new Blob([NL.zipStore(files)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), this.fileName(res, 'xlsx'));
  },
  csv(res) { this.xlsx(res); },
  jpg(res) { this.svgJpg(NL.chartSVG(res.chart, 900, 440), res); },
  // Vẽ SVG biểu đồ lên canvas rồi lưu .jpg. Thẻ <svg> phải là XML hợp lệ: bỏ width/height/style cũ (trùng thuộc tính làm ảnh không tải được).
  svgJpg(svg, res) {
    const W = 900, H = 500;
    svg = svg.replace(/<animate[^>]*\/>/g, '').replace(/&nbsp;/g, '&#160;')
      .replace(/<svg([^>]*)>/, (m, at) => '<svg xmlns="http://www.w3.org/2000/svg"' + at.replace(/\s(xmlns|width|height|style)="[^"]*"/g, '') + ` width="${W}" height="${H - 60}" font-family="Baloo 2, sans-serif">`);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2;
      const x = c.getContext('2d'); x.scale(2, 2); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
      x.fillStyle = '#1F4E79'; x.font = "800 24px 'Baloo 2', sans-serif"; x.fillText(res.title || '', 20, 36);
      x.drawImage(img, 0, 50, W, H - 60);
      c.toBlob(b => this.save(b, this.fileName(res, 'jpg')), 'image/jpeg', 0.92);
      NL.helpers && NL.helpers.toast && NL.helpers.toast('Đã lưu ảnh biểu đồ 🖼');
    };
    img.onerror = () => { NL.helpers && NL.helpers.toast && NL.helpers.toast('Chưa lưu được ảnh, em thử lại nhé'); };
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
      }).join('')}<li class="rep-sub">Tầng 2 Lý, tầng 3 Hóa: sắp có</li></ul>`;
    box.appendChild(p0);
    p0.querySelector('#repAv').appendChild(avatar(g.look));
    g.order.forEach(id => {
      const r = g.results[id]; if (!r) return;
      const p = document.createElement('div'); p.className = 'rep-page';
      const tb = `<table><tr>${r.table.head.map(h => `<th>${h}</th>`).join('')}</tr>${r.table.rows.map(row => `<tr>${row.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</table>`;
      p.innerHTML = `<h3>✓ ${r.title}</h3><div class="rep-sub">Thông số em chọn: ${r.param} · ${esc(g.name)}</div>
        <div class="rep-flex"><div>${tb}</div><div style="flex:1;min-width:260px">${NL.chartSVG(r.chart, 420, 200)}</div></div>
        <div style="font-weight:800;color:#1F4E79;margin-top:6px">Kết luận: ${r.conclusion}</div>${r.note ? `<div class="rep-sub">${r.note}</div>` : ''}${quizBlock(r)}
        <div class="rep-dl"><button class="btn small pop" data-csv="${id}">📥 Tải file Excel</button><button class="btn small pop" data-jpg="${id}">🖼 Lưu ảnh biểu đồ</button></div>`;
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
