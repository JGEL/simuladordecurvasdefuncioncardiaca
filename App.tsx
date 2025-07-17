
import React from 'react';
import CardiacFunctionSimulator from './components/CardiacFunctionSimulator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center justify-center p-4 selection:bg-sky-500 selection:text-white">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-600">
          Simulador de Curvas de Función Cardíaca
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Explora la Ley de Frank-Starling de forma interactiva.
        </p>
      </header>
      <main className="w-full max-w-4xl">
        <CardiacFunctionSimulator />
      </main>
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Simulación Fisiológica Interactiva. Inspirado en la fisiología cardíaca.</p>
      </footer>
    </div>
  );
};

export default App;