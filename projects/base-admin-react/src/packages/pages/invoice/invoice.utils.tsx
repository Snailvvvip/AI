import {ColumnsType} from "antd/es/table";
import {ColInput, ColNumber, ColSelect, ColTextarea} from "../../components/Columns";
import {ColDatePicker} from "../../components/Columns/ColDatePicker";
import {Image} from "antd";
import {iBaseRecord} from "../../utils/BaseRecord";
import {iAutoOptionConfig} from "../../components/AutoTable/auto-table.utils";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolDatetime} from "../../components/AutoTable/columns/AtcolDatetime";
import {AtcolNumber} from "../../components/AutoTable/columns/AtcolNumber";
import {AtcolSelect} from "../../components/AutoTable/columns/AtcolSelect";
import {AtcolTextarea} from "../../components/AutoTable/columns/AtcolTextarea";
import {assetsPathUtils} from "../../utils/assetsPathUtils";


export const InvoiceStatusOption: { label: string, value: string }[] = [
  { label: '未验证', value: 'unverified' },
  { label: '已通过', value: 'success' },
  { label: '未通过', value: 'failed' },
];

export const createInvoiceConfig = (): iAutoOptionConfig => ({
  module: 'invoice',
  columns: [
    AtcolInput({
      title: '发票图片', dataIndex: 'path', align: 'center', editable: false, render: (path) => (
        path == null ? null :
          <Image src={assetsPathUtils.buildForWeb(path)} style={{ width: '50px', height: '50px' }}/>
      )
    }),
    AtcolInput({ title: '发票代码', dataIndex: 'fpdm' }),
    AtcolInput({ title: '发票号码', dataIndex: 'fphm' }),
    AtcolInput({ title: '校验码后六位', dataIndex: 'jym' }),
    AtcolDatetime({ title: '开票日期', dataIndex: 'kprq' }),
    AtcolNumber({ title: '金额', dataIndex: 'je' }),
    AtcolSelect({ title: '发票状态', dataIndex: 'status', options: InvoiceStatusOption }),
    AtcolTextarea({ title: '备注信息', dataIndex: 'remarks' }),
    AtcolDatetime({ title: '创建时间', dataIndex: 'createdAt', editable: false, showTime: true }),
  ]
});

export const InvoiceColumns: ColumnsType = [
  ColInput("发票图片", 'path', {
    width: '85px',
    align: 'center',
    render: (path) => (
      path == null ? null :
        <Image src={assetsPathUtils.buildForWeb(path)} style={{ width: '50px', height: '50px' }}/>
    )
  }),
  ColInput("发票代码", 'fpdm'),
  ColInput("发票号码", 'fphm'),
  ColInput("校验码后六位", 'jym'),
  ColDatePicker("开票日期", 'kprq'),
  ColNumber("金额", 'je'),
  ColSelect('发票状态', "status", InvoiceStatusOption),
  ColTextarea('备注信息', "remarks",),
  ColInput("创建时间", 'created_at'),
];

export interface iInvoiceRecord extends iBaseRecord {
  path: string;
  fpdm: string;
  fphm: string;
  kprq: string;
  jym: string;
  je: number;
  status: string;
  remarks: string;
}
