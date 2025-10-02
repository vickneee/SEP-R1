'use client';

import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
}

function LocalButton ({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-[#552A1B] rounded-sm text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white transition-colors duration-300 hover:cursor-pointer"
    >
      {children}
    </button>
  );
}

export default LocalButton;
