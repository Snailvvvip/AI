import {ColumnsType} from "antd/es/table";
import {Image} from 'antd';
import {iAutoOptionConfig} from "../../components/AutoTable/auto-table.utils";
import {AtcolText} from "../../components/AutoTable/columns/AtcolText";
import {AtcolNumber} from "../../components/AutoTable/columns/AtcolNumber";

export const HotelColumns: ColumnsType = [
  {
    title: '预览照', dataIndex: 'picture', key: 'picture', width: 120, align: 'center', render: (val) => {
      return <Image src={val} style={{ width: 36, height: 36 }} alt={''}/>;
    }
  },
  { title: '名称', dataIndex: 'title', key: 'title', width: 120 },
  { title: '原价', dataIndex: 'origin_price', key: 'origin_price', width: 80, align: 'right' },
  { title: '目标价', dataIndex: 'discount_price', key: 'discount_price', width: 80, align: 'right' },
  { title: '销量', dataIndex: 'sales', key: 'sales', width: 80, align: 'right' },
  { title: '描述', dataIndex: 'description', key: 'description' },
];

export const createHotelConfig = (): iAutoOptionConfig => ({
  module: 'hotel',
  columns: [
    AtcolText({
      title: '预览照', dataIndex: 'picture',
      width: 120, align: 'left', render: (val) => {
        return <Image src={val} style={{ width: 36, height: 36 }} alt={''}/>;
      }
    }),
    AtcolText({ title: '名称', dataIndex: 'title', width: 120, }),
    AtcolNumber({ title: '原价', dataIndex: 'originPrice', width: 80, inlineRender: ({ value }) => <span style={{ textDecoration: 'line-through' }}>{value} ¥</span> }),
    AtcolNumber({ title: '目标价', dataIndex: 'discountPrice', width: 80, inlineRender: ({ value }) => <span>{value} ¥</span> }),
    AtcolText({ title: '销量', dataIndex: 'sales', width: 80, }),
    AtcolText({ title: '描述', dataIndex: 'description' }),
  ]
});
