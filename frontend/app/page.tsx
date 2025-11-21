import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Vítejte v LearnIt!
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Interaktivní vzdělávací platforma, která propojuje mikro-učení, videa a zábavné kvízy. 
          Naučte se víc za kratší dobu!
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/topics"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
          >
            Začít učení →
          </Link>
          <Link
            href="/progress"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all"
          >
            Můj pokrok
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-bold mb-3 text-gray-900">Mikro-lekce</h3>
          <p className="text-gray-600">
            Krátké lekce do 5 minut. Ideální pro rychlé učení kdykoliv a kdekoliv.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-bold mb-3 text-gray-900">Video obsah</h3>
          <p className="text-gray-600">
            Každá lekce obsahuje video, které téma vizuálně přiblíží a usnadní pochopení.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-bold mb-3 text-gray-900">Interaktivní kvízy</h3>
          <p className="text-gray-600">
            Ověřte své znalosti s kvízy a získejte okamžitou zpětnou vazbu.
          </p>
        </div>
      </div>

      {/* Gamification */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-12 rounded-xl shadow-xl mb-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Gamifikace učení</h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl mb-2">🌟</div>
            <h4 className="font-semibold mb-2">Body</h4>
            <p className="text-sm opacity-90">Získávejte body za dokončené lekce a kvízy</p>
          </div>
          <div>
            <div className="text-4xl mb-2">📊</div>
            <h4 className="font-semibold mb-2">Úrovně</h4>
            <p className="text-sm opacity-90">Postupujte na vyšší úrovně</p>
          </div>
          <div>
            <div className="text-4xl mb-2">🏆</div>
            <h4 className="font-semibold mb-2">Odznaky</h4>
            <p className="text-sm opacity-90">Sbírejte odznaky za úspěchy</p>
          </div>
          <div>
            <div className="text-4xl mb-2">📈</div>
            <h4 className="font-semibold mb-2">Pokrok</h4>
            <p className="text-sm opacity-90">Sledujte svůj progres</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Jak to funguje?</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
              1
            </div>
            <h4 className="font-semibold mb-2 text-gray-900">Vyberte téma</h4>
            <p className="text-sm text-gray-600">Fyzika, biologie, psychologie a další</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">
              2
            </div>
            <h4 className="font-semibold mb-2 text-gray-900">Přečtěte lekci</h4>
            <p className="text-sm text-gray-600">Stručné vysvětlení + video</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">
              3
            </div>
            <h4 className="font-semibold mb-2 text-gray-900">Absolvujte kvíz</h4>
            <p className="text-sm text-gray-600">4 otázky na ověření znalostí</p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-yellow-600">
              4
            </div>
            <h4 className="font-semibold mb-2 text-gray-900">Získejte body</h4>
            <p className="text-sm text-gray-600">Postupujte na vyšší úrovně</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-white p-12 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Připraveni začít?</h2>
        <p className="text-gray-600 mb-6">Máme připravená 3 témata pro vás!</p>
        <Link
          href="/topics"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Prohlédnout témata →
        </Link>
      </div>
    </div>
  );
}

