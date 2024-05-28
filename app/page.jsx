"use client"
import { useEffect, useState } from "react";
import { get } from "./actions/posts";
import CreatePost from '../components/main/CreatePost'
import RenderPostsList from '../components/RenderPostsList'

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
        <RenderPostsList postsList={postsList} />
      </div>


    </section>
  );
}
