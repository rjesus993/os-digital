// Estados possíveis de uma OS baseados na arquitetura
export type OsStatus = 
  | 'DRAFT' 
  | 'IN_PROGRESS' 
  | 'READY_TO_SUBMIT' 
  | 'PENDING_SYNC' 
  | 'SYNCING' 
  | 'SYNCED' 
  | 'SYNC_ERROR';

export interface ChecklistItem {
  id: string; // Gerado localmente (UUID)
  category: 'rede' | 'wifi' | 'cftv';
  description: string;
  checked: boolean;
}

export interface MaterialItem {
  id: string; // UUID da linha na OS
  material_id?: string; // ID do catálogo (opcional para itens customizados)
  name: string;
  category: 'cabeamento' | 'ativos' | 'cftv' | 'outros';
  quantity: number;
  unit: string;
  observation?: string;
  is_custom: boolean;
}

export interface PhotoItem {
  id: string; // UUID
  path: string; // Caminho no File System nativo
  timestamp: number;
}

export interface SignatureItem {
  id: string; // UUID
  type: 'technician' | 'client';
  path: string; // Caminho da imagem gerada no File System
  timestamp: number;
}

export interface OSDigital {
  id: string; // UUID local
  glpi_ticket_id: string;
  tecnico: string;
  cliente: string;
  endereco: string;
  data_visita: string;
  tipo_servico: string;
  observacoes: string;
  status: OsStatus;
  current_step: number;
  created_at: number;
  updated_at: number;
  
  // Relacionamentos em memória (serão separados em tabelas no SQLite)
  checklist: ChecklistItem[];
  materials: MaterialItem[];
  photos: PhotoItem[];
  signatures: SignatureItem[];
}