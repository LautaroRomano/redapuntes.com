"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { FaFilePdf } from "react-icons/fa6";
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Tab,
  Tabs,
  useDisclosure,
} from "@nextui-org/react";
import { PiStarFourFill } from "react-icons/pi";
import { IoMdAdd } from "react-icons/io";
import { SiGoogleforms } from "react-icons/si";
import { TiFlowSwitch } from "react-icons/ti";
import { CgCardClubs } from "react-icons/cg";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";

import { getMyPDF, getSaved } from "../actions/pdf";
import { getMyUser } from "../actions/users";

import MissionCard from "./MissionCard";
import FlashCards from "./FlashCards";
import MindMap from "./MindMap";
import Cuestionario from "./Cuestionario";
import ModalTools from "./ModalTools";

import { store, setUserLogged } from "@/state/index";
import Star from "@/components/loaders/Star";

const PdfHome = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PdfPage />
    </Suspense>
  );
};

const PdfPage = () => {
  const searchParams = useSearchParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(null);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [saved, setSaved] = useState({
    cuestionarios: [],
    flashCards: [],
    mindMaps: [],
  });
  const [selectTool, setSelectTool] = useState(null);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const user = useSelector((state) => state.userLogged);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    const status = searchParams.get("paymentStatus");

    if (status && status === "failure") {
      toast.error("El pago ha fallado");
    } else if (status && status === "success") {
      toast.success("Pago exitoso, ya cargamos tus estrellas!");
    }
  }, [searchParams]);

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

    const res = await fetch("/api/openai/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setLoading(false);

      if (res.status === 403)
        return toast.error("Iniciar sesion para continuar.");

      return toast.error("Ocurrio un error, intentalo nuevamente mas tarde.");
    }

    const serverRes = await res.json();

    setLoading(false);
    if (serverRes.error) {
      return toast.error(serverRes.error);
    }
    getFiles();
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleBuyStars = async (id) => {
    if (loadingBuy) return;
    setLoadingBuy(true);
    const res = await fetch("/api/mercadopago", {
      method: "POST",
      body: { id },
    });

    if (!res.ok) {
      setLoadingBuy(false);
      if (res.status === 403)
        return toast.error("Iniciar sesion para continuar.");

      return toast.error("Ocurrio un error, intentalo nuevamente mas tarde.");
    }

    const serverRes = await res.json();

    setLoadingBuy(false);
    if (serverRes.error) {
      return toast.error(serverRes.error);
    }
    window.location.href = serverRes.init_point;
  };

  const getFiles = async () => {
    setLoading(true);
    try {
      const myFiles = await getMyPDF();

      setFiles(myFiles);
      getSavedGenerates(
        myFiles.map((fil) => ({
          file_id: fil.file_id,
          name: fil.name,
          user_id: fil.user_id,
          created_at: fil.created_at,
        })),
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getUser = async () => {
    const user = await getMyUser();

    if (user && !user.error) {
      store.dispatch(setUserLogged(user));
    }
  };

  const getSavedGenerates = async (files) => {
    if (!files || files.length === 0) return;
    setLoadingSaved(true);
    try {
      const res = await getSaved(files);

      if (res.error) {
        toast.error(res.error);
        throw res.error;
      }
      setSaved(res);
      setLoadingSaved(false);
    } catch (error) {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    getFiles();
  }, []);

  if (selectTool?.tool === "CUESTIONARIO") {
    return (
      <Cuestionario
        file={selectTool.file}
        fin={() => {
          setSelectTool(null);
          getFiles();
          getUser();
        }}
        saved={selectTool.saved}
      />
    );
  }

  if (selectTool?.tool === "FLASHCARDS") {
    return (
      <FlashCards
        file={selectTool.file}
        fin={() => {
          setSelectTool(null);
          getFiles();
        }}
        saved={selectTool.saved}
      />
    );
  }

  if (selectTool?.tool === "MINDMAP") {
    return (
      <MindMap
        file={selectTool.file}
        fin={() => {
          setSelectTool(null);
          getFiles();
        }}
        saved={selectTool.saved}
      />
    );
  }

  if (!user)
    return (
      <div className="flex flex-col w-full h-full items-center justify-center">
        <h1>Inicia sesion para continuar</h1>
      </div>
    );

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
                  ¡Bienvenido a nuestra herramienta de IA para mejorar tus
                  estudios!
                </p>
              </ModalHeader>
              <ModalBody>
                <p>
                  Sube tus archivos y usa la estrella para generar
                  cuestionarios, mapas mentales, y flashcards que te ayudarán a
                  repasar el contenido de la materia de manera efectiva.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  auto
                  flat
                  color="primary"
                  startContent={<PiStarFourFill />}
                  onPress={onClose}
                >
                  ¡Comenzar!
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <div className="flex flex-col w-full gap-4">
        <h1 className="text-2xl font-bold">Consigue estrellas</h1>
        <div
          className="flex p-2 gap-4 w-full justify-start overflow-x-auto"
          id="scroll"
        >
          {!user.missions.find((m) => m.completed) && (
            <Button
              className="min-w-[100px] h-full hover:opacity-80 cursor-pointer relative"
              color="primary"
              onPress={handleBuyStars}
            >
              <div className="flex w-full h-full items-center justify-evenly">
                {loadingBuy ? (
                  <Spinner color="white" />
                ) : (
                  <>
                    <div className="flex flex-col">
                      <div
                        className={`text-sm font-bold px-1 text-wrap justify-center items-center`}
                      >
                        Comprar
                        <br />
                        <div className="flex justify-center items-center">
                          <span className="ml-1 text-lg">+10</span>
                          <PiStarFourFill size={24} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col px-2">
                      <p className="text-xs line-through">$2375</p>
                      <p className="">$1900</p>
                    </div>
                  </>
                )}
              </div>
            </Button>
          )}

          {user &&
            user.missions.map((mission, i) => (
              <MissionCard
                key={i}
                mission={mission}
                total={mission.final_amount}
                uploaded={mission.amount}
              />
            ))}
        </div>
      </div>
      <Divider className="my-5" />
      <div className="flex flex-col w-full gap-4">
        <div className="flex gap-1 flex-col justify-center">
          <h1 className="text-2xl font-bold">Tus PDF</h1>
          {loading === false && (
            <p className="text-sm font-bold text-default-300">
              {files.length > 0 ? "Selecciona" : "Sube"} un PDF para comenzar
            </p>
          )}
        </div>
        <div className="flex p-2 flex-wrap gap-4 w-full justify-center">
          <div className="flex border border-dashed p-2 flex-col items-center justify-evenly w-36 h-36 hover:border-blue-600 hover:text-blue-600 cursor-pointer">
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <div>
                {loading ? (
                  <Star />
                ) : (
                  <div className="flex flex-col gap-2 justify-center items-center">
                    <div className="text-4xl">
                      <IoMdAdd />
                    </div>
                    <p className="text-sm text-ellipsis w-full">
                      Agregar nuevo PDF
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          {files.map((fil, i) => (
            <ModalTools key={i} pdf={fil} setSelectTool={setSelectTool}>
              <div className="flex border p-2 flex-col items-center justify-evenly w-36 h-36 hover:border-blue-600 hover:text-blue-600 cursor-pointer">
                <p className="text-2xl">
                  <FaFilePdf />
                </p>
                <div className="overflow-hidden">
                  <p className="text-[0.750rem] leading-[1rem] text-ellipsis w-full">
                    {fil.name}
                  </p>
                </div>
              </div>
            </ModalTools>
          ))}
        </div>
      </div>
      {(saved.cuestionarios.length > 0 ||
        saved.flashCards.length > 0 ||
        saved.mindMaps.length > 0) && (
        <>
          <Divider className="my-5" />
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-xl font-bold">Guardados</h1>
            <Tabs aria-label="Saved">
              {saved.cuestionarios.length > 0 && (
                <Tab key="cuestionarios-guardados" title="Cuestionarios">
                  <div className="flex flex-col w-full gap-4">
                    <div className="flex p-2 flex-wrap gap-4 w-full justify-center">
                      {loadingSaved && <Star />}
                      {saved.cuestionarios.map((fil, i) => (
                        <button
                          key={i}
                          className="flex border p-2 flex-col items-center justify-evenly w-36 h-36 hover:border-blue-600 hover:text-blue-600 cursor-pointer"
                          onClick={() =>
                            setSelectTool({ saved: fil, tool: "CUESTIONARIO" })
                          }
                        >
                          <p className="text-2xl">
                            <SiGoogleforms />
                          </p>
                          <div className="overflow-hidden">
                            <p className="text-[0.750rem] leading-[1rem] text-ellipsis w-full">
                              {fil.file_name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Tab>
              )}

              {saved.flashCards.length > 0 && (
                <Tab key="flash-cards" title="Flash Cards">
                  <div className="flex flex-col w-full gap-4">
                    <div className="flex p-2 flex-wrap gap-4 w-full justify-center">
                      {loadingSaved && <Star />}
                      {saved.flashCards.map((fil, i) => (
                        <button
                          key={i}
                          className="flex border p-2 flex-col items-center justify-evenly w-36 h-36 hover:border-blue-600 hover:text-blue-600 cursor-pointer"
                          onClick={() =>
                            setSelectTool({ saved: fil, tool: "FLASHCARDS" })
                          }
                        >
                          <p className="text-4xl">
                            <CgCardClubs />
                          </p>
                          <div className="overflow-hidden">
                            <p className="text-[0.750rem] leading-[1rem] text-ellipsis w-full">
                              {fil.file_name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Tab>
              )}

              {saved.mindMaps.length > 0 && (
                <Tab key="mapas-mentales" title="Mapas Mentales">
                  <div className="flex flex-col w-full gap-4">
                    <div className="flex p-2 flex-wrap gap-4 w-full justify-center">
                      {loadingSaved && <Star />}
                      {saved.mindMaps.map((fil, i) => (
                        <button
                          key={i}
                          className="flex border p-2 flex-col items-center justify-evenly w-36 h-36 hover:border-blue-600 hover:text-blue-600 cursor-pointer"
                          onClick={() =>
                            setSelectTool({ saved: fil, tool: "MINDMAP" })
                          }
                        >
                          <p className="text-4xl">
                            <TiFlowSwitch />
                          </p>
                          <div className="overflow-hidden">
                            <p className="text-[0.750rem] leading-[1rem] text-ellipsis w-full">
                              {fil.file_name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Tab>
              )}
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
};

export default PdfHome;
