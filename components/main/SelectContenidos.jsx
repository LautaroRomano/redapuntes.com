import { Select, SelectItem } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getContents } from "@/app/actions/contents";

export default function SelectContenidos({ setMyContent, contents }) {
  const [values, setValues] = useState(new Set([]));
  const [tags, setTags] = useState([]);

  const get = async () => {
    const res = await getContents();

    if (res.error) return toast.error(res.error);
    setTags(res);
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
      {tags.map((tag) => (
        <SelectItem key={tag.key}>{tag.label}</SelectItem>
      ))}
    </Select>
  );
}
