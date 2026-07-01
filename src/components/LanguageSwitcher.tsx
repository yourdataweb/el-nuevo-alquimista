import { useTranslation } from 'react-i18next';

const BASE = import.meta.env.BASE_URL;

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: `${BASE}flags/en.svg`, title: 'English' },
    { code: 'es', label: `${BASE}flags/es.svg`, title: 'Español' },
    { code: 'ca', label: `${BASE}flags/ca.svg`, title: 'Català' },
  ];

  return (
    <div className="flex gap-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          title={lang.title}
          className={`w-8 h-7 flex items-center justify-center rounded transition-colors overflow-hidden ${
            i18n.language === lang.code
              ? 'ring-2 ring-[#e94560]'
              : 'bg-gray-700 hover:bg-gray-700'
          }`}
        >
          <img
            src={lang.label}
            alt={lang.title}
            className="w-6 h-5 object-cover"
          />
        </button>
      ))}
    </div>
  );
}