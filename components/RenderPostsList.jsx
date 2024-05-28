import { useEffect, useState } from "react"
import PostCard from "./main/PostCard"
import { setLike } from "@/app/actions/posts"


export default function RenderPostsList({ postsList, disabled }) {

    const [posts, setPosts] = useState([])

    useEffect(() => {
        setPosts(postsList)
    }, [postsList])

    const handleLike = async (post_id) => {
        try {
            const newPost = await setLike(post_id)
            setPosts(prev => prev.map(post => post.post_id === newPost.post_id ? newPost : post))
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            {
                posts.map(post => {
                    return (
                        <PostCard
                            key={post.post_id}
                            id={post.post_id}
                            content={post.content}
                            name={post.accountname && `${post.accountname}`}
                            username={post.username}
                            files={post.files}
                            profile={post.img}
                            handleLike={handleLike}
                            likes={post.likes}
                            isLiked={post.isLiked}
                            disabled={disabled}
                            {...post}
                        />
                    )
                })
            }
        </>
    )
}