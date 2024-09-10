import OpenAI from "openai";

import { getMyUser } from "@/app/actions/users";
import conn from "@/app/lib/db";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();

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
          Eres un profesor universitario experto en crear mapas mentales para ayudar a estudiantes a repasar antes de un examen. Tu tarea es identificar los conceptos clave de un texto largo y organizar estos conceptos en un mapa mental estructurado. Cada concepto clave debe convertirse en un nodo, y los nodos deben estar conectados entre sí de manera lógica según su relación en el texto.

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
    console.error("Error en la solicitud:", error);

    return new Response(
      JSON.stringify({ mensaje: "Error en el servidor", error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
