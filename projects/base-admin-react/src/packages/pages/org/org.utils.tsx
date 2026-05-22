import {iBaseRecord} from "../../utils/BaseRecord";
import {ColumnsType} from "antd/es/table";
import {ColInput, ColTextarea} from "../../components/Columns";
import {iAutoOptionConfig} from "../../components/AutoTable/auto-table.utils";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolObject} from "../../components/AutoTable/columns/AtcolObject";
import {AtcolTextarea} from "../../components/AutoTable/columns/AtcolTextarea";

export interface iOrgRecord extends iBaseRecord {
  code: string;
  name: string;
  remarks: string;
  parent_code: string;
}

export interface iOrgCascadeRecord extends iOrgRecord {
  children?: iOrgCascadeRecord[];
}

export const createOrgConfig = (): iAutoOptionConfig => {
  return {
    module: 'org',
    columns: [
      AtcolInput({ title: '组织编码', dataIndex: 'code', required: true }),
      AtcolInput({ title: '组织名称', dataIndex: 'name', required: true }),
      AtcolInput({ title: '父组织编码', dataIndex: 'parentCode', editable: false }),
      AtcolObject({
        title: '父组织',
        dataIndex: 'parentName',
        required: true,
        config: () => createOrgConfig(),
        map: { parentCode: 'code', parentName: 'name' },
        rules: (formData) => formData.parentCode === '0' ? [] : [{ required: true, message: "父组织必填" }],
      }),
      AtcolTextarea({ title: '备注信息', dataIndex: 'remarks' }),
    ]
  };
};


export const OrgColumns: ColumnsType = [
  ColInput('组织编码', 'code', {}),
  ColInput('组织名称', 'name', {}),
  ColInput('父组织编码', 'parent_code',),
  ColInput('父组织', 'parent_name',),
  ColTextarea('备注信息', 'remarks'),
];
