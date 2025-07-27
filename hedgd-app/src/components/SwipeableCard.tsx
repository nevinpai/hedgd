import { motion, useMotionValue, useTransform, useMotionValueEvent } from 'framer-motion';
import { useRef, useState } from 'react';
import hedgdLogo from '../assets/hedgd_logo.png';

interface SwipeableCardProps {
  question?: string;
  isIntro?: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
  isDraggable?: boolean;
  style?: React.CSSProperties;
}

export default function SwipeableCard({ question, isIntro, onSwipe, isDraggable = true, style }: SwipeableCardProps) {
  // --- Motion Values Setup ---
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);

  // Determine feedback state ('agree', 'disagree', or '') from the card's rotation.
  const feedbackState = useTransform(rotate, (r) => {
    if (r > 5) return 'agree';
    if (r < -5) return 'disagree';
    return '';
  });

  // --- Style Transformations ---
  const bgGlow = useTransform(feedbackState, (state) => {
    const baseShadow = '0 4px 14px 0 rgba(0, 0, 0, 0.1)'; // A subtle, consistent shadow
    if (state === 'disagree') return `${baseShadow}, 0 0 24px 6px #ff4d4d`;
    if (state === 'agree') return `${baseShadow}, 0 0 24px 6px #4dff88`;
    return baseShadow;
  });

  const feedbackLabelColor = useTransform(feedbackState, (state) => {
    if (state === 'agree') return '#4dff88';
    if (state === 'disagree') return '#ff4d4d';
    return 'transparent';
  });

  // Opacity for the feedback text container. 1 when feedback is active, 0 otherwise.
  const feedbackOpacity = useTransform(feedbackState, (state) => (state !== '' ? 1 : 0));
  // Opacity for the main card content. 0 when feedback is active, 1 otherwise.
  const contentOpacity = useTransform(feedbackState, (state) => (state === '' ? 1 : 0));


  // --- State for Displaying Text ---
  // We use React state to hold the text content. Using .get() in render is not reactive.
  const [feedbackText, setFeedbackText] = useState('');

  // The useMotionValueEvent hook syncs the motion value with React state.
  // When `feedbackState` changes, we update the `feedbackText` state, triggering a re-render.
  useMotionValueEvent(feedbackState, "change", (latest) => {
    if (latest === 'agree') {
      setFeedbackText('agree');
    } else if (latest === 'disagree') {
      setFeedbackText('disagree');
    } else {
      setFeedbackText('');
    }
  });


  // --- Drag and Animation Logic ---
  const cardRef = useRef<HTMLDivElement>(null);

  function handleDragEnd(_e: any, info: { offset: { x: number } }) {
    if (info.offset.x > 120) {
      onSwipe('right');
    } else if (info.offset.x < -120) {
      onSwipe('left');
    }
    // No need to manually reset x here, AnimatePresence handles the exit.
    // If the card is NOT swiped away, Framer Motion will spring it back due to dragConstraints.
  }

  // Gravity‑style exit animation
  const getExit = () => {
    const val = x.get();
    const dir = val > 0 ? 1 : -1;
    return {
      x: dir * 800,
      y: 400,
      rotate: dir * 60,
      opacity: 0,
      transition: { type: 'spring', stiffness: 200, damping: 25 },
    };
  };

  return (
    <motion.div
      ref={cardRef}
      className="absolute rounded-[2rem] border border-slate-200 select-none w-[90vw] h-[75vh] md:w-[600px] md:h-[360px]"
      style={{
        ...style,
        x,
        rotate,
        boxShadow: bgGlow,
        backgroundColor: 'white',
        borderColor: '#333333',
      }}
      drag={isDraggable ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0, y: 60 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={getExit as any}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
    >
      <div className="w-full h-full flex flex-col justify-center items-center px-6 py-4 relative overflow-hidden rounded-[2rem]">
        {/* Feedback label (only when rotating enough) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          style={{
            opacity: feedbackOpacity,
            color: feedbackLabelColor,
          }}
        >
          <span 
            className="font-extrabold tracking-widest text-center"
            style={{ fontSize: 'clamp(4rem, 12vw, 10rem)', fontFamily: 'Georgia, serif' }}
          >
            {feedbackText}
          </span>
        </motion.div>

        {/* Card content (hidden when feedback is showing) */}
        <motion.div
          className="w-full h-full p-6"
          style={{ opacity: contentOpacity }}
        >
          {isIntro ? (
            <div className="flex flex-col h-full w-full justify-center items-center text-center space-y-8 p-4">
              <div className="w-24 h-24">
                <img
                  src={hedgdLogo}
                  alt="hedgd Logo"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
              <h2 className="font-thin text-gray-700 leading-snug max-w-xs"
                style={{ fontFamily: 'Georgia, serif', fontWeight: '400', textAlign: 'left', paddingLeft: '2rem', paddingRight: '2rem', fontSize: '1.2rem' }}>
                we'll ask you a series of questions to determine where you stand on a variety of topics.
                our AI will use your answers to find the best stocks for you based on your beliefs. <br />
                <br />swipe ➡️ if you agree <br />
                swipe ⬅️ if you disagree <br />
                <br /> swipe either way ↔️ to begin
              </h2>
            </div>
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              textAlign: 'left',
              paddingLeft: '2.5rem',
              paddingRight: '2.5rem',
              boxSizing: 'border-box',
            }}>
              <h2 style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(2rem, 8vw, 3.5rem)',
                lineHeight: '1.2',
                fontWeight: '550',
                color: '#1F2937',
                overflowWrap: 'break-word',
              }}>
                {question}
              </h2>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
