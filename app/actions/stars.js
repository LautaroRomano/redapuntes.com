"use server";
import conn from "../lib/db";

import { getMyUser } from "./users";

export async function reclaimStar(mission) {
  try {
    const session = await getMyUser();

    if (!session) return { error: "Debe iniciar sesion para continuar!" };

    const { rows: data } = await conn.query(
      `select * from missions m 
        WHERE expiration >= CURRENT_DATE and reclaimed = false and completed = true and mission_id = $1;`,
      [mission.mission_id],
    );

    if (!data[0]) return { error: "Error al verificar la mision" };

    await conn.query(
      `update missions set reclaimed = true where mission_id = $1`,
      [mission.mission_id],
    );

    await conn.query(`insert into stars(user_id) values($1)`, [
      session.user_id,
    ]);

    const user = await getMyUser();

    return user;
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}
