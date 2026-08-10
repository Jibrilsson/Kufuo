import { LegalPage } from "../_components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker={{ en: "Privacy notice", ar: "إشعار الخصوصية" }}
      title={{ en: "Your data. Your choices.", ar: "بياناتك. خياراتك." }}
      intro={{ en: "This notice explains what personal data Kufuo processes, why we process it, and the controls available to you. Where the GDPR, UK GDPR, or another data protection law applies, we handle your data in line with those requirements.", ar: "يوضح هذا الإشعار البيانات الشخصية التي تعالجها كفو، وأسباب معالجتها، والخيارات المتاحة لك. وعندما تنطبق اللائحة العامة لحماية البيانات في الاتحاد الأوروبي أو المملكة المتحدة أو أي قوانين أخرى لحماية البيانات، نتعامل مع بياناتك وفق متطلباتها." }}
      arabicChildren={
        <>
          <section>
            <h2>من المسؤول عن بياناتك؟</h2>
            <p>كفو مسؤولة عن البيانات الشخصية الموضحة في هذا الإشعار. يمكنك إرسال أسئلة وطلبات الخصوصية إلى <a href="mailto:privacy@kufuo.com">privacy@kufuo.com</a>.</p>
          </section>
          <section>
            <h2>البيانات التي نجمعها</h2>
            <p>نعالج بيانات الحساب والملف الشخصي، وتفضيلات العمل، والأفكار التي تختار نشرها، وطلبات التعارف، والرسائل، ونشاط المجتمع، والإعدادات، وبلاغات السلامة، والبيانات التقنية اللازمة لتشغيل الخدمة وحمايتها.</p>
          </section>
          <section>
            <h2>لماذا نستخدم بياناتك؟</h2>
            <p>نستخدم البيانات الشخصية لإنشاء حسابك وتأمينه، وتقديم الملفات والترشيحات، ودعم التعارف والرسائل، وتطبيق قواعد المجتمع، ومنع إساءة الاستخدام، والرد على الطلبات، وتحسين كفو.</p>
            <p>عندما تنطبق اللائحة العامة لحماية البيانات، يعتمد الأساس القانوني على نوع المعالجة: تنفيذ عقدنا معك، أو تحقيق مصالح مشروعة لا تتجاوز حقوقك، أو الوفاء بالتزامات قانونية، أو الاعتماد على موافقتك عندما تكون مطلوبة.</p>
          </section>
          <section>
            <h2>ما الذي يراه الأعضاء الآخرون؟</h2>
            <p>يرى الأعضاء فقط معلومات الملف والفكرة التي تختار نشرها. لا نعرض بريدك الإلكتروني أو رقم هاتفك أو رسائلك الخاصة أو بلاغاتك أو بيانات دخولك أو بيانات حسابك غير العامة للأعضاء الآخرين.</p>
          </section>
          <section>
            <h2>مقدمو الخدمات ونقل البيانات دوليًا</h2>
            <p>نستخدم مزودين موثوقين للاستضافة والمصادقة وقواعد البيانات والأمان والتحليلات والاتصالات. ولا يجوز لهم معالجة البيانات إلا لتقديم خدماتهم إلى كفو ووفق ضمانات تعاقدية مناسبة.</p>
            <p>إذا نُقلت البيانات الشخصية خارج المنطقة الاقتصادية الأوروبية أو المملكة المتحدة، نستخدم آلية نقل قانونية عند الحاجة، مثل قرار الملاءمة أو البنود التعاقدية القياسية المعتمدة.</p>
          </section>
          <section>
            <h2>مدة الاحتفاظ بالبيانات</h2>
            <p>نحتفظ بالبيانات الشخصية فقط للمدة اللازمة لتقديم كفو، والوفاء بالالتزامات القانونية، وحل النزاعات، ومنع الاحتيال، وحماية المجتمع. وتختلف المدة بحسب نوع البيانات والغرض من استخدامها.</p>
          </section>
          <section>
            <h2>حقوقك</h2>
            <p>بحسب القانون المنطبق عليك، قد يحق لك طلب الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها أو تقييد معالجتها أو تصديرها، أو الاعتراض على بعض أوجه المعالجة. ويمكنك سحب موافقتك في أي وقت عندما تعتمد المعالجة عليها.</p>
            <p>يمكنك أيضًا تقديم شكوى إلى جهة حماية البيانات المحلية. ولن نعاملك بشكل غير منصف بسبب ممارستك لأي حق متعلق بالخصوصية.</p>
          </section>
          <section>
            <h2>الأمان والحد الأدنى للعمر</h2>
            <p>نستخدم إجراءات تقنية وتنظيمية مصممة لحماية البيانات الشخصية، لكن لا يمكن لأي خدمة إلكترونية ضمان الأمان المطلق. كفو مخصص للبالغين القادرين قانونيًا على إبرام الاتفاقيات.</p>
          </section>
          <section>
            <h2>التغييرات على هذا الإشعار</h2>
            <p>قد نحدّث هذا الإشعار عندما تتغير الخدمة أو مزودوها أو المتطلبات القانونية. سننشر تاريخ التحديث، ونقدم إشعارًا إضافيًا إذا كان التغيير يؤثر بشكل جوهري في حقوقك.</p>
          </section>
        </>
      }
    >
      <section>
        <h2>Who is responsible for your data</h2>
        <p>Kufuo is responsible for the personal data described in this notice. Privacy questions and requests can be sent to <a href="mailto:privacy@kufuo.com">privacy@kufuo.com</a>.</p>
      </section>
      <section>
        <h2>Data we collect</h2>
        <p>We process account details, profile information, working preferences, ideas you choose to publish, introductions, messages, community activity, settings, safety reports, and the technical data needed to operate and protect the service.</p>
      </section>
      <section>
        <h2>Why we use it</h2>
        <p>We use personal data to create and secure your account, provide profiles and recommendations, support introductions and messages, enforce community rules, prevent abuse, respond to requests, and improve Kufuo.</p>
        <p>Where the GDPR applies, our legal basis will depend on the activity: performing our contract with you, pursuing legitimate interests that do not override your rights, complying with legal obligations, or relying on your consent where consent is required.</p>
      </section>
      <section>
        <h2>What other members can see</h2>
        <p>Members can see only the profile and idea information you choose to publish. Your email address, mobile number, private messages, reports, login credentials, and non-public account data are not displayed to other members.</p>
      </section>
      <section>
        <h2>Service providers and international transfers</h2>
        <p>We use trusted providers for hosting, authentication, databases, security, analytics, and communications. They may process data only to provide services to Kufuo and under appropriate contractual safeguards.</p>
        <p>If personal data is transferred outside the European Economic Area or the United Kingdom, we use a lawful transfer mechanism where required, such as an adequacy decision or approved standard contractual clauses.</p>
      </section>
      <section>
        <h2>How long we keep data</h2>
        <p>We keep personal data only for as long as it is needed to provide Kufuo, meet legal obligations, resolve disputes, prevent fraud, and protect the community. Retention periods vary by data type and purpose.</p>
      </section>
      <section>
        <h2>Your rights</h2>
        <p>Depending on the law that applies to you, you may ask to access, correct, delete, restrict, or export your personal data, or object to certain processing. You may withdraw consent at any time where processing relies on consent.</p>
        <p>You may also complain to your local data protection authority. We will not treat you unfairly for exercising a privacy right.</p>
      </section>
      <section>
        <h2>Security and age limits</h2>
        <p>We use technical and organisational safeguards designed to protect personal data. No online service can guarantee absolute security. Kufuo is intended for adults who are legally able to enter agreements.</p>
      </section>
      <section>
        <h2>Changes to this notice</h2>
        <p>We may update this notice when the product, our providers, or legal requirements change. We will publish the revised date and provide additional notice when a change materially affects your rights.</p>
      </section>
    </LegalPage>
  );
}
