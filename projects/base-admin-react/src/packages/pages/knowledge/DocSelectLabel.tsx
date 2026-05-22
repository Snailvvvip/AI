import {Button} from "antd";
import {KnowledgeDocStatus} from "./knowledge.utils";
import {SelectLabel} from "../../components/SelectLabel/SelectLabel";

export function DocSelectLabel(props: {
  value?: string | null,
  formatter?: (label: string | undefined | null) => any
}) {

  const value = props.value ?? 'unsubmit';
  return (
    <Button style={{ padding: 0, display: 'inline', height: 'auto' }} color={ApproveStatus2Color[value]} variant="link">
      <SelectLabel value={value} options={KnowledgeDocStatus} formatter={props.formatter}/>
    </Button>
  );
}

const ApproveStatus2Color: Record<string, any> = {
  'success': 'green',
  'fail': 'danger',
  'process': 'primary'
};

