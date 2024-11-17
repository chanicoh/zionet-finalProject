import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css'; // Importing the CSS file

const NewsFeed = () => {
  const location = useLocation();
  const { userId } = location.state || {}; // userId from the navigation state
  const [email, setUserEmail] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [news, setNews] = useState([]);
  const [fullName, setFullName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newPreference, setNewPreference] = useState('');
  const [showMenu, setShowMenu] = useState(false); // State for toggling the side menu

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        // Request to get user details
        const userResponse = await axios.get(`http://localhost:5000/email`, { params: { id: userId } });
        setUserEmail(userResponse.data.email);

        const nameResponse = await axios.get(`http://localhost:5000/name`, { params: { id: userId } });
        setFullName(nameResponse.data.fullName);

        const preferencesResponse = await axios.get(`http://localhost:5000/preferences`, { params: { id: userId } });
        setPreferences(preferencesResponse.data.preferences);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    }

    async function fetchNews() {
      try {
        // Request to the news service based on preferences
        const newsResponse = await axios.get(`http://localhost:5001/news`, {
          params: { email }, // Sending user email to get news
        });
        setNews(newsResponse.data.news);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    }

    if (userId) {
      fetchUserDetails().then(() => {
        // Fetch news after user details are fetched
        fetchNews();
      });
    }
  }, [userId, email]);

  const savePreferences = async () => {
    try {
      const updatedPreferences = [...preferences, newPreference];
      await axios.put(`http://localhost:5000/preferences`, { preferences: updatedPreferences }, { params: { id: userId } });
      setPreferences(updatedPreferences);
      setNewPreference('');
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  return (
    <div className="news-feed-container">
      {/* Hamburger Menu */}
      <div className={`hamburger-menu ${showMenu ? 'open' : ''}`} onClick={() => setShowMenu(!showMenu)}>
        &#9776;
      </div>

      {/* Side menu that opens from the left */}
      <div className={`side-menu ${showMenu ? 'open' : ''}`}>
        <div className="user-info">
          <h3>Welcome, {fullName}!</h3>
          <p><strong>User Email:</strong> {email}</p>
          <p><strong>Your Preferences:</strong></p>
          {!isEditing ? (
            <div>
              <ul className="preferences-list">
                {preferences.length > 0 ? (
                  preferences.map((preference, index) => (
                    <li key={index}>{preference}</li>
                  ))
                ) : (
                  <p>No preferences set yet.</p>
                )}
              </ul>
              <button className="edit-button" onClick={() => setIsEditing(true)}>Edit</button>
            </div>
          ) : (
            <div>
              <ul className="preferences-list">
                {preferences.map((preference, index) => (
                  <li key={index}>
                    <input
                      type="text"
                      value={preference}
                      onChange={(e) => {
                        const updatedPreferences = [...preferences];
                        updatedPreferences[index] = e.target.value;
                        setPreferences(updatedPreferences);
                      }}
                    />
                  </li>
                ))}
              </ul>
              <input
                type="text"
                placeholder="Add new preference"
                value={newPreference}
                onChange={(e) => setNewPreference(e.target.value)}
              />
              <button className="save-button" onClick={savePreferences}>Save</button>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="main-content">
        <div className="welcome-message">
          <h2>Welcome, {fullName}!</h2>
        </div>

        <div className="news-container">
          <h2>Latest News Based on Your Preferences</h2>
          {news.length > 0 ? (
            news.map((article, index) => (
              <div key={index} className="news-item">
                <h4>{article.title}</h4>
                <p>{article.description}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer">Read more</a>
              </div>
            ))
          ) : (
            <p>No news available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;
