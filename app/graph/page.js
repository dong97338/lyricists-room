'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function Page2() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || 'No topic';
  const [sentence, setSentence] = useState('');

  const handleMake = () => {
    alert(`Sentence: ${sentence}`);
  };

  return (
    <div className="text-center flex flex-col justify-between min-h-screen">
      <div className="flex-grow flex items-center justify-center">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg blur-md"></div>
          <div className="relative text-2xl font-bold text-white p-4 bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg">
            {topic}
          </div>
        </div>
      </div>
      <div className="mb-16 flex items-center justify-center w-full">
        <input 
          type="text" 
          placeholder="MAKE A SENTENCE USING THE CHOSEN WORD" 
          className="w-128 p-3 border rounded-md text-lg"
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
        />
        <button 
          className="ml-4 p-3 bg-gray-400 rounded-md text-lg"
          onClick={handleMake}
        >
          MAKE
        </button>
      </div>
    </div>
  );
}