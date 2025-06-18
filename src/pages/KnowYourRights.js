import React from "react";
import Layout from "../components/Layout";

export default function KnowYourRights() {
  return (
    <Layout>
      <div className="text-[#2c2c2c] font-serif px-4 py-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-[#283d63] uppercase border-b border-[#c2a76d] pb-2">
          ⚖️ Know Your Rights
        </h1>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">1. Your Right to Report Misconduct</h2>
          <p className="text-[#5a4635]">
            Every citizen has the constitutional right to document, report, and voice concerns about public officials.
            The First Amendment protects your freedom of speech, the press, and to petition the government for redress of grievances.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">2. Recording in Public</h2>
          <p className="text-[#5a4635]">
            In most states, it is legal to record public officials in public places as long as you are not interfering.
            However, recording private conversations may fall under state-specific wiretapping laws. ARES encourages responsible and lawful documentation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">3. Whistleblower Protection</h2>
          <p className="text-[#5a4635]">
            Federal and many state laws protect individuals who report corruption or abuse from retaliation. If you fear for your safety after reporting, seek legal assistance and document your interactions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">4. False Reports Warning</h2>
          <p className="text-[#5a4635]">
            Submitting knowingly false information is unlawful and undermines the integrity of civic reporting. ARES will cooperate with legal processes in cases of malicious abuse.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">5. What ARES Does With Your Reports</h2>
          <p className="text-[#5a4635]">
            ARES compiles and publishes non-identifying, public-facing reports to promote awareness and accountability. Your submissions help shape transparency and expose patterns of misconduct.
          </p>
        </section>
      </div>
    </Layout>
  );
}
