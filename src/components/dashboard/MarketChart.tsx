import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';

type CandlePoint = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const pairs = [
  { name: 'BTC/USD', symbol: 'BTCUSDT' },
  { name: 'ETH/USD', symbol: 'ETHUSDT' },
  { name: 'SOL/USD', symbol: 'SOLUSDT' },
  { name: 'XRP/USD', symbol: 'XRPUSDT' },
  { name: 'ADA/USD', symbol: 'ADAUSDT' },
  { name: 'DOGE/USD', symbol: 'DOGEUSDT' },
  { name: 'LTC/USD', symbol: 'LTCUSDT' },
  { name: 'MATIC/USD', symbol: 'MATICUSDT' }
];

const timeframes = {
  '1m': { interval: '1m', ms: 60000 },
  '5m': { interval: '5m', ms: 300000 },
  '15m': { interval: '15m', ms: 900000 },
  '1h': { interval: '1h', ms: 3600000 },
  '4h': { interval: '4h', ms: 14400000 },
  '1d': { interval: '1d', ms: 86400000 }
};

const createFallbackCandleData = (count = 100, basePrice = 1000): CandlePoint[] => {
  const candles: CandlePoint[] = [];
  let lastClose = basePrice;

  for (let i = 0; i < count; i += 1) {
    const drift = Math.sin(i / 3) * (basePrice * 0.008) + Math.cos(i / 6) * (basePrice * 0.004);
    const open = lastClose;
    const close = Math.max(1, open + drift);
    const high = Math.max(open, close) + Math.abs(drift) * 0.4;
    const low = Math.min(open, close) - Math.abs(drift) * 0.4;

    candles.push({
      time: Math.floor((Date.now() - (count - i) * 60000) / 1000),
      open,
      high,
      low,
      close,
      volume: Math.round(400000 + Math.abs(drift) * 2500)
    });

    lastClose = close;
  }

  return candles;
};

const fetchBinanceKlines = async (symbol: string, interval: string, limit = 100): Promise<CandlePoint[]> => {
  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    );

    if (!response.ok) throw new Error('Binance candles fetch failed');

    const json = await response.json();
    if (!Array.isArray(json)) throw new Error('Invalid candle response');

    return json.map((item: any[]): CandlePoint => ({
      time: Math.floor(item[0] / 1000),
      open: Number(item[1]),
      high: Number(item[2]),
      low: Number(item[3]),
      close: Number(item[4]),
      volume: Number(item[5])
    }));
  } catch (error) {
    console.error('Error fetching Binance klines:', error);
    return [];
  }
};

const fetchBinancePrice = async (symbol: string): Promise<number | null> => {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    if (!response.ok) throw new Error('Binance ticker fetch failed');

    const json = await response.json();
    return Number(json.price);
  } catch (error) {
    console.error('Error fetching Binance price:', error);
    return null;
  }
};

export default function TradingChart() {
  const [currentPair, setCurrentPair] = useState('BTC/USD');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [timeframe, setTimeframe] = useState('1m');
  const [showPairs, setShowPairs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [initialOpen, setInitialOpen] = useState(0);
  const [useFallbackData, setUseFallbackData] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const selectedPair = pairs.find((pair) => pair.name === currentPair) ?? pairs[0];
  const chartInterval = timeframes[timeframe].interval;

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { color: '#111827' },
        textColor: '#d1d5db'
      },
      grid: {
        vertLines: { color: '#27272a' },
        horzLines: { color: '#27272a' }
      },
      rightPriceScale: { borderColor: '#27272a' },
      timeScale: {
        borderColor: '#27272a',
        timeVisible: true,
        secondsVisible: false
      },
      localization: {
        priceFormatter: (price) => `$${price.toFixed(2)}`
      },
      crosshair: {
        mode: CrosshairMode.Normal
      }
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#16a34a',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#16a34a',
      wickDownColor: '#ef4444'
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    const resizeObserver = new ResizeObserver(() => {
      if (container && chartRef.current) {
        chartRef.current.applyOptions({ width: container.clientWidth, height: container.clientHeight });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setWsStatus('connecting');

      const candles = await fetchBinanceKlines(selectedPair.symbol, chartInterval, 100);
      const hasCandles = candles.length > 0;
      const fallbackBase = await fetchBinancePrice(selectedPair.symbol) ?? 1000;
      const finalCandles = hasCandles ? candles : createFallbackCandleData(100, fallbackBase);

      if (!isMounted) return;

      setUseFallbackData(!hasCandles);
      setWsStatus(hasCandles ? 'connected' : 'error');

      const latestPrice = hasCandles
        ? finalCandles[finalCandles.length - 1].close
        : fallbackBase;

      const formatted = finalCandles.map((candle) => ({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close
      })) as CandlestickData[];

      candleSeriesRef.current?.setData(formatted);
      setCurrentPrice(latestPrice);
      setInitialOpen(finalCandles[0].open);
      setPriceChange(hasCandles ? latestPrice - finalCandles[0].open : 0);
      setLoading(false);
    };

    loadData();
    return () => { isMounted = false; };
  }, [selectedPair.symbol, chartInterval]);

  useEffect(() => {
    if (!candleSeriesRef.current || initialOpen === 0) return;

    const streamSymbol = selectedPair.symbol.toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamSymbol}@kline_${chartInterval}`);

    setWsStatus('connecting');

    ws.onopen = () => {
      setWsStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const kline = parsed.k;
        if (!kline) return;

        const updatedBar = {
          time: Math.floor(kline.t / 1000),
          open: Number(kline.o),
          high: Number(kline.h),
          low: Number(kline.l),
          close: Number(kline.c)
        } as CandlestickData;

        candleSeriesRef.current?.update(updatedBar);
        setCurrentPrice(Number(kline.c));
        if (!useFallbackData) {
          setPriceChange(Number(kline.c) - initialOpen);
        }
      } catch (error) {
        console.error('Binance websocket message error:', error);
      }
    };

    ws.onerror = () => {
      setWsStatus('error');
    };

    ws.onclose = () => {
      if (ws.readyState !== WebSocket.OPEN) {
        setWsStatus('connecting');
      }
    };

    return () => {
      ws.close();
    };
  }, [selectedPair.symbol, chartInterval, initialOpen, useFallbackData]);

  useEffect(() => {
    let intervalId: number | null = null;

    const updatePrice = async () => {
      const latestPrice = await fetchBinancePrice(selectedPair.symbol);
      if (latestPrice !== null) {
        setCurrentPrice(latestPrice);
        if (!useFallbackData && initialOpen > 0) {
          setPriceChange(latestPrice - initialOpen);
        }
      }
    };

    updatePrice();
    intervalId = window.setInterval(updatePrice, 5000);

    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [selectedPair.symbol, initialOpen, useFallbackData]);

  const isPositive = priceChange >= 0;
  const percentChange = initialOpen > 0 ? ((priceChange / initialOpen) * 100).toFixed(2) : '0.00';

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading live market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-950 text-white p-4">
      <div className="w-full h-full flex flex-col">
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
            <span className="text-gray-400 text-sm">Live Data</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                wsStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                wsStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
              }`}></div>
              <span className="text-sm text-gray-400">
                {wsStatus === 'connected' ? 'LIVE' : wsStatus === 'error' ? 'Connection Error' : 'Connecting...'}
              </span>
            </div>
            {useFallbackData && (
              <div className="mt-2 px-3 py-2 rounded bg-yellow-500/10 border border-yellow-500 text-yellow-200 text-sm">
                Using fallback candle data. Live price may still update, but candle history is not from Binance.
              </div>
            )}
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

        <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
          <div ref={chartContainerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
