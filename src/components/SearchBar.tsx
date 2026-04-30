import { useShop } from '@/state/useShop';
import { Input } from '@/components/ui/input';

interface Props {
  value: string;
  onChange: (next: string) => void;
}

export function SearchBar({ value, onChange }: Props) {
  const { t } = useShop();
  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute start-3 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
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
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('topbar.search.placeholder')}
        aria-label={t('topbar.search.placeholder')}
        className="ps-10"
      />
    </div>
  );
}
