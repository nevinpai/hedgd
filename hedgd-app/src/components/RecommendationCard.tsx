import { motion, useMotionValue, useTransform, useMotionValueEvent } from 'framer-motion';
import { useRef, useState } from 'react';

interface RecommendationCardProps {
  ticker: string;
  explanation: string;
  score: number;
  onSwipe: (direction: 'left' | 'right') => void;
  isDraggable?: boolean;
  style?: React.CSSProperties;
}

export default function RecommendationCard({ ticker, explanation, score, onSwipe, isDraggable = true, style }: RecommendationCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleDragEnd(_e: any, info: { offset: { x: number } }) {
    if (info.offset.x > 120) {
      onSwipe('right');
    } else if (info.offset.x < -120) {
      onSwipe('left');
    }
  }

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
        <div className="w-full h-full p-6 flex flex-col justify-between">
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(2rem, 8vw, 3.5rem)',
            lineHeight: '1.2',
            fontWeight: '550',
            color: '#000000',
            textAlign: 'center'
          }}>
            {ticker}
          </h2>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.2rem',
            lineHeight: '1.5',
            color: '#333333',
            textAlign: 'center'
          }}>
            {explanation}
          </p>
          <div style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1rem',
            color: '#666666',
            textAlign: 'center'
          }}>
            Alignment Score: {Math.round(score * 100)}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}
