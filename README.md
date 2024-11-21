# API de Pagamentos - Mercado Pago

API simples para processamento de pagamentos usando Mercado Pago, construída com Fastify.

## Requisitos

- Node.js
- NPM, Yarn ou Bun.
- Conta no Mercado Pago (Access Token)

## Variáveis de Ambiente

```env
MP_ACCESS_TOKEN=seu_access_token_aqui
MP_WEBHOOK_URL=sua_url_de_webhook
MP_WEBHOOK_SIGNATURE=sua_assinatura_de_webhook
```

## Instalação

```bash
bun install
#ou
yarn install
#ou
npm intall

```

## Endpoints

- `GET /v1/api/health` - Verifica status da API
- `POST /v1/api/create-checkout` - Cria um checkout do Mercado Pago (Você precisa rodar a API em HTTPS)
- `POST /v1/api/check-payment-webhook` - Webhook para notificações de pagamento

## Como Usar

1. Configure as variáveis de ambiente
2. Inicie o servidor:

```bash
bun index.ts
#ou
npm start
# ou
yarn start
```

O servidor estará rodando em `http://localhost:8000`
