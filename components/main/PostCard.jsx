import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button, Spacer } from "@nextui-org/react";
import NextLink from "next/link";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { FaComment, FaRegComment } from "react-icons/fa";

export default function PostCard({ id, content, name, username, files = [], profile, handleLike, likes, isLiked, ...props }) {
    const [isFollowed, setIsFollowed] = useState(false);
    return (
        <Card className="mb-4">
            <CardHeader className="justify-between">
                <div className="flex gap-5">
                    <Avatar isBordered radius="full" size="md" src={profile} />
                    <div className="flex flex-col gap-1 items-start justify-center">
                        {name && <h4 className="text-small font-semibold leading-none text-default-600">{name}</h4>}
                        <h5 className="text-small tracking-tight text-default-400">@{username}</h5>
                    </div>
                    <div className="text-small tracking-tight text-default-400">
                        <p>Hace {tiempoTranscurrido(props.created_at)}</p>
                    </div>
                </div>
                <Button
                    className={isFollowed ? "bg-transparent text-foreground border-default-200" : ""}
                    color="primary"
                    radius="full"
                    size="sm"
                    variant={isFollowed ? "bordered" : "solid"}
                    onPress={() => setIsFollowed(!isFollowed)}
                >
                    {isFollowed ? "Unfollow" : "Follow"}
                </Button>
            </CardHeader>

            <CardBody className="px-3 py-0 text-small text-default-400">
                <p>{content}</p>
                {files.length > 0 && (
                    <div className="mt-4">
                        <h5 className="text-small font-semibold text-default-600">Archivos adjuntos:</h5>
                        <ul className="list-disc list-inside">
                            {files.map((file, index) => (
                                <li key={index} className="mt-2 flex items-center justify-between">
                                    <span>{file.file_name}</span>
                                    <Button
                                        as="a"
                                        href={file.file_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        color="primary"
                                        size="sm"
                                        variant="ghost"
                                    >
                                        Descargar
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardBody>

            <CardFooter className="gap-3 justify-between mt-3">
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
                    {
                        (!props.disabled || !props.disabled.linkComments) &&
                        <div className="flex gap-1 items-center justify-center">
                            <p className=" text-default-400 text-small">
                                {
                                    <Button as={'a'} href={`/post/${id}`} color="primary" variant="ghost" aria-label="Like" size="sm">
                                        <FaRegComment />
                                    </Button>
                                }
                            </p>
                        </div>
                    }
                </div>
                {(!props.disabled || !props.disabled.linkComments) &&
                    <div className="flex gap-1  items-center justify-center">
                        <p className="text-default-400 text-small">
                            <NextLink href={`/post/${id}`}>
                                {props.comments} comentarios
                            </NextLink>
                        </p>
                    </div>}
            </CardFooter>
        </Card>
    );
}

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