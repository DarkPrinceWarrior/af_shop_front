import { useShop } from '@/state/useShop';

interface Props {
  value: string;
  onChange: (next: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  const { t } = useShop();
  return (
    <div className="search-wrap">
      <svg
        className="search-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('topbar.search.placeholder')}
        aria-label={t('topbar.search.placeholder')}
      />
    </div>
  );
}
