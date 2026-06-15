import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import TopBar from './components/TopBar';
import Monitor from './components/Monitor';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Project state (minimal — just for display)
  const [project, setProject] = useState({ name: '...', mission: '' });
  const [board, setBoard] = useState({ propostas: [], pendentes: [] });

  const triggerNotification = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.body.classList.toggle('light-theme', next === 'light');
  };

  const fetchProject = async () => {
    try {
      const res = await fetch(`${API_BASE}/project/status`);
      const data = await res.json();
      if (data.project) setProject(data.project);
    } catch { triggerNotification('Falha ao carregar workspace', 'error'); }
  };

  const fetchBoard = async () => {
    try {
      const data = await (await fetch(`${API_BASE}/workflow/board`)).json();
      setBoard({ propostas: data.propostas || [], pendentes: data.pendentes || [] });
    } catch {}
  };

  useEffect(() => {
    Promise.all([fetchProject(), fetchBoard()]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', gap: '15px' }}>
        <RefreshCw style={{ animation: 'spin 1.2s linear infinite', color: 'var(--accent-purple)', width: '32px', height: '32px' }} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem' }}>Gigio Flow Studio</p>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {/* Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 99999,
          background: notification.type === 'error' ? 'var(--accent-red)' : 'var(--accent-green)',
          color: '#fff', padding: '10px 18px', borderRadius: '4px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', gap: '8px',
          fontSize: '12px', fontWeight: 600,
          animation: 'slideInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}>
          {notification.text}
        </div>
      )}

      <main className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TopBar project={project} board={board} theme={theme} toggleTheme={toggleTheme} />
        <div style={{ padding: '24px 30px', flex: 1, overflowY: 'auto' }}>
          <Monitor project={project} board={board} triggerNotification={triggerNotification} />
        </div>
      </main>
    </div>
  );
}

export default App;
