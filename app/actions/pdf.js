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
      `select * from files_ia fi where fi.user_id =$1 order by created_at desc`,
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
          Eres una IA especializada en crear cuestionarios para ayudar a los estudiantes a repasar antes de un examen. Dado un texto largo, tu tarea es generar exactamente 8 preguntas de opción múltiple que cubran los conceptos clave presentados en el texto. 

          Instrucciones específicas:
          1. **Relación directa con el texto**: Cada pregunta debe estar claramente relacionada con un concepto importante o sección del texto.
          2. **Nivel avanzado**: Las preguntas deben ser desafiantes, requiriendo una comprensión profunda del material.
          3. **Variedad en la cobertura**: Asegúrate de que las preguntas aborden diferentes partes y aspectos del texto para garantizar una revisión completa.
          4. **Distractores plausibles**: Las respuestas incorrectas (distractores) deben ser razonables pero claramente incorrectas, basadas en una interpretación errónea o superficial del texto.
          5. **Justificación**: Proporciona una breve justificación para cada respuesta correcta, explicando por qué es correcta en el contexto del texto.

          Formato de salida esperado:
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
                "question": "Pregunta 8",
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

    return JSON.parse(resText);
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);
    return { error: "Ocurrio un error!" };
  }
}


export async function generateMindMap(text) {
  try {
    const user = await getMyUser();

    const openAiRes = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content: `
          Eres una IA experta en crear mapas mentales para ayudar a estudiantes a repasar antes de un examen. Tu tarea es identificar los conceptos clave de un texto largo y organizar estos conceptos en un mapa mental estructurado. Cada concepto clave debe convertirse en un nodo, y los nodos deben estar conectados entre sí de manera lógica según su relación en el texto.

          Instrucciones específicas:
          1. **Identifica conceptos clave y secundarios**: Los conceptos clave deben estar en la parte superior de la jerarquía del mapa mental, y los conceptos secundarios deben estar conectados a estos.
          2. **Relaciones entre conceptos**: Asegúrate de que cada conexión entre nodos refleje una relación lógica basada en el contenido del texto.
          3. **Distribución espacial**: Distribuye los nodos de manera que sean fáciles de leer y entender. Los nodos directamente relacionados deben estar más cerca entre sí.
          4. **Formato JSON**: Usa el siguiente formato para tu respuesta. Las posiciones (x, y) deben reflejar una distribución clara y organizada.

          Formato de respuesta:
          {
              "nodes": [
                  { "id": "1", "data": { "label": "Concepto Principal 1" }, "position": { "x": 0, "y": 0 }, "type": "input" },
                  { "id": "2", "data": { "label": "Subconcepto 1.1" }, "position": { "x": 100, "y": 100 }, "type": "default" },
                  { "id": "3", "data": { "label": "Subconcepto 1.2" }, "position": { "x": 100, "y": -100 }, "type": "default" },
                  ...
              ],
              "edges": [
                  { "id": "1-2", "source": "1", "target": "2", "label": "Relacionado con", "type": "smoothstep" },
                  { "id": "1-3", "source": "1", "target": "3", "label": "Relacionado con", "type": "smoothstep" },
                  ...
              ],
          }

          Asegúrate de que el mapa mental refleje con precisión las relaciones y jerarquías dentro del texto. Verifica que cada conexión entre nodos sea coherente y relevante en el contexto del tema.
          `,
        },
        {
          role: "user",
          content: `texto: ${text}.`,
        },
      ],
    });
    const resText = (await openAiRes).choices[0].message.content;

    return JSON.parse(resText);
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);
    return { error: "Ocurrio un error!" };
  }
}

