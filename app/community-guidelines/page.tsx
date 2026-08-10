import { LegalPage } from "../_components/LegalPage";

export default function CommunityGuidelinesPage() {
  return (
    <LegalPage
      kicker="Community guidelines"
      title="Build trust before you build a company."
      intro="Kufuo is for people exploring genuine cofounder relationships. These guidelines keep introductions useful, conversations respectful, and decisions informed."
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
