import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button, Modal, Textarea, Input, Spacer, ModalBody, ModalHeader, ModalFooter, useDisclosure, ModalContent } from "@nextui-org/react";
import { LuFiles } from "react-icons/lu";
import { create } from "@/app/actions/posts";
import { FaCheckCircle } from "react-icons/fa";

export default function CreatePost() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            <Card className="mb-4">
                <CardHeader className="justify-between">

                </CardHeader>

                <CardBody className="px-3 py-0 text-small text-default-400">
                    <div onClick={onOpen}>
                        <p>Iniciar una publicacion</p>
                    </div>
                </CardBody>

                <CardFooter className="gap-3">

                </CardFooter>
            </Card>
            <NewPost isOpen={isOpen} onOpenChange={onOpenChange}></NewPost>
        </>
    );
}

const NewPost = ({ isOpen, onOpenChange }) => {
    const [content, setContent] = useState("");
    const [files, setFiles] = useState([]);
    const [success, setSucces] = useState(false)
    const [error, setError] = useState(false)


    const handleFileChange = (event) => {
        setFiles([...event.target.files]);
    };

    const handleSubmit = () => {
        // Aquí puedes manejar el envío del formulario
        console.log("Content:", content);
        console.log("Files:", files);
        try {
            //create(3, content)
            setSucces(true)

            setTimeout(() => {
                setContent("");
                setFiles([]);
                setSucces(false);
                onOpenChange();
            }, 1000);

        } catch (error) {
            setError(true)
        }

    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader>
                            <h4>Nueva Publicación</h4>
                        </ModalHeader>
                        <ModalBody>
                            <Card>
                                <CardBody className="flex items-center space-x-4">
                                    <Textarea
                                        fullWidth
                                        placeholder="¿Qué estás pensando?"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                </CardBody>
                            </Card>
                            <Spacer y={1} />
                            <div>
                                <Button auto flat color="error" onPress={onOpenChange} startContent={<LuFiles />} >
                                    Agregar
                                </Button>
                            </div>
                        </ModalBody>

                        <ModalFooter>
                            <Button auto flat color="error" onPress={onOpenChange}>
                                Cancelar
                            </Button>
                            {success ?
                                <Button color="success" startContent={<FaCheckCircle />}>
                                    Publicado
                                </Button>
                                :
                                <Button auto onPress={handleSubmit}>
                                    Publicar
                                </Button>
                            }
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};
