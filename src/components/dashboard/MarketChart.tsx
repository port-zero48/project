import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

export default function TradingChart() {
  const [currentPair, setCurrentPair] = useState('BTC/USDT');
  const [data, setData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [timeframe, setTimeframe] = useState('1m');
  const [showPairs, setShowPairs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState('connecting');
  const canvasRef = useRef(null);
  const wsRef = useRef(null);

  const pairs = [
    { name: 'BTC/USDT', symbol: 'BTCUSDT' },
    { name: 'ETH/USDT', symbol: 'ETHUSDT' },
    { name: 'BNB/USDT', symbol: 'BNBUSDT' },
    { name: 'SOL/USDT', symbol: 'SOLUSDT' },
    { name: 'XRP/USDT', symbol: 'XRPUSDT' },
    { name: 'ADA/USDT', symbol: 'ADAUSDT' },
    { name: 'DOGE/USDT', symbol: 'DOGEUSDT' },
    { name: 'MATIC/USDT', symbol: 'MATICUSDT' }
  ];

  const timeframes = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1d'
  };

  const selectedPair = pairs.find(p => p.name === currentPair);

  // Fetch historical candlestick data
  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${selectedPair.symbol}&interval=${timeframes[timeframe]}&limit=100`
      );
      
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const rawData = await response.json();
      
      const candles = rawData.map(candle => ({
        timestamp: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }));
      
      setData(candles);
      setCurrentPrice(candles[candles.length - 1].close);
      setPriceChange(candles[candles.length - 1].close - candles[0].open);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setLoading(false);
    }
  };

  // WebSocket for real-time updates
  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${selectedPair.symbol.toLowerCase()}@kline_${timeframes[timeframe]}`
    );

    ws.onopen = () => {
      setWsStatus('connected');
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const kline = message.k;
      
      const newCandle = {
        timestamp: kline.t,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v)
      };

      setCurrentPrice(newCandle.close);

      setData(prevData => {
        if (prevData.length === 0) return [newCandle];
        
        const lastCandle = prevData[prevData.length - 1];
        
        // Check if this is a new candle or update to existing
        if (kline.x) {
          // Candle is closed, add new candle
          const updated = [...prevData.slice(-99), newCandle];
          setPriceChange(newCandle.close - updated[0].open);
          return updated;
        } else {
          // Update current candle
          const updated = [...prevData];
          updated[updated.length - 1] = newCandle;
          setPriceChange(newCandle.close - updated[0].open);
          return updated;
        }
      });
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsStatus('error');
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (wsRef.current === ws) {
          connectWebSocket();
        }
      }, 3000);
    };

    wsRef.current = ws;
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [currentPair, timeframe]);

  useEffect(() => {
    if (!loading && data.length > 0) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
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
          <p className="text-gray-400">Loading real-time data from Binance...</p>
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
            <span className="text-gray-400 text-sm">Binance Live Data</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                wsStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                wsStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
              }`}></div>
              <span className="text-sm text-gray-400">
                {wsStatus === 'connected' ? 'LIVE' : 
                 wsStatus === 'error' ? 'Error' : 'Connecting...'}
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
