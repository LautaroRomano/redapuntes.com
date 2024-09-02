'use client'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from "@nextui-org/button";
import { generateCuestionario } from '../actions/pdf';

const Cuestionario = ({ file, fin }) => {
  const [step, setStep] = useState(0)
  const [finish, setFinish] = useState(0)
  const [viewResult, setViewResult] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)
  const [questions, setQuestions] = useState([])

  const handleSelectAnswer = (isTrue) => {
    setQuestions(prev => {
      const newData = [...prev]
      newData[step].result = isTrue
      return newData
    })
    setViewResult(true);
    if (isTrue) setSuccessCount(prev => prev + 1)
    setIsSuccess(isTrue)
  }

  const getCuestionario = async (text) => {
    const res = await generateCuestionario(text)
    setQuestions(res)
  }

  const finishim = () => {
    setStep(0)
    setFinish(0)
    setViewResult(false)
    setSuccessCount(0)
    setIsSuccess(false)
    setQuestions([])
    fin()
  }

  useEffect(() => {
    if (file && file.text)
      getCuestionario(file.text)
  }, [file])


  if (finish) return (
    <div className="flex flex-col gap-5">
      <h1>Bien hecho!</h1>
      <h2>Respondiste bien {successCount} de {questions.length}</h2>

      <Button
        color='primary'
        onClick={finishim}
      >
        Finalizar
      </Button>

      <h2>Las respuestas correctas</h2>
      <div className="flex flex-col gap-2">
        {questions.map((question) => {
          return (
            <>
              <p className='mt-5'>{question.question}</p>
              <div className='flex flex-col gap-5'>
                {question.answers.map(a => a.isTrue && (
                  <Button
                    disabled
                    className={`${viewResult ?
                      (a.isTrue ? 'bg-green-500' : 'bg-red-500') : 'primary'
                      }`}
                    onClick={() => handleSelectAnswer(a.isTrue)}
                  >
                    {a.text}
                  </Button>
                )).filter(Boolean)}
              </div>
            </>
          )
        })}
      </div>
      <div className=''></div>
    </div>
  )

  return (
    <div className="flex flex-col">

      <div>
        <div className='my-5'>
          <div className='mb-5'>
            <h1>Pregunta {step + 1}/{questions.length}</h1>
          </div>
          <p className='mb-2'>{questions[step].question}</p>
          <div className='flex flex-col gap-5'>
            {questions[step].answers.map(a => (
              <Button
                disabled={viewResult}
                className={`${viewResult ?
                  (a.isTrue ? 'bg-green-500' : 'bg-red-500') : 'primary'
                  }`}
                onClick={() => handleSelectAnswer(a.isTrue)}
              >
                {a.text}
              </Button>
            ))}
          </div>
          <div className={`${viewResult ? 'flex' : 'hidden'} w-full flex items-center flex-col mt-5 gap-2`}>
            <h5>{isSuccess ? 'Lo hiciste bien!' : 'Lo haras mejor la proxima!'}</h5>
            <Button
              color='primary'
              onClick={() => {
                if ((step + 1) === questions.length) setFinish(true)
                else setStep(prev => prev + 1)
                setViewResult(false)
              }}
            >
              Continuar
            </Button>
          </div>
        </div>
      </div>

    </div >
  )
}

export default Cuestionario;
