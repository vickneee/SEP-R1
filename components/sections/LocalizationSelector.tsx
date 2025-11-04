"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocaleParams } from '@/hooks/useLocaleParams';
import Image from "next/image";

const LocalizationSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const params = useLocaleParams() as { locale?: string } | null;
  const currentLocale = params?.locale ?? 'en';

  const languages = [
    { code: 'en', name: 'English', flagUrl: 'https://flagcdn.com/w80/gb.png' },
    { code: 'ru', name: 'Russian', flagUrl: 'https://flagcdn.com/w80/ru.png' },
    { code: 'ja', name: 'Japanese', flagUrl: 'https://flagcdn.com/w80/jp.png' }
  ];

  const handleLanguageSelect = (lang: typeof languages[0]) => {
    setIsOpen(false);

    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);

    const locales = ['en', 'ru', 'ja'];
    if (locales.includes(pathSegments[0])) {
      pathSegments[0] = lang.code;
    } else {
      pathSegments.unshift(lang.code);
    }

    const newPath = '/' + pathSegments.join('/');
    router.push(newPath);
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col-reverse items-end gap-3 z-50">
      {isOpen && languages.map((lang, index) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageSelect(lang)}
          className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center ${
            currentLocale === lang.code ? 'ring-2 ring-orange-500 bg-orange-50' : 'bg-white'
          }`}
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'backwards'
          }}
          title={lang.name}
        >
          <Image
            src={lang.flagUrl}
            alt={lang.name} width={20} height={20}
            className="w-8 h-8 object-cover rounded-full"
          />
        </button>
      ))}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 shadow-xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
      </button>
    </div>
  );
};

export default LocalizationSelector;
