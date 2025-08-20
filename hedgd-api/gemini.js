const { GoogleGenerativeAI } = require('@google/generative-ai');
const { stockCache, stocks } = require('./tavily.js');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateRecommendations(userAnswers) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let context = "Company Data:\\n";
    for (const stock of stocks) {
        const data = stockCache.get(stock);
        if (data) {
            context += `Ticker: ${stock}\\n`;
            context += `Answer: ${data.answer}\\n`;
            context += `Results: ${JSON.stringify(data.results)}\\n\\n`;
        }
    }

    const prompt = `
        You are a financial advisor AI. Based on the user's answers to the following questions and the provided company data, recommend 10 stocks.
        User Answers: ${JSON.stringify(userAnswers)}

        Your response must be a JSON object with a key "recommendations" which is an array of 10 objects. Each object should have the following format:
        {
            "score": <a number between 0 and 1 representing how well the recommendation aligns with the user's answers>,
            "ticker": "<the stock ticker symbol>",
            "explanation": "<a brief explanation of why this stock is a good recommendation based on the user's answers and the company data>"
        }

        ${context}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating recommendations:", error);
        return { recommendations: [] };
    }
}

module.exports = {
    generateRecommendations
};
