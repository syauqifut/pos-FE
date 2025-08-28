import { useEffect } from 'react';

function PrinterSettings() {
  const handleOpenPrinter = () => {
    if (window.PrinterBridge) {
      window.PrinterBridge.postMessage('openPrinterPopup');
    } else {
      alert('Flutter bridge tidak tersedia');
    }
  };

  useEffect(() => {
    // opsional: bisa langsung panggil pop-up begitu masuk halaman
    handleOpenPrinter();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Printer Settings</h1>
      <button
        onClick={handleOpenPrinter}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Kelola Printer (Flutter)
      </button>
    </div>
  );
}

export default PrinterSettings;
