import { ReactFlow, Controls, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { generateMindMap, saveMindMap } from "../actions/pdf";
import { useEffect, useState } from "react";
import Star from "@/components/loaders/Star";
import { Button } from "@nextui-org/button";
import { toast } from "react-toastify";
import { Spinner } from "@nextui-org/react";

function Flow({ file, fin }) {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(0);
  const [edges, setEdges] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [saving, setSaving] = useState(false);

  const getMap = async (text) => {
    if (loading) return;
    setLoading(true);
    //const res = await generateMindMap(text);
    const res = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          nodes: [
            {
              id: "1",
              data: { label: "Transformada de Laplace" },
              position: { x: 0, y: 0 },
              type: "input",
            },
            {
              id: "2",
              data: { label: "DefiniciÃ³n" },
              position: { x: -150, y: 100 },
              type: "default",
            },
            {
              id: "3",
              data: { label: "Inversa de la Transformada de Laplace" },
              position: { x: 150, y: 100 },
              type: "default",
            },
            {
              id: "4",
              data: { label: "Propiedades" },
              position: { x: 0, y: 200 },
              type: "default",
            },
            {
              id: "5",
              data: { label: "Linealidad" },
              position: { x: -250, y: 300 },
              type: "default",
            },
            {
              id: "6",
              data: { label: "Ejemplo" },
              position: { x: 250, y: 300 },
              type: "default",
            },
            {
              id: "7",
              data: { label: "TraslaciÃ³n Compleja" },
              position: { x: -250, y: 400 },
              type: "default",
            },
            {
              id: "8",
              data: { label: "Transformada de Laplace de las Derivadas" },
              position: { x: 250, y: 400 },
              type: "default",
            },
            {
              id: "9",
              data: { label: "GeneralizaciÃ³n" },
              position: { x: 0, y: 500 },
              type: "default",
            },
          ],
          edges: [
            {
              id: "1-2",
              source: "1",
              target: "2",
              label: "Relacionado con",
              type: "smoothstep",
            },
            {
              id: "1-3",
              source: "1",
              target: "3",
              label: "Relacionado con",
              type: "smoothstep",
            },
            {
              id: "1-4",
              source: "1",
              target: "4",
              label: "Relacionado con",
              type: "smoothstep",
            },
            {
              id: "4-5",
              source: "4",
              target: "5",
              label: "Relacionado con",
              type: "smoothstep",
            },
            {
              id: "4-6",
              source: "4",
              target: "6",
              label: "Relacionado con",
              type: "smoothstep",
            },
            {
              id: "4-7",
              source: "4",
              target: "7",
              label: "Relacionado con",
              type: "smoothstep",
            },
            {
              id: "4-8",
              source: "4",
              target: "8",
              label: "Relacionado con",
              type: "smoothstep",
            },
            {
              id: "8-9",
              source: "8",
              target: "9",
              label: "Relacionado con",
              type: "smoothstep",
            },
          ],
        });
      }, 1000);
    });
    if (res.error) {
      toast.error(res.error);
      setLoading(false);
      finishim()
      return;
    }
    setEdges(res.edges);
    setNodes(res.nodes);
    setGenerated((prev) => prev + 1);
    setLoading(false);
  };

  const finishim = () => {
    setNodes([]);
    setEdges([]);
    fin();
  };

  useEffect(() => {
    if (file && file.text) getMap(file.text);
  }, [file]);

  const save = async () => {
    setSaving(true)
    const res = await saveMindMap({ file_id: file.file_id,  edges, nodes })
    if (res.error) {
      toast.error(res.error)
      setSaving(false)
      return
    }
    setSaving(false)
    toast.success('Guardado con exito!')
  }

  return (
    <div className="w-screen" style={{ height: "calc(100vh - 140px)" }}>
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
          <ReactFlow nodes={nodes} edges={edges}>
            <Background />
            <Controls />
          </ReactFlow>
          <div className="flex gap-2 text-sm items-center">
            <h1 className="text-default-900" >Te sirve?</h1>
            <Button
              disabled={saving}
              size="sm" 
              color="primary"
              onClick={save}
            >
              {saving ? <Spinner /> : 'Guardar Mapa'}
            </Button>
            {generated <= 3 && (
              <>
                <h1 className="text-default-900">Si no</h1>
                <Button
                  size="sm"
                  color="primary"
                  variant="bordered"
                  onPress={() => getMap(file.text)}
                >
                  Generar otro
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Flow;
