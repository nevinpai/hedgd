import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeableCard from './components/SwipeableCard';
import ProgressBar from './components/ProgressBar'; // Import the new component
import WelcomeScreen from './components/WelcomeScreen'; // Import the new component
import hedgdLogo from './assets/hedgd_logo.png';
import './index.css';

const placeholderImages = [
  'https://source.unsplash.com/featured/?finance',
  'https://source.unsplash.com/featured/?risk',
  'https://source.unsplash.com/featured/?technology',
  'https://source.unsplash.com/featured/?esg',
  'https://source.unsplash.com/featured/?dividend',
  'https://source.unsplash.com/featured/?international',
  'https://source.unsplash.com/featured/?environment',
  'https://source.unsplash.com/featured/?crypto',
  'https://source.unsplash.com/featured/?realestate',
  'https://source.unsplash.com/featured/?liquidity',
  'https://source.unsplash.com/featured/?stocks',
  'https://source.unsplash.com/featured/?bonds',
  'https://source.unsplash.com/featured/?growth',
  'https://source.unsplash.com/featured/?value',
  'https://source.unsplash.com/featured/?emerging-markets',
];

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
        const response = await fetch('http://localhost:3001/api/questions');
        if (!response.ok) {
          throw new Error('Failed to fetch questions from the server.');
        }
        const data = await response.json();
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        // Optional: fall back to some default questions
        setQuestions(['Failed to load questions. Please try again later.']);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading questions...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500">Error: {error}</div>;
  }
  
  // Show final JSON after all questions
  if (cardIndex > 0 && cardIndex > questions.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-hedgd-blue">
        <div className="bg-hedgd-card rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center">
          <img src={hedgdLogo} alt="hedgd logo" className="w-20 h-20 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Your Answers</h2>
          <pre className="bg-gray-900 text-gray-300 rounded p-4 w-full overflow-x-auto text-xs text-left">
            {JSON.stringify(answers, null, 2)}
          </pre>
          <p className="text-gray-300 text-xs mt-4 text-center">(This will be sent to the LLM for personalized investment suggestions)</p>
        </div>
      </div>
    );
  }

  const progress = questions.length > 0 ? (answers.length / questions.length) * 100 : 0;
  const isProgressBarVisible = cardIndex > 0 && cardIndex <= questions.length;

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      <ProgressBar progress={progress} isVisible={isProgressBarVisible} />
      
      <div className="relative flex-grow flex items-center justify-center">
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
    </div>
  );
}
