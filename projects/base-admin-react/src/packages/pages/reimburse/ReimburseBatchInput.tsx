import {Alert, Button, Card, Input, message, Space} from "antd";
import {useState} from "react";
import {ReimburseBatchTestInput} from "./ReimburseBatchUtils";
import {router} from "../../home/routes";

export const ReimburseBatchInput = (props: { onChange?: (val: string) => void }) => {

  const [inputText, setInputText] = useState(ReimburseBatchTestInput);

  return (
    <Card>
      <div style={{ margin: '50px auto', width: '50%', display: 'block' }}>
        <Alert message="请使用自然语言按照如下格式输入要新建的报销单信息，多个报销单之间使用空行分隔：" style={{ marginBottom: '1em' }}/>
        <Input.TextArea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          style={{ aspectRatio: '5 / 3' }}
        />
        <div style={{ textAlign: 'right', marginTop: '1em' }}>
          <Space>
            <Button onClick={() => router.navigate(-1)}>返回</Button>
            <Button type="primary" onClick={() => {
              if (!inputText?.length) {
                return message.error("请输入报销单信息！");
              }
              props.onChange?.(inputText);
            }}>
              <span>生成报销单</span>
            </Button>
          </Space>
        </div>
      </div>

    </Card>
  );
};
