import { LegalPage } from "../_components/LegalPage";

export default function CommunityGuidelinesPage() {
  return (
    <LegalPage
      kicker={{ en: "Community guidelines", ar: "إرشادات المجتمع" }}
      title={{ en: "Build trust before you build a company.", ar: "ابنِ الثقة قبل أن تبني شركة." }}
      intro={{ en: "Kufuo is for people exploring genuine cofounder relationships. These guidelines keep introductions useful, conversations respectful, and decisions informed.", ar: "كفو مخصص لمن يستكشفون شراكات تأسيس حقيقية. تساعد هذه الإرشادات على أن تبقى التعارفات مفيدة، والنقاشات محترمة، والقرارات واعية." }}
      arabicChildren={
        <>
          <section>
            <h2>اعرض الفرصة بصدق</h2>
            <p>كن دقيقًا بشأن خبرتك، ووقتك المتاح، ومرحلة الفكرة، وما تم التحقق منه، والتمويل، والتوقعات. وضّح الفرق بين ما هو موجود اليوم وما تخطط لبنائه.</p>
          </section>
          <section>
            <h2>احترم الوقت والموافقة</h2>
            <p>أرسل طلبات تعارف ذات صلة، وتقبّل الرفض، وتجنب التواصل المتكرر غير المرغوب. لا تنقل المحادثة إلى قناة أخرى إلا بعد موافقة الطرفين.</p>
          </section>
          <section>
            <h2>احمِ المعلومات السرية</h2>
            <p>شارك فقط ما يلزم قبل بناء الثقة. لا تنسخ أو تنشر أو تستخدم معلومات عضو آخر أو مواد منتجه أو فكرته دون إذن واضح.</p>
          </section>
          <section>
            <h2>لا تستغل أعضاء المجتمع</h2>
            <p>لا تقدّم عملًا حرًا على أنه فرصة شراكة تأسيس، ولا تبحث عن عمل غير مدفوع، أو تجمع بيانات، أو تضغط على أي شخص لتقديم عمل أو حصص أو أموال أو بيانات دخول أو صلاحيات شخصية.</p>
          </section>
          <section>
            <h2>لا مكان للتحرش أو التمييز</h2>
            <p>لا نسمح بالتهديد أو التحرش أو خطاب الكراهية أو الترهيب أو التمييز أو تكرار التواصل بعد طلب التوقف.</p>
          </section>
          <section>
            <h2>أبلغ عن أي مشكلة</h2>
            <p>استخدم أدوات الإبلاغ إذا بدا لك سلوك غير آمن أو مضلل أو مسيء. تبقى البلاغات خاصة وتُراجع لاتخاذ الإجراء المناسب. إذا كان هناك خطر فوري على سلامة أي شخص، تواصل مع خدمات الطوارئ المحلية.</p>
          </section>
        </>
      }
    >
      <section>
        <h2>Describe the opportunity honestly</h2>
        <p>Be accurate about your experience, availability, idea stage, validation, funding, and expectations. Clearly separate what exists today from what you plan to build.</p>
      </section>
      <section>
        <h2>Respect time and consent</h2>
        <p>Send relevant introduction requests, accept a decline, and avoid repeated contact. Move conversations to another channel only when both people are comfortable doing so.</p>
      </section>
      <section>
        <h2>Protect confidential information</h2>
        <p>Share only what is necessary before trust is established. Never copy, publish, or use another member’s private information, product material, or idea without clear permission.</p>
      </section>
      <section>
        <h2>Do not exploit other members</h2>
        <p>Do not disguise freelance work as a cofounder opportunity, recruit unpaid staff, collect leads, or pressure anyone to provide labour, equity, money, credentials, or personal access.</p>
      </section>
      <section>
        <h2>No harassment or discrimination</h2>
        <p>Threats, sexual harassment, hate speech, intimidation, discriminatory treatment, and repeated unwanted contact are not allowed.</p>
      </section>
      <section>
        <h2>Report concerns</h2>
        <p>Use the reporting controls if something appears unsafe, deceptive, or abusive. Reports are private and reviewed for appropriate action. Contact local emergency services if there is an immediate threat to anyone’s safety.</p>
      </section>
    </LegalPage>
  );
}
