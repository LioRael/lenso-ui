import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import * as stylex from "@stylexjs/stylex";
import { deviceLab as s } from "../styles/device-lab.stylex";

const SCREEN_WIDTH = 790;
// Duo's inner glass is 15.7987 × 11.1035 cm; resize the viewport, never stretch its raster.
const SCREEN_HEIGHT = 556;
const HALF_BODY = 4.07;
const BODY_HEIGHT = SCREEN_HEIGHT / 100 + 0.24;
const HINGE_Z = 0.21;
const FLEX_WIDTH = 0.36;
const FLEX_SEGMENTS = 24;
const INNER_HALF_WIDTH = (SCREEN_WIDTH - FLEX_WIDTH * 100) / 2;
const SCREEN_RADIUS = 32;

export type DeviceScene = {
  setHinge: (angle: number, busy: boolean) => void;
  resetView: () => void;
  dispose: () => void;
};
type Surface = "inner" | "inner-right" | "cover";
export type DeviceScreens = {
  mount(frame: HTMLIFrameElement, surface: Surface): void;
  isReady(surface: Surface): boolean;
  subscribePaint(listener: () => void): () => void;
};

// The two hinge-side corners stay nearly square; the outside corners are round.
function outline(width: number, height: number, left: number, right: number) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + left, y);
  shape.lineTo(x + width - right, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + right);
  shape.lineTo(x + width, y + height - right);
  shape.quadraticCurveTo(x + width, y + height, x + width - right, y + height);
  shape.lineTo(x + left, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - left);
  shape.lineTo(x, y + left);
  shape.quadraticCurveTo(x, y, x + left, y);
  return shape;
}

// Use screen pixels for both the WebGL opening and the DOM mask; only their Y axes differ.
function screenOutline(
  start: number,
  end: number,
  left: number,
  right: number,
  bend: readonly { x: number; y: number }[] = [],
) {
  const shape = new THREE.Shape();
  shape.moveTo(start + left, 0);
  if (bend.length) {
    for (const { x, y } of bend) shape.lineTo(x, -y);
    for (let i = bend.length - 1; i >= 0; i--) {
      const { x, y } = bend[i]!;
      shape.lineTo(x, -SCREEN_HEIGHT - y);
    }
  } else {
    shape.lineTo(end - right, 0);
    shape.quadraticCurveTo(end, 0, end, -right);
    shape.lineTo(end, right - SCREEN_HEIGHT);
    shape.quadraticCurveTo(end, -SCREEN_HEIGHT, end - right, -SCREEN_HEIGHT);
  }
  shape.lineTo(start + left, -SCREEN_HEIGHT);
  shape.quadraticCurveTo(start, -SCREEN_HEIGHT, start, left - SCREEN_HEIGHT);
  shape.lineTo(start, -left);
  shape.quadraticCurveTo(start, 0, start + left, 0);
  return shape;
}

function screenClip(shape: THREE.Shape) {
  const start = shape.curves[0]!.getPoint(0);
  const edges = shape.curves.map((curve) =>
    curve instanceof THREE.QuadraticBezierCurve
      ? `Q${curve.v1.x} ${-curve.v1.y} ${curve.v2.x} ${-curve.v2.y}`
      : `L${curve.getPoint(1).x} ${-curve.getPoint(1).y}`,
  );
  return `path("M${start.x} ${-start.y} ${edges.join(" ")} Z")`;
}

const flatInnerClip = screenClip(screenOutline(0, SCREEN_WIDTH, SCREEN_RADIUS, SCREEN_RADIUS));

function setDynamicStyle(element: HTMLElement, style: ReturnType<typeof stylex.props>["style"]) {
  for (const [property, value] of Object.entries(style ?? {})) {
    element.style.setProperty(property, String(value));
  }
}

// Hermite strip adapted from Duo (MIT); shared by the bezel and live screen warp.
function hingePoint(point: THREE.Vector3, t: number, bend: number, z: number) {
  const cosine = Math.cos(bend);
  const sine = Math.sin(bend);
  const half = FLEX_WIDTH / 2;
  const t2 = t * t;
  const t3 = t2 * t;
  const a = 2 * t3 - 3 * t2 + 1;
  const b = t3 - 2 * t2 + t;
  const d = -2 * t3 + 3 * t2;
  const e = t3 - t2;
  return point.set(
    -half * a +
      FLEX_WIDTH * b +
      (cosine * half - sine * (z - HINGE_Z)) * d +
      FLEX_WIDTH * cosine * e,
    0,
    z * a + (sine * half + cosine * (z - HINGE_Z) + HINGE_Z) * d + FLEX_WIDTH * sine * e,
  );
}

