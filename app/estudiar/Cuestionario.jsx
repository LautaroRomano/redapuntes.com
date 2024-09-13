"use client";
import { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { toast } from "react-toastify";
import { Divider, Spinner } from "@nextui-org/react";
import { IoMdArrowRoundBack } from "react-icons/io";

import { saveCuestionario } from "../actions/pdf";

import Star from "@/components/loaders/Star";

const Cuestionario = ({ file, fin, saved }) => {
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!questions[step]) return;
    nextQuestion();
  }, [step]);

  const nextQuestion = () => {
    setShowQuestion(false); // Reiniciamos el estado de la pregunta

    // Mostrar la pregunta después de 0.3 segundos
    setTimeout(() => setShowQuestion(true), 200);

    // Limpiamos las respuestas anteriores antes de mostrarlas
    setShowAnswers([]);

    // Mostrar cada respuesta con un retraso de 0.3 segundos entre ellas
    questions[step].answers.forEach((_, index) => {
      setTimeout(
        () => setShowAnswers((prev) => [...prev, index]),
        600 + index * 100,
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
        400 + i * 400,
      );
    }
  }, [finish]);

  useEffect(() => {
    if (step !== 0 || !questions[step]) return;
    nextQuestion();
  }, [questions]);

  const handleSelectAnswer = (isTrue) => {
    setViewResult(true);
    if (isTrue) setSuccessCount((prev) => prev + 1);
    setIsSuccess(isTrue);
  };

  useEffect(() => {
    if (saved) {
      setQuestions(saved.data);
      setStep(0);
    }
  }, [saved]);

  const getCuestionario = async (text) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/openai/cuestionario", {
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
          toast.error("Iniciar sesión para continuar.");
          finishim();

          return;
        }
        if (res.status === 499) {
          toast.error("Debes conseguir estrellas para continuar!");
          finishim();

          return;
        }

        toast.error("Ocurrió un error, inténtalo nuevamente más tarde.");
        finishim();

        return;
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
              toast.error("Ocurrio un error!");
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
    setSuccessCount(0);
    setIsSuccess(false);
    setQuestions([]);
    setShowFinishElement([false, false, false, false, false, false]);
    fin();
  };

  useEffect(() => {
    if (file && file.text && !loading && questions.length === 0)
      getCuestionario(file.text);
  }, [file]);

  const save = async () => {
    setSaving(true);
    const res = await saveCuestionario({
      file_id: file.file_id,
      data: questions,
    });

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
          <strong>
            Respondiste bien {successCount} de {questions.length}
          </strong>
        </h2>

        <Button
          className={`w-full transition-opacity duration-300 mt-4 ${showFinishElement[3] ? "flex opacity-100" : "hidden opacity-100"}`}
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
            {saving ? <Spinner /> : "Guardar Cuestionario"}
          </Button>
        )}

        <h2
          className={`mt-9 text-xl transition-opacity duration-300 ${showFinishElement[4] ? "flex opacity-100" : "hidden opacity-100"}`}
        >
          <strong>Las respuestas correctas</strong>
        </h2>
        <div
          className={`flex flex-col gap-5 items-start justify-start text-start transition-opacity duration-300 ${showFinishElement[5] ? "flex opacity-100" : "hidden opacity-100"}`}
        >
          {questions.map((question, i) => {
            return (
              <div key={i} className="gap-2">
                <p>
                  <strong>Pregunta {i + 1}:</strong> {question.question}
                </p>
                <div className="flex flex-col gap-0">
                  <p>
                    <strong>Respuesta correcta:</strong>{" "}
                    {question.answers.find((a) => a.isTrue)?.text}
                  </p>
                  <p>
                    <strong>Justificación:</strong> {question.justification}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col">
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
              Estamos generando tu cuestionario
              <br />
              gracias por esperar!
            </p>
          </div>
        </div>
      )}
      {questions[step] && (
        <div className="my-5 flex flex-col items-center w-screen sm:w-[30rem] px-2">
          <div
            className={`mb-5 transition-opacity duration-300 ${showQuestion ? "flex opacity-100" : "hidden opacity-100"}`}
          >
            <h1>
              Pregunta {step + 1}/{questions.length}
            </h1>
          </div>
          <p
            className={`mb-2 transition-opacity duration-300 ${showQuestion ? "flex opacity-100" : "hidden opacity-100"}`}
          >
            {questions[step].question}
          </p>
          <div className="flex flex-col gap-5 w-full">
            {questions[step].answers.map((a, index) => (
              <Button
                key={index}
                className={`w-full max-w-screen h-auto px-1 py-2 text-wrap transition-opacity duration-300 ${showAnswers.includes(index) ? "flex opacity-100 pointer-events-auto" : "hidden opacity-100 pointer-events-none"} ${
                  viewResult
                    ? a.isTrue
                      ? "bg-green-500"
                      : "bg-red-500"
                    : "primary"
                }`}
                disabled={viewResult}
                onClick={() => handleSelectAnswer(a.isTrue)}
              >
                {a.text}
              </Button>
            ))}
          </div>
          {viewResult && (
            <>
              <Divider className="my-3" />
              <Button
                className="w-full"
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
            </>
          )}
          <div
            className={`${viewResult ? "flex" : "hidden"} w-full flex items-center flex-col mt-4 gap-4`}
          >
            <h5>
              {isSuccess
                ? "¡Lo hiciste bien!"
                : "¡Lo harás mejor la próxima vez!"}
            </h5>
            {viewResult && (
              <div className="text-sm">{questions[step].justification}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cuestionario;
