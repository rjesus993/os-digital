# OS Digital — Regras de Desenvolvimento

## 1. Fonte de verdade
Código + `.ai/` + Git + protótipo.

## 2. Desenvolvimento incremental
Trabalhar em lotes pequenos e coerentes.

## 3. Arquivos
Ao trabalhar via chat, a IA deve fornecer o arquivo completo quando ele for criado ou substituído.

## 4. Não inventar execução
A IA não deve afirmar que compilou/testou localmente sem acesso ao ambiente.

## 5. TypeScript
- Tipagem forte.
- Evitar `any`.
- Interfaces/types coerentes.
- Validar dados de entrada.

## 6. React
- Hooks corretamente utilizados.
- Sem manipulação direta de DOM para controlar telas.
- Componentes com responsabilidades claras.

## 7. Rust
- Preferir `Result<T, E>`.
- Evitar `unwrap()` em caminhos de produção.
- Erros devem ser tratáveis e informativos.

## 8. Persistência
- Toda informação crítica deve ser persistida localmente.
- Nunca depender exclusivamente do estado em memória.

## 9. Mídia
Fotos, assinaturas e PDFs ficam no File System; SQLite guarda metadados/caminhos.

## 10. GLPI
Não realizar HTTP diretamente em componentes React.

## 11. Segurança
Nunca hardcodar credenciais reais.

## 12. Performance
Evitar imagens gigantes, Base64 pesado, renders desnecessários e queries repetidas.

## 13. Não regressão
Não remover funcionalidades existentes sem decisão documentada.

## 14. Dependências
Adicionar dependências somente quando realmente necessárias e compatíveis com Tauri/Android.

## 15. Documentação
Mudanças arquiteturais, banco, API e estado atual devem ser documentadas.

## 16. Checkpoint
Ao terminar cada lote, atualizar:
- `CURRENT_STATE.md`
- `TODO.md`
- `CHANGELOG.md`

## 17. Contexto
Se o limite de contexto estiver próximo, terminar em um estado consistente e criar checkpoint antes de parar.
