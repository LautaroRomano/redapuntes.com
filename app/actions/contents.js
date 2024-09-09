"use server";
import conn from "../lib/db";

export async function getContents() {
  try {
    const { rows: data } = await conn.query(`select * from contents;`);

    return data;
  } catch (error) {
    return { error: "Ocurrio un error!", message: error };
  }
}
