# OS Digital — Banco de Dados SQLite

## Objetivo
SQLite é a persistência local principal dos dados estruturados da aplicação.

O banco deve permitir que o aplicativo continue funcionando sem internet e que uma OS seja recuperada depois de fechamento, crash ou perda de conectividade.

## Princípios
- Banco local como fonte de persistência operacional.
- Foreign keys.
- Índices quando necessários.
- Migrations versionadas.
- Timestamps.
- Estados explícitos.
- Não armazenar fotos/PDFs grandes diretamente nas tabelas.
- Não guardar Base64 pesado na tabela principal da OS.

## Modelo lógico inicial

### `os`
Representa a Ordem de Serviço.

Campos conceituais:
- `id`
- identificador local/externo
- `glpi_ticket_id` ou referência ao chamado
- técnico
- cliente
- endereço
- data da visita
- tipo de serviço
- observações
- `status`
- `current_step`
- `created_at`
- `updated_at`
- `completed_at`
- informações de sincronização quando aplicável

### `os_checklist`
Itens de checklist associados à OS.

Campos conceituais:
- `id`
- `os_id`
- identificador do item
- categoria
- descrição
- marcado/concluído
- observação opcional
- timestamps

### `materials`
Catálogo de materiais.

Campos conceituais:
- `id`
- nome
- categoria
- unidade
- ativo
- metadados/configuração

Os materiais do aplicativo não devem depender de uma lista hardcoded dentro de componentes React.

### `os_materials`
Materiais usados/identificados em uma OS.

Campos conceituais:
- `id`
- `os_id`
- `material_id` opcional
- nome do item
- categoria
- quantidade
- unidade
- observação/modelo
- indicador de item personalizado
- timestamps

### `os_photos`
Metadados das fotos.

Campos conceituais:
- `id`
- `os_id`
- caminho do arquivo
- nome
- tipo MIME
- tamanho
- largura
- altura
- timestamp
- ordem
- legenda opcional

### `os_signatures`
Metadados das assinaturas.

Campos conceituais:
- `id`
- `os_id`
- tipo (`technician`/`client`)
- caminho do arquivo
- timestamp

### `sync_queue`
Fila de sincronização.

Campos conceituais:
- `id`
- entidade
- `entity_id`
- operação
- payload ou referência ao payload
- status
- attempts
- last_error
- next_retry_at
- created_at
- updated_at

Estados sugeridos:
```text
PENDING
PROCESSING
SUCCESS
FAILED
```

## Relacionamentos

```text
os
 ├── 1:N os_checklist
 ├── 1:N os_materials
 ├── 1:N os_photos
 └── 1:N os_signatures

materials
 └── 1:N os_materials

os
 └── 1:N sync_queue (quando aplicável)
```

## Integridade
Toda tabela dependente de OS deve usar foreign key apropriada.

Operações de exclusão devem ser deliberadas e documentadas. Não apagar uma OS automaticamente por falha de sincronização.

## Migrations
Alterações de schema devem ser feitas por migrations versionadas.

Nunca modificar silenciosamente uma estrutura existente em produção.

Antes de alterar o schema:
1. documentar a mudança;
2. criar migration;
3. atualizar modelos Rust;
4. atualizar tipos/serviços dependentes;
5. revisar compatibilidade.

## Recuperação
A inicialização do aplicativo deve conseguir consultar:
- OS em andamento;
- OS pendentes;
- OS com erro de sincronização.

Isso permite uma tela de recuperação.

## Performance
- Criar índices para consultas frequentes.
- Evitar blobs grandes.
- Paginar listas quando necessário.
- Evitar queries repetidas.
- Manter transações para operações relacionadas que precisem ser atômicas.
