import {Attachments, Prompts, Sender} from "@ant-design/x";
import {useMemo} from "react";
import {iChatbotState} from "./useChatbotState";
import {CloudUploadOutlined, PaperClipOutlined} from "@ant-design/icons";
import {ExampleSenderPrompts} from "./ChatPageExamples";
import {iChatbotRequest} from "./useChatbotRequest";
import {iChatbotStyles} from "./useChatbotStyles";
import {Button, Flex} from "antd";
import {iChatbotVoiceRecorder} from "./useChatbotVoiceRecorder";

export function useChatbotSender(
  {
    chatbotState: {
      attachmentsOpen,
      setAttachmentsOpen,
      attachedFiles,
      setAttachedFiles,
      inputValue,
      setInputValue,
      abortController,
      isLoading,
      recording,
      setRecording,
      attachmentsRef,
      onPasteFile,
    },
    chatbotRequest: {
      sendMessage,
    },
    chatbotStyle: { styles },
    chatbotVoiceRecorder: { stopRecording },
  }: {
    chatbotState: iChatbotState,
    chatbotRequest: iChatbotRequest,
    chatbotStyle: iChatbotStyles,
    chatbotVoiceRecorder: iChatbotVoiceRecorder,
  }
) {

  const senderHeaderContent = useMemo(() => (
    <Sender.Header
      title="文件上传"
      open={attachmentsOpen}
      onOpenChange={setAttachmentsOpen}
      styles={{ content: { padding: 0 } }}
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
    attachedFiles,
    attachmentsOpen,
    setAttachedFiles,
    setAttachmentsOpen,
    attachmentsRef,
  ]);

  const senderBodyContent = useMemo(() => (
    <>
      {/* 🌟 提示词 */}
      <Prompts
        items={ExampleSenderPrompts}
        onItemClick={(info) => {
          sendMessage(info.data.description as string);
        }}
        styles={{
          item: { padding: '6px 12px' },
        }}
        className={styles.senderPrompt}
      />
      {/* 🌟 输入框 */}
      <Sender
        value={inputValue}
        header={senderHeaderContent}
        onSubmit={() => {
          sendMessage(inputValue);
          setRecording(false);
          setInputValue('');
        }}
        onChange={setInputValue}
        onCancel={() => {
          abortController.current?.abort();
        }}
        prefix={
          <Button
            type="text"
            icon={<PaperClipOutlined style={{ fontSize: 18 }}/>}
            onClick={() => setAttachmentsOpen(!attachmentsOpen)}
          />
        }
        loading={isLoading}
        className={styles.sender}
        onPasteFile={onPasteFile}
        allowSpeech={{
          recording: recording,
          /*当用户输入的时候，会自动地停止录音*/
          onRecordingChange: setRecording
        }}
        actions={(_, info) => {
          const { SendButton, LoadingButton, SpeechButton } = info.components;
          return (
            <Flex gap={4}>
              <SpeechButton className={styles.speechButton}/>
              {isLoading ? <LoadingButton type="default"/> : <SendButton type="primary"/>}
            </Flex>
          );
        }}
        placeholder="输入对话内容"
      />
    </>
  ), [
    abortController,
    attachmentsOpen,
    inputValue,
    isLoading,
    sendMessage,
    senderHeaderContent,
    setAttachmentsOpen,
    setInputValue,
    styles,
    recording,
    setRecording,
    onPasteFile,
  ]);

  return {
    senderHeaderContent,
    senderBodyContent,
  };
}

export type iChatbotSender = ReturnType<typeof useChatbotSender>;
