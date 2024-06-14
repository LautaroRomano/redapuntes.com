import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Button,
  Image,
  Modal,
  ModalContent,
  ModalFooter,
  Chip,
} from "@nextui-org/react";
import NextLink from "next/link";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { FaRegComment } from "react-icons/fa";
import Link from "next/link";
import { IoMdDownload } from "react-icons/io";
import { tiempoTranscurrido } from '@/app/lib/calcularTiempo'

export default function PostCard({
  id,
  content,
  name,
  username,
  files = [],
  profile,
  handleLike,
  likes,
  isLiked,
  ...props
}) {
  const [expandedImage, setExpandedImage] = useState(null);

  const { theme } = useTheme();

  const handleImageClick = (file) => {
    setExpandedImage(file);
  };

  const handleCloseModal = () => {
    setExpandedImage(null);
  };

  return (
    <>
      <Card
        className={`mb-4  ${theme === "light" && "shadow-none border-1 border-gray-400"}`}
      >
        <CardHeader className="justify-between">
          <div className="flex gap-5">
            <Link href={`/profile/${username}`}>
              <Avatar isBordered radius="full" size="md" src={profile} />
            </Link>
            <div className="flex flex-col gap-1 items-start justify-center">
              <Link href={`/profile/${username}`}>
                {name && (
                  <h4 className="text-small font-semibold leading-none text-default-800">
                    {name}
                  </h4>
                )}
                <h5 className="text-small tracking-tight text-default-600 mt-1">
                  @{username}
                </h5>
              </Link>
            </div>
            <div className="text-small tracking-tight text-default-500">
              <p>Hace {tiempoTranscurrido(props.created_at)}</p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-3 py-0 text-small text-default-800">
          <div>{content}</div>
          {files.length > 0 && (
            <div className="flex mt-4 overflow-auto">
              {files
                .filter((file) => file.file_type.includes("image"))
                .map((file, index) => (
                  <div
                    key={index}
                    className="w-52 h-50 overflow-hidden flex-shrink-0 mr-4 mb-4 hover:bg-gray-800 flex justify-center items-center"
                  >
                    <Image
                      alt="NextUI hero Image"
                      className="object-cover w-full h-full cursor-pointer"
                      src={file.file_path}
                      onClick={() => handleImageClick(file)}
                    />
                  </div>
                ))}
            </div>
          )}
          {files.filter((file) => !file.file_type.includes("image")).length >
            0 && (
              <div className="mt-4">
                <h5 className="text-small font-semibold text-default-600">
                  Archivos adjuntos:
                </h5>
                <ul className="list-disc list-inside">
                  {files
                    .filter((file) => !file.file_type.includes("image"))
                    .map((file, index) => (
                      <li
                        key={index}
                        className="mt-2 flex items-center justify-between"
                      >
                        <span>{file.file_name}</span>
                        <Button
                          as="a"
                          color="primary"
                          download={file.file_name}
                          href={file.file_path}
                          rel="noopener noreferrer"
                          size="sm"
                          target="_blank"
                          variant="flat"
                        >
                          <div className="text-lg">
                            <IoMdDownload />
                          </div>
                        </Button>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          <div className="my-2" />
          <div className="flex gap-1 flex-wrap w-full text-default-800">
            {props.university && (
              <Chip color="primary" size="sm" variant="dot">
                {props.university.name}
              </Chip>
            )}
            {props.career && (
              <Chip color="primary" size="sm" variant="dot">
                {props.career.name}
              </Chip>
            )}
          </div>
          <div className="flex gap-1 mt-2 flex-wrap w-full">
            {props.tags &&
              props.tags.map((t, i) => (
                <Chip key={i} color="default" size="sm" variant="bordered">
                  {t}
                </Chip>
              ))}
          </div>
        </CardBody>

        <CardFooter className="gap-3 justify-between mt-3">
          <div className="flex gap-3">
            <div className="flex gap-1 items-center justify-center">
              <div className=" text-default-400 text-small">
                {
                  <Button
                    aria-label="Like"
                    color="primary"
                    size="sm"
                    variant={isLiked ? "solid" : "ghost"}
                    onClick={() => handleLike(id)}
                  >
                    <div className="text-lg">
                      {isLiked ? <AiOutlineLike /> : <AiFillLike />}
                    </div>
                    {likes}
                  </Button>
                }
              </div>
            </div>
            {(!props.disabled || !props.disabled.linkComments) && (
              <div className="flex gap-1 items-center justify-center">
                <div className=" text-default-400 text-small">
                  {
                    <Button
                      aria-label="Like"
                      as={"a"}
                      color="primary"
                      href={`/post/${id}`}
                      size="sm"
                      variant="ghost"
                    >
                      <div className="text-lg">
                        <FaRegComment />
                      </div>
                      {props.comments}
                    </Button>
                  }
                </div>
              </div>
            )}
          </div>
          {(!props.disabled || !props.disabled.linkComments) && (
            <div className="flex gap-1  items-center justify-center">
              <div className="text-default-800 text-small">
                <NextLink href={`/post/${id}`}>
                  {props.comments} comentarios
                </NextLink>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
      {expandedImage && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <ModalContent>
            <div className="flex justify-center p-8">
              <img
                alt={expandedImage.file_name}
                className="max-w-full max-h-full"
                src={expandedImage.file_path}
              />
            </div>
            <ModalFooter />
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
