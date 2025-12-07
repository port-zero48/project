import { Link } from 'react-router-dom'
import { TrendingUp, ArrowRight } from 'lucide-react'

export default function Legal() {
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
            Legal &
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
              Compliance
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            TradePro is committed to the highest standards of legal compliance and regulatory excellence.
          </p>
        </div>

        {/* Legal Documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all group">
            <h3 className="text-2xl font-semibold text-blue-400 mb-4 group-hover:text-cyan-400 transition-colors">
              Terms of Service
            </h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              Our comprehensive terms of service outline the rules and conditions for using TradePro's platform.
            </p>
            <a href="#" className="text-blue-400 hover:text-cyan-400 font-semibold inline-flex items-center gap-2">
              Read Document
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all group">
            <h3 className="text-2xl font-semibold text-blue-400 mb-4 group-hover:text-cyan-400 transition-colors">
              Privacy Policy
            </h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              Learn how we collect, use, and protect your personal information and data.
            </p>
            <a href="#" className="text-blue-400 hover:text-cyan-400 font-semibold inline-flex items-center gap-2">
              Read Document
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all group">
            <h3 className="text-2xl font-semibold text-blue-400 mb-4 group-hover:text-cyan-400 transition-colors">
              Risk Disclosure
            </h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              Important information about the risks involved in trading and investing on our platform.
            </p>
            <a href="#" className="text-blue-400 hover:text-cyan-400 font-semibold inline-flex items-center gap-2">
              Read Document
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all group">
            <h3 className="text-2xl font-semibold text-blue-400 mb-4 group-hover:text-cyan-400 transition-colors">
              Cookie Policy
            </h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              Information about how we use cookies and similar technologies on our website.
            </p>
            <a href="#" className="text-blue-400 hover:text-cyan-400 font-semibold inline-flex items-center gap-2">
              Read Document
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Regulatory Compliance */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-white mb-8">Regulatory Compliance</h2>
          <div className="space-y-6 text-slate-300">
            <div>
              <h3 className="text-2xl font-semibold text-blue-400 mb-3">Licensing & Registration</h3>
              <p>
                TradePro operates under the oversight of major financial regulatory bodies including the SEC, FINRA, 
                and international regulatory agencies. We maintain full compliance with all applicable laws and regulations.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-cyan-400 mb-3">AML & KYC Compliance</h3>
              <p>
                We implement comprehensive Anti-Money Laundering (AML) and Know Your Customer (KYC) procedures to prevent 
                financial crime and ensure the integrity of our platform.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-emerald-400 mb-3">Data Security & Privacy</h3>
              <p>
                Your data is protected with military-grade encryption, and we comply with GDPR, CCPA, and other 
                international data protection regulations.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-purple-400 mb-3">Regular Audits</h3>
              <p>
                We undergo regular third-party audits and security assessments to maintain the highest standards 
                of compliance and customer protection.
              </p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">⚠️ Important Notice</h2>
          <p className="text-slate-300 leading-relaxed">
            Trading and investing involve substantial risk of loss. Past performance is not indicative of future results. 
            The high degree of leverage that is often obtainable in off-exchange foreign currency trading can work against 
            you as well as for you. TradePro does not guarantee profits or freedom from loss. Please ensure you understand 
            the risks involved before trading.
          </p>
        </div>

        {/* Contact Legal */}
        <div className="text-center bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-6">Legal Assistance</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Have legal questions or concerns? Our compliance team is here to help.
          </p>
          <a
            href="mailto:legal@tradepro.com"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-12 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
          >
            <span>Contact Legal Team</span>
            <ArrowRight className="h-6 w-6" />
          </a>
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
