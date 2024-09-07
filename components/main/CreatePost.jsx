import React, { useRef, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Modal,
  Textarea,
  Spacer,
  ModalBody,
  ModalHeader,
  ModalFooter,
  useDisclosure,
  ModalContent,
} from "@nextui-org/react";
import { LuFiles } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { Spinner } from "@nextui-org/spinner";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import SelectContenidos from "./SelectContenidos";
import SelectUniversity from "./SelectUniversity";

import { uploadFile } from "@/app/lib/firebase";
import { create } from "@/app/actions/posts";

export default function CreatePost({onRefresh}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { status } = useSession();

  const { theme } = useTheme();
  const router = useRouter();

  return (
    <>
      <Card
        className={`mb-4 ${theme === "light" && "shadow-none border-1 border-gray-400"}`}
      >
        <CardBody className="px-3 py-4 text-small text-default-400">
          {status === "authenticated" ? (
            <Button onClick={onOpen}>
              <p>Iniciar una publicacion</p>
            </Button>
          ) : (
            <Button onClick={() => router.push("/login")}>
              <p>Inicia sesion para publicar algo</p>
            </Button>
          )}
        </CardBody>
      </Card>
      {status === "authenticated" && (
        <NewPost isOpen={isOpen} onOpenChange={onOpenChange} onRefresh={onRefresh} />
      )}
    </>
  );
}

const NewPost = ({ isOpen, onOpenChange,onRefresh }) => {
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState({});
  const [files, setFiles] = useState([]);
  const [success, setSucces] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    setLoading(true);
    const selectedFiles = Array.from(event.target.files);

    if (files.length + selectedFiles.length > 5) {
      setLoading(false);

      return toast.error("Puedes subir un maximo de 5 archivos");
    }

    try {
      const files = [];

      for (const file of selectedFiles) {
        if (file.size / 1000 < 25000) {
          const url = await uploadFile(file);

          if (url.error) return toast.error(res.error);
          files.push({
            file_id: v4(),
            file_name: file.name,
            file_path: url,
            file_type: file.type,
          });
        } else toast.error("Tamaño maximo 25MB");
      }
      setFiles((prevFiles) => [...prevFiles, ...files]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("Ocurrio un error inesperado!");
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await create(content, files, selected);

      if (res.error) {
        toast.error(res.error);

        return toast.error(res.error);
      }
      setSucces(true);

      setTimeout(() => {
        setLoading(false);
        setContent("");
        setFiles([]);
        setSucces(false);
        onOpenChange();
        onRefresh()
      }, 1000);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Ocurrio un error inesperado!");
    }
  };

  return (
    <Modal isOpen={isOpen} size="3xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h4>Nueva Publicación</h4>
            </ModalHeader>
            <ModalBody>
              <SelectContenidos
                setMyContent={(val) =>
                  setSelected((prev) => ({ ...prev, content: val }))
                }
              />
              <SelectUniversity
                setMyCarrer={(val) =>
                  setSelected((prev) => ({ ...prev, carrer: val }))
                }
                setMyUniversity={(val) =>
                  setSelected((prev) => ({ ...prev, university: val }))
                }
              />
              <Textarea
                fullWidth
                placeholder="¿Qué vas a aportar hoy?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Spacer y={1} />
              <div>
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="mt-2 flex items-center justify-between"
                  >
                    <span>{file.file_name}</span>
                    <Button
                      color="primary"
                      rel="noopener noreferrer"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setFiles((prev) =>
                          prev.filter((f) => f.file_id !== file.file_id),
                        );
                      }}
                    >
                      Borrar
                    </Button>
                  </li>
                ))}
                <Button
                  auto
                  flat
                  color="error"
                  startContent={loading ? <Spinner size="sm" /> : <LuFiles />}
                  onPress={!loading && handleFileButtonClick}
                >
                  Agregar archivos
                </Button>
                <input
                  ref={fileInputRef}
                  multiple
                  style={{ display: "none" }}
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
            </ModalBody>

            <ModalFooter>
              <Button auto flat color="error" onPress={onOpenChange}>
                Cancelar
              </Button>
              {success ? (
                <Button color="success" startContent={<FaCheckCircle />}>
                  Publicado
                </Button>
              ) : (
                <Button
                  auto
                  startContent={loading && <Spinner size="sm" />}
                  onPress={!loading && handleSubmit}
                >
                  Publicar
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
