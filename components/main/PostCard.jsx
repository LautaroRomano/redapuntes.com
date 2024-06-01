import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button, Spacer, Image, Modal, ModalContent, ModalHeader, ModalFooter } from "@nextui-org/react";
import NextLink from "next/link";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { FaComment, FaRegComment } from "react-icons/fa";
import Link from "next/link";
import { IoMdDownload } from "react-icons/io";

export default function PostCard({ id, content, name, username, files = [], profile, handleLike, likes, isLiked, ...props }) {
    const [expandedImage, setExpandedImage] = useState(null);

    const handleImageClick = (file) => {
        setExpandedImage(file);
    };

    const handleCloseModal = () => {
        setExpandedImage(null);
    };


    return (
        <>
            <Card className="mb-4">
                <CardHeader className="justify-between">
                    <div className="flex gap-5">
                        <Link href={`/profile/${username}`}>
                            <Avatar isBordered radius="full" size="md" src={profile} />
                        </Link>
                        <div className="flex flex-col gap-1 items-start justify-center">
                            <Link href={`/profile/${username}`}>
                                {name && <h4 className="text-small font-semibold leading-none text-default-600">{name}</h4>}
                                <h5 className="text-small tracking-tight text-default-400 mt-1">@{username}</h5>
                            </Link>
                        </div>
                        <div className="text-small tracking-tight text-default-400">
                            <p>Hace {tiempoTranscurrido(props.created_at)}</p>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="px-3 py-0 text-small text-default-400">
                    <p>{content}</p>
                    {files.length > 0 && (
                        <div className="flex mt-4 overflow-auto">
                            {files
                                .filter(file => file.file_type.includes('image'))
                                .map((file, index) => (
                                    <div key={index} className="w-52 h-50 overflow-hidden flex-shrink-0 mr-4 mb-4 hover:bg-gray-800 flex justify-center items-center">
                                        <Image
                                            alt="NextUI hero Image"
                                            src={file.file_path}
                                            className="object-cover w-full h-full cursor-pointer"
                                            onClick={() => handleImageClick(file)}
                                        />
                                    </div>
                                ))}
                        </div>
                    )}
                    {files.length > 0 && (
                        <div className="mt-4">
                            <h5 className="text-small font-semibold text-default-600">Archivos adjuntos:</h5>
                            <ul className="list-disc list-inside">
                                {files
                                    .filter(file => !file.file_type.includes('image'))
                                    .map((file, index) => (
                                        <li key={index} className="mt-2 flex items-center justify-between">
                                            <span>{file.file_name}</span>
                                            <Button
                                                as="a"
                                                href={file.file_path}
                                                download={file.file_name}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                color="primary"
                                                size="sm"
                                                variant="flat"
                                            >
                                                <p className="text-lg">
                                                    <IoMdDownload />
                                                </p>
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
                                        <p className="text-lg">
                                            {isLiked ? <AiOutlineLike /> : <AiFillLike />}
                                        </p>
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
                                            <p className="text-lg">
                                                <FaRegComment />
                                            </p>
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
                </CardFooter >
            </Card >
            {expandedImage && (
                <Modal isOpen={true} onClose={handleCloseModal}>
                    <ModalContent>
                        <div className="flex justify-center p-8">
                            <img src={expandedImage.file_path} alt="Expanded Image" className="max-w-full max-h-full" />
                        </div>
                        <ModalFooter></ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </>
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