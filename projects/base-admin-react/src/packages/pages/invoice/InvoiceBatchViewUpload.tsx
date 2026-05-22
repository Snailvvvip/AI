import {Card, message, UploadProps} from "antd";
import Dragger from "antd/es/upload/Dragger";
import InboxOutlined from "@ant-design/icons/InboxOutlined";
import {useContext, useMemo} from "react";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";
import {iFileRecord} from "../file/file.utils";
import {TokenContext} from "../user/user.utils";

export const InvoiceBatchViewUpload = (props: {
  onChange?: (files: iFileRecord[]) => void
}) => {

  const token = useContext(TokenContext)!;

  const uploadProps = useMemo((): UploadProps => {
      return {
        name: 'file',
        multiple: true,
        accept: '.jpg,.png,.jpeg',
        action: pathJoin(env.uploadURL, '/save_file'),
        headers: {
          Authorization: `Bearer ${token}`
        },
        onChange(info) {
          const { status } = info.file;
          if (status !== 'uploading') {
            console.log(info.file, info.fileList);
          }
          if (status === 'done') {
            message.success(`${info.file.name} 文件上传成功！`);
          } else if (status === 'error') {
            message.error(`${info.file.name} 文件上传失败！`);
          }
          // 检查是否所有文件都上传完成
          const isDone = info.fileList.every((f) => f.status === 'done' || f.status === 'error');
          if (isDone) {
            const fileRecordList: iFileRecord[] = info.fileList.map(i => i.response.result);
            props.onChange?.(fileRecordList);
          }
        },
        onDrop(e) {
          console.log('Dropped files', e.dataTransfer.files);
        },
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Card style={{ marginBottom: '1em' }}>
      <Dragger {...uploadProps} style={{ width: '50%', aspectRatio: "5 / 3", margin: '100px auto' }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined/>
        </p>
        <p className="ant-upload-text">批量上传发票</p>
        <p className="ant-upload-hint">
          单击或拖动文件到此区域进行上传，支持单个或批量上传，严禁上传公司数据或其他被禁文件
        </p>
      </Dragger>
    </Card>
  );
};
