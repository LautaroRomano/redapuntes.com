"use client";
import { Button } from "@nextui-org/button";
import {
  Avatar,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  Input,
  Textarea,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import _ from "lodash";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { toast } from "react-toastify";

import RenderPostsList from "@/components/RenderPostsList";
import PostSkeleton from "@/components/PostSkeleton";
import {
  follow,
  getUserByUsername,
  unfollow,
  updateUser,
} from "@/app/actions/users";
import { getPostsByUserId } from "@/app/actions/posts";

export default function ProfilePage({ params }) {
  const [profile, setProfile] = useState({});
  const [notFound, setNotFound] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [postsList, setPostList] = useState([]);
  const [endPosts, setEndPosts] = useState(false);

  const LIMIT = 10;
  const elementScroll = useRef();

  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const getUser = async (username) => {
    const res = await getUserByUsername(username);

    if (res.error) setNotFound(true);
    setProfile(res);
    getPosts(res.user_id);
  };

  const getPosts = async (user_id, newOffset = 0) => {
    try {
      setLoading(true);

      const data = await getPostsByUserId(user_id, LIMIT, newOffset);

      if (data.error) return toast.error(data.error);
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
      setLoading(false);
    }
  };

  const handleScroll = _.debounce(() => {
    if (elementScroll.current) {
      const myElement = elementScroll.current;

      if (
        myElement.scrollTop + myElement.clientHeight >=
          myElement.scrollHeight - 150 &&
        !loading &&
        !endPosts
      ) {
        getPosts(profile.user_id, offset + LIMIT);
      }
    }
  }, 300);

  useEffect(() => {
    const myElement = elementScroll.current;

    if (myElement) {
      myElement.addEventListener("scroll", handleScroll);

      return () => myElement.removeEventListener("scroll", handleScroll);
    }
  }, [offset, loading]);

  useEffect(() => {
    if (params.username) getUser(params.username);
  }, [params]);

  const handleUnfollow = async () => {
    const res = await unfollow(profile.user_id);

    if (res.error) return toast.error(res.error);
    if (res.ok) setProfile((prev) => ({ ...prev, isFollow: false }));
  };

  const handleFollow = async () => {
    const res = await follow(profile.user_id);

    if (res.error) return toast.error(res.error);
    if (res.ok) setProfile((prev) => ({ ...prev, isFollow: true }));
  };

  if (notFound)
    return (
      <div>
        <h1 className="">Esta página no está disponible</h1>
        <h2 className="text-gray-400 mt-2">
          Es posible que el enlace que seleccionaste esté dañado o que se haya
          eliminado la página.
        </h2>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Volver
        </Button>
      </div>
    );

  return (
    <div
      ref={elementScroll}
      className="w-full max-w-lg h-full lg:min-w-[600px] gap-5 px-3"
      id="scroll"
      style={{ overflowY: "auto", maxHeight: "90vh" }}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-center md:flex-row gap-5 w-full">
            <div>
              <Avatar
                showFallback
                alt="User profile"
                className="w-28 h-28 rounded-full"
                src={profile.img}
              />
            </div>
            <div className="flex items-center md:flex-row gap-2 w-full justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold">
                  {profile.accountname}
                </h1>
                <p className="text-lg md:text-xl font-semibold text-start text-gray-400">
                  @{profile.username}
                </p>
              </div>
              <div className="flex">
                {profile.myProfile ? (
                  <Button onClick={onOpen}>Editar</Button>
                ) : profile.isFollow ? (
                  <Button color="default" onClick={handleUnfollow}>
                    Dejar de seguir
                  </Button>
                ) : (
                  <Button color="primary" onClick={handleFollow}>
                    Seguir
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-4">
        <div className="flex justify-evenly">
          <div className="text-center">
            <span className="font-semibold">
              {postsList ? postsList.length : 0}
            </span>
            <p>Posts</p>
          </div>
          <div className="text-center">
            <span className="font-semibold">{profile.follows || 0}</span>
            <p>Seguidores</p>
          </div>
          <div className="text-center">
            <span className="font-semibold">{profile.followed || 0}</span>
            <p>Siguiendo</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p>
          {profile.about && profile.about.length > 0
            ? profile.about
            : "Este usuario no ingreso una descripcion."}
        </p>
      </div>

      <div className="mb-20">
        <p className="mb-2">Posteos</p>
        {postsList && <RenderPostsList postsList={postsList} />}
        {!endPosts && <PostSkeleton />}
      </div>
      <Edit
        isOpen={isOpen}
        profile={profile}
        reload={() => getUser(params.username)}
        onOpenChange={onOpenChange}
      />
    </div>
  );
}

const Edit = ({ isOpen, onOpenChange, profile = {}, reload }) => {
  const [accountName, setAccountName] = useState("");
  const [about, setAbout] = useState("");
  const [img, setImg] = useState();
  const [success, setSucces] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    try {
      await updateUser({ accountName, about, img });

      setSucces(true);
      setTimeout(() => {
        setAccountName("");
        setAbout([]);
        setImg([]);
        setSucces(false);
        reload();
        onOpenChange();
      }, 1000);
    } catch (error) {
      toast.error("Ocurrio un error inesperado!");
    }
  };

  const handleFileChange = async (event) => {
    setLoading(true);
    const selectedFiles = Array.from(event.target.files);

    try {
      const file = selectedFiles[0];
      const formData = new FormData();

      formData.append(`files[]`, file);

      try {
        toast.info("Subiendo imagen");
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();

          if (data.files && data.files[0]) {
            const url = data.files[0].file_path;

            setImg(url);
          }
        } else {
          toast.error("Error al subir la imagen");
        }
      } catch (error) {
        toast.error("Ocurrió un error inesperado!");
      } finally {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error("Ocurrio un error inesperado!");
    }
  };

  useEffect(() => {
    setAccountName(profile.accountname);
    setAbout(profile.about);
    setImg(profile.img);
  }, [profile]);

  return (
    <Modal isOpen={isOpen} size="xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
          <>
            <ModalBody>
              <div className="mx-auto  w-full">
                <header className="flex items-center justify-between">
                  <div className="flex items-center w-full">
                    <div className="items-center justify-center">
                      <Avatar
                        showFallback
                        alt="User profile"
                        className="w-28 h-28 rounded-full"
                        src={img}
                      />
                      <Button
                        auto
                        flat
                        className="w-28 mt-2"
                        size="sm"
                        startContent={
                          loading ? <Spinner size="sm" /> : <MdEdit />
                        }
                        onPress={!loading && handleFileButtonClick}
                      >
                        Editar foto
                      </Button>
                      <input
                        ref={fileInputRef}
                        multiple
                        style={{ display: "none" }}
                        type="file"
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="ml-8">
                      <Input
                        className="font-semibold"
                        label={"Tu nombre"}
                        size="lg"
                        value={accountName}
                        onChange={({ target }) => setAccountName(target.value)}
                      />
                    </div>
                  </div>
                </header>

                <div className="my-8">
                  <Textarea
                    placeholder="Ingresa una descripcion"
                    value={about || ""}
                    onChange={({ target }) => setAbout(target.value)}
                  />
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button auto flat color="error" onPress={onOpenChange}>
                Cancelar
              </Button>
              {success ? (
                <Button color="success" startContent={<FaCheckCircle />}>
                  Listo
                </Button>
              ) : (
                <Button auto onPress={handleSubmit}>
                  Guardar
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
