import { ReactFlow, Controls, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";
import { toast } from "react-toastify";
import { Spinner } from "@nextui-org/react";
import { IoMdArrowRoundBack } from "react-icons/io";

import { saveMindMap } from "../actions/pdf";

import Star from "@/components/loaders/Star";

function Flow({ file, fin, saved }) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(0);
  const [edges, setEdges] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [saving, setSaving] = useState(false);

  const getMap = async (text) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/openai/mindmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      if (!res.ok) {
        if (res.status === 403) {
          toast.error("Iniciar sesión para continuar.");
          finishim();

          return;
        }
        if (res.status === 499) {
          toast.error("Debes conseguir estrellas para continuar!");
          finishim();

          return;
        }

        toast.error("Ocurrió un error, inténtalo nuevamente más tarde.");
        finishim();

        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";
      let resultado = "";

      while (!done) {
        const { value, done: streamDone } = await reader.read();

        done = streamDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });

          buffer += chunk; // Acumulamos en el buffer

          // Dividimos por el separador
          const parts = buffer.split("\n\n");

          parts.slice(0, -1).forEach((part) => {
            try {
              const jsonChunk = JSON.parse(part); // Parseamos cada parte como JSON
              const content = jsonChunk.choices[0]?.delta?.content || "";

              resultado += content;
            } catch (error) {
              toast.error("Ocurrio un error!");
            }
          });

          // Guardamos la última parte en el buffer (puede estar incompleta)
          buffer = parts[parts.length - 1];
        }
      }
      resultado = resultado.replace(/^```json/, "").replace(/```$/, "");
      setEdges(JSON.parse(resultado).edges);
      setNodes(JSON.parse(resultado).nodes);
      setGenerated((prev) => prev + 1);
    } catch (error) {
      toast.error("Ocurrio un error inesperado!");
      setLoading(false);
      finishim();

      return;
    }

    setLoading(false);
  };

  useEffect(() => {
    if (saved) {
      setEdges(saved.edges);
      setNodes(saved.nodes);
    }
  }, [saved]);

  const finishim = () => {
    setNodes([]);
    setEdges([]);
    fin();
  };

  useEffect(() => {
    if (file && file.text) getMap(file.text);
  }, [file]);

  const save = async () => {
    setSaving(true);
    const res = await saveMindMap({ file_id: file.file_id, edges, nodes });

    if (res.error) {
      toast.error(res.error);
      setSaving(false);

      return;
    }
    setSaving(false);
    toast.success("Guardado con exito!");
  };

  return (
    <div className="w-screen" style={{ height: "calc(100vh - 140px)" }}>
      <div className="flex w-full mb-2 text-secondary">
        <Button
          size="sm"
          startContent={<IoMdArrowRoundBack size={18} />}
          onPress={fin}
        >
          Volver
        </Button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-96 ">
          <div>
            <Star />
            <p className="px-5 mt-8">
              Estamos generando tu mapa mental
              <br />
              gracias por esperar!
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full gap-1 px-2 text-black">
          <ReactFlow edges={edges} nodes={nodes}>
            <Background />
            <Controls />
          </ReactFlow>
          {!saved && (
            <div className="flex gap-2 text-sm items-center">
              <h1 className="text-default-900">Te sirve?</h1>
              <Button
                color="primary"
                disabled={saving}
                size="sm"
                onClick={save}
              >
                {saving ? <Spinner /> : "Guardar Mapa"}
              </Button>
              {generated <= 3 && (
                <>
                  <h1 className="text-default-900">Si no</h1>
                  <Button
                    color="primary"
                    size="sm"
                    variant="bordered"
                    onPress={() => getMap(file.text)}
                  >
                    Generar otro
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Flow;
