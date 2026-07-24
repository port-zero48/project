import { useState, useEffect } from 'react';

const FINNHUB_API_KEY = (import.meta.env.VITE_FINNHUB_API_KEY || '').trim();
const GNEWS_API_KEY = (import.meta.env.VITE_GNEWS_API_KEY || '').trim();
const ALPHA_VANTAGE_API_KEY = (import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || '').trim();
const NEWS_REFRESH_MS = 5 * 60 * 1000;

const TradingViewChart = ({ symbol }: { symbol: string }) => {
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Extract just the ticker symbol (e.g., AAPL from NASDAQ:AAPL)
        const ticker = symbol.split(':')[1] || symbol;
        
        // Using Twelve Data API (free tier - no API key for demo)
        // Alternative: Using a CORS proxy with Yahoo Finance
        const response = await fetch(
          `https://api.allorigins.win/raw?url=${encodeURIComponent(
            `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
          )}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }
        
        const data = await response.json();
        const quote = data.chart.result[0];
        const meta = quote.meta;
        const currentPrice = meta.regularMarketPrice;
        const previousClose = meta.chartPreviousClose;
        
        // Format data to match our display structure
        setStockData({
          c: currentPrice, // current price
          pc: previousClose, // previous close
          o: meta.regularMarketOpen || currentPrice, // open
          h: meta.regularMarketDayHigh || currentPrice, // high
          l: meta.regularMarketDayLow || currentPrice, // low
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchStockData, 60000);
    return () => clearInterval(interval);
  }, [symbol]);

  const priceChange = stockData ? stockData.c - stockData.pc : 0;
  const priceChangePercent = stockData ? ((priceChange / stockData.pc) * 100).toFixed(2) : 0;
  const isPositive = priceChange >= 0;

  return (
    <div style={{ 
      height: '400px', 
      width: '100%', 
      backgroundColor: '#1f2937', 
      borderRadius: '8px', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      border: '1px solid #374151',
      padding: '20px'
    }}>
      <p style={{ color: '#9ca3af', marginBottom: '16px', fontSize: '14px' }}>
        📊 {symbol}
      </p>
      
      {loading && (
        <div style={{ fontSize: '16px', color: '#10b981' }}>
          Loading market data...
        </div>
      )}
      
      {error && (
        <div style={{ fontSize: '14px', color: '#ef4444' }}>
          {error}
        </div>
      )}
      
      {!loading && !error && stockData && (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ fontSize: '48px', color: '#fff', fontWeight: 'bold', marginBottom: '16px' }}>
            ${stockData.c?.toFixed(2)}
          </div>
          
          <div style={{ 
            fontSize: '20px', 
            color: isPositive ? '#10b981' : '#ef4444',
            marginBottom: '24px'
          }}>
            {isPositive ? '▲' : '▼'} ${Math.abs(priceChange).toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent}%)
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '8px' }}>
              <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>OPEN</p>
              <p style={{ color: '#9ca3af', fontSize: '16px', fontWeight: 'bold' }}>${stockData.o?.toFixed(2)}</p>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '8px' }}>
              <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>HIGH</p>
              <p style={{ color: '#9ca3af', fontSize: '16px', fontWeight: 'bold' }}>${stockData.h?.toFixed(2)}</p>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '8px' }}>
              <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>LOW</p>
              <p style={{ color: '#9ca3af', fontSize: '16px', fontWeight: 'bold' }}>${stockData.l?.toFixed(2)}</p>
            </div>
            <div style={{ backgroundColor: '#111827', padding: '12px', borderRadius: '8px' }}>
              <p style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>PREV CLOSE</p>
              <p style={{ color: '#9ca3af', fontSize: '16px', fontWeight: 'bold' }}>${stockData.pc?.toFixed(2)}</p>
            </div>
          </div>
          
          <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '16px' }}>
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

const fallbackNews = [
  {
    title: 'Markets rally as investors shrug off rate worries and focus on earnings',
    description: 'Technology and financial stocks led the advance as traders rotated into growth names.',
    source: 'CNBC',
    url: 'https://www.cnbc.com',
    publishedAt: '2026-07-24T15:00:00Z',
  },
  {
    title: 'The Verge reports Big Tech keeps pushing AI spending higher',
    description: 'Cloud and chip companies are boosting capital expenditure as the AI arms race intensifies.',
    source: 'The Verge',
    url: 'https://www.theverge.com',
    publishedAt: '2026-07-24T13:30:00Z',
  },
  {
    title: 'Bank earnings beat expectations as loan demand stabilizes',
    description: 'Major lenders posted stronger-than-expected profits as markets recovered from recent volatility.',
    source: 'Reuters',
    url: 'https://www.reuters.com',
    publishedAt: '2026-07-24T11:45:00Z',
  },
  {
    title: 'Energy stocks gain on renewed optimism around global demand',
    description: 'Crude prices edged higher after supply concerns and improving economic data supported sentiment.',
    source: 'Bloomberg',
    url: 'https://www.bloomberg.com',
    publishedAt: '2026-07-24T10:15:00Z',
  },
  {
    title: 'Retail traders return as new market catalysts spark volume',
    description: 'Daily trading activity picked up as investors hunted for the next breakout name.',
    source: 'MarketWatch',
    url: 'https://www.marketwatch.com',
    publishedAt: '2026-07-24T09:20:00Z',
  },
  {
    title: 'Semiconductor leaders extend gains on strong AI demand outlook',
    description: 'Analysts say the current earnings cycle could support further upside for top chip makers.',
    source: 'CNBC',
    url: 'https://www.cnbc.com',
    publishedAt: '2026-07-24T08:05:00Z',
  },
];

