'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Props {
  onSelect: (mode: string, name: string) => void;
}

export default function ModeSelect({ onSelect }: Props) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<'self' | 'challenge'>('self');

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-400 text-sm mb-10 transition-colors"
        >
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mb-2">How would you like to take the test?</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Your answers are private. Results are shared only if you choose to.
        </p>

        {/* Mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Self */}
          <button
            onClick={() => setSelected('self')}
            className={`p-5 rounded-xl border text-left transition-all ${
              selected === 'self'
                ? 'border-[#c0392b] bg-[#c0392b]/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-2xl mb-2">🪞</div>
            <div className="font-semibold mb-1">Test Myself</div>
            <div className="text-xs text-gray-500">
              Assess your own Dark Triad traits
            </div>
          </button>

          {/* Challenge */}
          <button
            onClick={() => setSelected('challenge')}
            className={`p-5 rounded-xl border text-left transition-all ${
              selected === 'challenge'
                ? 'border-[#c0392b] bg-[#c0392b]/10'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-2xl mb-2">⚔️</div>
            <div className="font-semibold mb-1">Challenge a Friend</div>
            <div className="text-xs text-gray-500">
              Take the test first — get a link to challenge someone
            </div>
          </button>
        </div>

        {/* Optional name */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Your name <span className="text-gray-600">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex"
            maxLength={50}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#c0392b]/60 transition-colors"
          />
        </div>

        <button
          onClick={() => onSelect(selected, name.trim())}
          className="w-full py-4 bg-[#c0392b] hover:bg-[#a93226] text-white font-bold text-lg rounded-lg transition-colors shadow-lg shadow-[#c0392b]/20"
        >
          Begin Assessment →
        </button>

        <p className="mt-4 text-center text-xs text-gray-700">
          15 questions · ~90 seconds · Anonymous
        </p>
      </div>
    </div>
  );
}
