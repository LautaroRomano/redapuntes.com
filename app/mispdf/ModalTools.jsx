import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { SiGoogleforms } from "react-icons/si";
import { FaRobot } from "react-icons/fa";
import { CgCardClubs } from "react-icons/cg";

export default function ModalTools({ children, pdf, setSelectTool }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            <div onClick={onOpen}>{children}</div>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Como quieres estudiar el dia de hoy?</ModalHeader>
                            <ModalBody>
                                <Button startContent={<SiGoogleforms />} onPress={() => setSelectTool({ file: pdf, tool: 'CUESTIONARIO' })}>
                                    Cuestionario
                                </Button>
                                <Button startContent={<FaRobot />} onPress={() => setSelectTool({ file: pdf, tool: 'QUESTIONS' })}>
                                    Realizar preguntas
                                </Button>
                                <Button startContent={<CgCardClubs />} onPress={() => setSelectTool({ file: pdf, tool: 'IDEOGRAM' })}>
                                    Ideogram
                                </Button>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
