import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useShop } from '@/state/useShop';
import { Button } from '@/components/ui/button';
import { CategoryFilter } from '@/components/features/catalog/CategoryFilter';
import { SearchBar } from '@/components/features/catalog/SearchBar';
import { ProductGrid } from '@/components/features/catalog/ProductGrid';

export default function CatalogPage() {
  const { bootstrap, loading, error, reload, t } = useShop();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!bootstrap) return;
    if (
      activeCategory &&
      !bootstrap.categories.some((cat) => cat.id === activeCategory)
    ) {
      setActiveCategory(null);
    }
  }, [bootstrap, activeCategory]);

  const filteredProducts = useMemo(() => {
    if (!bootstrap) return [];
    const term = search.trim().toLowerCase();
    return bootstrap.products.filter((product) => {
      if (!product.is_active) return false;
      if (activeCategory && product.category_id !== activeCategory) return false;
      if (!term) return true;
      const haystack = [product.name, product.description, product.sku]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [bootstrap, activeCategory, search]);

  return (
    <>
      <CategoryFilter
        categories={bootstrap?.categories ?? []}
        activeCategoryId={activeCategory}
        onChange={setActiveCategory}
      />
      <div className="flex min-w-0 flex-col gap-4">
        <SearchBar value={search} onChange={setSearch} />
        {loading && (
          <div className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground">
            <Loader2
              aria-hidden="true"
              className="size-5 animate-spin text-primary"
            />
            <span>{t('common.loading')}</span>
          </div>
        )}
        {error && !loading && (
          <div
            className="flex items-start gap-2 rounded-xl bg-destructive-soft px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            <div className="flex-1">{error}</div>
            <Button type="button" variant="outline" size="sm" onClick={reload}>
              {t('common.retry')}
            </Button>
          </div>
        )}
        {!loading && !error && bootstrap && (
          <ProductGrid products={filteredProducts} />
        )}
      </div>
    </>
  );
}
