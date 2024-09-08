import { getServerSession } from "next-auth";

import { authOptions } from "../auth/[...nextauth]/route";
import conn from "../../lib/db";

import { preference } from "./mercadopago";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session)
      return Response.json(
        { mensaje: "Usuario no autenticado" },
        { status: 403 },
      );

    const { rows: users } = await conn.query(
      "select * from users where email = $1",
      [session.user.email],
    );

    const user = users[0];

    if (!user)
      return Response.json(
        { mensaje: "Usuario no autenticado" },
        { status: 403 },
      );

    const { rows: transactionRef } = await conn.query(
      "insert into transactions(user_id,status) values($1,$2) RETURNING transaction_id",
      [user.user_id, null],
    );

    const transactionId = transactionRef[0].transaction_id;

    const newPreference = {
      ...miPreference,
      notification_url: `https://37c1-2803-9800-9440-a90a-8934-36c2-14e0-5527.ngrok-free.app/api/mercadopago/receivewebhook?transactionId=${transactionId}`,
    };

    const result = await preference.create({ body: newPreference });

    await conn.query(
      "update transactions set preference_id=$1, clientId=$2 where transaction_id=$3",
      [result.id, result.client_id, transactionId],
    );

    return Response.json(result);
  } catch (error) {
    return Response.json(error, { status: 500 });
  }
}

const miPreference = {
  items: [
    {
      title: "10 Estrellas",
      quantity: 1,
      currency_id: "ARS",
      unit_price: 2500,
    },
  ],
  back_urls: {
    success: process.env.NEXTAUTH_URL + "/estudiar?paymentStatus=success",
    failure: process.env.NEXTAUTH_URL + "/estudiar?paymentStatus=failure",
  },
};
