# OS Digital — Projeto

## Visão geral
O OS Digital é um aplicativo para técnicos de campo realizarem Ordens de Serviço de infraestrutura de rede e segurança.

O protótipo oficial apresenta um fluxo de quatro etapas:
1. Identificação
2. Checklist
3. Materiais
4. Finalização

A finalização contempla fotos, assinaturas, resumo e emissão da OS.

## Objetivos
- Permitir preenchimento da OS em campo.
- Priorizar operação offline.
- Preservar os dados localmente.
- Permitir sincronização posterior com GLPI.
- Gerar documentação/PDF da OS.
- Manter uma experiência simples e adequada a telas pequenas.

## Stack oficial
- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Lucide React
- Tauri v2
- Rust
- SQLite
- API GLPI

## Princípios
- Offline-first.
- Persistência local como requisito central.
- Fotos, assinaturas e PDFs no sistema de arquivos; banco guarda metadados e caminhos.
- Integração GLPI isolada da UI.
- Código modular e fortemente tipado.
- Desenvolvimento incremental em lotes.

## Funcionalidades do protótipo
### Identificação
- Técnico responsável
- Número do chamado GLPI
- Cliente/Empresa
- Endereço
- Data da visita
- Tipo de serviço

Tipos presentes no protótipo:
- Instalação completa
- Expansão de infraestrutura
- Manutenção corretiva
- Vistoria técnica
- Suporte técnico
- Upgrade de equipamentos

### Checklist
Infraestrutura de rede:
- Levantamento de pontos de rede necessários
- Avaliação do rack/armário de telecom
- Análise de eletrodutos/canaletas
- Verificação da infraestrutura elétrica

Rede sem fio e ativos:
- Cobertura Wi-Fi
- Locais para novos Access Points
- Conectividade e velocidade
- Switches/equipamentos ativos

Segurança (CFTV):
- Pontos para câmeras
- Acesso ao DVR/NVR
- Pontos de energia
- Condições de instalação

Também existe campo de observações técnicas do local.

### Materiais
O protótipo possui materiais de cabeamento/conectividade, ativos de rede, CFTV e itens personalizados.

### Finalização
- Fotos do local
- Assinatura do técnico
- Assinatura do cliente/responsável
- Resumo da OS
- Emissão da OS

## Melhorias arquiteturais planejadas
- Auto-save persistente.
- Recuperação de OS interrompida.
- Fila de sincronização com retry/backoff.
- Compressão de fotos.
- QR Code/código de barras como evolução futura.
- GPS no momento da visita como evolução futura.
- Materiais modelados como dados, não hardcoded em componentes.

## Fonte de referência
O protótipo `os_digital_infra.html` é a referência funcional e visual inicial. A documentação técnica de arquitetura complementa o protótipo, mas não deve apagar requisitos que já existam nele.
