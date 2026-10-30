// Dữ liệu và công cụ dựng hình dùng chung cho 10 mô hình Hóa (tầng 3): 118 nguyên tố, cấu hình electron, nguyên tử CPK, liên kết σ / π, cặp electron tự do, cung góc.
// Bán kính: bán kính cộng hóa trị (Cordero 2008, pm). Độ âm điện: thang Pauling. Khối lượng: nguyên tử khối chuẩn IUPAC, [ ] là số khối đồng vị bền nhất.
window.NL = window.NL || {};
NL.chem3d = (function () {
  // Ký hiệu; tên tiếng Anh; tên tiếng Việt quen dùng; nguyên tử khối; độ âm điện (~ là ước tính); bán kính (pm); số oxi hóa thường gặp
  const RAW = 'H;Hydrogen;Hiđro;1.008;2.20;31;+1, −1|He;Helium;Heli;4.0026;;28;0|Li;Lithium;Liti;6.94;0.98;128;+1|Be;Beryllium;Beri;9.0122;1.57;96;+2|B;Boron;Bo;10.81;2.04;84;+3|C;Carbon;Cacbon;12.011;2.55;76;−4, +2, +4|N;Nitrogen;Nitơ;14.007;3.04;71;−3, +2, +3, +4, +5|O;Oxygen;Oxi;15.999;3.44;66;−2|F;Fluorine;Flo;18.998;3.98;57;−1|Ne;Neon;Neon;20.180;;58;0|' +
    'Na;Sodium;Natri;22.990;0.93;166;+1|Mg;Magnesium;Magie;24.305;1.31;141;+2|Al;Aluminium;Nhôm;26.982;1.61;121;+3|Si;Silicon;Silic;28.085;1.90;111;−4, +4|P;Phosphorus;Photpho;30.974;2.19;107;−3, +3, +5|S;Sulfur;Lưu huỳnh;32.06;2.58;105;−2, +4, +6|Cl;Chlorine;Clo;35.45;3.16;102;−1, +1, +3, +5, +7|Ar;Argon;Agon;39.948;;106;0|' +
    'K;Potassium;Kali;39.098;0.82;203;+1|Ca;Calcium;Canxi;40.078;1.00;176;+2|Sc;Scandium;Scanđi;44.956;1.36;170;+3|Ti;Titanium;Titan;47.867;1.54;160;+2, +3, +4|V;Vanadium;Vanađi;50.942;1.63;153;+2, +3, +4, +5|Cr;Chromium;Crom;51.996;1.66;139;+2, +3, +6|Mn;Manganese;Mangan;54.938;1.55;139;+2, +4, +6, +7|Fe;Iron;Sắt;55.845;1.83;132;+2, +3|Co;Cobalt;Coban;58.933;1.88;126;+2, +3|Ni;Nickel;Niken;58.693;1.91;124;+2|Cu;Copper;Đồng;63.546;1.90;132;+1, +2|Zn;Zinc;Kẽm;65.38;1.65;122;+2|Ga;Gallium;Gali;69.723;1.81;122;+3|Ge;Germanium;Gecmani;72.630;2.01;120;+2, +4|As;Arsenic;Asen;74.922;2.18;119;−3, +3, +5|Se;Selenium;Selen;78.971;2.55;120;−2, +4, +6|Br;Bromine;Brom;79.904;2.96;120;−1, +1, +5|Kr;Krypton;Kripton;83.798;3.00;116;0, +2|' +
    'Rb;Rubidium;Rubiđi;85.468;0.82;220;+1|Sr;Strontium;Stronti;87.62;0.95;195;+2|Y;Yttrium;Ytri;88.906;1.22;190;+3|Zr;Zirconium;Zirconi;91.224;1.33;175;+4|Nb;Niobium;Niobi;92.906;1.6;164;+3, +5|Mo;Molybdenum;Molipđen;95.95;2.16;154;+4, +6|Tc;Technetium;Tecneti;[98];1.9;147;+4, +7|Ru;Ruthenium;Rutheni;101.07;2.2;146;+3, +4|Rh;Rhodium;Rhođi;102.91;2.28;142;+3|Pd;Palladium;Palađi;106.42;2.20;139;+2, +4|Ag;Silver;Bạc;107.87;1.93;145;+1|Cd;Cadmium;Cađimi;112.41;1.69;144;+2|In;Indium;Inđi;114.82;1.78;142;+3|Sn;Tin;Thiếc;118.71;1.96;139;+2, +4|Sb;Antimony;Antimon;121.76;2.05;139;−3, +3, +5|Te;Tellurium;Telu;127.60;2.1;138;−2, +4, +6|I;Iodine;Iot;126.90;2.66;139;−1, +1, +5, +7|Xe;Xenon;Xenon;131.29;2.6;140;0, +2, +4, +6|' +
    'Cs;Caesium;Xesi;132.91;0.79;244;+1|Ba;Barium;Bari;137.33;0.89;215;+2|La;Lanthanum;Lantan;138.91;1.10;207;+3|Ce;Cerium;Xeri;140.12;1.12;204;+3, +4|Pr;Praseodymium;Praseođim;140.91;1.13;203;+3|Nd;Neodymium;Neođim;144.24;1.14;201;+3|Pm;Promethium;Prometi;[145];~1.13;199;+3|Sm;Samarium;Samari;150.36;1.17;198;+2, +3|Eu;Europium;Europi;151.96;~1.2;198;+2, +3|Gd;Gadolinium;Gađolini;157.25;1.20;196;+3|Tb;Terbium;Tecbi;158.93;~1.1;194;+3, +4|Dy;Dysprosium;Đysprosi;162.50;1.22;192;+3|Ho;Holmium;Honmi;164.93;1.23;192;+3|Er;Erbium;Ecbi;167.26;1.24;189;+3|Tm;Thulium;Tuli;168.93;1.25;190;+3|Yb;Ytterbium;Ytecbi;173.05;~1.1;187;+2, +3|Lu;Lutetium;Luteti;174.97;1.27;187;+3|' +
    'Hf;Hafnium;Hafni;178.49;1.3;175;+4|Ta;Tantalum;Tantan;180.95;1.5;170;+5|W;Tungsten;Vonfram;183.84;2.36;162;+4, +6|Re;Rhenium;Reni;186.21;1.9;151;+4, +7|Os;Osmium;Osimi;190.23;2.2;144;+4, +8|Ir;Iridium;Iriđi;192.22;2.20;141;+3, +4|Pt;Platinum;Platin;195.08;2.28;136;+2, +4|Au;Gold;Vàng;196.97;2.54;136;+1, +3|Hg;Mercury;Thủy ngân;200.59;2.00;132;+1, +2|Tl;Thallium;Tali;204.38;1.62;145;+1, +3|Pb;Lead;Chì;207.2;2.33;146;+2, +4|Bi;Bismuth;Bitmut;208.98;2.02;148;+3, +5|Po;Polonium;Poloni;[209];2.0;140;+2, +4|At;Astatine;Atatin;[210];2.2;150;−1, +1|Rn;Radon;Rađon;[222];~2.2;150;0, +2|' +
    'Fr;Francium;Franxi;[223];~0.7;260;+1|Ra;Radium;Rađi;[226];0.9;221;+2|Ac;Actinium;Actini;[227];1.1;215;+3|Th;Thorium;Thori;232.04;1.3;206;+4|Pa;Protactinium;Protactini;231.04;1.5;200;+4, +5|U;Uranium;Urani;238.03;1.38;196;+4, +6|Np;Neptunium;Neptuni;[237];1.36;190;+3, +4, +5, +6|Pu;Plutonium;Plutoni;[244];1.28;187;+3, +4|Am;Americium;Americi;[243];~1.3;180;+3|Cm;Curium;Curi;[247];~1.3;169;+3|Bk;Berkelium;Beckeli;[247];~1.3;;+3, +4|Cf;Californium;Californi;[251];~1.3;;+3|Es;Einsteinium;Einsteini;[252];~1.3;;+3|Fm;Fermium;Fecmi;[257];~1.3;;+3|Md;Mendelevium;Menđelevi;[258];~1.3;;+2, +3|No;Nobelium;Nobeli;[259];~1.3;;+2, +3|Lr;Lawrencium;Lorenxi;[266];~1.3;;+3|' +
    'Rf;Rutherfordium;Rutherfordi;[267];;;|Db;Dubnium;Đubni;[268];;;|Sg;Seaborgium;Seaborgi;[269];;;|Bh;Bohrium;Bohri;[270];;;|Hs;Hassium;Hassi;[269];;;|Mt;Meitnerium;Meitneri;[278];;;|Ds;Darmstadtium;Đacmstađti;[281];;;|Rg;Roentgenium;Roentgeni;[282];;;|Cn;Copernicium;Copernixi;[285];;;|Nh;Nihonium;Nihoni;[286];;;|Fl;Flerovium;Flerovi;[289];;;|Mc;Moscovium;Moscovi;[290];;;|Lv;Livermorium;Livermori;[293];;;|Ts;Tennessine;Tennessin;[294];;;|Og;Oganesson;Oganesson;[294];;;';

  const ORDER = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s', '5f', '6d', '7p'];
  const CAP = { s: 2, p: 6, d: 10, f: 14 };
  const EXC = { 24: { '3d': 5, '4s': 1 }, 29: { '3d': 10, '4s': 1 }, 41: { '4d': 4, '5s': 1 }, 42: { '4d': 5, '5s': 1 }, 44: { '4d': 7, '5s': 1 }, 45: { '4d': 8, '5s': 1 }, 46: { '4d': 10, '5s': 0 }, 47: { '4d': 10, '5s': 1 },
    57: { '4f': 0, '5d': 1 }, 58: { '4f': 1, '5d': 1 }, 64: { '4f': 7, '5d': 1 }, 78: { '5d': 9, '6s': 1 }, 79: { '5d': 10, '6s': 1 },
    89: { '5f': 0, '6d': 1 }, 90: { '5f': 0, '6d': 2 }, 91: { '5f': 2, '6d': 1 }, 92: { '5f': 3, '6d': 1 }, 93: { '5f': 4, '6d': 1 }, 96: { '5f': 7, '6d': 1 }, 103: { '6d': 0, '7p': 1 } };
  const SUP = n => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
  // phân lớp theo thứ tự năng lượng (Aufbau) đã sửa ngoại lệ → [{ sub, n, l, e }]
  function subshells(Z) {
    let left = Z; const occ = {};
    ORDER.forEach(s => { const c = Math.min(CAP[s[1]], left); occ[s] = c; left -= c; });
    if (EXC[Z]) Object.assign(occ, EXC[Z]);
    return ORDER.filter(s => occ[s] > 0).map(s => ({ sub: s, n: +s[0], l: s[1], e: occ[s] }));
  }
  // viết theo thứ tự lớp (như SGK): 1s²2s²2p⁶3s²3p⁶3d⁶4s²
  const LORD = { s: 0, p: 1, d: 2, f: 3 };
  function config(Z) {
    return subshells(Z).sort((a, b) => a.n - b.n || LORD[a.l] - LORD[b.l]).map(s => s.sub + SUP(s.e)).join(' ');
  }
  function shells(Z) { const a = []; subshells(Z).forEach(s => { a[s.n - 1] = (a[s.n - 1] || 0) + s.e; }); for (let i = 0; i < a.length; i++) a[i] = a[i] || 0; return a; }

  const ALK = [3, 11, 19, 37, 55, 87], ALKE = [4, 12, 20, 38, 56, 88], NOBLE = [2, 10, 18, 36, 54, 86, 118], HAL = [9, 17, 35, 53, 85, 117], MET = [5, 14, 32, 33, 51, 52], NON = [1, 6, 7, 8, 15, 16, 34];
  const CAT = {
    alk: { t: 'Kim loại kiềm', c: '#F87171' }, alke: { t: 'Kim loại kiềm thổ', c: '#FB923C' }, tran: { t: 'Kim loại chuyển tiếp', c: '#FACC15' }, post: { t: 'Kim loại yếu', c: '#A3E635' },
    met: { t: 'Á kim', c: '#2DD4BF' }, non: { t: 'Phi kim', c: '#38BDF8' }, hal: { t: 'Halogen', c: '#818CF8' }, noble: { t: 'Khí hiếm', c: '#C084FC' },
    lan: { t: 'Họ Lanthan', c: '#F472B6' }, act: { t: 'Họ Actini', c: '#E879F9' }
  };
  function place(Z) {
    const P = [2, 10, 18, 36, 54, 86, 118]; let p = 0; while (Z > P[p]) p++;
    const i = Z - (p ? P[p - 1] : 0) - 1; const per = p + 1;
    if (per === 1) return { period: 1, group: Z === 1 ? 1 : 18 };
    if (per <= 3) return { period: per, group: i < 2 ? i + 1 : i + 11 };
    if (per <= 5) return { period: per, group: i + 1 };
    if (i < 2) return { period: per, group: i + 1 };
    if (i <= 16) return { period: per, group: 3, f: i - 2 }; // hàng họ Lanthan / Actini
    return { period: per, group: i - 13 };
  }
  const EL = RAW.split('|').map((r, k) => {
    const f = r.split(';'), Z = k + 1, pl = place(Z);
    const enS = f[4], est = enS.startsWith('~');
    const cat = ALK.includes(Z) ? 'alk' : ALKE.includes(Z) ? 'alke' : NOBLE.includes(Z) ? 'noble' : HAL.includes(Z) ? 'hal' : MET.includes(Z) ? 'met' : NON.includes(Z) ? 'non'
      : (Z >= 57 && Z <= 71) ? 'lan' : (Z >= 89 && Z <= 103) ? 'act' : (pl.group >= 3 && pl.group <= 12) ? 'tran' : 'post';
    return { Z, sym: f[0], en: f[1], vi: f[2], mass: f[3], chi: enS ? parseFloat(enS.replace('~', '')) : null, chiEst: est, r: f[5] ? +f[5] : null, ox: f[6] || '', cat, ...pl };
  });
  const bySym = {}; EL.forEach(e => { bySym[e.sym] = e; });

  // ---------- dựng hình ----------
  // màu CPK quen dùng
  const CPK = { H: 0xF2F2F2, C: 0x3A3A3A, N: 0x3050F8, O: 0xFF2A2A, F: 0x90E050, Cl: 0x1FF01F, Br: 0xA62929, I: 0x940094, S: 0xFFE030, P: 0xFF8000, B: 0xFFB5B5, Na: 0xAB5CF2, K: 0x8F40D4, Ca: 0x3DFF00, Mg: 0x8AFF00, Fe: 0xE06633, Cu: 0xC88033, Zn: 0x7D80B0, Si: 0xF0C8A0 };
  const SIGMA = 0xB8C2CC, PI = 0xA855F7;
  // bán kính hiển thị (đơn vị cảnh) cho kiểu quả cầu – que và kiểu đặc
  const vdw = { H: 1.2, C: 1.7, N: 1.55, O: 1.52, F: 1.47, Cl: 1.75, S: 1.8, P: 1.8, B: 1.92 };
  function atom(api, el, pos, parent, o = {}) {
    const r = o.fill ? (vdw[el] || 1.8) * 0.62 : (el === 'H' ? 0.2 : 0.32) * (o.scale || 1);
    const m = api.sphere(r, api.mat(CPK[el] || 0xCCCCCC, { roughness: 0.35, metalness: 0.05 }), pos.isVector3 ? [pos.x, pos.y, pos.z] : pos, parent, o.seg || 28);
    m.userData.el = el;
    return m;
  }
  // vector vuông góc bất kỳ với d (dùng để xếp các que π song song)
  function perpTo(T, d, hint) {
    const h = hint ? hint.clone() : (Math.abs(d.y) < 0.9 ? new T.Vector3(0, 1, 0) : new T.Vector3(1, 0, 0));
    return h.sub(d.clone().multiplyScalar(h.dot(d))).normalize();
  }
  // liên kết: order 1 = σ; 2 = σ + π; 3 = σ + 2π; 1.5 = thơm (σ + nửa π mờ). Trả về nhóm có userData.order
  function bond(api, a, b, order, parent, o = {}) {
    const T = api.T, A = a.isVector3 ? a : new T.Vector3(...a), B = b.isVector3 ? b : new T.Vector3(...b);
    const g = api.group(parent); g.userData.order = order;
    const d = B.clone().sub(A).normalize(), r = o.r || 0.085;
    const s = api.lineBetween(A, B, r, api.mat(SIGMA, { roughness: 0.4 }), g); api.tag(s, 'sigma');
    if (order >= 1.5) {
      const p = perpTo(T, d, o.perp), off = order === 3 ? [p.clone().multiplyScalar(0.2), p.clone().multiplyScalar(-0.2)] : [p.clone().multiplyScalar(0.2)];
      if (order === 3) { const q = d.clone().cross(p).normalize(); off[1] = q.multiplyScalar(0.2); }
      off.forEach(v => {
        const pm = api.lineBetween(A.clone().add(v), B.clone().add(v), r * 0.75, api.mat(PI, { roughness: 0.35, emissive: PI, emissiveIntensity: 0.2, opacity: order === 1.5 ? 0.45 : 1 }), g);
        api.tag(pm, 'pi');
      });
    }
    return g;
  }
  // cặp electron tự do: đám mây hình giọt hướng theo dir, có 2 chấm electron
  function lonePair(api, center, dir, parent, len) {
    const T = api.T, L = len || 0.75, g = api.group(parent);
    const lobe = api.mesh(new T.SphereGeometry(0.3, 24, 16), api.mat(0xFDE68A, { opacity: 0.38, depthWrite: false, emissive: 0xFACC15, emissiveIntensity: 0.25 }), null, g);
    lobe.scale.set(1, 1.7, 1);
    const D = dir.clone().normalize();
    lobe.position.copy(center).add(D.clone().multiplyScalar(L));
    lobe.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), D);
    const p = perpTo(T, D);
    [-1, 1].forEach(s => { const e = api.sphere(0.06, api.mat(0xFFF7AE, { emissive: 0xFFE14D, emissiveIntensity: 1 }), null, g, 10); e.position.copy(lobe.position).add(D.clone().multiplyScalar(0.15)).add(p.clone().multiplyScalar(0.1 * s)); e.userData.noPick = true; });
    api.tag(g, 'lp');
    return g;
  }
  // cung góc giữa 2 hướng tính từ tâm, kèm nhãn số đo
  function angleArc(api, c, u, v, r, parent, text) {
    const T = api.T, U = u.clone().normalize(), W = v.clone().normalize(), ang = U.angleTo(W), n = 24, pts = [];
    const axis = new T.Vector3().crossVectors(U, W); if (axis.lengthSq() < 1e-6) axis.copy(perpTo(T, U)); axis.normalize();
    for (let k = 0; k <= n; k++) pts.push(c.clone().add(U.clone().applyAxisAngle(axis, ang * k / n).multiplyScalar(r)));
    const t = api.tube(pts, 0.025, api.mat(0x22D3EE, { emissive: 0x22D3EE, emissiveIntensity: 0.6 }), parent, 40); api.tag(t, 'ang'); t.userData.noPick = true;
    const mid = c.clone().add(U.clone().applyAxisAngle(axis, ang / 2).multiplyScalar(r + 0.35));
    const l = api.label(text || (ang * 180 / Math.PI).toFixed(1).replace('.', ',') + '°', mid, { cls: 'tag', color: '#22D3EE' });
    return { tube: t, label: l };
  }
  // điền các hướng tứ diện còn thiếu quanh một nguyên tử sp³ khi đã biết các liên kết có sẵn (vector đơn vị hướng ra)
  function tetraFill(T, bonds, count) {
    const out = [], th = 109.47 * Math.PI / 180;
    if (bonds.length === 0) { const t = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(v => new T.Vector3(...v).normalize()); return t.slice(0, count); }
    if (bonds.length === 1) {
      const a = bonds[0].clone().negate(), p = perpTo(T, a), q = a.clone().cross(p).normalize();
      for (let k = 0; k < 3; k++) { const phi = k * 2 * Math.PI / 3; out.push(a.clone().multiplyScalar(Math.cos(Math.PI - th)).add(p.clone().multiplyScalar(Math.sin(th) * Math.cos(phi))).add(q.clone().multiplyScalar(Math.sin(th) * Math.sin(phi)))); }
      return out.map(v => v.normalize()).slice(0, count);
    }
    if (bonds.length === 2) {
      const bis = bonds[0].clone().add(bonds[1]).negate().normalize(), pp = new T.Vector3().crossVectors(bonds[0], bonds[1]).normalize();
      const h = th / 2;
      return [bis.clone().multiplyScalar(Math.cos(h)).add(pp.clone().multiplyScalar(Math.sin(h))).normalize(), bis.clone().multiplyScalar(Math.cos(h)).sub(pp.clone().multiplyScalar(Math.sin(h))).normalize()].slice(0, count);
    }
    return [bonds.reduce((s, b) => s.add(b), new T.Vector3()).negate().normalize()];
  }
  // hướng cho nguyên tử sp² (phẳng 120°) khi đã có các liên kết
  function trigFill(T, bonds, count, normal) {
    if (bonds.length === 1) { const a = bonds[0], n = normal || perpTo(T, a); return [a.clone().applyAxisAngle(n, 2 * Math.PI / 3), a.clone().applyAxisAngle(n, -2 * Math.PI / 3)].slice(0, count); }
    return [bonds[0].clone().add(bonds[1]).negate().normalize()];
  }
  // đường nét đứt (liên kết hydrogen, lực van der Waals) có thể cập nhật mỗi khung hình
  // vẽ bằng chuỗi hạt nhỏ (InstancedMesh) để nét đủ dày trên mọi màn hình
  function dashes(api, max, color, parent, o = {}) {
    const T = api.T, per = o.dots || 5, r = o.r || 0.05;
    const m = new T.InstancedMesh(new T.SphereGeometry(r, 8, 6), new T.MeshBasicMaterial({ color: color || 0x67E8F9, transparent: true, opacity: 0.95 }), max * per);
    m.count = 0; m.userData.noPick = true; m.frustumCulled = false; (parent || api.root).add(m);
    const M = new T.Matrix4(), P = new T.Vector3();
    return {
      obj: m,
      set(pairs) {
        const n = Math.min(max, pairs.length);
        for (let k = 0; k < n; k++) { const [a, b] = pairs[k]; for (let j = 0; j < per; j++) { P.lerpVectors(a, b, (j + 0.5) / per); M.makeTranslation(P.x, P.y, P.z); m.setMatrixAt(k * per + j, M); } }
        m.count = n * per; m.instanceMatrix.needsUpdate = true;
      }
    };
  }
  const fmtVN = (v, d) => (typeof v === 'number' ? v.toLocaleString('vi-VN', { maximumFractionDigits: d == null ? 2 : d, minimumFractionDigits: 0 }) : v);

  return { EL, bySym, CAT, subshells, config, shells, SUP, CPK, SIGMA, PI, atom, bond, lonePair, angleArc, tetraFill, trigFill, perpTo, dashes, fmtVN };
})();
