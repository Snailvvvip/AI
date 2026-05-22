import {createApproveConfig, iApproveProjRecord} from "./approve.utils";
import {useContext} from "react";
import {UserInfoContext} from "../user/user.utils";
import {useApproveStepViewer} from "./useApproveStepViewer";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";

export const ApplyList = () => {

  const userInfo = useContext(UserInfoContext)!;

  const { buttonRender, content } = useApproveStepViewer();

  const option = useAutoOption(() => ({
    ...createApproveConfig(),
    showCreateButton: false,
    showEditButton: false,
    showDeleteButton: false,
    operations: (record) => buttonRender(record as iApproveProjRecord),
    queryParam: {
      queries: [{ field: 'applyUserId', value: userInfo.id, operator: '=' }]
    }
  }));

  return (
    <>
      <AutoTable option={option}/>
      {content}
    </>
  );
};
