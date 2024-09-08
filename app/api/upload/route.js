import { getServerSession } from "next-auth";
import { PdfReader } from "pdfreader";

import conn from "../../lib/db";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session)
    return Response.json(
      { mensaje: "Usuario no autenticado" },
      { status: 403 },
    );

  const { rows: inmobiliarias } = await conn.query(
    "SELECT * FROM inmobiliarias",
  );

  return Response.json({ inmobiliarias });
}

export async function POST(request) {
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

    const formData = await request.formData();
    const file = formData.get("file");

    if (file.type !== "application/pdf")
      return Response.json(
        { error: "Solo puedes subir archivos PDF!" },
        { status: 200 },
      );

    if (!file)
      return Response.json(
        { error: "Debes proporcionar un archivo PDF" },
        { status: 200 },
      );

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const pdfReader = new PdfReader();
    let pdfText = "";

    await new Promise((resolve, reject) => {
      pdfReader.parseBuffer(uint8Array, (err, item) => {
        if (err) {
          reject(err);
        } else if (!item) {
          resolve();
        } else if (item.text) {
          pdfText += item.text + " ";
        }
      });
    });

    await conn.query(
      "insert into files_ia(user_id,text,name) values($1,$2,$3)",
      [user.user_id, pdfText, file.name],
    );

    return Response.json({});
  } catch (error) {
    return Response.json(error, { status: 500 });
  }
}
