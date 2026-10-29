// Thí nghiệm 2C: nhiệt độ ảnh hưởng tới hoạt tính enzyme amylase (thử tinh bột bằng Lugol).
(function () {
  const A = NL.art;
  // 9 mức màu Lugol: 1 = còn nguyên tinh bột (xanh tím đậm) … 9 = hết tinh bột (vàng nâu trong)
  const COLORS = ['#1B1F6B', '#2E2A86', '#4B2C8F', '#7E5BB0', '#7A4E6E', '#B07A6E', '#C89A5A', '#D9A631', '#EAD9A0'];
  const STATE = l => l <= 2 ? 'Còn nguyên tinh bột' : l <= 5 ? 'Thủy phân một phần' : l <= 8 ? 'Gần hết tinh bột' : 'Đã thủy phân hết';
  const SAMPLES = 4, EVERY = 30, SPEED = 12; // lấy mẫu mỗi 30 giây, đồng hồ chạy nhanh 12 lần
  const STARCH = 'rgba(240,240,232,.9)', ENZ = 'rgba(255,236,170,.85)', MIX = 'rgba(245,240,215,.9)';
  let st;

  // hoạt tính tương đối: cao nhất quanh 37 °C, trên khoảng 65 °C enzyme bị biến tính
  function activity(T) {
    if (T >= 65) return 0;
    const w = T <= 37 ? 14 : 11;
    return Math.exp(-Math.pow((T - 37) / w, 2));
  }
  function level(T, t) {
    const S = Math.exp(-0.0326 * activity(T) * t); // phần tinh bột còn lại
    return Math.max(1, Math.min(9, 1 + Math.round(8 * (1 - S))));
  }

  function build(api) {
    const L = api.svg, el = api.el;
    st = { T: 37, runs: [], run: null, done: false };
    // lọ hoá chất
    st.bStarch = A.bottle(api, L, 80, 452, 'Tinh bột 1%', STARCH);
    st.bEnz = A.bottle(api, L, 170, 452, 'Amylase', ENZ);
    // bồn điều nhiệt
    const bath = api.g(L, 0, 0);
    el('rect', { x: 460, y: 300, width: 210, height: 160, rx: 16, fill: '#DCE7F1', stroke: '#9FB4C8', 'stroke-width': 4 }, bath);
    st.water = el('rect', { x: 472, y: 330, width: 186, height: 118, rx: 10, fill: 'rgba(130,195,240,.55)' }, bath);
    st.steam = api.g(bath, 0, 0); st.steam.style.opacity = 0;
    [500, 565, 630].forEach(x => el('path', { d: `M${x} 300 q-10 -18 0 -34 q10 -16 0 -32`, stroke: 'rgba(160,180,200,.7)', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, st.steam));
    st.ice = api.g(bath, 0, 0); st.ice.style.opacity = 0;
    [[490, 340], [615, 344], [640, 336]].forEach(([x, y]) => el('rect', { x, y, width: 18, height: 16, rx: 4, fill: 'rgba(255,255,255,.85)', stroke: '#B8D8F0', 'stroke-width': 2 }, st.ice));
    // giá ống nghiệm
    const rack = api.g(L, 0, 0);
    el('rect', { x: 318, y: 430, width: 110, height: 26, rx: 6, fill: '#C99A6B' }, rack);
    st.t1 = A.tube(api, L, 345, 438, { label: 'Ống 1' });
    st.t2 = A.tube(api, L, 400, 438, { label: 'Ống 2' });
    const led = api.g(L, 565, 0);
    el('rect', { x: -58, y: 470, width: 116, height: 40, rx: 8, fill: '#1E2A36' }, led);
    st.led = api.text(led, 0, 499, '--°C', 24, '#59F28A', 800);
    api.text(L, 565, 528, 'Bồn điều nhiệt', 15, '#6C88A3', 700);
    // pipette hút mẫu
    st.p1 = A.pipette(api, L, 250, 440, { bulb: '#E5534B' });
    st.p2 = A.pipette(api, L, 285, 440, { bulb: '#2F80C0' });
    // đĩa sứ và Lugol
    const plate = api.g(L, 0, 0);
    el('rect', { x: 40, y: 466, width: 250, height: 88, rx: 14, fill: '#FFFFFF', stroke: '#D5DEE8', 'stroke-width': 3 }, plate);
    st.wells = [];
    for (let r = 0; r < 3; r++) {
      st.wells.push([]);
      for (let c = 0; c < SAMPLES; c++) st.wells[r].push(el('circle', { cx: 112 + c * 46, cy: 485 + r * 26, r: 10, fill: '#F1F4F7', stroke: '#D5DEE8', 'stroke-width': 2 }, plate));
    }
    st.rowLab = [0, 1, 2].map(r => api.text(plate, 66, 490 + r * 26, '', 13, '#6C88A3', 800));
    st.lugol = A.dropper(api, L, 395, 520, 'Lugol', '#C8892C');
  }

  function setTemp(T) {
    st.T = T;
    st.led.textContent = T + '°C';
    const k = T / 100;
    st.water.setAttribute('fill', `rgba(${Math.round(110 + 135 * k)},${Math.round(185 - 45 * k)},${Math.round(240 - 140 * k)},.6)`);
    st.steam.style.opacity = T >= 70 ? Math.min(1, (T - 60) / 30) : 0;
    st.ice.style.opacity = T <= 5 ? 1 : 0;
  }

  function scaleCard(api) {
    if (st.scale && st.scale.isConnected) return;
    st.scale = api.panel(`<div>Thang màu Lugol</div><div class="lugol-scale">${COLORS.map((c, i) => `<span style="background:${c}">${i + 1}</span>`).join('')}</div><div class="rep-sub" style="font-size:13px">1 còn tinh bột → 9 hết tinh bột</div>`);
  }
  function rowsAll() {
    return st.runs.flatMap(r => r.samples.map(s => [r.T + '°C', s.t + ' s', 'Mức ' + s.l, STATE(s.l)]));
  }
  function showTable(api) {
    if (!st.tbl || !st.tbl.card.isConnected) st.tbl = api.table(['Nhiệt độ', 'Thời gian', 'Màu', 'Tinh bột']);
    st.tbl.set(rowsAll());
  }

  // kéo pipette: hút ở from rồi nhả ở to
  function pipetteMove(api, pip, from, color, to, after) {
    api.setOn(pip, true);
    api.draggable(pip, {
      target: from, onDrop: () => {
        pip.fill(color); NL.audio.play('bubble');
        api.tween(pip, pip._x, pip._y - 60, 200, () => {
          api.setOn(pip, true);
          api.draggable(pip, { target: to, onDrop: () => { pip.empty(); after(); } });
        });
      }
    });
  }

  const steps = [
    {
      label: 'Chuẩn bị 1/3', text: 'Dùng pipette đỏ hút tinh bột, nhỏ vào ống 1', hint: 'Kéo pipette đỏ vào lọ tinh bột, rồi kéo sang ống 1',
      enter(api) {
        scaleCard(api);
        pipetteMove(api, st.p1, { x: 80, y: 360, r: 70, sx: 80, sy: 370 }, STARCH, { x: 345, y: 300, r: 70, sx: 345, sy: 290 }, () => {
          st.t1.fill(STARCH, 0.45); api.tween(st.p1, 250, 440, 300); api.done();
        });
      }
    },
    {
      label: 'Chuẩn bị 2/3', text: 'Dùng pipette xanh hút enzyme amylase, nhỏ vào ống 2', hint: 'Kéo pipette xanh vào lọ Amylase, rồi kéo sang ống 2',
      enter(api) {
        scaleCard(api);
        pipetteMove(api, st.p2, { x: 170, y: 360, r: 70, sx: 170, sy: 370 }, ENZ, { x: 400, y: 300, r: 70, sx: 400, sy: 290 }, () => {
          st.t2.fill(ENZ, 0.3); api.tween(st.p2, 285, 440, 300); api.done();
        });
      }
    },
    {
      label: 'Chuẩn bị 3/3', text: 'Đặt cả hai ống vào bồn điều nhiệt', hint: 'Kéo ống 1 rồi ống 2 thả vào bồn nước',
      enter(api) {
        scaleCard(api);
        api.setOn(st.t1, true);
        api.draggable(st.t1, {
          target: { x: 525, y: 430, r: 110, sx: 525, sy: 432 }, onDrop: () => {
            api.setOn(st.t2, true);
            api.draggable(st.t2, { target: { x: 605, y: 430, r: 110, sx: 605, sy: 432 }, onDrop: () => api.done() });
          }
        });
      }
    },
    {
      label: () => `Lần đo ${st.runs.length + 1}/3 · Chọn nhiệt độ`,
      text: 'Cài nhiệt độ cho bồn điều nhiệt', hint: 'Kéo thanh hoặc gõ số. Gợi ý: thử 0, 37 và 100 °C',
      enter(api) {
        scaleCard(api); showTable(api);
        if (!st.runs.length && !api.prediction) api.ask({
          predict: true, q: 'Ở nhiệt độ nào tinh bột bị enzyme phân giải nhanh nhất?',
          options: [{ t: '0°C' }, { t: '37°C' }, { t: '100°C' }]
        });
        api.slider({
          label: 'Nhiệt độ bồn', min: 0, max: 100, value: st.runs.length ? (st.T > 50 ? 0 : 100) : 37, unit: '°C',
          onInput(v, ctl) {
            setTemp(v);
            const dup = st.runs.some(r => Math.abs(r.T - v) < 10);
            ctl.warn(dup ? 'Chọn nhiệt độ cách lần trước ít nhất 10 °C nhé' : '');
            if (dup) api.hideNext(); else api.done('Ủ nhiệt ➜');
          }
        });
      },
      onNext(api) { api.goto(4); }
    },
    {
      label: () => `Lần đo ${st.runs.length + 1}/3 · ${st.T}°C`,
      text: 'Đang ủ cho hai ống bằng nhiệt độ bồn…', hint: 'Đợi một chút, rồi bấm Trộn dung dịch',
      enter(api) {
        scaleCard(api); showTable(api);
        api.wait(1.6, () => { api.say(`Hai ống đã ở ${st.T}°C. Đổ enzyme sang ống tinh bột`); api.done('Trộn dung dịch ➜'); });
      },
      onNext(api) { mix(api); }
    },
    {
      label: () => `Lần đo ${st.runs.length}/3 · xong`,
      text: '', hint: 'Bấm nút ở góc dưới để đi tiếp',
      enter(api) {
        scaleCard(api); showTable(api);
        const need = 3 - st.runs.length, last = st.runs[st.runs.length - 1];
        api.say(`Ở ${last.T}°C, sau 2 phút màu đạt mức ${last.samples[SAMPLES - 1].l}. ` + (need > 0 ? `Đo thêm ${need} nhiệt độ nữa` : 'Đủ 3 nhiệt độ rồi!'));
        api.done(need > 0 ? 'Đo nhiệt độ khác ➜' : 'Xem đồ thị ➜');
      },
      onNext(api) {
        if (st.runs.length < 3) { reset(api); api.goto(3); } else api.goto(6);
      }
    },
    {
      label: 'Kết quả', text: 'Đồ thị mức màu Lugol theo thời gian ở từng nhiệt độ', hint: 'Đường đi lên nhanh: tinh bột bị phân giải nhanh',
      enter(api) {
        api.showChart(result());
        api.done('Trả lời câu hỏi ➜');
      },
      onNext(api) {
        api.wrapUp({
          right: '37°C', truth: 'ở khoảng 37°C màu chuyển sang vàng nâu nhanh nhất, tức tinh bột bị phân giải nhanh nhất.',
          sub: 'Ở 0°C enzyme hoạt động rất chậm. Ở 100°C enzyme bị biến tính nên tinh bột còn nguyên.',
          quiz: QUIZ, bank: 4, result: result()
        });
      }
    }
  ];

  function mix(api) {
    api.hideNext();
    const t2 = st.t2;
    api.tween(t2, 666, 219, 400, () => {
      t2._extra = ' rotate(-110)'; api.place(t2); NL.audio.play('bubble');
      api.wait(0.5, () => {
        t2.fill(ENZ, 0); st.t1.fill(MIX, 0.6);
        t2._extra = ''; api.tween(t2, 605, 432, 400);
        st.run = { T: st.T, samples: [] }; st.runs.push(st.run);
        st.rowLab[st.runs.length - 1].textContent = st.T + '°';
        clock(api);
      });
    });
  }

  // đồng hồ chạy, cứ 30 giây dừng lại nhắc lấy mẫu
  function clock(api) {
    const card = api.panel(`<div>⏱ Thời gian</div><div class="big-num" id="ezClock">0:00</div>`);
    const out = card.querySelector('#ezClock');
    let t = 0, nextAt = EVERY;
    const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
    api.say('Đồng hồ đang chạy. Cứ 30 giây lấy mẫu một lần');
    const run = () => api.loop(dt => {
      t = Math.min(nextAt, t + dt * SPEED); out.textContent = fmt(t);
      if (t >= nextAt) {
        NL.audio.play('ting');
        api.card({ kicker: '⏰ Đến giờ lấy mẫu', text: `Đã ${fmt(t)}! Hãy dùng pipette lấy một giọt hỗn hợp nhỏ lên đĩa sứ`, btn: 'Lấy mẫu ➜' }, () => sample(api, t, () => {
          nextAt += EVERY;
          if (st.run.samples.length >= SAMPLES) { card.remove(); api.goto(5); } else run();
        }));
        return false;
      }
    });
    run();
  }

  function sample(api, t, next) {
    const r = st.runs.length - 1, c = st.run.samples.length, w = st.wells[r][c];
    const wx = +w.getAttribute('cx'), wy = +w.getAttribute('cy');
    api.say(`Lấy mẫu lần ${c + 1}: kéo pipette đỏ vào ống 1, rồi nhỏ vào ô trên đĩa sứ`);
    w.setAttribute('stroke', '#F2C94C'); w.setAttribute('stroke-width', 4);
    pipetteMove(api, st.p1, { x: 525, y: 300, r: 80, sx: 525, sy: 300 }, MIX, { x: wx, y: wy, r: 60, sx: wx, sy: wy - 6 }, () => {
      w.setAttribute('fill', '#F4EFD9');
      api.tween(st.p1, 250, 440, 300);
      const l = level(st.T, t);
      const color = () => {
        A.drop(api, api.svg, wx, wy - 40, wy, '#C8892C', () => {
          w.setAttribute('fill', COLORS[l - 1]); w.setAttribute('stroke', '#D5DEE8'); w.setAttribute('stroke-width', 2);
          NL.audio.play('pop');
          st.run.samples.push({ t: Math.round(t), l });
          showTable(api);
          NL.game.toast(`${Math.round(t)} giây: màu mức ${l} · ${STATE(l).toLowerCase()}`);
          api.wait(0.9, next);
        });
      };
      if (st.runs.length === 1 && c === 0) {
        api.say('Kéo lọ Lugol tới ô vừa nhỏ để thử tinh bột');
        api.setOn(st.lugol, true);
        api.draggable(st.lugol, { target: { x: wx, y: wy - 50, r: 70, sx: wx, sy: wy - 64 }, onDrop: () => { color(); api.tween(st.lugol, 395, 520, 500); } });
      } else color();
    });
  }

  function reset(api) {
    st.t1.fill(STARCH, 0.45); st.t2.fill(ENZ, 0.3);
    NL.game.toast('Mình đã rửa ống và chuẩn bị sẵn tinh bột, enzyme mới');
    void api;
  }

  function result() {
    const PAL = ['#5BB4EA', '#3FB37F', '#F2994A'];
    const runs = st.runs.slice().sort((a, b) => a.T - b.T);
    return {
      title: 'Nhiệt độ và hoạt tính enzyme amylase', param: 'Nhiệt độ bồn: ' + runs.map(r => r.T + '°C').join(', '),
      table: { head: ['Nhiệt độ', 'Thời gian lấy mẫu', 'Mức màu Lugol', 'Trạng thái tinh bột'], rows: runs.flatMap(r => r.samples.map(s => [r.T + '°C', s.t + ' s', s.l, STATE(s.l)])) },
      chart: {
        type: 'line', xLabel: 'Thời gian (giây)', yLabel: 'Mức màu Lugol (1 → 9)', xMax: 120, yMin: 1, yMax: 9,
        series: runs.map((r, i) => ({ name: r.T + '°C', color: PAL[i], points: [[0, 1]].concat(r.samples.map(s => [s.t, s.l])) }))
      },
      conclusion: 'Enzyme amylase hoạt động mạnh nhất ở khoảng 37°C (nhiệt độ tối ưu). Nhiệt độ thấp làm enzyme hoạt động chậm; nhiệt độ cao (trên khoảng 65°C) làm enzyme biến tính, mất hoạt tính',
      note: 'Màu Lugol càng chuyển nhanh về vàng nâu thì tinh bột bị thủy phân thành đường maltose càng nhanh.'
    };
  }

  const QUIZ = [
    {
      kicker: '❓ Vì sao?', q: 'Vì sao ở 100°C, giọt thử vẫn giữ màu xanh tím suốt cả bài?',
      options: [
        { t: 'Nhiệt độ cao làm enzyme biến tính nên không phân giải được tinh bột', ok: true },
        { t: 'Ở 100°C tinh bột chín nên không bị phân giải', why: 'Màu xanh tím cho biết tinh bột vẫn còn. Thứ gì đã không làm việc của nó?' },
        { t: 'Lugol bị bay hơi nên không đổi màu', why: 'Lugol được nhỏ ở đĩa sứ, ngoài bồn nóng. Hãy nghĩ tới enzyme.' }
      ],
      explain: 'Enzyme là protein. Nhiệt độ cao phá cấu trúc không gian của trung tâm hoạt động nên enzyme mất hoạt tính, tinh bột còn nguyên.'
    },
    {
      q: 'Ở 0°C tinh bột cũng gần như còn nguyên. Nếu đưa ống này lên 37°C thì sao?',
      options: [
        { t: 'Enzyme hoạt động trở lại, tinh bột dần bị phân giải', ok: true },
        { t: 'Enzyme đã chết nên không hoạt động nữa', why: 'Nhiệt độ thấp chỉ làm enzyme hoạt động chậm lại, không phá cấu trúc của enzyme.' },
        { t: 'Tinh bột biến thành Lugol', why: 'Lugol là thuốc thử em nhỏ vào, không phải sản phẩm của phản ứng.' }
      ],
      explain: 'Nhiệt độ thấp ức chế tạm thời. Khi về nhiệt độ thích hợp, enzyme hoạt động lại.'
    }
  ];

  NL.lab.register('2C', { goal: 'Nhiệt độ ảnh hưởng thế nào tới tốc độ enzyme amylase phân giải tinh bột?', clearSide: true, build, steps });
})();
