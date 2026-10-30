// Mô hình Hóa 3: Bảng tuần hoàn 3D (118 nguyên tố). Chạm ô để xem 8 thông tin và nguyên tử Bohr; tô màu theo nhóm, bán kính hoặc độ âm điện; tìm kiếm; xu hướng theo chu kỳ.
(function () {
  const C3 = () => NL.chem3d;
  const W = 1.1, X0 = -9.35, Z0 = -5;
  let mode = 'cat', selZ = 26, bohr = null;
  const posOf = e => e.f != null ? [X0 + (2 + e.f + 0.5) * W, Z0 + (e.period + 2.4) * W] : [X0 + (e.group - 1) * W, Z0 + (e.period - 1) * W];
  const lerpC = (a, b, t) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const c = [16, 8, 0].map(s => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t)); return '#' + c.map(x => x.toString(16).padStart(2, '0')).join(''); };
  const ramp = t => t < 0.5 ? lerpC('#38BDF8', '#FDE047', t * 2) : lerpC('#FDE047', '#EF4444', (t - 0.5) * 2);
  function look(e) {
    if (mode === 'cat') return { h: 0.35, c: C3().CAT[e.cat].c };
    if (mode === 'r') return e.r ? { h: 0.2 + e.r / 260 * 3, c: ramp((e.r - 28) / 232) } : { h: 0.12, c: '#475569' };
    return e.chi ? { h: 0.2 + e.chi / 4 * 3, c: ramp((e.chi - 0.7) / 3.3) } : { h: 0.12, c: '#475569' };
  }
  function tileTex(T, e, col) {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.fillStyle = col; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(15,27,43,.9)'; x.textAlign = 'left'; x.font = "800 26px 'Baloo 2', sans-serif"; x.fillText(e.Z, 10, 30);
    x.textAlign = 'center'; x.font = `800 ${e.sym.length > 2 ? 46 : 58}px 'Baloo 2', sans-serif`; x.fillText(e.sym, 64, 86);
    x.font = "700 17px 'Baloo 2', sans-serif"; x.fillText(e.vi.length > 11 ? e.vi.slice(0, 10) + '…' : e.vi, 64, 116);
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
  }
  function info(e) {
    const f = v => C3().fmtVN(v);
    return {
      name: `${e.vi === e.en ? e.en : e.vi + ' / ' + e.en} (${e.sym})`, sci: C3().CAT[e.cat].t, focus: false,
      rows: [
        ['1. Số hiệu nguyên tử Z', `${e.Z} → ${e.Z} proton, ${e.Z} electron`],
        ['2. Ký hiệu', `<b>${e.sym}</b>`],
        ['3. Tên', `${e.vi} / ${e.en}`],
        ['4. Nguyên tử khối', e.mass.startsWith('[') ? `${e.mass} (đồng vị bền nhất)` : `${f(+e.mass)} amu`],
        ['5. Cấu hình electron', C3().config(e.Z) + (e.Z > 103 ? ' (dự đoán)' : '') + `<br><small>Số electron từng lớp: ${C3().shells(e.Z).join(', ')}</small>`],
        ['6. Số oxi hóa thường gặp', e.ox || 'Chưa rõ (chỉ tồn tại vài giây trong phòng thí nghiệm)'],
        ['7. Bán kính nguyên tử', e.r ? `${e.r} pm` : 'Chưa đo được'],
        ['8. Độ âm điện (Pauling)', e.chi ? `${e.chiEst ? '≈ ' : ''}${f(e.chi)}` : (e.group === 18 ? 'Không xác định (khí hiếm hầu như không tạo liên kết)' : 'Chưa xác định')],
        ['Vị trí', `Ô ${e.Z}, chu kỳ ${e.period}, ${e.f != null ? (e.period === 6 ? 'họ Lanthan' : 'họ Actini') + ' (nhóm IIIB)' : 'nhóm ' + e.group}`]
      ]
    };
  }
  function buildBohr(api, e) {
    if (bohr) { bohr.userData.labels.forEach(l => l.remove()); api.offFrame(bohr.userData.fn); bohr.parent && bohr.parent.remove(bohr); }
    const T = api.T, g = api.group(null, [0.6, 2.6, -3.9]); bohr = g; g.userData.labels = [];
    const sh = C3().shells(e.Z), nuc = api.group(g), R = api.rand(e.Z);
    const nN = Math.min(40, Math.round(e.Z * 0.6) + 2);
    for (let k = 0; k < nN; k++) { const p = new T.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize().multiplyScalar(Math.cbrt(R()) * (0.18 + 0.1 * Math.cbrt(e.Z))); api.sphere(0.09, api.mat(k % 2 ? 0xEF4444 : 0x94A3B8, { roughness: 0.4 }), [p.x, p.y, p.z], nuc, 10).userData.noPick = true; }
    api.part(nuc, { name: `Hạt nhân ${e.sym}`, rows: [['Proton', `${e.Z} (mang điện dương)`], ['Neutron', e.mass.startsWith('[') ? 'Tùy đồng vị' : `≈ ${Math.round(+e.mass) - e.Z} (đồng vị phổ biến nhất)`]], focus: false });
    const es = [];
    sh.forEach((n, i) => {
      const r = 0.6 + 0.32 * (i + 1), ring = api.mesh(new T.TorusGeometry(r, 0.012, 6, 96), api.mat(0x93C5FD, { opacity: 0.6, emissive: 0x93C5FD, emissiveIntensity: 0.4 }), null, g); ring.userData.noPick = true;
      for (let k = 0; k < n; k++) { const el = api.sphere(0.07, api.mat(0xFDE047, { emissive: 0xFDE047, emissiveIntensity: 1.1 }), null, g, 10); el.userData.noPick = true; es.push({ el, r, a: k / n * Math.PI * 2, w: 1.4 / (i + 1) }); }
      g.userData.labels.push(api.label('KLMNOPQ'[i] + ' · ' + n, [Math.cos(0.4 + i * 0.38) * (r + 0.12), Math.sin(0.4 + i * 0.38) * (r + 0.12), 0], { cls: 'tag', color: '#93C5FD', parent: g }));
    });
    g.rotation.x = -0.25;
    g.userData.labels.push(api.label(`${e.sym} (Z = ${e.Z})`, [0, -1.1 - 0.32 * sh.length, 0], { cls: 'big', parent: g }));
    const fn = api.onFrame(dt => es.forEach(o => { o.a += o.w * dt; o.el.position.set(Math.cos(o.a) * o.r, Math.sin(o.a) * o.r, 0); }));
    g.userData.fn = fn;
  }
  let lifted = null;
  function pick(api, e, tile) {
    selZ = e.Z;
    if (lifted) { lifted.position.y = 0; lifted.children[0].material.emissiveIntensity = 0; }
    lifted = tile; tile.position.y = 0.35; tile.children[0].material.emissive.setHex(0x33FFE6); tile.children[0].material.emissiveIntensity = 0.35;
    api.info(tile.userData.part); api.beep(1320, 0.12, 'sine', 0.08);
    buildBohr(api, e);
    api.caption(`${e.sym} · ${e.vi}: ${C3().config(e.Z)}`);
    if (e.Z === 9) api.warn('F', 'Fluorine là nguyên tố có <b>độ âm điện lớn nhất (3,98)</b>, có khả năng hút electron mạnh nhất trong tất cả các nguyên tố!', '🔬 Thông điệp khoa học');
    else if (e.Z === 55 || e.Z === 87) api.warn('CsFr', `${e.vi} có <b>bán kính nguyên tử rất lớn</b> (${e.r} pm) và <b>độ âm điện nhỏ nhất</b> (${C3().fmtVN(e.chi)}), thể hiện tính kim loại cực kỳ mạnh mẽ!`, '🔬 Thông điệp khoa học');
    else if (e.group === 18 && e.f == null) api.warn('noble', 'Các nguyên tố khí hiếm có lớp electron ngoài cùng <b>bão hòa bền vững</b> (ns²np⁶, riêng He là 1s²), do đó ở điều kiện thường chúng hầu như không tham gia phản ứng hóa học.', '🔬 Thông điệp khoa học');
    void tile;
  }

  NL.m3d.register('HM3', {
    title: 'Bảng tuần hoàn và nguyên tử Bohr',
    init(api) { [300, 500, 800, 1300].forEach((f, k) => api.beep(f, 0.12, 'sine', 0.05, k * 0.04)); },
    build(api) {
      const T = api.T, tiles = {};
      bohr = null; lifted = null;
      api.onPick(hit => { let o = hit && hit.object; while (o && !(o.userData && o.userData.el)) o = o.parent; if (!o) return false; pick(api, o.userData.el, o); return true; });
      C3().EL.forEach(e => {
        const [x, z] = posOf(e), L = look(e);
        const g = api.group(null, [x, 0, z]);
        const box = api.mesh(new T.BoxGeometry(1, L.h, 1), api.mat(L.c, { roughness: 0.5 }), [0, L.h / 2, 0], g);
        const top = api.mesh(new T.PlaneGeometry(0.96, 0.96), new T.MeshBasicMaterial({ map: tileTex(T, e, L.c) }), [0, L.h + 0.002, 0], g); top.rotation.x = -Math.PI / 2;
        void box; void top;
        api.part(g, info(e)); g.userData.el = e;
        tiles[e.Z] = g;
      });
      // nhãn nhóm và chu kỳ
      for (let gN = 1; gN <= 18; gN++) api.textSprite(String(gN), { h: 0.35, pos: [X0 + (gN - 1) * W, 0.2, Z0 - 0.85], color: '#93C5FD' });
      for (let p = 1; p <= 7; p++) api.textSprite(String(p), { h: 0.35, pos: [X0 - 0.9, 0.2, Z0 + (p - 1) * W], color: '#93C5FD' });
      api.textSprite('Họ Lanthan', { h: 0.32, pos: [X0 + 1.1, 0.2, Z0 + 8.4 * W], color: '#F9A8D4' }); api.textSprite('Họ Actini', { h: 0.32, pos: [X0 + 1.1, 0.2, Z0 + 9.4 * W], color: '#F0ABFC' });
      // điều khiển
      const s = api.note('<input class="hm-search" placeholder="🔎 Tìm: Fe, sắt, iron hoặc 26" autocomplete="off">');
      const inp = s.el.querySelector('input');
      const find = q => { q = q.trim().toLowerCase(); if (!q) return null; return C3().EL.find(e => String(e.Z) === q || e.sym.toLowerCase() === q) || C3().EL.find(e => e.vi.toLowerCase() === q || e.en.toLowerCase() === q) || C3().EL.find(e => e.vi.toLowerCase().startsWith(q) || e.en.toLowerCase().startsWith(q)); };
      inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') { const e = find(inp.value); if (e) { pick(api, e, tiles[e.Z]); inp.blur(); } else api.toast('Không tìm thấy nguyên tố đó'); } ev.stopPropagation(); });
      inp.addEventListener('input', () => { const e = find(inp.value); if (e && inp.value.length >= 2) pick(api, e, tiles[e.Z]); });
      api.choices({ label: '🎨 Tô màu và chiều cao theo', items: [{ t: 'Nhóm nguyên tố', v: 'cat' }, { t: 'Bán kính', v: 'r' }, { t: 'Độ âm điện', v: 'chi' }], value: mode, onPick(m) { mode = m; api.setTab(api.tab); } });
      const C = C3().CAT;
      api.note(mode === 'cat' ? `<div class="hm-legend">${Object.keys(C).map(k => `<span><i style="background:${C[k].c}"></i>${C[k].t}</span>`).join('')}</div>`
        : `<div class="hm-legend"><span><i style="background:#38BDF8"></i>${mode === 'r' ? 'Nhỏ' : 'Thấp'}</span><span><i style="background:#FDE047"></i>Trung bình</span><span><i style="background:#EF4444"></i>${mode === 'r' ? 'Lớn' : 'Cao'}</span><span><i style="background:#475569"></i>Chưa có số liệu</span></div>` +
          (mode === 'r' ? 'Trong một chu kỳ, bán kính <b>giảm</b> từ trái sang phải; trong một nhóm, bán kính <b>tăng</b> từ trên xuống.' : 'Trong một chu kỳ, độ âm điện <b>tăng</b> từ trái sang phải; trong một nhóm, độ âm điện <b>giảm</b> từ trên xuống.'));
      api.button('⚛️ Xem gần nguyên tử Bohr', () => api.flyTo(api.V(0.6, 3.4, 3.2), api.V(0.6, 2.4, -3.9)));
      api.note('Bán kính: bán kính cộng hóa trị (pm). Nguyên tố từ Z = 104 trở đi chỉ tồn tại rất ngắn nên chưa đo được.');
      api.view({ pos: [0, 14, 12.5], target: [0, 0.6, -0.2], min: 3, max: 40 });
      pick(api, C3().EL[selZ - 1], tiles[selZ]);
    },
    data() {
      const e0 = C3().EL[selZ - 1], row = C3().EL.filter(e => e.period === e0.period && e.f == null);
      return {
        title: `Xu hướng biến đổi trong chu kỳ ${e0.period}`,
        sub: `Đang chọn ${e0.sym} (${e0.vi}). Từ trái sang phải: điện tích hạt nhân tăng, số lớp electron không đổi → electron bị hút chặt hơn`,
        sheets: [{ name: 'Chu kỳ ' + e0.period, head: ['Z', 'Ký hiệu', 'Tên', 'Nhóm', 'Cấu hình electron', 'Bán kính (pm)', 'Độ âm điện', 'Loại'], rows: row.map(e => [e.Z, e.sym, `${e.vi} / ${e.en}`, e.group, C3().config(e.Z), e.r || '–', e.chi ? (e.chiEst ? '≈' : '') + C3().fmtVN(e.chi) : '–', C3().CAT[e.cat].t]) }],
        chart: { type: 'line', title: `Chu kỳ ${e0.period}: bán kính và độ âm điện theo nhóm`, xMin: 0, xMax: 20, yMax: 400, series: [
          { name: 'Bán kính (pm)', color: '#F59E0B', points: row.filter(e => e.r).map(e => [e.group, e.r]) },
          { name: 'Độ âm điện × 100', color: '#38BDF8', points: row.filter(e => e.chi).map(e => [e.group, Math.round(e.chi * 100)]) }], yLabel: 'pm  |  độ âm điện × 100', xLabel: 'Nhóm' }
      };
    }
  });
})();
