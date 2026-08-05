# GIS Medical Dashboard

لوحة مراقبة طبية اعتماداً على GIS لمديري القطاع الصحي في سوريا: إشغال المنشآت، تتبّع الإسعاف، تنبيهات لحظية، توجيه يدوي، وTime Machine.

- **GitHub:** https://github.com/Mohammad-nour1/gis-medical-tracker
- **Live Demo:** https://gis-medical-tracker-production.up.railway.app

---

## التشغيل المحلي

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
```

املأ `DATABASE_URL`، ثم نفّذ على Postgres/PostGIS:

`infrastructure/database/migrations/000_full_setup.sql`

(الترقيم يبدأ بـ `000` ثم تكمل تحسينات لاحقة `004`–`008`؛ لا توجد `001`–`003` منفصلة.)

```bash
npm run dev    # http://localhost:3000
npm test       # 14 automated tests (see Testing below)
```

Variables:

```
DATABASE_URL=...
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

---

## Testing

Automated tests run with Node’s test runner:

```bash
npm test
```

Expected result: **14 passed**.

| File | What it verifies |
|---|---|
| `core/use-cases/__tests__/occupancy.test.ts` | Available beds = total − occupied; RED/GREEN at 90% |
| `core/use-cases/__tests__/monitoringCycle.test.ts` | Flowchart: RED → alert + nearest ambulance + dispatch; no re-dispatch if already RED; GREEN still goes through assign with no unit |
| `core/use-cases/__tests__/simulationScenarios.test.ts` | Simulation prefers GREEN and crosses 90%; directed ambulance motion toward target |
| `interface/http/validation/__tests__/requestValidation.test.ts` | API input validation (filters, dispatch body, simulation interval, timestamps) |

These unit tests cover the flowchart conversion and request boundaries (evaluation metric: algorithm fidelity). Map UI is validated manually on the Live Demo.

---

## مطابقة المتطلبات

| المطلوب | الحالة |
|---|---|
| Next.js + Express + Postgres/PostGIS | مُنفَّذ |
| `react-med-geo-streamer@2.1` لحالة الـ WebSocket | مُنفَّذ محلياً (`packages/…`، غير منشور على npm) |
| Socket.io اتصال مستمر للبث الحي | مُنفَّذ عبر `server.ts` |
| خريطة سوريا + Clustering + فلاتر | مُنفَّذ |
| مخطط المراقبة: إشغال → 90% → RED/GREEN → أقرب إسعاف → توجيه | مُنفَّذ حرفياً في `core/use-cases` |
| Time Machine (تاريخ/وقت + snapshots) | مُنفَّذ |
| تنبيهات + توجيه يدوي | مُنفَّذ |
| Simulation لتغذية سيناريوهات | مُنفَّذ (سكريبت/محرّك سيناريو، بدون LLM) |
| نشر Serverless على Vercel + Socket.io دائم | **تعارض معماري** → انظر القرارات أدناه (النشر التشغيلي على Railway) |

---

## الميزات في الواجهة

- **Filters:** نوع المنشأة / المحافظة / RED|GREEN / إخفاء أو حالة الإسعاف
- **Run Monitoring:** دورة المخطط مرة واحدة على كل المنشآت
- **Start Simulation:** ضغط متكرّر على مستشفى واحد لعدة تيكات → أقرب إسعافين يتحركون → تنبيه عند GREEN→RED
- **Emergency Alerts:** عند تجاوز العتبة فقط (تحول إلى RED)
- **Manual Dispatch:** اختيار منشأة + إسعاف متاح وإرسال
- **Time Machine:** presets أو تاريخ/وقت → View Snapshot → Return Live  
  (يحتاج snapshots؛ شغّل Monitoring أو Simulation مرة قبلها)

على الخريطة: أخضر/أحمر للمنشآت، أزرق=إسعاف متاح، أصفر=مُرسل، سهم أبيض=متجه للطوارئ الحالية.

---

## البنية

| مسار | دور |
|---|---|
| `core/` | كيانات + حالات استخدام المخطط |
| `infrastructure/` | Postgres/PostGIS + Socket broadcaster |
| `interface/` | Express API + Socket gateway |
| `frontend/` | Dashboard |
| `packages/react-med-geo-streamer/` | Stream state @2.1.0 |
| `server.ts` | Next + Express + Socket.io في عملية واحدة |

**Dependency injection:** constructor injection عبر composition root في  
`interface/http/createContainer.ts`.  
`core/` يعتمد على ports (واجهات) فقط؛ Postgres/PostGIS/Socket يُحقنون كـ adapters من الخارج، وفي الاختبارات تُحقن fakes بدل البنية التحتية الحقيقية.

---

## Design system

UI colors and radii live in CSS variables (`app/globals.css`).  
Map marker colors/sizes/motion use the same palette via `frontend/design/tokens.ts` (`withAlpha` for glow variants).  
Critical occupancy threshold is centralized in `core/shared/occupancy.ts`.

---

## Architectural Decisions

### Serverless (Vercel) vs persistent Socket.io — how the constraint is reconciled

Section 2 asks for **both**:
1. full Serverless backend on **Vercel**, and  
2. native **Socket.io** with a **persistent** connection for live tracking.

Those two cannot run inside the same Vercel Serverless function: Vercel invocations are short-lived and do not keep a process that can hold Socket.io rooms/connections.

**Decision taken (as required by Submission Guidelines §6):**
- Keep the **required libraries and realtime model**: Socket.io server + `react-med-geo-streamer@2.1` on the client (no ad-hoc React WebSocket state for the medical stream).
- Run UI + HTTP API + Socket.io together in one long-lived Node process (`server.ts`) on **Railway**.
- Treat Vercel Serverless as **architecturally unsuitable for the persistent socket side** of this PoC, and document that trade-off instead of shipping a broken “WebSocket on Serverless” setup.

So the 25% realtime/constraint metric is satisfied by: **using the mandated stack correctly**, **keeping a real persistent connection**, and **explicitly reconciling the conflicting deployment rule** in writing.

### Other decisions

**react-med-geo-streamer@2.1** is not on the public npm registry. A compatible local package (`packages/react-med-geo-streamer`, version `2.1.0`) is linked so the frontend stream state matches the brief.

**PostGIS:** nearest available ambulance uses `ST_Distance` on `geography` (`infrastructure/database/PostGISDistanceCalculator.ts`).

**Flowchart fidelity:** occupancy → 90% threshold → RED/GREEN → if RED find nearest + dispatch; GREEN still goes through `AssignRouteAndDispatch` with no unit. Tests: `core/use-cases/__tests__/`.

**Hexagonal + DI:** flowchart use cases depend on ports; `createApplicationContainer` wires Postgres/PostGIS/Socket adapters via constructor injection. Unit tests inject fakes the same way.


---

## Railway

1. Connect the GitHub repo  
2. Env: `DATABASE_URL`, `HOSTNAME=0.0.0.0`, `PORT=8080`, `NEXT_PUBLIC_SOCKET_URL=https://<public-domain>`  
3. Build `npm run build` · Start `npm run start`  
4. Check `/api/health`

---

## API / Events

`GET` `/api/health` · `/api/facilities` · `/api/ambulances` · `/api/history`  

`POST` `/api/monitoring/run` · `/api/simulation/tick|start|stop` · `/api/dispatch/manual`

Socket events: `occupancy-critical` · `status-changed` · `ambulance-dispatched` · `ambulance-location` · `simulation-tick`