function hingeWarp(panel: HTMLElement) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", stylex.props(s.foldDefinitions).className ?? "");
  svg.setAttribute("aria-hidden", "true");
  const id = `device-curve-${crypto.randomUUID()}`;
  // Decode byte 128 to exactly 0.5 so the fixed screen has zero displacement.
  svg.innerHTML = `<filter id="${id}" x="0" y="-64" width="790" height="${SCREEN_HEIGHT + 128}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feImage x="0" y="-64" width="790" height="${SCREEN_HEIGHT + 128}" preserveAspectRatio="none" result="map"/><feComponentTransfer in="map" result="decoded"><feFuncR type="linear" slope="${255 / 254}" intercept="${-1 / 254}"/><feFuncG type="linear" slope="${255 / 254}" intercept="${-1 / 254}"/></feComponentTransfer><feDisplacementMap in="SourceGraphic" in2="decoded" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  panel.append(svg);
  const image = svg.querySelector("feImage")!;
  const displacement = svg.querySelector("feDisplacementMap")!;
  let previous = "";
  return (profile: { x: number; y: number; source: number }[]) => {
    const enabled = profile.length > 0;
    setDynamicStyle(panel, stylex.props(s.foldFilter(enabled ? `url("#${id}")` : "none")).style);
    if (!enabled) {
      setDynamicStyle(panel, stylex.props(s.screenClip(flatInnerClip)).style);
      return;
    }
    const scale =
      1 + 2 * Math.max(...profile.flatMap((p) => [Math.abs(p.source - p.x), Math.abs(p.y)]));
    const stops = [
      '<stop stop-color="rgb(128 128 0)"/>',
      ...profile.map(
        (p) =>
          `<stop offset="${p.x / SCREEN_WIDTH}" stop-color="rgb(${Math.round(128 + ((p.source - p.x) * 254) / scale)} ${Math.round(128 - (p.y * 254) / scale)} 0)"/>`,
      ),
    ].join("");
    if (stops !== previous) {
      previous = stops;
      const map = `<svg xmlns="http://www.w3.org/2000/svg" width="790" height="1"><defs><linearGradient id="g">${stops}</linearGradient></defs><rect width="790" height="1" fill="url(#g)"/></svg>`;
      image.setAttribute("href", `data:image/svg+xml,${encodeURIComponent(map)}`);
      displacement.setAttribute("scale", String(scale));
    }
    setDynamicStyle(
      panel,
      stylex.props(
        s.screenClip(screenClip(screenOutline(0, INNER_HALF_WIDTH, SCREEN_RADIUS, 0, profile))),
      ).style,
    );
  };
}

// Ramp curves adapted from Duo, Copyright (c) 2026 Doan Labs (MIT).
// See THIRD_PARTY_NOTICES.md. Filter the iframe raster, not a cross-document backdrop.
function foldRamp(panel: HTMLElement, free: "left" | "right") {
  const width = Number.parseFloat(panel.style.width);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", stylex.props(s.foldDefinitions).className ?? "");
  svg.setAttribute("aria-hidden", "true");
  const filter = document.createElementNS(svg.namespaceURI, "filter");
  const id = `device-fold-${crypto.randomUUID()}`;
  for (const [name, value] of Object.entries({
    id,
    x: "0",
    y: "0",
    width: String(width),
    height: String(SCREEN_HEIGHT),
    filterUnits: "userSpaceOnUse",
    "color-interpolation-filters": "sRGB",
  }))
    filter.setAttribute(name, value);
  const merge = document.createElementNS(svg.namespaceURI, "feMerge");
  const source = document.createElementNS(svg.namespaceURI, "feMergeNode");
  source.setAttribute("in", "SourceGraphic");
  merge.append(source);
  // Three smoothly masked blur levels avoid hard bands without twelve full-screen passes.
  const radii = [3, 12, 30];
  const layers = radii.map((_, i) => {
    const blur = document.createElementNS(svg.namespaceURI, "feGaussianBlur");
    blur.setAttribute("in", "SourceGraphic");
    blur.setAttribute("stdDeviation", "0");
    blur.setAttribute("edgeMode", "duplicate");
    blur.setAttribute("result", `blur${i}`);
    const mask = document.createElementNS(svg.namespaceURI, "feImage");
    const end = [1, 0.8, 0.45][i]!;
    const gradient = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${SCREEN_HEIGHT}"><defs><linearGradient id="g" x1="${free === "left" ? "0%" : "100%"}" x2="${free === "left" ? "100%" : "0%"}"><stop stop-color="white"/><stop offset="${end}" stop-color="white" stop-opacity="0"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`;
    mask.setAttribute("href", `data:image/svg+xml,${encodeURIComponent(gradient)}`);
    for (const [name, value] of Object.entries({
      x: "0",
      y: "0",
      width: String(width),
      height: String(SCREEN_HEIGHT),
      result: `mask${i}`,
    }))
      mask.setAttribute(name, value);
    const clip = document.createElementNS(svg.namespaceURI, "feComposite");
    clip.setAttribute("in", `blur${i}`);
    clip.setAttribute("in2", `mask${i}`);
    clip.setAttribute("operator", "in");
    clip.setAttribute("result", `band${i}`);
    const node = document.createElementNS(svg.namespaceURI, "feMergeNode");
    node.setAttribute("in", `band${i}`);
    merge.append(node);
    filter.append(blur, mask, clip);
    return blur;
  });
  filter.append(merge);
  svg.append(filter);
  panel.append(svg);
  const shade = document.createElement("div");
  const props = stylex.props(s.foldLayer, s.foldShade("none"));
  shade.className = props.className ?? "";
  setDynamicStyle(shade, props.style);
  shade.setAttribute("aria-hidden", "true");
  panel.append(shade);
  let previous = -1;
  return (progress: number) => {
    if (progress === previous) return;
    previous = progress;
    const motion = progress * progress * (3 - 2 * progress);
    const curve = (distance: number, clear: number) =>
      Math.max(0, (1 - clear - distance) / (1 - clear)) ** 1.35;
    setDynamicStyle(panel, stylex.props(s.foldFilter(motion > 0 ? `url("#${id}")` : "none")).style);
    layers.forEach((layer, i) => {
      layer.setAttribute("stdDeviation", String(radii[i]! * motion));
    });
    shade.style.display = motion > 0 ? "block" : "none";
    const stops = [0, 0.25, 0.5, 0.75, 1]
      .map((v) => `rgb(0 0 0 / ${Math.min(1, 2 * motion * curve(v, 0.2))}) ${v * 100}%`)
      .join(",");
    setDynamicStyle(
      shade,
      stylex.props(s.foldShade(`linear-gradient(${free === "left" ? "90deg" : "270deg"},${stops})`))
        .style,
    );
  };
}

