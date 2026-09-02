import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useOsStore } from '../store/osStore';

export const useAutoSave = () => {
  useEffect(() => {
    // Subscreve às mudanças do estado currentOs
    const unsubscribe = useOsStore.subscribe(
      (state) => state.currentOs,
      (currentOs, previousOs) => {
        if (!currentOs) return;
        
        // Evita salvar se a OS for exatamente a mesma referência ou se for a inicialização
        if (currentOs === previousOs) return;

        // Implementação do DEBOUNCE
        // No mundo real (Lote 4), usaremos setTimeout para não flodar o Tauri Bridge.
        // Simulando o comportamento:
        const timeoutId = setTimeout(() => {
          console.log('[Auto-Save] Chamando Tauri Command para salvar no SQLite...', {
            osId: currentOs.id,
            step: currentOs.current_step,
            updated_at: currentOs.updated_at
          });
          // invoke('save_os_to_sqlite', { os: currentOs })
        }, 1000); // 1 segundo de debounce após a última digitação do usuário

        return () => clearTimeout(timeoutId);
      }
    );

    return () => unsubscribe();
  }, []);

useEffect(() => {
    const unsubscribe = useOsStore.subscribe(
      (state) => state.currentOs,
      (currentOs, previousOs) => {
        if (!currentOs || currentOs === previousOs) return;

        const timeoutId = setTimeout(async () => {
          try {
            await invoke('save_os_to_sqlite', { os: currentOs });
            console.log('[Auto-Save] OS persistida com sucesso no SQLite.');
          } catch (error) {
            console.error('[Auto-Save] Erro ao salvar OS:', error);
          }
        }, 800); // 800ms de debounce

        return () => clearTimeout(timeoutId);
      }
    );

    return () => unsubscribe();
  }, []);

};