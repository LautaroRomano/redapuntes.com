'use server'
import { getServerSession } from 'next-auth'
import conn from '../lib/db'
import bcrypt from 'bcryptjs'
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

export async function create({ email, password, confirmPassword, accountname, username }) {
    try {
        if (!email || !password || !confirmPassword || !accountname || !username)
            return { error: 'Debe completar todos los campos' }

        if (password !== confirmPassword)
            return { error: 'Las contrasenas no coinciden' }

        const hashedPassword = await bcrypt.hash(password, 10)
        const lowerEmail = email.toLowerCase()
        const lowerUsername = username.toLowerCase()
        await conn.query(`
        insert into users(email,password_hash,accountname,username) values($1,$2,$3,$4)
        `, [lowerEmail, hashedPassword, accountname, lowerUsername])
        return { ok: true }

    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
        return { error: 'Error inesperado' }
    }
}

export async function getUserByUsername(username) {
    const user = await getMyUser();

    try {
        const { rows: data } = await conn.query(`
        select u.user_id, u.username, u.accountname, u.email, u.img, u.about
        from users u
        where u.username = $1
        `, [username])

        if (data[0]) {
            const profile = { ...data[0], myProfile: false }

            if (profile.email === user.email) {
                profile.myProfile = true
            }

            const { rows: follows } = await conn.query(`
                select * from follows f where f.follower_id = $1 and f.followed_id =$2
            `, [user.user_id, profile.user_id])

            profile.isFollow = !!follows[0]

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

export async function follow(user_id) {
    const user = await getMyUser();
    if (user.error) return { error: 'Debe iniciar sesion!' }
    try {
        await conn.query(`
        insert into follows(follower_id,followed_id) values($1,$2)
        `, [user.user_id, user_id])

        return { ok: true }
    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
        return { error: 'Error inesperado' }
    }
}

export async function unfollow(user_id) {
    const user = await getMyUser();
    if (user.error) return { error: 'Debe iniciar sesion!' }
    try {
        await conn.query(`
        delete from follows where follower_id = $1 and followed_id = $2
        `, [user.user_id, user_id])

        return { ok: true }
    } catch (error) {
        console.log("🚀 ~ get ~ error:", error)
        return { error: 'Error inesperado' }
    }
}