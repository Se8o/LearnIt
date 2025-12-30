'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { userProgressApi, topicsApi, UserProgress, Topic } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { BADGE_INFO, BadgeType } from '@/lib/constants';

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    
    if (!token) {
      setError('Musíte být přihlášeni.');
      setLoading(false);
      return;
    }
    
    const fetchData = async (signal: AbortSignal) => {
      try {
        const [progressResponse, topicsResponse] = await Promise.all([
          userProgressApi.get(token, signal),
          topicsApi.getAll(signal),
        ]);
        setProgress(progressResponse.data);
        setTopics(topicsResponse.data);
        setError(null);
      } catch (err: any) {
        if (err.name === 'CanceledError') {
          console.log('Progress fetch canceled');
          return;
        }
        setError('Nepodařilo se načíst pokrok.');
        console.error(err);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    const controller = new AbortController();
    fetchData(controller.signal);

    return () => {
      controller.abort();
    };
  }, [token, authLoading]);

  const handleReset = async () => {
    if (!confirm('Opravdu chcete resetovat veškerý pokrok?')) return;
    if (!token) return;
    
    try {
      const response = await userProgressApi.reset(token);
      setProgress(response.data);
    } catch (err) {
      console.error('Chyba při resetování:', err);
    }
  };

  const getLevelProgress = () => {
    if (!progress) return 0;
    const pointsInCurrentLevel = progress.totalPoints % 100;
    return pointsInCurrentLevel;
  };

  const getBadgeInfo = (badge: string) => {
    return BADGE_INFO[badge as BadgeType] || null;
  };

  if (loading) {
    return <LoadingSpinner message="Načítám pokrok..." />;
  }

  if (error || !progress) {
    return <ErrorMessage message={error || 'Pokrok nenalezen'} />;
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <h1 className="text-5xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Váš pokrok
      </h1>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold mb-1">{progress.totalPoints}</div>
          <div className="text-sm opacity-90">Celkové body</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold mb-1">Level {progress.level}</div>
          <div className="text-sm opacity-90">Vaše úroveň</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold mb-1">{progress.completedLessons.length}</div>
          <div className="text-sm opacity-90">Dokončené lekce</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold mb-1">{progress.badges.length}</div>
          <div className="text-sm opacity-90">Odznaky</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold mb-1">🔥 {progress.currentStreak}</div>
          <div className="text-sm opacity-90">Aktuální série</div>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
          <div className="text-3xl font-bold mb-1">🏆 {progress.longestStreak}</div>
          <div className="text-sm opacity-90">Nejdelší série</div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Progres do dalšího levelu</h2>
          <span className="text-gray-600">
            {getLevelProgress()} / 100 bodů
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${getLevelProgress()}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {100 - getLevelProgress()} bodů do Level {progress.level + 1}
        </p>
      </div>

      {/* Badges */}
      {progress.badges.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Vaše odznaky</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {progress.badges.map((badge, index) => {
              const badgeInfo = getBadgeInfo(badge);
              if (!badgeInfo) return null;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-6 text-center"
                >
                  <div className="text-5xl mb-3">{badgeInfo.icon}</div>
                  <h3 className="font-bold text-lg mb-1">{badgeInfo.name}</h3>
                  <p className="text-sm text-gray-600">{badgeInfo.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Lessons */}
      {progress.completedLessons.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Dokončené lekce</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {progress.completedLessons.map((lesson, index) => {
              const topic = topics.find((t) => t.id === lesson.topicId);
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{topic?.title || 'Lekce'}</h3>
                    <p className="text-sm text-gray-600">
                      Dokončeno: {new Date(lesson.completedAt).toLocaleDateString('cs-CZ')}
                    </p>
                  </div>
                  <div className="text-green-600 text-2xl">✓</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quiz Results */}
      {progress.quizResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Výsledky kvízů</h2>
          <div className="space-y-4">
            {progress.quizResults.map((result: any, index: number) => {
              const topic = topics.find((t) => t.id === result.topicId);
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{topic?.title || 'Kvíz'}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(result.completedAt).toLocaleDateString('cs-CZ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{result.percentage}%</div>
                    <div className="text-sm text-gray-600">
                      {result.score.correct}/{result.score.total}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {progress.completedLessons.length === 0 && progress.quizResults.length === 0 && (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <h3 className="text-2xl font-bold mb-2">Začněte své učení!</h3>
          <p className="text-gray-600 mb-6">
            Ještě jste nedokončili žádnou lekci. Pojďte začít!
          </p>
          <Link
            href="/topics"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Prohlédnout témata →
          </Link>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 mt-8">
        <Link
          href="/topics"
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Pokračovat v učení →
        </Link>
        <button
          onClick={handleReset}
          className="px-6 py-4 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-all"
        >
          Resetovat pokrok
        </button>
      </div>
    </div>
  );
}
