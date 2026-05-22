import {ColumnsType} from "antd/es/table";
import {ColInput, ColTextarea} from "../../components/Columns";
import {iBaseRecord} from "../../utils/BaseRecord";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";
import {DocSelectLabel} from "./DocSelectLabel";
import {iAutoOptionConfig} from "../../components/AutoTable/auto-table.utils";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolSelect} from "../../components/AutoTable/columns/AtcolSelect";
import {AtcolTextarea} from "../../components/AutoTable/columns/AtcolTextarea";
import {AtcolDatetime} from "../../components/AutoTable/columns/AtcolDatetime";
import {AtcolText} from "../../components/AutoTable/columns/AtcolText";
import {router} from "../../home/routes";
import {Button} from "antd";

/*知识库记录类型*/
export interface iKnowledgeBaseRecord extends iBaseRecord {
  code: string;
  name: string;
}

/*知识文档记录类型*/
export interface iKnowledgeDocRecord extends iBaseRecord {
  name: string;
  path: string;
  code: string;
  parent_code: string,
  status: string,
  error?: string,
  content?: string | null,
}

/*知识问答记录类型*/
export interface iKnowledgeQaBotRecord extends iBaseRecord {
  name: string,
  disable: string,
  prompt?: string,
}

/*知识文旦机器人与知识库的多对多关系记录类型*/
export interface iKnowledgeRelQaBase extends iBaseRecord {
  qaId: string,
  kbCode: string,
  qaName: string,
  kbName: string,
}

export const createKnowledgeBaseConfig = (): iAutoOptionConfig => ({
  module: 'knowledge_base',
  columns: [
    AtcolInput({ title: '知识库编码', dataIndex: 'code' }),
    AtcolInput({ title: '知识库名称', dataIndex: 'name' }),
  ]
});

export const KnowledgeBaseColumns: ColumnsType = [
  ColInput('知识库编码', 'code'),
  ColInput('知识库名称', 'name', { width: undefined }),
];

export const createKnowledgeDocConfig = (): iAutoOptionConfig => ({
  module: 'knowledge_doc',
  columns: [
    AtcolInput({ title: '文档名称', dataIndex: 'name' }),
    AtcolInput({
      title: '文档路径', dataIndex: 'path', editable: false, render: (text) => {
        return (
          <a href={pathJoin(env.assetsPrefix, text)} target="_blank" rel="noreferrer">下载</a>
        );
      }
    }),
    AtcolSelect({ title: '处理状态', dataIndex: 'status', render: val => <DocSelectLabel value={val}/> }),
    AtcolTextarea({ title: '失败原因', dataIndex: 'error' }),
  ]
});

export const KnowledgeDocColumns: ColumnsType = [
  ColInput('文档名称', 'name'),
  ColInput('文档路径', 'path', {
    render: (text) => {
      return (
        <a href={pathJoin(env.assetsPrefix, text)} target="_blank" rel="noreferrer">下载</a>
      );
    }
  }),
  ColInput('处理状态', 'status', { render: val => <DocSelectLabel value={val}/> }),
  ColTextarea('失败原因', 'error', { width: undefined }),
];

export const createKnowledgeOnlineDocConfig = (): iAutoOptionConfig => ({
  module: 'knowledge_doc',
  columns: [
    AtcolInput({ title: '文档编码', dataIndex: 'code' }),
    AtcolInput({ title: '文档名称', dataIndex: 'name' }),
    AtcolDatetime({ title: '创建时间', dataIndex: 'createdAt' }),
    AtcolText({ title: '创建人', dataIndex: 'createdByName' }),
    AtcolInput({
      title: '文档内容',
      dataIndex: 'createdByName',
      inlineEditor: () => "请先保存文档再编辑文档内容",
      inlineRender: ({ record }) => <Button type="link" onClick={() => router.navigate(`/pages/knowledge/document-edit?id=${record.id}`)}>编辑</Button>,
    }),
  ]
});

export const KnowledgeOnlineDocumentColumns: ColumnsType = [
  ColInput('文档编码', 'code', { width: '100px' }),
  ColInput('文档名称', 'name', { width: undefined }),
  ColInput('创建时间', 'created_at'),
  ColInput('创建人', ['creator', 'full_name']),
];

export const KnowledgeDocStatus: { label: string, value: string }[] = [
  { label: '处理中', value: 'process' },
  { label: '失败', value: 'fail' },
  { label: '成功', value: 'success' },
];
