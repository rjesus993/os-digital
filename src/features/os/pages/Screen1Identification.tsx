import React from 'react';
import { Server } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { InputGroup } from '../../../components/ui/InputGroup';
import { Button } from '../../../components/ui/Button';

interface Props {
  onNext: () => void;
}

export const Screen1Identification: React.FC<Props> = ({ onNext }) => {
  const serviceOptions = [
    { value: '', label: 'Selecione o tipo de serviço...' },
    { value: 'instalacao', label: 'Instalação completa' },
    { value: 'expansao', label: 'Expansão de infraestrutura' },
    { value: 'manutencao', label: 'Manutenção corretiva' },
    { value: 'vistoria', label: 'Vistoria técnica' },
    { value: 'suporte', label: 'Suporte técnico' },
    { value: 'upgrade', label: 'Upgrade de equipamentos' },
  ];

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
        <InputGroup label="Técnico responsável" placeholder="Nome completo do técnico" />
        <InputGroup label="Número do chamado (GLPI)" placeholder="Ex: GLPI-2026-0847" />
        <InputGroup label="Cliente / Empresa" placeholder="Razão social ou nome fantasia" />
        <InputGroup label="Endereço completo" placeholder="Rua, número, bairro, cidade" />
        <InputGroup label="Data da visita" type="date" />
        <InputGroup label="Tipo de serviço" as="select" options={serviceOptions} />

        <Button onClick={onNext} className="mt-1">
          Iniciar atendimento →
        </Button>
      </Card>
    </div>
  );
};