/** Procedural hardware only: no device model assets or simulated operating system. */
export function createDeviceScene(
  host: HTMLElement,
  src: string,
  content: DeviceScreens,
): DeviceScene {
  // Construct WebGL first so unsupported devices fail before acquiring DOM/resources.
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.className = stylex.props(s.webgl).className ?? "";
  renderer.domElement.setAttribute("aria-hidden", "true");
  const screens = document.createElement("div");
  screens.className = stylex.props(s.domScene).className ?? "";
  host.append(renderer.domElement, screens);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-550, 550, 525, -525, 1, 10000);
  const device = new THREE.Group();
  // Keep the shared camera and DOM projection in pixel-sized world coordinates.
  device.scale.setScalar(100);
  const lid = new THREE.Group();
  lid.position.z = HINGE_Z;
  device.add(lid);
  scene.add(device);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.environmentIntensity = 1.35;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb5baa8, 1.8));
  const key = new THREE.DirectionalLight(0xfffcf5, 2.6);
  key.position.set(-6, 9, 8);
  scene.add(key);
  const edgeLight = new THREE.DirectionalLight(0xe8edf5, 2);
  edgeLight.position.set(6, 2, -3);
  scene.add(edgeLight);

  const metal = new THREE.MeshStandardMaterial({
    color: 0xb9b8b2,
    metalness: 1,
    roughness: 0.34,
  });
  const polished = new THREE.MeshStandardMaterial({
    color: 0xd4d7dc,
    metalness: 1,
    roughness: 0.12,
    side: THREE.DoubleSide,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x080a0d,
    metalness: 0.25,
    roughness: 0.28,
  });
  const seam = new THREE.MeshStandardMaterial({
    color: 0x24272c,
    metalness: 0.65,
    roughness: 0.46,
  });
  const antenna = new THREE.MeshStandardMaterial({ color: 0xe2e0d5, roughness: 0.7 });
  const ceramic = new THREE.MeshStandardMaterial({ color: 0xf7f6f2, roughness: 0.32 });
  const lensGlass = new THREE.MeshPhysicalMaterial({
    color: 0x161126,
    metalness: 0.15,
    roughness: 0.07,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
    clearcoat: 0.65,
    clearcoatRoughness: 0.06,
    iridescence: 0.12,
    iridescenceThicknessRange: [180, 300],
  });
  const lensCoating = new THREE.MeshPhysicalMaterial({
    color: 0x151827,
    metalness: 0.25,
    transparent: true,
    opacity: 0.07,
    roughness: 0.035,
    clearcoat: 1,
    clearcoatRoughness: 0.025,
    iridescence: 0.18,
    iridescenceThicknessRange: [180, 300],
    depthWrite: false,
  });
  const lensBaffle = new THREE.MeshStandardMaterial({
    color: 0x050506,
    roughness: 0.72,
    side: THREE.DoubleSide,
  });
  const lensSeat = new THREE.MeshStandardMaterial({
    color: 0x555559,
    metalness: 0.2,
    roughness: 0.48,
  });
  const apertureStop = new THREE.MeshBasicMaterial({ color: 0x020204 });
  const lensRim = new THREE.MeshStandardMaterial({
    color: 0xe3d9c8,
    metalness: 1,
    roughness: 0.095,
    side: THREE.DoubleSide,
  });
  // Reserve transparent screen holes in the foreground canvas using real surface depth.
  const screenDepth = new THREE.MeshBasicMaterial({ colorWrite: false });

  function half(parent: THREE.Group, x: number, z: number, left: number, right: number) {
    // A one-pixel overlap hides raster cracks where the rigid section meets the curved rail.
    const trim = FLEX_WIDTH / 2 - 0.01;
    const width = HALF_BODY - trim;
    x += (Math.sign(x) * trim) / 2;
    const shell = new THREE.ExtrudeGeometry(
      outline(width - 0.08, BODY_HEIGHT - 0.08, left, right),
      {
        depth: 0.24,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelSegments: 8,
        steps: 1,
        curveSegments: 24,
      },
    );
    shell.translate(0, 0, -0.12);
    const body = new THREE.Mesh(shell, metal);
    body.position.set(x, 0, z);
    parent.add(body);
    // Narrow bright lips separate the machined edges from the satin sidewall.
    const lip = outline(
      width - 0.015,
      BODY_HEIGHT - 0.015,
      left ? left + 0.02 : 0,
      right ? right + 0.02 : 0,
    );
    lip.holes.push(
      outline(width - 0.075, BODY_HEIGHT - 0.075, left ? left - 0.01 : 0, right ? right - 0.01 : 0),
    );
    const lipGeometry = new THREE.ShapeGeometry(lip, 24);
    for (const face of [-1, 1]) {
      const edge = new THREE.Mesh(lipGeometry, polished);
      edge.position.set(x, 0, z + face * 0.15);
      parent.add(edge);
    }
    const joint = new THREE.ExtrudeGeometry(
      outline(width - 0.076, BODY_HEIGHT - 0.076, left, right),
      { depth: 0.012, bevelEnabled: false, curveSegments: 24, steps: 1 },
    );
    const gasket = new THREE.Mesh(joint, seam);
    gasket.position.set(x, 0, z - 0.006);
    parent.add(gasket);
    // Cover the polished cut edge without moving the outside bezel boundary.
    const bezel = new THREE.Mesh(
      new THREE.ShapeGeometry(outline(width - 0.03, BODY_HEIGHT - 0.05, left, right), 20),
      dark,
    );
    bezel.position.set(x - Math.sign(x) * 0.01, 0, z + 0.163);
    parent.add(bezel);
  }
  half(device, -HALF_BODY / 2, 0, 0.38, 0);
  half(lid, HALF_BODY / 2, -HINGE_Z, 0, 0.38);

  function strip(section: readonly (readonly [number, number])[], material: THREE.Material) {
    const geometry = new THREE.PlaneGeometry(FLEX_WIDTH, 1, FLEX_SEGMENTS, section.length - 1);
    const positions = geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i++) {
      const [y, z] = section[Math.floor(i / (FLEX_SEGMENTS + 1))]!;
      positions.setY(i, y);
      positions.setZ(i, z);
    }
    geometry.computeVertexNormals();
    return new THREE.Mesh(geometry, material);
  }

  // Match the rigid extrusion's rounded top/bottom cross-section, including its sidewall.
  const rail: [number, number][] = [];
  for (let i = 0; i <= 8; i++) {
    const t = ((i / 8) * Math.PI) / 2;
    rail.push([BODY_HEIGHT / 2 - 0.04 + 0.04 * Math.sin(t), -0.12 - 0.04 * Math.cos(t)]);
  }
  for (let i = 0; i <= 8; i++) {
    const t = ((i / 8) * Math.PI) / 2;
    rail.push([BODY_HEIGHT / 2 - 0.04 + 0.04 * Math.cos(t), 0.12 + 0.04 * Math.sin(t)]);
  }

  const creaseDepth = strip(
    [
      [SCREEN_HEIGHT / 200, 0.18],
      [-SCREEN_HEIGHT / 200, 0.18],
    ],
    screenDepth,
  );
  creaseDepth.renderOrder = -1;
  const flex = [
    creaseDepth,
    strip(
      [
        [(BODY_HEIGHT - 0.05) / 2, 0.163],
        [-(BODY_HEIGHT - 0.05) / 2, 0.163],
      ],
      dark,
    ),
    ...[-1, 1].flatMap((end) => {
      const section = rail.map(([y, z]) => [y * end, z] as const);
      if (end < 0) section.reverse();
      return [
        strip(section, metal),
        ...[-1, 1].map((face) =>
          strip(
            [
              [end * (BODY_HEIGHT / 2 - 0.0075), face * 0.15],
              [end * (BODY_HEIGHT / 2 - 0.0375), face * 0.15],
            ],
            polished,
          ),
        ),
      ];
    }),
  ].map((mesh) => ({ mesh, rest: mesh.geometry.getAttribute("position").clone() }));
  device.add(...flex.map(({ mesh }) => mesh));

  function hingeCylinder(radius: number, height: number) {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const positions = geometry.getAttribute("position");
    // Recess the inward face below the bezel; a full barrel intersects the flexible display.
    for (let i = 0; i < positions.count; i++) {
      positions.setZ(i, Math.min(positions.getZ(i), 0.15 - HINGE_Z));
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  // Alternating knuckles share the lid's actual pivot, so the joint stays coaxial.
  const shaft = new THREE.Mesh(hingeCylinder(0.073, BODY_HEIGHT - 0.48), seam);
  shaft.position.z = HINGE_Z;
  device.add(shaft);
  const pitch = (BODY_HEIGHT - 0.79) / 7;
  const sleeveGeometry = hingeCylinder(0.104, pitch - 0.05);
  const collarGeometry = hingeCylinder(0.107, 0.022);
  for (let i = 0; i < 7; i++) {
    const moving = i % 2 === 1;
    const parent = moving ? lid : device;
    const z = moving ? 0 : HINGE_Z;
    const y = (i - 3) * pitch;
    const sleeve = new THREE.Mesh(sleeveGeometry, metal);
    sleeve.position.set(0, y, z);
    parent.add(sleeve);
    for (const end of [-1, 1]) {
      const collar = new THREE.Mesh(collarGeometry, polished);
      collar.position.set(0, y + (end * (pitch - 0.072)) / 2, z);
      parent.add(collar);
    }
  }
  for (const end of [-1, 1]) {
    const cap = new THREE.Mesh(hingeCylinder(0.105, 0.09), polished);
    cap.position.set(0, end * (BODY_HEIGHT / 2 - 0.305), HINGE_Z);
    device.add(cap);
    const inset = new THREE.Mesh(hingeCylinder(0.047, 0.004), seam);
    inset.position.set(0, end * (BODY_HEIGHT / 2 - 0.258), HINGE_Z);
    device.add(inset);
  }
  // Duo keeps all four caps on the fixed half. Our folding direction is mirrored.
  for (const [y, length] of [
    [0.9, 0.62],
    [-1.25, 0.46],
  ] as const) {
    const cap = new THREE.Mesh(
      new THREE.ExtrudeGeometry(outline(0.12, length, 0.06, 0.06), {
        depth: 0.045,
        bevelEnabled: true,
        bevelSize: 0.012,
        bevelThickness: 0.012,
        bevelSegments: 3,
        curveSegments: 12,
      }),
      polished,
    );
    cap.rotation.y = -Math.PI / 2;
    cap.position.set(-HALF_BODY - 0.005, y, 0);
    device.add(cap);
  }
  for (const x of [-2.9, -2.25]) {
    const cap = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.36, 4, 12), polished);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(x, BODY_HEIGHT / 2 + 0.018, 0);
    device.add(cap);
  }
  for (const [parent, side, z] of [
    [device, -1, 0],
    [lid, 1, -HINGE_Z],
  ] as const) {
    for (const end of [-1, 1]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.055, 0.28), antenna);
      band.position.set(side * (HALF_BODY + 0.001), end * (BODY_HEIGHT / 2 - 0.63), z);
      parent.add(band);
    }
  }

  // Dimensions measured from Duo's debug mesh bounds, halved to our inner-screen scale.
  // Rebuild only the visible hardware, without shipping Apple's model or textures.
  const rear = new THREE.Mesh(
    new THREE.ShapeGeometry(outline(HALF_BODY - 0.09, BODY_HEIGHT - 0.09, 0.04, 0.35), 24),
    ceramic,
  );
  rear.rotation.y = Math.PI;
  rear.position.set(-HALF_BODY / 2, 0, -0.165);
  device.add(rear);
  const lenses = [
    [-2.469, 0.102, 0.19, lensBaffle],
    [-3.358, 0.125, 0.275, lensSeat],
  ] as const;
  const plateauShape = outline(2.79, 1.058, 0.529, 0.529);
  for (const [x] of lenses) {
    const bore = new THREE.Path();
    bore.absarc(-2.48 - x, 0, 0.354, 0, Math.PI * 2, true);
    plateauShape.holes.push(bore);
  }
  const plateau = new THREE.Mesh(
    new THREE.ExtrudeGeometry(plateauShape, {
      depth: 0.055,
      bevelEnabled: true,
      bevelSize: 0.1,
      bevelThickness: 0.07,
      bevelSegments: 8,
      curveSegments: 32,
    }),
    ceramic,
  );
  plateau.rotation.y = Math.PI;
  plateau.position.set(-2.48, 2.184, -0.245);
  device.add(plateau);

  function rearDisc(
    x: number,
    y: number,
    z: number,
    radius: number,
    depth: number,
    material: THREE.Material,
  ) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, 48), material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y, z);
    device.add(mesh);
  }
  for (const [x, aperture, seatRadius, seatMaterial] of lenses) {
    const rim = new THREE.Mesh(
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(0.354, -0.423),
          new THREE.Vector2(0.354, -0.29),
          new THREE.Vector2(0.399, -0.29),
          new THREE.Vector2(0.406, -0.298),
          new THREE.Vector2(0.406, -0.409),
          new THREE.Vector2(0.403, -0.418),
          new THREE.Vector2(0.394, -0.425),
          new THREE.Vector2(0.363, -0.425),
          new THREE.Vector2(0.354, -0.423),
        ],
        96,
      ),
      lensRim,
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, 2.184, 0);
    device.add(rim);
    // The optical stop sits behind the front glass, inside an open tapered barrel.
    const barrel = new THREE.Mesh(
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(0.354, -0.423),
          new THREE.Vector2(0.329, -0.414),
          new THREE.Vector2(seatRadius, -0.355),
          new THREE.Vector2(seatRadius, -0.33),
        ],
        64,
      ),
      lensBaffle,
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(x, 2.184, 0);
    device.add(barrel);
    rearDisc(x, 2.184, -0.339, seatRadius + 0.003, 0.004, seatMaterial);
    rearDisc(x, 2.184, -0.343, aperture, 0.004, apertureStop);
    // A shallow spherical cap avoids the grazing-normal ring of a flattened hemisphere.
    const opticalRadius = (aperture * 1.6) / Math.sin(0.5);
    const opticalCap = new THREE.SphereGeometry(opticalRadius, 48, 16, 0, Math.PI * 2, 0, 0.5);
    opticalCap.translate(0, -opticalRadius * Math.cos(0.5), 0);
    const innerGlass = new THREE.Mesh(opticalCap, lensGlass);
    innerGlass.rotation.x = -Math.PI / 2;
    innerGlass.position.set(x, 2.184, -0.348);
    device.add(innerGlass);
    const coating = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 64, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      lensCoating,
    );
    coating.scale.y = 0.02;
    coating.rotation.x = -Math.PI / 2;
    coating.position.set(x, 2.184, -0.426);
    device.add(coating);
  }
  const flash = new THREE.Mesh(
    new THREE.ExtrudeGeometry(outline(0.17, 0.08, 0.04, 0.04), {
      depth: 0.008,
      bevelEnabled: true,
      bevelSize: 0.008,
      bevelThickness: 0.004,
      bevelSegments: 3,
      curveSegments: 12,
    }),
    antenna,
  );
  flash.rotation.y = Math.PI;
  flash.position.set(-1.636, 2.4, -0.372);
  device.add(flash);
  rearDisc(-1.636, 1.962, -0.373, 0.101, 0.008, antenna);

  // Sidewall apertures are dark recessed-looking inlays, not through-body CSG.
  function edgeOpening(
    parent: THREE.Group,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    material: THREE.Material,
  ) {
    const mesh = new THREE.Mesh(
      new THREE.ShapeGeometry(outline(width, height, height / 2, height / 2), 16),
      material,
    );
    mesh.rotation.x = y < 0 ? Math.PI / 2 : -Math.PI / 2;
    mesh.position.set(x, y, z);
    parent.add(mesh);
  }
  const bottom = -BODY_HEIGHT / 2 - 0.001;
  // Camera half: two groups of four holes, with two screws between them.
  for (const center of [-3.05, -1.05]) {
    for (let i = 0; i < 4; i++) {
      edgeOpening(device, center + (i - 1.5) * 0.11, bottom, 0, 0.064, 0.064, dark);
    }
  }
  for (const [parent, x, z] of [
    [device, -2.05, 0],
    [lid, 2.05, -HINGE_Z],
  ] as const) {
    for (const offset of [-0.36, 0.36]) {
      edgeOpening(parent, x + offset, bottom - 0.001, z, 0.072, 0.072, polished);
      edgeOpening(parent, x + offset, bottom - 0.002, z, 0.032, 0.032, dark);
    }
    for (const offset of [-0.6, 0.6]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.008, 0.28), antenna);
      band.position.set(x + offset, bottom, z);
      parent.add(band);
    }
  }
  // Cover half: USB-C below, six acoustic holes above. The port has a visible tongue.
  edgeOpening(lid, 2.05, bottom - 0.002, -HINGE_Z, 0.44, 0.14, polished);
  edgeOpening(lid, 2.05, bottom - 0.003, -HINGE_Z, 0.39, 0.105, dark);
  edgeOpening(lid, 2.05, bottom - 0.004, -HINGE_Z, 0.28, 0.025, seam);
  for (let i = 0; i < 6; i++) {
    edgeOpening(lid, 2.05 + (i - 2.5) * 0.13, -bottom, -HINGE_Z, 0.064, 0.064, dark);
  }

  function screen(title: string, width: number, x: number, z: number, cover = false) {
    const element = document.createElement("div");
    const surface: Surface =
      title === "Cover display" ? "cover" : title === "Inner display" ? "inner" : "inner-right";
    const start = surface === "inner-right" ? SCREEN_WIDTH * 0.5 - INNER_HALF_WIDTH : 0;
    const end = surface === "inner" ? INNER_HALF_WIDTH : width;
    const left = surface === "inner-right" ? 0 : SCREEN_RADIUS;
    const right = cover ? 6 : surface === "inner-right" ? SCREEN_RADIUS : 0;
    const opening = screenOutline(start, end, left, right);
    const clip =
      surface === "inner"
        ? flatInnerClip
        : screenClip(
            surface === "inner-right" ? screenOutline(start - 0.5, end, left, right) : opening,
          );
    const screenProps = stylex.props(
      s.screen,
      s.screenHeight(SCREEN_HEIGHT),
      surface === "inner" && s.warpedScreen,
      s.screenClip(clip),
      s.foldFilter("none"),
    );
    element.className = screenProps.className ?? "";
    setDynamicStyle(element, screenProps.style);
    element.style.width = `${width}px`;
    const frame = document.createElement("iframe");
    frame.title = title;
    content.mount(frame, surface);
    frame.src = src;
    const frameProps = stylex.props(s.screenFrame, s.screenHeight(SCREEN_HEIGHT));
    frame.className = frameProps.className ?? "";
    setDynamicStyle(frame, frameProps.style);
    frame.style.width = `${cover ? width : SCREEN_WIDTH}px`;
    if (title === "Inner display, right half") {
      frame.style.left = `${-SCREEN_WIDTH / 2}px`;
      frame.tabIndex = -1;
      frame.setAttribute("aria-hidden", "true");
    }
    element.append(frame);
    screens.append(element);
    const panel = new THREE.Object3D();
    panel.scale.setScalar(0.01);
    panel.position.set(x, 0, z);
    const depth = new THREE.Mesh(
      new THREE.ShapeGeometry(opening, 24).translate(-width / 2, SCREEN_HEIGHT / 2, 0),
      screenDepth,
    );
    depth.renderOrder = -1;
    panel.add(depth);
    if (cover) {
      panel.rotation.y = Math.PI;
    }
    const frost =
      surface === "inner" ? null : foldRamp(element, surface === "inner-right" ? "right" : "left");
    return { panel, element, frame, width, surface, frost };
  }

  const inner = screen("Inner display", SCREEN_WIDTH, 0, 0.18);
  const warp = hingeWarp(inner.element);
  const mirror = screen(
    "Inner display, right half",
    SCREEN_WIDTH / 2,
    SCREEN_WIDTH / 400,
    0.18 - HINGE_Z,
  );
  const cover = screen("Cover display", 387, HALF_BODY / 2, -0.18 - HINGE_Z, true);
  device.add(inner.panel);
  lid.add(mirror.panel, cover.panel);
  const coverBezel = new THREE.Mesh(
    new THREE.ShapeGeometry(outline(HALF_BODY - 0.06, BODY_HEIGHT - 0.06, 0.38, 0.06), 20),
    dark,
  );
  coverBezel.position.set(HALF_BODY / 2, 0, -0.164 - HINGE_Z);
  coverBezel.rotation.y = Math.PI;
  lid.add(coverBezel);

  const controls = new OrbitControls(camera, host);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.65;
  controls.maxPolarAngle = Math.PI - 0.65;
  controls.rotateSpeed = 0.5;
  let hingeAngle = 180;
  let busy = false;
  const distance = 1700;
  let queued = 0;
  let disposed = false;
  const normal = new THREE.Vector3();
  const towardCamera = new THREE.Vector3();
  const projection = new THREE.Matrix4();
  const viewport = new THREE.Matrix4();
  const local = new THREE.Matrix4();
  const curvePoint = new THREE.Vector3();

  function draw() {
    if (disposed) return;
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld();
    camera.getWorldDirection(towardCamera).negate();
    for (const { panel, element, frame, width, surface, frost } of [inner, mirror, cover]) {
      normal.set(0, 0, 1).transformDirection(panel.matrixWorld);
      const facing = normal.dot(towardCamera) > 0;
      const shown =
        facing &&
        (panel !== mirror.panel || hingeAngle < 179.5) &&
        (panel !== inner.panel || hingeAngle > 0.5);
      // The moving depth plane also cuts out the right half of the single open-screen DOM.
      panel.visible = facing && (panel !== inner.panel || hingeAngle > 0.5);
      element.style.display = shown ? "block" : "none";
      frame.style.visibility = content.isReady(surface) ? "visible" : "hidden";
      element.inert =
        !shown ||
        busy ||
        !content.isReady(surface) ||
        (surface === "inner" ? hingeAngle < 179.5 : surface === "cover" ? hingeAngle > 0.5 : true);
      element.style.pointerEvents = element.inert ? "none" : "auto";
      frame.setAttribute("aria-hidden", String(element.inert));
      frame.tabIndex = element.inert ? -1 : 0;
      frost?.(shown ? Math.min(1, (surface === "cover" ? hingeAngle : 180 - hingeAngle) / 90) : 0);
      if (!shown) continue;
      // One projected plane avoids WebKit's nested perspective/iframe compositing glitches.
      local.set(1, 0, 0, -width / 2, 0, -1, 0, SCREEN_HEIGHT / 2, 0, 0, 1, 0, 0, 0, 0, 1);
      projection
        .copy(viewport)
        .multiply(camera.projectionMatrix)
        .multiply(camera.matrixWorldInverse)
        .multiply(panel.matrixWorld)
        .multiply(local);
      const m = projection.elements;
      element.style.transform = `matrix(${m[0]},${m[1]},${m[4]},${m[5]},${m[12]},${m[13]})`;
    }
    const profile: { x: number; y: number; source: number }[] = [];
    if (inner.panel.visible && hingeAngle < 179.5) {
      const inverse = new DOMMatrix(inner.element.style.transform).inverse();
      for (let i = 0; i <= FLEX_SEGMENTS; i++) {
        const t = i / FLEX_SEGMENTS;
        hingePoint(curvePoint, t, THREE.MathUtils.degToRad(180 - hingeAngle), 0.18)
          .applyMatrix4(device.matrixWorld)
          .project(camera)
          .applyMatrix4(viewport);
        const p = inverse.transformPoint(new DOMPoint(curvePoint.x, curvePoint.y));
        // Stop at the silhouette: the return side of the curve faces away from the viewer.
        if (profile.length && p.x <= profile[profile.length - 1]!.x) break;
        profile.push({
          x: p.x,
          y: p.y - SCREEN_HEIGHT / 2,
          source: SCREEN_WIDTH / 2 + (t - 0.5) * FLEX_WIDTH * 100,
        });
      }
    }
    warp(profile);
    creaseDepth.visible = inner.panel.visible;
    renderer.render(scene, camera);
  }

  function resize() {
    const { clientWidth: width, clientHeight: height } = host;
    if (!width || !height) return;
    renderer.setSize(width, height);
    viewport.set(width / 2, 0, 0, width / 2, 0, -height / 2, 0, height / 2, 0, 0, 0, 0, 0, 0, 0, 1);
    // Parallel projection keeps iframe rasterization stable in WebKit while the
    // hardware and both screens still share the same real 3D camera and hinge.
    const aspect = width / height;
    const span = Math.max(1000, 1050 / aspect);
    camera.left = (-span * aspect) / 2;
    camera.right = (span * aspect) / 2;
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.updateProjectionMatrix();
    controls.update();
    draw();
  }
  function resetView() {
    camera.position.set(-0.24, 0.16, 1).normalize().multiplyScalar(distance).add(controls.target);
    controls.update();
    draw();
  }
  controls.addEventListener("change", draw);
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(queued);
    queued = requestAnimationFrame(resize);
  });
  observer.observe(host);
  const unsubscribe = content.subscribePaint(draw);
  resetView();
  resize();

  return {
    setHinge(angle, interacting) {
      hingeAngle = angle;
      busy = interacting;
      const bend = THREE.MathUtils.degToRad(180 - angle);
      lid.rotation.y = -bend;
      for (const { mesh, rest } of flex) {
        const positions = mesh.geometry.getAttribute("position");
        for (let i = 0; i < positions.count; i++) {
          const t = (i % (FLEX_SEGMENTS + 1)) / FLEX_SEGMENTS;
          hingePoint(curvePoint, t, bend, rest.getZ(i));
          positions.setX(i, curvePoint.x);
          positions.setZ(i, curvePoint.z);
        }
        positions.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
        mesh.geometry.computeBoundingSphere();
      }
      const center = (-HALF_BODY * (1 - Math.cos(bend))) / 4;
      device.position.x = -center * 100;
      draw();
    },
    resetView,
    dispose() {
      disposed = true;
      unsubscribe();
      cancelAnimationFrame(queued);
      observer.disconnect();
      controls.dispose();
      const geometries = new Set<THREE.BufferGeometry>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) geometries.add(object.geometry);
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of [
        metal,
        polished,
        dark,
        seam,
        antenna,
        ceramic,
        lensGlass,
        lensCoating,
        lensBaffle,
        lensSeat,
        apertureStop,
        lensRim,
        screenDepth,
      ])
        material.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      screens.remove();
    },
  };
}
