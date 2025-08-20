import hedgdLogo from '../assets/hedgd_logo.png';

export default function RecommendationIntroCard() {
    return (
        <div className="flex flex-col h-full w-full justify-center items-center text-center space-y-8 p-4">
            <div className="w-24 h-24">
                <img
                    src={hedgdLogo}
                    alt="hedgd Logo"
                    className="w-full h-full object-contain"
                    draggable={false}
                />
            </div>
            <h2 className="font-thin text-black leading-snug max-w-xs"
                style={{ fontFamily: 'Georgia, serif', fontWeight: '400', textAlign: 'left', paddingLeft: '2rem', paddingRight: '2rem', fontSize: '1.2rem' }}>
                Now, we will explore your personalized stock recommendations based on your answers.
                <br /><br />
                Our AI has analyzed your responses and selected stocks that align with your worldview.
                <br /><br />
                Swipe either way to continue.
            </h2>
        </div>
    );
}
