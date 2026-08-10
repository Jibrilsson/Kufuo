import { LegalPage } from "../_components/LegalPage";

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Privacy notice"
      title="Your data. Your choices."
      intro="This notice explains what personal data Kufuo processes, why we process it, and the controls available to you. Where the GDPR, UK GDPR, or another data protection law applies, we handle your data in line with those requirements."
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
