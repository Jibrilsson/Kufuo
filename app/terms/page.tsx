import { LegalPage } from "../_components/LegalPage";

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Terms of use"
      title="Clear terms for building connections."
      intro="These terms govern your use of Kufuo. Kufuo helps people discover and evaluate potential cofounders; it is not a party to any partnership, employment, investment, or ownership agreement between members."
    >
      <section>
        <h2>Eligibility and your account</h2>
        <p>You must be at least 18 years old, legally able to enter agreements, and provide accurate information. Keep your login details secure and tell us promptly if you believe your account has been compromised.</p>
      </section>
      <section>
        <h2>Founder decisions remain yours</h2>
        <p>Kufuo does not guarantee compatibility, funding, employment, equity, business performance, or the accuracy of another member’s claims. You are responsible for your own due diligence and for documenting any commercial, intellectual property, or ownership arrangement separately.</p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <p>Do not impersonate another person, scrape the service, send spam, misuse confidential information, deceive members about an opportunity, harass others, evade safety controls, or publish unlawful or harmful content.</p>
      </section>
      <section>
        <h2>Your content</h2>
        <p>You keep ownership of the content you submit. You give Kufuo a limited, non-exclusive permission to host, display, and process that content only as needed to provide, secure, and improve the service according to your settings.</p>
        <p>Only share content you have the right to use. Do not post confidential information unless you are comfortable sharing it with the selected audience.</p>
      </section>
      <section>
        <h2>Moderation and account action</h2>
        <p>We may remove content, limit features, or suspend an account when reasonably necessary to protect members, investigate a report, enforce these terms, or comply with law. Where appropriate, we will explain the action and provide a way to contact us.</p>
      </section>
      <section>
        <h2>Service availability</h2>
        <p>Kufuo may change as we improve it, and some features may be interrupted or withdrawn. We will take reasonable care in operating the service but cannot promise uninterrupted or error-free access.</p>
      </section>
      <section>
        <h2>Liability</h2>
        <p>Nothing in these terms excludes liability that cannot legally be excluded. To the extent permitted by applicable law, Kufuo is not responsible for agreements or disputes between members, lost opportunities, or indirect losses caused by reliance on member-provided information.</p>
      </section>
      <section>
        <h2>Applicable law and international use</h2>
        <p>Kufuo may be used from different countries. Mandatory rights available under the laws that apply to you remain in force. If you are in the European Economic Area or the United Kingdom, these terms do not limit mandatory consumer or data protection rights.</p>
        <p>Before starting formal proceedings, contact <a href="mailto:legal@kufuo.com">legal@kufuo.com</a> so we can try to resolve the issue. Any unresolved dispute will be handled by the courts that have jurisdiction under applicable law.</p>
      </section>
      <section>
        <h2>Changes to these terms</h2>
        <p>We may update these terms when Kufuo or applicable legal requirements change. We will provide reasonable notice of material changes. Continuing to use Kufuo after the effective date means the updated terms apply.</p>
      </section>
    </LegalPage>
  );
}
