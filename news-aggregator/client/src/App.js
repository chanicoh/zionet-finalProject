import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home'; // יבוא את עמוד הבית
import LoginPage from './LoginPage'; 
import RegisterPage from './RegisterPage';
import NewsFeed from './NewsFeed';

function App() {
  const [userData, setUserData] = useState(null);

  const handleUserSubmit = (user) => {
    setUserData(user);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {}
          <Route path="/" element={<Home />} />

          {}
          <Route path="/login" element={<LoginPage onSubmit={handleUserSubmit} />} />

          {}
          <Route path="/register" element={<RegisterPage onSubmit={handleUserSubmit} />} />

          {}
          {userData && <Route path="/newsFeed" element={<NewsFeed />} />}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
