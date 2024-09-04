import { ReactFlow, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { generateMindMap } from '../actions/pdf';
import { useEffect, useState } from 'react';

function Flow({ file, fin }) {

  const [loading, setLoading] = useState(false)
  const [edges, setEdges] = useState([])
  const [nodes, setNodes] = useState([])

  const getMap = async (text) => {
    if (loading) return;
    setLoading(true)
    const res = await generateMindMap(text);
    console.log("🚀 ~ getMap ~ res:", res)
    setEdges(res.edges);
    setNodes(res.nodes);
    //setLoading(false)
  };

  const finishim = () => {
    setNodes([]);
    setEdges([]);
    fin();
  };

  useEffect(() => {
    if (file && file.text)
      getMap(file.text);
  }, [file]);

  return (
    <div className='h-screen w-screen'>
      <ReactFlow nodes={nodes} edges={edges}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default Flow;
