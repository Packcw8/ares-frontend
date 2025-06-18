import React from "react";
import Layout from "../components/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="text-[#2c2c2c] font-serif px-4 py-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold text-[#283d63] uppercase border-b border-[#c2a76d] pb-2">
          📄 Privacy Policy
        </h1>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">1. Information We Collect</h2>
          <p className="text-[#5a4635]">
            ARES collects only the information necessary to verify your submissions and maintain account security.
            This may include your email address, state/county, and anonymous feedback. We do not store sensitive identifying data beyond what is required for system integrity.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">2. How We Use Your Data</h2>
          <p className="text-[#5a4635]">
            Your information is used solely for civic reporting purposes and system moderation. ARES does not sell or share user data with third parties unless required by law or to prevent fraud and abuse.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">3. Data Storage & Security</h2>
          <p className="text-[#5a4635]">
            All user data is encrypted and stored on secure servers. We adhere to industry best practices for information security, including access restrictions and encrypted backups.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">4. Anonymity & Public Posts</h2>
          <p className="text-[#5a4635]">
            While your posts may be public, ARES avoids publishing any personal identifiers. All official ratings are shown as part of aggregated civic feedback. You may choose to remove any comment you personally authored.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">5. Opt-Out & Account Control</h2>
          <p className="text-[#5a4635]">
            You may delete your account and data at any time by contacting ARES support. Upon deletion, all associated records will be anonymized and removed from public display.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#3a2f1b] mb-2">6. Changes to This Policy</h2>
          <p className="text-[#5a4635]">
            This policy may be updated as ARES evolves. Users will be notified via email or dashboard prompt when major changes occur. Continued use of the platform implies acceptance of the most current version.
          </p>
        </section>
      </div>
    </Layout>
  );
}
