import React from "react";
import {iAutoOption} from "../../components/AutoTable/auto-table.utils";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";
import {createApproveConfig} from "../approve/approve.utils";

export const ProjectSpentList = (props: { projectOption: iAutoOption }) => {

  const option = useAutoOption(() => {
    return {
      ...createApproveConfig(),
      pageSize: 5,
      parentOption: props.projectOption,
      parentKeyMap: { projId: 'id' },
      showCreateButton: false,
      showOperateColumn: false,
      showEditButton: false,
      showDeleteButton: false,
    };
  });

  return (
    <AutoTable option={option}/>
  );
};
