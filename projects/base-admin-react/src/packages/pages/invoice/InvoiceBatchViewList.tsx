import {Button, Card, notification, Space, Table} from "antd";
import {createInvoiceConfig, iInvoiceRecord, InvoiceColumns} from "./invoice.utils";
import React, {useContext, useMemo, useState} from "react";
import {RemoteRunnable} from "@langchain/core/runnables/remote";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";
import {produce} from "immer";
import {JsonStreamHandler} from "../../utils/createJsonStreamHandler";
import {uuid} from "@peryl/utils/uuid";
import {useStrictMounted} from "../../uses/useStrictMounted";
import {TokenContext} from "../user/user.utils";
import {iFileRecord} from "../file/file.utils";
import {showError} from "../../utils/showError";
import RollbackOutlined from '@ant-design/icons/RollbackOutlined';
import SaveOutlined from '@ant-design/icons/SaveOutlined';
import {router} from "../../home/routes";
import {useLoadingState} from "../../uses/useLoadingState";
import {http} from "../../utils/http";
import {useAutoFormDrawer} from "../../components/AutoTable/useAutoFormDrawer";
import {assetsPathUtils} from "../../utils/assetsPathUtils";

export const InvoiceBatchViewList = (props: {
  fileRecordList: iFileRecord[],
}) => {
  const token = useContext(TokenContext)!;

  const { editRecordWithDrawer } = useAutoFormDrawer();

  // const [invoiceList, setInvoiceList] = useState(TempInvoiceData as iInvoiceRecord[]);
  const [invoiceList, setInvoiceList] = useState([] as iInvoiceRecord[]);

  const columns = useMemo(() => {
    return InvoiceColumns.filter(i =>
      i.title !== '发票状态' &&
      i.title !== '创建时间'
    );
  }, []);

  /*流式批量识别发票信息*/
  const streamDecodeInvoiceFileRecords = async (fileRecords: { path: string }[]) => {
    const chain = new RemoteRunnable({
      url: pathJoin(env.baseURL, 'bailian-qwen-plus'),
      options: {
        headers: {
          Authorization: `Bearer ${token}`
        },
      },
    });
    let fullText = '';
    const notificationKey = uuid();
    try {
      notification.info({ message: '正在识别发票信息...', duration: null, key: notificationKey });
      for await (const chunk of await chain.stream(
        {
          messages: [
            {
              role: 'system',
              content: SystemPrompt + `
              发票的文件路径依次是：
              ${fileRecords.map(item => assetsPathUtils.buildForWeb(item.path)).join('\n')}
          `
            },
            {
              role: 'user',
              content: fileRecords.map(item => (
                { "type": "image_url", "image_url": { "url": assetsPathUtils.buildForLLM(item.path), "detail": "auto", } }
              ))
            }
          ]
        }
      )) {
        fullText += chunk;
        // eslint-disable-next-line no-loop-func
        setInvoiceList(newestInvoiceList => {
          const updateInvoiceList = produce(newestInvoiceList, draft => {
            fullText = JsonStreamHandler.handleFullText(draft, fullText).list.join('\n');
          });
          return updateInvoiceList.map(item => {return !!item.id ? item : { ...item, id: uuid(), };});
        });
      }

      setInvoiceList(newestInvoiceList => {
        return produce(newestInvoiceList, draft => {
          draft.forEach(i => {
            i.path = (i as any).path2.replace(env.assetsPrefix, '');
            i.jym = i.jym.replace(/\s+/, '').slice(-6);
          });
        });
      });
      setInvoiceList(newestInvoiceList => {
        console.log(newestInvoiceList);
        notification.success({ message: `发票识别完毕，一共识别 ${newestInvoiceList.length} 张发票` });
        return newestInvoiceList;
      });

    } catch (e) {
      showError(e);
    } finally {
      notification.destroy(notificationKey);
    }
  };

  useStrictMounted(async () => {
    /*await streamDecodeInvoiceFileRecords([
      { "path": "/web/upload_file/20250830132235_565ccec7-8561-11f0-bb5a-0242ac120002/invoice.png", },
      { "path": "/web/upload_file/20250830145616_6cf0d336-856e-11f0-bb5a-0242ac120002/北京增值税电子普通发票.png", },
      { "path": "/web/upload_file/20250830145808_af3918af-856e-11f0-bb5a-0242ac120002/浙江增值税电子普通发票.png", }
    ]);*/
    await streamDecodeInvoiceFileRecords(props.fileRecordList);
  });

  const editInvoiceRecord = async (record: iInvoiceRecord) => {
    try {
      await editRecordWithDrawer({
        title: '编辑发票信息',
        record,
        columns: createInvoiceConfig().columns,
        save: async (newRecord) => {
          setInvoiceList(prevList => prevList.map(item => item.id === record.id ? { ...record, ...newRecord } : item));
        },
      });
    } catch (e) {
      showError(e);
    }
  };

  const deleteInvoiceRecord = async (record: iInvoiceRecord) => {
    setInvoiceList(prevList => prevList.filter(i => i.id !== record.id));
  };

  const { loading: openSaving, isLoading: isSaving } = useLoadingState();

  const saveInvoiceList = async () => {
    const closeSaving = openSaving();
    try {
      await http.post<{ result: iInvoiceRecord[] }>('/invoice/batch_insert', invoiceList);
      notification.success({ message: '保存发票成功！' });
      await router.navigate(-1);
    } catch (e) {
      showError(e);
    } finally {
      closeSaving();
    }
  };

  return (
    <Card>
      <div style={{ marginBottom: '1em', textAlign: 'right' }}>
        <Space size="small">
          <Button onClick={() => router.navigate(-1)}>
            <RollbackOutlined/>
            <span>取消</span>
          </Button>
          <Button type="primary" onClick={saveInvoiceList} loading={isSaving}>
            <SaveOutlined/>
            <span>保存</span>
          </Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        dataSource={invoiceList}
        columns={[
          {
            title: '#',
            width: '48px',
            align: 'center',
            render: (_, __, index) => (index + 1)
          },
          ...columns,
          {
            title: '操作列',
            width: '100px',
            align: 'center' as const,
            render: (_, record) => (<>
              <Space size="small">
                <Button variant="link" color="primary" data-no-padding onClick={() => editInvoiceRecord(record as iInvoiceRecord)}>编辑</Button>
                <Button variant="link" color="danger" data-no-padding onClick={() => deleteInvoiceRecord(record as iInvoiceRecord)}>删除</Button>
              </Space>
            </>)
          }
        ]}
      />
    </Card>
  );
};


const SystemPrompt = `
  你是一个发票识别专家，你需要识别出来用户提供的多个发票文件信息。如果用户提供的文件中你无法识别为发票，请忽略这些文件；

  每张发票信息你都需要返回如下字段：

  fpdm：发票代码
  fphm：发票号码
  kprq：开票日期，格式为YYYY-MM-DD
  jym：校验码
  je：发票金额
  path2：发票的url地址

  你返回的数据格式如下<data/>标签中的内容示例所示

  <data>
  0.fpdm=发票代码
  0.fphm=发票号码
  0.kprq=开票日期，格式为YYYY-MM-DD
  0.jym=校验码
  0.je=发票金额
  0.path2=发票的url地址
  1.fpdm=发票代码
  1.fphm=发票号码
  1.kprq=开票日期，格式为YYYY-MM-DD
  1.jym=校验码
  1.je=发票金额
  1.path2=发票的url地址
  </data>

  这个格式是一个点表示法，“0.fpdm”表示第一条数据的发票代码，“1.fpdm”表示第二条数据的发票代码，以此类推
`;
