'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { quizApi, userProgressApi, Quiz, QuizResult } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = parseInt(params.topicId as string);
  const { token } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        setQuiz(null);

        const response = await quizApi.getByTopicId(topicId, signal);
        setQuiz(response.data);
        setAnswers(new Array(response.data.questions.length).fill(-1));
      } catch (err: any) {
        if (err.name === 'CanceledError') {
          console.log('Quiz fetch canceled');
          return;
        }
        setError('Nepodařilo se načíst kvíz.');
        console.error(err);
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchQuiz();

    return () => {
      controller.abort();
    };
  }, [topicId]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: number[]) => {
    try {
      const response = await quizApi.submit(topicId, finalAnswers);
      setResults(response.data);
      
      await userProgressApi.saveQuizResult(
        topicId,
        response.data.score,
        response.data.score.percentage,
        token || undefined
      );
      
      setSubmitted(true);
    } catch (err) {
      console.error('Chyba při odesílání kvízu:', err);
    }
  };

  const getResultColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'from-green-500 to-green-600';
      case 'good':
        return 'from-blue-500 to-blue-600';
      case 'average':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-red-500 to-red-600';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Načítám kvíz..." />;
  }

  if (error || !quiz) {
    return <ErrorMessage message={error || 'Kvíz nenalezen'} />;
  }

  if (submitted && results) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Score Card */}
        <div className={`bg-gradient-to-r ${getResultColor(results.level)} text-white rounded-xl shadow-2xl p-8 mb-8 text-center`}>
          <div className="text-6xl mb-4">
            {results.level === 'excellent' && '🌟'}
            {results.level === 'good' && '👍'}
            {results.level === 'average' && '📚'}
            {results.level === 'needs-improvement' && '💪'}
          </div>
          <h2 className="text-3xl font-bold mb-2">{results.feedback}</h2>
          <div className="text-5xl font-bold my-4">
            {results.score.percentage}%
          </div>
          <p className="text-lg opacity-90">
            {results.score.correct} z {results.score.total} správně
          </p>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6">Přehled odpovědí</h3>
          <div className="space-y-6">
            {results.results.map((result: QuizResult, index: number) => (
              <div
                key={index}
                className={`p-6 rounded-lg border-2 ${
                  result.isCorrect
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">
                    {result.isCorrect ? '✅' : '❌'}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 mb-2">
                      {index + 1}. {result.question}
                    </p>
                    {!result.isCorrect && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Správná odpověď:</span>{' '}
                        {quiz.questions[index].options[result.correctAnswer]}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 italic">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/topics')}
            className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            ← Další témata
          </button>
          <button
            onClick={() => router.push('/progress')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Zobrazit pokrok →
          </button>
        </div>
      </div>
    );
  }

  // Quiz view
  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{quiz.topic.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
            <p className="text-gray-600">
              Otázka {currentQuestion + 1} z {quiz.questions.length}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === index
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedAnswer === index && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-gray-800">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        {currentQuestion > 0 && (
          <button
            onClick={() => {
              setCurrentQuestion(currentQuestion - 1);
              setSelectedAnswer(answers[currentQuestion - 1]);
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            ← Předchozí
          </button>
        )}
        <button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestion === quiz.questions.length - 1 ? 'Dokončit kvíz' : 'Další otázka →'}
        </button>
      </div>
    </div>
  );
}
