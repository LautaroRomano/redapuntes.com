import { Select, SelectItem } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export default function SelectContenidos({ setMyContent, contents }) {
  const [values, setValues] = useState(new Set([]));
  const [tags, setTags] = useState([]);

  const get = async () => {
    try {
      const { data: res } = await axios.get("/api/contents");

      setTags(res.contents);
    } catch (error) {
      toast.error("Ocurrio un error cargando los contenidos!");
    }
  };

  useEffect(() => {
    get();
  }, []);
  useEffect(() => {
    if (contents) setValues(new Set(contents));
  }, [contents]);

  useEffect(() => {
    const val = Array.from(values);

    setMyContent(val);
  }, [values]);

  return (
    <Select
      label="Contenidos (opcional)"
      placeholder="Contenidos"
      selectedKeys={values}
      selectionMode="multiple"
      size="sm"
      onSelectionChange={setValues}
    >
      {tags&& tags.map((tag) => (
        <SelectItem key={tag.key}>{tag.label}</SelectItem>
      ))}
    </Select>
  );
}
