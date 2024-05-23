'use server'
import conn from '../lib/db'
import bcrypt from 'bcryptjs'

export async function create({ email, password, confirmPassword, accountname, username }) {
    try {
        if (!email || !password || !confirmPassword || !accountname || !username)
            return { error: 'Debe completar todos los campos' }

        if (password !== confirmPassword)
            return { error: 'Las contrasenas no coinciden' }

        const hashedPassword = await bcrypt.hash(password, 10)

        await conn.query(`
        insert into users(email,password_hash,accountname,username) values($1,$2,$3,$4)
        `, [email, hashedPassword, accountname, username])
        return { ok: true }

    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
        return { error: 'Error inesperado' }
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