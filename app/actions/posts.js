'use server'
import conn from '../lib/db'

export async function create(user_id, content) {
    console.log("🚀 ~ create ~ user_id, content:", user_id, content)
    try {
        await conn.query(`
        insert into posts(user_id,"content") values($1,$2)
        `, [user_id, content])
        return true
    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
    }
}

export async function get() {
    try {
        const response = []
        const { rows: data } = await conn.query(`
        select p.post_id,p."content", p.created_at, u.user_id, u.username, u.first_name, u.last_name 
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