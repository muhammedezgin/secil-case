'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';

type Collection = {
  id: number;
  name: string;
  description: string;
  conditions: string[];
  salesChannel: string;
};

type CollectionRaw = {
  id: number;
  info?: {
    name?: string;
    description?: string;
  };
  filters?: {
    filters?: { title: string; valueName: string }[];
  };
  salesChannelId?: number;
};

export default function CollectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCollections = async (page: number) => {
    try {
      const res = await fetch(`https://maestro-api-dev.secil.biz/Collection/GetAll?page=${page}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!res.ok) throw new Error('API isteği başarısız');

      const json = await res.json();

      const mapped = json.data.map((c: CollectionRaw): Collection => ({
        id: c.id,
        name: c.info?.name ?? '—',
        description: c.info?.description?.replace(/<[^>]+>/g, '') ?? '',
        conditions: c.filters?.filters?.map((f) => `${f.title}: ${f.valueName}`) ?? [],
        salesChannel: `Satış Kanalı ${c.salesChannelId ?? '—'}`,
      }));

      setCollections(mapped);
      setTotalPages(json.meta.totalPages);
    } catch {
      console.error('Koleksiyonlar yüklenemedi.');
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchCollections(page);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, page]);

  if (status === 'loading') return <p>Yükleniyor...</p>;
  if (!session) return <p>Lütfen giriş yapın.</p>;

  return (
    <div className="p-8">
      {/* Sayfa Başlığı */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Koleksiyon</h1>
        <p className="text-gray-600 text-sm">koleksiyon listesi</p>
      </div>

      {/* Tablo */}
      <table className="w-full border-separate border-spacing-y-4">
        <thead>
          <tr className="text-left text-sm font-semibold text-gray-700 border-b">
            <th className="pb-2">Başlık</th>
            <th className="pb-2">Ürün Koşulları</th>
            <th className="pb-2">Satış Kanalı</th>
            <th className="pb-2">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {collections.map((col) => (
            <tr key={col.id} className="bg-white rounded shadow border text-sm">
              <td className="p-4 align-top font-medium">{col.name}</td>
              <td className="p-4 align-top whitespace-pre-line">
                {col.conditions.length > 0 ? col.conditions.join('\n') : '—'}
              </td>
              <td className="p-4 align-top">{col.salesChannel}</td>
              <td className="p-4 align-top">
                <button
                  onClick={() => router.push(`/edit/${col.id}`)}
                  className="group relative flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100 transition"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="absolute z-10 opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white text-xs rounded px-2 py-1 -top-10 whitespace-nowrap shadow">
                    Sabitleri Düzenle
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Sayfalama */}
      <div className="flex justify-center mt-6 gap-2 text-sm">
        <button
          className="px-2 py-1 text-gray-500"
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          ‹
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
          <button
            key={pg}
            onClick={() => setPage(pg)}
            className={`px-3 py-1 rounded ${
              pg === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {pg}
          </button>
        ))}
        <button
          className="px-2 py-1 text-gray-500"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
        >
          ›
        </button>
      </div>
    </div>
  );
}
