import {iBaseRecord} from "../../utils/BaseRecord";
import {ColumnsType} from "antd/es/table";
import {createOrgConfig} from "../org/org.utils";
import {ColInput, ColTextarea} from "../../components/Columns";
import {iAutoOptionConfig} from "../../components/AutoTable/auto-table.utils";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolObject} from "../../components/AutoTable/columns/AtcolObject";
import {AtcolTextarea} from "../../components/AutoTable/columns/AtcolTextarea";

export interface iPosRecord extends iBaseRecord {
  code: string;
  name: string;
  remarks: string;
  parent_code: string;
  parent_name: string;
  organization_code: string;
  organization_name: string,
}

export interface iPosCascadeRecord extends iPosRecord {
  children?: iPosCascadeRecord[];
}

export const createPosConfig = (): iAutoOptionConfig => {
  return {
    module: 'pos',
    columns: [
      AtcolInput({ title: "职位编码", dataIndex: "code", required: true }),
      AtcolInput({ title: "职位名称", dataIndex: "name", required: true }),
      AtcolObject({
        title: '父职位',
        dataIndex: 'parentName',
        required: true,
        map: { parentCode: 'code', parentName: 'name' },
        config: createPosConfig,
        rules: (record) => record.parent_code === '0' ? [] : [{ required: true, message: "父职位必填" }],
      }),
      AtcolObject({
        title: '所属组织',
        dataIndex: 'orgName',
        required: true,
        map: { organizationCode: 'code', orgCame: 'name' },
        config: createOrgConfig,
        editable: false,
      }),
      AtcolTextarea({ title: "备注信息", dataIndex: "remarks" }),
    ],
  };
};


export const PosColumns: ColumnsType = [
  ColInput('职位编码', 'code', {}),
  ColInput('职位名称', 'name'),
  ColInput('父职位', 'parent_name'),
  ColInput('所属组织', 'org_name'),
  ColTextarea('备注信息', 'remarks'),
];
