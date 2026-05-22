import {createUserConfig} from "../user/user.utils";
import {Button} from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import React from "react";
import {http} from "../../utils/http";
import {showError} from "../../utils/showError";
import {iAutoOption} from "../../components/AutoTable/auto-table.utils";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {usePickAutoObject} from "../../components/AutoTable/components/usePickAutoObject";
import {getNewestValue} from "../../uses/getNewestValue";
import {PlainObject} from "@peryl/utils/event";

export const ProjectMemberList = (props: { projectOption: iAutoOption }) => {

  const { pickMultipleObject } = usePickAutoObject();

  const addMember = async () => {

    const parentProjectSelectRow = await getNewestValue(props.projectOption.select.setStateSelectedRow);
    if (!parentProjectSelectRow) {return;}
    try {
      const selectUserList = await pickMultipleObject({
        title: '添加项目成员',
        config: () => ({
          ...createUserConfig(),
          queryParam: async () => {
            // http.post('general/rel_proj_user/list', { all: true, filters: [{ id: '01', field: 'userId', operator: 'not in', value: '' }] });
            const resp = await http.post<{ list: PlainObject[] }>('general/rel_proj_user/list', { all: true, filters: [{ id: '01', field: 'projId', operator: '=', value: parentProjectSelectRow.id }] });
            return {
              queries: [{ field: 'id', operator: 'not in', value: resp.data.list.map(i => i.userId) }]
            };
          }
        })
      });
      await http.post('general/rel_proj_user/batch_insert', { rows: selectUserList.map(item => ({ userId: item.id, projId: parentProjectSelectRow.id })) });
      await option.methods.reload();
    } catch (e) {
      if (e === 'cancel') {return; }
      showError(e);
    }
  };

  const option = useAutoOption(() => ({
    module: 'rel_proj_user',
    columns: [
      AtcolInput({ title: '成员名称', dataIndex: 'userFullName' }),
      AtcolInput({ title: '成员职位', dataIndex: 'userPosName' }),
    ],
    pageSize: 5,
    showCreateButton: false,
    showEditButton: false,
    parentOption: props.projectOption,
    parentKeyMap: { projId: 'id' },
    buttons: [
      {
        label: '添加项目成员',
        onClick: () => {},
        render: () => (
          <Button type="primary" onClick={addMember} key={1}>
            <PlusOutlined/>
            <span>添加项目成员</span>
          </Button>
        )
      }
    ]
  }));

  // const { state: { /*setStateLoading*/ } } = option;

  return (
    <>
      <AutoTable option={option}/>
    </>
  );
};
