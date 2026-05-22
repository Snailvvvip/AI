import {Button, Card} from "antd";
import {createInvoiceConfig} from "./invoice.utils";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import {showError} from "../../utils/showError";
import {useLoadingState} from "../../uses/useLoadingState";
import {useInvoiceUploader} from "./useInvoiceUploader";
import {router} from "../../home/routes";
import {useAutoOption} from "../../components/AutoTable/use/useAutoOption";
import {AutoTable} from "../../components/AutoTable/AutoTable";

export default () => {

  const { loading, isLoading } = useLoadingState();

  const invoicePicker = useInvoiceUploader();

  const createInvoice = async () => {
    const closeLoading = loading();
    try {
      const invoiceRecord = await invoicePicker.pick();
      option.state.setStateData(prevList => [invoiceRecord, ...prevList]);
    } catch (e) {
      showError(e);
    } finally {
      closeLoading();
    }
  };

  const option = useAutoOption(() => ({
    ...createInvoiceConfig(),
    showCreateButton: false,
    buttons: [
      {
        label: '上传发票',
        render: () => (
          <Button loading={isLoading} type="primary" onClick={createInvoice}>
            <PlusOutlined/>
            <span>上传发票</span>
          </Button>
        )
      },
      {
        label: '批量上传',
        render: () => (
          <Button onClick={() => router.navigate('/pages/invoice/invoice-batch-upload')}>
            <PlusOutlined/>
            <span>批量上传</span>
          </Button>
        )
      }
    ]
  }));

  return (
    <div style={{ padding: '1em' }}>
      <Card>
        <AutoTable option={option}/>
      </Card>
    </div>
  );
}
