import {useState} from "react";
import {InvoiceBatchViewUpload} from "./InvoiceBatchViewUpload";
import {InvoiceBatchViewList} from "./InvoiceBatchViewList";
import {iFileRecord} from "../file/file.utils";

export default () => {

  const [fileRecordList, setFileRecordList] = useState([] as iFileRecord[]);

  return (
    <div style={{ padding: '1em' }}>
      {
        !fileRecordList.length ?
          <InvoiceBatchViewUpload onChange={setFileRecordList}/> :
          <InvoiceBatchViewList fileRecordList={fileRecordList}/>
      }
    </div>
  );
}
