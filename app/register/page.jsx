"use client";
import { Button, Card, CardBody, Input } from "@nextui-org/react";
import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { create } from "../actions/users";

import { title } from "@/components/primitives";

export default function LoginPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    accountname: "",
    username: "",
  });

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "email" || name === "username") {
      newValue = value.replace(/\s+/g, "").toLowerCase();
    }

    setData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
  };

  const handleSubmit = async () => {
    try {
      const res = await create(data);

      if (res.error) return toast.error(res.error);
      if (res.ok) {
        setSuccess(true);
        setError(false);
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      }
      if (res.error) setError(res.error);
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  return (
    <div className="w-full">
      <h1 className={title()}>Registrarse</h1>
      <Card className="mb-4 w-full my-5">
        {/*  <CardHeader className="justify-center">
          <div className="flex gap-5 w-full">
            <div className="flex flex-col gap-1 items-center justify-center w-full my-2">
              <h5 className="text-small tracking-tight text-default-400">Crear tu cuenta con Google</h5>
              <Button
                className={""}
                color="primary"
                radius="none"
                size="md"
                variant={"solid"}
                onPress={() => signIn('google')}
                startContent={<FaGoogle />}
              >
                Google
              </Button>
              <div className="flex w-full items-center gap-2">
                <div className="bg-gray-600 h-[1px] w-full"></div>
                <h5>O</h5>
                <div className="bg-gray-600 h-[1px] w-full"></div>
              </div>
            </div>
          </div>
        </CardHeader> */}

        <CardBody className="px-3 py-2 text-small text-default-400 items-center gap-2">
          <p>Completa este formulario de registro</p>

          <Input
            isRequired
            className="max-w-xs"
            label="Email"
            name="email"
            type="email"
            value={data.email}
            variant="faded"
            onChange={handleChange}
          />
          <Input
            isRequired
            className="max-w-xs"
            label="Contraseña"
            name="password"
            type="password"
            value={data.password}
            variant="faded"
            onChange={handleChange}
          />
          <Input
            isRequired
            className="max-w-xs"
            label="Repite tu contraseña"
            name="confirmPassword"
            type="password"
            value={data.confirmPassword}
            variant="faded"
            onChange={handleChange}
          />
          <Input
            isRequired
            className="max-w-xs"
            label="Nombre de cuenta"
            name="accountname"
            type="text"
            value={data.accountname}
            variant="faded"
            onChange={handleChange}
          />
          <Input
            isRequired
            className="max-w-xs"
            label="Nombre de usuario"
            name="username"
            startContent={"@"}
            type="text"
            value={data.username}
            variant="faded"
            onChange={handleChange}
          />
          {error && <h5 className="text-red-600">Ocurrio un error: {error}</h5>}

          {success ? (
            <Button
              className="w-full max-w-xs mb-5 mt-2"
              color="success"
              startContent={<FaCheckCircle />}
              onClick={() => router.push("/login")}
            >
              Listo
            </Button>
          ) : (
            <Button
              className="w-full max-w-xs mb-5 mt-2"
              color="primary"
              size="md"
              onPress={handleSubmit}
            >
              Registrarse
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
