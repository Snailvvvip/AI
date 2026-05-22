import {ColumnsType} from "antd/es/table";
import {createPosConfig, iPosRecord} from "../pos/pos.utils";
import React from "react";
import {iBaseRecord} from "../../utils/BaseRecord";
import {ColInput} from "../../components/Columns";
import {Button} from "antd";
import {iAutoOptionConfig} from "../../components/AutoTable/auto-table.utils";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolObject} from "../../components/AutoTable/columns/AtcolObject";

export const createUserConfig = (): iAutoOptionConfig => ({
  module: 'user',
  columns: [
    AtcolInput({ title: '用户名', dataIndex: 'username', required: true }),
    AtcolInput({ title: '用户姓名', dataIndex: 'fullName', required: true }),
    AtcolInput({ title: '邮箱地址', dataIndex: 'email', required: true }),
    AtcolObject({
      title: '用户职位',
      dataIndex: 'posName',
      required: true,
      map: { posCode: 'code', posName: 'name' },
      config: createPosConfig,
    }),
    AtcolInput({ title: '用户组织', dataIndex: 'orgName', editable: false }),
    AtcolInput({
      title: '激活状态',
      dataIndex: 'valid',
      editable: false,
      render: (val) => (
        <Button style={{ padding: '0' }} type={val === 'Y' ? "link" : "text"}>{val === 'Y' ? '已激活' : '未激活'}</Button>
      ),
    })
  ]
});

export const UserColumns: ColumnsType = [
  ColInput('用户名', 'username'),
  ColInput('用户姓名', 'full_name'),
  ColInput('邮箱地址', 'email'),
  ColInput('用户职位', 'pos_name'),
  ColInput('用户组织', 'org_name'),
  ColInput('激活状态', 'valid', {
    align: "center",
    render: (val) => (
      <Button style={{ padding: '0' }} type={val === 'Y' ? "link" : "text"}>{val === 'Y' ? '已激活' : '未激活'}</Button>
    ),
  }),
];

export interface iUserRecord extends iBaseRecord {
  username: string;
  email: string;
  full_name: string;
  valid: string;

  pos_code: string,
  pos_name: string,
  org_name: string,
  pos?: iPosRecord,
}

export interface iUserCascadeRecord extends iUserRecord {
  children?: iUserCascadeRecord[];
}

export const UserInfoContext = React.createContext<iUserRecord | null>(null);
export const TokenContext = React.createContext<string | null>(null);
