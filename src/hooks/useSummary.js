import { useState, useCallback } from 'react';
import { generateSummary } from '../services/geminiApi';

export function useSummary() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSummary = useCallback(async (text) => {
    setLoading(true);
    setError(null);
    setSummary('');

    try {
      const result = await generateSummary(text);
      setSummary(result);
    } catch (err) {
      setError(err.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    summary,
    loading,
    error,
    loadSummary,
    setError,
  };
}
