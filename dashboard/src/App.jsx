import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  FolderOpen,
  RefreshCw,
  Zap,
} from 'lucide-react';

// Hooks
import useApi from './hooks/useApi';

// Components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import KanbanBoard from './components/KanbanBoard';
import CreateCardModal from './components/CreateCardModal';
import PipelineView from './components/PipelineView';
import LinearSettings from './components/LinearSettings';
import OnboardingWizard from './components/OnboardingWizard';
import SquadOrganogram from './components/SquadOrganogram';
import CeoChat from './components/CeoChat';
import RitualsGates from './components/RitualsGates';
import GuideView from './components/GuideView';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('onboarding');
  const [isNewProject, setIsNewProject] = useState(null); // null, true, false
  const [projectInitialized, setProjectInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState('dark');

  // Sidebar sections collapse state
  const [sectionsCollapsed, setSectionsCollapsed] = useState({
    workspace: false,
    workflow: false,
    squads: false
  });

  // Multi-Project Workspaces list
  const [projects, setProjects] = useState([]);
  const [activePath, setActivePath] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProj, setNewProj] = useState({
    name: '',
    folderPath: '',
    shouldCloneTemplate: true
  });

  // Strategic Project information
  const [project, setProject] = useState({
    name: '',
    mission: '',
    customerPain: '',
    proposedSolution: '',
    targetAudience: '',
    monetization: '',
    acquisition: ''
  });

  // Tech Architecture information
  const [architecture, setArchitecture] = useState({
    frontend: '',
    backend: '',
    database: '',
    thirdParty: ''
  });

  // Squads Personas state
  const [squads, setSquads] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null); // LDS Sidebar Inspector active agent

  // Kanban Board state
  const [board, setBoard] = useState({
    propostas: [],
    pendentes: [],
    'em-progresso': [],
    concluidos: []
  });

  // Rituais approvals/Workflow Gates state
  const [approvals, setApprovals] = useState({
    ceoApproval: true,
    pmApproval: true,
    ctoApproval: false
  });

  // Real LLM REST api config state
  const [llmConfig, setLlmConfig] = useState({
    apiKey: localStorage.getItem('GIGIO_LLM_KEY') || '',
    provider: localStorage.getItem('GIGIO_LLM_PROVIDER') || 'gemini'
  });
  
  const [ceoChat, setCeoChat] = useState({
    ideaTitle: '',
    ideaDescription: '',
    response: null,
    generating: false
  });

  // System Diagnostics state
  const [diagnostics, setDiagnostics] = useState({
    environment: { node: { installed: false, version: '' }, git: { installed: false, version: '' }, npm: { installed: false, version: '' } },
    folders: { aiConfig: false, squads: false, rules: false, knowledge: false, workflows: false, boards: false },
    placeholders: [],
    isHealthy: false,
    score: 100,
    loading: false
  });

  const [activeFix, setActiveFix] = useState(null); // placeholder fixing
  const [wizardStep, setWizardStep] = useState(1);
  const [notification, setNotification] = useState(null);

  // PipelineView and Modal states
  const [selectedPipelineCard, setSelectedPipelineCard] = useState(null);
  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false);
  const [createCardDefaultPhase, setCreateCardDefaultPhase] = useState('propostas');

  const triggerNotification = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Toggle theme helper
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.body.classList.toggle('light-theme', nextTheme === 'light');
  };

  // Toggle collapsible sidebar sections helper
  const toggleSection = (sec) => {
    setSectionsCollapsed(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Fetch projects workspaces
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Switch project active workspace path
  const handleSelectProject = async (pathStr) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/projects/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathStr })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification(`Alternado para o projeto local!`);
        resetCeoChat();
        setSelectedAgent(null);
        setActiveFix(null);
        await fetchStatus();
        await fetchProjects();
        await fetchBoard();
        await runDiagnostics();
      } else {
        triggerNotification("Erro ao selecionar projeto: " + data.error, "error");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Falha na ponte local.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Add and import/initialize a project workspace
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProj.name || !newProj.folderPath) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/projects/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProj)
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification(`Workspace "${newProj.name}" configurado com sucesso!`);
        setShowAddModal(false);
        setNewProj({ name: '', folderPath: '', shouldCloneTemplate: true });
        resetCeoChat();
        setSelectedAgent(null);
        await fetchStatus();
        await fetchProjects();
        await fetchBoard();
        await runDiagnostics();
      } else {
        triggerNotification("Erro ao importar: " + data.error, "error");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Falha ao comunicar com ponte.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete project from list
  const handleDeleteProject = async (pathStr, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathStr })
      });
      if (res.ok) {
        triggerNotification("Workspace desvinculado.");
        await fetchProjects();
        await fetchStatus();
        await fetchBoard();
        await runDiagnostics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch status and config MD values
  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/project/status`);
      const data = await res.json();
      
      setProjectInitialized(data.initialized);
      setActivePath(data.activePath);
      
      if (data.project) {
        setProject(data.project);
      }
      if (data.architecture) {
        setArchitecture(data.architecture);
      }
      if (data.approvals) {
        setApprovals(data.approvals);
      }

      if (data.squads) {
        setSquads(data.squads.map(s => {
          const customPart = s.rawContent.includes('## 🔮 Diretrizes Customizadas')
            ? s.rawContent.split('## 🔮 Diretrizes Customizadas')[1].trim()
            : '';
          
          let preset = 'Speedrun';
          if (customPart.includes('Enterprise') || customPart.includes('detalhad') || s.rawContent.includes('Enterprise')) {
            preset = 'Enterprise';
          }

          return {
            ...s,
            customRules: customPart,
            preset: preset
          };
        }));
      }
      
      if (data.initialized) {
        setIsNewProject(false);
      } else {
        setIsNewProject(null);
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Não foi possível conectar à ponte local do Gigio Flow.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Kanban Board
  const fetchBoard = async () => {
    try {
      const res = await fetch(`${API_BASE}/workflow/board`);
      const data = await res.json();
      setBoard(data);
    } catch (err) {
      console.error("Erro ao carregar board:", err);
    }
  };

  // Run deep system diagnostics
  const runDiagnostics = async () => {
    setDiagnostics(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE}/system/check`);
      const data = await res.json();
      setDiagnostics({
        environment: data.environment,
        folders: data.folders,
        placeholders: data.placeholders,
        isHealthy: data.isHealthy,
        score: data.score,
        loading: false
      });
    } catch (err) {
      console.error(err);
      setDiagnostics(prev => ({ ...prev, loading: false }));
    }
  };

  // Apply one-click preset template of organization
  const handleApplyTemplate = async (tempType) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/project/apply-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateType: tempType })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification(`Modelo "${tempType.toUpperCase()}" aplicado com sucesso no disco!`);
        setSelectedAgent(null);
        await fetchStatus();
        await runDiagnostics();
      } else {
        triggerNotification("Erro ao aplicar template: " + data.error, "error");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Erro de conexão.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Apply one-click pre-filled realistic organization example
  const handleApplyExample = async (exId) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/project/apply-example`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exampleId: exId })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification(`Exemplo "${data.project.name}" gravado no disco com sucesso!`);
        setSelectedAgent(null);
        await fetchStatus();
        await runDiagnostics();
      } else {
        triggerNotification("Erro ao aplicar exemplo: " + data.error, "error");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Erro de conexão com a ponte local.", "error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchProjects();
    fetchBoard();
    runDiagnostics();

    const handleKeyDown = (e) => {
      // Ignore keys inside inputs, textareas, etc.
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
      
      const key = e.key.toLowerCase();
      if (key === 'c') {
        setActiveTab('board');
        triggerNotification("Modo Ideação Ativo! Submeta seu recurso.");
      } else if (key === 'b') {
        setActiveTab('board');
        triggerNotification("Quadro de Ciclo Ativo");
      } else if (key === 'q') {
        setActiveTab('squad');
        triggerNotification("Organograma da Squad");
      } else if (key === 'g') {
        setActiveTab('guia');
        triggerNotification("Arquitetura & Guia de Engenharia");
      } else if (key === 'i') {
        setActiveTab('onboarding');
        triggerNotification("Guia de Onboarding e Configuração Inicial");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize or save project config
  const handleSaveProject = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    
    try {
      const payload = {
        project,
        architecture,
        squads: squads.map(s => ({
          id: s.id,
          isActive: s.isActive,
          customRules: s.customRules
        })),
        approvals
      };

      const res = await fetch(`${API_BASE}/project/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setProjectInitialized(true);
        setIsNewProject(false);
        triggerNotification("Configurações gravadas nos arquivos Markdown com sucesso!");
        await fetchStatus();
        await runDiagnostics();
      } else {
        triggerNotification("Erro ao salvar: " + data.error, "error");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Falha na gravação local.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Toggle squad status
  const toggleSquad = (id) => {
    setSquads(prev => prev.map(s => {
      if (s.id === id) {
        const nextActive = !s.isActive;
        if (selectedAgent && selectedAgent.id === id) {
          setSelectedAgent(prevSelected => ({ ...prevSelected, isActive: nextActive }));
        }
        return { ...s, isActive: nextActive };
      }
      return s;
    }));
  };

  // Update squad custom rules
  const handleSquadCustomRulesChange = (id, rules) => {
    setSquads(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, customRules: rules };
        if (selectedAgent && selectedAgent.id === id) {
          setSelectedAgent(prevSelected => ({ ...prevSelected, customRules: rules }));
        }
        return updated;
      }
      return s;
    }));
  };

  // Update squad preset behavior
  const handleSquadPresetChange = (id, preset) => {
    setSquads(prev => prev.map(s => {
      if (s.id === id) {
        let rulesText = s.customRules;
        if (preset === 'Enterprise') {
          rulesText = `Modo Enterprise ativo.\n- Foque em documentações densas cobrindo acessibilidade (WCAG), segurança de banco de dados, tratamento de erros resiliente e compliance.\n- Escreva especificações estritamente baseadas nos tokens de DESIGN_SYSTEM.md.`;
        } else {
          rulesText = `Modo Speedrun ativo.\n- Foque em entregar MVPs enxutos no menor tempo possível para validação imediata.\n- Evite otimizações arquiteturais complexas no início. Use o princípio de Pareto (80/20).`;
        }
        
        const updated = { ...s, preset, customRules: rulesText };
        if (selectedAgent && selectedAgent.id === id) {
          setSelectedAgent(prevSelected => ({ ...prevSelected, preset, customRules: rulesText }));
        }
        return updated;
      }
      return s;
    }));
  };

  // Save API Key in config and local storage
  const handleSaveApiConfig = (key, provider) => {
    localStorage.setItem('GIGIO_LLM_KEY', key);
    localStorage.setItem('GIGIO_LLM_PROVIDER', provider);
    setLlmConfig({ apiKey: key, provider });
    triggerNotification("API Key salva de forma segura localmente!");
  };

  // Submit idea to CEO
  const submitIdeaToCeo = async (e) => {
    e.preventDefault();
    if (!ceoChat.ideaTitle) return;

    setCeoChat(prev => ({ ...prev, generating: true, response: null }));
    
    try {
      const isRealCall = llmConfig.apiKey && llmConfig.apiKey.trim().length > 0;
      const endpoint = isRealCall ? 'approve-ceo-real' : 'approve-ceo';
      
      const payload = {
        ideaTitle: ceoChat.ideaTitle,
        ideaDescription: ceoChat.ideaDescription,
        ...(isRealCall && { apiKey: llmConfig.apiKey, provider: llmConfig.provider })
      };

      const res = await fetch(`${API_BASE}/workflow/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        setCeoChat(prev => ({ 
          ...prev, 
          generating: false, 
          response: data.parecer 
        }));
        triggerNotification(isRealCall ? "IA Real gerou um parecer estratégico real!" : "Ideia simulada gerada!");
        fetchBoard();
      } else {
        triggerNotification("Erro ao processar LLM: " + data.error, "error");
        setCeoChat(prev => ({ ...prev, generating: false }));
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Falha ao comunicar com LLM.", "error");
      setCeoChat(prev => ({ ...prev, generating: false }));
    }
  };

  // Move Kanban physical files
  const handleMoveCard = async (cardId, fromPhase, toPhase) => {
    try {
      const res = await fetch(`${API_BASE}/workflow/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, fromPhase, toPhase })
      });
      const data = await res.json();
      
      if (data.success) {
        triggerNotification(`Tarefa movida fisicamente no disco!`);
        fetchBoard();
      } else {
        triggerNotification("Erro ao mover: " + data.error, "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create card API handler
  const handleCreateCard = async ({ title, description, phase, squadId }) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/workflow/create-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, phase, squadId })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification(`Card "${title}" criado com sucesso!`);
        setIsCreateCardModalOpen(false);
        fetchBoard();
      } else {
        triggerNotification("Erro ao criar card: " + data.error, "error");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Falha na criação do card.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Open Pipeline View for a card
  const handleOpenPipeline = (cardOrId, phase) => {
    const column = board[phase];
    const cardId = typeof cardOrId === 'string' ? cardOrId : cardOrId?.id;
    const foundCard = column?.find(c => c.id === cardId);
    if (foundCard) {
      setSelectedPipelineCard({ ...foundCard, phase });
    }
  };

  // Fix template placeholder physically
  const handleFixPlaceholder = async (e) => {
    e.preventDefault();
    if (!activeFix || !activeFix.replacementText) return;

    try {
      const res = await fetch(`${API_BASE}/system/fix-placeholder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: activeFix.file,
          targetText: activeFix.targetText,
          replacementText: activeFix.replacementText
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification("Arquivo físico atualizado!");
        setActiveFix(null);
        await runDiagnostics();
        await fetchStatus();
      } else {
        triggerNotification("Erro ao preencher: " + data.error, "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetCeoChat = () => {
    setCeoChat({
      ideaTitle: '',
      ideaDescription: '',
      response: null,
      generating: false
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', gap: '15px' }}>
        <RefreshCw style={{ animation: 'spin 1.2s linear infinite', color: 'var(--accent-purple)', width: '32px', height: '32px' }} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Carregando Gigio Flow Studio V5...</p>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  // WIZARD INITIAL SETUP (NEW PROJECT)
  if (isNewProject === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '20px' }}>
        <div className="glass-card animate-slide-in" style={{ maxWidth: '640px', width: '100%', textAlign: 'center', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '35px' }}>
          <div style={{ display: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            <div style={{ background: 'var(--accent-purple)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(94,106,210,0.3)', margin: '0 auto' }}>
              <Sparkles style={{ color: '#fff', width: '28px', height: '28px' }} />
            </div>
          </div>
          
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Gigio Flow Studio <span style={{ fontSize: '0.85rem', verticalAlign: 'super', color: 'var(--accent-purple)', fontWeight: 700 }}>V5</span>
          </h1>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '28px', maxWidth: '500px', margin: '0 auto 28px' }}>
            Orquestrador e Painel de Controle de alto nível para Squads de IA. Gerencie múltiplos side-projects de forma compacta e sincronizada fisicamente no disco.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', textAlign: 'left', marginBottom: '15px' }}>
            <div 
              onClick={() => {
                setIsNewProject(false);
                triggerNotification("Carregando contexto dos Markdowns atuais...");
              }}
              className="glass-card" 
              style={{ cursor: 'pointer', border: '1px solid var(--border-color)', padding: '20px', background: 'var(--bg-primary)' }}
            >
              <div style={{ color: 'var(--accent-purple)', marginBottom: '12px' }}>
                <FolderOpen size="24" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Projeto Existente</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                Escaneie o workspace atual do Gigio Flow. Carregará a identidade de VISAO, ARQUITETURA e squads físicas do disco.
              </p>
            </div>

            <div 
              onClick={() => {
                setIsNewProject(true);
                setWizardStep(1);
                setProject({ name: '', mission: '', customerPain: '', proposedSolution: '', targetAudience: '', monetization: '', acquisition: '' });
                setArchitecture({ frontend: '', backend: '', database: '', thirdParty: '' });
              }}
              className="glass-card" 
              style={{ cursor: 'pointer', border: '1px solid var(--border-color)', padding: '20px', background: 'var(--bg-primary)' }}
            >
              <div style={{ color: 'var(--accent-purple)', marginBottom: '12px' }}>
                <Plus size="24" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Novo Projeto</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                Inicialize um novo side-project. Crie pastas, defina as stacks, configure o contexto de negócios inicial e crie tudo no disco.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleFieldChange = (field, val, isArch = false) => {
    if (isArch) {
      setArchitecture(prev => ({ ...prev, [field]: val }));
    } else {
      setProject(prev => ({ ...prev, [field]: val }));
    }
  };

  return (
    <div className="dashboard-grid">
      
      {/* SUCCESS NOTIFICATION TOAST */}
      {notification && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          background: notification.type === 'error' ? 'var(--accent-red)' : 'var(--accent-green)',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: '4px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 99999,
          fontSize: '12px',
          fontWeight: 600,
          backdropFilter: 'blur(10px)',
          animation: 'slideInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          {notification.text}
        </div>
      )}

      {/* SIDEBAR COMPONENT */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        project={project}
        projects={projects}
        activePath={activePath}
        theme={theme}
        toggleTheme={toggleTheme}
        sectionsCollapsed={sectionsCollapsed}
        toggleSection={toggleSection}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        handleSelectProject={handleSelectProject}
        handleDeleteProject={handleDeleteProject}
        notification={notification}
        setIsNewProject={setIsNewProject}
      />

      {/* MODAL TO ADD/IMPORT AN ACTIVE WORKSPACE */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div className="glass-card animate-slide-in" style={{ maxWidth: '520px', width: '90%', border: '1px solid var(--border-focus)', background: 'var(--bg-secondary)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>📁 Vincular ou Criar Novo Workspace</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                X
              </button>
            </div>

            <form onSubmit={handleAddProject}>
              <div className="form-group">
                <label>Nome do Workspace / Startup</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: Meu Site, SaaS de Vendas..." 
                  value={newProj.name}
                  onChange={e => setNewProj({ ...newProj, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Caminho Absoluto Local no Disco</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ex: C:\Users\conra\Desktop\meu-outro-site" 
                  value={newProj.folderPath}
                  onChange={e => setNewProj({ ...newProj, folderPath: e.target.value })}
                  required
                />
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  O servidor criará a pasta automaticamente caso ela ainda não exista.
                </span>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <input 
                  type="checkbox" 
                  id="shouldClone"
                  checked={newProj.shouldCloneTemplate}
                  onChange={e => setNewProj({ ...newProj, shouldCloneTemplate: e.target.checked })}
                  style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                />
                <label htmlFor="shouldClone" style={{ cursor: 'pointer', marginBottom: 0, fontSize: '0.75rem', textTransform: 'none', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Copiar/Clonar toda a estrutura padrão de IA e Rituais do Gigio Flow
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} disabled={saving}>
                  {saving ? 'Criando...' : 'Adicionar Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CARD MODAL */}
      <CreateCardModal 
        isOpen={isCreateCardModalOpen}
        defaultPhase={createCardDefaultPhase}
        onClose={() => setIsCreateCardModalOpen(false)}
        onSubmit={handleCreateCard}
        squads={squads}
        saving={saving}
      />

      {/* PIPELINE VIEW */}
      {selectedPipelineCard && (
        <PipelineView 
          card={selectedPipelineCard}
          llmConfig={llmConfig}
          onClose={() => setSelectedPipelineCard(null)}
          onMoveCard={handleMoveCard}
          onRefresh={fetchBoard}
          triggerNotification={triggerNotification}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="dashboard-content" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        
        {/* TOP BAR */}
        <TopBar 
          activeTab={activeTab}
          triggerNotification={triggerNotification}
        />

        {/* CONTENT ENVELOPE */}
        <div style={{ padding: '24px 30px', flex: 1, overflowY: 'auto' }}>
          
          {/* 1. ONBOARDING WIZARD */}
          {activeTab === 'onboarding' && (
            <OnboardingWizard 
              project={project}
              architecture={architecture}
              squads={squads}
              approvals={approvals}
              llmConfig={llmConfig}
              saving={saving}
              wizardStep={wizardStep}
              setWizardStep={setWizardStep}
              onSave={handleSaveProject}
              onChange={handleFieldChange}
              onApplyExample={handleApplyExample}
              onApplyTemplate={handleApplyTemplate}
              onSaveApiConfig={handleSaveApiConfig}
              onSquadChange={handleSquadCustomRulesChange}
              triggerNotification={triggerNotification}
              board={board}
              setActiveTab={setActiveTab}
            />
          )}

          {/* 2. KANBAN BOARD & CEO IDEATION */}
          {activeTab === 'board' && (
            <div className="animate-slide-in">
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quadro de Engenharia</span>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 600, margin: 0 }}>Ciclo Estratégico Ativo</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4', margin: 0 }}>
                    Visualize os cartões físicos da esteira mapeados diretamente do disco. Clique em qualquer card para abrir seu Pipeline de Entrega com etapas e gates.
                  </p>
                </div>

                {/* CEO Chat Component for Ideation */}
                <CeoChat 
                  ceoChat={ceoChat}
                  llmConfig={llmConfig}
                  board={board}
                  onSubmit={submitIdeaToCeo}
                  onReset={resetCeoChat}
                  onMoveCard={handleMoveCard}
                  triggerNotification={triggerNotification}
                />
              </div>

              {/* Kanban Board Component */}
              <KanbanBoard 
                board={board}
                onMoveCard={handleMoveCard}
                onCreateCard={(phase) => {
                  setCreateCardDefaultPhase(phase);
                  setIsCreateCardModalOpen(true);
                }}
                onOpenPipeline={handleOpenPipeline}
              />
            </div>
          )}

          {/* 3. SQUAD ORGANOGRAM */}
          {activeTab === 'squad' && (
            <SquadOrganogram 
              squads={squads}
              selectedAgent={selectedAgent}
              setSelectedAgent={setSelectedAgent}
              onToggleSquad={toggleSquad}
              onSquadCustomRulesChange={handleSquadCustomRulesChange}
              onSquadPresetChange={handleSquadPresetChange}
              saving={saving}
              onSave={handleSaveProject}
              project={project}
            />
          )}

          {/* 4. RITUALS AND GATES CONFIG */}
          {activeTab === 'config' && (
            <RitualsGates 
              approvals={approvals}
              setApprovals={setApprovals}
              saving={saving}
              onSave={handleSaveProject}
              triggerNotification={triggerNotification}
            />
          )}

          {/* 5. ARCHITECTURE & DIAGNOSTICS */}
          {activeTab === 'guia' && (
            <GuideView 
              diagnostics={diagnostics}
              activeFix={activeFix}
              setActiveFix={setActiveFix}
              onFixPlaceholder={handleFixPlaceholder}
              onRunDiagnostics={runDiagnostics}
              project={project}
              architecture={architecture}
              llmConfig={llmConfig}
              onSaveApiConfig={handleSaveApiConfig}
              triggerNotification={triggerNotification}
            />
          )}

          {/* 6. LINEAR INTEGRATIONS */}
          {activeTab === 'linear' && (
            <LinearSettings 
              triggerNotification={triggerNotification}
            />
          )}

        </div>

        {/* KEYBOARD SHORTCUTS FOOTER */}
        <footer style={{ 
          height: '24px', 
          borderTop: '1px solid var(--border-color)', 
          background: 'var(--bg-secondary)', 
          padding: '0 20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          fontSize: '0.68rem', 
          color: 'var(--text-muted)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span>Sugestões de Atalhos:</span>
            <span><kbd style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '2px', padding: '1px 3px' }}>I</kbd> Configuração Inicial</span>
            <span><kbd style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '2px', padding: '1px 3px' }}>B</kbd> Quadro de Ciclo Ativo</span>
            <span><kbd style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '2px', padding: '1px 3px' }}>Q</kbd> Organograma Squad</span>
            <span><kbd style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '2px', padding: '1px 3px' }}>G</kbd> Arquitetura &amp; Guia</span>
          </div>
          <div>
            <span>Gigio Flow Studio V5 (Ultimate Linear Edition)</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
