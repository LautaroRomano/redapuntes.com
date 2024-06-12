import { IoFilter } from "react-icons/io5";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import SelectContenidos from "./main/SelectContenidos";
import SelectUniversity from "./main/SelectUniversity";
import { useState } from "react";

export default function Filters({ setFilters, filters }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [contents, setContents] = useState(null)
    const [university, setUniversity] = useState(null)
    const [career, setCareer] = useState(null)

    const handleOk = () => {
        setFilters({ contents, university, career })
    }

    return (
        <>
            <Button isIconOnly onPress={onOpen}>
                <IoFilter />
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" isDismissable={false}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Filtros de busqueda</ModalHeader>
                            <ModalBody>
                                <SelectContenidos
                                    setMyContent={setContents}
                                    contents={filters.contents}
                                />
                                <SelectUniversity
                                    setMyUniversity={setUniversity}
                                    setMyCarrer={setCareer}
                                    universitySelected={filters.university}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onPress={() => { onClose(); handleOk(); }} size="sm">
                                    Buscar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal >
        </>
    );
}