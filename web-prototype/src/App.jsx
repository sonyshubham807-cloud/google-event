import { useState, useEffect, useRef } from 'react';
import './index.css';

// Mock Data Banks
const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'alert', text: 'Gate C wait time is now under 5 minutes.', time: 'Just now' },
  { id: 2, type: 'info', text: 'Halftime show starts in 15 minutes.', time: '2m ago' },
];

const RANDOM_EVENTS = [
  { type: 'info', text: 'Merchandise stand near Gate A is offering 20% off.' },
  { type: 'alert', text: 'Parking Lot C is now full.' },
  { type: 'warning', text: 'Heavy traffic near main exit escalators.' },
  { type: 'info', text: 'Player warmup starting on the field.' },
  { type: 'alert', text: 'Fast-pass entry available at Gate D now.' }
];

// --- Top Status Bar Component ---
function TopStatusBar({ crowdLevel }) {
  return (
    <div className="status-bar">
      <div className="status-badge" style={{ color: crowdLevel === 'High' ? 'var(--color-danger)' : 'var(--color-success)' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></span>
        Crowd: {crowdLevel}
      </div>
      <div>
        Est. Wait: <span style={{ color: 'var(--color-warning)' }}>4 mins</span>
      </div>
      <div style={{ color: 'var(--accent-cyan)' }}>
        ● Live
      </div>
    </div>
  );
}

// --- API Cricket Scorecard ---
function LiveScorecard() {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const response = await fetch('https://free-cricbuzz-cricket-api.p.rapidapi.com/cricket-match-info?matchid=102040', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'free-cricbuzz-cricket-api.p.rapidapi.com',
            'x-rapidapi-key': 'xBHaBGlGH3Jsbpu5HSNkAWHSi5Ulpn8yibntggimUzthXDuJfdEacCipnMhh'
          }
        });
        const result = await response.json();
        
        // Force fallback if rapidapi gives an error payload instead of data
        if (!response.ok || !result.matchInfo) {
          throw new Error("API Limit Reached or Missing matchInfo");
        }
        
        // Set standard cricket format or fallback to result if format differs
        setMatchData(result); 
        setLoading(false);
      } catch (error) {
        console.error("API Error:", error);
        // Fallback Mock Data if API limits are hit or matchid is expired
        setMatchData({
          matchInfo: { team1: { name: 'Royal Challengers Bengaluru', shortName: 'RCB' }, team2: { name: 'Gujarat Titans', shortName: 'GT' }, status: 'RCB need 24 runs in 12 balls' },
          matchScore: { team1Score: { inngs1: { runs: 185, wickets: 3, overs: 18.0 } }, team2Score: { inngs1: { runs: 208, wickets: 5, overs: 20.0 } } }
        });
        setLoading(false);
      }
    };
    fetchScore();
    const poll = setInterval(fetchScore, 60000); // Poll every minute
    return () => clearInterval(poll);
  }, []);

  if (loading) return <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', color: 'var(--accent-cyan)' }}>Loading Live Score...</div>;

  // Adaptive data parsing depending on real API response shape
  const team1 = matchData?.matchInfo?.team1?.shortName || matchData?.team1 || 'T1';
  const team2 = matchData?.matchInfo?.team2?.shortName || matchData?.team2 || 'T2';
  const status = matchData?.matchInfo?.status || matchData?.status || 'Match in progress';
  
  // Safe extraction for mock structure
  const t1Score = matchData?.matchScore?.team1Score?.inngs1 ? `${matchData.matchScore.team1Score.inngs1.runs}/${matchData.matchScore.team1Score.inngs1.wickets} (${matchData.matchScore.team1Score.inngs1.overs})` : 'Batting...';
  const t2Score = matchData?.matchScore?.team2Score?.inngs1 ? `${matchData.matchScore.team2Score.inngs1.runs}/${matchData.matchScore.team2Score.inngs1.wickets} (${matchData.matchScore.team2Score.inngs1.overs})` : 'Waiting...';

  return (
    <div className="glass-panel stat-card" style={{ padding: '25px', background: 'linear-gradient(145deg, rgba(13,15,20,0.8) 0%, rgba(0,240,255,0.08) 100%)', border: '1px solid var(--accent-cyan)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, padding: '5px 10px', background: 'var(--color-danger)', fontSize: '0.6rem', fontWeight: 'bold', borderBottomLeftRadius: '10px' }}>LIVE 🔴</div>
      
      <h3 style={{ fontSize: '1rem', color: 'var(--accent-cyan)', marginBottom: '15px', fontWeight: '800' }}>TATA IPL ACTION CENTER</h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>{team1}</span>
          <span style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>{t1Score}</span>
        </div>
        
        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>VS</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'right' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>{team2}</span>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>{t2Score}</span>
        </div>
      </div>
      
      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--glass-border)' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-warning)', fontWeight: '600' }}>{status}</p>
      </div>
    </div>
  );
}

