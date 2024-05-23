"use client"
import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { button as buttonStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import { useEffect, useState } from "react";
import { get } from "./actions/posts";
import PostCard from '../components/main/PostCard'
import CreatePost from '../components/main/CreatePost'

export default function Home() {

  const [postsList, setPostList] = useState([])

  const getPosts = async () => {
    try {
      const data = await get()
      setPostList(data)
    } catch (error) {
      console.log("🚀 ~ getPosts ~ error:", error)
    }
  }

  useEffect(() => {
    getPosts()
  }, [])

  return (
    <section className="flex flex-col items-center  w-full">

      <div className="mt-2 bg-[#181818] gap-4 p-2 w-full rounded-md max-w-lg md:p-10" >
        <CreatePost></CreatePost>
        {
          postsList.map(post => {
            return (
              <PostCard key={post.post_id} content={post.content} name={post.last_name && post.first_name && `${post.last_name} ${post.first_name}`} username={post.username} files={post.files} />
            )
          })
        }
      </div>


    </section>
  );
}
