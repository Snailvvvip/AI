import {useCallback, useRef, useState} from "react";
import {GetProp, GetRef} from "antd";
import {Attachments, type AttachmentsProps} from "@ant-design/x";
import type {Conversation} from "@ant-design/x/es/conversations";
import {DEMO_CHAT_CONVERSATION_LIST} from "../ChatPublic/chat-public.utils";

export function useChatCopilotState() {

  /*是否显示附件上传窗口*/
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  /*对Attachments组件的引用*/
  const attachmentsRef = useRef<GetRef<typeof Attachments>>(null);
  /*输入框中上传的文件*/
  const [files, setFiles] = useState<GetProp<AttachmentsProps, 'items'>>([]);
  /*用户输入文本内容*/
  const [inputValue, setInputValue] = useState('');

  /*会话列表数据*/
  const [sessionList, setSessionList] = useState<Conversation[]>(DEMO_CHAT_CONVERSATION_LIST);
  /*当前会话数据*/
  const [curSession, setCurSession] = useState(sessionList[0].key);

  /*处理用户粘贴文件*/
  const onPasteFile = useCallback((_: File, files: FileList) => {
    // @ts-ignore
    for (const file of files) {
      attachmentsRef.current?.upload(file);
    }
    setAttachmentsOpen(true);
  }, []);

  return {
    attachmentsOpen,
    setAttachmentsOpen,
    attachmentsRef,
    files,
    setFiles,
    inputValue,
    setInputValue,
    sessionList,
    setSessionList,
    curSession,
    setCurSession,
    onPasteFile,
  };
}

export type iChatCopilotState = ReturnType<typeof useChatCopilotState>;
