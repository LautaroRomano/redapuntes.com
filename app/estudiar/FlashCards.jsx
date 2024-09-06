"use client";
import { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { generateCards, saveCards } from "../actions/pdf";
import Star from "@/components/loaders/Star";
import { toast } from "react-toastify";
import {
  Card,
  CardBody,
  Divider,
  Spinner,
} from "@nextui-org/react";
import "./styles/FlashCards.css";
import { IoMdArrowRoundBack } from "react-icons/io";

const FlashCards = ({ file, fin, saved }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [finish, setFinish] = useState(false);
  const [viewResult, setViewResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showFinishElement, setShowFinishElement] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const handleContinue = () => {
    setViewResult(false);
    if (step < questions.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      setFinish(true);
    }
  };

  useEffect(() => {
    if (!finish) return;

    for (let i = 1; i <= 6; i++) {
      setTimeout(
        () => {
          const newState = Array(i)
            .fill(true)
            .concat(Array(6 - i).fill(false));
          setShowFinishElement(newState);
        },
        400 + i * 400
      );
    }
  }, [finish]);

  useEffect(() => {
    if (saved) {
      setQuestions(saved.cards);
      setStep(0);
    }
  }, [saved]);

  const getCuestionario = async (text) => {
    if (loading) return;
    setLoading(true);
    const res = await generateCards(text);

    if (res.error) {
      toast.error(res.error);
      setLoading(false);
      finishim();
      return;
    }
    setQuestions(res);
    setLoading(false);
    setStep(0);
  };

  const finishim = () => {
    setStep(0);
    setFinish(0);
    setViewResult(false);
    setQuestions([]);
    setShowFinishElement([false, false, false, false, false, false]);
    fin();
  };

  useEffect(() => {
    if (file && file.text) getCuestionario(file.text);
  }, [file]);

  const save = async () => {
    setSaving(true);
    const res = await saveCards({ file_id: file.file_id, cards: questions });
    if (res.error) {
      toast.error(res.error);
      setSaving(false);
      return;
    }
    setSaving(false);
    toast.success("Guardado con exito!");
  };

  if (finish)
    return (
      <div className="flex flex-col gap-3 items-center w-full px-2">
        <div
          className={`w-36 transition-opacity duration-300 ${showFinishElement[0] ? "flex opacity-100" : "hidden opacity-100"}`}
        >
          <img
            src="https://i.pinimg.com/originals/15/32/42/153242d25a0c6696d9eebd5847c16eb2.gif"
            alt=""
          />
        </div>
        <h1
          className={`text-2xl  transition-opacity duration-300 ${showFinishElement[1] ? "flex opacity-100" : "hidden opacity-100"}`}
        >
          <strong>Bien hecho!</strong>
        </h1>
        <h2
          className={`text-xl transition-opacity duration-300 ${showFinishElement[2] ? " flex opacity-100" : "hidden opacity-100"}`}
        >
          <strong>Terminaste tu repaso</strong>
        </h2>

        <Button
          size="sm"
          color="primary"
          onClick={finishim}
          className={`w-full transition-opacity duration-300 mt-16 ${showFinishElement[3] ? "flex opacity-100" : "hidden opacity-100"}`}
        >
          Finalizar
        </Button>
        {!saved && (
          <Button
            size="sm"
            disabled={saving}
            color="primary"
            onClick={save}
            className={`w-full transition-opacity duration-300 ${showFinishElement[3] ? "flex opacity-100" : "hidden opacity-100"}`}
            variant="bordered"
          >
            {saving ? <Spinner /> : "Guardar FlashCards"}
          </Button>
        )}
      </div>
    );

  return (
    <div className="flex flex-col overflow-x-hidden">
      <div className="flex w-full mb-2 text-secondary">
        <Button
          size="sm"
          startContent={<IoMdArrowRoundBack size={18} />}
          onPress={fin}
        >
          Volver
        </Button>
      </div>
      {loading && (
        <div className="flex items-center justify-center h-96 ">
          <div>
            <Star />
            <p className="px-5 mt-8">
              Estamos generando tus tarjetas
              <br />
              gracias por esperar!
            </p>
          </div>
        </div>
      )}
      {questions[step] && (
        <div className="my-5 flex flex-col items-center w-screen px-2">
          <div
            className={`mb-5 transition-opacity duration-300 flex opacity-100`}
          >
            <h1>
              Tarjeta {step + 1}/{questions.length}
            </h1>
          </div>

          <div className="flex flex-col gap-5 justify-center">
            <Card
              className={`sm:w-96 min-h-96 sm:min-h-96 h-auto flex  ${viewResult ? "card-flip" : "card-container"}`}
            >
              <CardBody>
                <div
                  className={`flex flex-col justify-center items-center h-full  ${!viewResult ? "card-front" : "card-back"}`}
                >
                  <p
                    className={`text-md h-auto py-5 text-center card-front ${!viewResult ? "text-default-900" : "text-gray-500"}`}
                  >
                    {questions[step].front}
                  </p>
                  {viewResult && (
                    <>
                      <Divider />
                      <p className="text-md h-full text-center py-5">
                        {questions[step].back}
                      </p>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
            {viewResult ? (
              <Button color="primary" className="flex" onPress={handleContinue}>
                Continuar
              </Button>
            ) : (
              <Button
                color="primary"
                className="flex"
                onPress={() => setViewResult(true)}
              >
                Voltear
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCards;
