import {ReimburseBatchInput} from "./ReimburseBatchInput";
import {ReimburseBatchGenerate} from "./ReimburseBatchGenerate";
import {useState} from "react";

export default () => {

  const [reimburseText, setReimburseText] = useState('' as string | null | undefined);

  return (
    <div style={{ padding: '1em' }}>
      {!reimburseText?.length ?
        <ReimburseBatchInput onChange={setReimburseText}/> :
        <ReimburseBatchGenerate reimburseText={reimburseText}/>}
    </div>
  );
}

/*
export default () => {
  return (
    <div style={{ padding: '1em' }}>
      <ReimburseBatchGenerate reimburseText={''}/>
    </div>
  );
}
*/
