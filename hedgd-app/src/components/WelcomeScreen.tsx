import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle: React.CSSProperties = {
    padding: '1rem 3rem',
    backgroundColor: isHovered ? '#111827' : 'black', // bg-black, hover:bg-gray-900
    color: 'white',
    borderRadius: '1rem', // rounded-2xl
    fontSize: '1.25rem', // text-xl
    fontFamily: 'Georgia, serif',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-lg
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
  };

  return (
    <motion.div
      className="absolute inset-0 bg-white flex flex-col justify-between text-center p-8 z-50"
      initial={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100vh', transition: { duration: 0.7, ease: "easeInOut" } }}
    >
      {/* Top section for title and subtitle */}
      <div className="pt-20">
        <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Recoleta-Regular', fontWeight: '200', fontSize: 'clamp(1rem, 12vw, 4rem)' }}>
          Can Your Beliefs Beat the Market?
        </h1>
        <p className="mt-4 text-xl text-gray-600" style={{ fontFamily: 'Georgia, serif' }}>
          Our sophisticated A.I. uses your predictions to find the best stocks
        </p>
      </div>

      {/* Button */}
      <div>
        <button
          onClick={onStart}
          style={buttonStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Find Out
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 italic" style={{ fontFamily: 'Georgia, serif' }}>
        <Link to="/disclaimer" className="hover:text-gray-600" style={{textDecoration: 'underline', color: 'gray', fontSize: '0.8rem'}}>
          Disclaimer
        </Link>
      </p>
    </motion.div>
  );
};

export default WelcomeScreen; 