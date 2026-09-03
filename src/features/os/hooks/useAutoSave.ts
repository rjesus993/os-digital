import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useOsStore } from '../store/osStore';

export const useAutoSave = () => {
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Subscreve às mudanças do estado currentOs
    const unsubscribe = useOsStore.subscribe(
      (state) => state.currentOs,
      (currentOs, previousOs) => {
        if (!currentOs || currentOs === previousOs) return;

        // Limpa o timeout anterior para implementar o debounce
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        // Implementação do DEBOUNCE
        // A cada mudança, agendamos um novo timeout e cancelamos o anterior
        debounceTimeoutRef.current = setTimeout(async () => {
          try {
            console.log('[Auto-Save] Chamando Tauri Command para salvar no SQLite...', {
              osId: currentOs.id,
              step: currentOs.current_step,
              updated_at: currentOs.updated_at
            });
            
            await invoke('save_os_to_sqlite', { os: currentOs });
            console.log('[Auto-Save] OS persistida com sucesso no SQLite.');
          } catch (error) {
            console.error('[Auto-Save] Erro ao salvar OS:', error);
          } finally {
            debounceTimeoutRef.current = null;
          }
        }, 800); // 800ms de debounce após a última alteração
      }
    );

    // Cleanup: remove a subscrição e limpa qualquer timeout pendente
    return () => {
      unsubscribe();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
};