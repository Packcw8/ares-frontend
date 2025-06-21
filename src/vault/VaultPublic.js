// src/vault/VaultWall.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { stateCountyData } from "../data/stateCountyData";

export default function VaultWall() {
  const [evidenceList, setEvidenceList] = useState([]);
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [countyFilter, setCountyFilter] = useState("");

  useEffect(() => {
    api.get("/vault/public").then((res) => setEvidenceList(res.data));
    api.get("/ratings/entities").then((res) => setEntities(res.data));
  }, []);

  const filteredEvidence = evidenceList.filter((ev) => {
    const entity = entities.find((e) => e.id === ev.entity_id);
    if (!entity) return false;
    const matchState = stateFilter ? entity.state === stateFilter : true;
    const matchCounty = countyFilter ? entity.county === countyFilter : true;
    const matchSearch = search
      ? ev.description?.toLowerCase().includes(search.toLowerCase()) ||
        ev.tags?.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchState && matchCounty && matchSearch;
  });

  const allStates = Object.keys(stateCountyData);
  const filteredCounties = stateFilter ? stateCountyData[stateFilter] || [] : [];

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">📍 Evidence Vault Wall</h2>

        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search tags or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
            <option value="">All States</option>
            {allStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={countyFilter} onChange={(e) => setCountyFilter(e.target.value)}>
            <option value="">All Counties</option>
            {filteredCounties.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredEvidence.map((ev) => {
            const entity = entities.find((e) => e.id === ev.entity_id);
            return (
              <div key={ev.id} className="card p-4 space-y-2">
                <p className="text-sm text-yellow-800 font-semibold">
                  {entity?.name} ({entity?.county}, {entity?.state})
                </p>
                {ev.user?.username && (
                  <p className="text-xs italic text-gray-600">Posted by: {ev.user.username}</p>
                )}
                <p>{ev.description}</p>
                {ev.blob_url.endsWith(".pdf") ? (
                  <iframe src={ev.blob_url} className="w-full h-48 border" title="pdf" />
                ) : ev.blob_url.match(/\.(jpe?g|png|gif)$/i) ? (
                  <img src={ev.blob_url} alt="Evidence" className="w-full rounded" />
                ) : ev.blob_url.match(/\.(mp4|webm)$/i) ? (
                  <video controls src={ev.blob_url} className="w-full rounded" />
                ) : ev.blob_url.match(/\.(mp3|wav)$/i) ? (
                  <audio controls src={ev.blob_url} className="w-full" />
                ) : (
                  <iframe src={ev.blob_url} className="w-full h-48 border bg-white" title="embedded content" />
                )}
              </div>
            );
          })}
        </div>

        {filteredEvidence.length === 0 && <p className="italic text-gray-500">No matching evidence found.</p>}
      </div>
    </Layout>
  );
}
