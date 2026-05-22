import {createPosConfig} from "./pos.utils";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";

export const PosList = () => {

  const option = useAutoOption(createPosConfig);

  return (
    <AutoTable option={option}/>
  );
};

