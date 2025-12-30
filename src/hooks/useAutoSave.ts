import { useEffect, useRef, useCallback, useState } from 'react';

interface UseAutoSaveOptions {
  onSave: () => Promise<void>;
  delay?: number; // délai en ms avant auto-save (défaut: 2000ms)
  enabled?: boolean;
}

/**
 * Hook pour gérer l'auto-save avec:
 * - Debouncing des modifications
 * - Sauvegarde avant fermeture de la page
 * - Indicateur de modifications non sauvegardées
 */
export function useAutoSave({ onSave, delay = 2000, enabled = true }: UseAutoSaveOptions) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveInProgressRef = useRef(false);

  // Fonction de sauvegarde avec protection contre les appels multiples
  const executeSave = useCallback(async () => {
    if (saveInProgressRef.current || !hasUnsavedChanges) {
      return;
    }

    saveInProgressRef.current = true;
    setIsSaving(true);

    try {
      await onSave();
      setHasUnsavedChanges(false);
      console.log('✅ [AutoSave] Données sauvegardées avec succès');
    } catch (error) {
      console.error('❌ [AutoSave] Erreur lors de la sauvegarde:', error);
      // On garde hasUnsavedChanges à true en cas d'erreur
    } finally {
      setIsSaving(false);
      saveInProgressRef.current = false;
    }
  }, [onSave, hasUnsavedChanges]);

  // Fonction pour marquer qu'il y a des modifications
  const markAsModified = useCallback(() => {
    if (!enabled) return;

    setHasUnsavedChanges(true);

    // Annuler le timeout précédent
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Planifier une nouvelle sauvegarde
    saveTimeoutRef.current = setTimeout(() => {
      console.log('⏰ [AutoSave] Déclenchement auto-save après', delay, 'ms');
      executeSave();
    }, delay);
  }, [enabled, delay, executeSave]);

  // Sauvegarder immédiatement (pour les boutons "Sauvegarder")
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    await executeSave();
  }, [executeSave]);

  // Sauvegarde avant fermeture/rafraîchissement de la page
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !saveInProgressRef.current) {
        // Tenter une sauvegarde synchrone (ne fonctionne pas toujours)
        executeSave();

        // Afficher le message de confirmation du navigateur
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, hasUnsavedChanges, executeSave]);

  // Cleanup du timeout
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    hasUnsavedChanges,
    isSaving,
    markAsModified,
    saveNow,
  };
}