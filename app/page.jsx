"use client"
import { useEffect, useState } from "react";
import { get } from "./actions/posts";
import CreatePost from '../components/main/CreatePost'
import RenderPostsList from '../components/RenderPostsList'
import { Input } from "@nextui-org/input";
import { SearchIcon } from "@/components/icons";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/react";

export default function Home() {

  const [postsList, setPostList] = useState([])
  const [selectView, setSelectView] = useState(new Set(['Todo']));

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

  useEffect(() => {
    const selectedValue = Array.from(selectView)[0];
    console.log("🚀 ~ useEffect ~ selectedValue:", selectedValue)
  }, [selectView])

  return (
    <section className="flex flex-col items-center  w-full">

      <div className="mt-0 gap-4 w-full rounded-md max-w-xl" >
        <div className="flex mb-4 gap-4">
          <Select
            selectedKeys={selectView}
            onSelectionChange={setSelectView}
            className="max-w-xs"
          >
            {['Todo', 'Siguiendo'].map((option) => (
              <SelectItem value={option} key={option}>
                {option}
              </SelectItem>
            ))}
          </Select>

          <Input
            aria-label="Search"
            classNames={{
              inputWrapper: "bg-default-100",
              input: "text-sm",
            }}
            labelPlacement="outside"
            placeholder="Buscar..."
            startContent={
              <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
            }
            type="search"
          />
          <Button isIconOnly>
            <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
          </Button>
        </div>
        <CreatePost></CreatePost>
        <RenderPostsList postsList={postsList} />
      </div>


    </section>
  );
}
