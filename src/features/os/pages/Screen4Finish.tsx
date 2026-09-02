import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useOsStore } from '../store/osStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SignaturePad } from '../components/SignaturePad';

interface Props {
  onFinish: () => void;
}

export const Screen4Finish: React.FC<Props> = ({ onFinish }) => {
  const { currentOs, updateIdentification } = useOsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);

  const handleGeneratePdf = async () => {
    if (!currentOs) return;
    setIsGenerating(true);

    try {
      // Muda o status da OS localmente (isso dispara o auto-save via Zustand)
      updateIdentification({ status: 'READY_TO_SUBMIT' });

      // Aciona o Rust para compilar o PDF pesado
      const path = await invoke<string>('generate_os_pdf', { osId: currentOs.id });
      setPdfPath(path);
      
      onFinish(); // Navega para a tela de Sucesso
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um problema ao gerar o documento final.");
    } finally {
      setIsGenerating(false);
    }
  };

  const hasSignatures = currentOs?.signatures.length === 2; // Cliente e Técnico

  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <div className="text-center mb-6 pt-3">
        <div className="w-14 h-14 bg-success rounded-xl flex items-center justify-center mx-auto mb-3">
          <FileText color="white" size={28} strokeWidth={2} />
        </div>
        <h1 className="text-[26px] font-bold text-primary mb-1">Finalização</h1>
        <p className="text-[14px] text-muted">Revise e assine a Ordem de Serviço</p>
      </div>

      <Card title="Assinaturas Finais">
        <SignaturePad type="technician" label="Assinatura do Técnico" />
        <SignaturePad type="client" label="Assinatura do Cliente" />
      </Card>

      <div className="mt-6 mb-8">
        <Button 
          variant="success" 
          onClick={handleGeneratePdf} 
          disabled={!hasSignatures || isGenerating}
          className="h-14 text-[16px]"
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <CheckCircle size={20} />
          )}
          {isGenerating ? 'Compilando Documento...' : 'Gerar PDF e Concluir'}
        </Button>
        {!hasSignatures && (
          <p className="text-center text-[12px] text-danger mt-2">
            Ambas as assinaturas são obrigatórias para concluir.
          </p>
        )}
      </div>
    </div>
  );
};