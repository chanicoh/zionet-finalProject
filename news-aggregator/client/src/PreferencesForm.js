// PreferencesForm.jsx
import React, { useState, useEffect } from 'react';

const PreferencesForm = ({ onPreferencesSubmit }) => {
  const [preferences, setPreferences] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userPreferences = { preferences: preferences.split(',') };

    try {
      const response = await fetch('http://localhost:5000/update-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPreferences),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update preferences');
      }

      const data = await response.json();
      onPreferencesSubmit(data);
    } catch (error) {
      setError(error.message);
      console.error('Error updating preferences:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>{error && <p className="error">{error}</p>}</div>
      <div>
        <label>Preferences:</label>
        <input
          type="text"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          placeholder="Enter categories, e.g., tech, sports"
          required
        />
      </div>
      <button type="submit">Update Preferences</button>
    </form>
  );
};

export default PreferencesForm;
