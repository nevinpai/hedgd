import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeableCard from './components/SwipeableCard';
import ProgressBar from './components/ProgressBar'; // Import the new component
import WelcomeScreen from './components/WelcomeScreen'; // Import the new component
import LoadingScreen from './components/LoadingScreen'; // Import the new loading screen
import BackArrowIcon from './components/BackArrowIcon'; // Import the new icon
import './index.css';

const apiUrl = import.meta.env.DEV
  ? 'http://localhost:3001/api/questions'
  : 'https://hedgd.onrender.com/api/questions';

export default function App() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true); // New state for welcome screen
  const [cardIndex, setCardIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer: boolean }[]>([]);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch questions from the server.');
        }
        const data = await response.json();
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setQuestions(['Failed to load questions. Please try again later.']);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  function handleGoBack() {
    if (cardIndex > 1) {
      setCardIndex((prev) => prev - 1);
      setAnswers((prev) => prev.slice(0, prev.length - 1));
    }
  }

  function handleStart() {
    setShowWelcome(false);
  }

  function handleSwipe(direction: 'left' | 'right') {
    if (cardIndex === 0) {
      if (questions.length > 0) {
        setCardIndex(1);
      }
      return;
    }
    const answer = direction === 'right';
    setAnswers((prev) => [
      ...prev,
      { question: questions[cardIndex - 1], answer },
    ]);
    setCardIndex((prev) => prev + 1);
  }

  const pageStyle: React.CSSProperties = {
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (loading) {
    return <div style={{...pageStyle, backgroundColor: '#FFFFFF', color: '#000000'}}>Loading questions...</div>;
  }

  if (error) {
    return <div style={{...pageStyle, backgroundColor: '#FFFFFF', color: '#EF4444'}}>Error: {error}</div>;
  }
  
  if (questions.length > 0 && answers.length === questions.length) {
    return <LoadingScreen />;
  }

  const progress = questions.length > 0 ? (answers.length / questions.length) * 100 : 0;
  const isProgressBarVisible = cardIndex > 0 && cardIndex <= questions.length;
  const isBackArrowVisible = cardIndex > 1 && cardIndex <= questions.length;

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: showWelcome ? '#FFFFFF' : '#1a223f', overflow: 'hidden'}}>
      <ProgressBar progress={progress} isVisible={isProgressBarVisible} />
      
      <div style={{position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '1rem'}}>
        <AnimatePresence>
          {showWelcome && <WelcomeScreen onStart={handleStart} />}

          {!showWelcome && cardIndex === 0 && (
            <SwipeableCard
              key="intro"
              isIntro={true}
              onSwipe={handleSwipe}
            />
          )}

          {!showWelcome && cardIndex > 0 && questions.slice(cardIndex - 1, cardIndex + 2).map((question, index) => {
            const isTopCard = index === 0;
            const cardRealIndex = cardIndex - 1 + index;

            if (cardRealIndex >= questions.length) return null;

            return (
              <SwipeableCard
                key={cardRealIndex}
                question={question}
                onSwipe={handleSwipe}
                isDraggable={isTopCard}
                style={{
                  zIndex: questions.length - cardRealIndex,
                  transform: `scale(${1 - index * 0.05}) translateY(-${index * 20}px)`,
                  opacity: 1 - index * 0.1,
                  transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <div style={{ height: '5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {isBackArrowVisible && (
          <button
            onClick={handleGoBack}
            style={{
              color: '#9CA3AF',
              transition: 'color 300ms'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#4B5563'}
            onMouseOut={(e) => e.currentTarget.style.color = '#9CA3AF'}
            aria-label="Go back"
          >
            <BackArrowIcon style={{ width: '1.5rem', height: '1.5rem' }} />
          </button>
        )}
      </div>
    </div>
  );
}
