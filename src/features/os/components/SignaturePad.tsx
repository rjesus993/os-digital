import React, { useRef, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { CheckCircle, X, PenTool } from 'lucide-react';
import { useOsStore } from '../store/osStore';
import { Button } from '../../../components/ui/Button';

interface Props {
  type: 'technician' | 'client';
  label: string;
}

export const SignaturePad: React.FC<Props> = ({ type, label }) => {
  const { currentOs, addSignature } = useOsStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  
  // Verifica se já existe uma assinatura salva
  const existingSignature = currentOs?.signatures.find(s => s.type === type);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !existingSignature) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#1a1a1a'; // Cor primary
      }
    }
  }, [existingSignature]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    setHasDrawn(true);
    const ctx = canvas.getContext('2d');
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    
    ctx?.beginPath();
    ctx?.moveTo(offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    
    ctx?.lineTo(offsetX, offsetY);
    ctx?.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    canvasRef.current?.getContext('2d')?.closePath();
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top,
      };
    }
    return {
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY,
    };
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

const handleSave = async () => {
  const canvas = canvasRef.current;
  if (!canvas || !currentOs) return;

  try {
    // Converte o canvas para Blob usando Promise
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
      console.error("Erro ao gerar blob do canvas");
      return;
    }

    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Envia para o Rust
    const savedSignature = await invoke<SignatureItem>('save_signature', {
      osId: currentOs.id,
      sigType: type,
      imageBytes: uint8Array,
    });

    addSignature(savedSignature);
  } catch (error) {
    console.error("Erro ao salvar assinatura:", error);
  }
};

  // Se já assinou, renderiza o estado de sucesso
  if (existingSignature) {
    return (
      <div className="mb-4">
        <label className="block text-[13px] font-medium text-secondary mb-1.5">{label}</label>
        <div className="border border-success bg-green-50/50 rounded-md h-[100px] flex items-center justify-center text-success transition-all">
          <span className="flex items-center gap-2 text-[14px] font-medium">
            <CheckCircle size={20} />
            Assinatura registrada
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-1.5">
        <label className="block text-[13px] font-medium text-secondary">{label}</label>
        {hasDrawn && (
          <button onClick={handleClear} className="text-danger text-[12px] flex items-center gap-1">
            <X size={14} /> Limpar
          </button>
        )}
      </div>
      
      <div className="border border-border rounded-md bg-surface overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="w-full h-[120px] bg-white cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {hasDrawn && (
        <Button variant="secondary" onClick={handleSave} className="mt-2 py-2">
          <PenTool size={16} />
          Confirmar Assinatura
        </Button>
      )}
    </div>
  );
};