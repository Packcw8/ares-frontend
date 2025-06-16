import React, { useEffect, useState } from "react";
import axios from "axios";

const EntityRatingPage = () => {
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [ratings, setRatings] = useState({
    accountability: 0,
    respect: 0,
    effectiveness: 0,
    transparency: 0,
    public_impact: 0,
  });
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/ratings/entities`
        );
        setEntities(response.data);
      } catch (error) {
        console.error("Error fetching entities:", error);
      }
    };

    fetchEntities();
  }, []);

  const handleRatingChange = (category, value) => {
    setRatings((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token"); // ✅ Ensure token is retrieved

    const ratingData = {
      entity_id: selectedEntity,
      ratings,
      comment,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/ratings/submit`,
        ratingData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Token added here
          },
        }
      );
      alert("Rating submitted!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Rate an Official or Agency</h2>

      <select
        className="mb-4 w-full p-2 border rounded"
        value={selectedEntity}
        onChange={(e) => setSelectedEntity(e.target.value)}
      >
        <option value="">Select an Entity</option>
        {entities.map((entity) => (
          <option key={entity.id} value={entity.id}>
            {entity.name} ({entity.type})
          </option>
        ))}
      </select>

      {["accountability", "respect", "effectiveness", "transparency", "public_impact"].map(
        (category) => (
          <div key={category} className="mb-3">
            <label className="block capitalize">{category}:</label>
            <input
              type="number"
              min="1"
              max="5"
              className="w-full p-2 border rounded"
              value={ratings[category]}
              onChange={(e) =>
                handleRatingChange(category, parseInt(e.target.value, 10))
              }
            />
          </div>
        )
      )}

      <textarea
        className="w-full p-2 border rounded mb-4"
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Rating
      </button>
    </div>
  );
};

export default EntityRatingPage;
