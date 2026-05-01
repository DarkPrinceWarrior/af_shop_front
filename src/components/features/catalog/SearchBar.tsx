import { Search } from 'lucide-react';
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
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('topbar.search.placeholder')}
        aria-label={t('topbar.search.placeholder')}
        className="ps-12"
      />
    </div>
  );
}
