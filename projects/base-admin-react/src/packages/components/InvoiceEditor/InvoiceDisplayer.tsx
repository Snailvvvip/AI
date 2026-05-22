import {Image} from "antd";
import {iInvoiceRecord} from "../../pages/invoice/invoice.utils";
import {assetsPathUtils} from "../../utils/assetsPathUtils";

export const InvoiceDisplayer = (props: {
  invoiceList?: string | iInvoiceRecord[]
}) => {
  const { invoiceList } = props;
  const list: iInvoiceRecord[] | undefined | null = typeof invoiceList === "string" ? JSON.parse(invoiceList) : invoiceList;
  if (!list?.length) {
    return null;
  }
  return (
    <Image.PreviewGroup>
      {/*<Button type="link">「{list.length}」个附件</Button>*/}
      {list.map((item) => (
        <Image key={item.id} src={assetsPathUtils.buildForWeb(item.path)} height={28} width={28}/>
      ))}
    </Image.PreviewGroup>
  );
};
