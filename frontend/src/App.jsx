import { useState } from "react"

function App() {
  const [text, setText] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const analyze = async () => {
    if (!text.trim()) { setError("Please paste some text first."); return }
    setLoading(true); setError(""); setResult(null)
    try {
      const r = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      })
      setResult(await r.json())
    } catch { setError("Cannot connect to backend. Is FastAPI running?") }
    setLoading(false)
  }

  const credColor = (s) =>
    s >= 75 ? "#4ade80" : s >= 50 ? "#fbbf24" : "#f87171"

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Syne+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        :root {
          --bg:        #0c0c0f;
          --surface:   #131318;
          --surface2:  #1a1a22;
          --border:    #ffffff0f;
          --border2:   #ffffff18;
          --text:      #f0eee8;
          --muted:     #4b4b5a;
          --subtle:    #2a2a35;
          --red:       #f87171;
          --green:     #4ade80;
          --yellow:    #fbbf24;
          --accent:    #e25c5c;
        }

        body {
          background: var(--bg);
          font-family: 'Syne', sans-serif;
          color: var(--text);
          -webkit-font-smoothing: antialiased;
        }

        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ── NAV ── */
        nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
          position: sticky;
          top: 0;
          z-index: 10;
          backdrop-filter: blur(12px);
        }
        .nav-logo {
          font-size: 20px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
        }
        .nav-logo span { color: var(--accent); }
        .nav-badge {
          font-size: 11px;
          font-weight: 500;
          color: var(--muted);
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: 'Syne Mono', monospace;
        }

        /* ── HERO ── */
        .hero {
          text-align: center;
          padding: 72px 24px 52px;
          max-width: 640px;
          margin: 0 auto;
        }
        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f87171 12;
          border: 1px solid #f8717130;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          padding: 6px 16px;
          margin-bottom: 28px;
          color: var(--red);
          font-family: 'Syne Mono', monospace;
        }
        .hero h1 {
          font-size: clamp(28px, 4.5vw, 48px);
          font-weight: 800;
          line-height: 1.15;
          color: var(--text);
          letter-spacing: -1.5px;
          margin-bottom: 18px;
        }
        .hero h1 em {
          font-style: italic;
          color: var(--accent);
        }
        .hero p {
          color: var(--muted);
          font-size: 15px;
          line-height: 1.75;
          font-weight: 400;
        }

        /* ── INPUT ── */
        .input-section {
          max-width: 700px;
          margin: 0 auto;
          width: 100%;
          padding: 0 24px 52px;
        }
        textarea {
          width: 100%;
          height: 140px;
          padding: 20px;
          border: 1px solid var(--border2);
          border-radius: 14px;
          background: var(--surface);
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          color: var(--text);
          resize: none;
          outline: none;
          transition: border-color 0.2s;
          line-height: 1.65;
        }
        textarea:focus { border-color: #ffffff30; }
        textarea::placeholder { color: var(--muted); }

        .input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          gap: 12px;
        }
        .char-count {
          color: var(--muted);
          font-size: 11px;
          font-family: 'Syne Mono', monospace;
          letter-spacing: 1px;
        }
        .error-msg { color: var(--red); font-size: 13px; }

        .btn {
          padding: 13px 36px;
          background: var(--text);
          color: var(--bg);
          border: none;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          letter-spacing: 0.5px;
        }
        .btn:hover { background: var(--accent); color: white; transform: translateY(-1px); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        /* ── LOADING ── */
        .loading-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 48px;
          color: var(--muted);
          font-size: 13px;
          font-family: 'Syne Mono', monospace;
          letter-spacing: 1px;
        }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid var(--subtle);
          border-top-color: var(--text);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── RESULTS ── */
        .results-section {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px 80px;
          width: 100%;
        }
        .results-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 32px;
        }
        .results-meta-left {
          font-size: 12px;
          font-family: 'Syne Mono', monospace;
          color: var(--muted);
          letter-spacing: 1px;
        }
        .results-meta-left strong {
          color: var(--text);
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }
        .results-meta-right {
          font-size: 11px;
          font-family: 'Syne Mono', monospace;
          color: var(--muted);
          letter-spacing: 1px;
          text-align: right;
        }

        .cards-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .cards-row { grid-template-columns: 1fr; }
          nav { padding: 16px 20px; }
          .results-section { padding: 0 16px 60px; }
        }

        /* ── CARD ── */
        .card {
          background: var(--surface);
          border-radius: 16px;
          padding: 28px;
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 18px;
          transition: border-color 0.2s;
        }
        .card:hover { border-color: var(--border2); }

        .card-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--muted);
          font-family: 'Syne Mono', monospace;
        }

        /* BIAS */
        .bias-value {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -1px;
          line-height: 1;
        }
        .is-biased  { color: var(--red); }
        .is-neutral { color: var(--green); }

        .confidence-track {
          background: var(--subtle);
          border-radius: 100px;
          height: 3px;
          overflow: hidden;
        }
        .confidence-fill {
          height: 100%;
          border-radius: 100px;
          transition: width 1s cubic-bezier(0.4,0,0.2,1);
        }
        .fill-red   { background: var(--red); }
        .fill-green { background: var(--green); }

        .confidence-label {
          font-size: 12px;
          color: var(--muted);
          font-family: 'Syne Mono', monospace;
          letter-spacing: 1px;
        }

        /* CREDIBILITY */
        .score-big {
          font-size: 56px;
          font-weight: 800;
          letter-spacing: -2px;
          line-height: 1;
        }
        .score-denom {
          font-size: 20px;
          color: var(--muted);
          font-weight: 400;
          letter-spacing: 0;
        }
        .verdict-pill {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 100px;
          font-family: 'Syne Mono', monospace;
          width: fit-content;
        }
        .pill-high { background: #4ade8015; color: var(--green); border: 1px solid #4ade8025; }
        .pill-mod  { background: #fbbf2415; color: var(--yellow); border: 1px solid #fbbf2425; }
        .pill-low  { background: #f8717115; color: var(--red); border: 1px solid #f8717125; }

        .tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .tag {
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 6px;
          font-weight: 500;
          font-family: 'Syne Mono', monospace;
        }
        .tag-red    { background: #f8717110; color: var(--red); }
        .tag-yellow { background: #fbbf2410; color: var(--yellow); }
        .tag-green  { background: #4ade8010; color: var(--green); }

        .card-divider {
          border: none;
          border-top: 1px solid var(--border);
        }

        .card-note {
          font-size: 11px;
          color: var(--muted);
          font-family: 'Syne Mono', monospace;
          letter-spacing: 0.5px;
          line-height: 1.6;
        }

        /* COUNTER */
        .counter-text {
          font-size: 14px;
          color: #9ca3af;
          line-height: 1.8;
          white-space: pre-line;
          font-weight: 400;
        }

        /* FOOTER */
        footer {
          border-top: 1px solid var(--border);
          padding: 24px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        footer span {
          font-size: 11px;
          color: var(--muted);
          font-family: 'Syne Mono', monospace;
          letter-spacing: 1px;
        }
      `}</style>

      <div className="page">

        {/* Nav */}
        <nav>
          <div className="nav-logo">Bubble<span>Check</span></div>
          <div className="nav-badge">Echo Chamber Detector</div>
        </nav>

        {/* Hero */}
        <div className="hero">
          <div className="hero-tag">⬤ AI Powered · Free · Open Source</div>
          <h1>Is what you're reading <em>actually</em> the full picture?</h1>
          <p>Paste any headline, tweet, or WhatsApp forward. BubbleCheck detects bias, scores credibility, and shows you the other side.</p>
        </div>

        {/* Input */}
        <div className="input-section">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste a headline, news article, tweet, or WhatsApp forward..."
          />
          <div className="input-footer">
            <span className="char-count">{text.length} / 1000</span>
            {error && <span className="error-msg">{error}</span>}
            <button className="btn" onClick={analyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze →"}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-row">
            <div className="spinner" />
            <span>Running bias detection + credibility check + counter analysis...</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="results-section">
            <div className="results-meta">
              <div className="results-meta-left">
                <strong>{result.input_text.slice(0, 80)}{result.input_text.length > 80 ? "..." : ""}</strong>
                ANALYSIS COMPLETE · 3 CHECKS RUN
              </div>
              <div className="results-meta-right">
                BUBBLECHECK REPORT<br />
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>

            <div className="cards-row">

              {/* Bias Card */}
              <div className="card">
                <div className="card-label">// Bias Detection</div>
                <div className={`bias-value ${result.bias_analysis.label === "BIASED" ? "is-biased" : "is-neutral"}`}>
                  {result.bias_analysis.label === "BIASED" ? "Biased" : "Neutral"}
                </div>
                <div>
                  <div className="confidence-track">
                    <div
                      className={`confidence-fill ${result.bias_analysis.label === "BIASED" ? "fill-red" : "fill-green"}`}
                      style={{ width: `${result.bias_analysis.confidence}%` }}
                    />
                  </div>
                  <div className="confidence-label" style={{ marginTop: 10 }}>
                    {result.bias_analysis.confidence}% CONFIDENCE
                  </div>
                </div>
                <hr className="card-divider" />
                <div className="card-note">
                  Model: DistilRoBERTa<br />
                  Trained on news + social media bias patterns
                </div>
              </div>

              {/* Credibility Card */}
              <div className="card">
                <div className="card-label">// Credibility Score</div>
                <div className="score-big" style={{ color: credColor(result.credibility.score) }}>
                  {result.credibility.score}
                  <span className="score-denom">/100</span>
                </div>
                <div className={`verdict-pill ${
                  result.credibility.score >= 75 ? "pill-high" :
                  result.credibility.score >= 50 ? "pill-mod" : "pill-low"
                }`}>
                  {result.credibility.verdict}
                </div>
                {(result.credibility.fear_language.length > 0 ||
                  result.credibility.sensational_language.length > 0 ||
                  result.credibility.manipulation_tactics.length > 0 ||
                  result.credibility.credibility_boosters.length > 0) && (
                  <div className="tags">
                    {result.credibility.fear_language.map((w, i) =>
                      <span key={i} className="tag tag-red">⚠ {w}</span>)}
                    {result.credibility.sensational_language.map((w, i) =>
                      <span key={i} className="tag tag-yellow">⚡ {w}</span>)}
                    {result.credibility.manipulation_tactics.map((w, i) =>
                      <span key={i} className="tag tag-red">↯ {w}</span>)}
                    {result.credibility.credibility_boosters.map((w, i) =>
                      <span key={i} className="tag tag-green">✓ {w}</span>)}
                  </div>
                )}
                <hr className="card-divider" />
                <div className="card-note">{result.credibility.explanation}</div>
              </div>

              {/* Counter Card */}
              <div className="card">
                <div className="card-label">// Counter Perspective</div>
                <div className="counter-text">{result.counter_perspective}</div>
                <hr className="card-divider" />
                <div className="card-note">
                  Generated by Gemini AI<br />
                  Neutral framing · Not editorial opinion
                </div>
              </div>

            </div>
          </div>
        )}

        <footer>
          <span>© 2026 BubbleCheck · Fighting echo chambers</span>
          <span>FastAPI · HuggingFace · Gemini</span>
        </footer>

      </div>
    </>
  )
}

export default App