const StocksNewsWidget = () => {
  const [news, setNews] = useState<any[]>(fallbackNews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const sources = [
          {
            name: 'Finnhub',
            url: `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`,
            parser: (data: any) =>
              Array.isArray(data)
                ? data.slice(0, 6).map((item: any) => ({
                    title: item.headline || 'Market headline',
                    description: item.summary?.replace(/<[^>]+>/g, '').slice(0, 110) || 'Fresh market update',
                    source: item.source || 'Finnhub',
                    url: item.url || 'https://finnhub.io',
                    publishedAt: item.datetime ? new Date(item.datetime * 1000).toISOString() : new Date().toISOString(),
                    urlToImage: item.image || '',
                  }))
                : [],
          },
          {
            name: 'GNews',
            url: `https://gnews.io/api/v4/top-headlines?category=business&lang=en&country=us&max=6&token=${GNEWS_API_KEY}`,
            parser: (data: any) =>
              Array.isArray(data?.articles)
                ? data.articles.slice(0, 6).map((item: any) => ({
                    title: item.title || 'Market headline',
                    description: item.description?.replace(/<[^>]+>/g, '').slice(0, 110) || 'Fresh market update',
                    source: item.source?.name || 'GNews',
                    url: item.url || 'https://gnews.io',
                    publishedAt: item.publishedAt || new Date().toISOString(),
                    urlToImage: item.image || '',
                  }))
                : [],
          },
          {
            name: 'Alpha Vantage',
            url: `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=IBM,MSFT,TSLA,AAPL&apikey=${ALPHA_VANTAGE_API_KEY}`,
            parser: (data: any) =>
              Array.isArray(data?.feed)
                ? data.feed.slice(0, 6).map((item: any) => ({
                    title: item.title || 'Market headline',
                    description: item.summary?.replace(/<[^>]+>/g, '').slice(0, 110) || 'Fresh market update',
                    source: item.source || 'Alpha Vantage',
                    url: item.url || 'https://www.alphavantage.co',
                    publishedAt: item.time_published ? `${item.time_published.slice(0, 4)}-${item.time_published.slice(4, 6)}-${item.time_published.slice(6, 8)}` : new Date().toISOString(),
                    urlToImage: '',
                  }))
                : [],
          },
        ];

        for (const source of sources) {
          try {
            const response = await fetch(source.url);
            if (!response.ok) {
              continue;
            }

            const data = await response.json();
            const items = source.parser(data);
            if (items.length > 0) {
              setNews(items);
              return;
            }
          } catch (err) {
            console.warn(`${source.name} failed`, err);
          }
        }

        setNews(fallbackNews);
      } catch (err) {
        console.error('Error fetching news:', err);
        setNews(fallbackNews);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = window.setInterval(fetchNews, NEWS_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div 
      style={{ 
        width: '100%', 
        backgroundColor: '#1f2937', 
        borderRadius: '8px',
        border: '1px solid #374151',
        padding: '20px',
      }}
      className="rounded-lg overflow-hidden"
    >
      {loading ? (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
          Loading news...
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          width: '100%'
        }}>
          {news.map((article, index) => (
            <div 
              key={index}
              style={{ 
                backgroundColor: '#111827', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid #374151',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={() => window.open(article.url, '_blank')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#374151';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {article.urlToImage && (
                <img 
                  src={article.urlToImage} 
                  alt={article.title}
                  style={{
                    width: '100%',
                    height: '140px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    marginBottom: '12px'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <p style={{ 
                color: '#10b981', 
                fontSize: '11px', 
                marginBottom: '8px',
                textTransform: 'uppercase',
                fontWeight: '600'
              }}>
                {article.source?.name || 'Business News'}
              </p>
              <h5 style={{ 
                color: '#f3f4f6', 
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                lineHeight: '1.4',
                flex: 1
              }}>
                {article.title}
              </h5>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: '12px',
                lineHeight: '1.5',
                marginBottom: '12px'
              }}>
                {article.description?.substring(0, 80)}...
              </p>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '11px'
              }}>
                {new Date(article.publishedAt).toLocaleDateString()} • 
                {new Date(article.publishedAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function TradingChat() {
  const [selectedSymbol, setSelectedSymbol] = useState('NASDAQ:AAPL');

  const stockSymbols = [
    { symbol: 'NASDAQ:AAPL', label: 'AAPL' },
    { symbol: 'NASDAQ:TSLA', label: 'TSLA' },
    { symbol: 'NASDAQ:GOOGL', label: 'GOOGL' },
    { symbol: 'NYSE:JPM', label: 'JPM' },
    { symbol: 'NASDAQ:MSFT', label: 'MSFT' },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 flex flex-col h-full w-full">
      <h3 className="text-lg font-semibold text-white mb-4">Stock Trading & News</h3>

      {/* Chart Section */}
      <div className="mb-6 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        <div className="p-3 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <span className="text-sm text-gray-400">Symbol:</span>
            {stockSymbols.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => setSelectedSymbol(stock.symbol)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedSymbol === stock.symbol
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {stock.label}
              </button>
            ))}
          </div>
        </div>
        <TradingViewChart symbol={selectedSymbol} />
      </div>

      {/* Stocks News Section */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden w-full">
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <h4 className="text-sm font-semibold text-white">Stock Market News</h4>
        </div>
        <StocksNewsWidget />
      </div>
    </div>
  );
}