"use server";
import { getServerSession } from "next-auth";
import conn from "../lib/db";
import { authOptions } from "../api/auth/[...nextauth]/route";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY
});

const getMyUser = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.email) return { error: "Debe iniciar sesion para continuar!" };

  const { rows: result } = await conn.query(
    "SELECT * FROM users WHERE email=$1",
    [session.user.email],
  );

  const user = result[0];

  return user;
};

export async function getMyPDF() {
  try {
    const user = await getMyUser()
    const { rows: data } = await conn.query(`select * from files_ia fi where fi.user_id =$1;`, [user.user_id]);

    return data;
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);

    return { error: "Ocurrio un error!" };
  }
}

export async function generateCuestionario(text) {
  try {
    const user = await getMyUser()

    const openAiRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      messages: [
        {
          role: 'system',
          content: `Eres un profesorr de universidad con amplia experiencia en muchos campos, experto en interpresar texto
              y generar preguntas de seleccion multiple para tus alumnos. Utiliza el texto proporcionado entre las etiquetas
              <text></text>, genera una respuesta con el siguiente formato [{"question": string,"answers": [{"text":string,"isTrue": boolean}]]`
        },
        {
          role: 'user',
          content: `<text>${text}</text>`
        }
      ]
    });
    const resText = (await openAiRes).choices[0].message.content

    return JSON.parse(resText);
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);
    return { error: "Ocurrio un error!" };
  }
}
