'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function LanguageSwitcher() {
  const params = useParams?.() ?? { locale: 'en' };
  const locale = params?.locale ?? 'en';

  const languages = ['en', 'ru', 'ja'];

  return (
    <div className="flex gap-3">
      {languages.map((lang) => (
        <Link
          key={lang}
          href={`/${lang}`}
          className={`hover:underline ${locale === lang ? 'text-orange-500 font-bold' : 'text-gray-700'}`}
        >
          {lang.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
