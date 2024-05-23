'use client'
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { link as linkStyles } from "@nextui-org/theme";
import NextLink from "next/link";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  SearchIcon,
  Logo,
} from "@/components/icons";
import { FaCheckCircle, FaUser } from "react-icons/fa";
import { signIn, signOut, useSession } from 'next-auth/react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useState } from "react";

export const Navbar = () => {

  const { data: session, status } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      labelPlacement="outside"
      placeholder="Buscar..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <>
      <NextUINavbar maxWidth="xl" position="sticky">
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          <NavbarBrand as="li" className="gap-3 max-w-fit">
            <NextLink className="flex justify-start items-center gap-1" href="/">
              <Logo />
              <p className="font-bold text-inherit">Repositorio Universitario</p>
            </NextLink>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent
          className="hidden sm:flex basis-1/5 sm:basis-full"
          justify="end"
        >
          <NavbarItem className="hidden sm:flex gap-2">
            <ThemeSwitch />
          </NavbarItem>
          <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
          <NavbarItem className="hidden md:flex">

            {status === 'authenticated' ?
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    className="text-sm font-normal text-default-600 bg-default-100"
                    startContent={<FaUser />}
                    variant="flat"
                  >
                    Cuenta
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Dynamic Actions">

                  <DropdownItem
                    color={"default"}
                    className={""}
                  >
                    <Link
                      isExternal
                      className="w-full h-full text-sm font-normal text-default-600 "
                      href={'/profile'}
                    >
                      Ver perfil
                    </Link>
                  </DropdownItem>
                  <DropdownItem
                    color={"danger"}
                    className={"text-danger"}
                    onClick={signOut}
                  >
                    Cerrar sesion
                  </DropdownItem>
                </DropdownMenu>

              </Dropdown>
              :
              <Button
                className="text-sm font-normal text-default-600 bg-default-100"
                variant="flat"
                onClick={onOpenChange}
              >
                Iniciar sesion
              </Button>
            }

          </NavbarItem>
        </NavbarContent>

        <NavbarMenu>
          {searchInput}
          <div className="mx-4 mt-2 flex flex-col gap-2">
            {siteConfig.navMenuItems.map((item, index) => (
              <NavbarMenuItem key={`${item}-${index}`}>
                <Link
                  color={
                    index === 2
                      ? "primary"
                      : index === siteConfig.navMenuItems.length - 1
                        ? "danger"
                        : "foreground"
                  }
                  href="#"
                  size="lg"
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            ))}
          </div>
        </NavbarMenu>
      </NextUINavbar>
      <Login isOpen={isOpen} onOpenChange={onOpenChange}></Login>
    </>
  );
};


const Login = ({ isOpen, onOpenChange }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSucces] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = () => {
    try {
      signIn('credentials', { username, password })
      setSucces(true)

      setTimeout(() => {
        setUsername("");
        setPassword([]);
        setSucces(false);
        onOpenChange();
      }, 1000);

    } catch (error) {
      setError(true)
    }

  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h4>Iniciar sesion</h4>
            </ModalHeader>
            <ModalBody>
              <Input
                placeholder="Usuario o email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                placeholder="Contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <NextLink className="text-blue-400" href={'#'}>Olvidaste tu contrasena?</NextLink>
              <NextLink className="flex justify-start items-center gap-1" href="/register">No tienes cuenta? <p className="text-blue-400">Registrate aqui!</p></NextLink>
            </ModalBody>

            <ModalFooter>
              <Button auto flat color="error" onPress={onOpenChange}>
                Cancelar
              </Button>
              {success ?
                <Button color="success" startContent={<FaCheckCircle />}>
                  Listo
                </Button>
                :
                <Button auto onPress={handleSubmit}>
                  Ingresar
                </Button>
              }
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
