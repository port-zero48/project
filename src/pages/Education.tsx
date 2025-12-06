import { Link } from 'react-router-dom'
import { TrendingUp, BookOpen, Award, Users, ArrowRight, CheckCircle } from 'lucide-react'

export default function Education() {
  const courses = [
    {
      id: 1,
      title: 'Stock Market Fundamentals',
      description: 'Learn the basics of stock investing, how markets work, and key trading concepts.',
      lessons: 12,
      duration: '6 weeks',
      level: 'Beginner'
    },
    {
      id: 2,
      title: 'Technical Analysis Mastery',
      description: 'Master chart patterns, indicators, and technical analysis strategies for better trading decisions.',
      lessons: 18,
      duration: '8 weeks',
      level: 'Intermediate'
    },
    {
      id: 3,
      title: 'Cryptocurrency Trading Guide',
      description: 'Deep dive into blockchain, crypto fundamentals, and cryptocurrency trading strategies.',
      lessons: 15,
      duration: '7 weeks',
      level: 'Intermediate'
    },
    {
      id: 4,
      title: 'Portfolio Management & Risk',
      description: 'Learn how to build diversified portfolios and manage risk effectively.',
      lessons: 14,
      duration: '7 weeks',
      level: 'Advanced'
    }
  ]

  const stockBenefits = [
    {
      icon: '💰',
      title: 'Wealth Building',
      description: 'Stocks historically provide long-term wealth accumulation through capital appreciation and dividends.'
    },
    {
      icon: '📈',
      title: 'Income Generation',
      description: 'Earn passive income through dividend payments from established companies and growth stocks.'
    },
    {
      icon: '🎯',
      title: 'Ownership',
      description: 'Own a piece of real businesses and benefit from their growth and profitability.'
    },
    {
      icon: '🛡️',
      title: 'Liquidity',
      description: 'Stocks are liquid assets - buy and sell anytime during market hours without major restrictions.'
    },
    {
      icon: '📊',
      title: 'Diversification',
      description: 'Spread investments across sectors and companies to reduce overall portfolio risk.'
    },
    {
      icon: '🔍',
      title: 'Transparency',
      description: 'Public companies provide regular financial reports and SEC filings for informed decision-making.'
    }
  ]

  const cryptoBenefits = [
    {
      icon: '🚀',
      title: 'High Growth Potential',
      description: 'Cryptocurrencies offer exceptional growth opportunities for investors with higher risk tolerance.'
    },
    {
      icon: '⏰',
      title: '24/7 Trading',
      description: 'Crypto markets never close - trade anytime, any day of the week globally.'
    },
    {
      icon: '🔐',
      title: 'Decentralization',
      description: 'Blockchain technology ensures transparency, security, and independence from traditional banking systems.'
    },
    {
      icon: '🌍',
      title: 'Global Access',
      description: 'Trade cryptocurrencies from anywhere in the world with minimal barriers to entry.'
    },
    {
      icon: '💡',
      title: 'Innovation',
      description: 'Invest in groundbreaking blockchain projects and emerging financial technologies.'
    },
    {
      icon: '⚡',
      title: 'Low Transaction Fees',
      description: 'Significantly lower fees compared to traditional financial institutions and intermediaries.'
    }
  ]

  const investmentComparison = [
    {
      aspect: 'Risk Level',
      stocks: 'Moderate to Low',
      crypto: 'High to Very High'
    },
    {
      aspect: 'Time Commitment',
      stocks: 'Low to Moderate',
      crypto: 'Moderate to High'
    },
    {
      aspect: 'Market Hours',
      stocks: '9:30 AM - 4:00 PM EST',
      crypto: '24/7/365'
    },
    {
      aspect: 'Volatility',
      stocks: 'Low to Moderate',
      crypto: 'Extreme'
    },
    {
      aspect: 'Starting Capital',
      stocks: '$100+',
      crypto: '$10+'
    },
    {
      aspect: 'Historical Returns',
      stocks: '10% annually (average)',
      crypto: 'Highly variable'
    }
  ]

  const strategies = [
    {
      title: 'Buy and Hold',
      description: 'Long-term investment strategy where you buy quality stocks and hold them for years to benefit from compound growth.',
      suitable: 'Both Stocks & Crypto'
    },
    {
      title: 'Dollar-Cost Averaging',
      description: 'Invest a fixed amount regularly regardless of price to reduce the impact of volatility and build wealth gradually.',
      suitable: 'Both Stocks & Crypto'
    },
    {
      title: 'Dividend Growth',
      description: 'Focus on stocks that pay and increase dividends over time, creating a passive income stream.',
      suitable: 'Stocks'
    },
    {
      title: 'Swing Trading',
      description: 'Take advantage of short-term price movements over days or weeks while keeping positions short.',
      suitable: 'Both Stocks & Crypto'
    },
    {
      title: 'Value Investing',
      description: 'Find undervalued assets trading below intrinsic value and wait for the market to recognize their true worth.',
      suitable: 'Both Stocks & Crypto'
    },
    {
      title: 'Staking & Yield Farming',
      description: 'Generate passive income by holding cryptocurrencies and earning rewards for network participation.',
      suitable: 'Crypto'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            TradePro
          </span>
        </Link>
      </nav>

      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Investment
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
              Education Hub
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Master the fundamentals of stock trading, cryptocurrency investing, and portfolio management. 
            Learn from expert strategies and make informed investment decisions.
          </p>
        </div>

        {/* Courses Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Featured Learning Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/70 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-semibold text-white flex-1">{course.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ml-4 ${
                    course.level === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                    course.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {course.level}
                  </span>
                </div>
                <p className="text-slate-300 mb-6">{course.description}</p>
                <div className="flex items-center space-x-6 text-slate-400 mb-6">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">⏱️</span>
                    <span>{course.duration}</span>
                  </div>
                </div>
                <Link to="/auth" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 inline-block text-center">
                  Enroll Now
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Investment Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-8">Stock Market Investing Guide</h2>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl mb-12">
            <h3 className="text-2xl font-semibold text-white mb-6">What is Stock Investment?</h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              Stock investing is the practice of purchasing shares of companies to own a portion of their business. When you buy a stock, 
              you become a shareholder and have a claim on the company's earnings and assets. Stocks are traded on stock exchanges like 
              the NYSE and NASDAQ, allowing investors worldwide to buy and sell company shares instantly.
            </p>
            <p className="text-slate-300 leading-relaxed">
              The goal of stock investing is to grow wealth over time through capital appreciation (price increase) and dividend income 
              (company profits shared with shareholders). Successful stock investors combine fundamental analysis (studying company finances), 
              technical analysis (studying price patterns), and risk management to build profitable portfolios.
            </p>
          </div>

          <h3 className="text-2xl font-semibold text-white mb-8">Stock Investment Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {stockBenefits.map((benefit, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/70 transition-all duration-200">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h4 className="text-xl font-semibold text-white mb-3">{benefit.title}</h4>
                <p className="text-slate-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cryptocurrency Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-8">Cryptocurrency Trading Guide</h2>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl mb-12">
            <h3 className="text-2xl font-semibold text-white mb-6">What is Cryptocurrency?</h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              Cryptocurrency is digital money built on blockchain technology - a decentralized network of computers that verify and record 
              all transactions. Bitcoin, Ethereum, and thousands of other cryptocurrencies operate without central banks or governments, 
              using cryptographic security to protect against fraud and double-spending.
            </p>
            <p className="text-slate-300 leading-relaxed mb-6">
              Crypto trading involves buying and selling digital assets to profit from price movements. Unlike stocks tied to company performance, 
              crypto prices are driven by supply/demand, adoption rates, regulatory news, and technological developments. Crypto offers high growth 
              potential but comes with extreme volatility and requires careful risk management.
            </p>
            <p className="text-slate-300 leading-relaxed">
              The cryptocurrency market operates 24/7/365, allowing global trading without traditional market hours or intermediaries. Major 
              cryptocurrencies include Bitcoin (digital gold), Ethereum (smart contracts platform), and altcoins offering various blockchain innovations.
            </p>
          </div>

          <h3 className="text-2xl font-semibold text-white mb-8">Cryptocurrency Trading Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {cryptoBenefits.map((benefit, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800/70 transition-all duration-200">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h4 className="text-xl font-semibold text-white mb-3">{benefit.title}</h4>
                <p className="text-slate-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-8">Stocks vs Cryptocurrency</h2>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="px-8 py-4 text-left text-white font-semibold">Aspect</th>
                    <th className="px-8 py-4 text-left text-blue-400 font-semibold">Stocks</th>
                    <th className="px-8 py-4 text-left text-cyan-400 font-semibold">Cryptocurrency</th>
                  </tr>
                </thead>
                <tbody>
                  {investmentComparison.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="px-8 py-4 text-white font-semibold">{row.aspect}</td>
                      <td className="px-8 py-4 text-slate-300">{row.stocks}</td>
                      <td className="px-8 py-4 text-slate-300">{row.crypto}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Investment Strategies */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-8">Popular Investment Strategies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {strategies.map((strategy, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/70 transition-all duration-200">
                <h3 className="text-xl font-semibold text-white mb-4">{strategy.title}</h3>
                <p className="text-slate-300 mb-6">{strategy.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Suitable for:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    strategy.suitable === 'Both Stocks & Crypto' ? 'bg-purple-500/20 text-purple-400' :
                    strategy.suitable === 'Stocks' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {strategy.suitable}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">Key Investment Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Start Small</h4>
                <p className="text-slate-300">Begin with small investments to learn without risking significant capital.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Diversify Portfolio</h4>
                <p className="text-slate-300">Spread investments across different assets and sectors to reduce risk.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Do Your Research</h4>
                <p className="text-slate-300">Analyze fundamentals, technical indicators, and market news before investing.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Control Emotions</h4>
                <p className="text-slate-300">Stick to your strategy and avoid panic selling during market downturns.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Risk Management</h4>
                <p className="text-slate-300">Use stop losses and position sizing to protect your capital.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Keep Learning</h4>
                <p className="text-slate-300">Markets evolve constantly - continuous education is essential for success.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Investment Journey?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join TradePro today and access professional trading tools, real-time market data, 
            and expert education to boost your investment success.
          </p>
          <Link
            to="/auth"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-12 py-4 rounded-lg text-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
          >
            <span>Open Your Account</span>
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center text-slate-400">
            <p>&copy; 2024 TradePro Education Hub. All rights reserved. Trading involves risk and may not be suitable for all investors.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
