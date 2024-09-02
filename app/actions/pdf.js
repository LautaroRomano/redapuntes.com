"use server";
import { getServerSession } from "next-auth";
import conn from "../lib/db";
import { authOptions } from "../api/auth/[...nextauth]/route";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const getMyUser = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session?.user?.email)
    return { error: "Debe iniciar sesion para continuar!" };

  const { rows: result } = await conn.query(
    "SELECT * FROM users WHERE email=$1",
    [session.user.email]
  );

  const user = result[0];

  return user;
};

export async function getMyPDF() {
  try {
    const user = await getMyUser();
    if (!user) return { error: "Debe iniciar sesion para continuar!" };

    const { rows: data } = await conn.query(
      `select * from files_ia fi where fi.user_id =$1;`,
      [user.user_id]
    );

    return data;
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);

    return { error: "Ocurrio un error!" };
  }
}

export async function generateCuestionario(text) {
  try {
    const user = await getMyUser();

    const openAiRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content: `
          Dado un texto largo, genera 15 preguntas de opción múltiple que ayuden a un estudiante a repasar los conceptos clave antes de un examen. 
          Cada pregunta debe estar en el formato JSON detallado a continuación. Las preguntas deben ser de nivel avanzado y directamente relacionadas 
          con el contenido del texto. Cada pregunta debe tener cuatro respuestas posibles, de las cuales solo una es correcta. Además, proporciona una 
          breve justificación para cada respuesta correcta, basada en el texto proporcionado.
          [
            {
                "question": "Pregunta 1",
                "answers": [
                    {"text": "Respuesta incorrecta 1", "isTrue": false},
                    {"text": "Respuesta incorrecta 2", "isTrue": false},
                    {"text": "Respuesta incorrecta 3", "isTrue": false},
                    {"text": "Respuesta correcta", "isTrue": true}
                ],
                "justification": "Breve justificación basada en el texto"
            },
            ...
            {
                "question": "Pregunta 15",
                "answers": [
                    {"text": "Respuesta incorrecta 1", "isTrue": false},
                    {"text": "Respuesta incorrecta 2", "isTrue": false},
                    {"text": "Respuesta incorrecta 3", "isTrue": false},
                    {"text": "Respuesta correcta", "isTrue": true}
                ],
                "justification": "Breve justificación basada en el texto"
            }
          ]
          `,
        },
        {
          role: "user",
          content: `texto: ${text}.`,
        },
      ],
    });
    const resText = (await openAiRes).choices[0].message.content;
    console.log(resText);

    return JSON.parse(resText);
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);
    return { error: "Ocurrio un error!" };
  }
}
