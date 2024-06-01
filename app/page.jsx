"use client";
import { useEffect, useState, useRef } from "react";
import { get, searchPosts } from "./actions/posts";
import CreatePost from '../components/main/CreatePost';
import RenderPostsList from '../components/RenderPostsList';
import { Input } from "@nextui-org/input";
import { SearchIcon } from "@/components/icons";
import { Button } from "@nextui-org/button";
import { Select, SelectItem, Spinner } from "@nextui-org/react";
import { toast } from "react-toastify";
import _ from 'lodash';
import PostSkeleton from '../components/PostSkeleton'

export default function Home() {
  const [postsList, setPostList] = useState([]);
  const [selectView, setSelectView] = useState(new Set(['Todo']));
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [endPosts, setEndPosts] = useState(false);

  const LIMIT = 10;
  const elementScroll = useRef();

  const getPosts = async (type, newOffset = 0) => {
    try {
      setLoading(true);
      setIsSearch(false)
      setEndPosts(false)

      const data = await get(type, LIMIT, newOffset);
      if (data.error) {
        setLoading(false);
        toast.error(data.error)
      }
      if (newOffset === 0) {
        if (data.length < 10) setEndPosts(true)
        setPostList(data);
      } else {
        if (data.length < 10) setEndPosts(true)
        setPostList((prevPosts) => [...prevPosts, ...data]);
      }
      setOffset(newOffset);
      setLoading(false);
    } catch (error) {
      console.log("🚀 ~ getPosts ~ error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const selectedValue = Array.from(selectView)[0];
    getPosts(selectedValue);
  }, []);

  useEffect(() => {
    const selectedValue = Array.from(selectView)[0];
    getPosts(selectedValue);
    if (search.length > 0) setSearch('');
  }, [selectView]);

  const handleSearch = async (newOffset = 0) => {
    setLoading(true)
    setIsSearch(true)
    setEndPosts(false)
    try {
      const data = await searchPosts(search, LIMIT, newOffset);
      if (data.error) {
        setLoading(false);
        return toast.error(data.error);
      }
      if (newOffset === 0) {
        if (data.length < 10) setEndPosts(true)
        setPostList(data);
      } else {
        if (data.length < 10) setEndPosts(true)
        setPostList((prevPosts) => [...prevPosts, ...data]);
      }
      setOffset(newOffset);
      setLoading(false);
    } catch (error) {
      console.log("🚀 ~ getPosts ~ error:", error);
      setLoading(false);
    }
  };

  const handleScroll = _.debounce(() => {
    if (elementScroll.current) {
      const myElement = elementScroll.current;
      if ((myElement.scrollTop + myElement.clientHeight) >= (myElement.scrollHeight - 150) && !loading) {
        if (!isSearch && !endPosts) {
          const selectedValue = Array.from(selectView)[0];
          getPosts(selectedValue, offset + LIMIT);
        } else if (!endPosts) {
          handleSearch(offset + LIMIT);
        }
      }
    }
  }, 300);

  useEffect(() => {
    const myElement = elementScroll.current;
    if (myElement) {
      myElement.addEventListener('scroll', handleScroll);
      return () => myElement.removeEventListener('scroll', handleScroll);
    }
  }, [offset, loading, selectView]);

  return (
    <section className="flex flex-col items-center w-full" id="scroll" ref={elementScroll} style={{ overflowY: 'auto', maxHeight: '90vh' }}>
      <div className="mt-0 gap-4 w-full rounded-md max-w-xl">
        <div className="flex mb-4 flex-col sm:flex-row justify-between gap-4">
          <div className="flex w-full sm:w-40">
            <Select
              selectedKeys={selectView}
              onSelectionChange={setSelectView}
            >
              {['Todo', 'Siguiendo'].map((option) => (
                <SelectItem value={option} key={option}>
                  {option}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex w-full sm:w-80 gap-4">
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
                if (target.value.length === 0) getPosts();
                setSearch(target.value);
              }}
            />
            <Button
              isIconOnly
              onClick={() => handleSearch()}
              disabled={search.length <= 1}
              color={search.length <= 1 ? 'default' : "primary"}
              className={search.length <= 1 ? '' : "cursor-pointer"}
            >
              <SearchIcon className="text-base text-white pointer-events-none flex-shrink-0" />
            </Button>
          </div>
        </div>
        <CreatePost />
        <RenderPostsList postsList={postsList} />
        {
          !endPosts &&
          <PostSkeleton />
        }
      </div>
    </section>
  );
}
