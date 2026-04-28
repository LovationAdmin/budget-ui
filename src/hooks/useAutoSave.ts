import { useEffect, useRef, useCallback, useState } from 'react';

interface UseAutoSaveOptions {
  onSave: () => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  markAsModified: () => void;
  saveNow: () => Promise<void>;
}

export function useAutoSave({
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInProgressRef = useRef(false);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const performSave = useCallback(async () => {
    if (saveInProgressRef.current) {
      console.log('⏸️ [AutoSave] Sauvegarde déjà en cours, skip');
      return;
    }

    try {
      saveInProgressRef.current = true;
      setIsSaving(true);
      console.log('💾 [AutoSave] Début de la sauvegarde...');
      
      await onSave();
      
      // ✅ CORRECTIF : Réinitialiser hasUnsavedChanges après succès
      setHasUnsavedChanges(false);
      console.log('✅ [AutoSave] Données sauvegardées avec succès');
    } catch (error) {
      console.error('❌ [AutoSave] Erreur lors de la sauvegarde:', error);
      // Ne pas réinitialiser hasUnsavedChanges en cas d'erreur
      throw error;
    } finally {
      saveInProgressRef.current = false;
      setIsSaving(false);
    }
  }, [onSave]);

  const markAsModified = useCallback(() => {
    if (!enabled) return;

    setHasUnsavedChanges(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      console.log(`⏰ [AutoSave] Déclenchement auto-save après ${delay} ms`);
      performSave();
    }, delay);
  }, [enabled, delay, performSave]);

  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    await performSave();
  }, [performSave]);

  // ✅ CORRECTIF : beforeunload seulement si hasUnsavedChanges ET pas en train de sauvegarder
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !saveInProgressRef.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, hasUnsavedChanges]);

  return {
    hasUnsavedChanges,
    isSaving,
    markAsModified,
    saveNow,
  };
}