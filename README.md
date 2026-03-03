# IS Validador Jantar Cursos

Aplicação web (single-file) para validar bilhetes de um jantar académico com base numa folha Excel, incluindo suporte a OCR via câmara para leitura automática do código.

## Funcionalidades ejhej

- Carregamento de ficheiros Excel (`.xlsx` e `.xls`).
- Mapeamento dos bilhetes para validação rápida.
- Verificação manual por código de bilhete.
- Leitura por câmara com OCR (Tesseract.js) para detetar e preencher o código automaticamente.
- Indicadores de estado:
  - total de registos;
  - bilhetes emitidos;
  - bilhetes já validados.
- Interface otimizada para telemóvel.
- Processamento local no browser (sem envio de dados para servidores da aplicação).

## Estrutura do projeto

- `main.html`: contém HTML, CSS e JavaScript da aplicação.

## Requisitos

Para usar a aplicação basta um browser moderno com:

- suporte a JavaScript;
- acesso à câmara (opcional, apenas para OCR);
- ligação à internet para carregar as bibliotecas CDN:
  - `xlsx`;
  - `tesseract.js`;
  - Google Fonts.

## Como executar

Como o projeto é estático, pode abrir diretamente o ficheiro `main.html` no browser.

Opcionalmente, pode servir por HTTP local (recomendado para alguns browsers ao usar câmara):

```bash
python3 -m http.server 8080
```

Depois aceda a:

```text
http://localhost:8080/main.html
```

## Como usar

1. **Carregar Excel**
   - Clique na área de upload e selecione um ficheiro `.xlsx`/`.xls`.
2. **Verificar bilhete manualmente**
   - Introduza um código no formato esperado (ex.: `B-2003-2-NCRZNC`) e clique em **Verificar Bilhete**.
3. **Verificar com OCR (câmara)**
   - Clique no botão da câmara.
   - Capture uma imagem com texto legível.
   - O sistema tenta extrair automaticamente um código de bilhete.

## Colunas esperadas no Excel

A aplicação funciona melhor quando existem as seguintes colunas:

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

> Nota: a aplicação mostra aviso quando faltam colunas esperadas.

## Observações

- Se o bilhete não existir no ficheiro, será mostrado como **Não encontrado**.
- Se o registo existir mas sem bilhete, será mostrado como **Inválido**.
- Se o bilhete existir, serão mostrados os dados do participante e estado de pagamento/validação.

## Licença

Sem licença definida neste repositório.
