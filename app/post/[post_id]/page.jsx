'use client';
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Input, Link, Textarea } from "@nextui-org/react";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { getComments, getPostById, setComment } from '../../actions/posts'
import RenderPostsList from "@/components/RenderPostsList";
import { toast } from 'react-toastify'

export default function PostPage({ params }) {
  const [post, setPost] = useState("");
  const [comments, setComments] = useState([])
  const [myComment, setMyComment] = useState('')
  const [success, setSucces] = useState(false)
  const [error, setError] = useState(false)

  const router = useRouter()

  const getPost = async (post_id) => {
    const myPost = await getPostById(post_id)
    if (myPost.error) return toast.error(myPost.error)
    setPost(myPost)
  }
  const getCommentList = async (post_id) => {
    const commentList = await getComments(post_id)
    if (commentList.error) return toast.error(commentList.error)
    setComments(commentList)
  }

  useEffect(() => {
    if (params.post_id) {
      getPost(params.post_id)
      getCommentList(params.post_id)
    }
  }, [params])

  const setNewComment = async () => {
    const newComments = await setComment(params.post_id, myComment)
    if (newComments.error) return toast.error(newComments.error)
    setComments(newComments)
    setMyComment('')
  }

  return (
    <div className="w-full">
      <Card className="mb-4 w-full">
        <CardHeader className="justify-center">
        </CardHeader>

        <CardBody className="px-3 py-0 text-small text-default-400 items-center gap-2">

          <div className="my-5 w-full">
            <RenderPostsList postsList={[post]} disabled={{ linkComments: true }} />

            <div className="w-full flex gap-2 items-center">
              <Textarea
                placeholder="Escribe tu comentario"
                className="h-12"
                value={myComment}
                onChange={({ target }) => setMyComment(target.value)}
              />
              <Button onClick={setNewComment} color={myComment.length < 1 ? 'default' : 'primary'} disabled={myComment.length < 1}>Comentar</Button>
            </div>

            {comments.map((com) => {
              return (
                <Card className="my-2" key={com.comment_id}>
                  <CardBody className="px-3 py-4 text-small text-default-400">
                    <div className="flex gap-2">
                      <div className="me-2">
                        <Avatar isBordered radius="full" size="md" src={com.img} />
                      </div>
                      <div className="flex flex-col gap-1 items-start justify-start">
                        <p><span className="text-small text-white tracking-tight cursor-pointer me-3">@{com.username}</span>{com.content}</p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-0 text-small">
                      <p>Hace {tiempoTranscurrido(com.created_at)}</p>
                    </div>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </CardBody>

      </Card >
    </div>
  );

  function tiempoTranscurrido(fecha) {
    const fechaActual = new Date();
    const fechaDadaUTC = new Date(fecha);

    // Convertir fecha UTC a la zona horaria local
    const offset = fechaDadaUTC.getTimezoneOffset();
    const fechaDada = new Date(fechaDadaUTC.getTime() - offset * 60 * 1000);

    const diferencia = fechaActual - fechaDada;

    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (segundos < 60) {
      return `${segundos} segundos`;
    } else if (minutos < 60) {
      return `${minutos} minutos`;
    } else if (horas < 24) {
      return `${horas} horas`;
    } else {
      return `${dias} días`;
    }
  }
}
