# Afiliado Mercado Livre

Motor de ofertas (+30% desconto), vitrine e texto para redes.

## Configurar

### Onde pegar seu ID de afiliado

1. Acesse o **Mercado Livre** e entre na sua conta.
2. No **computador**: passe o mouse no seu nome (canto superior direito) → clique em **"Afiliados"**.
3. No **celular**: abra o app → toque no seu perfil (canto inferior direito) → **"Afiliados"**.
4. No **Portal do Afiliado**, vá em **Gerador de Links**: https://www.mercadolivre.com.br/afiliados/linkbuilder  
5. Cole o link de qualquer produto e clique em **Gerar**. O link gerado contém o código que identifica você como afiliado.
6. Copie o valor que aparece no parâmetro de rastreamento do link (por exemplo, algo como `matt_tool=123456` ou o código que o próprio link mostrar). Esse é o valor que você coloca no `motor/config.js` em **AFILIADO_ID**.

Se o Gerador de Links não mostrar um “ID” solto, use o **link completo** que ele gera para um produto como referência: o trecho que identifica sua conta (geralmente um número ou código na URL) é o que o sistema usa para atribuir as vendas a você. Coloque esse código no config.

**Edite** `motor/config.js` e troque `SEU_ID_AFILIADO` por esse valor.

### Tokens (OAuth) — só se a API bloquear (403)

Na sua máquina a API do Mercado Livre pode retornar **403** (bloqueio por política/ambiente).  
Quando isso acontecer, você resolve com **OAuth** (sem Postman), seguindo a documentação oficial de:

- Criar app: https://developers.mercadolivre.com.br/pt_br/crie-uma-aplicacao-no-mercado-livre  
- Access token: https://developers.mercadolivre.com.br/pt_br/obtencao-do-access-token

#### Passo a passo (sem Postman)

1. Crie uma aplicação no DevCenter e pegue **Client ID** e **Client Secret**.
2. Configure uma `redirect_uri` (pode ser `http://localhost:8080/callback` — a URL tem que bater 100% com a cadastrada).
3. No PowerShell, defina as variáveis:

```powershell
$env:ML_CLIENT_ID="SEU_CLIENT_ID"
$env:ML_CLIENT_SECRET="SEU_CLIENT_SECRET"
$env:ML_REDIRECT_URI="http://localhost:8080/callback"
```

4. Gere a URL de autorização e abra no navegador:

```powershell
npm run ml:auth:url
```

5. Depois de autorizar, você será redirecionado para a `redirect_uri` com `?code=...` na URL. Copie esse `code` e salve o token:

```powershell
$env:ML_CODE="COLE_O_CODE_AQUI"; npm run ml:auth:code
```

Pronto: o token fica salvo em **`dados/ml-token.json`** e o robô tenta usar automaticamente.

Você **não precisa** ficar renovando manualmente: quando expirar, rode:

```powershell
npm run ml:auth:refresh
```

## Comandos

| Comando | Ação |
|---------|------|
| `npm run iniciar` | Liga o robô (busca agora e a cada 1 h). Deixe a janela aberta. |
| `npm run buscar` | Uma busca só. |
| `npm run servidor` | Sobe o site. Abra http://localhost:3000 |
| `npm run redes` | Gera texto das 3 melhores ofertas para copiar no WhatsApp/Telegram. |
| `npm run ml:auth:url` | Gera a URL para autorizar a aplicação (OAuth). |
| `npm run ml:auth:code` | Troca o `code` por token (use `ML_CODE`). |
| `npm run ml:auth:refresh` | Renova token salvo em `dados/ml-token.json`. |

**Webhook:** defina `WEBHOOK_URL` no ambiente antes de `npm run redes` para enviar automaticamente.

## Uso da API do Mercado Livre

O motor usa a [documentação oficial](https://developers.mercadolivre.com.br/pt_br/itens-e-buscas) de forma eficiente:

- **Busca** (`/sites/MLB/search`): quando a resposta já traz `original_price`, as ofertas são montadas direto da busca, sem chamadas extras.
- **Detalhes** (`/items?ids=...&attributes=...`): só é chamado para itens que não vieram com desconto na busca, e só são pedidos os campos necessários (`id`, `price`, `original_price`, `title`, `thumbnail`, `permalink`, `category_id`), reduzindo tempo e dados.

Assim o processo fica mais rápido e com menos requisições à API.

## Estrutura

- `motor/config.js` — ID de afiliado e categorias
- `motor/buscar-ofertas.js` — Busca na API ML, filtra e salva
- `motor/agendador.js` — Roda o robô a cada 1 hora
- `motor/gerar-redes.js` — Top 3 ofertas em texto
- `dados/ofertas-db.js` — Leitura/escrita de ofertas.json
- `dados/ofertas.json` — Banco de ofertas
- `servidor/servidor.js` — Servidor da vitrine
- `vitrine/index.html` — Página do site

Requisito: Node.js 18+.
