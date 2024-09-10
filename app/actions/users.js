"use server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import conn from "../lib/db";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const getMyUser = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email) return { error: "Ocurrio un error!" };

    const { rows: result } = await conn.query(
      "SELECT * FROM users WHERE email=$1",
      [session.user.email],
    );

    const user = result[0];

    if (user && user.password_hash) delete user.password_hash;

    const { rows: stars } = await conn.query(
      "SELECT * FROM stars WHERE used=$1 and user_id=$2",
      [false, user.user_id],
    );

    const { rows: missions } = await conn.query(
      `select * from missions m 
      WHERE expiration >= CURRENT_DATE and reclaimed = false and user_id=$1
      order by completed desc;`,
      [user.user_id],
    );

    return { ...user, stars, missions };
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
};

export async function create({
  email,
  password,
  confirmPassword,
  accountname,
  username,
}) {
  try {
    if (!email || !password || !confirmPassword || !accountname || !username)
      return { error: "Debe completar todos los campos" };

    if (password !== confirmPassword)
      return { error: "Las contrasenas no coinciden" };

    const hashedPassword = await bcrypt.hash(password, 10);
    const lowerEmail = email.toLowerCase();
    const lowerUsername = username.toLowerCase();

    const { rows: usersByUsername } = await conn.query(
      `
        select u.user_id
        from users u
        where u.username = $1
        `,
      [lowerUsername],
    );
    const { rows: usersByEmail } = await conn.query(
      `
        select u.user_id
        from users u
        where u.email = $1
        `,
      [lowerEmail],
    );

    if (usersByUsername[0])
      return { error: "Este nombre de usuario ya se encuentra en uso" };

    if (usersByEmail[0]) return { error: "Este email ya se encuentra en uso" };

    const { rows: newUser } = await conn.query(
      `insert into users(email,password_hash,accountname,username) values($1,$2,$3,$4) RETURNING user_id`,
      [lowerEmail, hashedPassword, accountname, lowerUsername],
    );
    const insertedUserId = newUser[0].user_id;

    await conn.query(
      `insert into missions(user_id,"type",amount,final_amount,expiration,mission_text,completed) values($1,'FREE',1,1,'01-01-2050','Una gatis para que empieces a estudiar!',true);`,
      [insertedUserId],
    );
    await conn.query(
      `insert into missions(user_id,"type",amount,final_amount,expiration,mission_text,completed) values($1,'FREE',1,1,'01-01-2050','Una gatis para que empieces a estudiar!',true);`,
      [insertedUserId],
    );
    await conn.query(
      `insert into missions(user_id,"type",amount,final_amount,expiration,mission_text,completed) values($1,'FREE',1,1,'01-01-2050','Una gatis para que empieces a estudiar!',true);`,
      [insertedUserId],
    );
    await conn.query(
      `insert into missions(user_id,"type",amount,final_amount,expiration,mission_text) values($1,'MAKE_PUBLICATION',0,1,'01-01-2050','Sube 1 apunte a la red');`,
      [insertedUserId],
    );
    await conn.query(
      `insert into missions(user_id,"type",amount,final_amount,expiration,mission_text) values($1,'MAKE_PUBLICATION',0,5,'01-01-2050','Sube 5 apuntes a la red');`,
      [insertedUserId],
    );
    await conn.query(
      `insert into missions(user_id,"type",amount,final_amount,expiration,mission_text) values($1,'MAKE_COMMENT',0,1,'01-01-2050','Realiza 1 comentario en algun apunte');`,
      [insertedUserId],
    );
    await conn.query(
      `insert into missions(user_id,"type",amount,final_amount,expiration,mission_text) values($1,'MAKE_COMMENT',0,5,'01-01-2050','Realiza 5 comentario en algun apunte');`,
      [insertedUserId],
    );
    await conn.query(
      `insert into missions(user_id,"type",amount,final_amount,expiration,mission_text) values($1,'GET_LIKE',0,5,'01-01-2050','Recibe 5 likes en tus apuntes');`,
      [insertedUserId],
    );
    await conn.query(
      `insert into missions(user_id,"type",amount,final_amount,expiration,mission_text) values($1,'GET_LIKE',0,15,'01-01-2050','Recibe 15 likes en tus apuntes');`,
      [insertedUserId],
    );

    return { ok: true };
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}

export async function getUserByUsername(username) {
  const user = await getMyUser();

  try {
    const { rows: data } = await conn.query(
      `
        select u.user_id, u.username, u.accountname, u.email, u.img, u.about
        from users u
        where u.username = $1
        `,
      [username],
    );

    if (data[0]) {
      const profile = { ...data[0], myProfile: false };

      if (profile.email === user.email) {
        profile.myProfile = true;
      }

      const { rows: follow } = await conn.query(
        `select * from follows f where f.follower_id = $1 and f.followed_id =$2`,
        [user.user_id, profile.user_id],
      );

      profile.isFollow = !!follow[0];

      const { rows: follows } = await conn.query(
        `select COUNT(*) as count from follows f where f.followed_id =$1`,
        [profile.user_id],
      );

      profile.follows = follows[0]?.count || 0;

      const { rows: followed } = await conn.query(
        `select COUNT(*) as count from follows f where f.follower_id = $1`,
        [profile.user_id],
      );

      profile.followed = followed[0]?.count || 0;

      return profile;
    } else {
      return { error: true };
    }
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}

export async function updateUser({ accountName, about, img }) {
  const session = await getServerSession(authOptions);

  try {
    if (!accountName) return { error: "Debe Ingresar su nombre" };

    const { rows: users } = await conn.query(
      `
        select * from users 
        where email = $1
        `,
      [session.user.email],
    );

    await conn.query(
      `
        update users set 
        accountname = $1,
        about = $2,
        img = $3
        where user_id = $4
        `,
      [accountName, about, img, users[0].user_id],
    );

    return { ok: true };
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}

export async function follow(user_id) {
  const user = await getMyUser();

  if (user.error) return { error: "Debe iniciar sesion!" };
  try {
    await conn.query(
      `
        insert into follows(follower_id,followed_id) values($1,$2)
        `,
      [user.user_id, user_id],
    );

    return { ok: true };
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}

export async function unfollow(user_id) {
  const user = await getMyUser();

  if (user.error) return { error: "Debe iniciar sesion!" };
  try {
    await conn.query(
      `
        delete from follows where follower_id = $1 and followed_id = $2
        `,
      [user.user_id, user_id],
    );

    return { ok: true };
  } catch (error) {
    return { error: "Ocurrio un error!" };
  }
}
