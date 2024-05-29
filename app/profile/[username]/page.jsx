'use client'
import { follow, getUserByUsername, unfollow, updateUser } from "@/app/actions/users";
import { uploadFile } from "@/app/lib/firebase";
import RenderPostsList from "@/components/RenderPostsList";
import { Button } from "@nextui-org/button";
import { Avatar, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Input, Textarea, Spinner, useDisclosure } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

export default function ProfilePage({ params }) {
  const [profile, setProfile] = useState({})
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const getUser = async (username) => {
    const res = await getUserByUsername(username)
    if (res.error) setNotFound(true)
    setProfile(res)
  }

  useEffect(() => {
    if (params.username)
      getUser(params.username)
  }, [params])

  const handleUnfollow = async () => {
    const res = await unfollow(profile.user_id)
    if (res.ok) setProfile(prev => ({ ...prev, isFollow: false }))
  }

  const handleFollow = async () => {
    const res = await follow(profile.user_id)
    if (res.ok) setProfile(prev => ({ ...prev, isFollow: true }))
  }

  if (notFound)
    return (
      <div>
        <h1 className="">Esta página no está disponible</h1>
        <h2 className="text-gray-400 mt-2">Es posible que el enlace que seleccionaste esté dañado o que se haya eliminado la página.</h2>
        <Button className="mt-4" onClick={() => router.push('/')}>Volver</Button>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto lg:min-w-[600px]">
      <header className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <Avatar
            showFallback
            src={profile.img}
            alt="User profile"
            className="w-28 h-28 rounded-full"
          />
          <div >
            <h1 className="text-2xl font-semibold">{profile.accountname}</h1>
            <p className="text-xl font-semibold text-start text-gray-400">@{profile.username}</p>
          </div>
          <div className="flex">
            {
              profile.myProfile ?
                <Button onClick={onOpen}>Editar</Button>
                :
                profile.isFollow ?
                  <Button color="default" onClick={handleUnfollow}>Dejar de seguir</Button>
                  :
                  <Button color="primary" onClick={handleFollow}>Seguir</Button>
            }
          </div>
        </div>
      </header>

      <div className="mt-4">
        <div className="flex justify-evenly">
          <div className="text-center">
            <span className="font-semibold">{profile.posts ? profile.posts.length : 0}</span>
            <p>Posts</p>
          </div>
          <div className="text-center">
            <span className="font-semibold">456k</span>
            <p>Seguidores</p>
          </div>
          <div className="text-center">
            <span className="font-semibold">789</span>
            <p>Siguiendo</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p>{profile.about && profile.about.length > 0 ? profile.about : 'Este usuario no ingreso una descripcion.'}</p>
      </div>

      <div className="mt-8">
        <p className="mb-2">Posteos</p>
        {
          profile.posts && <RenderPostsList postsList={profile.posts} />
        }
      </div>
      <Edit isOpen={isOpen} onOpenChange={onOpenChange} profile={profile} reload={() => getUser(params.username)} />
    </div>
  );
}


const Edit = ({ isOpen, onOpenChange, profile = {}, reload }) => {
  const [accountName, setAccountName] = useState("");
  const [about, setAbout] = useState("");
  const [img, setImg] = useState();
  const [success, setSucces] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const fileInputRef = useRef(null);

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    try {
      await updateUser({ accountName, about, img })

      setSucces(true)
      setTimeout(() => {
        setAccountName("");
        setAbout([]);
        setImg([]);
        setSucces(false);
        reload()
        onOpenChange();
      }, 1000);

    } catch (error) {
      setError(true)
    }

  };

  const handleFileChange = async (event) => {
    setLoading(true)
    const selectedFiles = Array.from(event.target.files);
    try {
      const file = selectedFiles[0]
      const url = await uploadFile(file)
      setImg(url)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error(error);
      setError('Ocurrio un error inesperado!');
    }
  };

  useEffect(() => {
    setAccountName(profile.accountname)
    setAbout(profile.about)
    setImg(profile.img)
  }, [profile])

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <div className="mx-auto  w-full">
                <header className="flex items-center justify-between">
                  <div className="flex items-center w-full">
                    <div className="items-center justify-center">
                      <Avatar
                        showFallback
                        src={img}
                        alt="User profile"
                        className="w-28 h-28 rounded-full"
                      />
                      <Button
                        auto
                        flat
                        className="w-28 mt-2"
                        startContent={loading ? <Spinner size="sm" /> : <MdEdit />}
                        size="sm"
                        onPress={!loading && handleFileButtonClick}
                      >
                        Editar foto
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        multiple
                        onChange={handleFileChange}
                      />
                    </div>
                    <div className="ml-8">
                      <Input
                        label={'Tu nombre'}
                        className="font-semibold"
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
                    value={about || ''}
                    onChange={({ target }) => setAbout(target.value)}
                  />
                </div>

              </div>
            </ModalBody>

            <ModalFooter>
              <Button auto flat color="error" onPress={onOpenChange}>
                Cancelar
              </Button>
              {success ?
                <Button color="success" startContent={<FaCheckCircle />}>
                  Listo
                </Button>
                :
                <Button auto onPress={handleSubmit}>
                  Guardar
                </Button>
              }
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}