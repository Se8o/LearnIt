'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { topicsApi, Topic } from '@/lib/api';

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await topicsApi.getAll();
        setTopics(response.data);
      } catch (err) {
        setError('Nepodařilo se načíst témata. Zkontrolujte, zda backend běží.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

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

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {topics.map((topic) => (
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

      {topics.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-12">
          <p>Zatím nejsou k dispozici žádná témata.</p>
        </div>
      )}
    </div>
  );
}
