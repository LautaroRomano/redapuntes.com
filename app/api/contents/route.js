import conn from "../../lib/db";

export async function GET() {
  try {
    const { rows: contents } = await conn.query("select * from contents");

    return Response.json({ contents });
  } catch (error) {
    return Response.json(error, { status: 500 });
  }
}
