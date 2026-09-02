# OS Digital — Integração GLPI

## Objetivo
Integrar o OS Digital ao GLPI sem comprometer o funcionamento offline.

## Princípio
A API GLPI é uma camada de sincronização, não a persistência principal do aplicativo.

```text
OS local
   ↓
SQLite
   ↓
Sync Queue
   ↓
Rust
   ↓
GLPI API
```

## Isolamento
A integração deve ficar em:

```text
src-tauri/src/glpi/
├── client.rs
├── auth.rs
├── tickets.rs
├── users.rs
└── models.rs
```

O frontend não deve fazer chamadas HTTP diretamente ao GLPI.

## Autenticação
A forma exata de autenticação deve ser definida quando os dados reais do GLPI forem fornecidos.

Nunca colocar:
- senha;
- token;
- API key;
- sessão;
diretamente no código-fonte.

## Sincronização
Uma OS finalizada localmente deve entrar na fila.

```text
PENDING
  ↓
PROCESSING
  ↓
SUCCESS

ou

PROCESSING
  ↓
FAILED/PENDING
```

## Retry
Falhas temporárias devem usar retry com backoff.

Distinguir falhas temporárias de falhas permanentes.

## Idempotência
A sincronização deve evitar duplicidade quando uma tentativa foi realizada, mas a resposta não chegou ao dispositivo.

A estratégia exata de idempotência deverá ser definida de acordo com os endpoints reais do GLPI.

## Dados ainda não definidos
Não inventar endpoints, campos obrigatórios ou payloads específicos sem documentação/credenciais de teste ou exemplos reais do GLPI.

Quando essas informações forem fornecidas, atualizar este documento.
