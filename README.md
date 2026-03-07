# IS Validador · Jantar de Cursos

Validador de bilhetes com leitura QR, suporte a Excel local/online e integração com **Cloudflare Worker + R2**.

## Funcionalidades

- Validação de bilhetes por código e por QR (BarcodeDetector/jsQR).
- Fonte de dados por:
  - ficheiro local `.xlsx/.xls`;
  - URL pública;
  - endpoint Worker (`/api/r2-db`) ligado a R2.
- Normalização robusta de colunas/encoding (mojibake, aliases, datas/horas em serial Excel).
- Registo de `Validado em` + `Validador` e listagem de validados/por validar.
- Fluxo inicial para identificar nome do validador (acesso pode ficar protegido por Cloudflare Zero Trust).

## Estrutura

- `docs/index.html` — frontend completo.
- `src/worker.js` — Worker com endpoint `/api/r2-db` para ler Excel de R2.
- `wrangler.jsonc` — config do Worker, assets e binding R2.

## Configuração Cloudflare (R2)

No `wrangler.jsonc`:

- `main: "src/worker.js"`
- `r2_buckets[].binding: "DB_BUCKET"`
- `vars.R2_DEFAULT_KEY` — chave default do Excel no bucket

Exemplo atual:

```jsonc
"r2_buckets": [
  {
    "binding": "DB_BUCKET",
    "bucket_name": "jantarcursos-2026-02"
  }
],
"vars": {
  "R2_DEFAULT_KEY": "Bilhetes.xlsx"
}
```

## Endpoint Worker

- `GET /api/r2-db` → carrega o ficheiro definido em `R2_DEFAULT_KEY`
- `GET /api/r2-db?key=outro.xlsx` → carrega uma chave específica do bucket
- `GET /api/r2-validations?key=...` → devolve validações persistidas em R2
- `POST /api/r2-validations` → grava/atualiza validação (`bilhete`, `validadoEm`, `validador`)

Se o ficheiro existir, responde o binário Excel com header `x-r2-key`.

## Uso na UI

Na folha “Fonte de dados”, usar:

- **Integração R2 (Worker)**
  - campo de chave (ex: `Bilhetes.xlsx`)
  - botão “Carregar de R2”

Também suporta autoload por query string:

- `?db=https://.../ficheiro.xlsx`
- `?r2key=Bilhetes.xlsx`

## Executar localmente

## Uso na UI

Abrir:

- **Integração R2 (Worker)**
  - campo de chave (ex: `Bilhetes.xlsx`)
  - botão “Carregar de R2”

Também suporta autoload por query string:

- `?db=https://.../ficheiro.xlsx`
- `?r2key=Bilhetes.xlsx`

## Nota

O acesso à app em produção pode ser protegido por **Cloudflare Zero Trust Access**; o passo local de nome do validador serve para auditoria operacional dentro da app.

Quando a fonte é R2/Worker, ao validar um bilhete a app persiste essa validação em R2 (objeto JSON de validações), reaplica esses dados no carregamento e faz sincronização periódica (live) sem refresh.
