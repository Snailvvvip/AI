import {ColumnsType} from "antd/es/table";
import {createUserConfig, iUserRecord} from "../user/user.utils";
import {iBaseRecord} from "../../utils/BaseRecord";
import {ColInput, ColNumber, ColTextarea} from "../../components/Columns";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolNumber} from "../../components/AutoTable/columns/AtcolNumber";
import {AtcolObject} from "../../components/AutoTable/columns/AtcolObject";
import {AtcolTextarea} from "../../components/AutoTable/columns/AtcolTextarea";
import {iAutoOptionConfig} from "../../components/AutoTable/auto-table.utils";

export const createProjectConfig = (): iAutoOptionConfig => {
  return {
    module: 'project',
    columns: [
      AtcolInput({ title: '项目名称', dataIndex: 'name', required: true }),
      AtcolNumber({ title: '项目预算金额', dataIndex: 'budget', required: true, width: 140 }),
      AtcolNumber({ title: '项目已花费金额', dataIndex: 'spent', editable: false, width: 140 }),
      AtcolNumber({ title: '项目预算余额', dataIndex: 'balance', editable: false, width: 140 }),
      AtcolObject({
        title: '项目负责人',
        dataIndex: 'leaderName',
        required: true,
        config: createUserConfig,
        map: { leaderId: 'id', leaderName: 'fullName' }
      }),
      AtcolTextarea({ title: '项目描述', dataIndex: 'description', required: true }),
    ]
  };
};

export const ProjectColumns: ColumnsType = [

  ColInput('项目名称', 'name', {}),
  ColNumber('项目预算金额', 'budget', {}),
  ColInput('项目已花费金额', 'spent', {}),
  ColInput('项目预算余额', 'balance', {}),
  ColInput('项目负责人', 'leader_name'),
  ColTextarea('项目描述', 'description'),
];

export interface iProjectRecord extends iBaseRecord {
  name: string;
  description: string;
  budget: number;
  spent: number;
  version: string;
  leader_id: string;
  leader_name: string;
}

export interface iRelProjectUserRecord extends iBaseRecord {
  user_id: string,
  proj_id: string,
  user: iUserRecord,
  project: iProjectRecord,
}
