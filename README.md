# GIS Medical Dashboard

لوحة مراقبة طبية تفاعلية لمديري القطاع الصحي في سوريا
المراقبة بالوقت الفعلي لاشغال المشافي وتوجيه الاسعاف عبر خريطة GIS

## 1 تشغيل محلي

1 انسخ المشروع
2 نفذ `npm install`
3 انسخ `.env.example` الى `.env.local` وعبّي `DATABASE_URL`
4 نفذ ملفات الـ SQL بالترتيب على PostgreSQL/PostGIS
   - `infrastructure/database/migrations/001_init.sql`
   - `infrastructure/database/migrations/002_ambulance_location_snapshots.sql`
5 شغل المشروع بـ `npm run dev`
6 افتح `http://localhost:3000`
7 للاختبارات نفذ `npm test`

## 2 الهدف من المشروع

1 بناء لوحة مراقبة حية للموارد الطبية
2 عرض المنشآت والاسعاف على خريطة سوريا
3 حساب الاشغال وتحديد الحالة RED/GREEN حسب المخطط الرسمي
4 ارسال تنبيهات عند الحالات الحرجة
5 السماح للمدير بتوجيه يدوي لاسعاف
6 الرجوع زمنيا لسجلات الاشغال وتوزع السيارات

## 3 شو عملت

1 فصلت المشروع لطبقات واضحة
   - `core` للمنطق والخوارزمية
   - `infrastructure` لقاعدة البيانات والبث
   - `interface` لـ Express وSocket.io
   - `frontend` للوحة التحكم
2 حولت الفلوتشارت لحالات استخدام منفصلة وقابلة للاختبار
3 ربطت PostGIS لحساب اقرب اسعاف عبر `ST_Distance`
4 بنيت بث حي عبر Socket.io
5 بنيت لوحة فيها خريطة وتجميع نقاط وفلاتر وتنبيهات وTime Machine وتوجيه يدوي
6 بنيت Simulation API يولد طوارئ عشوائية ويحدث قاعدة البيانات ويبث للمتصفح

## 4 ليش استخدمت هاي التقنيات

1 Next.js + TypeScript
   - للواجهة وطبقات التطبيق بنوع آمن
2 Express.js
   - لانه مطلوب كـ backend رسمي ونقاط الـ API رقيقة تستدعي الـ use-cases فقط
3 PostgreSQL + PostGIS
   - للتعامل الاحترافي مع الاحداثيات المكانية
4 Socket.io
   - لانه مطلوب لاتصال مستمر وبث تحديثات الموقع والحالة لحظة بلحظة
5 `react-med-geo-streamer@2.1`
   - لادارة حالة WebSocket في الواجهة حصرا بدون الاعتماد على React state لمسار البث الحي
6 Hexagonal Architecture
   - لعزل منطق التوجيه الطبي عن تفاصيل قواعد البيانات والاتصال الحي

## 5 المشاكل لي واجهتها وحليتها

1 تناقض Serverless على Vercel مع اتصال Socket.io المستمر
   - الحل انشغلت بسيرفر Node موحّد `server.ts` يجمع Express وSocket.io وNext معا
   - الـ Adapter pattern عبر `RealtimeBroadcaster` يخلي مزود البث قابل للتبديل بدون كسر الـ core
2 مكتبة `react-med-geo-streamer` غير موجودة على npm
   - عملت package محلي بنفس الاسم والاصدار `2.1.0` داخل `packages/react-med-geo-streamer`
   - لفّيت فيها `socket.io-client` وخليت الواجهة تاخذ البث الحي منها فقط
3 مسار GREEN بالمخطط كان فيه طريق مختصر ملغى
   - طبقت القاعدة حرفيا وما في رجوع مباشر من GREEN للحساب بدون المرور على AssignRouteAndDispatch
4 Time Machine كان ناقص توزع السيارات التاريخي
   - اضفت جدول snapshots لمواقع الاسعاف وربطته مع استرجاع التاريخ
5 احتجت فصل واضح بين بيانات السيرفر والبث الحي وحالة الواجهة
   - البث الحي عبر `react-med-geo-streamer`
   - الفلاتر والـ date picker عبر React state عادي
   - بيانات التحميل الاولية عبر API عادي

## 6 Architectural Decisions

1 ليش Hexagonal
   - الخوارزمية حرجة وما لازم تتلوث بتفاصيل pg او socket.io
   - اسهل للاختبار وللتوسعة لاحقا
2 كيف حليت Serverless + Persistent Connection
   - Socket.io يحتاج process مستمر لذلك التشغيل الرسمي عبر `server.ts`
   - للاستضافة الحقيقية استخدم مضيف Node يدعم اتصال مستمر
   - Vercel مناسب للواجهة والـ cron بينما البث الحي يحتاج runtime مستمر
3 ليش shim بدل المكتبة المفقودة
   - التاسك فرض اسم واصدار محددين والمكتبة غير منشورة
   - الشيم يحقق الالتزام بالاسم والاصدار ويبقي مسار البث قابلا للاستبدال لاحقا

## 7 الـ API الرئيسية

1 `GET /api/facilities`
2 `GET /api/ambulances`
3 `GET /api/history`
4 `POST /api/monitoring/run`
5 `POST /api/simulation/tick`
6 `POST /api/simulation/start`
7 `POST /api/simulation/stop`
8 `POST /api/dispatch/manual`

## 8 احداث البث الحي

1 `occupancy-critical`
2 `status-changed`
3 `ambulance-dispatched`
4 `ambulance-location`
5 `simulation-tick`

## 9 ملاحظات التسليم

1 المستودع
   - https://github.com/Mohammad-nour1/gis-medical-tracker
2 Live Demo
   - يتم اضافته بعد النشر على مضيف Node مستمر
