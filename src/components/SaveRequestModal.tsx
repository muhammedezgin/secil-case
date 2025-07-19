'use client';

type SaveRequestModalProps = {
  payload: unknown;
  onClose: () => void;
};

export default function SaveRequestModal({ payload, onClose }: SaveRequestModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded p-6 max-w-2xl w-full shadow-lg overflow-y-auto max-h-[90vh] relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-lg font-bold mb-4 text-gray-900">Gönderilecek Request Verisi</h2>
        <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap break-all">
          {JSON.stringify(payload, null, 2)}
        </pre>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
