'use client';
import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Input, Link, Textarea } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaGoogle } from "react-icons/fa";
import NextLink from "next/link";
import { title } from "@/components/primitives";
import { useRouter } from "next/navigation";
import { getComments, getPostById, setComment } from '../../actions/posts'
import RenderPostsList from "@/components/RenderPostsList";

export default function PostPage({ params }) {
  const [post, setPost] = useState("");
  const [comments, setComments] = useState([])
  const [myComment, setMyComment] = useState('')
  const [success, setSucces] = useState(false)
  const [error, setError] = useState(false)

  const router = useRouter()

  const getPost = async (post_id) => {
    const myPost = await getPostById(post_id)
    setPost(myPost)
  }
  const getCommentList = async (post_id) => {
    const commentList = await getComments(post_id)
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
    setComments(newComments)
  }

  return (
    <div className="w-full">
      <Card className="mb-4 w-full">
        <CardHeader className="justify-center">
        </CardHeader>

        <CardBody className="px-3 py-0 text-small text-default-400 items-center gap-2">

          <div className="my-5">
            <RenderPostsList postsList={[post]} disabled={{ linkComments: true }} />

            <div className="w-full flex gap-2 items-center">
              <Textarea
                placeholder="Escribe tu comentario"
                className="h-12"
                value={myComment}
                onChange={({ target }) => setMyComment(target.value)}
              />
              <Button onClick={setNewComment}>Comentar</Button>
            </div>

            {comments.map((com) => {
              return (
                <Card className="mb-4" key={com.comment_id}>
                  <CardHeader className="justify-between">
                    <div className="flex gap-5">
                      <Avatar isBordered radius="full" size="md" src={com.img} />
                      <div className="flex flex-col gap-1 items-start justify-center">
                        <h5 className="text-small tracking-tight text-default-400">@{com.username}</h5>
                      </div>
                    </div>
                  </CardHeader>

                  <CardBody className="px-3 py-0 text-small text-default-400">
                    <p>{com.content}</p>
                  </CardBody>

                  {/*  <CardFooter className="gap-3 justify-between mt-3">
                  <div className="flex gap-3">
                    <div className="flex gap-1 items-center justify-center">
                      <p className=" text-default-400 text-small">
                        {
                          <Button color="primary" variant={isLiked ? "solid" : 'ghost'} aria-label="Like" size="sm" onClick={() => handleLike(id)}>
                            {isLiked ? <AiOutlineLike /> : <AiFillLike />}
                            {likes}
                          </Button>
                        }
                      </p>
                    </div>
                    <div className="flex gap-1 items-center justify-center">
                      <p className=" text-default-400 text-small">
                        {
                          <Button as={'a'} href={`/post/${id}`} color="primary" variant="ghost" aria-label="Like" size="sm">
                            <FaRegComment />
                          </Button>
                        }
                      </p>
                    </div>
                  </div>
                  {(!props.disabled || !props.disabled.linkComments) &&
                    <div className="flex gap-1  items-center justify-center">
                      <p className="text-default-400 text-small">
                        <NextLink href={`/post/${id}`}>
                          Ver los 80 comentarios
                        </NextLink>
                      </p>
                    </div>}
                </CardFooter> */}
                </Card>
              )
            })}
          </div>
        </CardBody>

      </Card >
    </div>
  );
}
