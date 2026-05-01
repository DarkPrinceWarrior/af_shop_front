import { useShop } from '@/state/useShop';
import type { CatalogCategory } from '@/api/types';
import { cn } from '@/lib/utils';

interface Props {
  categories: CatalogCategory[];
  activeCategoryId: string | null;
  onChange: (id: string | null) => void;
}

export function CategoryFilter({ categories, activeCategoryId, onChange }: Props) {
  const { t } = useShop();

  return (
    <aside
      className="rounded-xl border border-border bg-card p-4 md:sticky md:top-[5rem]"
      aria-label={t('filters.allCategories')}
    >
      <h2 className="mb-3 px-1 font-display text-[15px] font-medium uppercase tracking-wider text-muted-foreground">
        {t('filters.allCategories')}
      </h2>
      <ul className="m-0 flex list-none gap-2 overflow-x-auto p-0 md:flex-col md:gap-0.5 md:overflow-visible">
        <li>
          <CategoryButton
            active={activeCategoryId === null}
            onClick={() => onChange(null)}
          >
            {t('filters.allCategories')}
          </CategoryButton>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <CategoryButton
              active={activeCategoryId === cat.id}
              onClick={() => onChange(cat.id)}
            >
              {cat.name}
            </CategoryButton>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function CategoryButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'block w-full whitespace-nowrap rounded-full px-3.5 py-1.5 text-start text-sm font-medium transition-colors',
        'md:rounded-lg md:px-3 md:py-2',
        active
          ? 'bg-primary text-primary-foreground md:bg-[var(--primary-soft)] md:text-primary'
          : 'bg-[var(--button-neutral-bg)] hover:bg-[var(--neutral-200)] md:bg-transparent',
      )}
    >
      {children}
    </button>
  );
}
