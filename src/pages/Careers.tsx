import { Link } from 'react-router-dom'
import { TrendingUp, Briefcase, MapPin, ArrowRight } from 'lucide-react'

export default function Careers() {
  const jobs = [
    {
      title: 'Senior Frontend Developer',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build beautiful and intuitive trading interfaces using React and TypeScript.'
    },
    {
      title: 'Financial Data Engineer',
      location: 'New York, USA',
      type: 'Full-time',
      description: 'Design and maintain systems that process real-time financial market data.'
    },
    {
      title: 'Customer Success Manager',
      location: 'Remote',
      type: 'Full-time',
      description: 'Help our traders succeed by providing world-class support and onboarding.'
    },
    {
      title: 'DevOps Engineer',
      location: 'Singapore',
      type: 'Full-time',
      description: 'Ensure our platform maintains 99.9% uptime with cutting-edge infrastructure.'
    },
    {
      title: 'Product Manager',
      location: 'London, UK',
      type: 'Full-time',
      description: 'Shape the future of TradePro by leading product strategy and development.'
    },
    {
      title: 'Compliance Specialist',
      location: 'Toronto, Canada',
      type: 'Full-time',
      description: 'Ensure TradePro maintains the highest regulatory and compliance standards.'
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
            Join Our
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
              Team
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            We're looking for talented, passionate people who want to revolutionize the trading industry. 
            Be part of something great!
          </p>
        </div>

        {/* Why Join Us */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-white mb-12">Why Join TradePro?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-blue-400 mb-4">🌍 Global Impact</h3>
              <p className="text-slate-300">
                Work on a platform used by 150,000+ traders in 50+ countries. Your impact reaches across the globe.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-cyan-400 mb-4">💼 Competitive Benefits</h3>
              <p className="text-slate-300">
                Competitive salary, equity options, comprehensive health coverage, and unlimited PTO.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-emerald-400 mb-4">🚀 Innovation</h3>
              <p className="text-slate-300">
                Work with cutting-edge technology and drive innovation in fintech every single day.
              </p>
            </div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white mb-12">Open Positions</h2>
          <div className="space-y-6">
            {jobs.map((job, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/70 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {job.type}
                      </div>
                    </div>
                  </div>
                  <Link to="/contact" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-2 rounded-lg font-semibold transition-all whitespace-nowrap inline-block">
                    Apply Now
                  </Link>
                </div>
                <p className="text-slate-300">{job.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Culture */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-white mb-8">Our Culture</h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            At TradePro, we believe that great products come from great people. We're building a culture 
            of innovation, collaboration, and continuous learning. Whether you're working from one of our 
            offices or remotely, you'll be part of a diverse, inclusive team that values your contributions.
          </p>
          <p className="text-slate-300 leading-relaxed">
            We offer flexible work arrangements, professional development opportunities, and a supportive 
            environment where your ideas matter and your growth is our priority.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12">
          <h2 className="text-4xl font-bold text-white mb-6">Don't See Your Role?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            We're always looking for talented people. Send us your resume and tell us how you can help TradePro grow.
          </p>
          <a
            href="mailto:careers@tradepro.com"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-12 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
          >
            <span>Contact Us</span>
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
