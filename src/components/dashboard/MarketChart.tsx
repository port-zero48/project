import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

export default function TradingChart() {
  const [currentPair, setCurrentPair] = useState('BTC/USD');
  const [data, setData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [timeframe, setTimeframe] = useState('1m');
  const [showPairs, setShowPairs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState('connecting');
  const canvasRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const pairs = [
    { name: 'BTC/USD', symbol: 'BTC' },
    { name: 'ETH/USD', symbol: 'ETH' },
    { name: 'SOL/USD', symbol: 'SOL' },
    { name: 'XRP/USD', symbol: 'XRP' },
    { name: 'ADA/USD', symbol: 'ADA' },
    { name: 'DOGE/USD', symbol: 'DOGE' },
    { name: 'LTC/USD', symbol: 'LTC' },
    { name: 'MATIC/USD', symbol: 'MATIC' }
  ];

  const timeframes = {
    '1m': { interval: '1m', ms: 60000 },
    '5m': { interval: '5m', ms: 300000 },
    '15m': { interval: '15m', ms: 900000 },
    '1h': { interval: '1h', ms: 3600000 },
    '4h': { interval: '4h', ms: 14400000 },
    '1d': { interval: '1d', ms: 86400000 }
  };

  const fetchHistoricalData = async () => {
    const selectedPair = pairs.find(p => p.name === currentPair);
    
    try {
      // Use CryptoCompare API for historical data
      const limit = 100;
      const response = await fetch(
        `https://min-api.cryptocompare.com/data/v2/histominute?fsym=${selectedPair.symbol}&tsym=USD&limit=${limit}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const json = await response.json();
      
      if (json.Response === 'Error') {
        throw new Error(json.Message);
      }
      
      // Convert CryptoCompare data to candle format
      const candles = json.Data.Data.map(item => ({
        timestamp: item.time * 1000,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volumeto
      }));
      
      return candles;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };

  const fetchCurrentPrice = async () => {
    const selectedPair = pairs.find(p => p.name === currentPair);
    
    try {
      // Use CryptoCompare API for current price
      const response = await fetch(
        `https://min-api.cryptocompare.com/data/price?fsym=${selectedPair.symbol}&tsyms=USD`
      );
      
      if (!response.ok) throw new Error('Failed to fetch price');
      
      const json = await response.json();
      const newPrice = json.USD;
      
      return newPrice;
    } catch (error) {
      console.error('Error fetching current price:', error);
      return null;
    }
  };

  const initializeData = async () => {
    setLoading(true);
    setWsStatus('connecting');
    const candles = await fetchHistoricalData();
    
    if (candles.length > 0) {
      setData(candles);
      setCurrentPrice(candles[candles.length - 1].close);
      setPriceChange(candles[candles.length - 1].close - candles[0].open);
      setWsStatus('connected');
    } else {
      setWsStatus('error');
    }
    
    setLoading(false);
  };

  const startLiveUpdates = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      const newPrice = await fetchCurrentPrice();
      
      if (newPrice !== null) {
        setData(prevData => {
          if (prevData.length === 0) return prevData;
          
          const lastCandle = prevData[prevData.length - 1];
          const now = Date.now();
          const tf = timeframes[timeframe];
          const shouldCreateNewCandle = now - lastCandle.timestamp >= tf.ms;
          
          if (shouldCreateNewCandle) {
            const newCandle = {
              timestamp: now,
              open: lastCandle.close,
              high: Math.max(lastCandle.close, newPrice),
              low: Math.min(lastCandle.close, newPrice),
              close: newPrice,
              volume: Math.random() * 1000000 + 500000
            };
            
            const updated = [...prevData.slice(-99), newCandle];
            setCurrentPrice(newPrice);
            setPriceChange(newPrice - updated[0].open);
            
            return updated;
          } else {
            const updatedCandle = {
              ...lastCandle,
              high: Math.max(lastCandle.high, newPrice),
              low: Math.min(lastCandle.low, newPrice),
              close: newPrice,
              volume: lastCandle.volume + Math.random() * 100000
            };
            
            const updated = [...prevData];
            updated[updated.length - 1] = updatedCandle;
            
            setCurrentPrice(newPrice);
            setPriceChange(newPrice - updated[0].open);
            
            return updated;
          }
        });
      }
    }, 5000); // Update every 5 seconds
  };

  useEffect(() => {
    initializeData();
  }, [currentPair, timeframe]);

  useEffect(() => {
    if (!loading && data.length > 0) {
      startLiveUpdates();
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [loading, currentPair, timeframe]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 80, bottom: 40, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    const allPrices = data.flatMap(d => [d.high, d.low]);
    const maxPrice = Math.max(...allPrices);
    const minPrice = Math.min(...allPrices);
    const priceRange = maxPrice - minPrice;
    const priceBuffer = priceRange * 0.1;

    const priceToY = (price) => {
      return padding.top + chartHeight * (1 - (price - minPrice + priceBuffer) / (priceRange + 2 * priceBuffer));
    };

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      
      const priceText = price < 1 ? price.toFixed(4) : price.toFixed(2);
      ctx.fillText(`$${priceText}`, width - padding.right + 5, y + 4);
    }

    // Draw current price line
    if (currentPrice > 0) {
      const currentY = priceToY(currentPrice);
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, currentY);
      ctx.lineTo(width - padding.right, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current price label
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(width - padding.right + 2, currentY - 10, 75, 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      const currentPriceText = currentPrice < 1 ? currentPrice.toFixed(4) : currentPrice.toFixed(2);
      ctx.fillText(`$${currentPriceText}`, width - padding.right + 6, currentY + 3);
    }

    // Draw candles
    const candleWidth = Math.max(2, (chartWidth / data.length) - 2);
    const candleSpacing = chartWidth / data.length;

    data.forEach((candle, index) => {
      const x = padding.left + index * candleSpacing + candleSpacing / 2;
      const isGreen = candle.close >= candle.open;
      
      // Draw wick
      ctx.strokeStyle = isGreen ? '#10B981' : '#EF4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, priceToY(candle.high));
      ctx.lineTo(x, priceToY(candle.low));
      ctx.stroke();

      // Draw body
      const bodyTop = priceToY(Math.max(candle.open, candle.close));
      const bodyBottom = priceToY(Math.min(candle.open, candle.close));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);

      ctx.fillStyle = isGreen ? '#10B981' : '#EF4444';
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

      // Highlight the current updating candle
      if (index === data.length - 1) {
        ctx.strokeStyle = isGreen ? '#34D399' : '#F87171';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - candleWidth / 2 - 1, bodyTop - 1, candleWidth + 2, bodyHeight + 2);
      }
    });

    // Draw time labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    const timeLabels = 6;
    for (let i = 0; i < timeLabels; i++) {
      const x = padding.left + (chartWidth / (timeLabels - 1)) * i;
      const dataIndex = Math.floor((data.length / (timeLabels - 1)) * i);
      if (data[dataIndex]) {
        const date = new Date(data[dataIndex].timestamp);
        const time = date.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        ctx.fillText(time, x, height - 10);
      }
    }

  }, [data, currentPrice]);

  const isPositive = priceChange >= 0;
  const percentChange = data.length > 0 
    ? ((priceChange / data[0].open) * 100).toFixed(2) 
    : '0.00';

  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading live market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-950 text-white p-4">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-baseline gap-4 mb-2">
            <div className="relative">
              <button
                onClick={() => setShowPairs(!showPairs)}
                className="flex items-center gap-2 text-3xl font-bold hover:text-blue-400 transition-colors"
              >
                {currentPair}
                <ChevronDown size={24} />
              </button>
              
              {showPairs && (
                <div className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10 min-w-[200px]">
                  {pairs.map((pair) => (
                    <button
                      key={pair.name}
                      onClick={() => {
                        setCurrentPair(pair.name);
                        setShowPairs(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        currentPair === pair.name ? 'bg-gray-700 text-blue-400' : ''
                      }`}
                    >
                      {pair.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-gray-400 text-sm">Live Data </span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                wsStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                wsStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
              }`}></div>
              <span className="text-sm text-gray-400">
                {wsStatus === 'connected' ? 'LIVE ' : 
                 wsStatus === 'error' ? 'Connection Error' : 'Connecting...'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">
              ${currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2, 
                maximumFractionDigits: currentPrice < 1 ? 4 : 2
              })}
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded ${isPositive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
              {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              <span className="font-semibold">
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange}%)
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 mb-4">
          {Object.keys(timeframes).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                timeframe === tf 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-gray-900 rounded-lg">
          <div>
            <div className="text-gray-400 text-sm mb-1">High</div>
            <div className="text-white font-semibold">
              ${data.length > 0 ? Math.max(...data.map(d => d.high)).toFixed(2) : '0.00'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Low</div>
            <div className="text-white font-semibold">
              ${data.length > 0 ? Math.min(...data.map(d => d.low)).toFixed(2) : '0.00'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Volume</div>
            <div className="text-white font-semibold">
              {data.length > 0 
                ? (data.reduce((sum, d) => sum + d.volume, 0) / 1000000).toFixed(2) + 'M'
                : '0'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Last Update</div>
            <div className="text-white font-semibold">
              {data.length > 0 
                ? new Date(data[data.length - 1].timestamp).toLocaleTimeString()
                : '--:--'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}