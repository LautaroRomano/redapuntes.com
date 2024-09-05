'use client'
import { useCallback, useEffect, useState } from 'react'
import { Button } from "@nextui-org/button";
import { generateCuestionario, saveCuestionario } from '../actions/pdf';
import Star from '@/components/loaders/Star';
import { reject } from 'lodash';
import { toast } from 'react-toastify';
import { Divider, Spinner } from '@nextui-org/react';

const Cuestionario = ({ file, fin }) => {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [finish, setFinish] = useState(false)
  const [viewResult, setViewResult] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)
  const [questions, setQuestions] = useState([])
  const [showQuestion, setShowQuestion] = useState(false);
  const [showAnswers, setShowAnswers] = useState([]);
  const [showFinishElement, setShowFinishElement] = useState([false, false, false, false, false, false]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!questions[step]) return;
    nextQuestion()
  }, [step]);

  const nextQuestion = () => {
    setShowQuestion(false); // Reiniciamos el estado de la pregunta

    // Mostrar la pregunta después de 0.3 segundos
    setTimeout(() => setShowQuestion(true), 300);

    // Limpiamos las respuestas anteriores antes de mostrarlas
    setShowAnswers([]);

    // Mostrar cada respuesta con un retraso de 0.3 segundos entre ellas
    questions[step].answers.forEach((_, index) => {
      setTimeout(() => setShowAnswers(prev => [...prev, index]), 600 + index * 300);
    });
  }

  useEffect(() => {
    if (!finish) return;

    for (let i = 1; i <= 6; i++) {
      setTimeout(() => {
        const newState = Array(i).fill(true).concat(Array(6 - i).fill(false));
        setShowFinishElement(newState);
      }, 800 + i * 400);
    }

  }, [finish]);

  useEffect(() => {
    if (step !== 0 || !questions[step]) return;
    nextQuestion()
  }, [questions]);

  const handleSelectAnswer = (isTrue) => {
    /* setQuestions(prev => {
      const newData = [...prev];
      newData[step].result = isTrue;
      return newData;
    }); */
    setViewResult(true);
    if (isTrue) setSuccessCount(prev => prev + 1);
    setIsSuccess(isTrue);
  };

  const getCuestionario = async (text) => {
    if (loading) return;
    setLoading(true)
    //const res = await generateCuestionario(text);
    const res = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([
          {
            question: "¿Qué es la transformada de Laplace?",
            answers: [
              {
                text: "Una técnica de transformación para el análisis de sistemas de control lineal.",
                isTrue: true
              },
              {
                text: "Una técnica de transformación para el análisis de sistemas de control no lineal.",
                isTrue: false
              },
              {
                text: "Una técnica de transformación para el análisis de sistemas de comunicación.",
                isTrue: false
              },
              {
                text: "Una técnica de transformación para el análisis de sistemas de retroalimentación.",
                isTrue: false
              }
            ],
            justification: "La definición del texto establece que la transformada de Laplace es una técnica de transformación para el análisis de sistemas de control lineal."
          },
          {
            question: "¿Qué representa la variable compleja s en la transformada de Laplace?",
            answers: [
              {
                text: "Una variable compleja definida por s = σ + jω.",
                isTrue: true
              },
              {
                text: "Una variable real definida por s = t.",
                isTrue: false
              },
              {
                text: "Una variable compleja definida por s = t + jω.",
                isTrue: false
              },
              {
                text: "Una variable real definida por s = σ.",
                isTrue: false
              }
            ],
            justification: "El texto establece que la variable compleja s en la transformada de Laplace está definida por s = σ + jω."
          },
          {
            question: "¿Qué es la inversa de la transformada de Laplace?",
            answers: [
              {
                text: "La transformada de Laplace de una función f(t).",
                isTrue: false
              },
              {
                text: "La conversión de un problema del dominio de la variable compleja s al dominio del tiempo.",
                isTrue: true
              },
              {
                text: "La transformada del dominio del tiempo al dominio de la variable compleja s.",
                isTrue: false
              },
              {
                text: "La solución obtenida al problema transformado en términos de s.",
                isTrue: false
              }
            ],
            justification: "Según el texto, la inversa de la transformada de Laplace es la conversión de un problema del dominio de la variable compleja s al dominio del tiempo."
          },
          {
            question: "¿Cuál es la propiedad de linealidad de la transformada de Laplace?",
            answers: [
              {
                text: "La T.L. de la suma o diferencia de dos funciones de tiempo es la suma o diferencia de las T.L. de las funciones de tiempo.",
                isTrue: true
              },
              {
                text: "La T.L. de la suma o diferencia de dos funciones de tiempo es el producto de las T.L. de las funciones de tiempo.",
                isTrue: false
              },
              {
                text: "La T.L. de la suma o diferencia de dos funciones de tiempo es el cociente de las T.L. de las funciones de tiempo.",
                isTrue: false
              },
              {
                text: "La T.L. de la suma o diferencia de dos funciones de tiempo es igual a cero.",
                isTrue: false
              }
            ],
            justification: "Según el texto, la propiedad de linealidad de la transformada de Laplace establece que la T.L. de la suma o diferencia de dos funciones de tiempo es la suma o diferencia de las T.L. de las funciones de tiempo."
          },
          {
            question: "¿Qué es la propiedad de traslación compleja en la transformada de Laplace?",
            answers: [
              {
                text: "La T.L. de la función e^at está dada por F(s) = 1/(s-a).",
                isTrue: false
              },
              {
                text: "La T.L. de la función e^at está dada por F(s) = s/(s-a).",
                isTrue: true
              },
              {
                text: "La T.L. de la función e^at está dada por F(s) = (s-a)/s.",
                isTrue: false
              },
              {
                text: "La T.L. de la función e^at está dada por F(s) = s^2/(s-a).",
                isTrue: false
              }
            ],
            justification: "Según el texto, la propiedad de traslación compleja en la transformada de Laplace establece que la T.L. de la función e^at está dada por F(s) = s/(s-a)."
          },
          {
            question: "¿Cuál es la transformada de Laplace de las derivadas?",
            answers: [
              {
                text: "F(s) = sf(s) - f(0+).",
                isTrue: true
              },
              {
                text: "F(s) = sf(s) + f(0+).",
                isTrue: false
              },
              {
                text: "F(s) = f(s) - sf(0+).",
                isTrue: false
              },
              {
                text: "F(s) = f(s) + sf(0+).",
                isTrue: false
              }
            ],
            justification: "Según el texto, la transformada de Laplace de las derivadas está dada por F(s) = sf(s) - f(0+)."
          },
          {
            question: "¿Cuál es la generalización de la transformada de Laplace de las derivadas?",
            answers: [
              {
                text: "F(s) = s^n F(s) - s^(n-1) f(0+) - ... - f^(n-1)(0+).",
                isTrue: true
              },
              {
                text: "F(s) = s^n F(s) + s^(n-1) f(0+) - ... - f^(n-1)(0+).",
                isTrue: false
              },
              {
                text: "F(s) = s^n F(s) - s^(n-1) f(0+) + ... + f^(n-1)(0+).",
                isTrue: false
              },
              {
                text: "F(s) = s^n F(s) + s^(n-1) f(0+) + ... + f^(n-1)(0+).",
                isTrue: false
              }
            ],
            justification: "Según el texto, la generalización de la transformada de Laplace de las derivadas está dada por F(s) = s^n F(s) - s^(n-1) f(0+) - ... - f^(n-1)(0+)."
          },
          {
            question: "¿Cuál es la transformada de Laplace de la función f(t) = e^(-t)?",
            answers: [
              {
                text: "F(s) = 1/(s+1).",
                isTrue: true
              },
              {
                text: "F(s) = 1/(s-1).",
                isTrue: false
              },
              {
                text: "F(s) = 1/(s+e).",
                isTrue: false
              },
              {
                text: "F(s) = 1/(s-e).",
                isTrue: false
              }
            ],
            justification: "Según el texto, la transformada de Laplace de la función f(t) = e^(-t) es F(s) = 1/(s+1)."
          }
        ])
      }, 1000);
    })
    if (res.error) {
      toast.error(res.error);
      setLoading(false);
      finishim()
      return;
    }
    setQuestions(res);
    setLoading(false)
    setStep(0);
  };

  const finishim = () => {
    setStep(0);
    setFinish(0);
    setViewResult(false);
    setSuccessCount(0);
    setIsSuccess(false);
    setQuestions([]);
    setShowFinishElement([false, false, false, false, false, false])
    fin();
  };

  useEffect(() => {
    if (file && file.text)
      getCuestionario(file.text);
  }, [file]);

  const save = async () => {
    setSaving(true)
    const res = await saveCuestionario({ file_id: file.file_id, data: questions })
    if (res.error) {
      toast.error(res.error)
      setSaving(false)
      return
    }
    setSaving(false)
    toast.success('Guardado con exito!')
  }

  if (finish) return (
    <div className="flex flex-col gap-3 items-center w-full px-2">
      <div className={`w-36 transition-opacity duration-300 ${showFinishElement[0] ? 'flex opacity-100' : 'hidden opacity-100'}`}>
        <img src="https://i.pinimg.com/originals/15/32/42/153242d25a0c6696d9eebd5847c16eb2.gif" alt="" />
      </div>
      <h1 className={`text-2xl  transition-opacity duration-300 ${showFinishElement[1] ? 'flex opacity-100' : 'hidden opacity-100'}`}><strong>Bien hecho!</strong></h1>
      <h2 className={`text-xl transition-opacity duration-300 ${showFinishElement[2] ? ' flex opacity-100' : 'hidden opacity-100'}`}><strong>Respondiste bien {successCount} de {questions.length}</strong></h2>

      <Button
        color='primary'
        onClick={finishim}
        className={`w-full transition-opacity duration-300 mt-4 ${showFinishElement[3] ? 'flex opacity-100' : 'hidden opacity-100'}`}
        size='sm'
        >
        Finalizar
      </Button>
      <Button
        size='sm'
        disabled={saving}
        color='primary'
        onClick={save}
        className={`w-full transition-opacity duration-300 ${showFinishElement[3] ? 'flex opacity-100' : 'hidden opacity-100'}`}
        variant='bordered'
      >
        {saving ? <Spinner /> : 'Guardar Cuestionario'}
      </Button>

      <h2 className={`mt-9 text-xl transition-opacity duration-300 ${showFinishElement[4] ? 'flex opacity-100' : 'hidden opacity-100'}`}><strong>Las respuestas correctas</strong></h2>
      <div className={`flex flex-col gap-5 items-start justify-start text-start transition-opacity duration-300 ${showFinishElement[5] ? 'flex opacity-100' : 'hidden opacity-100'}`}>
        {questions.map((question, i) => {
          return (
            <div className='gap-2' key={i}>
              <p><strong>Pregunta {i + 1}:</strong> {question.question}</p>
              <div className='flex flex-col gap-0'>
                <p><strong>Respuesta correcta:</strong> {question.answers.find(a => a.isTrue)?.text}</p>
                <p><strong>Justificación:</strong> {question.justification}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {loading &&
        <div className='flex items-center justify-center h-96 '>
          <div>
            <Star />
            <p className='px-5 mt-8'>Estamos generando tu cuestionario<br />gracias por esperar!</p>
          </div>
        </div>
      }
      {questions[step] && (
        <div className='my-5 flex flex-col items-center w-screen sm:w-[30rem] px-2'>
          <div className={`mb-5 transition-opacity duration-300 ${showQuestion ? 'flex opacity-100' : 'hidden opacity-100'}`}>
            <h1>Pregunta {step + 1}/{questions.length}</h1>
          </div>
          <p className={`mb-2 transition-opacity duration-300 ${showQuestion ? 'flex opacity-100' : 'hidden opacity-100'}`}>
            {questions[step].question}
          </p>
          <div className='flex flex-col gap-5 w-full'>
            {questions[step].answers.map((a, index) => (
              <Button
                key={index}
                disabled={viewResult}
                className={`w-full max-w-screen h-auto px-1 py-2 text-wrap transition-opacity duration-300 ${showAnswers.includes(index) ? 'flex opacity-100 pointer-events-auto' : 'hidden opacity-100 pointer-events-none'} ${viewResult ?
                  (a.isTrue ? 'bg-green-500' : 'bg-red-500') : 'primary'}`}
                onClick={() => handleSelectAnswer(a.isTrue)}
              >
                {a.text}
              </Button>
            ))}
          </div>
          {
            viewResult &&
            <>
              <Divider className='my-3'></Divider>
              <Button
                className='w-full'
                color='primary'
                onClick={() => {
                  setShowQuestion(false);
                  setShowAnswers([]);
                  setViewResult(false);
                  if ((step + 1) === questions.length) setFinish(true);
                  else setStep(prev => prev + 1);
                }}
              >
                Continuar
              </Button>
            </>
          }
          <div className={`${viewResult ? 'flex' : 'hidden'} w-full flex items-center flex-col mt-4 gap-4`}>
            <h5>{isSuccess ? '¡Lo hiciste bien!' : '¡Lo harás mejor la próxima vez!'}</h5>
            {
              viewResult &&
              <div className='text-sm'>
                {questions[step].justification}
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default Cuestionario;
