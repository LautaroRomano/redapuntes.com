"use server";
import conn from "../lib/db";

import { getMyUser } from "./users";

export async function create(content, files, selected) {
  try {
    const user = await getMyUser();

    if (!user) return { error: "Debe iniciar sesion para continuar!" };
    if (!content || content.length === 0)
      return { error: "Debes escribir algo!" };

    const { rows: posts } = await conn.query(
      `
            INSERT INTO posts(user_id, content,tags,university_id,career_id) 
            VALUES ($1, $2, $3, $4 ,$5) 
            RETURNING post_id
        `,
      [
        user.user_id,
        content,
        selected.content || null,
        selected.university,
        selected.carrer,
      ],
    );

    const insertedPostId = posts[0].post_id;

    for (const file of files) {
      await conn.query(
        `insert into pdf_files(post_id,file_name,file_path,file_type) values($1,$2,$3,$4)`,
        [insertedPostId, file.file_name, file.file_path, file.file_type],
      );
    }

    if (files && files.length > 0) {
      const { rows: missions } = await conn.query(
        `select * from missions m 
      WHERE TYPE ='MAKE_PUBLICATION' and expiration >= CURRENT_DATE and reclaimed = false and completed = false and user_id = $1 
      order by completed desc;`,
        [user.user_id],
      );

      for (const mission of missions) {
        const { amount, final_amount, mission_id } = mission;
        const completed = amount + 1 >= final_amount;

        await conn.query(
          `update missions set amount = $1, completed =$2 where mission_id = $3`,
          [amount + 1, completed, mission_id],
        );
      }
    }

    return { ok: true };
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}

export async function get(type, limit = 10, offset = 0, filters) {
  try {
    const user = await getMyUser();

    let baseQuery = `
      select distinct p.*, u.user_id, u.username, u.accountname, u.img
      from posts p 
      join users u ON p.user_id = u.user_id
    `;

    let conditions = [];
    let queryParams = [];

    if (type === "Siguiendo") {
      baseQuery += `
        where u.user_id in (
          select f.followed_id from follows f where f.follower_id = $1
        )
      `;
      queryParams.push(user.user_id);
    } else {
      baseQuery += ` where 1=1 `;
    }

    if (filters?.contents?.length > 0) {
      conditions.push(`p.tags IS NOT NULL AND array_length(p.tags, 1) > 0`);
    }

    if (filters?.university) {
      conditions.push(`p.university_id = $${queryParams.length + 1}`);
      queryParams.push(filters.university);
    }

    if (filters?.career) {
      conditions.push(`p.career_id = $${queryParams.length + 1}`);
      queryParams.push(filters.career);
    }

    if (conditions.length > 0) {
      baseQuery += ` AND ` + conditions.join(" AND ");
    }

    baseQuery += `
      order by p.created_at desc
      limit $${queryParams.length + 1} offset $${queryParams.length + 2};
    `;

    queryParams.push(limit, offset);

    const { rows: posts } = await conn.query(baseQuery, queryParams);

    // Filtrar los posts de acuerdo a los contenidos si es necesario
    let data = posts.filter((po) => {
      if (!filters?.contents?.length) return true;

      return filters.contents.some((content) => po.tags.includes(content));
    });

    // Ejecutar todas las consultas en paralelo
    const promises = data.map(async (dat) => {
      const [files, likes, comments, liked, university, career] =
        await Promise.all([
          conn.query(
            `select pf.file_name, pf.file_path, pf.file_type from pdf_files pf where post_id = $1`,
            [dat.post_id],
          ),
          conn.query(
            `select count(*) from post_likes pl where pl.post_id = $1`,
            [dat.post_id],
          ),
          conn.query(`select count(*) from "comments" c where c.post_id = $1`, [
            dat.post_id,
          ]),
          conn.query(
            `select * from post_likes pl where pl.post_id = $1 and pl.user_id = $2`,
            [dat.post_id, user.user_id],
          ),
          conn.query(
            `select * from universities u where u.university_id = $1`,
            [dat.university_id],
          ),
          conn.query(`select * from careers u where u.career_id = $1`, [
            dat.career_id,
          ]),
        ]);

      const isLiked = !!liked.rows[0];

      return {
        ...dat,
        files: files.rows,
        isLiked,
        likes: likes.rows[0].count * 1,
        comments: comments.rows[0].count * 1,
        university: university.rows[0],
        career: career.rows[0],
      };
    });

    const response = await Promise.all(promises);

    return response;
  } catch (error) {
    return { error: "Ocurrió un error!" };
  }
}

export async function getPostsByUserId(user_id, limit = 10, offset = 0) {
  try {
    const user = await getMyUser();

    const { rows: data } = await conn.query(
      `
      select distinct p.*, u.user_id, u.username, u.accountname, u.img
      from posts p
      join users u ON p.user_id = u.user_id
      where u.user_id = $1
      order by p.created_at desc
      limit $2 offset $3;
      `,
      [user_id, limit, offset],
    );

    // Ejecutar todas las consultas en paralelo
    const promises = data.map(async (dat) => {
      const [files, likes, comments, liked, university, career] =
        await Promise.all([
          conn.query(
            `select pf.file_name, pf.file_path, pf.file_type from pdf_files pf where post_id = $1`,
            [dat.post_id],
          ),
          conn.query(
            `select count(*) from post_likes pl where pl.post_id = $1`,
            [dat.post_id],
          ),
          conn.query(`select count(*) from "comments" c where c.post_id = $1`, [
            dat.post_id,
          ]),
          conn.query(
            `select * from post_likes pl where pl.post_id = $1 and pl.user_id = $2`,
            [dat.post_id, user.user_id],
          ),
          conn.query(
            `select * from universities u where u.university_id = $1`,
            [dat.university_id],
          ),
          conn.query(`select * from careers u where u.career_id = $1`, [
            dat.career_id,
          ]),
        ]);

      const isLiked = !!liked.rows[0];

      return {
        ...dat,
        files: files.rows,
        isLiked,
        likes: likes.rows[0].count * 1,
        comments: comments.rows[0].count * 1,
        university: university.rows[0],
        career: career.rows[0],
      };
    });

    const response = await Promise.all(promises);

    return response;
  } catch (error) {
    return { error: "Ocurrió un error!" };
  }
}

export async function getPostById(post_id) {
  try {
    const user = await getMyUser();

    const { rows: data } = await conn.query(
      `
      select p.*, u.user_id, u.username, u.accountname, u.img
      from posts p
      join users u ON p.user_id = u.user_id
      where p.post_id = $1
      `,
      [post_id],
    );

    if (data.length === 0) return { error: "Post no encontrado!" };

    // Ejecutar todas las consultas en paralelo
    const [files, likes, comments, liked, university, career] =
      await Promise.all([
        conn.query(
          `select pf.file_name, pf.file_path, pf.file_type from pdf_files pf where post_id = $1`,
          [data[0].post_id],
        ),
        conn.query(`select count(*) from post_likes pl where pl.post_id = $1`, [
          data[0].post_id,
        ]),
        conn.query(`select count(*) from "comments" c where c.post_id = $1`, [
          data[0].post_id,
        ]),
        conn.query(
          `select * from post_likes pl where pl.post_id = $1 and pl.user_id = $2`,
          [data[0].post_id, user.user_id],
        ),
        conn.query(`select * from universities u where u.university_id = $1`, [
          data[0].university_id,
        ]),
        conn.query(`select * from careers u where u.career_id = $1`, [
          data[0].career_id,
        ]),
      ]);

    const isLiked = !!liked.rows[0];

    return {
      ...data[0],
      files: files.rows,
      isLiked,
      likes: likes.rows[0].count * 1,
      comments: comments.rows[0].count * 1,
      university: university.rows[0],
      career: career.rows[0],
    };
  } catch (error) {
    return { error: "Ocurrió un error!" };
  }
}

export async function setLike(post_id) {
  try {
    const user = await getMyUser();

    if (user.error) return { error: "Debe iniciar sesion!" };

    const { rows: liked } = await conn.query(
      `select * from post_likes where user_id =$1 and post_id = $2`,
      [user.user_id, post_id],
    );
    const isLiked = !!liked[0];

    if (!isLiked)
      await conn.query(
        `insert into post_likes(post_id, user_id) values($1, $2)`,
        [post_id, user.user_id],
      );
    else
      await conn.query(
        `delete from post_likes where post_id = $1 and user_id = $2`,
        [post_id, user.user_id],
      );

    const postById = await getPostById(post_id);

    const { rows: missions } = await conn.query(
      `select * from missions m 
      WHERE TYPE ='GET_LIKE' and expiration >= CURRENT_DATE and reclaimed = false and completed = false and user_id = $1 
      order by completed desc;`,
      [postById.user_id],
    );

    for (const mission of missions) {
      const { amount, final_amount, mission_id } = mission;
      const completed = amount + 1 >= final_amount;

      await conn.query(
        `update missions set amount = $1, completed =$2 where mission_id = $3`,
        [amount + 1, completed, mission_id],
      );
    }

    return postById;
  } catch (error) {
    return await getPostById(post_id);
  }
}

export async function getComments(post_id) {
  try {
    /*  
        const user = await getMyUser();
        if (user.error) return { error: 'Debe iniciar sesion!' } 
        */

    const { rows: comments } = await conn.query(
      `
        select c.comment_id,c."content",u.username,u.img,c.created_at
        from "comments" c 
        join users u on u.user_id = c.user_id
        where c.post_id = $1
        `,
      [post_id],
    );

    return comments;
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}

export async function setComment(post_id, content) {
  try {
    const user = await getMyUser();

    if (user.error) return { error: "Debe iniciar sesion!" };

    await conn.query(
      `
        insert into "comments"(post_id,user_id,"content") values($1,$2,$3)
        `,
      [post_id, user.user_id, content],
    );

    const { rows: comments } = await conn.query(
      `
        select c.comment_id,c."content",u.username,u.img,c.created_at
        from "comments" c 
        join users u on u.user_id = c.user_id
        where c.post_id = $1
        `,
      [post_id],
    );

    const { rows: missions } = await conn.query(
      `select * from missions m 
    WHERE TYPE ='MAKE_COMMENT' and expiration >= CURRENT_DATE and reclaimed = false and completed = false and user_id = $1 
    order by completed desc;`,
      [user.user_id],
    );

    for (const mission of missions) {
      const { amount, final_amount, mission_id } = mission;
      const completed = amount + 1 >= final_amount;

      await conn.query(
        `update missions set amount = $1, completed =$2 where mission_id = $3`,
        [amount + 1, completed, mission_id],
      );
    }

    return comments;
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}

function transformQuery(query) {
  return query.split(" ").join(" & ");
}

export async function searchPosts(query, limit = 10, offset = 0, filters) {
  try {
    const user = await getMyUser();
    let baseQuery = `
      select distinct p.*, u.user_id, u.username, u.accountname, u.img
      from posts p 
      join users u ON p.user_id = u.user_id
      WHERE tsv @@ to_tsquery('spanish', $1)
    `;

    const transformedQuery = transformQuery(query);

    let conditions = [];
    let queryParams = [transformedQuery];

    if (filters && filters.contents && filters.contents.length > 0) {
      conditions.push(`p.tags IS NOT NULL AND array_length(p.tags, 1) > 0`);
    }

    if (filters && filters.university) {
      conditions.push(`p.university_id = $${queryParams.length + 1}`);
      queryParams.push(filters.university);
    }

    if (filters && filters.career) {
      conditions.push(`p.career_id = $${queryParams.length + 1}`);
      queryParams.push(filters.career);
    }

    if (conditions.length > 0) {
      baseQuery += ` AND ` + conditions.join(" AND ");
    }

    baseQuery += `
      order by p.created_at desc
      limit $${queryParams.length + 1} offset $${queryParams.length + 2};
    `;

    queryParams.push(limit, offset);

    const { rows: posts } = await conn.query(baseQuery, queryParams);

    let data = posts.filter((po) => {
      let b = false;

      if (!filters || !filters.contents || !filters.contents.length > 0)
        return true;
      else {
        filters.contents.forEach((content) => {
          if (po.tags.includes(content)) b = true;
        });

        return b;
      }
    });

    const response = [];

    for (const dat of data) {
      const { rows: files } = await conn.query(
        `select pf.file_name, pf.file_path, pf.file_type from pdf_files pf where post_id = $1`,
        [dat.post_id],
      );

      const { rows: likes } = await conn.query(
        `select count(*) from post_likes pl where pl.post_id = $1`,
        [dat.post_id],
      );

      const { rows: comments } = await conn.query(
        `select count(*) from "comments" c where c.post_id = $1`,
        [dat.post_id],
      );

      const { rows: liked } = await conn.query(
        `select * from post_likes pl where pl.post_id = $1 and pl.user_id = $2`,
        [dat.post_id, user.user_id],
      );

      const isLiked = !!liked[0];
      const { rows: university } = await conn.query(
        `select * from universities u where u.university_id = $1`,
        [dat.university_id],
      );
      const { rows: career } = await conn.query(
        `select * from careers u where u.career_id = $1`,
        [dat.career_id],
      );

      response.push({
        ...dat,
        files,
        isLiked,
        likes: likes[0].count * 1,
        comments: comments[0].count * 1,
        university: university[0],
        career: career[0],
      });
    }

    return response;
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}
