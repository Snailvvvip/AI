import {ColumnsType} from "antd/es/table";
import {ColInput, ColTextarea} from "../../components/Columns";
import {ColDatePicker} from "../../components/Columns/ColDatePicker";
import {SecretText} from "../../components/SecretText";
import {iAutoOptionConfig} from "../../components/AutoTable/auto-table.utils";
import {AtcolText} from "../../components/AutoTable/columns/AtcolText";
import {AtcolTextarea} from "../../components/AutoTable/columns/AtcolTextarea";
import {AtcolDatetime} from "../../components/AutoTable/columns/AtcolDatetime";

export const ApiSecretColumns: ColumnsType = [
  ColInput("秘钥", 'secret', {
    width: 300,
    render: (text) => <SecretText text={text}/>
  }),
  ColTextarea("描述", "description", { width: undefined }),
  ColDatePicker("创建时间", 'created_at'),
];

export const createApiSecretConfig = (): iAutoOptionConfig => ({
  module: 'api_secret',
  columns: [
    AtcolText({ title: '秘钥', dataIndex: 'secret', render: (text) => <SecretText text={text}/> }),
    AtcolTextarea({ title: '描述', dataIndex: 'description' }),
    AtcolDatetime({ title: '创建时间', dataIndex: 'createdAt', editable: false }),
  ]
});
