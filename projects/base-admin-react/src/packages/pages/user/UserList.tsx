import {Button} from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import React from "react";
import {showError} from "../../utils/showError";
import {http} from "../../utils/http";
import {createUserConfig} from "./user.utils";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";
import {useAutoFormDrawer} from "../../components/AutoTable/useAutoFormDrawer";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolObject} from "../../components/AutoTable/columns/AtcolObject";
import {createPosConfig} from "../pos/pos.utils";

export const UserList = () => {

  const { editRecordWithDrawer } = useAutoFormDrawer();

  const createUser = async () => {
    try {
      const editColumns = (() => {
        return [
          AtcolInput({ title: '用户名', dataIndex: 'username', required: true }),
          AtcolInput({ title: '用户密码', dataIndex: 'password', required: true }),
          AtcolInput({ title: '用户姓名', dataIndex: 'full_name', required: true }),
          AtcolInput({ title: '邮箱地址', dataIndex: 'email', required: true }),
          AtcolObject({
            title: '用户职位',
            dataIndex: 'pos_name',
            required: true,
            map: { pos_code: 'code', pos_name: 'name' },
            config: createPosConfig,
          }),
        ];
      })();
      await editRecordWithDrawer({
        columns: editColumns, record: {}, async save(newUserData) {
          try {
            const resp = await http.post<{ result: any, active_url: string }>('/registry', newUserData);
            await http.get(resp.data.active_url);
            await option.methods.reload();
          } catch (e) {
            showError(e);
          }
        }
      });
    } catch (e) {
      showError(e);
    }
  };

  const option = useAutoOption(() => ({
    ...createUserConfig(),
    showCreateButton: false,
    buttons: [
      {
        label: '注册用户',
        onClick: () => {},
        render: () => (
          <Button type="primary" onClick={createUser} key={1}>
            <PlusOutlined/>
            <span>注册用户</span>
          </Button>
        )
      }
    ]
  }));

  return (
    <>
      <AutoTable option={option}/>
    </>
  );
};
