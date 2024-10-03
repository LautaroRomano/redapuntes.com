import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.js";
import conn from "../../lib/db";
import { getFirebaseBucket } from "../../lib/firebase";

export async function POST(request) {
  try {
    const bucket = await getFirebaseBucket();
    const session = await getServerSession(authOptions);

    if (!session)
      return Response.json(
        { mensaje: "Usuario no autenticado" },
        { status: 403 }
      );

    const { rows: users } = await conn.query(
      "select * from users where email = $1",
      [session.user.email]
    );
    const user = users[0];

    if (!user)
      return Response.json(
        { mensaje: "Usuario no autenticado" },
        { status: 403 }
      );

    const formData = await request.formData();
    
    // Obtener los archivos del formData
    const files = formData.getAll("files[]");
    let responseFiles = [];

    // Subir cada archivo a Firebase Storage
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer(); // Obtener el contenido del archivo como ArrayBuffer
      const fileName = `${Date.now()}_${file.name}`; // Crear un nombre único para el archivo
      
      const fileUpload = bucket.file(fileName);

      const writeStream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.type,
        },
      });

      // Escribir el buffer en el stream de Firebase Storage
      writeStream.end(Buffer.from(arrayBuffer));

      await new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });

      // Obtener la URL pública del archivo
      await fileUpload.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      
      responseFiles.push({
        file_name: file.name,
        file_path: publicUrl,
        file_type: file.type,
      });
    }

    return Response.json({ mensaje: "Archivos subidos y URLs guardadas", files:responseFiles });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return Response.json(error, { status: 500 });
  }
}
