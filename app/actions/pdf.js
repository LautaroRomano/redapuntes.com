"use server";
import conn from "../lib/db";

import OpenAI from "openai";
import { getMyUser } from "./users";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function getStar(user) {
  try {
    const { rows: data } = await conn.query(
      `select * from stars s where s.used = false and s.user_id = $1`,
      [user.user_id]
    );

    return data[0];
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);
    return { error: "Ocurrio un error!" };
  }
}

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

export async function getSaved(files) {
  try {
    let dataCuestionarios = [];
    let dataFlashCards = [];
    let dataMindMaps = [];
    for (const file of files) {
      const { rows: cuestionarios } = await conn.query(
        `select * from cuestionarios c where file_id =$1;`,
        [file.file_id]
      );
      dataCuestionarios = dataCuestionarios.concat(
        cuestionarios.map((d) => ({ ...d, file_name: file.name }))
      );

      const { rows: mindMaps } = await conn.query(
        `select * from mind_maps mm where file_id = $1;`,
        [file.file_id]
      );
      dataMindMaps = dataMindMaps.concat(
        mindMaps.map((d) => ({ ...d, file_name: file.name }))
      );

      const { rows: fcList } = await conn.query(
        `select * from flashcars f where file_id = $1;`,
        [file.file_id]
      );
      const flashCards = [];
      for (const fc of fcList) {
        const { rows: cards } = await conn.query(
          `select * from cards c where flash_card_id = $1`,
          [fc.flash_card_id]
        );
        flashCards.push({ ...fc, cards, file_name: file.name });
      }
      dataFlashCards = dataFlashCards.concat(flashCards);
    }

    return {
      cuestionarios: dataCuestionarios,
      mindMaps: dataMindMaps,
      flashCards: dataFlashCards,
    };
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);

    return { error: "Ocurrio un error!" };
  }
}

export async function generateCuestionario(text) {
  const user = await getMyUser();
  if (!user) return { error: "Debe iniciar sesion para continuar!" };

  const star = await getStar(user);
  if (!star) return { error: "Consigue estrellas para continuar!" };

  try {
    await conn.query(`update stars s set used=$1 where s.star_id=$2`, [
      true,
      star.star_id,
    ]);

    const openAiRes = await openai.chat.completions.create({
      model: "GPT-4o-mini",
      messages: [
        {
          role: "system",
          content: `
          Eres un profesor universitario especializado en crear cuestionarios para ayudar a los estudiantes a repasar antes de un examen. Dado un texto largo, tu tarea es generar exactamente 8 preguntas de opción múltiple que cubran los conceptos clave presentados en el texto. 

          Instrucciones específicas:
          1. **Relación directa con el texto**: Cada pregunta debe estar claramente relacionada con un concepto importante o sección del texto.
          2. **Nivel intermedio**: Las preguntas deben ser desafiantes, requiriendo una comprensión del material.
          3. **Variedad en la cobertura**: Asegúrate de que las preguntas aborden diferentes partes y aspectos del texto para garantizar una revisión completa.
          4. **Justificación**: Proporciona una breve justificación para cada respuesta correcta, explicando por qué es correcta en el contexto del texto.

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
    console.log("🚀 ~ resText:", resText);

    return JSON.parse(resText);
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);

    await conn.query(`update stars s set used=$1 where s.star_id=$2`, [
      false,
      star.star_id,
    ]);

    return { error: "Ocurrio un error!" };
  }
}

export async function generateCards(text) {
  const user = await getMyUser();
  if (!user) return { error: "Debe iniciar sesion para continuar!" };

  const star = await getStar(user);
  if (!star) return { error: "Consigue estrellas para continuar!" };

  try {
    await conn.query(`update stars s set used=$1 where s.star_id=$2`, [
      true,
      star.star_id,
    ]);

    const openAiRes = await openai.chat.completions.create({
      model: "GPT-4o-mini",
      messages: [
        {
          role: "system",
          content: `
          Eres un profesor universitario especializado en crear tarjetas didacticas para ayudar a los estudiantes a repasar antes de un examen. Dado un texto largo, tu tarea es generar exactamente 8 tarjetas con un frente y un dorso que cubran los conceptos clave presentados en el texto. 

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
          content: `texto: ${text}.`,
        },
      ],
    });
    const resText = (await openAiRes).choices[0].message.content;
    console.log("🚀 ~ resText:", resText);

    return JSON.parse(resText);
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);
    await conn.query(`update stars s set used=$1 where s.star_id=$2`, [
      false,
      star.star_id,
    ]);
    return { error: "Ocurrio un error!" };
  }
}

export async function generateMindMap(text) {
  const user = await getMyUser();
  if (!user) return { error: "Debe iniciar sesion para continuar!" };

  const star = await getStar(user);
  if (!star) return { error: "Consigue estrellas para continuar!" };

  try {
    await conn.query(`update stars s set used=$1 where s.star_id=$2`, [
      true,
      star.star_id,
    ]);

    const openAiRes = await openai.chat.completions.create({
      model: "GPT-4o-mini",
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
          content: `texto: ${text}.`,
        },
      ],
    });
    const resText = (await openAiRes).choices[0].message.content;
    console.log("🚀 ~ resText:", resText);

    return JSON.parse(resText);
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);
    await conn.query(`update stars s set used=$1 where s.star_id=$2`, [
      false,
      star.star_id,
    ]);
    return { error: "Ocurrio un error!" };
  }
}

export async function saveCuestionario({ file_id, data }) {
  try {
    const user = await getMyUser();
    if (!user) return { error: "Debe iniciar sesion para continuar!" };

    const newData = data.map((d) => ({
      question: d.question,
      answers: d.answers,
      justification: d.justification,
    }));

    await conn.query(
      `insert into cuestionarios(file_id,"data") values($1,$2)`,
      [file_id, JSON.stringify(newData)]
    );

    return true;
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);
    return { error: "Ocurrio un error!" };
  }
}

export async function saveMindMap({ file_id, edges, nodes }) {
  try {
    const user = await getMyUser();
    if (!user) return { error: "Debe iniciar sesion para continuar!" };

    await conn.query(
      `insert into mind_maps(file_id,edges,nodes) values($1,$2,$3);`,
      [file_id, JSON.stringify(edges), JSON.stringify(nodes)]
    );

    return true;
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);
    return { error: "Ocurrio un error!" };
  }
}

export async function saveCards({ file_id, cards }) {
  try {
    const user = await getMyUser();
    if (!user) return { error: "Debe iniciar sesion para continuar!" };

    const { rows: flashCards } = await conn.query(
      `insert into flashcars(file_id) values($1) RETURNING flash_card_id`,
      [file_id]
    );

    const flashCardId = flashCards[0].flash_card_id;

    for (const card of cards) {
      await conn.query(
        `insert into cards(flash_card_id,front,back) values($1,$2,$3)`,
        [flashCardId, card.front, card.back]
      );
    }

    return true;
  } catch (error) {
    console.log("🚀 ~ get ~ error:", error);
    return { error: "Ocurrio un error!" };
  }
}
