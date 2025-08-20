const { tavily: createTavilyClient } = require('@tavily/core');
const NodeCache = require('node-cache');

const tavily = createTavilyClient({ apiKey: process.env.TAVILY_API_KEY });
const stockCache = new NodeCache({ stdTTL: 172800, checkperiod: 86400 }); // 2-day TTL, check every day

const stocks = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'BRK.B', 'JPM', 'V', 'MA', 'JNJ', 'PG', 'UNH', 'XOM', 'HD', 'CVX', 'AVGO', 'LLY', 'MRK', 'PEP', 'KO', 'ABBV', 'COST', 'ORCL', 'TMO', 'ASML', 'WMT', 'BAC', 'PFE', 'ADBE', 'CRM', 'ACN', 'DIS', 'NFLX', 'INTC', 'CSCO', 'AMD', 'NKE', 'VZ', 'CMCSA', 'MCD', 'IBM', 'CAT', 'QCOM', 'TXN', 'HON', 'GE', 'GS', 'AMGN', 'AMAT', 'BMY', 'SBUX', 'NOW', 'LIN', 'UPS', 'MS', 'BLK', 'SPGI', 'RTX', 'COP', 'DE', 'LMT', 'BKNG', 'ADP', 'AMT', 'CB', 'LOW', 'UNP', 'MDT', 'C', 'PYPL', 'PLD', 'SCHW', 'T', 'CVS', 'MO', 'ELV', 'AXON', 'REGN', 'CI', 'ISRG', 'ZTS', 'GILD', 'PGR', 'DHR', 'MU', 'SYK', 'MMC', 'AON', 'INTU', 'ADI', 'PANW', 'CHTR', 'HCA', 'CL', 'EQIX', 'CME', 'ICE', 'FISV', 'SHW', 'NEE', 'SO', 'DUK', 'PNC',
    'FIZZ', 'CROX', 'UPST', 'SKLZ', 'BIGC', 'RUN', 'BLNK', 'PLUG', 'SAVA', 'FLGT', 'EBIX', 'GPRO', 'NNOX', 'RIOT', 'MARA', 'CLSK', 'HUT', 'EXPI', 'STEM', 'NVTA', 'BEEM', 'DM', 'WKHS', 'RIDE', 'SOLO', 'NKLA', 'VLTA', 'EVGO', 'SPWR', 'DNA', 'BLUE', 'CRSP', 'EDIT', 'NTLA', 'IONQ', 'QS', 'LTHM', 'LUMN', 'BB', 'APRN', 'PRTYQ', 'HNST', 'BODY', 'BYRN', 'VUZI', 'MARK', 'BNGO', 'ATER', 'LOTZ', 'VLD', 'BARK'
];

async function getCompanyInfo(ticker) {
  const query = `Get recent news and financial performance for ${ticker}.`;
  try {
    const response = await tavily.search(query, {
      search_depth: "advanced",
      include_answer: true,
      max_results: 5
    });
    return response;
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    return null;
  }
}

async function refreshStockData() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday = 0, Saturday = 6

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    console.log("Skipping stock data refresh on a weekend.");
    return;
  }

  console.log("Refreshing stock data...");
  for (const stock of stocks) {
    const data = await getCompanyInfo(stock);
    if (data) {
      stockCache.set(stock, data);
    }
  }
  console.log("Stock data refreshed.");
}

// Initial refresh
refreshStockData();

// Schedule refresh
setInterval(refreshStockData, 172800000); // 2 days in milliseconds

module.exports = {
  stockCache,
  stocks
};
