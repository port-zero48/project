import { Link } from 'react-router-dom'
import { TrendingUp, Users, Globe, Award, ArrowRight } from 'lucide-react'

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
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
      <main className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            About
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
              TradePro
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Founded on the principles of transparency, innovation, and user empowerment, 
            TradePro has revolutionized the way traders access the financial markets.
          </p>
        </div>

        {/* Our Story Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">Our Story</h2>
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <p>
              TradePro was founded in 2020 with a mission to democratize access to professional-grade trading tools. 
              What started as a small team of passionate traders and engineers has grown into a global platform serving 
              over 150,000 active traders across 50+ countries.
            </p>
            <p>
              We recognized a gap in the market: professional traders had access to sophisticated tools, but retail 
              traders were left with outdated, expensive, or unnecessarily complex platforms. We decided to change that.
            </p>
            <p>
              Today, TradePro stands as a beacon of innovation in the trading industry, providing institutional-grade 
              tools at accessible prices, backed by exceptional customer support and a passionate community of traders.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-8">
            <h3 className="text-3xl font-bold text-blue-400 mb-4">Our Mission</h3>
            <p className="text-slate-300 leading-relaxed">
              To empower traders and investors worldwide with the tools, data, and insights they need 
              to make confident, informed trading decisions. We believe in transparency, accessibility, 
              and continuous innovation.
            </p>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-8">
            <h3 className="text-3xl font-bold text-cyan-400 mb-4">Our Vision</h3>
            <p className="text-slate-300 leading-relaxed">
              To become the world's most trusted and user-centric trading platform, where traders of 
              all levels can access institutional-quality tools and compete on equal footing with professional investors.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/70 transition-all">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg w-fit mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Excellence</h4>
              <p className="text-slate-400">
                We pursue excellence in everything we do, from product design to customer service.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/70 transition-all">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg w-fit mb-4">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Transparency</h4>
              <p className="text-slate-400">
                We believe in honest communication and transparent practices with our users.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/70 transition-all">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg w-fit mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Community</h4>
              <p className="text-slate-400">
                We foster a supportive community where traders help each other succeed.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/70 transition-all">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-lg w-fit mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">Innovation</h4>
              <p className="text-slate-400">
                We continuously innovate to stay ahead of market trends and user needs.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-6">Join Our Community</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Be part of a growing community of traders who are taking control of their financial future.
          </p>
          <Link
            to="/auth"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-12 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
          >
            <span>Get Started Today</span>
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-12 text-center text-slate-400">
          <p>&copy; 2024 TradePro. All rights reserved. Trading involves risk and may not be suitable for all investors.</p>
        </div>
      </footer>
    </div>
  )
}
