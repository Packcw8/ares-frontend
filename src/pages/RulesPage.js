import Layout from "../components/Layout";

export default function RulesPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-[#0A2A42] mb-6 uppercase tracking-wider">
          ARES Community Rules
        </h1>

        <p className="text-gray-700 mb-6">
          ARES exists to document misconduct, protect civil rights, and promote
          accountability through evidence and public reporting.
        </p>

        <p className="text-gray-700 mb-6">
          This platform is designed for transparency and safety. To protect
          users, whistleblowers, and the public, certain behavior is not allowed.
        </p>

        <h2 className="text-xl font-bold text-[#0A2A42] mb-3">
          🚫 Not Allowed
        </h2>

        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
          <li>Threats of violence or harm</li>
          <li>Encouraging or celebrating violence</li>
          <li>
            Doxing — sharing private addresses, phone numbers, or personal
            identifying information
          </li>
          <li>Harassment, intimidation, or targeted abuse</li>
          <li>Calls to harm, stalk, or retaliate against any individual</li>
          <li>Content intended primarily to threaten or incite fear</li>
        </ul>

        <h2 className="text-xl font-bold text-[#0A2A42] mb-3">
          ✅ Allowed
        </h2>

        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
          <li>Criticism of public officials or institutions</li>
          <li>Sharing evidence of misconduct</li>
          <li>Strong opinions, dissent, and protest</li>
          <li>Public accountability and transparency</li>
          <li>Good-faith discussion, reporting, and debate</li>
        </ul>

        <p className="text-gray-700 mb-6">
          ARES does <strong>not</strong> take sides politically.
          ARES <strong>does</strong> take safety seriously.
        </p>

        <p className="text-gray-700 mb-6">
          Violations of these rules may result in content removal, temporary
          account suspension, or permanent bans.
        </p>

        <p className="text-gray-700">
          By using ARES, you agree to follow these rules and help keep the
          platform safe for everyone.
        </p>
      </div>
    </Layout>
  );
}
