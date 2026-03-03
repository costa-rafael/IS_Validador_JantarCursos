# IS Validador · Jantar de Cursos

Aplicação web estática para **validar bilhetes de jantar académico** a partir de um ficheiro Excel, com suporte a leitura manual e leitura automática por câmara (OCR).

## Descrição

O projeto foi pensado para uso rápido em contexto de check-in:

- carrega uma lista de participantes a partir de `.xlsx` / `.xls`;
- valida bilhetes por código;
- permite leitura automática do código via câmara com Tesseract;
- mostra estado do registo (emitido, validado, pagamento e dados do participante);
- processa os dados no browser, sem backend dedicado.

## Funcionalidades principais

- Upload de folha Excel com os registos do evento.
- Pesquisa/validação manual de bilhetes.
- Scanner com câmara para OCR de códigos.
- Indicadores resumidos de estado dos bilhetes.
- Interface mobile-first.

## Estrutura do repositório

- `docs/index.html` — aplicação principal (HTML + CSS + JS).
- `new_styles.css` — estilos adicionais/exportados.
- `apply_styles.js` — script utilitário para aplicar estilos.
- `apply_styles.py` — utilitário auxiliar para manipulação de estilos.

## Requisitos

- Browser moderno com JavaScript ativo.
- Permissão de câmara (opcional, apenas para OCR).
- Ligação à internet para CDNs usadas no front-end:
  - `xlsx`;
  - `tesseract.js`;
  - Google Fonts.

## Como executar localmente

Pode abrir diretamente o ficheiro `docs/index.html` no browser.

Para evitar limitações de alguns browsers com câmara, recomenda-se servir por HTTP local:

```bash
python3 -m http.server 8080
```

Depois, aceda a:

```text
http://localhost:8080/docs/index.html
```

## Fluxo de utilização

1. Abrir a app e carregar o Excel do evento.
2. Verificar bilhete manualmente pelo código **ou** abrir a câmara.
3. Confirmar o resultado apresentado (encontrado, válido, já validado, etc.).

## Colunas esperadas no Excel

As validações funcionam melhor quando o ficheiro inclui colunas como:

- `Nome`
- `Número de Telemóvel`
- `Email`
- `Curso`
- `Ano`
- `Pratos`
- `Método de Pagamento`
- `Hora`
- `Pagamento`
- `Confirmado por`
- `Confirmado`
- `Bilhete`
- `Validado em`

> A aplicação pode funcionar com variações, mas poderá mostrar alertas para colunas em falta.

## Licença

Sem licença definida neste repositório.
