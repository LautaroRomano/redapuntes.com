'use client'
import { Button, Card, CardBody, Input, Checkbox, Link } from "@nextui-org/react";
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
  const [termsAccepted, setTermsAccepted] = useState(false); // Estado para el checkbox

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

          <Checkbox
            className="max-w-xs text-sm"
            isSelected={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
          >
            Acepto los
            <Link
              color={'primary'}
              target="_blank"
              href="/privacy"
              className="mx-1"
            >
              términos y condiciones
            </Link>
            <br />y las
            <Link
              color={'primary'}
              target="_blank"
              href="/privacy"
              className="mx-1"
            >
              políticas de privacidad
            </Link>
          </Checkbox>

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
              isDisabled={!termsAccepted} // Deshabilitar el botón si no se aceptan los términos
            >
              Registrarse
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
