// src/vault/VaultPublic.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

export default function VaultPublic() {
  const [evidenceList, setEvidenceList] = useState([]);

  useEffect(() => {
    api.get("/vault/public").then((res) => setEvidenceList(res.data));
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">🔍 Public Evidence Vault</h2>
      {evidenceList.length === 0 ? (
        <p className="italic">No public evidence found.</p>
      ) : (
        <div className="space-y-4">
          {evidenceList.map((ev) => (
            <div key={ev.id} className="card">
              <p><strong>Description:</strong> {ev.description}</p>
              <p><strong>Tags:</strong> {ev.tags}</p>
              <p><strong>Location:</strong> {ev.location}</p>
              <p className="text-xs text-gray-500 italic">Submitted: {new Date(ev.timestamp).toLocaleString()}</p>
              <a href={ev.blob_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View Evidence</a>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
