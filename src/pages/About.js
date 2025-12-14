import React from "react";
import Layout from "../components/Layout";

export default function About() {
  return (
    <Layout>
      <div className="text-[#2c2c2c] font-serif px-4 py-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-[#283d63] uppercase border-b border-[#c2a76d] pb-2">
          🏛️ About ARES
        </h1>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">
            1. What ARES Is
          </h2>
          <p className="text-[#5a4635]">
            ARES is a civic transparency and accountability platform designed to
            help the public document experiences with public institutions,
            agencies, and officials. It provides structured tools for reporting,
            discussion, and review, with the goal of promoting lawful oversight,
            informed dialogue, and institutional accountability.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">
            2. What ARES Is Not
          </h2>
          <p className="text-[#5a4635]">
            ARES is not a court of law, a law enforcement agency, or a substitute
            for legal counsel. Content published on ARES does not constitute
            legal findings or determinations of guilt. The platform exists to
            surface patterns, experiences, and public concerns — not to render
            verdicts.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">
            3. Why ARES Exists
          </h2>
          <p className="text-[#5a4635]">
            Many people experience government systems as opaque, intimidating,
            or unresponsive. ARES was created to reduce that opacity by giving
            citizens a lawful space to document interactions, share experiences,
            and observe broader trends that may otherwise remain invisible when
            incidents are isolated.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">
            4. How Content Is Handled
          </h2>
          <p className="text-[#5a4635]">
            Content on ARES is primarily user-generated and subject to
            moderation. Certain submissions — including newly created entities
            and official designations — require administrative review before
            becoming publicly visible. This process exists to reduce abuse,
            misinformation, and harassment while preserving the public’s right
            to speak.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">
            5. Accountability and Responsibility
          </h2>
          <p className="text-[#5a4635]">
            Users are responsible for ensuring that submissions are truthful,
            accurate to the best of their knowledge, and presented without
            malice. Knowingly false reports undermine public trust and may be
            subject to removal. ARES cooperates with lawful requests and
            maintains records consistent with its policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">
            6. Transparency by Design
          </h2>
          <p className="text-[#5a4635]">
            ARES is built with transparency and restraint in mind. Reputation
            metrics, verification processes, and moderation tools are designed
            to reduce impulsive judgment and emphasize verified information over
            virality. The platform prioritizes long-term credibility over short-
            term engagement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">
            7. Evolving With the Community
          </h2>
          <p className="text-[#5a4635]">
            ARES is an evolving project. Features, policies, and safeguards are
            refined over time based on legal guidance, user feedback, and real-
            world use. Community participation helps shape the platform’s
            direction, but changes are implemented cautiously to preserve
            stability and trust.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">
            8. A Final Note
          </h2>
          <p className="text-[#5a4635]">
            Accountability functions best when paired with fairness,
            proportionality, and respect for due process. ARES exists to support
            informed civic engagement — not outrage, intimidation, or
            harassment. Users are encouraged to approach participation with
            care, clarity, and integrity.
          </p>
        </section>
      </div>
    </Layout>
  );
}
