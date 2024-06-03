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

import { uploadFile } from "@/app/lib/firebase";
import { create } from "@/app/actions/posts";

export default function CreatePost() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { status } = useSession();

  return (
    <>
      <Card className="mb-4">
        <CardBody className="px-3 py-4 text-small text-default-400">
          {status === "authenticated" ? (
            <Button onClick={onOpen}>
              <p>Iniciar una publicacion</p>
            </Button>
          ) : (
            <div>
              <p>Inicia sesion para publicar algo</p>
            </div>
          )}
        </CardBody>
      </Card>
      {status === "authenticated" && (
        <NewPost isOpen={isOpen} onOpenChange={onOpenChange} />
      )}
    </>
  );
}

const NewPost = ({ isOpen, onOpenChange }) => {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [success, setSucces] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    setLoading(true);
    const selectedFiles = Array.from(event.target.files);

    try {
      const files = [];

      for (const file of selectedFiles) {
        const url = await uploadFile(file);

        if (url.error) return toast.error(res.error);
        files.push({
          file_name: file.name,
          file_path: url,
          file_type: file.type,
        });
      }
      setFiles((prevFiles) => [...prevFiles, ...files]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
      setError("Ocurrio un error inesperado!");
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await create(content, files);

      if (res.error) {
        setError(res.error);

        return toast.error(res.error);
      }
      setSucces(true);

      setTimeout(() => {
        setLoading(false);
        setContent("");
        setFiles([]);
        setSucces(false);
        setError(false);
        onOpenChange();
      }, 1000);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError("Ocurrio un error inesperado!");
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
              <Card>
                <CardBody className="flex items-center space-x-4">
                  <Textarea
                    fullWidth
                    placeholder="¿Qué estás pensando?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </CardBody>
              </Card>
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
                          prev.filter((f) => f.file_path === file.file_path),
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
              {error && <h5 className="text-red-400">{error}</h5>}
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
