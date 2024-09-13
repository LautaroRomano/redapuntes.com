import conn from "../../../lib/db";
import { payment as MPPayment } from "../mercadopago";

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get("transactionId");

  try {
    const payment = searchParams;

    if (payment.get("type") === "payment") {
      const myPayment = await MPPayment.get({
        id: payment.get("data.id"),
      });

      const { rows: transactions } = await conn.query(
        "select * from transactions where transaction_id = $1",
        [transactionId],
      );
      const myTransaction = transactions[0];

      if (myTransaction) {
        await conn.query(
          "update transactions set status=$1, updated_at=$2 where transaction_id=$3",
          [myPayment.status, new Date(), transactionId],
        );

        for (let i = 0; i < 10; i++) {
          await conn.query(`insert into stars(user_id) values($1)`, [
            myTransaction.user_id,
          ]);
        }
      }
    }

    return Response.json({}, { status: 200 });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error)
    return Response.json(error, { status: 500 });
  }
}
