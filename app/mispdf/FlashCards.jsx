"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { generateCards } from "../actions/pdf";
import Star from "@/components/loaders/Star";
import { toast } from "react-toastify";
import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import './styles/FlashCards.css'

const FlashCards = ({ file, fin }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [finish, setFinish] = useState(false);
  const [viewResult, setViewResult] = useState(false);
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
      setStep(prev => prev + 1);
    } else {
      setFinish(true)
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
        800 + i * 400
      );
    }
  }, [finish]);

  const getCuestionario = async (text) => {
    if (loading) return;
    setLoading(true);
    //const res = await generateCards(text);
    const res = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([
          {
              "front": "¿Cuál es el método utilizado para resolver EDO por aproximación?",
              "back": "El método utilizado es el Método de Euler, que consiste en trazar una recta tangente en el punto inicial y usarla para predecir el valor de la función en el siguiente punto."
          },
          {
              "front": "¿Cuál es la fórmula para calcular el valor aproximado de la función en el siguiente punto utilizando el Método de Euler?",
              "back": "La fórmula es y_i+1 = y_i + f(x_i, y_i) * h, donde y_i es el valor de la función en el punto anterior, f(x_i, y_i) es la derivada en ese punto y h es el tamaño del paso."
          },
          {
              "front": "¿Cuál es el principal error asociado al Método de Euler?",
              "back": "El principal error es el error de truncamiento, que se produce al truncar la Serie de Taylor en el segundo término. Este error se disminuye al reducir el tamaño del paso h."
          },
          {
              "front": "¿Cuál es el método que mejora la aproximación a la pendiente en el Método de Euler?",
              "back": "El Método de Heun mejora la aproximación a la pendiente al calcular dos derivadas en el punto inicial y final, y luego promediarlas para obtener una aproximación más precisa."
          },
          {
              "front": "¿Cuál es la fórmula utilizada en el Método de Heun para predecir el valor de y en el punto siguiente?",
              "back": "La fórmula es y_i+1 = y_i + f(x_i, y_i) * h + f(x_i+1, y_i+10 * h) * h / 2, donde y_i es el valor de la función en el punto anterior, f(x_i, y_i) es la derivada en ese punto, f(x_i+1, y_i+1) es la derivada en el punto siguiente y h es el tamaño del paso."
          },
          {
              "front": "¿Cuál es el método que utiliza el cálculo de la derivada en el punto medio del intervalo para mejorar la aproximación en el Método de Euler?",
              "back": "El Método del Polígono Mejorado, también conocido como Euler Modificado, utiliza el cálculo de la derivada en el punto medio del intervalo para predecir el valor de y en ese punto, y luego utiliza ese valor para calcular la pendiente y actualizar el valor de y en el punto siguiente."
          },
          {
              "front": "¿Cuáles son los métodos de Runge Kutta más utilizados?",
              "back": "Los métodos de Runge Kutta de tercer y cuarto orden son los más utilizados debido a su exactitud y capacidad para evitar el cálculo de derivadas superiores."
          },
          {
              "front": "¿Cuál es el error de truncamiento del Método de Runge Kutta de Tercer Orden?",
              "back": "El error de truncamiento del Método de Runge Kutta de Tercer Orden es del O(h^4), lo que significa que disminuye más rápidamente que el Método de Euler a medida que se reduce el tamaño del paso h."
          }
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
            Terminaste tu repaso
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
    <div className="flex flex-col overflow-x-hidden">
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
            <Card className={`w-96 min-h-96 h-auto flex  ${viewResult?'card-flip':'card-container'}`}>
              <CardBody>
                <div className={`flex flex-col justify-center items-center h-full  ${!viewResult ? 'card-front' : 'card-back'}`}>
                  <p className={`text-md h-auto py-5 text-center card-front ${!viewResult ? 'text-default-900' : 'text-gray-500'}`}>
                    {questions[step].front}
                  </p>
                  {
                    viewResult && <>
                      <Divider />
                      <p className="text-md h-full text-center py-5">
                        {questions[step].back}
                      </p>
                    </>
                  }
                </div>
              </CardBody>
            </Card>
            {
              viewResult ?
                <Button color="primary" className="flex" onPress={handleContinue}>Continuar</Button>
                :
                <Button color="primary" className="flex" onPress={() => setViewResult(true)}>Voltear</Button>
            }
          </div>

        </div>
      )}
    </div>
  );
};

export default FlashCards;
