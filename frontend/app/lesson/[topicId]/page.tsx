'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { lessonsApi, userProgressApi, Lesson } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.topicId as string);
  const { token } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchLesson = async () => {
      try {
        // Reset state for new topic
        setLoading(true);
        setError(null);
        setLesson(null);

        const response = await lessonsApi.getByTopicId(topicId, signal);
        setLesson(response.data);
      } catch (err: unknown) {
        if (axios.isCancel(err) || (err instanceof Error && err.name === 'CanceledError')) {
          console.log('Lesson fetch canceled');
          return;
        }
        setError('Nepodařilo se načíst lekci.');
        console.error(err);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchLesson();

    return () => {
      controller.abort();
    };
  }, [topicId]);

  const handleCompleteLesson = async () => {
    if (!lesson) return;

    // Require authentication before saving progress
    if (!token) {
      setError('Pro uložení pokroku se prosím přihlaste.');
      router.push('/login');
      return;
    }
    setCompleting(true);
    
    try {
      await userProgressApi.completeLesson(lesson.topicId, lesson.id, token);
      router.push(`/quiz/${lesson.topicId}`);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Session vypršela, přihlaste se znovu.');
        router.push('/login');
      } else {
        console.error('Chyba při ukládání pokroku:', err);
        router.push(`/quiz/${lesson.topicId}`);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Načítám lekci..." />;
  }

  if (error || !lesson) {
    return <ErrorMessage message={error || 'Lekce nenalezena'} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{lesson.topic.icon}</span>
          <div>
            <p className="text-sm text-gray-500">{lesson.topic.category}</p>
            <h1 className="text-3xl font-bold text-gray-800">{lesson.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span>{lesson.estimatedTime} min</span>
          </span>
          <span className="flex items-center gap-1">
            <span>Mikro-lekce</span>
          </span>
        </div>
      </div>

      {/* Video */}
      {lesson.videoUrl && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">📹 {lesson.videoTitle}</h2>
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
            <iframe
              src={lesson.videoUrl}
              title={lesson.videoTitle}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold mb-4 text-gray-800">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold mb-3 mt-6 text-gray-800">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mb-2 mt-4 text-gray-700">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-gray-600 leading-relaxed">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-800">{children}</strong>
              ),
            }}
          >
            {lesson.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Key Points */}
      {lesson.keyPoints && lesson.keyPoints.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">🔑 Klíčové body</h3>
          <ul className="space-y-2">
            {lesson.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">✓</span>
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => router.back()}
          className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all"
        >
          ← Zpět na témata
        </button>
        <button
          onClick={handleCompleteLesson}
          disabled={completing}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
        >
          {completing ? 'Ukládám...' : 'Pokračovat na kvíz →'}
        </button>
      </div>
    </div>
  );
}
