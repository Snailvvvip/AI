import {useRef, useState} from "react";
import {GetProp, GetRef, message} from "antd";
import {Attachments} from "@ant-design/x";
import {useLoadingState} from "../../uses/useLoadingState";
import {useStableCallback} from "../../uses/useStableCallback";
import {delay} from "@peryl/utils/delay";

/*组件内部状态*/
export function useChatbotState() {
  /*附件窗口是否打开*/
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  /*附件列表（暂未实现对接多模态模型实现文件上传识别的功能）*/
  const [attachedFiles, setAttachedFiles] = useState<GetProp<typeof Attachments, 'items'>>([]);
  /*输入框文本*/
  const [inputValue, setInputValue] = useState('');
  /*加载状态*/
  const { loading, isLoading } = useLoadingState();
  /*用来取消请求的AbortController*/
  const abortController = useRef<AbortController | null>(null);
  /*是否正在录音*/
  const [recording, setRecording] = useState(false);

  /*对Attachments组件的引用*/
  const attachmentsRef = useRef<GetRef<typeof Attachments>>(null);

  /*处理用户粘贴文件*/
  const onPasteFile = useStableCallback(async (_: File, files: FileList) => {
    setAttachmentsOpen(true);
    await delay(23);
    // @ts-ignore
    for (const file of files) {
      console.log(file);
      if (file.type.match(/^image\//)) {
        attachmentsRef.current?.upload(file);
      } else {
        message.warning(`目前仅支持上传图片文件：${file.name}`);
      }
    }
  });

  return {
    attachmentsOpen,
    setAttachmentsOpen,
    attachedFiles,
    setAttachedFiles,
    inputValue,
    setInputValue,
    loading,
    isLoading,
    abortController,
    recording,
    setRecording,
    onPasteFile,
    attachmentsRef,
  };
}

export type iChatbotState = ReturnType<typeof useChatbotState>;
