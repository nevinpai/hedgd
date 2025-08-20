interface Answer {
    question: string;
    answer: boolean;
}

interface Recommendation {
    ticker: string;
    score: number;
}

interface SummaryCardProps {
    answers: Answer[];
    recommendations: Recommendation[];
}

export default function SummaryCard({ answers, recommendations }: SummaryCardProps) {
    const topAnswers = answers.slice(0, 3);
    const topRecommendations = recommendations.slice(0, 3);

    return (
        <div className="bg-white text-black rounded-[2rem] p-8 max-w-lg w-full mx-auto shadow-lg"
             style={{ fontFamily: 'Georgia, serif' }}>
            <h1 className="text-3xl font-bold text-center mb-6">Your Summary</h1>

            <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Your Answers</h2>
                <ul>
                    {topAnswers.map((item, index) => (
                        <li key={index} className="mb-2">
                            <p className="font-medium">{item.question}</p>
                            <p className="text-gray-600">{item.answer ? 'Agree' : 'Disagree'}</p>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4">Top Recommendations</h2>
                <ul>
                    {topRecommendations.map((rec, index) => (
                        <li key={index} className="mb-2">
                            <p className="font-medium">{rec.ticker}</p>
                            <p className="text-gray-600">Alignment Score: {Math.round(rec.score * 100)}%</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
