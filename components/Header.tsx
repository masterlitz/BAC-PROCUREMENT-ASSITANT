import React from 'react';
import { bacolodCityLogo } from '../data/logo';

const Header: React.FC = () => {
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

    // Style objects for the "Stronger Together" text, for consistency
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
        <header className="text-center mb-8">
            <div className="mb-4 flex justify-center">
                <img src={bacolodCityLogo} alt="Bacolod BAC Logo" className="h-32" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">BIDS AND AWARDS COMMITTEE</h1>
            <p className="text-gray-500 mt-2">BAC Procurement Assistant</p>
            
            {/* New BACOLOD logo text */}
            <div 
              className="text-6xl font-black tracking-tighter my-4"
              style={{ animation: 'float-up-down 4s ease-in-out infinite' }}
            >
                <span style={bacolodTextStyle}>BAC</span>
                <HeartIcon />
                <span style={bacolodTextStyle}>LOD</span>
            </div>

            <p 
              style={{ fontFamily: 'cursive, "Brush Script MT"', animation: 'float-up-down-subtle 4s ease-in-out infinite', animationDelay: '0.2s' }} 
              className="text-2xl font-bold -mt-2"
            >
                <span style={blueTextStyle}>Stron</span>
                <span style={orangeTextStyle}>g</span>
                <span style={blueTextStyle}>er To</span>
                <span style={orangeTextStyle}>g</span>
                <span style={blueTextStyle}>ether!</span>
            </p>
            <hr className="my-6 border-orange-200" />
        </header>
    );
};

export default Header;