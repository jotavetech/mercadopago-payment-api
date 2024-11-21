import fastify from "fastify";

import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

import type { PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types";

import crypto from "crypto";

import path from "path";

import fStatic from "@fastify/static";

const mpClient = new MercadoPagoConfig({
  accessToken: String(process.env.MP_ACCESS_TOKEN),
});

const mpPayment = new Payment(mpClient);

const mpPreference = new Preference(mpClient);

const mpPreferenceBody: PreferenceCreateData = {
  body: {
    items: [
      {
        id: "1234",
        title: "Avião para Maldivas",
        quantity: 1,
        currency_id: "BRL",
        unit_price: 2,
      },
    ],
    payment_methods: {
      excluded_payment_types: [{ id: "ticket" }],
      excluded_payment_methods: [{ id: "amex" }],
      installments: 6,
    },
    notification_url: process.env.MP_WEBHOOK_URL,
    back_urls: {
      success: "http://localhost:8000/success",
      failure: "http://localhost:8000/failure",
      pending: "http://localhost:8000/pending",
    },
    binary_mode: true, // only return success or failure
    auto_return: "all",
  },
};

const http = fastify();

http.register(fStatic, {
  root: path.join(__dirname, "pages"),
});

http.get("/v1/api/health", async (request, reply) => {
  return reply.send({ status: "ok" });
});

http.post("/v1/api/create-checkout", async (request, reply) => {
  try {
    const checkout = await mpPreference.create(mpPreferenceBody);

    return reply.send({
      checkout_url: checkout.init_point,
    });
  } catch (error) {
    return reply.send({ error: "Something went wrong!" }).status(400);
  }
});

http.post("/v1/api/check-payment-webhook", async (request, reply) => {
  const signatureHeader = request.headers["x-signature"] as string;
  const requestIdHeader = request.headers["x-request-id"]!;

  const body = request.body as { data: { id: string } };

  const { id: dataId } = body.data;

  const [ts, v1] = signatureHeader.split(",") as string[];

  const timestamp = ts.split("=")[1];
  const receivedSignature = v1.split("=")[1];

  const idTemplate = dataId ? `id:${dataId};` : "";
  const timestampTemplate = timestamp ? `ts:${timestamp};` : "";

  const signTemplate = `${idTemplate}request-id:${requestIdHeader};${timestampTemplate}`;

  const secret = String(process.env.MP_WEBHOOK_SIGNATURE);

  const cyphedSignature = crypto
    .createHmac("sha256", secret)
    .update(signTemplate)
    .digest("hex");

  if (cyphedSignature !== receivedSignature) {
    console.log("Invalid signature");
    return reply.send({ error: "Invalid signature" }).status(401);
  }

  try {
    const payment = await mpPayment.get({
      id: dataId,
    });

    switch (payment.status) {
      case "approved":
        console.log("================================");
        console.log("================================");
        console.log("================================");
        console.log("=======PAGAMENTO APROVADO=======");
        console.log("================================");
        console.log("================================");
        console.log("================================");
        break;
      case "pending":
        console.log("=====\nPAGAMENTO PENDENTE\n=====");
        break;
      case "in_process":
        console.log("=====\nPAGAMENTO EM PROCESSAMENTO\n=====");
        break;
      case "rejected":
        console.log("=====\nPAGAMENTO REJEITADO\n=====");
        break;
      case "cancelled":
        console.log("=====\nPAGAMENTO CANCELADO\n=====");
        break;
      // ... other status
    }
  } catch (error) {
    console.log(error);
  }

  return reply.send({ status: "ok" });
});

// Simulate a frontend

http.get("/success", async (request, reply) => {
  return reply.sendFile("success.html");
});

http.get("/failure", async (request, reply) => {
  return reply.sendFile("fail.html");
});

http.get("/pending", async (request, reply) => {
  return reply.sendFile("pending.html");
});

http
  .listen({ port: 8000 })
  .then(() => console.log("Server is running on port 8000"));
