"use server";
import { getServerSession } from "next-auth";

import conn from "../lib/db";
import { authOptions } from "../api/auth/[...nextauth]/route.js";

import { getMyUser } from "./users";

export async function getStar(user) {
  try {
    const { rows: data } = await conn.query(
      `select * from stars s where s.used = false and s.user_id = $1`,
      [user.user_id],
    );

    return data[0];
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}

export async function getMyPDF() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email) return { error: "Ocurrio un error!" };

    const { rows: result } = await conn.query(
      "SELECT * FROM users WHERE email=$1",
      [session.user.email],
    );

    const user = result[0];

    if (!user) return { error: "Debe iniciar sesion para continuar!" };

    const { rows: data } = await conn.query(
      `select * from files_ia fi where fi.user_id =$1 order by created_at desc`,
      [user.user_id],
    );

    return data;
  } catch (error) {
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
        [file.file_id],
      );

      dataCuestionarios = dataCuestionarios.concat(
        cuestionarios.map((d) => ({ ...d, file_name: file.name })),
      );

      const { rows: mindMaps } = await conn.query(
        `select * from mind_maps mm where file_id = $1;`,
        [file.file_id],
      );

      dataMindMaps = dataMindMaps.concat(
        mindMaps.map((d) => ({ ...d, file_name: file.name })),
      );

      const { rows: fcList } = await conn.query(
        `select * from flashcars f where file_id = $1;`,
        [file.file_id],
      );
      const flashCards = [];

      for (const fc of fcList) {
        const { rows: cards } = await conn.query(
          `select * from cards c where flash_card_id = $1`,
          [fc.flash_card_id],
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
      [file_id, JSON.stringify(newData)],
    );

    return true;
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}

export async function saveMindMap({ file_id, edges, nodes }) {
  try {
    const user = await getMyUser();

    if (!user) return { error: "Debe iniciar sesion para continuar!" };

    await conn.query(
      `insert into mind_maps(file_id,edges,nodes) values($1,$2,$3);`,
      [file_id, JSON.stringify(edges), JSON.stringify(nodes)],
    );

    return true;
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}

export async function saveCards({ file_id, cards }) {
  try {
    const user = await getMyUser();

    if (!user) return { error: "Debe iniciar sesion para continuar!" };

    const { rows: flashCards } = await conn.query(
      `insert into flashcars(file_id) values($1) RETURNING flash_card_id`,
      [file_id],
    );

    const flashCardId = flashCards[0].flash_card_id;

    for (const card of cards) {
      await conn.query(
        `insert into cards(flash_card_id,front,back) values($1,$2,$3)`,
        [flashCardId, card.front, card.back],
      );
    }

    return true;
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}
