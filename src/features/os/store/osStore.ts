import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { OSDigital, ChecklistItem, MaterialItem } from '../types';

interface OsState {
  currentOs: OSDigital | null;
  
  // Ações de navegação e ciclo de vida
  initNewOs: () => void;
  loadOs: (os: OSDigital) => void;
  setStep: (step: number) => void;
  
  // Ações de atualização de dados
  updateIdentification: (data: Partial<OSDigital>) => void;
  toggleChecklist: (id: string) => void;
  updateObservacoes: (obs: string) => void;
  updateMaterial: (id: string, updates: Partial<MaterialItem>) => void;
  addCustomMaterial: (material: Omit<MaterialItem, 'id'>) => void;
  removeMaterial: (id: string) => void;
  
  // Ações de mídia (Fotos e Assinaturas)
  // Serão expandidas no Lote 5 e 6
}

// Helper para gerar IDs únicos temporários (substituído por UUID v4 depois se necessário)
const generateId = () => Math.random().toString(36).substring(2, 15);

// Template de uma OS vazia
const createInitialOs = (): OSDigital => ({
  id: generateId(),
  glpi_ticket_id: '',
  tecnico: '',
  cliente: '',
  endereco: '',
  data_visita: new Date().toISOString().split('T')[0],
  tipo_servico: '',
  observacoes: '',
  status: 'DRAFT',
  current_step: 1,
  created_at: Date.now(),
  updated_at: Date.now(),
  checklist: [
    // Infraestrutura de rede
    { id: generateId(), category: 'rede', description: 'Levantamento de pontos de rede necessários', checked: false },
    { id: generateId(), category: 'rede', description: 'Avaliação do rack / armário de telecom existente', checked: false },
    { id: generateId(), category: 'rede', description: 'Análise de passagem de eletrodutos / canaletas', checked: false },
    { id: generateId(), category: 'rede', description: 'Verificação de infraestrutura elétrica (tomadas, nobreak)', checked: false },
    // A lista completa será preenchida conforme o protótipo...
  ],
  materials: [],
  photos: [],
  signatures: [],
});

export const useOsStore = create<OsState>()(
  subscribeWithSelector((set) => ({
    currentOs: null,

    initNewOs: () => set({ currentOs: createInitialOs() }),
    
    loadOs: (os) => set({ currentOs: os }),
    
    setStep: (step) => set((state) => {
      if (!state.currentOs) return state;
      return { 
        currentOs: { ...state.currentOs, current_step: step, updated_at: Date.now() } 
      };
    }),

    updateIdentification: (data) => set((state) => {
      if (!state.currentOs) return state;
      return {
        currentOs: { ...state.currentOs, ...data, updated_at: Date.now() }
      };
    }),

    toggleChecklist: (id) => set((state) => {
      if (!state.currentOs) return state;
      return {
        currentOs: {
          ...state.currentOs,
          updated_at: Date.now(),
          checklist: state.currentOs.checklist.map(item => 
            item.id === id ? { ...item, checked: !item.checked } : item
          )
        }
      };
    }),

    updateObservacoes: (obs) => set((state) => {
      if (!state.currentOs) return state;
      return {
        currentOs: { ...state.currentOs, observacoes: obs, updated_at: Date.now() }
      };
    }),

    updateMaterial: (id, updates) => set((state) => {
      if (!state.currentOs) return state;
      return {
        currentOs: {
          ...state.currentOs,
          updated_at: Date.now(),
          materials: state.currentOs.materials.map(mat => 
            mat.id === id ? { ...mat, ...updates } : mat
          )
        }
      };
    }),

    addCustomMaterial: (material) => set((state) => {
      if (!state.currentOs) return state;
      return {
        currentOs: {
          ...state.currentOs,
          updated_at: Date.now(),
          materials: [...state.currentOs.materials, { ...material, id: generateId() }]
        }
      };
    }),

    removeMaterial: (id) => set((state) => {
      if (!state.currentOs) return state;
      return {
        currentOs: {
          ...state.currentOs,
          updated_at: Date.now(),
          materials: state.currentOs.materials.filter(mat => mat.id !== id)
        }
      };
    }),
  }))
);