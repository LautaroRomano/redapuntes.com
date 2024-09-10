"use client";
import { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { IoMdArrowRoundBack } from "react-icons/io";
import { toast } from "react-toastify";
import { Card, CardBody, Divider, Spinner } from "@nextui-org/react";

import { saveCards } from "../actions/pdf";

import Star from "@/components/loaders/Star";
import "./styles/FlashCards.css";

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
        400 + i * 400,
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

    try {
      const res = await fetch("/api/openai/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      if (!res.ok) {
        if (res.status === 403) {
          return toast.error("Iniciar sesión para continuar.");
        }
        if (res.status === 499) {
          return toast.error("Debes conseguir estrellas para continuar!");
        }

        return toast.error("Ocurrió un error, inténtalo nuevamente más tarde.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";
      let resultado = "";

      while (!done) {
        const { value, done: streamDone } = await reader.read();

        done = streamDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });

          buffer += chunk; // Acumulamos en el buffer

          // Dividimos por el separador
          const parts = buffer.split("\n\n");

          parts.slice(0, -1).forEach((part) => {
            try {
              const jsonChunk = JSON.parse(part); // Parseamos cada parte como JSON
              const content = jsonChunk.choices[0]?.delta?.content || "";

              resultado += content;
            } catch (error) {
              toast.error('Ocurrio un error!')
            }
          });

          // Guardamos la última parte en el buffer (puede estar incompleta)
          buffer = parts[parts.length - 1];
        }
      }
      resultado = resultado.replace(/^```json/, "").replace(/```$/, "");
      setQuestions(JSON.parse(resultado));
    } catch (error) {
      toast.error("Ocurrio un error inesperado!");
      setLoading(false);
      finishim();

      return;
    }

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
          <img alt="" src="/success.gif" />
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
          className={`w-full transition-opacity duration-300 mt-16 ${showFinishElement[3] ? "flex opacity-100" : "hidden opacity-100"}`}
          color="primary"
          size="sm"
          onClick={finishim}
        >
          Finalizar
        </Button>
        {!saved && (
          <Button
            className={`w-full transition-opacity duration-300 ${showFinishElement[3] ? "flex opacity-100" : "hidden opacity-100"}`}
            color="primary"
            disabled={saving}
            size="sm"
            variant="bordered"
            onClick={save}
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
              <Button className="flex" color="primary" onPress={handleContinue}>
                Continuar
              </Button>
            ) : (
              <Button
                className="flex"
                color="primary"
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
