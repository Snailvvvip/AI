import {createInvoiceConfig, iInvoiceRecord} from "../../pages/invoice/invoice.utils";
import {useMemo} from "react";
import {Button, Image, Space} from "antd";
import {useInvoiceUploader} from "../../pages/invoice/useInvoiceUploader";
import './InvoiceEditor.scss';
import UploadOutlined from '@ant-design/icons/UploadOutlined';
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import {showError} from "../../utils/showError";
import {usePickAutoObject} from "../AutoTable/components/usePickAutoObject";
import {assetsPathUtils} from "../../utils/assetsPathUtils";

export const InvoiceEditor = (props: iInvoiceEditorProps) => {

  const { pickSingleObject } = usePickAutoObject();

  const invoiceUploader = useInvoiceUploader();

  const invoiceList = useMemo((): iInvoiceRecord[] => {
    if (props.value == null) {
      return [];
    }
    if (typeof props.value === "string") {
      try {
        return JSON.parse(props.value);
      } catch (e) {
        return [];
      }
    } else {
      return props.value;
    }
  }, [props.value]);

  const emitChange = (invoiceRecord: iInvoiceRecord) => {
    const value: any = props.dataType === 'text' ? JSON.stringify([invoiceRecord, ...invoiceList]) : [invoiceRecord, ...invoiceList];
    props.onChange?.(value);
  };

  const uploadInvoice = async () => {
    try {
      emitChange(await invoiceUploader.pick());
    } catch (e) {
      showError(e);
    }
  };

  const pickInvoice = async () => {
    try {
      emitChange(
        await pickSingleObject({
          title: '选择发票',
          config: () => ({ ...createInvoiceConfig(), pageSize: 5 }),
        }) as any
      );
    } catch (e) {
      showError(e);
    }
  };

  const removeInvoice = async (invoiceRecord: iInvoiceRecord) => {
    const newInvoiceList: iInvoiceRecord[] = invoiceList.filter(i => i.id !== invoiceRecord.id);
    props.onChange?.((props.dataType === 'text' ? JSON.stringify(newInvoiceList) : newInvoiceList) as any);
  };

  return (
    <div className="invoice-editor">
      <Space direction="vertical">
        {invoiceList.map(item => (
          <div className="invoice-item" key={item.id}>
            <div className="invoice-image">
              <Image src={assetsPathUtils.buildForWeb(item.path)} style={{ width: '50px', height: '50px' }}/>
              <div className="invoice-deleter" onClick={() => removeInvoice(item)}>
                <CloseOutlined/>
              </div>
            </div>
            <div>
              <div>{item.remarks}</div>
              <div>{item.je}</div>
            </div>
          </div>
        ))}
        <Space.Compact>
          <Button onClick={uploadInvoice}>
            <UploadOutlined/>
            <span>上传发票</span>
          </Button>
          <Button onClick={pickInvoice}>
            <SearchOutlined/>
            <span>选择发票</span>
          </Button>
        </Space.Compact>
      </Space>
    </div>
  );
};

export interface iInvoiceEditorBaseProps {}

export interface iInvoiceEditorTextProps {
  value?: string,
  onChange?: (val: string) => void,
  dataType: 'text',
}

export interface iInvoiceEditorArrayProps {
  value?: iInvoiceRecord[],
  onChange?: (val: iInvoiceRecord[]) => void,
  dataType: 'array',
}

export type iInvoiceEditorProps = iInvoiceEditorBaseProps & (iInvoiceEditorTextProps | iInvoiceEditorArrayProps)
