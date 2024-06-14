"use client";
import { Avatar, Button, Card, CardBody, Textarea } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getComments, getPostById, setComment } from "../../actions/posts";
import { tiempoTranscurrido } from '@/app/lib/calcularTiempo'

import RenderPostsList from "@/components/RenderPostsList";
import PostSkeleton from "@/components/PostSkeleton";

export default function PostPage({ params }) {
  const [post, setPost] = useState();
  const [comments, setComments] = useState([]);
  const [myComment, setMyComment] = useState("");

  const getPost = async (post_id) => {
    const myPost = await getPostById(post_id);

    if (myPost.error) return toast.error(myPost.error);
    setPost(myPost);
  };
  const getCommentList = async (post_id) => {
    const commentList = await getComments(post_id);

    if (commentList.error) return toast.error(commentList.error);
    setComments(commentList);
  };

  useEffect(() => {
    if (params.post_id) {
      getPost(params.post_id);
      getCommentList(params.post_id);
    }
  }, [params]);

  const setNewComment = async () => {
    const newComments = await setComment(params.post_id, myComment);

    if (newComments.error) return toast.error(newComments.error);
    setComments(newComments);
    setMyComment("");
  };

  return (
    <div className="w-full max-w-lg ">
      <Card className="mb-4 w-full">
        <CardBody className="px-3 py-0 text-small text-default-400 items-center gap-2">
          <div className="my-5 w-full">
            {
              post ?
                <RenderPostsList
                  disabled={{ linkComments: true }}
                  postsList={[post]}
                />
                : <PostSkeleton />
            }

            <div className="w-full flex gap-2 items-center">
              <Textarea
                className="h-12"
                placeholder="Escribe tu comentario"
                value={myComment}
                onChange={({ target }) => setMyComment(target.value)}
                disabled={!post}
              />
              <Button
                color={myComment.length < 1 ? "default" : "primary"}
                disabled={!post || myComment.length < 1}
                onClick={setNewComment}
              >
                Comentar
              </Button>
            </div>

            {comments.map((com) => {
              return (
                <Card key={com.comment_id} className="my-2">
                  <CardBody className="px-3 py-4 text-small text-default-400">
                    <div className="flex gap-2">
                      <div className="me-2">
                        <Avatar
                          isBordered
                          radius="full"
                          size="md"
                          src={com.img}
                        />
                      </div>
                      <div className="flex flex-col gap-1 items-start justify-start">
                        <p>
                          <span className="text-small text-white tracking-tight cursor-pointer me-3">
                            @{com.username}
                          </span>
                          {com.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-0 text-small">
                      <p>Hace {tiempoTranscurrido(com.created_at)}</p>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
