# OS Digital — Diretrizes de UI

## Referência
A referência visual principal é `os_digital_infra.html`.

O protótipo utiliza:
- largura máxima aproximada de 520px;
- fundo claro;
- cards brancos;
- bordas suaves;
- cantos arredondados;
- sombras discretas;
- tipografia baseada em sistema;
- foco em telas pequenas.

## Tokens visuais do protótipo

```text
primary   #1a1a1a
secondary #4a4a4a
muted     #6b7280
light     #9ca3af
border    #e5e7eb
surface   #f9fafb
surface-raised #ffffff
danger    #dc2626
success   #16a34a
warning   #d97706
accent    #2563eb
```

Raio:
```text
sm 6px
md 10px
lg 12px
```

## Fluxo visual
Manter indicador de etapas:

```text
1 → 2 → 3 → 4
```

A navegação deve ser clara e adequada ao toque.

## Regras
- Não manipular DOM diretamente.
- Estado de navegação deve vir do React/Zustand.
- Componentes reutilizáveis devem ficar em `components/ui`.
- Feedback de erro/sucesso deve ser visível.
- Campos devem ter labels claros.
- Evitar interfaces excessivamente densas.
- Preservar a identidade do protótipo durante a migração.

## Responsividade
O aplicativo deve funcionar em telas pequenas. O protótipo possui ajuste específico para larguras abaixo de 400px.
