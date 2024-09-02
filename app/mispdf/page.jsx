'use client'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'
import { getMyPDF } from '../actions/pdf'
import { FaFilePdf } from "react-icons/fa6";
import { Spinner } from '@nextui-org/react'
import ModalTools from './ModalTools'
import Cuestionario from './Cuestionario'

const PdfHome = () => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectTool, setSelectTool] = useState(null)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    const formData = new FormData()
    formData.append('file', file)
    setLoading(true)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      toast.error("Ocurrio un error, intentalo nuevamente mas tarde.");
      setLoading(false)
      return
    }

    const result = await res.json()
    console.log("🚀 ~ onDrop ~ result:", result)

    setLoading(false)
    getFiles()

  }, [])
  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  const getFiles = async () => {
    setLoading(true)
    try {
      const myFiles = await getMyPDF();
      setFiles(myFiles)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error);

    }
  }

  useEffect(() => {
    getFiles()
  }, [])

  if (selectTool) {
    return (
      <Cuestionario file={selectTool.file} fin={() => setSelectTool(null)} />
    )
  }

  return (
    <div className="flex flex-col">

      <div className="flex flex-col">
        <h1>Tus archivos</h1>
        <div className="flex p-2 flex-wrap gap-2">
          {
            [...files, ...files, ...files, ...files].map(fil => (
              <ModalTools pdf={fil} setSelectTool={setSelectTool}>
                <div className='flex border p-2 flex-col items-center justify-evenly w-36 h-32 hover:border-blue-600 hover:text-blue-600 cursor-pointer'>
                  <p className='text-4xl'>
                    <FaFilePdf />
                  </p>
                  <div className='overflow-hidden'>
                    <p className='text-sm text-ellipsis w-full'>
                      {fil.name}
                    </p>
                  </div>
                </div>
              </ModalTools>
            ))
          }
        </div>

      </div>

      <div className="container border-2 p-5 border-dashed cursor-pointer hover:border-blue-600 hover:text-blue-600">
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <p>{loading ? <Spinner /> : 'Agregar nuevo archivo'}</p>
        </div>
      </div>

      <div>

      </div>

    </div >
  )
}

export default PdfHome;
