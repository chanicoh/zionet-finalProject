import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css'; // Importing the CSS file

const NewsFeed = () => {
  const location = useLocation();
  const { userId } = location.state || {}; // userId from the navigation state
  const [email, setUserEmail] = useState('');
  const [preferences, setPreferences] =useState([]);
  const [news, setNews] = useState([]);
  const [emailNews, setEmailNews] = useState([]);
  const [fullName, setFullName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newPreference, setNewPreference] = useState('');
  const [showMenu, setShowMenu] = useState(false); // State for toggling the side menu
  const [loading, setLoading] = useState(true);
  const [newsToShow, setNewsToShow] = useState(5);

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        // Request to get user details
        const userResponse = await axios.get(`http://localhost:5000/email`, { params: { id: userId } });
        setUserEmail(userResponse.data.email);

        const nameResponse = await axios.get(`http://localhost:5000/name`, { params: { id: userId } });
        setFullName(nameResponse.data.fullName);

        const preferencesResponse = await axios.get(`http://localhost:5000/preferences`, { params: { id: userId } });
        console.log(preferencesResponse.data.preferences);
        setPreferences(preferencesResponse.data.preferences);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    }

    async function fetchNews() {
      try {
        // Request to the news service based on preferences
        const newsResponse = await axios.post(`http://localhost:5001/fetch-news`, {  params: { id: userId },  });// Sending user id to get news
        setNews(newsResponse.data.summarizedNews);
        const responeEmail = await axios.post(`http://localhost:5002/send-email`, {  params: { email: email },
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: newsResponse.data.summarizedNews,  });
          console.log(responeEmail.data);
          setEmailNews(responeEmail.data);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    }

    if (userId) {
      fetchUserDetails();
      fetchNews().then(() => {
        setLoading(false); 
      });
    }
  }, [userId, email]);

  const loadMoreNews = () => {
    setNewsToShow(newsToShow + 5); // טוען 5 כותרות נוספות
  };
  

  const savePreferences = async () => {
    try {
      const filteredPreferences = preferences.filter(pref => pref.trim() !== "");
      const updatedPreferences = [...filteredPreferences, newPreference.trim()].filter(pref => pref !== "");
      //const updatedPreferences = [...preferences, newPreference];
      console.log(updatedPreferences);
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
                {preferences &&preferences.length > 0 ? (
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

      <div className="news-wrapper">
  <div className="news-container">
    <h2>Latest News Based on Your Preferences</h2>
    <h2>{emailNews}</h2>
    {loading ? (
      <p>Loading...</p> // הצגת סימולציה של טעינה
    ) : (
      <>
        {news.slice(0, newsToShow).map((article, index) => (
          <div key={index} className="news-item">
            <h4>{article.title}</h4>
            <a href={article.link} target="_blank" rel="noopener noreferrer">Read more</a>
          </div>
        ))}
        {newsToShow < news.length && (
          <button className="load-more-button" onClick={loadMoreNews}>Load More</button> // כפתור להטעין עוד
        )}
      </>
    )}
  </div>
</div>

    </div>
  );
};

export default NewsFeed;
