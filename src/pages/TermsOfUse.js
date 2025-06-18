import React from "react";
import Layout from "../components/Layout";

export default function TermsOfUse() {
  return (
    <Layout>
      <div className="text-[#2c2c2c] font-serif px-4 py-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-[#283d63] uppercase border-b border-[#c2a76d] pb-2">
          🛡️ Terms of Use
        </h1>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">1. Mission Statement</h2>
          <p className="text-[#5a4635]">
            ARES is a platform created to promote transparency, accountability, and civic participation.
            By using this platform, you agree to uphold its core principles: honesty, integrity, and respect for public truth.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">2. User Responsibilities</h2>
          <p className="text-[#5a4635]">
            You agree not to use ARES to spread false information, harass others, or interfere with investigations. All reports and comments must be based on factual experiences or observations to the best of your knowledge.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">3. Account Usage</h2>
          <p className="text-[#5a4635]">
            You are responsible for maintaining the confidentiality of your account. You must not impersonate others or allow unauthorized access to your login. Misuse may result in account suspension or legal action.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">4. Moderation & Enforcement</h2>
          <p className="text-[#5a4635]">
            ARES reserves the right to remove content that violates these terms. Repeat violations or malicious use may result in removal of access, reports, or user accounts without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">5. Legal Disclaimer</h2>
          <p className="text-[#5a4635]">
            ARES is not a government entity. It is an independent tool for civic expression and documentation.
            Submissions do not constitute legal complaints unless filed directly through official state or federal channels.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">6. Amendments</h2>
          <p className="text-[#5a4635]">
            These terms may be amended to reflect platform improvements, legal requirements, or community concerns.
            It is your responsibility to review updated terms. Your continued use signifies acceptance.
          </p>
        </section>
      </div>
    </Layout>
  );
}
