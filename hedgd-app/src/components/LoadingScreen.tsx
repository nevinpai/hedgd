import { useState, useEffect } from 'react';

const messages = [
  "Analyzing your answers...",
  "Getting real-time market data...",
  "Forecasting your hedges...",
  "Compiling your portfolio...",
  "Finalizing recommendations...",
  " "
];

export default function LoadingScreen() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);

  useEffect(() => {
    if (currentMessageIndex < messages.length) {
      const messageInterval = setInterval(() => {
        setDisplayedMessages(prev => [...prev, messages[currentMessageIndex]]);
        setCurrentMessageIndex(prev => prev + 1);
      }, 1500);

      return () => clearInterval(messageInterval);
    }
  }, [currentMessageIndex]);

  const containerStyle: React.CSSProperties = {
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    padding: '1rem',
  };

  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '42rem',
  };

  const messageContainerStyle: React.CSSProperties = {
    height: 'auto',
  };

  const getMessageStyle = (index: number): React.CSSProperties => {
    const isOneOfLastTwo = index >= messages.length - 2;
    const animationName = isOneOfLastTwo ? 'fade-in' : 'fade-in-out';
    const animationDuration = isOneOfLastTwo ? '1.5s' : '3s';

    return {
      textAlign: 'left',
      fontSize: 'clamp(1.5rem, 8vw, 3.5rem)',
      fontWeight: '300',
      padding: '0.5rem 0',
      fontFamily: 'Georgia, serif',
      animation: `${animationName} ${animationDuration} ease-in-out forwards`,
      wordBreak: 'break-word',
    };
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <div style={messageContainerStyle}>
          {displayedMessages.map((msg, index) => (
            <div
              key={index}
              style={getMessageStyle(index)}
            >
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
