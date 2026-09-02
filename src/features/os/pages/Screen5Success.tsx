import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { CheckCircle2, Wifi, WifiOff, RefreshCw, PlusCircle } from 'lucide-react';
import { useOsStore } from '../store/osStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export const Screen5Success: React.FC = () => {
  const { currentOs, initNewOs } = useOsStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerAutoSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Tenta sincronizar automaticamente ao carregar se houver internet
    if (isOnline) {
      triggerAutoSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerAutoSync = async () => {
    if (isSyncing || !currentOs) return;
    setIsSyncing(true);
    setSyncMessage('Sincronizando com o servidor...');

    try {
      const count = await invoke<number>('process_sync_queue');
      if (count > 0) {
        setSyncMessage('Sincronizado com sucesso!');
      } else {
        setSyncMessage('Nenhuma OS pendente na fila.');
      }
    } catch (error) {
      console.error("Erro na sincronização:", error);
      setSyncMessage('Sem conexão. Salvo localmente para envio posterior.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="animate-[fadeIn_0.25s_ease] text-center pt-6">
      <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
        <CheckCircle2 color="white" size={36} strokeWidth={2.5} />
      </div>

      <h1 className="text-[24px] font-bold text-primary mb-1">Atendimento Concluído!</h1>
      <p className="text-[14px] text-muted mb-6">O relatório técnico e as mídias foram processados com segurança.</p>

      <Card>
        <div className="flex items-center justify-between py-2 border-b border-border text-[14px]">
          <span className="text-secondary">Chamado GLPI:</span>
          <span className="font-semibold text-primary">{currentOs?.glpi_ticket_id}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border text-[14px]">
          <span className="text-secondary">Status de Rede:</span>
          <span className={`flex items-center gap-1 font-medium ${isOnline ? 'text-success' : 'text-warning'}`}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isOnline ? 'Online' : 'Offline (Armazenado localmente)'}
          </span>
        </div>
        <div className="py-3 text-center text-[13px] text-muted">
          {syncMessage || (currentOs?.status === 'SYNCED' ? 'Sincronizado' : 'Aguardando envio')}
        </div>
      </Card>

      <div className="mt-8 space-y-3">
        <Button variant="secondary" onClick={triggerAutoSync} disabled={isSyncing}>
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Enviando...' : 'Forçar Sincronização'}
        </Button>

        <Button onClick={initNewOs}>
          <PlusCircle size={16} />
          Iniciar Nova Ordem de Serviço
        </Button>
      </div>
    </div>
  );
};