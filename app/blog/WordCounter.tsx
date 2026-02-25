'use client';

import AnimatedText from '../components/AnimatedText';

interface WordCounterProps {
  count: number;
}

export default function WordCounter({ count }: WordCounterProps) {
  const formatted = count.toLocaleString();
  return (
    <div className="list3 word-counter" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <AnimatedText inverse text={formatted} style={{ fontSize: '24px', lineHeight: 1.2 }} />
      <span style={{ fontSize: '0.9em', opacity: 0.8 }}>words</span>
    </div>
  );
}
