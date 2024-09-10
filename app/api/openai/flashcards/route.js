import OpenAI from "openai";

import { getMyUser } from "@/app/actions/users";
import conn from "@/app/lib/db";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const countCards = 2;

    const user = await getMyUser();

    if (!user) {
      return new Response(
        JSON.stringify({ mensaje: "Usuario no autenticado" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { rows: stars } = await conn.query(
      `select * from stars s where s.used = false and s.user_id = $1`,
      [user.user_id],
    );

    if (!stars[0]) {
      return new Response(
        JSON.stringify({
          mensaje: "Debes conseguir estrellas para continuar!",
        }),
        {
          status: 499,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    await conn.query(`update stars s set used=$1 where s.star_id=$2`, [
      true,
      stars[0].star_id,
    ]);

    // Usamos streaming de OpenAI
    const completionStream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        {
          role: "system",
          content: `
          Eres un profesor universitario especializado en crear tarjetas didacticas para ayudar a los estudiantes a repasar antes de un examen. Dado un texto largo, tu tarea es generar exactamente ${countCards} tarjetas con un frente y un dorso que cubran los conceptos clave presentados en el texto. 

          Instrucciones específicas:
          1. **Relación directa con el texto**: Cada tarjeta debe estar claramente relacionada con un concepto importante o sección del texto.
          2. **Nivel avanzado**: Las tarjetas deben ser desafiantes, requiriendo una comprensión profunda del material.
          3. **Variedad en la cobertura**: Asegúrate de que las tarjetas aborden diferentes partes y aspectos del texto para garantizar una revisión completa.
          5. **Frente de la tarjeta**: El frente de la tarjeta proporciona una pregunta relacionada con el contexto del texto.
          5. **Dorso de la tarjeta**: El dorso de la tarjeta proporciona una respuesta en forma de justificación explicando la respuesta de la pregunta en el contexto del texto.

          Formato de salida esperado:
          [
            {
                "front": "Pregunta 1",
                "back": "Respuesta con una breve justificación basada en el texto"
            },
            ...
          ]
          `,
        },
        {
          role: "user",
          content: `texto: ${body.text}.`,
        },
      ],
    });

    // Aquí creamos un ReadableStream para enviar la respuesta progresivamente
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completionStream) {
            // Convierte cada parte de la respuesta en bytes y añade un separador para distinguir cada chunk
            controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n\n"));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ mensaje: "Error en el servidor", error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
