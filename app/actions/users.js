'use server'
import { getServerSession } from 'next-auth'
import conn from '../lib/db'
import bcrypt from 'bcryptjs'
import { authOptions } from '../api/auth/[...nextauth]/route'

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

export async function getUserByUsername(username) {
    const session = await getServerSession(authOptions)

    let userEmail
    if (session && session.user.email) userEmail = session.user.email

    try {
        const { rows: data } = await conn.query(`
        select u.user_id, u.username, u.accountname, u.email, u.img, u.about
        from users u
        where u.username = $1
        `, [username])
        if (data[0]) {

            const profile = { ...data[0], myProfile: false }

            if (profile.email === userEmail) {
                profile.myProfile = true
            }

            const posts = []
            const { rows: postsList } = await conn.query(`
                select p.post_id,p."content", p.created_at, u.user_id, u.username, u.accountname
                from posts p join users u on u.user_id = p.user_id
                where p.user_id = $1
                order by p.created_at desc
            `, [profile.user_id])

            for (const dat of postsList) {
                const { rows: files } = await conn.query(`
            select pf.file_name, pf.file_path from pdf_files pf where post_id = $1
            `, [dat.post_id])
                posts.push({ ...dat, files })
            }
            profile.posts = posts

            return profile
        }
        else {
            return { error: true }
        }
    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
    }
}

export async function updateUser({ accountName, about, img }) {
    const session = await getServerSession(authOptions)
    try {
        if (!accountName)
            return { error: 'Debe Ingresar su nombre' }

        const { rows: users } = await conn.query(`
        select * from users 
        where email = $1
        `, [session.user.email])

        await conn.query(`
        update users set 
        accountname = $1,
        about = $2,
        img = $3
        where user_id = $4
        `, [accountName, about, img, users[0].user_id])

        return { ok: true }

    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
        return { error: 'Error inesperado' }
    }
}