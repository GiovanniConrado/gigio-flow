import { useState, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/project/status`);
      const data = await res.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/projects`);
      const data = await res.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const fetchBoard = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/workflow/board`);
      const data = await res.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const runDiagnostics = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/system/check`);
      const data = await res.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    fetchStatus,
    fetchProjects,
    fetchBoard,
    runDiagnostics,
  };
}

export default useApi;
