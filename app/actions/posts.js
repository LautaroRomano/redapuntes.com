'use server'
import { getServerSession } from 'next-auth'
import conn from '../lib/db'
import { authOptions } from '../api/auth/[...nextauth]/route'

export async function create(content, files) {
    console.log("🚀files:", files)
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user.email) return { error: 'Ocurrio un error!' }

        const { rows: result } = await conn.query(
            'SELECT * FROM users WHERE email=$1',
            [session.user.email]
        );

        const user = result[0]
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

export async function get() {
    try {
        const response = []
        const { rows: data } = await conn.query(`
        select p.post_id,p."content", p.created_at, u.user_id, u.username, u.accountname
        from posts p join users u ON p.user_id = u.user_id
        order by p.created_at desc
        `)
        for (const dat of data) {
            const { rows: files } = await conn.query(`
            select pf.file_name, pf.file_path from pdf_files pf where post_id = $1
            `, [dat.post_id])
            response.push({ ...dat, files })
        }
        return response
    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
    }
}