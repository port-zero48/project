import { createChart } from 'lightweight-charts';

// Simple test to verify lightweight-charts API
const testChart = () => {
  const container = document.createElement('div');
  container.style.width = '500px';
  container.style.height = '300px';

  try {
    const chart = createChart(container);
    console.log('Chart created successfully');
    console.log('Chart type:', typeof chart);
    console.log('Chart methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(chart)));

    // Check for candlestick series method
    const hasAddCandlestick = 'addCandlestickSeries' in chart;
    console.log('Has addCandlestickSeries:', hasAddCandlestick);

    if (hasAddCandlestick) {
      const series = (chart as any).addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
      });
      console.log('Candlestick series created:', series);

      // Add test data
      series.setData([
        { time: '2024-01-01', open: 100, high: 110, low: 95, close: 105 },
        { time: '2024-01-02', open: 105, high: 115, low: 100, close: 112 },
      ]);
      console.log('Test data added successfully');
    } else {
      console.error('addCandlestickSeries method not found!');
      console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(chart)));
    }

    chart.timeScale().fitContent();
  } catch (error) {
    console.error('Error in test:', error);
  }
};

export default testChart;
