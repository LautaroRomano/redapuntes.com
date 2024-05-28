import { useEffect, useState } from "react"
import PostCard from "./main/PostCard"
import { setLike } from "@/app/actions/posts"


export default function RenderPostsList({ postsList }) {

    const [posts, setPosts] = useState([])

    useEffect(() => {
        setPosts(postsList)
    }, [postsList])

    const handleLike = async (post_id) => {

        /* setPosts(prev => prev
            .map(post => post.post_id === post_id ?
                ({
                    ...post,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    isLiked: !post.isLiked
                })
                : post
            )) */

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
                        />
                    )
                })
            }
        </>
    )
}