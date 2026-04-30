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
      className="rounded-lg border border-border bg-card p-3 shadow-sm md:sticky md:top-[5rem]"
      aria-label={t('filters.allCategories')}
    >
      <h2 className="mb-2 px-1 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
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
        'block w-full whitespace-nowrap rounded-full border px-3 py-1.5 text-start text-sm transition-colors',
        'md:rounded-md md:border-transparent md:px-2.5 md:py-2',
        active
          ? 'border-primary bg-primary text-primary-foreground md:border-transparent md:bg-primary/10 md:text-primary md:font-semibold'
          : 'border-border bg-card hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}
