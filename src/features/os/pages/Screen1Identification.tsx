import React from 'react';
import { Server } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { InputGroup } from '../../../components/ui/InputGroup';
import { Button } from '../../../components/ui/Button';
import { useOsStore } from '../store/osStore';

interface Props {
  onNext: () => void;
}

export const Screen1Identification: React.FC<Props> = ({ onNext }) => {
  const { currentOs, updateOs } = useOsStore();

  const serviceOptions = [
    { value: '', label: 'Selecione o tipo de serviço...' },
    { value: 'instalacao', label: 'Instalação completa' },
    { value: 'expansao', label: 'Expansão de infraestrutura' },
    { value: 'manutencao', label: 'Manutenção corretiva' },
    { value: 'vistoria', label: 'Vistoria técnica' },
    { value: 'suporte', label: 'Suporte técnico' },
    { value: 'upgrade', label: 'Upgrade de equipamentos' },
  ];

  const handleInputChange = (field: string, value: string) => {
    if (!currentOs) return;
    
    updateOs({
      ...currentOs,
      [field]: value,
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <div className="text-center mb-6 pt-3">
        <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
          <Server color="white" size={28} strokeWidth={2} />
        </div>
        <h1 className="text-[26px] font-bold text-primary mb-1">OS Digital</h1>
        <p className="text-[14px] text-muted">Infraestrutura de Rede e Segurança</p>
      </div>

      <Card title="Identificação" subtitle="Dados iniciais do atendimento">
        <InputGroup 
          label="Técnico responsável" 
          placeholder="Nome completo do técnico"
          value={currentOs?.technician_name || ''}
          onChange={(value) => handleInputChange('technician_name', value)}
        />
        <InputGroup 
          label="Número do chamado (GLPI)" 
          placeholder="Ex: GLPI-2026-0847"
          value={currentOs?.glpi_number || ''}
          onChange={(value) => handleInputChange('glpi_number', value)}
        />
        <InputGroup 
          label="Cliente / Empresa" 
          placeholder="Razão social ou nome fantasia"
          value={currentOs?.client_name || ''}
          onChange={(value) => handleInputChange('client_name', value)}
        />
        <InputGroup 
          label="Endereço completo" 
          placeholder="Rua, número, bairro, cidade"
          value={currentOs?.address || ''}
          onChange={(value) => handleInputChange('address', value)}
        />
        <InputGroup 
          label="Data da visita" 
          type="date"
          value={currentOs?.visit_date || ''}
          onChange={(value) => handleInputChange('visit_date', value)}
        />
        <InputGroup 
          label="Tipo de serviço" 
          as="select" 
          options={serviceOptions}
          value={currentOs?.service_type || ''}
          onChange={(value) => handleInputChange('service_type', value)}
        />

        <Button onClick={onNext} className="mt-1">
          Iniciar atendimento →
        </Button>
      </Card>
    </div>
  );
};