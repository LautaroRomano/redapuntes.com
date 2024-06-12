import { Select, SelectItem } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getUniversities, getCarrer } from "@/app/actions/universities";

export default function SelectUniversity({ setMyUniversity, setMyCarrer, universitySelected }) {
  const [university, setUniversity] = useState(new Set([]));
  const [tagsUni, setTagsUni] = useState([]);
  const [tagsCar, setTagsCar] = useState([]);
  const [career, setCarrer] = useState(new Set([]));

  const getUni = async () => {
    const res = await getUniversities();

    if (res.error) return toast.error(res.error);
    setTagsUni(res);
  };
  const getCar = async (id) => {
    const res = await getCarrer(id);

    if (res.error) return toast.error(res.error);
    setTagsCar(res);
  };

  useEffect(() => {
    getUni();
  }, []);

  useEffect(() => {
    if (universitySelected) setUniversity(new Set([universitySelected]))
  }, [universitySelected]);

  useEffect(() => {
    const uni = Array.from(university);

    getCar(uni[0]);

    setMyUniversity(uni[0]);
    setCarrer(new Set([]));
  }, [university]);

  useEffect(() => {
    const car = Array.from(career);

    setMyCarrer(car[0]);
  }, [career]);

  return (
    <div className="flex flex-col w-full gap-1">
      <Select
        label="Universidad (opcional)"
        placeholder="Universidad"
        selectedKeys={university}
        selectionMode="single"
        size="sm"
        onSelectionChange={setUniversity}
      >
        {tagsUni.map((tag) => (
          <SelectItem key={tag.university_id}>{tag.name}</SelectItem>
        ))}
      </Select>
      {tagsCar.length > 0 && (
        <Select
          label="Carrera"
          placeholder="Carrera"
          selectedKeys={career}
          selectionMode="single"
          size="sm"
          onSelectionChange={setCarrer}
        >
          {tagsCar.map((tag) => (
            <SelectItem key={tag.career_id}>{tag.name}</SelectItem>
          ))}
        </Select>
      )}
    </div>
  );
}
