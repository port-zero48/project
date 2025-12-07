import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const supportEmail = 'support@tradepro.com'
  const contactEmail = 'contact@tradepro.com'
  const salesEmail = 'sales@tradepro.com'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create mailto link
    const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`
    
    // Open mail client
    window.location.href = mailtoLink
    
    // Show success message
    setSubmitted(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
    
    // Reset after 3 seconds
    setTimeout(() => setSubmitted(false), 3000)
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get quick responses to your questions',
      contact: supportEmail,
      type: 'email'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak with our team directly',
      contact: '+1 (800) 123-4567',
      type: 'phone'
    },
    {
      icon: MapPin,
      title: 'Office Location',
      description: 'Visit us in person',
      contact: '123 Financial Street, New York, NY 10001',
      type: 'address'
    }
  ]

  const emailAddresses = [
    {
      icon: '📧',
      title: 'General Support',
      email: supportEmail,
      description: 'For general questions and support'
    },
    {
      icon: '💼',
      title: 'Sales Inquiry',
      email: salesEmail,
      description: 'For partnership and sales opportunities'
    },
    {
      icon: '❓',
      title: 'Technical Support',
      email: contactEmail,
      description: 'For technical issues and problems'
    }
  ]

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
      </nav>

      <main className="container py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Get in
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block">
              Touch
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Have questions? We're here to help. Reach out to our support team anytime.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {contactMethods.map((method, idx) => {
            const IconComponent = method.icon
            return (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/70 transition-all duration-200">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg w-fit mb-6">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">{method.title}</h3>
                <p className="text-slate-400 mb-6">{method.description}</p>
                <div className="text-white font-semibold">
                  {method.type === 'email' && (
                    <a href={`mailto:${method.contact}`} className="text-blue-400 hover:text-cyan-400 transition-colors">
                      {method.contact}
                    </a>
                  )}
                  {method.type === 'phone' && (
                    <a href={`tel:${method.contact.replace(/\D/g, '')}`} className="text-blue-400 hover:text-cyan-400 transition-colors">
                      {method.contact}
                    </a>
                  )}
                  {method.type === 'address' && (
                    <p className="text-slate-300">{method.contact}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Email Addresses Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Email Addresses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {emailAddresses.map((item, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl hover:bg-slate-800/70 transition-all duration-200">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 mb-6">{item.description}</p>
                <a
                  href={`mailto:${item.email}`}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 w-full justify-center"
                >
                  <Mail className="h-5 w-5" />
                  <span>Send Email</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-12 mb-20 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Send Us a Message</h2>

          {submitted && (
            <div className="mb-8 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
              <p className="text-green-300">Your email client is opening. Please complete and send the email!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-slate-700 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-slate-700 transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-slate-700 transition-colors"
                placeholder="How can we help?"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-slate-700 transition-colors resize-none"
                placeholder="Tell us what you need..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Send className="h-5 w-5" />
              <span>Send Message</span>
            </button>
          </form>

          <p className="text-slate-400 text-center mt-8 text-sm">
            Your email client will open to send the message. We typically respond within 24 hours.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'What are your business hours?',
                a: 'We offer 24/7 customer support via email. Our phone support is available Monday to Friday, 9 AM to 6 PM EST.'
              },
              {
                q: 'How long does it take to get a response?',
                a: 'We aim to respond to all emails within 24 hours. Urgent matters may be escalated for faster response.'
              },
              {
                q: 'Do you offer live chat support?',
                a: 'Yes! Live chat support is available to all registered users directly in their dashboard.'
              },
              {
                q: 'Can I schedule a call with a specialist?',
                a: 'Absolutely! Please mention this in your email and we\'ll get back to you with available time slots.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-3">{faq.q}</h4>
                <p className="text-slate-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm mt-20">
        <div className="container py-12">
          <div className="text-center text-slate-400">
            <p>&copy; 2024 TradePro. All rights reserved. Trading involves risk and may not be suitable for all investors.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
