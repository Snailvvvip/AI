import {createOrgConfig} from "./org.utils";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";

export const OrgList = () => {
  const option = useAutoOption(createOrgConfig);
  return (
    <AutoTable
      option={option}
    />
  );
};

