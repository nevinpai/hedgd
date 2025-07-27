import { Link } from 'react-router-dom';

const DisclaimerPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      color: '#000000',
      padding: '2rem',
      fontFamily: 'Georgia, serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Disclaimer</h1>
      <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
        The information provided by HEDGD, including but not limited to stock picks, market commentary, and investment suggestions, is for informational and educational purposes only and does not constitute financial, investment, legal, or tax advice.
      </p>
      <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
        HEDGD is not a registered investment advisor, broker-dealer, or fiduciary. The content provided does not take into account your individual investment objectives, financial situation, or specific needs, and is not intended as a recommendation to buy, sell, or hold any securities. You are solely responsible for your investment decisions, and any trades you make are at your own risk.
      </p>
      <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
        Past performance of any stock, strategy, or financial instrument mentioned is not indicative of future results. All investments carry risk, and you may lose some or all of your investment. HEDGD and its affiliates may hold positions in the securities mentioned and may trade in or out of such positions without notice.
      </p>
      <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
        We strongly recommend consulting with a qualified financial advisor before making any investment decisions.
      </p>
      <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
        By using HEDGD, you acknowledge and agree to this disclaimer and our Terms of Use.
      </p>
      <Link to="/" style={{ color: '#3ba97b', textDecoration: 'none', fontWeight: 'bold' }}>
        &larr; Back to App
      </Link>
    </div>
  );
};

export default DisclaimerPage; 