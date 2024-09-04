"use client";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { getMyPDF } from "../actions/pdf";
import { FaFilePdf } from "react-icons/fa6";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import ModalTools from "./ModalTools";
import Cuestionario from "./Cuestionario";
import MindMap from "./MindMap";
import { PiStarFourFill } from "react-icons/pi";
import Star from "@/components/loaders/Star";

const PdfHome = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectTool, setSelectTool] = useState(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited-2");
    if (!hasVisited) {
      onOpen();
      localStorage.setItem("hasVisited-2", "true");
    }
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setLoading(false);

      if (res.status === 403)
        return toast.error("Iniciar sesion para continuar.");

      return toast.error("Ocurrio un error, intentalo nuevamente mas tarde.");
    }

    const result = await res.json();
    console.log("🚀 ~ onDrop ~ result:", result);

    setLoading(false);
    getFiles();
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const getFiles = async () => {
    setLoading(true);
    try {
      const myFiles = await getMyPDF();
      setFiles(myFiles);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    getFiles();
  }, []);

  if (selectTool?.tool === "CUESTIONARIO") {
    return (
      <Cuestionario file={selectTool.file} fin={() => setSelectTool(null)} />
    );
  }

  if (selectTool?.tool === "FLASHCARDS") {
    return (
      <FlashCards file={selectTool.file} fin={() => setSelectTool(null)} />
    );
  }

  if (selectTool?.tool === "MINDMAP") {
    return <MindMap file={selectTool.file} fin={() => setSelectTool(null)} />;
  }

  return (
    <div className="flex flex-col w-full">
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <p className="text-primary">
                  <PiStarFourFill size={30} />
                </p>
                <p className={"text-lg"}>
                  ¡Bienvenido a nuestra herramienta de IA para mejorar tus estudios!
                </p>
              </ModalHeader>
              <ModalBody>
                <p>
                  Sube tus archivos y usa la estrella para generar cuestionarios, mapas mentales, y flashcards
                  que te ayudarán a repasar el contenido de la materia de manera efectiva.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  auto
                  flat
                  color="primary"
                  onPress={onClose}
                  startContent={<PiStarFourFill />}
                >
                  ¡Comenzar!
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col w-full gap-4">
        <h1 className="text-2xl font-bold">Tus archivos</h1>
        <div className="flex p-2 flex-wrap gap-4 w-full">
          {files.map((fil) => (
            <ModalTools pdf={fil} setSelectTool={setSelectTool}>
              <div className="flex border p-2 flex-col items-center justify-evenly w-36 h-32 hover:border-blue-600 hover:text-blue-600 cursor-pointer">
                <p className="text-4xl">
                  <FaFilePdf />
                </p>
                <div className="overflow-hidden">
                  <p className="text-sm text-ellipsis w-full">{fil.name}</p>
                </div>
              </div>
            </ModalTools>
          ))}
        </div>
      </div>

      <div className="container border-2 p-5 border-dashed cursor-pointer hover:border-blue-600 hover:text-blue-600">
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <div>{loading ? <Star /> : "Agregar nuevo archivo"}</div>
        </div>
      </div>
    </div>
  );
};

export default PdfHome;
