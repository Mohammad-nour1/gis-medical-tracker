# GIS Medical Dashboard

لوحة مراقبة للقطاع الصحي في سوريا. تعرض إشغال المنشآت الطبية وتوزّع سيارات الإسعاف على الخريطة، وتطبّق مخطط المراقبة في الزمن الفعلي.

المستودع: https://github.com/Mohammad-nour1/gis-medical-tracker

## التشغيل المحلي

1. `npm install`
2. انسخ `.env.example` إلى `.env.local` واملأ `DATABASE_URL`
3. نفّذ على PostgreSQL/PostGIS الملف:
   `infrastructure/database/migrations/000_full_setup.sql`
4. `npm run dev` ثم افتح `http://localhost:3000`
5. الاختبارات: `npm test`

متغيرات `.env.local`:

```
DATABASE_URL=...
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## ماذا يغطي المشروع

- خريطة سوريا مع تجميع النقاط وفلاتر حسب النوع والمحافظة والحالة
- حساب الإشغال وتحويل الحالة إلى RED أو GREEN عند تجاوز 90٪
- البحث عن أقرب إسعاف متاح عبر PostGIS `ST_Distance` ثم التوجيه
- تنبيهات حرجة وبث حي عبر Socket.io
- Simulation لتغذية السيناريوهات
- توجيه يدوي + Time Machine لقطات الإشغال ومواقع الإسعاف

## البنية

| المجلد | الدور |
|---|---|
| `core` | الكيانات وحالات الاستخدام والمخطط |
| `infrastructure` | PostgreSQL/PostGIS وSocket.io |
| `interface` | Express API وWebSocket gateway |
| `frontend` | لوحة التحكم |
| `packages/react-med-geo-streamer` | طبقة متوافقة مع المكتبة المطلوبة `2.1.0` |

نقاط الدخول: `server.ts` يجمع Next وExpress وSocket.io على سيرفر واحد.

## لماذا هذه التقنيات

- **Next.js + TypeScript**: الواجهة والتطبيق ضمن بيئة موحّدة.
- **Express**: طبقة HTTP رقيقة فوق حالات الاستخدام كما هو مطلوب.
- **PostgreSQL + PostGIS**: الاستعلامات المكانية لأقرب إسعاف.
- **Socket.io**: اتصال مستمر للبث الحي.
- **react-med-geo-streamer@2.1**: مصدر حقيقة حالة البث في الواجهة؛ الحزمة غير متوفرة على npm فبنيت محلياً بنفس الاسم والإصدار.
- **Hexagonal**: عزل منطق المخطط عن تفاصيل القاعدة والبث.

## قرارات مهمة

1. **Vercel Serverless لا يكفي لوحده مع Socket.io** لأن الاتصال يحتاج عملية Node مستمرة، لذلك النشر التشغيلي على Railway عبر `server.ts`.
2. **مسار GREEN في المخطط لا يُختصر**؛ الحالة تمر بإلزام على `AssignRouteAndDispatch` حتى لو لم تُخصَّص سيارة.
3. **Time Machine** يعتمد على `occupancy_snapshots` و`ambulance_location_snapshots`.

## النشر على Railway

1. اربط المستودع بمشروع Railway.
2. ولّد Public Domain للخدمة.
3. أضف المتغيرات:
   - `DATABASE_URL` من Supabase
   - `HOSTNAME=0.0.0.0`
   - `PORT=8080`
   - `NEXT_PUBLIC_SOCKET_URL=https://<your-public-domain>`
4. Build: `npm run build` — Start: `npm run start`
5. تحقق من `/api/health` ثم الصفحة الرئيسة.
6. نفّذ Simulation Tick مرة قبل تجربة Time Machine.

Live Demo: يُحدَّث هنا بعد نجاح النشر العام.

## API

- `GET /api/health`
- `GET /api/facilities`
- `GET /api/ambulances`
- `GET /api/history`
- `POST /api/monitoring/run`
- `POST /api/simulation/tick`
- `POST /api/simulation/start`
- `POST /api/simulation/stop`
- `POST /api/dispatch/manual`

## أحداث البث

`occupancy-critical` · `status-changed` · `ambulance-dispatched` · `ambulance-location` · `simulation-tick`
