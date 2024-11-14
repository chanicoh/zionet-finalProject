import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to Personalized News Aggregator</h1>
      <div>
        <Link to="/login">
          <button className='login'>Login</button>
        </Link>
      </div>
      <div>
        <Link to="/register">
          <button className='Register'>Register</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
