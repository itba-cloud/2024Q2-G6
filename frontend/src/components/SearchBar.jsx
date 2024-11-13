import { useState } from 'react';

export default function SearchBar() {
  const [query, setQuery] = useState('');

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Buscando:', query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search..."
        className="w-full bg-slate-100 h-8 p-2 pr-10 text-black rounded-lg focus:outline-none focus:ring-1  focus:ring-blue-500"
      />
      <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <img src="/magnifier.svg" alt="Buscar" className="w-5 h-5" />
      </button>
    </form>
  );
}
