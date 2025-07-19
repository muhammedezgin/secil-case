'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

type FilterOption = {
  value: string;
  valueName: string | null;
};

type FilterGroup = {
  id: string;
  title: string;
  values: FilterOption[];
};

type Props = {
  filters: FilterGroup[];
  selected: Record<string, Set<string>>;
  onToggle: (groupId: string, value: string) => void;
  onClose: () => void;
  onClear: () => void;
};

export default function FilterModal({
  filters,
  selected,
  onToggle,
  onClose,
  onClear,
}: Props) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };
  // tüm filreler 
// const VISIBLE_FILTERS = new Set(filters.map(f => f.title));


  const VISIBLE_FILTERS = new Set([
    'Yıl',
    'Stok',
    'Renk',
    'Ürün Alt Grubu',
    'Aksesuar Türü',
    'Beden',
  ]);

  const selectedChips = Object.entries(selected)
    .flatMap(([groupId, set]) =>
      Array.from(set).map((val) => {
        const label =
          filters
            .find((g) => g.id === groupId)
            ?.values.find((v) => v.value === val)?.valueName || val;
        return { groupId, value: val, label };
      })
    );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl w-full max-w-5xl shadow-md h-[60vh] overflow-hidden flex flex-col">
        {/* Başlık */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Filtrele</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
          >
            ✕
          </button>
        </div>

        {/* İçerik (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters
              .filter((group) => VISIBLE_FILTERS.has(group.title))
              .map((group) => (
                <div key={group.id} className="border rounded overflow-hidden">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex justify-between items-center px-4 py-2 font-semibold bg-gray-100 hover:bg-gray-200 text-gray-900"
                  >
                    <span>{group.title}</span>
                    {openGroups[group.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {openGroups[group.id] && (
                    <div className="p-4 border-t bg-white">
                      <div className="flex flex-wrap gap-2">
                        {group.values.map((opt) => (
                          <label
                            key={`${group.id}-${opt.value}`}
                            className="flex items-center space-x-2 text-sm text-gray-900"
                          >
                            <input
                              type="checkbox"
                              checked={selected[group.id]?.has(opt.value) || false}
                              onChange={() => onToggle(group.id, opt.value)}
                            />
                            <span>{opt.valueName || opt.value}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Uygulanan Kriterler */}
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Uygulanan Kriterler</h3>
            <div className="border rounded bg-gray-50 px-4 py-6 max-h-32 overflow-y-auto">
              {selectedChips.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedChips.map((chip, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-300"
                    >
                      {chip.label}
                      <button
                        onClick={() => onToggle(chip.groupId, chip.value)}
                        className="text-blue-700 hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Lütfen Aramak İçin Filtre Seçin</p>
              )}
            </div>
          </div>
        </div>

        {/* Butonlar */}
        <div className="px-6 py-4 border-t flex justify-between">
          <button
            onClick={onClear}
            className="px-4 py-2 border rounded hover:bg-gray-100 text-gray-900"
          >
            Seçimi Temizle
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ara
          </button>
        </div>
      </div>
    </div>
  );
}
