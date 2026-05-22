import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolDatetime} from "../../components/AutoTable/columns/AtcolDatetime";
import {AtcolNumber} from "../../components/AutoTable/columns/AtcolNumber";
import {AtcolSelect} from "../../components/AutoTable/columns/AtcolSelect";

export const DemoListOptionConfig = () => ({
  module: 'demo',
  // selectType: 'single',
  pageSize: 5,
  columns: [
    AtcolInput({ title: '编号', dataIndex: 'id', editable: false, }),
    AtcolInput({ title: '名称', dataIndex: 'normalText', required: true }),
    AtcolDatetime({ title: '创建时间', dataIndex: 'createdAt', showTime: true, editable: false }),
    AtcolDatetime({ title: '更新时间', dataIndex: 'updatedAt', showTime: true, editable: false }),
    AtcolDatetime({ title: '日期', dataIndex: 'dateVal' }),
    AtcolNumber({ title: '计数', dataIndex: 'count' }),
    AtcolNumber({ title: '数字', dataIndex: 'numberVal' }),
    AtcolSelect({
      title: '下拉选择', dataIndex: 'selectVal', options: [
        { label: '消费者', value: 'consumer' },
        { label: '潜在客户', value: 'potential' },
        { label: '门店', value: 'store' },
      ]
    }),
  ],
});
