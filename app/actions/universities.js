"use server";
import conn from "../lib/db";

export async function getUniversities() {
  try {
    const { rows: data } = await conn.query(`select * from universities;`);

    return data;
  } catch (error) {
    return { error: "Ocurrio un error!", message: error };
  }
}

export async function getCarrer(university_id) {
  try {
    const { rows: data } = await conn.query(
      `select * from careers where university_id = $1`,
      [university_id],
    );

    return data;
  } catch (error) {
    return { error: "Ocurrio un error!", message: error };
  }
}
