# 🏭 Factory Floor Plan

**Walk the floor without walking the floor.**

An interactive 3D factory layout with a marker on every machine. Click one and
it reports how that machine is actually doing, broken down far enough to say
what to fix.

> 🌐 **Live demo:** [View deployed app](https://fe-vite-mini-app-3d-factory-floor-p.vercel.app/)

![Factory Floor Plan](./src/assets/png/SS_1.PNG)

![Machine Information](./src/assets/png/SS_2.PNG)

![React](https://img.shields.io/badge/React-19-149ECA)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6)
![Vite](https://img.shields.io/badge/Vite-6-646CFF)
![Three.js](https://img.shields.io/badge/Three.js-R3F-000000)
![Tests](https://img.shields.io/badge/tests-19%20passing-059669)

---

## 🌟 What it does

**🧭 Explore the floor in 3D.** A `.glb` model with orbit, pan, and zoom, on
mouse and on touch.

**🏷️ Inspect any machine.** Markers sit at real coordinates in the scene. Click
one and a panel opens with that machine's live readings.

**📊 See why a number is bad, not just that it is.** OEE is shown alongside the
three ratios it is made of, so a poor score points at a cause.

**🔎 Jump to a machine by name.** The picker lists every machine with its current
OEE and moves the camera to the one you choose.

**🖥️ Fullscreen and embed.** The floor plan runs fullscreen, and
`/embed/floor-plan` serves it bare for dropping into another page.

---

## 🧮 How OEE is worked out

Overall Equipment Effectiveness is the standard measure of how well a machine is
actually being used. It is not a number a machine reports. It is the product of
three separate ratios:

```
availability   share of scheduled time the machine could run
performance    actual speed against the speed it was designed for
quality        share of units that passed first time

OEE = availability × performance × quality
```

Keeping the three parts is the point. **Two machines can both sit at 60% for
completely different reasons**, and the repair is not the same:

| Machine | Availability | Performance | Quality | OEE | What is actually wrong |
| --- | --- | --- | --- | --- | --- |
| Tag 1003 | 62% | 99% | 98% | 60% | Runs beautifully, keeps stopping |
| Tag 1004 | 96% | 65% | 97% | 60% | Never stops, runs two thirds speed |

A single stored figure cannot tell those apart. That is why every metric in this
app is a number in a stated unit rather than a preformatted string, and why the
breakdown sits one click away from the headline.

**Thresholds** follow the ones manufacturing uses: 85% is treated as world
class, below 60% is a real problem rather than a bad shift. A machine that is
deliberately stopped is reported as offline instead of critical, because
flagging a planned changeover as a fault is how alerting turns into noise people
learn to ignore.

---

## 🛠 Tech stack

| Layer | Choice | Reasoning |
| --- | --- | --- |
| Build | Vite 6 | |
| Language | TypeScript 5.8 (`strict`) | |
| 3D | React Three Fiber and drei | Three.js as React components, with GLTF loading, orbit controls, and HTML anchored in the scene |
| Styling | Tailwind CSS 4 | |
| Tests | Vitest | The OEE maths is plain functions, so the tests need no DOM |

---

## ⚙️ How it works

**The domain layer knows nothing about React or Three.js.**
[`src/domain/oee.ts`](src/domain/oee.ts) is plain functions over plain data, so
every calculation is tested without rendering anything.

**Numbers stay numbers until they are displayed.** Formatting lives in
[`format.ts`](src/lib/format.ts). A reading stored as `"66,37%"` can be printed
and nothing else: it cannot be compared, sorted, or thresholded, which rules out
every question worth asking of a shop floor.

**Readings drift around each machine's own baseline.** The telemetry hook keeps
a machine in character, so the one that scraps stays the one that scraps rather
than randomly looking healthy for a second.

**Views are split from view models.** Each screen has a `_use*ViewModel` holding
state, refs, and handlers, leaving the component to lay things out.

**Three.js ships as its own chunk.** It is the bulk of the bundle and never
changes between deploys, so a one-line fix does not invalidate it in returning
visitors' caches.

---

## 🖱️ Controls

| Action | Mouse | Touch |
| --- | --- | --- |
| Rotate | Left click and drag | One finger drag |
| Pan | Right click and drag | Two finger drag |
| Zoom | Scroll wheel | Pinch |

---

## 🚀 Running locally

```bash
git clone https://github.com/lilgibs/factory-floor-plan-3d.git
cd factory-floor-plan-3d
npm install
npm run dev
```

Open <http://localhost:5173>.

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Type-check, then production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Vitest in watch mode |
| `npm run test:ci` | Single test run |
| `npm run lint` | ESLint |

---

## 🧪 Tests

```
Test Files  1 passed
Tests      19 passed
```

Aimed at the maths rather than the markup: the performance cap when a machine
runs above its rated speed, the three ratios staying separable so the cause
stays visible, threshold boundaries, and floor totals with stopped machines
excluded from the average but included in the downtime.

---

## 📦 Project layout

```
src/
├── domain/          OEE maths and the machine model, no React
│   ├── models/machine.ts
│   ├── oee.ts
│   └── oee.test.ts
├── data/machines.tsx    the demo floor
├── hooks/               telemetry and shared hooks
├── lib/format.ts        numbers become text here and nowhere else
├── components/          3D markers, tooltips, info panel, chrome
└── pages/
    ├── floor-plan/      view plus its view model
    └── embed/           bare version for embedding
```

The 3D model is loaded from `public/factory_asset.glb`, and marker coordinates
live with each machine in `src/data/machines.tsx`.

---

## ⚠️ Known limitations

- The floor is demo data, not a live plant feed. Readings drift around fixed
  baselines rather than arriving from a real source.
- A 3D scene is hard to use without a pointer and impossible without sight.
  There is no text list of machines as a fallback yet.
- Marker positions are placed by hand against the model.

---

Built by [Khahlil Gibran Hadi](https://github.com/lilgibs).
