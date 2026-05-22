import {ColumnsType} from "antd/es/table";
import {iProjectRecord} from "../project/project.utils";
import {iBaseRecord} from "../../utils/BaseRecord";
import {ColInput, ColNumber, ColSelect} from "../../components/Columns";
import {ApproveSelectLabel} from "../../components/SelectLabel/ApproveSelectLabel";
import {Link} from "react-router";
import {iAutoOptionConfig} from "../../components/AutoTable/auto-table.utils";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolTextarea} from "../../components/AutoTable/columns/AtcolTextarea";
import {AtcolNumber} from "../../components/AutoTable/columns/AtcolNumber";

export const ApproveStatusList: { label: string, value: string }[] = [
  { label: '待提交', value: 'unsubmit' },
  { label: '审批中', value: 'approving' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
  { label: '已撤销', value: 'cancelled' },
];

export const createApproveConfig = (): iAutoOptionConfig => {
  return {
    module: 'approve',
    columns: [
      AtcolInput({ title: '申请人', dataIndex: 'applyUserName', width: '80px' }),
      AtcolInput({ title: '当前审批人', dataIndex: 'userFullName', width: '80px' }),
      AtcolInput({
        title: '审批标题',
        dataIndex: 'title',
        width: '80px',
        render: (_, record) => {
          return <Link to={`/pages/approve/approve-detail?id=${record.id}`}>{_}</Link>;
        }
      }),
      AtcolTextarea({ title: '审批描述信息', dataIndex: 'description', minWidth: 300, width: undefined }),
      AtcolInput({ title: '审批状态', dataIndex: 'status', render: (val) => <ApproveSelectLabel value={val}/> }),
      AtcolNumber({ title: '审批金额', dataIndex: 'amount' }),
      AtcolInput({ title: 'AI审批结果', dataIndex: 'llmFlag', render: (val) => <span>{val ? '通过' : '拒绝'}</span> }),
      AtcolTextarea({ title: 'AI审批意见', dataIndex: 'llmReason' }),
      AtcolInput({ title: '所属项目', dataIndex: 'projName' }),
    ]
  };
};

export const ApproveColumns: ColumnsType = [
  ColInput('申请人', ['apply_user', 'full_name'], { width: '80px' }),
  ColInput('审批标题', 'title', {
    render: (_, record) => {
      return <Link to={`/pages/approve/approve-detail?id=${record.id}`}>{_}</Link>;
    }
  }),
  ColInput('审批描述信息', 'description', { width: '300px', }),
  ColSelect('审批状态', 'status', ApproveStatusList, {
    render: (val) => <ApproveSelectLabel value={val}/>
  }),
  ColNumber('审批金额', 'amount'),
  ColNumber('AI审批结果', 'llm_flag', { render: (val) => <span>{val ? '通过' : '拒绝'}</span> }),
  ColNumber('AI审批意见', 'llm_reason', { width: undefined, minWidth: 300 }),
  ColInput('所属项目', ['project', 'name']),
];

export interface iApproveProjRecord extends Partial<iBaseRecord> {
  title: string;
  description: string;
  status: string;
  amount: number;
  logs: string;
  user_id: string;
  proj_id: string;
  project?: iProjectRecord;
  llm_flag?: boolean,
  llm_reason?: string,
}

export interface iApproveRecord extends Partial<iBaseRecord> {
  title: string,
  description: string,
  status: string,
  amount: string,
  logs: string,
  approveFrom: string,
  userId: string,
  applyUserId: string,

  llmFlag: string,
  llmReason: string,
  projId: string,
  projName: string,
  userName: string,
  applyUserName: string,
}

export interface iApproveLog {
  content: string,
  datetime: string,
}
