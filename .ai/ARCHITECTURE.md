# OS Digital — Arquitetura

## Arquitetura em camadas

```text
React + TypeScript
        ↓
Zustand
        ↓
Tauri Commands
        ↓
Rust
   ┌────┼──────────────┐
   ↓    ↓              ↓
SQLite File System    GLPI
   ↓    ↓              ↓
Dados  Fotos/PDF      Sync
```

## Frontend
Tecnologias:
- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Lucide React

Organização recomendada:

```text
src/
├── app/
├── assets/
├── components/
│   └── ui/
├── features/
│   └── os/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── store/
│       ├── types/
│       └── validation/
├── services/
│   ├── tauri/
│   ├── glpi/
│   └── storage/
├── types/
└── utils/
```

## Backend Rust
```text
src-tauri/src/
├── commands/
├── db/
├── glpi/
├── sync/
├── storage/
├── pdf/
└── models/
```

### Responsabilidades
- `commands`: interface entre React e Rust.
- `db`: SQLite, migrations e persistência.
- `glpi`: cliente e modelos da API.
- `sync`: fila, worker e retry.
- `storage`: arquivos, fotos e metadados.
- `pdf`: geração do documento.
- `models`: estruturas de domínio.

## Estado da OS
Estados planejados:

```text
DRAFT
IN_PROGRESS
READY_TO_SUBMIT
PENDING_SYNC
SYNCING
SYNCED
SYNC_ERROR
```

A OS também possui `current_step`.

## Fluxo offline-first

```text
Usuário altera dados
       ↓
Zustand
       ↓
debounce de auto-save
       ↓
Tauri Command
       ↓
SQLite
```

Na finalização:

```text
Finalizar
   ↓
Persistir localmente
   ↓
Confirmar persistência
   ↓
Adicionar à Sync Queue
   ↓
Tentar GLPI
   ├── sucesso → SYNCED
   └── falha   → SYNC_ERROR/PENDING
```

Nunca depender da internet para preservar a OS.

## Fotos e arquivos
Fotos não devem ser armazenadas como Base64 grande no SQLite.

Preferência:
```text
arquivo físico → File System
metadados/path → SQLite
```

A captura deve considerar compressão/redimensionamento para reduzir consumo de armazenamento e memória.

## Assinaturas
Assinaturas devem ser tratadas como arquivos, com metadados/caminho no banco.

## PDF
O PDF deve ser gerado a partir dos dados persistidos e pode incluir:
- identificação;
- cliente;
- endereço;
- técnico;
- chamado GLPI;
- data;
- serviço;
- checklist;
- materiais;
- observações;
- fotos;
- assinaturas;
- informações de sincronização.

## GLPI
Nenhum componente React deve implementar diretamente a integração HTTP com GLPI.

Preferir:
```text
React → serviço Tauri → command → Rust → GLPI client
```

## Segurança
- Nunca hardcodar credenciais.
- Não registrar tokens/senhas em logs.
- Validar dados recebidos.
- Usar HTTPS para comunicação externa.
- Minimizar permissões e exposição de dados.

## Evoluções futuras
A arquitetura deve permitir:
- QR Code/código de barras;
- GPS no momento da visita;
- carregamento de materiais/configurações do servidor;
- suporte futuro a Windows.

## Regra de não regressão
Mudanças devem preservar o fluxo e os requisitos do protótipo, salvo decisão documentada.
