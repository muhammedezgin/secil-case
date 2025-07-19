'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import FilterModal from '@/components/FilterModal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import SaveRequestModal from '@/components/SaveRequestModal';

type FilterOption = {
  value: string;
  valueName: string | null;
};

type FilterGroup = {
  id: string;
  title: string;
  values: FilterOption[];
};

type Product = {
  productCode: string;
  colorCode: string;
  name: string;
  imageUrl: string;
  categoryId?: string | number | null;
  size?: string | number | null;
  [key: string]: string | number | null | undefined;
};

type ApiFilter = {
  id: string;
  title: string;
  values: FilterOption[];
};

type ApiProduct = Record<string, string | number | null | undefined> & {
  productCode: string;
  colorCode: string;
  name: string;
  imageUrl: string;
};

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savePayload, setSavePayload] = useState<unknown>(null);
  const [filters, setFilters] = useState<FilterGroup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[][]>(Array.from({ length: 6 }, () => []));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
const [selectedFilters, setSelectedFilters] = useState<Record<string, Set<string>>>(Object.create(null));
  const [currentPage, setCurrentPage] = useState(0);
  const [activeDeleteIndex, setActiveDeleteIndex] = useState<number | null>(null);

  const PAGES_COUNT = 6;
  const PRODUCTS_PER_PAGE = 6;
