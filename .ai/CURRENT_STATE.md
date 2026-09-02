# OS Digital — Estado Atual

## Data
2026-09-02

## Fase
Preparação da documentação `.ai`.

## Estado
A documentação base foi criada para servir como memória persistente do projeto.

## Implementado
- Definição inicial do projeto.
- Arquitetura React + TypeScript + Vite + Tailwind + Zustand.
- Tauri v2 + Rust.
- SQLite e File System.
- Integração GLPI prevista.
- Fluxo de OS documentado.
- Regras de desenvolvimento documentadas.
- Diretrizes visuais baseadas no protótipo.

## Protótipo
`os_digital_infra.html` é a referência funcional/visual inicial.

## Próximo passo
Inicializar ou revisar a estrutura real do projeto Tauri/React e iniciar o Lote 0 — Fundação.

## Lotes previstos
0. Fundação
1. Interface
2. Modelos + Zustand
3. SQLite
4. Auto-save + recuperação
5. Fotos
6. Assinaturas
7. PDF
8. GLPI
9. Sync Queue
10. Refinamento

## Problemas conhecidos
- Endpoint/payload/autenticação real do GLPI ainda não estão documentados.
- O comportamento nativo final de câmera/GPS/QR Code ainda precisa ser definido na implementação.
- O projeto real ainda deve ser confrontado com esta documentação antes de alterações.

## Regra de continuidade
Não reiniciar funcionalidades já implementadas. Antes de iniciar uma nova sessão, ler este arquivo, `TODO.md`, `CHANGELOG.md` e os documentos técnicos relacionados à tarefa.
