import React from 'react';

interface ProgressBarProps {
  progress: number;
  isVisible: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, isVisible }) => {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    transition: 'opacity 300ms',
    opacity: isVisible ? 1 : 0,
  };

  const trackStyle: React.CSSProperties = {
    width: '100%',
    height: '8px',
    backgroundColor: '#E5E7EB', // Equivalent to bg-gray-200
  };
  
  const fillStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: '#3ba97b', // Equivalent to bg-hedgd-green
    width: `${progress}%`,
    transition: 'width 300ms ease-in-out',
  };

  return (
    <div style={containerStyle}>
      <div style={trackStyle}>
        <div style={fillStyle} />
      </div>
    </div>
  );
};

export default ProgressBar; 