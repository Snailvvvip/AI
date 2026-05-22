import $file from "../../utils/file";
import {iFileRecord} from "../file/file.utils";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";
import {TokenService} from "../../utils/TokenService";
import {http} from "../../utils/http";
import {createInvoiceConfig, iInvoiceRecord} from "./invoice.utils";
import {useAutoFormDrawer} from "../../components/AutoTable/useAutoFormDrawer";
import {defer} from "@peryl/utils/defer";
import {showError} from "../../utils/showError";
import {assetsPathUtils} from "../../utils/assetsPathUtils";
import {message} from "antd";
import {uuid} from "@peryl/utils/uuid";

export function useInvoiceUploader() {

  const invoiceDrawer = useInvoiceDrawer();

  async function pick() {
    const { fileRecord, accessFilePath } = await pickAndUploadInvoiceImage();
    const invoiceInformation = await decodeInvoiceInformation(accessFilePath);
    /*const invoiceInformation: Partial<iInvoiceRecord> = {
      "fpdm": "014001700111",
      "fphm": "30821390",
      "kprq": "2018-01-02",
      "jym": "78392855520826502068",
      "je": 1028.00
    };*/
    const invoiceRecord = await invoiceDrawer.editAndSave({ invoiceInformation, fileRecord });
    return invoiceRecord;
  }

  return { pick };
}

/*选择、上传发票图片，得到附件信息*/
async function pickAndUploadInvoiceImage() {
  const file = await $file.chooseImage();
  console.log('pick file:', file);
  const uploadResponseData = await new Promise<{ result: iFileRecord }>(async (resolve, reject) => {
    $file.upload({
      file,
      action: pathJoin(env.uploadURL, '/save_file'),
      filename: 'file',
      headers: {
        Authorization: `Bearer ${await TokenService.getToken()}`
      },
      onSuccess: (responseData: any) => {resolve(responseData);},
      onError: (e) => {reject(e);},
    });
  });
  const fileRecord = uploadResponseData.result;
  console.log("fileRecord", fileRecord);
  const accessFilePath = assetsPathUtils.buildForWeb(fileRecord.path);
  console.log("accessFilePath", accessFilePath);
  return { fileRecord, accessFilePath };
}

/*解析发票信息*/
async function decodeInvoiceInformation(
  imagePath = "http://110.42.233.30/web/upload_file/20250830132235_565ccec7-8561-11f0-bb5a-0242ac120002/invoice.png"
) {
  const messageKey = uuid();
  message.info({ content: "正在识别发票信息...", key: messageKey });
  try {
    const resp = await http.post<{ output: string }>('/bailian-qwen-plus/invoke', {
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                "type": "text",
                "text": `
                  这里有一张图片，我希望是一张发票,
                  如果这个图片不是发票，则直接返回json数据 {error}，error为图片的描述信息
                  ，如果是发票，请返回json数据 {fpdm, fphm, kqrp, jym, je}：
                  其中字段的含义为：
                   fpdm: 发票代码
                   fphm: 发票号码
                   kprq: 开票日期
                   jym: 校验码
                   je: 发票金额
                 最后注意的是，开票日期的格式为YYYY-MM-DD
                `.trim()
              },
              {
                "type": "image_url",
                "image_url": {
                  "url": assetsPathUtils.buildForLLM(imagePath),
                  "detail": "auto",
                }
              }
            ]
          }
        ]
      },
      config: {},
      kwargs: {},
    });
    const outputData = JSON.parse(resp.data.output);
    if ("error" in outputData) {
      throw new Error(outputData.error);
    } else {
      return outputData as Partial<iInvoiceRecord>;
    }
  } finally {
    message.destroy(messageKey);
  }
}

/*编辑、确认、修正发票信息*/
function useInvoiceDrawer() {

  const { editRecordWithDrawer } = useAutoFormDrawer();

  async function editAndSave(
    { invoiceInformation, fileRecord }: { invoiceInformation: Partial<iInvoiceRecord>, fileRecord: iFileRecord }
  ): Promise<iInvoiceRecord> {
    const dfd = defer<iInvoiceRecord>();
    try {
      invoiceInformation.fpdm = invoiceInformation.fpdm!.replace(/\s+/g, '');
      invoiceInformation.fphm = invoiceInformation.fphm!.replace(/\s+/g, '');
      invoiceInformation.jym = invoiceInformation.jym!.replace(/\s+/g, '');
      await editRecordWithDrawer({
        record: {
          ...invoiceInformation,
          jym: invoiceInformation.jym!.slice(-6)
        },
        columns: createInvoiceConfig().columns.filter(i => 'dataIndex' in i && i.dataIndex !== 'status'),
        save: async (newRecord) => {
          /*准备保存发票信息数据*/
          newRecord.path = fileRecord.path;
          newRecord.status = 'unverified';

          const resp = await http.post<{ result: iInvoiceRecord }>('/invoice/insert', newRecord);
          dfd.resolve(resp.data.result);
        },
      });
    } catch (e) {
      showError(e);
      dfd.reject(e);
    }
    return dfd.promise;
  }

  return { editAndSave, editRecordWithDrawer };
}
