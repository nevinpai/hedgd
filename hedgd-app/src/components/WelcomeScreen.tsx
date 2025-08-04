import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [isHovered, setIsHovered] = useState(false);

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textAlign: 'center',
    padding: '2rem',
    zIndex: 50,
    height: '100vh',
    overflow: 'hidden',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '1rem 3rem',
    backgroundColor: isHovered ? '#111827' : 'black',
    color: 'white',
    borderRadius: '1rem',
    fontSize: '1.25rem',
    fontFamily: 'Georgia, serif',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
  };

  return (
    <motion.div
      style={containerStyle}
      initial={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100vh', transition: { duration: 0.7, ease: "easeInOut" } }}
    >
      <div style={{paddingTop: '5rem'}}>
        <h1 style={{ fontFamily: 'Recoleta-Regular', fontWeight: 200, fontSize: 'clamp(1rem, 12vw, 4rem)', color: '#374151' }}>
          Can Your Beliefs Beat the Market?
        </h1>
        <p style={{ marginTop: '1rem', fontSize: '1.25rem', color: '#4B5563', fontFamily: 'Georgia, serif' }}>
          Our sophisticated A.I. uses your predictions to find the best stocks
        </p>
      </div>

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

      <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
        <Link to="/disclaimer" style={{textDecoration: 'underline', color: 'gray', fontSize: '0.8rem'}}>
          Disclaimer
        </Link>
      </p>
    </motion.div>
  );
};

export default WelcomeScreen;
