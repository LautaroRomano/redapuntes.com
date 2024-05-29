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

      <div className="mt-0 gap-4 w-full rounded-md max-w-xl" >
        <CreatePost></CreatePost>
        <RenderPostsList postsList={postsList} />
      </div>


    </section>
  );
}
