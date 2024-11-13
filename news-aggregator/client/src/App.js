import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; 
import { useNavigate } from 'react-router-dom';
import './App.css'; // כולל את הגדרת העיצובים
import NewsFeed from './NewsFeed';


// רכיב לטופס רישום
const RegisterForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferences, setPreferences] = useState('');
  const [error, setError] = useState(''); // ניהול הודעת שגיאה
  const navigate = useNavigate(); // השתמש ב-useNavigate בתוך רכיב שמצוי בתוך Router

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userData = { name, email, password, preferences: preferences.split(',') };

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register');
      }

      const data = await response.json();
      onSubmit(data);
      navigate('/newsFeed');
    } catch (error) {
      setError(error.message); // הגדרת הודעת השגיאה במצב
      console.error('Error registering user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
       <div>{error && <p className="error">{error}</p>}</div> 
      <div>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div>
        <label>Preferences:</label>
        <input type="text" value={preferences} onChange={(e) => setPreferences(e.target.value)} required />
      </div>
      <button type="submit">Register</button>
    </form>
  );
};

// רכיב לטופס התחברות
const LoginForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // ניהול הודעת שגיאה
  const navigate = useNavigate(); // השתמש ב-useNavigate בתוך רכיב שמצוי בתוך Router

  const handleSubmit = async (event) => {
    event.preventDefault();
    const loginData = { email, password };

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid credentials');
      }

      const data = await response.json();
      onSubmit(data);
      navigate('/newsFeed');
    } catch (error) {
      setError(error.message); // הגדרת הודעת השגיאה במצב
      console.error('Error logging in:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
       <div>{error && <p className="error">{error}</p>}</div> 
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

// רכיב ראשי
function App() {
  const [userData, setUserData] = useState(null);
  
  const handleUserSubmit = (user) => {
    setUserData(user);
  };

  return (
    <Router>
      <div className="App">
        <h1>Personalized News Aggregator</h1>
        
        {!userData ? (
          <Routes>
            <Route path="/login" element={
              <div>
                <h3>Login</h3>
                <LoginForm onSubmit={handleUserSubmit} />
                <div className="switch">
                  <Link to="/register">Don't have an account? Register</Link>
                </div>
              </div>
            } />
            <Route path="/register" element={
              <div>
                <h3>Register</h3>
                <RegisterForm onSubmit={handleUserSubmit} />
                <div className="switch">
                  <Link to="/login">Already have an account? Login</Link>
                </div>
              </div>
            } />
            
            <Route path="/newsFeed" element={<NewsFeed/>} />
          </Routes>
        ) : (
          <div>
            <h3>Welcome, {userData.name}</h3>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
