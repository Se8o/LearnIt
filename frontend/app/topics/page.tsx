'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { topicsApi, Topic } from '@/lib/api';

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await topicsApi.getAll();
        setTopics(response.data);
        setFilteredTopics(response.data);
      } catch (err) {
        setError('Nepodařilo se načíst témata. Zkontrolujte, zda backend běží.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let result = [...topics];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (topic) =>
          topic.title.toLowerCase().includes(query) ||
          topic.description.toLowerCase().includes(query) ||
          topic.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((topic) => topic.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      result = result.filter((topic) => topic.difficulty === selectedDifficulty);
    }

    // Sorting
    switch (sortBy) {
      case 'duration-asc':
        result.sort((a, b) => a.duration - b.duration);
        break;
      case 'duration-desc':
        result.sort((a, b) => b.duration - a.duration);
        break;
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title, 'cs'));
        break;
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        result.sort((a, b) => difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty as keyof typeof difficultyOrder]);
        break;
      default:
        // Keep original order
        break;
    }

    setFilteredTopics(result);
  }, [topics, searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  // Get unique categories
  const categories = Array.from(new Set(topics.map((t) => t.category)));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Načítám témata...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-red-800 font-semibold mb-2">Chyba načítání</h2>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-red-500 mt-2">
            Ujistěte se, že backend běží na http://localhost:3001
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Vyberte téma
        </h1>
        <p className="text-xl text-gray-600">
          Začněte s některým z našich připravených témat
        </p>
      </div>

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto mb-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Hledat témata..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white rounded-xl p-4 shadow-md">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Kategorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="all">Všechny</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Obtížnost</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="all">Všechny</option>
                <option value="beginner">Začátečník</option>
                <option value="intermediate">Středně pokročilý</option>
                <option value="advanced">Pokročilý</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Seřadit podle</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="default">Výchozí</option>
                <option value="title">Název (A-Z)</option>
                <option value="duration-asc">Délka (nejkratší)</option>
                <option value="duration-desc">Délka (nejdelší)</option>
                <option value="difficulty">Obtížnost</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600">
            Zobrazeno <span className="font-bold text-blue-600">{filteredTopics.length}</span> z {topics.length} témat
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {filteredTopics.map((topic) => (
          <Link
            key={topic.id}
            href={`/lesson/${topic.id}`}
            className="group"
          >
            <div
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden h-full"
              style={{ borderTop: `4px solid ${topic.color}` }}
            >
              {/* Header */}
              <div
                className="p-6 text-white"
                style={{ background: `linear-gradient(135deg, ${topic.color} 0%, ${topic.color}dd 100%)` }}
              >
                <div className="text-5xl mb-3">{topic.icon}</div>
                <h3 className="text-xl font-bold">{topic.category}</h3>
              </div>

              {/* Content */}
              <div className="p-6">
                <h4 className="font-semibold text-lg mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">
                  {topic.title}
                </h4>
                <p className="text-gray-600 mb-4 text-sm">
                  {topic.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-gray-500">
                    <span>{topic.duration} min</span>
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: `${topic.color}20`, color: topic.color }}
                  >
                    {topic.difficulty === 'beginner' && 'Začátečník'}
                    {topic.difficulty === 'intermediate' && 'Středně pokročilý'}
                    {topic.difficulty === 'advanced' && 'Pokročilý'}
                  </span>
                </div>

                {/* CTA */}
                <div className="mt-6">
                  <div
                    className="w-full py-3 px-4 rounded-lg font-semibold text-center text-white transition-all"
                    style={{ backgroundColor: topic.color }}
                  >
                    Začít lekci →
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredTopics.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-12 bg-gray-50 rounded-xl p-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl font-semibold mb-2">Žádná témata nenalezena</p>
          <p className="text-gray-400">Zkuste změnit vyhledávací kritéria nebo filtry</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
              setSortBy('default');
            }}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Zrušit všechny filtry
          </button>
        </div>
      )}
    </div>
  );
}
