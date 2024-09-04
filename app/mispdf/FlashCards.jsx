"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { generateCuestionario } from "../actions/pdf";
import Star from "@/components/loaders/Star";
import { reject } from "lodash";
import { toast } from "react-toastify";

const FlashCards = ({ file, fin }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [finish, setFinish] = useState(false);
  const [viewResult, setViewResult] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showAnswers, setShowAnswers] = useState([]);
  const [showFinishElement, setShowFinishElement] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  useEffect(() => {
    if (!questions[step]) return;
    nextQuestion();
  }, [step]);

  const nextQuestion = () => {
    setShowQuestion(false); // Reiniciamos el estado de la pregunta

    // Mostrar la pregunta después de 0.3 segundos
    setTimeout(() => setShowQuestion(true), 300);

    // Limpiamos las respuestas anteriores antes de mostrarlas
    setShowAnswers([]);

    // Mostrar cada respuesta con un retraso de 0.3 segundos entre ellas
    questions[step].answers.forEach((_, index) => {
      setTimeout(
        () => setShowAnswers((prev) => [...prev, index]),
        600 + index * 300
      );
    });
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
        800 + i * 400
      );
    }
  }, [finish]);

  useEffect(() => {
    if (step !== 0 || !questions[step]) return;
    nextQuestion();
  }, [questions]);

  const handleSelectAnswer = (isTrue) => {
    setQuestions((prev) => {
      const newData = [...prev];
      newData[step].result = isTrue;
      return newData;
    });
    setViewResult(true);
    if (isTrue) setSuccessCount((prev) => prev + 1);
    setIsSuccess(isTrue);
  };

  const getCuestionario = async (text) => {
    if (loading) return;
    setLoading(true);
    //const res = await generateCuestionario(text);
    const res = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([
          {
            front: "Hola desde el front",
            back: "Hola desde el back",
          },
        ]);
      }, 1000);
    });
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
    setSuccessCount(0);
    setIsSuccess(false);
    setQuestions([]);
    setShowFinishElement([false, false, false, false, false, false]);
    fin();
  };

  useEffect(() => {
    if (file && file.text) getCuestionario(file.text);
  }, [file]);

  if (finish)
    return (
      <div className="flex flex-col gap-5 items-center w-full px-2">
        <div
          className={`w-48 transition-opacity duration-300 ${showFinishElement[0] ? "flex opacity-100" : "hidden opacity-100"}`}
        >
          <img
            src="https://i.pinimg.com/originals/15/32/42/153242d25a0c6696d9eebd5847c16eb2.gif"
            alt=""
          />
        </div>
        <h1
          className={`text-3xl  transition-opacity duration-300 ${showFinishElement[1] ? "flex opacity-100" : "hidden opacity-100"}`}
        >
          <strong>Bien hecho!</strong>
        </h1>
        <h2
          className={`text-2xl transition-opacity duration-300 ${showFinishElement[2] ? " flex opacity-100" : "hidden opacity-100"}`}
        >
          <strong>
            Respondiste bien {successCount} de {questions.length}
          </strong>
        </h2>

        <Button
          color="primary"
          onClick={finishim}
          className={`w-full transition-opacity duration-300 ${showFinishElement[3] ? "flex opacity-100" : "hidden opacity-100"}`}
        >
          Finalizar
        </Button>
        <Button
          color="primary"
          onClick={finishim}
          className={`w-full transition-opacity duration-300 ${showFinishElement[3] ? "flex opacity-100" : "hidden opacity-100"}`}
          variant="bordered"
        >
          Guardar FlashCards
        </Button>
      </div>
    );

  return (
    <div className="flex flex-col">
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
            className={`mb-5 transition-opacity duration-300 ${showQuestion ? "flex opacity-100" : "hidden opacity-100"}`}
          >
            <h1>
              Tarjeta {step + 1}/{questions.length}
            </h1>
          </div>
          {viewResult ? (
            <p
              className={`mb-2 transition-opacity duration-300 ${showQuestion ? "flex opacity-100" : "hidden opacity-100"}`}
            >
              {questions[step].front}
            </p>
          ) : (
            <div className="flex flex-col gap-5 w-full">
              {questions[step].back}
            </div>
          )}
          <div
            className={`${viewResult ? "flex" : "hidden"} w-full flex items-center flex-col mt-8 gap-4`}
          >
            <h5>
              {isSuccess
                ? "¡Lo hiciste bien!"
                : "¡Lo harás mejor la próxima vez!"}
            </h5>
            <Button
              color="primary"
              onClick={() => {
                setShowQuestion(false);
                setShowAnswers([]);
                setViewResult(false);
                if (step + 1 === questions.length) setFinish(true);
                else setStep((prev) => prev + 1);
              }}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCards;
