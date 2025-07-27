require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Initialize Gemini ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Middleware ---
app.use(cors({
  origin: 'http://localhost:5173' // Replace with your frontend's actual deployed URL in production
}));
app.use(express.json());

// --- In-memory cache ---
const cache = {
  questions: null,
  timestamp: null,
  cacheDuration: 4 * 60 * 60 * 1000 // 4 hours
};

// --- Gemini API Call Logic ---
async function fetchQuestionsFromGemini() {
  let attempts = 0;
  while (attempts < 3) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
      Generate 100 questions based on current geopolitical and financial events to assess a person’s investment worldview. 
      The questions need to be topical and relevant to the current events, like polymarket odds betting questions on 
      politics, tech, finance, etc. Ensure the questions use the most up to date information possible and fact check things like
      dates and stock prices to ensure they are accurate and up to date as this is imperative. Example questions (not necissarily up to date):
      "Will the US send foreign aid to Ukraine by the end of June"
      "Will Bitcoin be above $200,000 by the end of the year"
      "Will the Trump administration collapse by the end of the year"
      "Will the Russian ruble rebound by the end of the year"
      The questions should be suitable for a Tinder-style swipe interface (yes/no answers).
      Return the questions as a JSON array of strings. For example:
      ["Do you prioritize long-term growth over short-term gains?", "Are you comfortable with volatile markets?"]
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