// --- Live Dashboard Component ---
function LiveDashboard({ notifications }) {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '25px', paddingTop: '10px' }}>
      
      <LiveScorecard />

      {/* Modular Cards Grid */}
      <div className="dashboard-grid" style={{ marginBottom: '5px' }}>
        <div className="glass-panel stat-card">
          <span className="stat-card-title">Nearest Gate</span>
          <span className="stat-card-value" style={{ color: 'var(--accent-cyan)' }}>Gate B</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-success)' }}>Walk: 2 mins</span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-card-title">Shortest Queue</span>
          <span className="stat-card-value" style={{ color: 'var(--color-warning)' }}>Sec 112</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Food / Drink</span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Recommended Path</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
          Avoid the main concourse. Take the <strong>East Foyer Escalators</strong> to reach your seat faster based on current thermal density.
        </p>
        <button className="btn-primary" style={{ marginTop: '10px', fontSize: '0.9rem', padding: '10px' }}>View Route on Map</button>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Live Stadium Updates</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }} className="pulse-text">Auto-refreshing...</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {notifications.slice(0, 3).map(note => (
            <div key={note.id} className="animate-fade-in glass-panel" style={{ padding: '15px', borderLeft: `3px solid ${note.type === 'alert' ? 'var(--color-success)' : note.type === 'warning' ? 'var(--color-danger)' : 'var(--accent-cyan)'}` }}>
              <p style={{ fontSize: '0.95rem' }}>{note.text}</p>
              {note.time && <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px' }}>{note.time}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Interactive Map Component ---
function HeatmapView() {
  const [scale, setScale] = useState({ red: 60, yellow: 50, green: 40 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setScale({
        red: 50 + Math.random() * 30,
        yellow: 40 + Math.random() * 25,
        green: 30 + Math.random() * 20
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleZoom = (direction) => {
    setZoom(prev => Math.min(Math.max(prev + direction * 0.2, 1), 2.5));
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '10px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.3rem' }}>Stadium Matrix</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleZoom(-1)} className="glass-panel" style={{ width: '30px', height: '30px', border: 'none', color: '#fff', cursor: 'pointer' }}>-</button>
          <button onClick={() => handleZoom(1)} className="glass-panel" style={{ width: '30px', height: '30px', border: 'none', color: '#fff', cursor: 'pointer' }}>+</button>
        </div>
      </div>
      
      <div className="glass-panel" style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, var(--bg-tertiary) 0%, var(--bg-primary) 100%)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Interactive Zoom Wrapper */}
        <div style={{ 
            transition: 'transform 0.3s ease', 
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            width: '100%', height: '100%', position: 'absolute' 
        }}>
           {/* Proper Stadium Map Layout */}
           <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.25 }}>
             {/* Outer Stadium Track */}
             <rect x="10%" y="15%" width="80%" height="70%" rx="50" stroke="var(--accent-cyan)" strokeWidth="2" fill="none" />
             {/* Inner Concourses */}
             <rect x="20%" y="25%" width="60%" height="50%" rx="35" stroke="var(--text-secondary)" strokeWidth="1" fill="none" strokeDasharray="4,4" />
             {/* Center Field */}
             <rect x="35%" y="35%" width="30%" height="30%" rx="8" fill="var(--accent-cyan)" opacity="0.1" stroke="var(--accent-cyan)" strokeWidth="1" />
           </svg>

           {/* High Density Heatmap Cluster (properly managed) */}
           {/* Section North (High Traffic) */}
           <div className="heatmap-zone" style={{ top: '12%', left: '40%', width: `${scale.red * 1.5}px`, height: `${scale.red * 1.2}px`, background: 'var(--color-danger)', animation: 'intensePulse 4s infinite' }}></div>
           <div className="heatmap-zone" style={{ top: '15%', left: '55%', width: `${scale.red}px`, height: `${scale.red}px`, background: 'var(--color-warning)' }}></div>
           
           {/* Section East (Clear) */}
           <div className="heatmap-zone" style={{ top: '35%', right: '15%', width: `${scale.green}px`, height: `${scale.green * 1.5}px`, background: 'var(--color-success)', opacity: 0.6 }}></div>
           <div className="heatmap-zone" style={{ top: '50%', right: '18%', width: `${scale.green}px`, height: `${scale.green}px`, background: 'var(--color-success)', opacity: 0.5 }}></div>
           
           {/* Section South (Moderate to High) */}
           <div className="heatmap-zone" style={{ bottom: '15%', left: '30%', width: `${scale.yellow * 1.3}px`, height: `${scale.yellow * 1.3}px`, background: 'var(--color-warning)', opacity: 0.8 }}></div>
           <div className="heatmap-zone" style={{ bottom: '12%', left: '50%', width: `${scale.red * 1.1}px`, height: `${scale.red}px`, background: 'var(--color-danger)' }}></div>
           
           {/* Section West (Clear to Moderate) */}
           <div className="heatmap-zone" style={{ top: '40%', left: '15%', width: `${scale.green * 1.5}px`, height: `${scale.green}px`, background: 'var(--color-success)', opacity: 0.5 }}></div>
           <div className="heatmap-zone" style={{ top: '55%', left: '18%', width: `${scale.yellow}px`, height: `${scale.yellow}px`, background: 'var(--color-warning)', opacity: 0.6 }}></div>

           {/* Gate Entrances Labels */}
           <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translate(-50%, 0)', color: 'var(--text-secondary)', fontSize: '0.6rem', fontWeight: 'bold' }}>N GATE</div>
           <div style={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translate(-50%, 0)', color: 'var(--text-secondary)', fontSize: '0.6rem', fontWeight: 'bold' }}>S GATE</div>
           <div style={{ position: 'absolute', top: '50%', left: '2%', transform: 'translate(0, -50%)', color: 'var(--text-secondary)', fontSize: '0.6rem', fontWeight: 'bold' }}>W GATE</div>
           <div style={{ position: 'absolute', top: '50%', right: '2%', transform: 'translate(0, -50%)', color: 'var(--text-secondary)', fontSize: '0.6rem', fontWeight: 'bold' }}>E GATE</div>
           
           {/* Highlighted Path overlay (Proper alignment to gates) */}
           <svg width="100%" height="100%" style={{ position: 'absolute', zIndex: 5, pointerEvents: 'none' }}>
             {/* Entering from West Gate to Center Field Area */}
             <path d="M 40 175 C 80 175, 100 120, 168 122" fill="none" stroke="var(--accent-cyan)" strokeWidth="3" strokeDasharray="5,5" style={{ filter: 'drop-shadow(0 0 5px rgba(0,240,255,0.8))' }} />
             {/* Pin at entrance */}
             <circle cx="40" cy="175" r="4" fill="white" />
             {/* Pin at destination */}
             <circle cx="168" cy="122" r="6" fill="var(--accent-cyan)" />
             <circle cx="168" cy="122" r="3" fill="var(--bg-primary)" />
           </svg>
        </div>
      </div>

      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-around', padding: '15px 10px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600 }}><span style={{width:'8px', height:'8px', background:'var(--color-success)', borderRadius:'50%', boxShadow: '0 0 5px var(--color-success)'}}></span> CLEAR</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600 }}><span style={{width:'8px', height:'8px', background:'var(--color-warning)', borderRadius:'50%', boxShadow: '0 0 5px var(--color-warning)'}}></span> MODERATE</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600 }}><span style={{width:'8px', height:'8px', background:'var(--accent-magenta)', borderRadius:'50%', boxShadow: '0 0 5px var(--accent-magenta)'}}></span> CONGESTED</span>
      </div>
    </div>
  );
}

