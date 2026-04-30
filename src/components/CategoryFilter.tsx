import { useShop } from '@/state/useShop';
import type { CatalogCategory } from '@/api/types';

interface Props {
  categories: CatalogCategory[];
  activeCategoryId: string | null;
  onChange: (id: string | null) => void;
}

export function CategoryFilter({ categories, activeCategoryId, onChange }: Props) {
  const { t } = useShop();
  return (
    <aside className="sidebar" aria-label={t('filters.allCategories')}>
      <h2 className="sidebar-title">{t('filters.allCategories')}</h2>
      <ul className="category-list">
        <li>
          <button
            type="button"
            className={`category-button ${activeCategoryId === null ? 'active' : ''}`}
            onClick={() => onChange(null)}
          >
            {t('filters.allCategories')}
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              type="button"
              className={`category-button ${activeCategoryId === cat.id ? 'active' : ''}`}
              onClick={() => onChange(cat.id)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
