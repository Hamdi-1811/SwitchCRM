import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
  <svg
    className={className || "w-8 h-8"}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <path
      d="M20 50 C 35 20, 65 20, 80 50 S 90 80, 50 85 C 10 90, 10 50, 20 50 Z"
      stroke="url(#gold-gradient)"
      strokeWidth="8"
      strokeLinecap="round"
    />
     <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#fde047', stopOpacity: 1}} />
            <stop offset="100%" style={{stopColor: '#ca8a04', stopOpacity: 1}} />
        </linearGradient>
    </defs>
  </svg>
);
