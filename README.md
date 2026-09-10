# Royal Majestic Hotels, redesign mockup

A pitch mockup for a redesign of [royalmajestichotel.co.za](https://royalmajestichotel.co.za).
Three properties: Rosebank, Sandton, Durban.

Not the live site. Not signed work. Private for a reason, see [Assets](#assets).

---

## Run it

No build step, no dependencies to install. It is plain HTML, CSS and JavaScript.

```bash
cd royal-majestic-mockup
python3 -m http.server 8899
# then open http://localhost:8899/index.html
```

Opening `index.html` directly off disk works too, but serving it is closer to
the real thing.

If the 3D suite shows a photograph instead of the room, open
`http://localhost:8899/check.html`. It tests three.js, WebGL, the graphics chip
and an actual lit render, then says in plain language what is wrong.

---

## What is in here

| File | What it does |
|---|---|
| `index.html` | The whole page: markup and all styles |
| `site.js` | Preloader, Lenis smooth scroll, GSAP scroll scenes, mobile menu, the concierge demo |
| `room.js` | The 3D executive suite, built procedurally in three.js |
| `check.html` | Standalone WebGL diagnostic, for when the room does not appear |
| `assets/` | Photography and the logo, pulled from the client's own site |
| `preview/` | Stills of the 3D suite and the ivory sections |

Libraries come from a CDN at runtime: three.js r158, Lenis, GSAP with
ScrollTrigger, Phosphor icons. Nothing is vendored.

---

## Design decisions

**Warm ivory, with four deliberate dark blocks.** Everything you read sits on
ivory. The hero, the 3D suite, the three houses and the events room are
photography and light, so they run full bleed and dark. An earlier all dark
version was rejected and it was the right call.

**One accent.** A gold sampled from the existing RM logo. On ivory it deepens to
bronze (`#7C5714`) so small text still passes contrast. There is no second
accent anywhere on the page.

**Shapes.** Surfaces are 2px. Anything you tap is a pill.

**Motion has to earn its place.** Scroll weight from Lenis, a hero parallax for
depth, one pinned horizontal pan across the three properties, and the reveal
cascade. Everything degrades under `prefers-reduced-motion`. There are no scroll
event listeners anywhere: IntersectionObserver and ScrollTrigger only.

---

## The two interactive pieces

### The concierge

Type a request the way you would say it at the front desk. It matches intent
against the group's real facts, streams a reply, and returns rate cards you can
hold and release.

Replies are scripted and rates are labelled as samples. The group runs
**NightsBridge** (`38846` Rosebank, `39600` Durban) and
`majestichotelsandton.securedreservations.com` for Sandton. Wiring the live feed
is a production task.

### The 3D suite

A procedural three.js model of an executive suite. No downloaded meshes, no
photogrammetry: the room is described in code. Fluted headboard wall, the
circular dropped ceiling from the group's own room photography, a night skyline
through full height glass, sheer and blackout drapes, brass fittings.

Four viewpoints, drag or arrow keys to look, five hotspots. It pauses when off
screen, halves its frame rate and drops half its lights on a phone, and collapses
to a still under reduced motion.

**It is a stylised model, not their actual suite.** Say so in the room. See below.

---

## Making it the *real* room

The current model is an illustration of a suite. Turning it into *their* suite
needs real capture. A phone video is enough, no 3D artist and no special camera.

| Approach | Capture | Web render | Notes |
|---|---|---|---|
| **Gaussian splatting** | 2 to 4 min phone video | [SuperSplat](https://github.com/playcanvas/supersplat), [GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D) | Photoreal, real time, move the camera anywhere. The one that makes people gasp. Process with Polycam or Jawset Postshot. |
| **360 panoramas** | Insta360 / Ricoh Theta, or a phone on a tripod | [Pannellum](https://github.com/mpetroff/pannellum), [Photo Sphere Viewer](https://github.com/mistic100/Photo-Sphere-Viewer) | Fixed bubbles you look around from. Less impressive, bulletproof on old phones. |
| **Photogrammetry mesh** | Photo set | Meshroom, COLMAP | Skip it. Hotel rooms are glass, mirrors and flat white walls, which are the three things it handles worst. |
| **Hand modelled** | Blender | glTF in three.js | Archviz quality and you can swap finishes to show a refurb. Costs a modeller's time. |

**Recommended:** splat the hero suite at each property, 360s for the remaining
room types.

**Shooting notes**, because splats fail the same way every time:

- Shoot at dusk or with sheers drawn. A blown out window is the number one
  reason hotel captures fail.
- Every light on, including bedside and bathroom.
- Walk slowly, two full orbits, at knee, chest and above head height.
- Do not point straight at mirrors or the TV. Mask them out afterwards.

---

## Client context

Verified at source, [Tourism Update, 20 Feb 2026](https://www.tourismupdate.co.za/article/hilton-durban-closes-its-doors):

- Royal Majestic **Rosebank** is the former **Hyatt Regency Johannesburg**.
- Royal Majestic **Durban** is the former **Hilton Durban**, which closed on
  5 February 2026 when the Hilton management agreement ended.
- Owner is African American Properties Hotel Pty, a subsidiary of the
  **Bin Otaiba Hotel Group**.

This is the commercial argument. They gave up the flags, and with them the global
booking engine, the loyalty programme and the borrowed trust. The website is now
the only brand asset carrying a 244 room group across two cities.

Financial Mail has also run critical coverage of the Rosebank property. Do not
repeat that to the client. Use it to explain why the site has to carry trust now.

---

## Before this goes near the client

- [ ] **The G20 photo** in the events section. Whose is it, and can they use it?
      It carries a Ghana High Commission watermark.
- [ ] **"244 rooms and suites"** on the Rosebank panel. Still accurate after the
      rebrand?
- [ ] **Sample rates** in the concierge. Currently labelled as samples on the
      page. Replace or keep the label.
- [ ] **Photography.** The Sandton images are AI renders and Durban is using
      Hilton stock. Budget a real shoot.

---

## Assets

`assets/` holds photography and the logo taken from the client's own public
website, used here to mock up their redesign. They are the client's property.
This repository is private and the contents are not licensed for redistribution.
