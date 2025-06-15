import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <h2 className="text-xl font-bold mb-4 leading-snug">Hold public officials<br />accountable</h2>

      <button className="w-full bg-[#0A2A42] text-white text-lg py-3 rounded-xl font-semibold mb-6">
        LOG INCIDENT
      </button>

      <div className="space-y-3">
        {[
          { label: 'Timeline Generator', icon: '🗓️' },
          { label: 'Complaint Builder', icon: '📄' },
          { label: 'Official Profiles', icon: '👤' },
          { label: 'Document Vault', icon: '🗃️' },
          { label: 'Public Ratings', icon: '⭐', link: '/ratings' },
        ].map((item, i) => (
          <div key={i} className="bg-white shadow-sm rounded-xl flex items-center px-4 py-3 text-base font-medium">
            <span className="mr-3 text-xl">{item.icon}</span>
            {item.label.toUpperCase()}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-[#0A2A42] font-bold text-sm mb-2 uppercase">Corruption Heat Map</h3>
        <img src="/map-placeholder.png" alt="Heatmap" className="w-full rounded-lg" />
      </div>
    </Layout>
  );
}
