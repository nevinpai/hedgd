if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { tavily: createTavilyClient } = require('@tavily/core');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Initialize Gemini & Tavily ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const tavily = createTavilyClient({ apiKey: process.env.TAVILY_API_KEY });

// --- Middleware ---
const allowedOrigins = [
  'http://localhost:5173', 
  'https://hedgd.onrender.com',
  'YOUR_FRONTEND_APP_URL' // Replace with your frontend's actual deployed URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// --- In-memory cache ---
const cache = {
  questions: null,
  timestamp: null,
  cacheDuration: 4 * 60 * 60 * 1000 // 4 hours
};

// --- Tavily Search Logic ---
async function getRealTimeNews() {
  const queryBank = [
    "latest US federal reserve news",
    "recent geopolitical events affecting markets",
    "latest tech and AI regulation news",
    "major macroeconomic announcements",
    "global supply chain news"
  ];

  let searchResults = [];
  try {
    for (const query of queryBank) {
      const response = await tavily.search(query, { topic: 'news', max_results: 3 });
      searchResults = searchResults.concat(response.results);
    }
    return searchResults.map(result => ({ title: result.title, content: result.content, url: result.url }));
  } catch (error) {
    console.error('Error fetching from Tavily:', error);
    return []; // Return empty array on error
  }
}

// --- Gemini API Call Logic ---
async function fetchQuestionsFromGemini() {
  let attempts = 0;
  while (attempts < 3) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const realTimeContext = await getRealTimeNews();
      const contextString = realTimeContext.map(r => `Title: ${r.title}\nContent: ${r.content}\nURL: ${r.url}`).join('\n\n---\n\n');

      const prompt = `
You are a geopolitical and financial analyst tasked with generating 10 binary (yes/no) questions designed to help assess a user’s worldview and predict their investment tendencies. These questions will be used in a stock-picking app to inform personalized equity and macro trade suggestions. Follow the instructions below precisely and with no deviation:

🔴 ABSOLUTE RULES FOR QUESTIONS:
Timeliness (most important):

The questions must be based on events currently in the news and relevant as of the past 6 hours.
They should be automatically regenerated every 4 hours and must reflect the most current developments from authoritative sources (e.g., Reuters, Bloomberg, AP, CNBC, Politico).
Do not use stale or outdated issues.

Format and Tone:

Each question must begin with “Will” or “Do you believe”.
Each question must be provocative and polarizing, encouraging varied answers among users.
Do not reference or speculate directly on the movement of stock prices or indices (e.g., “Will the S&P 500 rise…” is prohibited).
Focus instead on external events (e.g., policy, political developments, macroeconomic decisions, geopolitical tensions, tech regulation, AI developments, etc.).

Style:

Mimic the style of Polymarket binary questions.
Include a clear timeframe, such as “by October 15, 2025” or “before the November 2025 FOMC meeting”.
If any number (e.g., price, rate, level) is mentioned, include the current value as context (e.g., “with oil currently at $78/barrel…”).
Avoid niche knowledge. All questions should be understandable to a typical American user with a high school education and a general interest in the news.
Ensure that every question is factually plausible, neither obvious nor absurd, and not skewed toward high or low probability.

Relevance:

Questions must relate to topics that affect markets, such as:
Government policy
Central bank decisions
Global conflict
Technology (especially AI)
Sanctions, tariffs, regulation
Major macroeconomic events
Supply chain shocks
Energy policy
Avoid questions about sports, entertainment, or cryptocurrency hype unless there is a clear connection to macroeconomics or global finance.

Quality Control:

Every question must be verifiable and based on a real, ongoing situation.
Do not fabricate hypothetical scenarios that are not in the news.
If no such real-time topic exists, generate no question.

✅ EXAMPLES OF CORRECT QUESTIONS:
Will China ban AI chip exports to the U.S. before September 30, 2025?
Will the Federal Reserve cut interest rates at the September 2025 FOMC meeting?
Will Iran announce successful uranium enrichment beyond 90% by November 1, 2025?
Will the U.S. Congress pass new tariffs on Chinese EVs before October 15, 2025?
Will the European Central Bank begin quantitative easing again before year-end 2025?
Will oil prices be impacted by a new OPEC+ production cut before October 2025? (oil currently at $78/barrel)
Will the Japanese government intervene in currency markets before September 30, 2025?

⚠️ DO NOT:
Do not reference stock price targets or returns.
Do not ask “What do you think about…” or “Which of the following…”.
Do not include trivia, personal finance, or irrelevant sectors.
Do not output explanations or anything besides the questions.

YOUR TASK: Based on the following real-time news context, generate exactly 10 binary questions following all rules above and tailored to the most recent real-world events as of this moment. Return the questions as a JSON array of strings.

--- REAL-TIME CONTEXT ---
${contextString}
--- END REAL-TIME CONTEXT ---
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      
      const startIndex = text.indexOf('[');
      const endIndex = text.lastIndexOf(']');
      
      if (startIndex !== -1 && endIndex !== -1) {
        const jsonText = text.substring(startIndex, endIndex + 1);
        const questions = JSON.parse(jsonText);
        return questions; // Success!
      }
      
      // If we reach here, a valid JSON array was not found.
      throw new Error("Could not find a valid JSON array in the API response.");

    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, error.message);
      if (attempts >= 3) {
        // If all attempts fail, re-throw the last error to be caught by the outer block.
        throw error;
      }
      // Optional: wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 500)); 
    }
  }

  // This part should ideally not be reached, but as a fallback:
  throw new Error("Failed to fetch questions from Gemini after multiple attempts.");
}

async function getQuestions() {
  const now = Date.now();

  if (cache.questions && (now - cache.timestamp < cache.cacheDuration)) {
    console.log('Serving questions from cache');
    return cache.questions;
  }

  try {
    console.log('Fetching new questions from Gemini API');
    const questions = await fetchQuestionsFromGemini();
    
    cache.questions = questions;
    cache.timestamp = now;

    return questions;
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    // Return a default set of questions as a fallback on final failure
    return [
      'Do you prefer long-term investments?',
      'Are you comfortable with high risk?',
      'Do you want to invest in tech companies?',
    ];
  }
}

// --- Routes ---
app.get('/api/questions', async (req, res) => {
  console.log('Received a request at /api/questions');
  try {
    const allQuestions = await getQuestions();
    
    // Shuffle the array of all questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    
    // Get the first 10 questions from the shuffled array
    const selectedQuestions = shuffled.slice(0, 10);
    
    res.json({ questions: selectedQuestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to serve questions from the AI service.' });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 