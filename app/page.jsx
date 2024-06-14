"use client";
import { useEffect, useState, useRef } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Select, SelectItem } from "@nextui-org/react";
import { toast } from "react-toastify";
import _ from "lodash";

import RenderPostsList from "../components/RenderPostsList";
import CreatePost from "../components/main/CreatePost";
import PostSkeleton from "../components/PostSkeleton";

import { get, searchPosts } from "./actions/posts";

import { SearchIcon } from "@/components/icons";
import Filters from "@/components/Filters";

export default function Home() {
  const [postsList, setPostList] = useState([]);
  const [selectView, setSelectView] = useState(new Set(["Todo"]));
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [endPosts, setEndPosts] = useState(false);
  const [filters, setFilters] = useState({});

  const LIMIT = 10;
  const elementScroll = useRef();

  const getPosts = async (type, newOffset = 0, filters) => {
    try {
      setLoading(true);
      setIsSearch(false);
      setEndPosts(false);

      const data = await get(type, LIMIT, newOffset, filters);

      if (data.error) {
        setLoading(false);
        toast.error(data.error);
      }
      if (newOffset === 0) {
        if (data.length < 10) setEndPosts(true);
        setPostList(data);
      } else {
        if (data.length < 10) setEndPosts(true);
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

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      e.prompt();
      // Manejar la respuesta del usuario al prompt
      e.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
      });
    });

  }, []);

  useEffect(() => {
    const selectedValue = Array.from(selectView)[0];

    getPosts(selectedValue, 0, filters);
  }, [filters]);

  useEffect(() => {
    const selectedValue = Array.from(selectView)[0];

    getPosts(selectedValue);
    if (search.length > 0) setSearch("");
  }, [selectView]);

  const handleSearch = async (newOffset = 0) => {
    setLoading(true);
    setIsSearch(true);
    setEndPosts(false);
    try {
      const data = await searchPosts(search, LIMIT, newOffset, filters);

      if (data.error) {
        setLoading(false);

        return toast.error(data.error);
      }
      if (newOffset === 0) {
        if (data.length < 10) setEndPosts(true);
        setPostList(data);
      } else {
        if (data.length < 10) setEndPosts(true);
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

      if (
        myElement.scrollTop + myElement.clientHeight >=
        myElement.scrollHeight - 150 &&
        !loading
      ) {
        if (!isSearch && !endPosts) {
          const selectedValue = Array.from(selectView)[0];

          getPosts(selectedValue, offset + LIMIT, filters);
        } else if (!endPosts) {
          handleSearch(offset + LIMIT);
        }
      }
    }
  }, 300);

  useEffect(() => {
    const myElement = elementScroll.current;

    if (myElement) {
      myElement.addEventListener("scroll", handleScroll);

      return () => myElement.removeEventListener("scroll", handleScroll);
    }
  }, [offset, loading, selectView]);

  return (
    <section
      ref={elementScroll}
      className="flex flex-col items-center w-full"
      id="scroll"
      style={{ overflowY: "auto", maxHeight: "90vh" }}
    >
      <div className="mt-0 gap-4 w-full rounded-md max-w-xl">
        <div className="flex mb-4 flex-col sm:flex-row justify-between gap-4 px-2 sm:px-0">
          <div className="flex w-full sm:w-80 gap-1">
            <Select selectedKeys={selectView} onSelectionChange={setSelectView}>
              {["Todo", "Siguiendo"].map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </Select>
            <Filters filters={filters} setFilters={setFilters} />
          </div>
          <div className="flex w-full sm:w-80 gap-1">
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
                if (target.value.length === 0) getPosts(null, 0, filters);
                setSearch(target.value);
              }}
            />
            <Button
              isIconOnly
              className={search.length <= 1 ? "" : "cursor-pointer"}
              color={search.length <= 1 ? "default" : "primary"}
              disabled={search.length <= 1}
              onClick={() => handleSearch()}
            >
              <SearchIcon className="text-base pointer-events-none flex-shrink-0" />
            </Button>
          </div>
        </div>
        <CreatePost />
        <RenderPostsList postsList={postsList} />
        {!endPosts && <PostSkeleton />}
      </div>
    </section>
  );
}
