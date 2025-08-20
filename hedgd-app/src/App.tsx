import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import SwipeableCard from './components/SwipeableCard';
import ProgressBar from './components/ProgressBar';
import WelcomeScreen from './components/WelcomeScreen';
import LoadingScreen from './components/LoadingScreen';
import BackArrowIcon from './components/BackArrowIcon';
import RecommendationIntroCard from './components/RecommendationIntroCard';
import RecommendationCard from './components/RecommendationCard';
import SummaryCard from './components/SummaryCard';
import './index.css';

const questionsApiUrl = 'https://hedgd.onrender.com/api/questions';
const recommendationsApiUrl = 'https://hedgd.onrender.com/api/recommendations';

interface Recommendation {
  score: number;
  ticker: string;
  explanation: string;
}

export default function App() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [cardIndex, setCardIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer: boolean }[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationCardIndex, setRecommendationCardIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        const response = await fetch(questionsApiUrl);
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

  useEffect(() => {
    async function fetchRecommendations() {
      if (answers.length === questions.length && questions.length > 0) {
        try {
          const response = await fetch(recommendationsApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answers }),
          });
          if (!response.ok) {
            throw new Error('Failed to fetch recommendations.');
          }
          const data = await response.json();
          setRecommendations(data.recommendations || []);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
          setLoadingRecommendations(false);
        }
      }
    }
    fetchRecommendations();
  }, [answers, questions]);

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
    if (cardIndex > 0 && cardIndex <= questions.length) {
        if (cardIndex === questions.length) {
            setLoadingRecommendations(true);
        }
        const answer = direction === 'right';
        setAnswers((prev) => [
            ...prev,
            { question: questions[cardIndex - 1], answer },
        ]);
        setCardIndex((prev) => prev + 1);
    } else if (cardIndex === 0) { // First intro card
        setCardIndex(1);
    } else if (recommendationCardIndex < recommendations.length) { // Recommendation cards
        setRecommendationCardIndex((prev) => prev + 1);
    } else if (recommendationCardIndex === recommendations.length) {
        setShowSummary(true);
    }
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
  
  if (loadingRecommendations) {
    return <LoadingScreen />;
  }

  if (showSummary) {
    return (
        <div style={{...pageStyle, backgroundColor: '#1a223f'}}>
            <SummaryCard answers={answers} recommendations={recommendations} />
        </div>
    );
  }

  const allQuestionsAnswered = questions.length > 0 && answers.length === questions.length;
  const progress = allQuestionsAnswered 
    ? (recommendationCardIndex / (recommendations.length + 1)) * 100 
    : (answers.length / questions.length) * 100;
  const isProgressBarVisible = (cardIndex > 0 && cardIndex <= questions.length) || allQuestionsAnswered;
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

          {!showWelcome && cardIndex > 0 && cardIndex <= questions.length && questions.slice(cardIndex - 1, cardIndex + 2).map((question, index) => {
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

          {allQuestionsAnswered && recommendationCardIndex === 0 && (
            <SwipeableCard
                key="recommendation-intro"
                onSwipe={handleSwipe}
                isDraggable={true}
            >
                <RecommendationIntroCard />
            </SwipeableCard>
          )}

          {allQuestionsAnswered && recommendationCardIndex > 0 && recommendations.slice(recommendationCardIndex - 1, recommendationCardIndex + 2).map((rec, index) => {
            const isTopCard = index === 0;
            const cardRealIndex = recommendationCardIndex - 1 + index;

            if (cardRealIndex >= recommendations.length) return null;

            return (
                <RecommendationCard
                    key={rec.ticker}
                    ticker={rec.ticker}
                    explanation={rec.explanation}
                    score={rec.score}
                    onSwipe={handleSwipe}
                    isDraggable={isTopCard}
                    style={{
                        zIndex: recommendations.length - cardRealIndex,
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
