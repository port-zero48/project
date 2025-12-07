import { Link } from 'react-router-dom'
import { TrendingUp, Calendar, ArrowRight } from 'lucide-react'

export default function Press() {
  const articles = [
    {
      date: 'December 2024',
      title: 'TradePro Reaches 150,000 Active Traders Milestone',
      publication: 'Financial Times',
      excerpt: 'The trading platform announces significant growth and expansion plans across new markets.'
    },
    {
      date: 'November 2024',
      title: 'How TradePro is Democratizing Professional Trading',
      publication: 'Tech Crunch',
      excerpt: 'An in-depth look at how TradePro is making institutional-grade tools accessible to retail traders.'
    },
    {
      date: 'October 2024',
      title: 'TradePro Secures $50M Series B Funding',
      publication: 'Bloomberg',
      excerpt: 'Leading investors back the fintech platform as it scales globally with new features.'
    },
    {
      date: 'September 2024',
      title: 'The Future of Retail Trading: Interview with TradePro CEO',
      publication: 'MarketWatch',
      excerpt: 'CEO shares insights on the evolution of trading platforms and market trends.'
    },
    {
      date: 'August 2024',
      title: 'TradePro Launches Advanced AI-Powered Analytics',
      publication: 'Forbes',
      excerpt: 'New machine learning features help traders make better-informed decisions in real-time.'
    },
    {
      date: 'July 2024',
      title: 'TradePro Expands to 50 Countries, Sets New Standard',
      publication: 'Reuters',
      excerpt: 'Global expansion marks a new era for the rapidly growing trading platform.'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            TradePro
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            to="/auth"
            className="text-slate-300 hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            to="/auth"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Press &
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
              News
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Stay updated on the latest TradePro news, press releases, and media coverage from leading publications worldwide.
          </p>
        </div>

        {/* Press Kit */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">Press Kit</h2>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Need our logo, company information, or high-resolution images? Download our complete press kit below.
          </p>
          <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold transition-all inline-flex items-center space-x-2">
            <span>Download Press Kit</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Latest News */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white mb-12">Latest Coverage</h2>
          <div className="space-y-6">
            {articles.map((article, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{article.date}</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-blue-400 font-semibold mb-3">{article.publication}</p>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed">{article.excerpt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Media Contact */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-white mb-8">Media Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-blue-400 mb-4">Press Inquiries</h3>
              <p className="text-slate-300 mb-4">
                For press releases, media inquiries, and interview requests:
              </p>
              <a href="mailto:press@tradepro.com" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                press@tradepro.com
              </a>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-cyan-400 mb-4">General Inquiries</h3>
              <p className="text-slate-300 mb-4">
                For general questions about TradePro:
              </p>
              <a href="mailto:info@tradepro.com" className="text-blue-400 hover:text-blue-300 font-semibold">
                info@tradepro.com
              </a>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-6">Stay Updated</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter to get the latest news and announcements directly in your inbox.
          </p>
          <div className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-slate-700 border border-slate-600 text-white px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-semibold transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm mt-20">
        <div className="container py-12 text-center text-slate-400">
          <p>&copy; 2024 TradePro. All rights reserved. Trading involves risk and may not be suitable for all investors.</p>
        </div>
      </footer>
    </div>
  )
}