// --- Queuing Component ---
function QueuingView() {
  const [inQueue, setInQueue] = useState(false);
  const [timeLeft, setTimeLeft] = useState(8 * 60);

  useEffect(() => {
    let interval;
    if (inQueue && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [inQueue, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '10px' }}>
      <h2 style={{ fontSize: '1.3rem' }}>Fast-Pass Network</h2>
      
      <div className="glass-panel stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Section 112 Restrooms</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Current Walk: 2 mins</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.8rem', fontFamily: 'Outfit', fontWeight: '800', color: inQueue && timeLeft <= 0 ? 'var(--color-success)' : 'var(--color-warning)', textShadow: inQueue && timeLeft <= 0 ? '0 0 10px rgba(16,185,129,0.4)' : 'none' }}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{inQueue ? 'Time Remaining' : 'Est. Wait'}</p>
          </div>
        </div>
        
        <button 
          className="btn-primary" 
          style={{ 
            background: inQueue ? 'var(--bg-tertiary)' : 'var(--accent-gradient)', 
            color: inQueue ? 'var(--color-success)' : 'white',
            border: inQueue ? '1px solid var(--color-success)' : 'none',
            boxShadow: inQueue ? '0 0 15px rgba(16,185,129,0.2)' : 'none'
          }}
          onClick={() => { if(!inQueue) setInQueue(true) }}
          disabled={inQueue}
        >
          {inQueue ? (timeLeft > 0 ? '✓ IN VIRTUAL QUEUE' : '🎉 READY FOR ENTRY') : 'JOIN VIRTUAL QUEUE'}
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Express Mobile Ordering</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>Order food & drinks directly to your seat avoiding any physical lines.</p>
        <button className="glass-panel" style={{ width: '100%', padding: '12px', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', background: 'transparent', fontWeight: 600, cursor: 'pointer' }}>Browse Nearest Menu</button>
      </div>
    </div>
  );
}

// --- Alerts Component ---
function AlertsView({ notifications }) {
    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingTop: '10px' }}>
            <h2 style={{ fontSize: '1.3rem' }}>Action Center</h2>
            {notifications.map(note => (
            <div key={note.id} className="glass-panel" style={{ padding: '15px', borderLeft: `3px solid ${note.type === 'alert' ? 'var(--color-success)' : note.type === 'warning' ? 'var(--color-danger)' : 'var(--accent-cyan)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: note.type === 'alert' ? 'var(--color-success)' : 'var(--accent-cyan)' }}>{note.type}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{note.time || 'Just now'}</span>
                </div>
                <p style={{ fontSize: '0.95rem' }}>{note.text}</p>
            </div>
            ))}
        </div>
    );
}

// --- Main App Shell ---
export default function App() {
  const [activeTab, setActiveTab] = useState('live');
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Global random data feed simulator
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      setNotifications(prev => {
        if (prev.length > 8) prev.pop(); 
        return [{ id: Date.now(), time: 'Just now', ...newEvent }, ...prev];
      });
    }, 12000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <TopStatusBar crowdLevel="Moderate" />
      
      <header className="app-header">
        <h1 className="brand-title">Venue<span>Sync</span></h1>
        <div style={{ width: '38px', height: '38px', background: 'var(--bg-tertiary)', border: '1px solid var(--accent-cyan)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)' }}>
          👤
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'live' && <LiveDashboard notifications={notifications} />}
        {activeTab === 'map' && <HeatmapView />}
        {activeTab === 'queue' && <QueuingView />}
        {activeTab === 'alerts' && <AlertsView notifications={notifications} />}
      </main>

      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'live' ? 'active' : ''}`} onClick={() => setActiveTab('live')}>
          <span className="nav-icon">📊</span> Live
        </button>
        <button className={`nav-item ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
          <span className="nav-icon">🗺️</span> Map
        </button>
        <button className={`nav-item ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>
          <span className="nav-icon">⚡</span> Queue
        </button>
        <button className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
          <span className="nav-icon">🔔</span> Alerts {notifications.length > 2 && <span style={{position:'absolute', top: 5, right: 15, background:'var(--accent-magenta)', width:8, height:8, borderRadius:'50%'}}></span>}
        </button>
      </nav>
    </div>
  );
}
