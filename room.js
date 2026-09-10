/* =============================================================
   ROYAL MAJESTIC - executive suite, procedural three.js model
   Built in code, no downloaded meshes. Reference: the group's own
   room photography (circular dropped ceiling, warm wood, city glass).
   Stylised reconstruction, not a survey of the real room.
   ============================================================= */
(function () {
  "use strict";

  var mount = document.getElementById("room3d");
  if (!mount) return;
  if (!window.THREE) {
    window.__rmFail = "three.js did not load. Something is blocking cdn.jsdelivr.net (ad blocker, VPN, or no connection).";
    return;
  }
  try {
    var probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) {
      window.__rmFail = "This browser has WebGL turned off or unavailable.";
      return;
    }
  } catch (probeErr) {
    window.__rmFail = "WebGL probe threw: " + probeErr.message;
    return;
  }

  var T = window.THREE;
  try {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isSmall = window.matchMedia("(max-width: 767px)").matches;
  var SHOT = location.search.indexOf("shot") !== -1;

  /* ---------- renderer ---------------------------------------- */
  var renderer = new T.WebGLRenderer({
    antialias: !isSmall,
    powerPreference: "high-performance",
    preserveDrawingBuffer: SHOT
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.80;
  renderer.shadowMap.enabled = !isSmall;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  mount.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";

  var scene = new T.Scene();
  scene.background = new T.Color(0x070605);

  var camera = new T.PerspectiveCamera(60, 1, 0.05, 140);

  /* ---------- procedural textures ------------------------------ */
  function cv(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function tex(canvas, rx, ry) {
    var t = new T.CanvasTexture(canvas);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.colorSpace = T.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  function carpetTexture() {
    var c = cv(256, 256), x = c.getContext("2d");
    x.fillStyle = "#2a231c"; x.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 22000; i++) {
      var v = 24 + Math.random() * 30;
      x.fillStyle = "rgba(" + (v + 16) + "," + (v + 9) + "," + v + ",.55)";
      x.fillRect(Math.random() * 256, Math.random() * 256, 1.8, 1.8);
    }
    // faint diamond weave, the way hotel carpet actually reads
    x.strokeStyle = "rgba(214,178,120,.05)"; x.lineWidth = 1.2;
    for (var g = -256; g < 512; g += 22) {
      x.beginPath(); x.moveTo(g, 0); x.lineTo(g + 256, 256); x.stroke();
      x.beginPath(); x.moveTo(g + 256, 0); x.lineTo(g, 256); x.stroke();
    }
    return tex(c, 8, 6);
  }

  function woodTexture(dark) {
    var c = cv(256, 256), x = c.getContext("2d");
    var g = x.createLinearGradient(0, 0, 0, 256);
    if (dark) { g.addColorStop(0, "#3b2716"); g.addColorStop(.5, "#4a3220"); g.addColorStop(1, "#31200f"); }
    else      { g.addColorStop(0, "#6b4526"); g.addColorStop(.5, "#7d5430"); g.addColorStop(1, "#5d3c21"); }
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 170; i++) {
      x.strokeStyle = "rgba(28,16,8," + (.05 + Math.random() * .15) + ")";
      x.lineWidth = .4 + Math.random() * 1.5;
      x.beginPath();
      var y = Math.random() * 256;
      x.moveTo(0, y);
      for (var px = 0; px <= 256; px += 16) x.lineTo(px, y + Math.sin(px * .05 + i) * 2.2);
      x.stroke();
    }
    return tex(c, 3, 3);
  }

  function plasterTexture() {
    var c = cv(256, 256), x = c.getContext("2d");
    x.fillStyle = "#c7bfb2"; x.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 5200; i++) {
      x.fillStyle = "rgba(255,255,255," + (Math.random() * .05) + ")";
      x.fillRect(Math.random() * 256, Math.random() * 256, 2.4, 2.4);
    }
    return tex(c, 4, 2);
  }

  function skylineTexture() {
    var c = cv(1400, 620), x = c.getContext("2d");
    var sky = x.createLinearGradient(0, 0, 0, 620);
    sky.addColorStop(0, "#040910"); sky.addColorStop(.5, "#0c1826"); sky.addColorStop(1, "#22293a");
    x.fillStyle = sky; x.fillRect(0, 0, 1400, 620);

    var haze = x.createLinearGradient(0, 340, 0, 620);
    haze.addColorStop(0, "rgba(214,148,64,0)"); haze.addColorStop(1, "rgba(214,148,64,.34)");
    x.fillStyle = haze; x.fillRect(0, 340, 1400, 280);

    // three depth layers, far towers dimmer than near ones
    [[.22, 60, 190, 34], [.42, 90, 300, 26], [.72, 130, 420, 18]].forEach(function (L) {
      var alpha = L[0], minH = L[1], maxH = L[2], count = L[3];
      for (var i = 0; i < count; i++) {
        var w = 26 + Math.random() * 86;
        var bx = Math.random() * 1400 - w / 2;
        var h = minH + Math.random() * (maxH - minH);
        x.fillStyle = "rgba(6,10,17," + alpha + ")";
        x.fillRect(bx, 620 - h, w, h);
        for (var wy = 620 - h + 12; wy < 606; wy += 13) {
          for (var wx = bx + 6; wx < bx + w - 6; wx += 10) {
            if (Math.random() > .58) {
              x.fillStyle = Math.random() > .74
                ? "rgba(255,214,150," + (.5 + alpha * .5) + ")"
                : "rgba(176,204,240," + (.28 + alpha * .4) + ")";
              x.fillRect(wx, wy, 3.6, 5.4);
            }
          }
        }
      }
    });
    return tex(c, 1, 1);
  }

  function artTexture() {
    var c = cv(240, 300), x = c.getContext("2d");
    x.fillStyle = "#100d09"; x.fillRect(0, 0, 240, 300);
    var bands = ["#8A6318", "#C9982F", "#E7C777", "#4c3316", "#221a12"];
    for (var i = 0; i < 18; i++) {
      x.fillStyle = bands[i % bands.length];
      x.globalAlpha = .16 + Math.random() * .42;
      var y = Math.random() * 300;
      x.beginPath(); x.moveTo(0, y);
      x.bezierCurveTo(70, y - 34 + Math.random() * 68, 160, y + 34 - Math.random() * 68, 240, y);
      x.lineTo(240, y + 12 + Math.random() * 26); x.lineTo(0, y + 18); x.closePath(); x.fill();
    }
    x.globalAlpha = 1;
    return tex(c, 1, 1);
  }

  /* ---------- materials ---------------------------------------- */
  var M = {
    plaster:  new T.MeshStandardMaterial({ map: plasterTexture(), color: 0xb9b2a6, roughness: .97, metalness: 0 }),
    ceiling:  new T.MeshStandardMaterial({ color: 0xb6b0a5, roughness: 1, metalness: 0 }),
    coveFace: new T.MeshStandardMaterial({ color: 0xbdb6aa, roughness: 1, metalness: 0, side: T.DoubleSide }),
    carpet:   new T.MeshStandardMaterial({ map: carpetTexture(), roughness: 1, metalness: 0 }),
    wood:     new T.MeshStandardMaterial({ map: woodTexture(false), roughness: .48, metalness: .08 }),
    woodDark: new T.MeshStandardMaterial({ map: woodTexture(true), roughness: .44, metalness: .1 }),
    linen:    new T.MeshStandardMaterial({ color: 0xe9e4d9, roughness: .94, metalness: 0 }),
    duvet:    new T.MeshStandardMaterial({ color: 0xefeade, roughness: .96, metalness: 0 }),
    gold:     new T.MeshStandardMaterial({ color: 0xc9982f, roughness: .22, metalness: .98 }),
    goldSoft: new T.MeshStandardMaterial({ color: 0xa8801f, roughness: .38, metalness: .85 }),
    dark:     new T.MeshStandardMaterial({ color: 0x100e0c, roughness: .6, metalness: .16 }),
    rug:      new T.MeshStandardMaterial({ color: 0x453d31, roughness: 1, metalness: 0 }),
    velvet:   new T.MeshStandardMaterial({ color: 0x4a3d24, roughness: .92, metalness: .04 }),
    accent:   new T.MeshStandardMaterial({ color: 0x8a6a22, roughness: .84, metalness: .06 }),
    shade:    new T.MeshStandardMaterial({ color: 0xf6ead0, roughness: .92, emissive: 0xffb765, emissiveIntensity: 1.5, side: T.DoubleSide }),
    bulb:     new T.MeshBasicMaterial({ color: 0xffdca8 }),
    glass:    new T.MeshPhysicalMaterial({ color: 0xdfe7f0, roughness: .04, metalness: 0, transmission: .95, thickness: .01, transparent: true, opacity: .16 }),
    sheer:    new T.MeshStandardMaterial({ color: 0xd9d0bd, roughness: 1, transparent: true, opacity: .22, side: T.DoubleSide }),
    drape:    new T.MeshStandardMaterial({ color: 0x2e281f, roughness: .99, side: T.DoubleSide }),
    screen:   new T.MeshStandardMaterial({ color: 0x050708, roughness: .12, metalness: .6 }),
    chrome:   new T.MeshStandardMaterial({ color: 0x9aa0a8, roughness: .26, metalness: 1 }),
    art:      new T.MeshStandardMaterial({ map: artTexture(), roughness: .84 }),
    mirror:   new T.MeshStandardMaterial({ color: 0xb4b9be, roughness: .07, metalness: 1 }),
    city:     new T.MeshBasicMaterial({ map: skylineTexture() })
  };

  /* ---------- helpers ------------------------------------------ */
  function box(w, h, d) { return new T.BoxGeometry(w, h, d); }
  function add(geo, mat, x, y, z, parent) {
    var m = new T.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    (parent || scene).add(m);
    return m;
  }
  function flat(geo, mat, x, y, z, parent) {   // receives shadow, casts none
    var m = add(geo, mat, x, y, z, parent);
    m.castShadow = false;
    return m;
  }

  var W = 7, D = 5.6, H = 3.05;      // room, in metres
  var hx = W / 2, hz = D / 2;

  /* ---------- shell -------------------------------------------- */
  var floor = flat(new T.PlaneGeometry(W, D), M.carpet, 0, 0, 0);
  floor.rotation.x = -Math.PI / 2;

  var ceil = flat(new T.PlaneGeometry(W, D), M.ceiling, 0, H, 0);
  ceil.rotation.x = Math.PI / 2;

  flat(new T.PlaneGeometry(W, H), M.plaster, 0, H / 2, -hz);                       // back
  var right = flat(new T.PlaneGeometry(D, H), M.plaster, hx, H / 2, 0);            // right
  right.rotation.y = -Math.PI / 2;
  var front = flat(new T.PlaneGeometry(W, H), M.plaster, 0, H / 2, hz);            // front
  front.rotation.y = Math.PI;

  add(box(W, .11, .035), M.woodDark, 0, .055, -hz + .02);
  add(box(.035, .11, D), M.woodDark, hx - .02, .055, 0);
  add(box(W, .11, .035), M.woodDark, 0, .055, hz - .02);

  /* ---------- circular dropped ceiling --------------------------
     The signature move in the group's own room photography. A cove
     that glows rather than a lamp that glares. */
  var COVE_Z = -.7, COVE_R = 2.3;
  var coveSkirt = new T.Mesh(new T.CylinderGeometry(COVE_R, COVE_R, .2, 60, 1, true), M.coveFace);
  coveSkirt.position.set(0, H - .1, COVE_Z);
  coveSkirt.receiveShadow = true;
  scene.add(coveSkirt);
  flat(new T.CylinderGeometry(COVE_R, COVE_R, .03, 60), M.ceiling, 0, H - .2, COVE_Z);
  var coveRing = flat(new T.TorusGeometry(COVE_R - .09, .02, 8, 80), M.gold, 0, H - .045, COVE_Z);
  coveRing.rotation.x = Math.PI / 2;

  // recessed downlights, small and honest
  [[-2.1, 1.5], [2.1, 1.5], [-2.1, -1.7], [2.1, -1.7]].forEach(function (p, i) {
    flat(new T.CylinderGeometry(.055, .055, .012, 16), M.bulb, p[0], H - .012, p[1]);
    // on a phone only two of the four are real lights, the rest stay as fittings
    if (isSmall && i % 2) return;
    var s = new T.SpotLight(0xffdcb0, isSmall ? 5.2 : 4.0, 6.2, .6, .8, 1.8);
    s.position.set(p[0], H - .04, p[1]);
    s.target.position.set(p[0] * .78, 0, p[1] * .78);
    scene.add(s, s.target);
  });

  /* ---------- fluted feature wall behind the bed ----------------- */
  var headWall = new T.Group();
  headWall.position.set(0, 0, -hz + .05);
  scene.add(headWall);
  flat(box(3.9, 1.9, .06), M.dark, 0, 1.32, 0, headWall);
  // vertical flutes. Cylinders stand on Y by default, so no rotation.
  for (var f = 0; f < 25; f++) {
    var fl = add(new T.CylinderGeometry(.055, .055, 1.82, 12, 1, false, 0, Math.PI), M.velvet,
                 -1.82 + f * .152, 1.32, .055, headWall);
    fl.rotation.y = Math.PI;         // round face turned into the room
    fl.castShadow = false;
  }
  flat(box(4.0, .02, .1), M.gold, 0, 2.28, .015, headWall);
  flat(box(4.0, .02, .1), M.gold, 0, .36, .015, headWall);

  /* ---------- bed ------------------------------------------------ */
  var bed = new T.Group();
  bed.position.set(0, 0, -1.55);
  scene.add(bed);
  add(box(2.06, .22, 2.22), M.woodDark, 0, .13, 0, bed);          // plinth
  add(box(1.94, .34, 2.1), M.linen, 0, .4, 0, bed);               // mattress
  flat(box(1.98, .1, 2.14), M.velvet, 0, .27, 0, bed);            // valance under the mattress
  flat(box(2.0, .34, 1.8), M.duvet, 0, .53, .14, bed);            // duvet, draped over the sides
  flat(box(2.0, .06, .3), M.linen, 0, .705, -.72, bed);           // turn down fold
  flat(box(2.01, .02, .3), M.accent, 0, .706, .86, bed);         // runner at the foot
  flat(box(2.01, .008, .02), M.gold, 0, .718, .70, bed);

  // pillows, two flat and two propped
  [[-.47, -.84, .8, .16, -.1], [.47, -.84, .8, .16, -.1],
   [-.44, -.6, .66, .14, -.36], [.44, -.6, .66, .14, -.36]].forEach(function (p) {
    var pil = add(box(p[2], p[3], .32), M.linen, p[0], .62 + (p[4] < -.2 ? .19 : .08), p[1], bed);
    pil.rotation.x = p[4];
  });
  // two scatter cushions, the one bit of colour on the bed
  [-.3, .3].forEach(function (cx) {
    var s = add(box(.34, .1, .24), M.accent, cx, .78, -.44, bed);
    s.rotation.x = -.42;
  });

  /* ---------- nightstands and lamps ------------------------------- */
  var bedLights = [];
  [-1.48, 1.48].forEach(function (sx) {
    var ns = new T.Group(); ns.position.set(sx, 0, -2.2); scene.add(ns);
    add(box(.54, .04, .46), M.wood, 0, .52, 0, ns);
    add(box(.48, .44, .42), M.woodDark, 0, .3, 0, ns);
    flat(box(.44, .012, .012), M.gold, 0, .32, .215, ns);
    add(new T.CylinderGeometry(.08, .1, .035, 20), M.goldSoft, 0, .555, 0, ns);
    add(new T.CylinderGeometry(.015, .015, .3, 12), M.goldSoft, 0, .71, 0, ns);
    flat(new T.CylinderGeometry(.145, .185, .2, 24, 1, true), M.shade, 0, .94, 0, ns);
    var pl = new T.PointLight(0xffab52, isSmall ? 2.6 : 3.4, 4.6, 2);
    pl.position.set(sx, .95, -2.2);
    scene.add(pl);
    bedLights.push(pl);
  });

  /* ---------- glass wall, curtains, city --------------------------- */
  var glassWall = new T.Group();
  glassWall.position.set(-hx, 0, 0);
  scene.add(glassWall);
  [-2.0, -.5, 1.0, 2.5].forEach(function (mz) {
    add(box(.05, 2.42, .06), M.chrome, .04, 1.52, mz, glassWall);
  });
  add(box(.05, .06, D), M.chrome, .04, 2.73, 0, glassWall);
  add(box(.05, .06, D), M.chrome, .04, .31, 0, glassWall);
  var pane = flat(new T.PlaneGeometry(D - .1, 2.4), M.glass, .06, 1.52, 0, glassWall);
  pane.rotation.y = Math.PI / 2;
  flat(box(.09, .34, D), M.plaster, 0, 2.88, 0, glassWall);
  flat(box(.09, .32, D), M.plaster, 0, .16, 0, glassWall);

  // night city, well outside the glass so it reads as distance
  var city = flat(new T.PlaneGeometry(44, 20), M.city, -hx - 11, 5.2, .4);
  city.rotation.y = Math.PI / 2;
  city.receiveShadow = false;

  function curtain(mat, zA, zB, xOff, amp, seg) {
    var g = new T.PlaneGeometry(Math.abs(zB - zA), 2.5, seg, 1);
    var p = g.attributes.position;
    for (var i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 3.2) * amp);
    g.computeVertexNormals();
    var m = new T.Mesh(g, mat);
    m.rotation.y = Math.PI / 2;
    m.position.set(-hx + xOff, 1.5, (zA + zB) / 2);
    m.castShadow = false; m.receiveShadow = true;
    scene.add(m);
    return m;
  }
  curtain(M.sheer, -2.6, 2.7, .2, .03, 44);
  curtain(M.drape, -2.72, -1.5, .33, .075, 16);
  curtain(M.drape, 1.6, 2.72, .33, .075, 14);
  add(box(.05, .05, D - .06), M.woodDark, -hx + .3, 2.78, 0);

  // floor lamp by the glass, the third light in the room
  var lampPost = new T.Group(); lampPost.position.set(-2.5, 0, 1.75); scene.add(lampPost);
  add(new T.CylinderGeometry(.16, .18, .025, 20), M.goldSoft, 0, .015, 0, lampPost);
  add(new T.CylinderGeometry(.018, .018, 1.42, 10), M.goldSoft, 0, .72, 0, lampPost);
  flat(new T.CylinderGeometry(.17, .21, .24, 24, 1, true), M.shade, 0, 1.53, 0, lampPost);
  var floorLight = new T.PointLight(0xffb466, 3.0, 5.2, 2);
  floorLight.position.set(-2.5, 1.5, 1.75);
  scene.add(floorLight);

  /* ---------- console, screen, tea station -------------------------- */
  var con = new T.Group(); con.position.set(hx - .26, 0, -.2); scene.add(con);
  add(box(.48, .05, 3.1), M.wood, 0, .77, 0, con);
  add(box(.42, .52, 3.0), M.woodDark, 0, .5, 0, con);
  flat(box(.01, .01, 3.0), M.gold, -.212, .59, 0, con);
  [-.9, -.3, .3, .9].forEach(function (dz) { flat(box(.02, .02, .16), M.gold, -.215, .5, dz, con); });
  flat(box(.02, .84, 1.44), M.dark, .01, 1.66, -.62, con);
  flat(box(.03, .68, 1.24), M.screen, -.005, 1.66, -.62, con);

  var chair = new T.Group(); chair.position.set(hx - .98, 0, -.62); scene.add(chair);
  add(box(.46, .07, .46), M.velvet, 0, .45, 0, chair);
  add(box(.07, .46, .44), M.velvet, .2, .69, 0, chair);
  [[-.19, -.19], [.19, -.19], [-.19, .19], [.19, .19]].forEach(function (l) {
    add(new T.CylinderGeometry(.016, .016, .45, 8), M.chrome, l[0], .225, l[1], chair);
  });

  var tray = new T.Group(); tray.position.set(hx - .28, .8, .95); scene.add(tray);
  add(box(.36, .014, .28), M.goldSoft, 0, 0, 0, tray);
  add(new T.CylinderGeometry(.05, .042, .14, 16), M.chrome, -.08, .077, 0, tray);
  add(new T.CylinderGeometry(.035, .03, .065, 14), M.linen, .06, .04, -.06, tray);
  add(new T.CylinderGeometry(.035, .03, .065, 14), M.linen, .06, .04, .06, tray);

  // mirror above the console. Polished metal picks up the environment,
  // which reads as a reflection without the cost of a real one.
  flat(box(.03, .96, .74), M.goldSoft, hx - .03, 1.62, 1.55);
  flat(box(.015, .88, .66), M.mirror, hx - .05, 1.62, 1.55);

  /* ---------- art, bench, rug, door ---------------------------------- */
  var artW = flat(box(.72, .92, .05), M.woodDark, -1.5, 1.62, hz - .04);
  var artC = flat(box(.62, .8, .015), M.art, -1.5, 1.62, hz - .07);

  var bench = new T.Group(); bench.position.set(-.15, 0, .34); scene.add(bench);
  add(box(1.24, .09, .4), M.velvet, 0, .4, 0, bench);
  flat(box(1.24, .015, .035), M.gold, 0, .455, -.19, bench);
  [[-.53, -.14], [.53, -.14], [-.53, .14], [.53, .14]].forEach(function (l) {
    add(new T.CylinderGeometry(.018, .018, .36, 8), M.goldSoft, l[0], .18, l[1], bench);
  });

  var rug = flat(new T.PlaneGeometry(3.4, 2.6), M.rug, -.5, .006, .95);
  rug.rotation.x = -Math.PI / 2;

  add(box(1.02, 2.16, .05), M.wood, 2.3, 1.08, hz - .045);
  flat(box(1.06, 2.2, .015), M.woodDark, 2.3, 1.1, hz - .015);
  var handle = add(new T.CylinderGeometry(.018, .018, .13, 10), M.gold, 1.88, 1.05, hz - .1);
  handle.rotation.x = Math.PI / 2;

  /* ---------- lighting ----------------------------------------------- */
  scene.add(new T.HemisphereLight(0x93aac6, 0x2a2118, .34));

  // the cove, warm and soft, tucked behind the skirt so it never glares
  [-1.15, 1.15].forEach(function (cxp) {
    var cl = new T.PointLight(0xffc98e, isSmall ? 2.4 : 3.2, 6.6, 2);
    cl.position.set(cxp, H - .34, COVE_Z);
    scene.add(cl);
  });

  // city light through the glass, cool, the one light that casts shadows
  var win = new T.DirectionalLight(0xa9c2e4, 1.05);
  win.position.set(-11, 4.6, 1.6);
  win.target.position.set(1.6, .7, -1.2);
  scene.add(win, win.target);
  if (!isSmall) {
    win.castShadow = true;
    win.shadow.mapSize.set(1024, 1024);
    win.shadow.camera.near = .5; win.shadow.camera.far = 26;
    win.shadow.camera.left = -7; win.shadow.camera.right = 7;
    win.shadow.camera.top = 6; win.shadow.camera.bottom = -3;
    win.shadow.bias = -0.0013;
    win.shadow.normalBias = .022;
  }

  // wall wash behind the console, so the long right wall has some shape
  if (!isSmall) {
    var wash = new T.PointLight(0xffcf9c, 2.2, 5.4, 2);
    wash.position.set(hx - .9, 2.1, .6);
    scene.add(wash);
  }

  // picture light, restrained
  if (!isSmall) {
    var artSpot = new T.SpotLight(0xffe0b4, 4.2, 3.6, .42, .7, 1.8);
    artSpot.position.set(-1.5, 2.66, hz - .75);
    artSpot.target.position.set(-1.5, 1.62, hz - .1);
    scene.add(artSpot, artSpot.target);
  }

  // environment, so brass and glass have something to reflect
  var pmrem = new T.PMREMGenerator(renderer);
  var envScene = new T.Scene();
  envScene.add(new T.Mesh(new T.BoxGeometry(14, 9, 14),
    new T.MeshBasicMaterial({ color: 0x171410, side: T.BackSide })));
  var envTop = new T.Mesh(new T.PlaneGeometry(10, 10), new T.MeshBasicMaterial({ color: 0x51452f }));
  envTop.rotation.x = Math.PI / 2; envTop.position.y = 4; envScene.add(envTop);
  var envWin = new T.Mesh(new T.PlaneGeometry(8, 4.5), new T.MeshBasicMaterial({ color: 0x44597a }));
  envWin.rotation.y = Math.PI / 2; envWin.position.x = -6.2; envScene.add(envWin);
  var envWarm = new T.Mesh(new T.PlaneGeometry(3.4, 2), new T.MeshBasicMaterial({ color: 0xd99754 }));
  envWarm.position.z = -6.2; envScene.add(envWarm);
  scene.environment = pmrem.fromScene(envScene, .04).texture;
  pmrem.dispose();

  /* =============================================================
     CAMERA, VIEWPOINTS, LOOK CONTROL
     ============================================================= */
  var views = {
    doorway: { pos: new T.Vector3(1.9, 1.62, 2.15),  look: new T.Vector3(-0.5, 1.05, -2.0) },
    bed:     { pos: new T.Vector3(-1.75, 1.5, 1.55),  look: new T.Vector3(0.35, 0.8, -2.5) },
    desk:    { pos: new T.Vector3(-0.2, 1.46, 1.5),  look: new T.Vector3(3.3, 1.0, -0.6) },
    window:  { pos: new T.Vector3(1.2, 1.55, 0.2),   look: new T.Vector3(-3.4, 1.45, 0.5) }
  };

  var curPos = views.doorway.pos.clone();
  var tgtPos = views.doorway.pos.clone();
  var yaw = 0, pitch = 0, tYaw = 0, tPitch = 0, baseYaw = 0;
  var dragging = false, lastX = 0, lastY = 0, touched = false, idle = 0;

  function aim(view) {
    var d = view.look.clone().sub(view.pos);
    tYaw = Math.atan2(-d.x, -d.z);
    tPitch = Math.asin(Math.max(-1, Math.min(1, d.y / d.length())));
  }
  aim(views.doorway);
  yaw = tYaw; pitch = tPitch; baseYaw = tYaw;

  function goTo(name) {
    var v = views[name];
    if (!v) return;
    tgtPos.copy(v.pos);
    aim(v);
    baseYaw = tYaw;
    if (reduce) { curPos.copy(tgtPos); yaw = tYaw; pitch = tPitch; }
  }

  var el = renderer.domElement;
  el.style.touchAction = "none";

  el.addEventListener("pointerdown", function (e) {
    dragging = true; touched = true; idle = 0;
    lastX = e.clientX; lastY = e.clientY;
    el.setPointerCapture(e.pointerId);
    mount.classList.add("is-drag");
    var host = mount.closest(".suite"); if (host) host.classList.add("is-touched");
  });
  el.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    tYaw -= (e.clientX - lastX) * 0.0032;
    tPitch += (e.clientY - lastY) * 0.0024;
    tPitch = Math.max(-0.4, Math.min(0.34, tPitch));
    tYaw = Math.max(baseYaw - 1.0, Math.min(baseYaw + 1.0, tYaw));
    lastX = e.clientX; lastY = e.clientY;
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach(function (ev) {
    el.addEventListener(ev, function () { dragging = false; mount.classList.remove("is-drag"); });
  });

  // keyboard equivalent, so the tour is not pointer only
  el.tabIndex = 0;
  el.setAttribute("role", "application");
  el.setAttribute("aria-label", "Three dimensional view of the suite. Use the arrow keys to look around.");
  el.addEventListener("keydown", function (e) {
    var s = 0.09, used = true;
    if (e.key === "ArrowLeft") tYaw += s;
    else if (e.key === "ArrowRight") tYaw -= s;
    else if (e.key === "ArrowUp") tPitch = Math.min(0.34, tPitch + s * .6);
    else if (e.key === "ArrowDown") tPitch = Math.max(-0.4, tPitch - s * .6);
    else used = false;
    if (used) {
      e.preventDefault(); touched = true; idle = 0;
      tYaw = Math.max(baseYaw - 1.0, Math.min(baseYaw + 1.0, tYaw));
    }
  });

  /* ---------- hotspots -------------------------------------------- */
  var spots = [
    { p: new T.Vector3(0, 1.15, -2.6),      t: "King bed, blackout drapes" },
    { p: new T.Vector3(hx - .5, 1.05, -.7), t: "Desk and dual plug points" },
    { p: new T.Vector3(hx - .3, .95, .95),  t: "Tea and coffee station" },
    { p: new T.Vector3(-hx + .4, 1.6, .5),  t: "Full height city glass" },
    { p: new T.Vector3(0, H - .26, COVE_Z), t: "Cove lighting, dimmable" }
  ];
  var spotLayer = document.getElementById("room3dSpots");
  spots.forEach(function (s) {
    var b = document.createElement("button");
    b.className = "hot3d"; b.type = "button";
    b.setAttribute("aria-label", s.t);
    b.innerHTML = '<span class="hot3d__dot"></span><span class="hot3d__label">' + s.t + "</span>";
    spotLayer.appendChild(b);
    s.el = b;
  });

  var proj = new T.Vector3();
  function placeSpots(vw, vh) {
    for (var i = 0; i < spots.length; i++) {
      var s = spots[i];
      proj.copy(s.p).project(camera);
      var x = (proj.x * .5 + .5) * vw;
      var y = (-proj.y * .5 + .5) * vh;
      var off = proj.z > 1 || x < 26 || x > vw - 26 || y < 26 || y > vh - 26;
      s.el.style.opacity = off ? "0" : "1";
      s.el.style.pointerEvents = off ? "none" : "auto";
      s.el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(-50%,-50%)";
    }
  }

  /* ---------- resize, visibility, loop ----------------------------- */
  var w = 1, h = 1;
  function resize() {
    var r = mount.getBoundingClientRect();
    var host = mount.closest(".suite");
    var hr = host ? host.getBoundingClientRect() : null;
    w = Math.max(1, r.width || (hr && hr.width) || window.innerWidth);
    h = Math.max(1, r.height || (hr && hr.height) || Math.round(window.innerHeight * 0.86));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(mount);
  else window.addEventListener("resize", resize);
  // fonts, images and the preloader all move layout around after parse
  window.addEventListener("load", resize);
  setTimeout(resize, 400);
  setTimeout(resize, 1600);

  var visible = true;
  new IntersectionObserver(function (en) { visible = en[0].isIntersecting; },
                           { rootMargin: "200px" }).observe(mount);

  var clock = new T.Clock();
  var fwd = new T.Vector3();

  function aimCamera() {
    camera.position.copy(curPos);
    fwd.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
    camera.lookAt(curPos.x + fwd.x, curPos.y + fwd.y, curPos.z + fwd.z);
  }

  var lastFrame = 0;
  var minStep = isSmall ? 1000 / 30 : 0;   // half the frame rate on a phone, for the battery
  function loop(now) {
    requestAnimationFrame(loop);
    if (!visible) return;
    if (minStep && now - lastFrame < minStep) return;
    lastFrame = now || 0;
    var dt = Math.min(clock.getDelta(), .05);

    // idle drift, so the room breathes before anyone touches it
    if (!reduce && !dragging) {
      idle += dt;
      if (!touched && idle > 1.2) tYaw = baseYaw + Math.sin(idle * .15) * .26;
    }

    var k = reduce ? 1 : 1 - Math.pow(0.0016, dt);
    yaw += (tYaw - yaw) * k;
    pitch += (tPitch - pitch) * k;
    curPos.lerp(tgtPos, reduce ? 1 : 1 - Math.pow(0.004, dt));
    aimCamera();

    // the bedside lamps breathe very slightly, the way filament light does
    if (!reduce) {
      var t = clock.elapsedTime;
      var base = isSmall ? 2.6 : 3.4;
      bedLights[0].intensity = base + Math.sin(t * 1.7) * .12;
      bedLights[1].intensity = base + Math.sin(t * 1.3 + 2) * .12;
    }

    renderer.render(scene, camera);
    placeSpots(w, h);
  }
  loop();

  /* ---------- public handle ----------------------------------------- */
  window.RMRoom = {
    go: function (name) { touched = true; idle = 0; goTo(name); },
    /* synchronous render, used by the still capture harness */
    still: function (n) {
      curPos.copy(tgtPos); yaw = tYaw; pitch = tPitch;
      for (var i = 0; i < (n || 4); i++) { aimCamera(); renderer.render(scene, camera); }
      placeSpots(w, h);
    },
    ready: true
  };
  mount.classList.add("is-live");
  document.dispatchEvent(new CustomEvent("rmroom:ready"));

  } catch (err) {
    window.__rmFail = "The room failed to build: " + (err && err.message ? err.message : String(err));
    if (window.console) console.error("[RMRoom]", err);
  }
})();
