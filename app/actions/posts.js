'use server'
import { getServerSession } from 'next-auth'
import conn from '../lib/db'
import { authOptions } from '../api/auth/[...nextauth]/route'

const getMyUser = async () => {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.email) return { error: 'Ocurrio un error!' }

    const { rows: result } = await conn.query(
        'SELECT * FROM users WHERE email=$1',
        [session.user.email]
    );

    const user = result[0]
    return user
}

export async function create(content, files) {
    try {
        const user = await getMyUser();
        if (user.error) return { error: 'Ocurrio un error!' }

        const { rows: result } = await conn.query(
            'SELECT * FROM users WHERE email=$1',
            [user.email]
        );

        if (!user) return { error: 'Ocurrio un error!' }

        const { rows: posts } = await conn.query(`
            INSERT INTO posts(user_id, content) 
            VALUES ($1, $2) 
            RETURNING post_id
        `, [user.user_id, content]);

        const insertedPostId = posts[0].post_id;

        for (const file of files) {
            await conn.query(`
            insert into pdf_files(post_id,file_name,file_path) values($1,$2,$3)
            `, [insertedPostId, file.file_name, file.file_path])
        }

        return { ok: true }
    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
        return { error: 'Ocurrio un error!' }
    }
}

export async function get(type) {
    try {
        const user = await getMyUser();
        //if (user.error) return { error: 'Ocurrio un error!' }


        let data = []

        if (type === 'Siguiendo') {
            const { rows: posts } = await conn.query(`
            select p.post_id,p."content", p.created_at, u.user_id, u.username, u.accountname, u.img
            from posts p 
            join users u ON p.user_id = u.user_id
            where u.user_id in (
                select f.followed_id from follows f where f.follower_id = $1
            )
            order by p.created_at desc;
            `, [user.user_id])
            data = posts
        } else {
            const { rows: posts } = await conn.query(`
            select p.post_id,p."content", p.created_at, u.user_id, u.username, u.accountname, u.img
            from posts p join users u ON p.user_id = u.user_id
            order by p.created_at desc
            `)
            data = posts
        }

        const response = []

        for (const dat of data) {

            const { rows: files } = await conn.query(`
            select pf.file_name, pf.file_path from pdf_files pf where post_id = $1
            `, [dat.post_id])

            const { rows: likes } = await conn.query(`
            select count(*) from post_likes pl where pl.post_id = $1
            `, [dat.post_id])

            const { rows: comments } = await conn.query(`
            select count(*) from "comments" c where c.post_id = $1
            `, [dat.post_id])

            const { rows: liked } = await conn.query(`
            select * from post_likes pl where pl.post_id = $1 and pl.user_id = $2
            `, [dat.post_id, user.user_id])

            const isLiked = !!liked[0]

            response.push({
                ...dat,
                files,
                isLiked,
                likes: likes[0].count * 1,
                comments: comments[0].count * 1,
            })
        }

        return response
    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
    }
}
export async function getPostById(post_id) {
    try {

        const user = await getMyUser();
        if (user.error) return { error: 'Ocurrio un error!' }

        const { rows: data } = await conn.query(`
        select p.post_id,p."content", p.created_at, u.user_id, u.username, u.accountname, u.img
        from posts p join users u ON p.user_id = u.user_id
        where p.post_id = $1
        `, [post_id])

        const { rows: files } = await conn.query(`
            select pf.file_name, pf.file_path from pdf_files pf where post_id = $1
            `, [data[0].post_id])

        const { rows: likes } = await conn.query(`
            select count(*) from post_likes pl where pl.post_id = $1
            `, [data[0].post_id])

        const { rows: comments } = await conn.query(`
            select count(*) from "comments" c where c.post_id = $1
            `, [data[0].post_id])

        const { rows: liked } = await conn.query(`
            select * from post_likes pl where pl.post_id = $1 and pl.user_id = $2
            `, [data[0].post_id, user.user_id])

        const isLiked = !!liked[0]

        return {
            ...data[0],
            files,
            isLiked,
            likes: likes[0].count * 1,
            comments: comments[0].count * 1,
        }
    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
    }
}

export async function setLike(post_id) {
    try {
        const user = await getMyUser();
        if (user.error) return { error: 'Ocurrio un error!' }

        const { rows: liked } = await conn.query(`select * from post_likes where user_id =$1 and post_id = $2`, [user.user_id, post_id]);
        const isLiked = !!liked[0]

        if (!isLiked)
            await conn.query(`insert into post_likes(post_id, user_id) values($1, $2)`, [post_id, user.user_id]);
        else await conn.query(`delete from post_likes where post_id = $1 and user_id = $2`, [post_id, user.user_id]);

        return await getPostById(post_id)
    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
        return await getPostById(post_id)
    }
}

export async function getComments(post_id) {
    try {
        /*  
        const user = await getMyUser();
        if (user.error) return { error: 'Ocurrio un error!' } 
        */

        const { rows: comments } = await conn.query(`
        select c.comment_id,c."content",u.username,u.img,c.created_at
        from "comments" c 
        join users u on u.user_id = c.user_id
        where c.post_id = $1
        `, [post_id]);

        return comments
    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
        return { error: 'Ocurrio un error!' }
    }
}

export async function setComment(post_id, content) {
    try {

        const user = await getMyUser();
        if (user.error) return { error: 'Ocurrio un error!' }


        await conn.query(`
        insert into "comments"(post_id,user_id,"content") values($1,$2,$3)
        `, [post_id, user.user_id, content])

        const { rows: comments } = await conn.query(`
        select c.comment_id,c."content",u.username,u.img,c.created_at
        from "comments" c 
        join users u on u.user_id = c.user_id
        where c.post_id = $1
        `, [post_id]);

        return comments
    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
        return { error: 'Ocurrio un error!' }
    }
}


function transformQuery(query) {
    return query.split(' ').join(' & ');
}

export async function searchPosts(query) {
    const user = await getMyUser();
    try {
        const transformedQuery = transformQuery(query);

        const { rows: res } = await conn.query(`
        select p.post_id,p."content", p.created_at, u.user_id, u.username, u.accountname, u.img
        FROM posts p
        join users u ON p.user_id = u.user_id
        WHERE tsv @@ to_tsquery('spanish', $1);
      `, [transformedQuery]);

        const response = []

        for (const dat of res) {

            const { rows: files } = await conn.query(`
          select pf.file_name, pf.file_path from pdf_files pf where post_id = $1
          `, [dat.post_id])

            const { rows: likes } = await conn.query(`
          select count(*) from post_likes pl where pl.post_id = $1
          `, [dat.post_id])

            const { rows: comments } = await conn.query(`
          select count(*) from "comments" c where c.post_id = $1
          `, [dat.post_id])

            const { rows: liked } = await conn.query(`
          select * from post_likes pl where pl.post_id = $1 and pl.user_id = $2
          `, [dat.post_id, user.user_id])

            const isLiked = !!liked[0]

            response.push({
                ...dat,
                files,
                isLiked,
                likes: likes[0].count * 1,
                comments: comments[0].count * 1,
            })
        }

        return response
    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
        return { error: 'Ocurrio un error!' }
    }
}