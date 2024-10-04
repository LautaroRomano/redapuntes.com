"use client";
import React, { useEffect, useRef, useState } from "react";
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
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import SelectContenidos from "./SelectContenidos";
import SelectUniversity from "./SelectUniversity";

import { create } from "@/app/actions/posts";

export default function CreatePost({ onRefresh }) {
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
        <NewPost
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}

const NewPost = ({ isOpen, onOpenChange, onRefresh }) => {
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState({});
  const [files, setFiles] = useState([]);
  const [success, setSucces] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setSucces(false);
    setLoading(false);
    setContent("");
    setFiles([]);
    setSelected({});

    return () => {
      setSucces(false);
      setLoading(false);
      setContent("");
      setFiles([]);
      setSelected({});
    };
  }, [isOpen]);

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);

    const aceptedFiles = selectedFiles
      .map((fil) => {
        if (fil.size / 1000 < 25000) {
          return fil;
        } else {
          toast.error("Tamaño maximo archivo 25MB");
        }
      })
      .filter(Boolean);

    if (files.length + aceptedFiles.length > 10) {
      return toast.error("Puedes subir un maximo de 10 archivos");
    }

    setFiles((prev) => [...prev, ...aceptedFiles]);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    if (!content || content.length === 0)
      return toast.error("Debes escribir algo para publicar");
    setLoading(true);

    const formData = new FormData();

    files.forEach((file) => {
      formData.append(`files[]`, file);
    });

    try {
      if (files.length > 0) toast.info("Subiendo archivos");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();

        if (data.files.length > 0) toast.success("Archivos subidos con exito!");
        if (data.files) {
          const created = await create(content, data.files, selected);

          if (created.ok) {
            toast.success("Publicado con exito!");
            setSucces(true);
            setLoading(false);
            onRefresh();
            onOpenChange();
          }
        }
      } else {
        toast.error("Error al subir los archivos");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="3xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {() => (
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
                    <span>{file.name || file.file_name}</span>
                    <Button
                      color="primary"
                      rel="noopener noreferrer"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setFiles((prev) =>
                          prev.filter((f) => f.name !== file.name),
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
