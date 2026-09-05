// Motion and gradients adapted from the supplied oneui-spinner/web reference.
// Source: Samsung Weather res/anim/progress_dot_*.xml and SESL progress vector.

// ---- cubic-bezier timing function (same math as android pathInterpolator) ----
function bez(x1: number, y1: number, x2: number, y2: number) {
  return function (x: number) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 24; i++) {
      const bx = 3*t*(1-t)*(1-t)*x1 + 3*t*t*(1-t)*x2 + t*t*t;
      if (bx < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return 3*t*(1-t)*(1-t)*y1 + 3*t*t*(1-t)*y2 + t*t*t;
  };
}
// interpolators found in res/anim/easing_custom_*.xml
const E_MOVE1 = bez(0.497, 0.000, 0.833, 0.571); // outward drift (633ms)
const E_MOVE2 = bez(0.344, 0.830, 0.605, 1.000); // converge w/ settle (466ms)
const E_MOVE3 = bez(0.117, 0.126, 0.312, 1.000); // spring back out (700ms)
const E_SCL_UP = bez(0.499, 0.000, 0.765, 1.000);
const E_SCL_DN = bez(0.091, 0.000, 0.000, 1.000);
const E_A0 = bez(0.497, 0.763, 0.605, 1.000);   // dot0 alpha
const E_A13 = bez(0.497, 1.399, 0.605, 1.000);  // dot1/dot3 alpha (overshoots)
const E_A2 = bez(0.497, 0.933, 0.605, 1.000);   // dot2 alpha

// 1-D cubic bezier value curve: the C-segments of the animators' android:pathData
function curve(p0: number, c1: number, c2: number, p3: number) { return (u: number) => {
  const v = 1-u; return v*v*v*p0 + 3*v*v*u*c1 + 3*v*u*u*c2 + u*u*u*p3;
};}

export const CYCLE = 2000;
const T1 = 633, T2 = 466, T3 = 700; // ms (633+466+700=1799, then hold)

// Per-dot motion segments in the 240×240 "Progress_dot" space (translate of each Cir_N group).
// Verbatim from progress_dot_progress_dot_cir_*_translate*.xml. Static axis stays at 91.75.
export const dots = [
  { // Cir_0 — left dot
    ax:'x', s1: curve(7.75, 15.083, 38.583, 51.75), s2: curve(51.75, 64.917, 94.083, 86.75),
    s3: curve(86.75, 79.417, 20.917, 7.75), dip:0.45, ea:E_A0,
    grad: { x1:22.96, y1:80.87, x2:-9.16, y2:-97.58,
      stops:[[0,'#3dcc87',.9],[.25,'#3ba3c3',.9],[.5,'#387aff',.9],[.806,'#398ae8',.717],[1,'#3ba3c3',.6]] as const } },
  { // Cir_1 — top dot
    ax:'y', s1: curve(7.75, 15.083, 38.583, 51.75), s2: curve(51.75, 64.917, 94.083, 86.75),
    s3: curve(86.75, 79.417, 20.917, 7.75), dip:0.7, ea:E_A13,
    grad: { x1:-15.84, y1:-8.05, x2:39.41, y2:9.76,
      stops:[[0,'#3ba3c3',.6],[.612,'#3cb3ac',.6],[1,'#3dcc87',.6]] as const } },
  { // Cir_2 — right dot
    ax:'x', s1: curve(175.75, 168.417, 144.917, 131.75), s2: curve(131.75, 118.583, 89.417, 96.75),
    s3: curve(96.75, 104.083, 162.583, 175.75), dip:0.55, ea:E_A2,
    grad: { x1:9.47, y1:-29.21, x2:-5.48, y2:32.39,
      stops:[[0,'#387aff',.6],[.612,'#3a92db',.784],[1,'#3cb9a2',.9]] as const } },
  { // Cir_3 — bottom dot
    ax:'y', s1: curve(175.75, 168.417, 144.917, 131.75), s2: curve(131.75, 118.583, 89.417, 96.75),
    s3: curve(96.75, 104.083, 162.583, 175.75), dip:0.7, ea:E_A13,
    grad: { x1:-16.32, y1:9.57, x2:69.63, y2:-33.02,
      stops:[[0,'#3dcc87',.9],[.612,'#3dc591',.9],[1,'#3cb9a2',.9]] as const } },
];

export function seg(t: number, dot: (typeof dots)[number]) { // motion value at cycle-time t for one dot
  if (t < T1) return dot.s1(E_MOVE1(t / T1));
  if (t < T1+T2) return dot.s2(E_MOVE2((t - T1) / T2));
  if (t < T1+T2+T3) return dot.s3(E_MOVE3((t - T1 - T2) / T3));
  return dot.s3(1); // hold final (= start) value for last 201 ms
}
export function clusterScale(t: number) {
  if (t < T1) return 1;
  if (t < T1+T2) return 1 + E_SCL_UP((t - T1) / T2);
  if (t < T1+T2+T3) return 2 - E_SCL_DN((t - T1 - T2) / T3);
  return 1;
}
export function dotAlpha(t: number, dot: (typeof dots)[number]) {
  if (t < T1) return 1;
  if (t < T1+T2) return 1 + (dot.dip - 1) * dot.ea((t - T1) / T2);
  if (t < T1+T2+T3) return dot.dip + (1 - dot.dip) * dot.ea((t - T1 - T2) / T3);
  return 1;
}

