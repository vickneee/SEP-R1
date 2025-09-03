'use client';

import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
}

function Button ({ children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-[#552A1B] text-white rounded hover:bg-[#E46A07] transition-colors duration-300 hover:cursor-pointer"
    >
      {children}
    </button>
  );
}

export default Button;
