// Biểu đồ cột (SVG) và bảng báo cáo vuốt từng trang.
window.NL = window.NL || {};
NL.chartSVG = function (spec, W, H) {
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
        <div style="font-weight:800;color:#1F4E79;margin-top:6px">Kết luận: ${r.conclusion}</div>${r.note ? `<div class="rep-sub">${r.note}</div>` : ''}${quizBlock(r)}`;
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
