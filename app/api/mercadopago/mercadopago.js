// mercadopago.js

import MercadoPagoConfig, { Payment, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_TOKEN,
});
const payment = new Payment(client);
const preference = new Preference(client);

export { client, payment, preference };