useEffect(() => {
  if (!session?.accessToken || !id) return;

  const fetchData = async () => {
    try {
      setLoading(true);

      const [filtersRes, productsRes] = await Promise.all([
        fetch(`https://maestro-api-dev.secil.biz/Collection/${id}/GetFiltersForConstants`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }),
        fetch(`https://maestro-api-dev.secil.biz/Collection/${id}/GetProductsForConstants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({}),
        }),
      ]);

      if (!filtersRes.ok) throw new Error('Filtre sabitleri yüklenemedi');
      if (!productsRes.ok) throw new Error('Ürünler yüklenemedi');

      const filtersJson = await filtersRes.json();
      const productsJson = await productsRes.json();

      const filtersData = filtersJson.data as FilterGroup[] || [];
      const productsData = productsJson.data?.data as Product[] || [];

      setFilters(filtersData);
      setProducts(productsData);
      setSelectedFilters({});
      setSelectedProducts(Array.from({ length: PAGES_COUNT }, () => []));
    } catch (err) {
      setError((err as Error).message || 'Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
  // Sadece id ve session.accessToken değiştiğinde tetiklenir
}, [id, session?.accessToken]);

  const toggleFilter = (groupId: string, value: string) => {
    setSelectedFilters((prev) => {
      const groupSet = new Set(prev[groupId] ?? []);
      groupSet.has(value) ? groupSet.delete(value) : groupSet.add(value);
      return { ...prev, [groupId]: groupSet };
    });
  };

  const filteredProducts = products.filter((product) => {
  return Object.entries(selectedFilters).every(([groupId, valuesSet]) => {
    if (valuesSet.size === 0) return true;
    const productValue =
      product[groupId] !== undefined && product[groupId] !== null
        ? product[groupId]
        : {
            color: product.colorCode,
            category: product.categoryId,
            size: product.size,
          }[groupId];
    return valuesSet.has(String(productValue));
  });
});

  const allSelected = selectedProducts.flat();
  const currentPageProducts = selectedProducts[currentPage];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(currentPageProducts);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    const newSelected = [...selectedProducts];
    newSelected[currentPage] = items;
    setSelectedProducts(newSelected);
  };

  const handleProductClick = (product: Product) => {
    const isAlreadyAdded = allSelected.some(
      (p) => p.productCode === product.productCode && p.colorCode === product.colorCode
    );
    if (isAlreadyAdded) return;

    const pageItems = selectedProducts[currentPage];
    const newSelected = [...selectedProducts];
    newSelected[currentPage] = [...pageItems, product];
    setSelectedProducts(newSelected);
  };

  const handleDeleteProduct = (index: number) => {
    const updated = [...selectedProducts];
    updated[currentPage] = updated[currentPage].filter((_, i) => i !== index);
    setSelectedProducts(updated);
    setActiveDeleteIndex(null);
  };

  const handleSave = () => {
    const payload = {
      filters: Object.entries(selectedFilters).flatMap(([groupId, valuesSet]) =>
        Array.from(valuesSet).map((val) => ({
          id: groupId,
          value: val,
          valueName:
            filters.find((f) => f.id === groupId)?.values.find((v) => v.value === val)
              ?.valueName || '',
        }))
      ),
      products: allSelected.map((p, index) => ({
        productCode: p.productCode,
        colorCode: p.colorCode,
        order: index + 1,
      })),
    };

    setSavePayload(payload);
    setShowSaveModal(true);
  };

  if (loading) return <p className="p-6">Yükleniyor...</p>;
  if (error) return <p className="p-6 text-red-600">Hata: {error}</p>;

 // ...existing code...
return (
  <div className="min-h-screen bg-[#F8F8F8] flex flex-col">
    {/* Üst Bar */}
    <div className="flex flex-col gap-2 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between py-4">
        <div>
          <div className="font-semibold text-lg">Sabitleri Düzenle</div>
          <div className="text-sm text-gray-500">Koleksiyon - {id} / {products.length} Ürün</div>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-4 h-4 rounded-full bg-gray-300" />
          <span className="w-4 h-4 rounded-full bg-gray-300" />
          <span className="w-4 h-4 rounded-full bg-gray-300" />
        </div>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Ürün ara..."
          className="flex-1 border rounded px-4 py-2 bg-[#F8F8F8]"
        />
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-100"
        >
          <span>Filtreler</span> <span>🔍</span>
        </button>
        <div className="flex gap-2">
          <button className="border rounded px-2 py-1">▦</button>
          <button className="border rounded px-2 py-1">☰</button>
        </div>
      </div>
    </div>

    {isFilterOpen && (
      <FilterModal
        filters={filters}
        selected={selectedFilters}
        onToggle={toggleFilter}
        onClose={() => setIsFilterOpen(false)}
        onClear={() => setSelectedFilters({})}
      />
    )}

    {/* İçerik alanı: ekranı tam kaplar, kendi içinde scroll */}
    <div className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6"
         style={{ minHeight: 0 }}>
      {/* Koleksiyon Ürünleri */}
      <section className="bg-white rounded-lg shadow p-4 flex flex-col h-[calc(100vh-220px)]">
        <div className="font-semibold mb-2 text-sm">Koleksiyon Ürünleri</div>
        <div className="overflow-y-auto flex-1">
          <ul className="grid grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const isAdded = allSelected.some(
                (p) => p.productCode === product.productCode && p.colorCode === product.colorCode
              );
              return (
                <li
                  key={`${product.productCode}-${product.colorCode}`}
                  onClick={() => handleProductClick(product)}
                  className={`relative border-2 rounded-lg p-2 bg-white shadow cursor-pointer hover:border-black flex flex-col items-center transition ${
                    isAdded ? 'pointer-events-none opacity-70' : ''
                  }`}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className={`w-full h-36 object-cover rounded mb-2 ${
                      isAdded ? 'filter blur-sm brightness-75' : ''
                    }`}
                    loading="lazy"
                  />
                  {isAdded && (
                    <div className="absolute top-1/2 left-0 w-full transform -translate-y-1/2 bg-black bg-opacity-70 text-white font-semibold text-center py-1 text-sm">
                      Eklendi
                    </div>
                  )}
                  <div className="text-center">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.productCode}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Sabit Ürünler */}
      <section className="bg-white rounded-lg shadow p-4 flex flex-col h-[calc(100vh-220px)]">
        <div className="font-semibold mb-2 text-sm">Sabitler</div>
        <div className="flex-1 overflow-y-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="selected-products" direction="horizontal">
              {(provided) => {
                const productsInPage = selectedProducts[currentPage];
                const emptySlotsCount = Math.max(0, PRODUCTS_PER_PAGE - productsInPage.length);

                return (
                  <ul
                    className="grid grid-cols-3 gap-4"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {productsInPage.map((product, index) => (
                      <Draggable
                        key={`${product.productCode}-${product.colorCode}-${index}`}
                        draggableId={`${product.productCode}-${product.colorCode}-${index}`}
                        index={index}
                      >
                        {(draggableProvided) => (
                          <li
                            className="border-2 rounded-lg bg-white shadow relative min-h-[160px] flex flex-col justify-center items-center text-center transition-transform"
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            {...draggableProvided.dragHandleProps}
                            onClick={() =>
                              setActiveDeleteIndex(activeDeleteIndex === index ? null : index)
                            }
                          >
                            <div className="relative w-full px-2 pt-2">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-36 object-cover rounded mb-2 pointer-events-none"
                                loading="lazy"
                              />
                              {activeDeleteIndex === index && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProduct(index);
                                  }}
                                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-red-100 transition"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.productCode}</div>
                          </li>
                        )}
                      </Draggable>
                    ))}

                    {/* Boş Alanlar */}
                    {Array.from({ length: emptySlotsCount }).map((_, i) => (
                      <li
                        key={`empty-${i}`}
                        className="border-2 rounded-lg bg-white shadow relative min-h-[160px] flex flex-col justify-center items-center text-center text-gray-400"
                      >
                        <div className="w-full h-36 flex items-center justify-center text-5xl">
                          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                            <path stroke="currentColor" strokeWidth="2" d="M21 21l-6-6-3 3-4-4-3 3" />
                          </svg>
                        </div>
                      </li>
                    ))}

                    {provided.placeholder}
                  </ul>
                );
              }}
            </Droppable>
          </DragDropContext>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {selectedProducts.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentPage(i);
                setActiveDeleteIndex(null);
              }}
              className={`w-8 h-8 rounded border text-sm font-semibold flex items-center justify-center ${
                i === currentPage
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </section>
    </div>

    {/* Alt Butonlar - Sabit */}
    <div className="sticky bottom-0 left-0 w-full bg-[#F8F8F8] z-10 border-t mt-4">
      <div className="flex justify-end gap-4 max-w-7xl mx-auto w-full py-4">
        <button
          onClick={() => router.push('/collections')}
          className="bg-white border px-8 py-2 rounded-lg font-semibold"
        >
          Vazgeç
        </button>
        <button
          onClick={handleSave}
          className="bg-black text-white px-8 py-2 rounded-lg font-semibold"
        >
          Kaydet
        </button>
      </div>
    </div>
    {showSaveModal && (
      <SaveRequestModal payload={savePayload} onClose={() => setShowSaveModal(false)} />
    )}
  </div>
);
// ...existing code...
}
