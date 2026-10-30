// Phần "hiểu bản chất": từ khó chạm vào để xem giải thích, câu dự đoán, câu hỏi vì sao, câu kiểm tra.
window.NL = window.NL || {};
NL.learn = (function () {
  const $ = id => document.getElementById(id);
  const P = (body) => `<svg viewBox="0 0 120 80" width="120" height="80">${body}</svg>`;

  // Mỗi từ: các cách viết sẽ được nhận ra trong câu, một câu giải thích, một hình nhỏ.
  const TERMS = {
    lamkinh: {
      words: ['lam kính'], name: 'Lam kính',
      text: 'Tấm kính mỏng hình chữ nhật để đặt mẫu vật lên khi soi kính hiển vi.',
      pic: P('<rect x="10" y="30" width="100" height="24" rx="3" fill="#DCEFFB" stroke="#8FBBD8" stroke-width="3"/><ellipse cx="60" cy="42" rx="12" ry="6" fill="#BFE4FA"/>')
    },
    lamen: {
      words: ['lamen'], name: 'Lamen',
      text: 'Miếng kính rất mỏng, nhỏ, đậy lên mẫu vật để mẫu phẳng và không khô.',
      pic: P('<rect x="10" y="34" width="100" height="22" rx="3" fill="#DCEFFB" stroke="#8FBBD8" stroke-width="3"/><rect x="40" y="28" width="40" height="30" rx="2" fill="rgba(255,255,255,.7)" stroke="#5BB4EA" stroke-width="3"/>')
    },
    bieubi: {
      words: ['biểu bì'], name: 'Biểu bì',
      text: 'Lớp tế bào mỏng nhất phủ ngoài mặt lá, mỏng đến mức ánh sáng đi qua được nên soi được.',
      pic: P('<path d="M10 50 Q60 10 110 40 Q60 70 10 50Z" fill="#7A3E9D"/><path d="M30 46 Q60 30 90 40" stroke="#E7C6F5" stroke-width="6" fill="none" stroke-linecap="round"/>')
    },
    thailai: {
      words: ['thài lài tía'], name: 'Thài lài tía',
      text: 'Cây cảnh lá tím. Không bào tế bào biểu bì có sắc tố tím nên dễ thấy tế bào co lại.',
      pic: P('<path d="M20 60 Q50 10 100 30 Q60 70 20 60Z" fill="#7A3E9D"/><path d="M20 60 Q55 30 96 31" stroke="#4FA36B" stroke-width="3" fill="none"/>')
    },
    uutruong: {
      words: ['ưu trương'], name: 'Dung dịch ưu trương',
      text: 'Dung dịch có nồng độ chất tan cao hơn dịch tế bào. Nước sẽ đi từ tế bào ra ngoài.',
      pic: P('<rect x="35" y="15" width="50" height="50" rx="8" fill="#F3E3F9" stroke="#9B4FC4" stroke-width="3"/><ellipse cx="60" cy="40" rx="12" ry="10" fill="#9B4FC4"/><path d="M90 40 h20 M104 34 l6 6 -6 6" stroke="#5BB4EA" stroke-width="4" fill="none"/><text x="8" y="20" font-size="14">🧂🧂</text>')
    },
    nhuoctruong: {
      words: ['nhược trương'], name: 'Dung dịch nhược trương',
      text: 'Dung dịch có nồng độ chất tan thấp hơn dịch tế bào. Nước sẽ đi vào tế bào.',
      pic: P('<rect x="35" y="15" width="50" height="50" rx="8" fill="#F3E3F9" stroke="#9B4FC4" stroke-width="3"/><ellipse cx="60" cy="40" rx="22" ry="22" fill="#9B4FC4"/><path d="M110 40 h-20 M96 34 l-6 6 6 6" stroke="#5BB4EA" stroke-width="4" fill="none"/>')
    },
    dangtruong: {
      words: ['đẳng trương'], name: 'Dung dịch đẳng trương',
      text: 'Dung dịch có nồng độ chất tan bằng dịch tế bào. Nước ra vào cân bằng, tế bào giữ nguyên. Đẳng trương hay không tùy loại tế bào: NaCl 0,9% đẳng trương với tế bào người, chưa chắc với tế bào thực vật.',
      pic: P('<rect x="35" y="15" width="50" height="50" rx="8" fill="#F3E3F9" stroke="#9B4FC4" stroke-width="3"/><ellipse cx="60" cy="40" rx="20" ry="20" fill="#9B4FC4"/><text x="92" y="46" font-size="18" fill="#5BB4EA">⇄</text>')
    },
    conguyensinh: {
      words: ['co nguyên sinh'], name: 'Co nguyên sinh',
      text: 'Tế bào mất nước, khối chất nguyên sinh co lại và tách khỏi thành tế bào.',
      pic: P('<rect x="30" y="14" width="60" height="52" rx="8" fill="#F3E3F9" stroke="#9B4FC4" stroke-width="3"/><ellipse cx="60" cy="40" rx="14" ry="12" fill="#9B4FC4"/>')
    },
    phanco: {
      words: ['phản co'], name: 'Phản co nguyên sinh',
      text: 'Tế bào đã co được cho vào nước cất, nước đi vào lại và tế bào trở về như cũ.',
      pic: P('<rect x="30" y="14" width="60" height="52" rx="8" fill="#F3E3F9" stroke="#9B4FC4" stroke-width="3"/><rect x="36" y="20" width="48" height="40" rx="6" fill="#9B4FC4"/>')
    },
    quanghop: {
      words: ['quang hợp'], name: 'Quang hợp',
      text: 'Cây dùng năng lượng ánh sáng biến CO₂ và nước thành chất hữu cơ, đồng thời thải ra khí O₂.',
      pic: P('<circle cx="22" cy="20" r="12" fill="#FFD54A"/><path d="M60 70 Q58 40 62 20" stroke="#2E8B57" stroke-width="5" fill="none"/><ellipse cx="74" cy="34" rx="14" ry="5" fill="#58C08A"/><ellipse cx="50" cy="46" rx="14" ry="5" fill="#58C08A"/><text x="86" y="22" font-size="13" font-weight="800" fill="#2F80C0">O₂</text>')
    },
    o2: {
      words: ['O₂', 'khí oxi'], name: 'Khí O₂ (oxygen)',
      text: 'Khí do cây thải ra khi quang hợp. Bọt khí nổi lên từ cành rong chủ yếu là O₂.',
      pic: P('<circle cx="40" cy="50" r="10" fill="#fff" stroke="#7FB9DC" stroke-width="3"/><circle cx="62" cy="34" r="7" fill="#fff" stroke="#7FB9DC" stroke-width="3"/><circle cx="78" cy="18" r="5" fill="#fff" stroke="#7FB9DC" stroke-width="3"/><text x="86" y="60" font-size="16" font-weight="800" fill="#2F80C0">O₂</text>')
    },
    kimmac: {
      words: ['kim mũi mác'], name: 'Kim mũi mác',
      text: 'Kim có đầu dẹt và nhọn như mũi giáo, dùng để bóc lớp biểu bì mỏng của lá.',
      pic: P('<rect x="10" y="36" width="60" height="8" rx="4" fill="#C99A6B"/><path d="M70 34 L110 40 L70 46Z" fill="#9AA9B7"/>')
    },
    thangchuan: {
      words: ['thang chuẩn'], name: 'Thang chuẩn (thang DNA)',
      text: 'Hỗn hợp các đoạn DNA đã biết trước kích thước. Chạy cạnh mẫu để so, giống cây thước đo chiều dài DNA.', pic: ''
    },
    gieng: {
      words: ['giếng'], name: 'Giếng',
      text: 'Lỗ nhỏ đúc sẵn ở đầu bản gel, nơi bơm mẫu DNA vào. Giếng L dành cho thang chuẩn.', pic: ''
    },
    bp: {
      words: ['bp', 'cặp base'], name: 'bp (cặp base)',
      text: 'Đơn vị đo chiều dài DNA: 1 bp là một cặp nucleotide bắt cặp với nhau. Đoạn 1000 bp dài gấp 10 lần đoạn 100 bp.', pic: ''
    },
    pipette: {
      words: ['pipette'], name: 'Pipette',
      text: 'Ống hút nhỏ để lấy và bơm một lượng dung dịch rất ít, cỡ vài giọt.', pic: ''
    },
    diendi: {
      words: ['điện di'], name: 'Điện di',
      text: 'Dùng dòng điện kéo DNA chạy qua bản gel. Đoạn ngắn luồn qua lỗ gel nhanh nên đi xa hơn đoạn dài.', pic: ''
    },
    enzyme: {
      words: ['enzyme'], name: 'Enzyme',
      text: 'Chất xúc tác sinh học (thường là protein) giúp phản ứng trong cơ thể xảy ra nhanh hơn rất nhiều.', pic: ''
    },
    amylase: {
      words: ['amylase'], name: 'Amylase',
      text: 'Enzyme có trong nước bọt, cắt tinh bột thành đường. Vì thế nhai cơm lâu thấy ngọt.', pic: ''
    },
    lugol: {
      words: ['lugol'], name: 'Thuốc thử Lugol',
      text: 'Dung dịch iodine. Gặp tinh bột thì chuyển màu xanh tím, hết tinh bột thì giữ màu vàng nâu.', pic: ''
    },
    allele: {
      words: ['allele', 'alen'], name: 'Allele (alen)',
      text: 'Các phiên bản khác nhau của cùng một gene, ví dụ A và a.', pic: ''
    },
    tamthu: {
      words: ['tâm thu'], name: 'Huyết áp tâm thu',
      text: 'Số trên của huyết áp: áp lực máu khi tim co bóp đẩy máu đi.', pic: ''
    },
    tamtruong: {
      words: ['tâm trương'], name: 'Huyết áp tâm trương',
      text: 'Số dưới của huyết áp: áp lực máu khi tim giãn ra nghỉ giữa hai nhịp.', pic: ''
    },
    kytg: {
      words: ['kỳ trung gian'], name: 'Kỳ trung gian',
      text: 'Giai đoạn tế bào lớn lên và nhân đôi DNA, trước khi bước vào nguyên phân. Đây là phần dài nhất của chu kỳ tế bào.', pic: ''
    },
    nguyenphan: {
      words: ['nguyên phân'], name: 'Nguyên phân',
      text: 'Cách tế bào chia một thành hai tế bào con giống hệt nhau, gồm kỳ đầu, giữa, sau, cuối.', pic: ''
    },
    giaytham: {
      words: ['giấy thấm'], name: 'Giấy thấm',
      text: 'Đặt ở mép bên kia lamen để hút nước, kéo dung dịch vừa nhỏ chảy qua mẫu vật.',
      pic: P('<rect x="30" y="20" width="60" height="40" rx="4" fill="#FFF7E0" stroke="#E2C779" stroke-width="3"/><path d="M40 32 h40 M40 42 h40 M40 52 h30" stroke="#F2DCA0" stroke-width="3"/>')
    }
  };
  const ORDER = Object.keys(TERMS).flatMap(k => TERMS[k].words.map(w => [w, k])).sort((a, b) => b[0].length - a[0].length);

  function esc(s) { return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])); }
  // Biến chữ thường thành HTML, từ khó thành nút chạm được.
  function decorate(text) {
    let html = esc(text);
    const marks = [];
    ORDER.forEach(([w, k]) => {
      const re = new RegExp('(?<![\\p{L}\\d])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\p{L}\\d])', 'giu');
      html = html.replace(re, m => { marks.push(`<button class="term" data-term="${k}">${m}</button>`); return `\u0001${marks.length - 1}\u0002`; });
    });
    return html.replace(/\u0001(\d+)\u0002/g, (_, n) => marks[n]);
  }
  function bindTerms(root) {
    root.querySelectorAll('.term').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); showTerm(b.dataset.term); }));
  }
  function showTerm(k) {
    const t = TERMS[k]; if (!t) return;
    NL.audio.play('pop');
    let pop = $('termPop');
    if (!pop) { pop = document.createElement('div'); pop.id = 'termPop'; pop.className = 'term-pop'; document.body.appendChild(pop); pop.addEventListener('click', () => pop.classList.add('hidden')); }
    pop.innerHTML = `<div class="term-box">${t.pic || ''}<div><b>${t.name}</b><p>${t.text}</p></div><span class="term-x">✕</span></div>`;
    pop.classList.remove('hidden');
  }

  // Một câu hỏi trắc nghiệm hiện đè lên bàn thí nghiệm.
  // opt: { q, options: [{ t, ok, why }], predict, explain, kicker } ; cb({ chosen, firstTry })
  function ask(opt, cb) {
    const box = document.createElement('div'); box.className = 'quiz' + (opt.dock ? ' dock' : '');
    const kick = opt.kicker || (opt.predict ? '🤔 Em đoán xem' : '❓ Câu hỏi');
    box.innerHTML = `<div class="quiz-card"><div class="quiz-kick">${kick}</div><div class="quiz-q">${decorate(opt.q)}</div>
      <div class="quiz-opts">${opt.options.map((o, i) => `<button class="quiz-opt pop" data-i="${i}">${esc(o.t)}</button>`).join('')}</div>
      <div class="quiz-fb hidden"></div><button class="btn pop quiz-next hidden">Tiếp ➜</button></div>`;
    (opt.parent || $('lab')).appendChild(box); bindTerms(box);
    let wrongOnce = false, firstChoice = null;
    const fb = box.querySelector('.quiz-fb'), next = box.querySelector('.quiz-next');
    box.querySelectorAll('.quiz-opt').forEach(b => b.addEventListener('click', e => {
      if (e.target.classList.contains('term')) return;
      const i = +b.dataset.i, o = opt.options[i];
      if (firstChoice === null) firstChoice = i;
      if (opt.predict) {
        box.querySelectorAll('.quiz-opt').forEach(x => { x.disabled = true; x.classList.toggle('picked', x === b); });
        fb.innerHTML = '📝 Đã ghi lại dự đoán của em. Làm xong mình so với kết quả nhé!'; fb.className = 'quiz-fb note';
        NL.audio.play('pop'); next.classList.remove('hidden'); return;
      }
      if (!o.ok) {
        wrongOnce = true; b.disabled = true; b.classList.add('wrong');
        fb.innerHTML = '💡 ' + decorate(o.why || 'Chưa đúng, em thử nghĩ lại nhé'); fb.className = 'quiz-fb warn'; bindTerms(fb);
        NL.audio.play('click'); return;
      }
      box.querySelectorAll('.quiz-opt').forEach(x => { x.disabled = true; });
      b.classList.add('right');
      fb.innerHTML = '✅ ' + decorate(opt.explain || 'Chính xác!'); fb.className = 'quiz-fb ok'; bindTerms(fb);
      NL.audio.play('ting'); next.classList.remove('hidden');
    }));
    next.addEventListener('click', () => {
      NL.audio.play('click'); box.remove();
      cb({ chosen: firstChoice, firstTry: !wrongOnce, answer: opt.options[firstChoice].t, right: (opt.options.find(o => o.ok) || {}).t });
    });
  }
  // Một thẻ thông tin có một nút (mở đầu thí nghiệm, so sánh với dự đoán).
  function card(opt, cb) {
    const box = document.createElement('div'); box.className = 'quiz';
    box.innerHTML = `<div class="quiz-card"><div class="quiz-kick">${opt.kicker}</div>${opt.lead ? `<div class="quiz-lead">${decorate(opt.lead)}</div>` : ''}<div class="quiz-q">${decorate(opt.text)}</div>${opt.sub ? `<div class="quiz-sub">${decorate(opt.sub)}</div>` : ''}<button class="btn big pop quiz-next">${opt.btn || 'Tiếp ➜'}</button></div>`;
    (opt.parent || $('lab')).appendChild(box); bindTerms(box);
    box.querySelector('.quiz-next').addEventListener('click', () => { NL.audio.play('click'); box.remove(); cb && cb(); });
  }
  // Rút n câu ngẫu nhiên trong ngân hàng câu hỏi của một thí nghiệm, đảo thứ tự đáp án.
  function bank(id, n) {
    const all = (NL.QUIZ && NL.QUIZ[id]) || [];
    const pick = all.map(q => [Math.random(), q]).sort((a, b) => a[0] - b[0]).slice(0, n).map(x => x[1]);
    return pick.map(q => {
      const opts = q.o.map((t, i) => ({ t, ok: i === q.a })).map(o => [Math.random(), o]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
      opts.forEach(o => { if (!o.ok) o.why = q.h ? 'Chưa đúng. ' + q.h : 'Chưa đúng. Em nhớ lại điều vừa quan sát trong thí nghiệm rồi chọn lại nhé'; });
      return { q: q.q, options: opts, explain: q.e ? 'Chính xác! ' + q.e : 'Chính xác!' };
    });
  }
  function closeAll() { document.querySelectorAll('#lab .quiz').forEach(b => b.remove()); const p = $('termPop'); if (p) p.classList.add('hidden'); }

  return { TERMS, decorate, bindTerms, showTerm, ask, card, bank, closeAll, esc, get busy() { return !!document.querySelector('#lab .quiz'); } };
})();
