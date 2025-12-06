export type Kline = {
  time: number; // epoch seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

// Subscribe to Binance kline websocket stream for a symbol and interval.
// symbol should be like 'BTCUSDT', interval like '1m', '5m', '1h', '1d'
// callback receives a Kline object whenever a kline event updates (including partial updates while kline is forming)
export const subscribeToBinanceKlines = (
  symbol: string,
  interval: string,
  callback: (k: Kline) => void
) => {
  const streamName = `${symbol.toLowerCase()}@kline_${interval}`;
  const url = `wss://stream.binance.com:9443/ws/${streamName}`;
  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('Binance kline ws open', streamName);
  };

  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      if (data && data.k) {
        const k = data.k;
        const kline: Kline = {
          time: Math.floor(k.t / 1000),
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
        };
        callback(kline);
      }
    } catch (err) {
      console.error('Error parsing kline ws data', err);
    }
  };

  ws.onclose = () => {
    console.log('Binance kline ws closed', streamName);
  };

  ws.onerror = (err) => {
    console.error('Binance kline ws error', err);
  };

  return () => {
    try { ws.close(); } catch(e) {}
  };
};
