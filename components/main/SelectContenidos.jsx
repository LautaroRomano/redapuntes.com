import { Select, SelectItem } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getContents } from '@/app/actions/contents'


export default function SelectContenidos({ setMyContent }) {
    const [values, setValues] = useState(new Set([]));
    const [tags, setTags] = useState([]);

    const get = async () => {
        const res = await getContents()
        if (res.error) return toast.error(res.error);
        setTags(res)
    }

    useEffect(() => {
        get()
    }, [])

    useEffect(() => {
        const val = Array.from(values)
        setMyContent(val)
    }, [values])

    return (
        <Select
            size="sm"
            label="Contenidos (opcional)"
            selectionMode="multiple"
            placeholder="Contenidos"
            selectedKeys={values}
            onSelectionChange={setValues}
        >
            {tags.map((tag) => (
                <SelectItem key={tag.key}>
                    {tag.label}
                </SelectItem>
            ))}
        </Select>
    );
}
