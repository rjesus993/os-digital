import React, { useRef, useState } from 'react';
import { Camera, Loader2, CheckCircle } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useOsStore } from '../store/osStore';

export const PhotoGrid: React.FC = () => {
  const { currentOs, addPhoto } = useOsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentOs) return;

    setIsProcessing(true);
    try {
      // Lê o arquivo como ArrayBuffer puro (zero Base64)
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Envia os bytes para processamento pesado em Rust
      const savedPhoto = await invoke<PhotoItem>('process_and_save_photo', {
        osId: currentOs.id,
        photoBytes: uint8Array,
      });

      addPhoto(savedPhoto); // Adiciona ao estado (dispara o Auto-Save no SQLite)
      
    } catch (error) {
      console.error("Erro ao salvar foto:", error);
      alert("Falha ao processar a imagem.");
    } finally {
      setIsProcessing(false);
      // Reseta o input para permitir tirar a mesma foto novamente se necessário
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="photo-grid grid grid-cols-3 gap-2 mt-2">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" // Prioriza câmera traseira no Android
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <div 
        className="photo-slot border border-dashed border-border rounded-md h-[88px] flex flex-col items-center justify-center text-light text-[12px] cursor-pointer bg-surface transition-all hover:border-primary hover:text-primary"
        onClick={handleCaptureClick}
      >
        {isProcessing ? (
          <Loader2 className="animate-spin text-primary" size={20} />
        ) : (
          <>
            <Camera size={20} />
            <span className="mt-1">Nova Foto</span>
          </>
        )}
      </div>

      {currentOs?.photos.map((photo) => (
        <div key={photo.id} className="photo-slot border border-success bg-green-50/50 rounded-md h-[88px] flex flex-col items-center justify-center text-success text-[12px]">
           <CheckCircle size={20} className="mb-1 text-success" />
           <span className="text-[11px]">Capturada</span>
        </div>
      ))}
    </div>
  );
};