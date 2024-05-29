"use client"
import { useEffect, useState } from "react";
import { get, searchPosts } from "./actions/posts";
import CreatePost from '../components/main/CreatePost'
import RenderPostsList from '../components/RenderPostsList'
import { Input } from "@nextui-org/input";
import { SearchIcon } from "@/components/icons";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/react";

export default function Home() {

  const [postsList, setPostList] = useState([])
  const [selectView, setSelectView] = useState(new Set(['Todo']));
  const [search, setSearch] = useState('');

  const getPosts = async (type) => {
    try {
      const data = await get(type)
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
    getPosts(selectedValue)
    if (search.length > 0) setSearch('')
  }, [selectView])

  const handleSearch = async () => {
    try {
      const data = await searchPosts(search)
      setPostList(data)
    } catch (error) {
      console.log("🚀 ~ getPosts ~ error:", error)
    }
  }

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
            value={search}
            onChange={({ target }) => {
              if (target.value.length === 0) getPosts()
              setSearch(target.value)
            }}
          />
          <Button
            isIconOnly
            onClick={handleSearch}
            disabled={search.length <= 1}
            color={search.length <= 1 ? 'default' : "primary"}
            className={search.length <= 1 ? '' : "cursor-pointer"}
          >
            <SearchIcon className="text-base text-white pointer-events-none flex-shrink-0" />
          </Button>
        </div>
        <CreatePost></CreatePost>
        <RenderPostsList postsList={postsList} />
      </div>


    </section>
  );
}
