import {Button} from "antd";
import {SelectLabel} from "./SelectLabel";
import {ApproveStatusList} from "../../pages/approve/approve.utils";

export function ApproveSelectLabel(props: {
  value?: string | null,
  formatter?: (label: string | undefined | null) => any
}) {

  const value = props.value ?? 'unsubmit';
  return (
    <Button style={{ padding: 0, display: 'inline', height: 'auto' }} color={ApproveStatus2Color[value]} variant="link">
      <SelectLabel value={value} options={ApproveStatusList} formatter={props.formatter}/>
    </Button>
  );
}

const ApproveStatus2Color: Record<string, any> = {
  'approved': 'green',
  'rejected': 'danger',
  'approving': 'primary',
  'cancelled': 'cyan',
  'unsubmit': 'default',
};

