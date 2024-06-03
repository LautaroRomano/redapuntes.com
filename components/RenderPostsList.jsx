import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import PostCard from "./main/PostCard";

import { setLike } from "@/app/actions/posts";

export default function RenderPostsList({ postsList, disabled }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (Array.isArray(postsList)) setPosts(postsList);
  }, [postsList]);

  const handleLike = async (post_id) => {
    try {
      const newPost = await setLike(post_id);

      if (newPost.error) return toast.error(newPost.error);
      setPosts((prev) =>
        prev.map((post) => (post.post_id === newPost.post_id ? newPost : post)),
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {posts.map((post) => {
        return (
          <PostCard
            key={post.post_id}
            content={post.content}
            disabled={disabled}
            files={post.files}
            handleLike={handleLike}
            id={post.post_id}
            isLiked={post.isLiked}
            likes={post.likes}
            name={post.accountname && `${post.accountname}`}
            profile={post.img}
            username={post.username}
            {...post}
          />
        );
      })}
    </>
  );
}
