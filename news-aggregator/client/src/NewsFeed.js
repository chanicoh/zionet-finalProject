// NewsFeed.jsx
import React, { useState, useEffect } from 'react';

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/fetch-news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setNews(data.news);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div>
      <h2>Personalized News Feed</h2>
      {loading && <p>Loading news...</p>}
      {error && <p className="error">{error}</p>}
      <ul>
        {news.map((item, index) => (
          <li key={index}>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <a href={item.url} target="_blank" rel="noopener noreferrer">Read more</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsFeed;
