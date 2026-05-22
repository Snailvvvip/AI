/*报销单其他费用类型，房租水电燃气酒店宾馆话费快递运输*/
import {iBaseRecord} from "../../utils/BaseRecord";
import {ColumnsType} from "antd/es/table";
import {Typography} from "antd";
import {router} from "../../home/routes";
import {otherTypes, recipe_type, travelTypes} from "./generateReimburseData";
import {ApproveSelectLabel} from "../../components/SelectLabel/ApproveSelectLabel";
import {ColInput, ColNumber, ColSelect} from "../../components/Columns";
import {ColDatePicker} from "../../components/Columns/ColDatePicker";
import {InvoiceEditor} from "../../components/InvoiceEditor/InvoiceEditor";
import {InvoiceDisplayer} from "../../components/InvoiceEditor/InvoiceDisplayer";
import {iAutoOptionConfig} from "../../components/AutoTable/auto-table.utils";
import {AtcolText} from "../../components/AutoTable/columns/AtcolText";
import {AtcolSelect} from "../../components/AutoTable/columns/AtcolSelect";
import {AtcolDatetime} from "../../components/AutoTable/columns/AtcolDatetime";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolNumber} from "../../components/AutoTable/columns/AtcolNumber";
import {iUserRecord} from "../user/user.utils";
import {iApproveProjRecord} from "../approve/approve.utils";

export interface iReimburseOtherRecord extends iBaseRecord {
  title: string;
  type: string;
  amount: number;
  recipe_type: string;
  reimburse_id: string;
}

/*报销单差旅费用数据类型，差旅主要有火车动车飞机出租车*/
export interface iReimburseTravelRecord extends iBaseRecord {
  title: string;
  type: string;
  depart_time: string;
  arrive_time: string;
  depart_city: string;
  arrive_city: string;
  amount: number;
  reimburse_id: string;
}

/*报销单数据类型*/
export interface iReimburseRecord extends iBaseRecord {
  title: string;
  remarks: string;
  amount: number;
  proj_id: string;
  travel_list: iReimburseTravelRecord[],
  other_list: iReimburseOtherRecord[],
  user?: iUserRecord,
  approve_id?: string,
  approve?: iApproveProjRecord,
}

/*报销单数据类型*/
export interface iReimburseGeneralRecord extends iBaseRecord {
  title: string;
  remarks: string;
  amount: number;
  projId?: string;
  projName?: string,
  approveId?: string,
  approveStatus?: string,
  userId: string,
  userFullName: string,
}

export const createReimburseConfig = (): iAutoOptionConfig => ({
  module: 'reimburse',
  columns: [
    AtcolText({
      title: '报销单编号', dataIndex: 'id', render: (_, record) => {
        return (
          <Typography.Link
            style={{ overflow: 'hidden', textOverflow: "ellipsis", whiteSpace: 'nowrap', display: 'inline-block', width: '120px' }}
            onClick={() => router.navigate(`/pages/reimburse/reimburse-detail?id=${record.id}`)}
          >
            {_}
          </Typography.Link>
        );
      }
    }),
    AtcolText({ title: '申请人', dataIndex: 'userFullName' }),
    AtcolText({ title: '报销内容', dataIndex: 'title' }),
    AtcolText({ title: '报销状态', dataIndex: 'approveStatus', render: (value) => <ApproveSelectLabel value={value}/> }),
    AtcolText({ title: '报销金额', dataIndex: 'amount' }),
    AtcolText({ title: '所属项目', dataIndex: 'projName' }),
    AtcolText({ title: '备注信息', dataIndex: 'remarks' }),
  ]
});

export const ReimburseColumns: ColumnsType = [
  {
    title: '报销单编号', dataIndex: 'id', key: 'id', width: '150px',

  },
  { title: '申请人', dataIndex: ['user', 'full_name'], key: 'user.full_name', width: '120px' },
  { title: '报销内容', dataIndex: 'title', key: 'title', width: '200px' },
  { title: '报销状态', dataIndex: ['approve', 'status'], key: 'approve.status', width: '200px', render: (value) => <ApproveSelectLabel value={value}/> },
  { title: '报销金额', dataIndex: 'amount', key: 'amount', width: '80px', align: 'center' },
  { title: '所属项目', dataIndex: ["project", "name"], key: 'project.name', width: '200px' },
  { title: '备注信息', dataIndex: 'remarks', key: 'remarks' },
];

export const createReimburseTravelConfig = (): iAutoOptionConfig => ({
  module: 'reimburse_travel',
  columns: [
    AtcolInput({ title: '标题', dataIndex: 'title' }),
    AtcolSelect({ title: '差旅类型', dataIndex: 'type', options: travelTypes }),
    AtcolDatetime({ title: '出发时间', dataIndex: 'departTime', showTime: true }),
    AtcolDatetime({ title: '到达时间', dataIndex: 'arriveTime', showTime: true }),
    AtcolInput({ title: '出发城市', dataIndex: 'departCity' }),
    AtcolInput({ title: '到达城市', dataIndex: 'arriveCity' }),
    AtcolNumber({ title: '报销金额', dataIndex: 'amount' }),
    AtcolInput({
      title: '发票信息', dataIndex: 'invoiceText',
      inlineRender: ({ value }) => <InvoiceDisplayer invoiceList={value}/>,
      inlineEditor: () => <InvoiceEditor dataType="text"/>,
      filterOption: undefined,
      sortable: false,
    }),
  ],
});

export const ReimburseTravelColumns: ColumnsType = [
  ColInput('标题', 'title'),
  ColSelect('差旅类型', 'type', travelTypes),
  ColDatePicker('出发时间', 'depart_time'),
  ColDatePicker('到达时间', 'arrive_time'),
  ColInput('出发城市', 'depart_city'),
  ColInput('到达城市', 'arrive_city'),
  ColNumber('报销金额', 'amount'),
  ColInput('发票信息', 'invoice_text', {
    render: (val) => {
      return (<InvoiceDisplayer invoiceList={val}/>);
    },
  }),
];

export const createReimburseOtherConfig = (): iAutoOptionConfig => ({
  module: 'reimburse_other',
  columns: [
    AtcolInput({ title: '标题', dataIndex: 'title' }),
    AtcolSelect({ title: '报销类型', dataIndex: 'type', options: otherTypes }),
    AtcolNumber({ title: '报销金额', dataIndex: 'amount' }),
    AtcolSelect({ title: '票据类型', dataIndex: 'recipeType', options: recipe_type }),
    AtcolInput({
      title: '发票信息', dataIndex: 'invoiceText',
      inlineRender: ({ value }) => <InvoiceDisplayer invoiceList={value}/>,
      inlineEditor: () => <InvoiceEditor dataType="text"/>,
      filterOption: undefined,
      sortable: false,
    }),
  ],
});

export const ReimburseOtherColumns: ColumnsType = [
  ColInput('标题', 'title'),
  ColSelect('报销类型', 'type', otherTypes),
  ColNumber('报销金额', 'amount'),
  ColSelect('票据类型', 'recipe_type', recipe_type),
  ColInput('发票信息', 'invoice_text', {
    render: (val) => {
      return (<InvoiceDisplayer invoiceList={val}/>);
    },
  }),
];
