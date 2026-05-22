import {iChatbotState} from "./useChatbotState";
import {iChatbotInnerProps} from "./chatbot.utils";
import {message} from "antd";
import {iChatbotConversation} from "./useChatbotConversation";
import {useCallback, useContext} from "react";
import {TokenContext} from "../../pages/user/user.utils";
import {iChatbotMessages} from "./useChatbotMessages";
import {uuid} from "@peryl/utils/uuid";
import {useStableCallback} from "../../uses/useStableCallback";
import $file from "../../utils/file";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";
import {assetsPathUtils} from "../../utils/assetsPathUtils";

export function useChatbotRequest(
  {
    chatbotState: {
      loading,
      isLoading,
      abortController,
      attachedFiles,
      setAttachedFiles,
      setAttachmentsOpen,
    },
    chatbotMessages: {
      setMessages,
      getNewestMessages,
      setTempMessage,
      getNewestTempMessage,
      setInterruptValue
    },
    chatbotConversation: {
      conversationId,
      checkConversation,
    },
    props: { userId, behavior: { sendMessage: propsSendMessage, converseSaver: propsConverseSaver }, systemPrompt, handleAiMessage }
  }: {
    chatbotState: iChatbotState,
    chatbotMessages: iChatbotMessages,
    chatbotConversation: iChatbotConversation,
    props: iChatbotInnerProps,
  }
) {

  const token = useContext(TokenContext)!;

  /*将用户消息发送至后端*/
  const _sendMessage = useStableCallback(async (question: string) => {
    if (!conversationId) {return; }

    if (!!abortController.current) {abortController.current.abort('cancel');}
    abortController.current = new AbortController();

    const humanMessage = { id: uuid(), content: question, role: 'user' as const };

    /*有附件图片*/
    if (!!attachedFiles.length) {
      console.log(attachedFiles);

      /*清理并且关掉附件框*/
      setAttachmentsOpen(false);
      setAttachedFiles([]);

      /*将图片上传到服务器，得到每个图片的地址*/
      const filePathList: string[] = await Promise.all(
        attachedFiles.map(file => {
          return new Promise<string>((resolve, reject) => {
            $file.upload({
              file: file.originFileObj!,
              action: pathJoin(env.uploadURL, '/save_file'),
              filename: 'file',
              headers: { Authorization: `Bearer ${token}` },
              onSuccess: (responseData: any) => {
                resolve(assetsPathUtils.buildForLLM(responseData.result.path));
              },
              onError: (e) => {reject(e);},
            });
          });
        })
      );
      console.log("filePathList", filePathList)

      /*组装多模态消息*/
      ;(humanMessage as any).content = [
        { type: 'text', text: humanMessage.content },
        ...filePathList.map(i => ({ type: 'image_url', image_url: { url: i } }))
      ];

      console.log(humanMessage);
    }

    return propsSendMessage({
      userId,
      conversationId,
      token,
      systemPrompt,
      handleAiMessage,
      humanMessage,
      setMessages,
      setTempMessage,
      setInterruptValue,
      getNewestMessages,
      getNewestTempMessage,
      loading,
      abortController: abortController.current,
      converseSaver: propsConverseSaver,
      /*调用结束之后（sendMessage结束之后)，需要调用onFinish方法处理一些后续动作*/
      onFinish: async (fullText: string) => {
        /*回答结束之后，将聊天信息保存*/
        const saveMessages = await getNewestMessages();
        await propsConverseSaver.saveConversationMessages({ userId, conversationId, messages: saveMessages, interrupts: null });
        /*执行handleAiMessage回调*/
        handleAiMessage?.(fullText, humanMessage.content);
      },
    });
  });

  /*
  * 发送用户消息
  * 前置检查：1）是否正在请求中；2）用户输入是否为空；3）会话标题是否已经初始化
  */
  const sendMessage = useCallback(async (inputValue: string | null | undefined) => {
    if (!inputValue?.trim().length) return;
    if (isLoading) {
      message.error('请求正在进行中，请等待请求完成。');
      return;
    }
    await Promise.all([
      _sendMessage(inputValue),
      checkConversation(inputValue)
    ]);
  }, [_sendMessage, checkConversation, isLoading]);

  return {
    sendMessage,
  };
}

export type iChatbotRequest = ReturnType<typeof useChatbotRequest>;
