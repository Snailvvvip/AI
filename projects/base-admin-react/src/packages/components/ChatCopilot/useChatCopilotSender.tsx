import React, {useMemo} from "react";
import {Attachments, Sender, Suggestion} from "@ant-design/x";
import {AppstoreAddOutlined, CloudUploadOutlined, PaperClipOutlined} from "@ant-design/icons";
import {Button} from "antd";
import {iChatCopilotStyles} from "./useChatCopilotStyles";
import {DEMO_CHAT_SENDER_LIST, DEMO_CHAT_SUGGESTION_LIST, iChatCopilotProps} from "../ChatPublic/chat-public.utils";
import {iChatbotState} from "../Chatbot/useChatbotState";
import {iChatbotRequest} from "../Chatbot/useChatbotRequest";

export function useChatCopilotSender(
  {
    chatbotState: {
      attachmentsOpen, setAttachmentsOpen, setInputValue, inputValue, attachedFiles, setAttachedFiles,
      isLoading, abortController, setRecording, recording, attachmentsRef, onPasteFile,
    },
    chatbotRequest: { sendMessage },
    copilotStyle: { styles },
    props: { fastSenders: _fastSenders, fastSuggestions: _fastSuggestions },
  }: {
    copilotStyle: iChatCopilotStyles,
    chatbotState: iChatbotState,
    chatbotRequest: iChatbotRequest,
    props: iChatCopilotProps,
  }
) {
  const fastSuggestions: iChatCopilotProps['fastSuggestions'] = _fastSuggestions === undefined ? DEMO_CHAT_SUGGESTION_LIST : _fastSuggestions;
  const fastSenders: iChatCopilotProps['fastSenders'] = _fastSenders === undefined ? DEMO_CHAT_SENDER_LIST : _fastSenders;

  const sendHeaderContent = useMemo(() => (
    <Sender.Header
      title="文件上传"
      styles={{ content: { padding: 0 } }}
      open={attachmentsOpen}
      onOpenChange={setAttachmentsOpen}
      forceRender
    >
      <Attachments
        ref={attachmentsRef}
        beforeUpload={() => false}
        items={attachedFiles}
        onChange={(info) => setAttachedFiles(info.fileList)}
        placeholder={(type) =>
          type === 'drop'
            ? { title: '拖拽文件到此处' }
            : {
              icon: <CloudUploadOutlined/>,
              title: '批量上传文件',
              description: '单击或拖动文件到此区域进行上传',
            }
        }
      />
    </Sender.Header>
  ), [
    attachmentsOpen, setAttachmentsOpen, attachedFiles, setAttachedFiles, attachmentsRef,
  ]);

  const sendBodyContent = useMemo(() => (
    <div className={styles.chatSend}>
      {!!fastSenders?.length && (
        <div className={styles.sendAction}>
          {fastSenders.map(item => (
            <Button key={item.label} icon={item.icon} onClick={() => sendMessage(item.content)}>
              {item.label}
            </Button>
          ))}
          <Button icon={<AppstoreAddOutlined/>}>更多</Button>
        </div>
      )}

      {/** 输入框 */}
      <Suggestion items={fastSuggestions} onSelect={(itemVal) => setInputValue(`[${itemVal}]:`)}>
        {({ onTrigger, onKeyDown }) => (
          <Sender
            loading={isLoading}
            value={inputValue}
            onSubmit={() => {
              sendMessage(inputValue);
              setRecording(false);
              setInputValue('');
            }}
            onChange={(v) => {
              onTrigger(v === '/');
              setInputValue(v);
            }}
            onCancel={() => {
              abortController.current?.abort();
            }}
            allowSpeech={{
              recording: recording,
              /*当用户输入的时候，会自动地停止录音*/
              onRecordingChange: setRecording
            }}
            placeholder="输入对话内容"
            onKeyDown={onKeyDown}
            header={sendHeaderContent}
            prefix={
              <Button
                type="text"
                icon={<PaperClipOutlined style={{ fontSize: 18 }}/>}
                onClick={() => setAttachmentsOpen(!attachmentsOpen)}
              />
            }
            onPasteFile={onPasteFile}
            actions={(_, info) => {
              const { SendButton, LoadingButton, SpeechButton } = info.components;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <SpeechButton className={styles.speechButton}/>
                  {isLoading ? <LoadingButton type="default"/> : <SendButton type="primary"/>}
                </div>
              );
            }}
          />
        )}
      </Suggestion>
    </div>
  ), [
    abortController,
    attachmentsOpen,
    fastSenders,
    fastSuggestions,
    sendMessage,
    isLoading,
    onPasteFile,
    sendHeaderContent,
    setAttachmentsOpen,
    setInputValue,
    styles.chatSend,
    styles.sendAction,
    styles.speechButton,
    inputValue,
    recording,
    setRecording,
  ]);

  return {
    sendHeaderContent,
    sendBodyContent,
  };
}

export type iChatCopilotSender = ReturnType<typeof useChatCopilotSender>;
