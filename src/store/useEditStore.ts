import { create } from 'zustand';

type Product = {
  productCode: string;
  colorCode: string;
  name: string;
  imageUrl: string;
  categoryId?: string | number | null;
  size?: string | number | null;
  [key: string]: string | number | null | undefined;
};

type FilterGroup = {
  id: string;
  title: string;
  values: { value: string; valueName: string | null }[];
};

type EditStore = {
  selectedProducts: Product[][];
  setSelectedProducts: (products: Product[][]) => void;
  selectedFilters: Record<string, Set<string>>;
  setSelectedFilters: (filters: Record<string, Set<string>>) => void;
};

export const useEditStore = create<EditStore>((set) => ({
  selectedProducts: Array.from({ length: 6 }, () => []),
  setSelectedProducts: (products) => set({ selectedProducts: products }),
  selectedFilters: {},
  setSelectedFilters: (filters) => set({ selectedFilters: filters }),
}));