import {AutoTable} from "../../components/AutoTable/AutoTable";
import {Card, message} from "antd";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AtcolInput} from "../../components/AutoTable/columns/AtcolInput";
import {AtcolDatetime} from "../../components/AutoTable/columns/AtcolDatetime";
import {AtcolNumber} from "../../components/AutoTable/columns/AtcolNumber";
import {AtcolSelect} from "../../components/AutoTable/columns/AtcolSelect";
import {usePickAutoObject} from "../../components/AutoTable/components/usePickAutoObject";
import {DemoListOptionConfig} from "./demo-list.utils";
import {AtcolObject} from "../../components/AutoTable/columns/AtcolObject";
import {AtcolTextarea} from "../../components/AutoTable/columns/AtcolTextarea";

export default function HomePage() {

  // const option = useAutoOption(() => ({
  //   module: 'project',
  //   // selectType: 'multiple',
  //   columns: [
  //     AtcolInput({ title: '项目编号', dataIndex: 'id', }),
  //     AtcolInput({ title: '项目名称', dataIndex: 'name', required: true }),
  //     AtcolNumber({ title: '项目预算', dataIndex: 'budget', required: true }),
  //     AtcolNumber({ title: '已花费金额', dataIndex: 'spent', width: 120 }),
  //     AtcolInput({ title: '项目描述', dataIndex: 'description', required: true }),
  //   ]
  // }));

  const { pickSingleObject, pickMultipleObject } = usePickAutoObject();

  const option = useAutoOption(() => ({
    module: 'demo',
    // selectType: 'multiple',
    pageSize: 10,
    columns: [
      AtcolInput({ title: '编号', dataIndex: 'id', editable: false, }),
      AtcolTextarea({ title: '名称', dataIndex: 'normalText', required: true }),
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
      AtcolObject({
        title: '父对象',
        dataIndex: 'parentName',
        config: DemoListOptionConfig,
        map: { parentId: 'id', parentName: 'normalText' }
      })
    ],
    buttons: [
      // {
      //   label: '自定义编辑',
      //   onClick: async () => {
      //     const checkedRows = await getNewestValue(option.setStateCheckedRows);
      //     await option.methods.editRecord(checkedRows);
      //   }
      // },
      // {
      //   label: '智能聊天',
      //   onClick: async () => {
      //     /*const { closeChatbox } = await option.chatbox.openChatBox({
      //
      //     });*/
      //   }
      // },
      {
        label: '对象单选',
        onClick: async () => {
          const pickValue = await pickSingleObject({ config: DemoListOptionConfig });
          message.info(String(pickValue.normalText));
          console.log('pickValue', pickValue);
        }
      },
      {
        label: '对象多选',
        onClick: async () => {
          const pickValues = await pickMultipleObject({ config: DemoListOptionConfig });
          message.info(String(pickValues.map(i => i.normalText)));
          console.log('pickValues', pickValues);
        }
      }
    ]
  }));

  // option.hooks.onClickRow.use(() => {
  //   console.log('option.stateData', option.stateData);
  // });

  // const subOption = useAutoOption(() => ({
  //   module: 'demo',
  //   pageSize: 5,
  //   columns: [
  //     AtcolInput({ title: '编号', dataIndex: 'id', editable: false, }),
  //     AtcolInput({ title: '名称', dataIndex: 'normalText', required: true }),
  //     AtcolObject({
  //       title: '父对象',
  //       dataIndex: 'parentName',
  //       config: DemoListOptionConfig,
  //       map: { parentId: 'id', parentName: 'normalText' }
  //     })
  //   ],
  //   parentOption: option,
  //   parentKeyMap: { parentId: 'id', parentName: 'normalText' },
  // }));

  return (
    <div style={{ padding: '1em' }}>
      <Card>
        <AutoTable option={option}/>
      </Card>
      {/*<Card>*/}
      {/*  <AutoTable option={subOption}/>*/}
      {/*</Card>*/}
    </div>
  );
}
