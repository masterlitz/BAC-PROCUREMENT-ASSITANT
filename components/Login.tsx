import React, { useState } from 'react';
import { authService, SessionUser } from '../auth/authService';
import { bacolodCityLogo } from '../data/logo';

interface LoginProps {
  onLoginSuccess: (user: SessionUser) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await authService.login(username, password);
      onLoginSuccess(user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Style for "BACOLOD" text
  const bacolodTextStyle = {
      color: '#FFF', // white
      textShadow:
          // Blue outline for thickness
          '-2px -2px 0 #1d4ed8, 2px -2px 0 #1d4ed8, -2px 2px 0 #1d4ed8, 2px 2px 0 #1d4ed8, ' +
          '-1px -1px 0 #1d4ed8, 1px -1px 0 #1d4ed8, -1px 1px 0 #1d4ed8, 1px 1px 0 #1d4ed8, ' +
          // Orange drop shadow
          '4px 4px 0px #f97316'
  };

  const HeartIcon = () => (
      <svg
          xmlns="http://www.w3.org/2000/svg"
          className="inline-block h-[0.8em] w-[0.9em] text-orange-500 mx-1"
          style={{
              filter: 'drop-shadow(-2px -2px 0 #1d4ed8) drop-shadow(2px -2px 0 #1d4ed8) drop-shadow(-2px 2px 0 #1d4ed8) drop-shadow(2px 2px 0 #1d4ed8) drop-shadow(4px 4px 0px #f97316)',
              marginTop: '-0.1em'
          }}
          viewBox="0 0 20 20"
          fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
  );

  // Style objects for the "Stronger Together" text
  const commonWhiteStroke = {
    textShadow: '-1.5px -1.5px 0 #FFF, 1.5px -1.5px 0 #FFF, -1.5px 1.5px 0 #FFF, 1.5px 1.5px 0 #FFF',
  };
  const blueTextStyle = {
      color: '#1d4ed8', // blue-700
      ...commonWhiteStroke
  };
  const orangeTextStyle = {
      color: '#f97316', // orange-500
      ...commonWhiteStroke
  };

  return (
    <div 
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
        style={{
            backgroundImage: `url('https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/b3/cd/5f/caption.jpg?w=1000&h=-1&s=1')`
        }}
    >
        <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
            <img src={bacolodCityLogo} alt="Bacolod BAC Logo" className="h-24 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-gray-800">BAC Procurement Assistant</h1>
            
            {/* New BACOLOD logo text */}
            <div 
              className="text-5xl font-black tracking-tighter my-4"
              style={{ animation: 'float-up-down 4s ease-in-out infinite' }}
            >
                <span style={bacolodTextStyle}>BAC</span>
                <HeartIcon />
                <span style={bacolodTextStyle}>LOD</span>
            </div>

             <p 
                style={{ fontFamily: 'cursive, "Brush Script MT"', animation: 'float-up-down-subtle 4s ease-in-out infinite', animationDelay: '0.2s' }} 
                className="text-xl font-bold -mt-2"
              >
                <span style={blueTextStyle}>Stron</span>
                <span style={orangeTextStyle}>g</span>
                <span style={blueTextStyle}>er To</span>
                <span style={orangeTextStyle}>g</span>
                <span style={blueTextStyle}>ether!</span>
            </p>
            <p className="text-gray-500 mt-2">Please sign in to continue</p>
        </div>
        <div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="text-sm font-bold text-gray-600 block mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="admin or user@bacolodcity.gov.ph"
                disabled={loading}
                autoComplete="username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-sm font-bold text-gray-600 block mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
              <button
                type="submit"
                className="w-full btn bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
          <div className="text-center mt-6">
            <a
              href="https://forms.hive.com/?formId=dEqfsaS8nici4rZiQ"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-gray-500 hover:text-orange-600 hover:underline"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;