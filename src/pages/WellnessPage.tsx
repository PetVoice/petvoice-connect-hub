import React from 'react';

export default function WellnessPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pagina Salute e Benessere</h1>
      <p className="text-gray-600">Pagina resetata - nessun loop infinito</p>
      <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
        <p className="text-green-800">✅ Loop infinito fermato con successo!</p>
        <p className="text-sm text-green-600 mt-2">La pagina ora è completamente statica e non fa chiamate automatiche.</p>
      </div>
    </div>
  );
}