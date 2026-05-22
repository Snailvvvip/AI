import {iChatbotBehavior} from "../Chatbot/chatbot.utils";
import {RemoteRunnable} from "@langchain/core/runnables/remote";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";
import {uuid} from "@peryl/utils/uuid";
import {showError} from "../../utils/showError";
import {useMemo} from "react";
import {StaticConversationSaver} from "../ChatConversationSaver/StaticConversationSaver";
import {StorageConversationSaver} from "../ChatConversationSaver/StorageConversationSaver";

export function useChatbotLangServe(
  {
    cacheKey,
    langServeUrl,
  }: {
    cacheKey: string | false,
    langServeUrl: string,
  }
): iChatbotBehavior {

  const conversationCacheKey = cacheKey === false ? null : `${cacheKey}_conversation`;

  const _converseSaver = useMemo(() => !!conversationCacheKey ? new StorageConversationSaver(conversationCacheKey) : new StaticConversationSaver(), [conversationCacheKey]);

  return useMemo(() => ({
    converseSaver: _converseSaver,
    sendMessage: async (
      {
        systemPrompt,
        handleAiMessage,
        setMessages,
        setTempMessage,
        getNewestMessages,
        humanMessage,
        loading,
        token,
        conversationId,
        abortController,
        onFinish,
      }) => {
      const newestMessages = await getNewestMessages();
      /*先把用户消息显示到消息列表中*/
      setMessages([
        ...newestMessages,
        { status: 'local', message: humanMessage }
      ]);

      /*开启输入框的加载状态*/
      const closeLoading = loading();

      try {
        const tempMessageId = uuid();
        setTempMessage({ status: 'loading', message: { id: tempMessageId, content: '', role: 'assistant' } });

        const chain = new RemoteRunnable({
          url: langServeUrl.match(/^https?:\/\//) ? langServeUrl : pathJoin(env.baseURL, langServeUrl),
          options: { headers: { Authorization: `Bearer ${token}` }, },
          fetchRequestOptions: {
            signal: abortController.signal,
          }
        });
        let fullText = '';

        for await (const chunk of await chain.stream(
          {
            messages: [
              ...!!systemPrompt ? [{ role: 'system', content: systemPrompt }] : [],
              ...newestMessages.filter(i => i.message.role === 'user' || i.message.role === 'assistant').map(i => i.message),
              humanMessage
            ],
            /*attr1: 'abc'*/
          },
          /*{ configurable: { thread_id: conversationId } }*/
        )) {
          fullText += chunk;
          setTempMessage({ status: 'loading', message: { id: tempMessageId, content: fullText, role: 'assistant', } });
        }
        setMessages(prevMessages => [
          ...prevMessages,
          { status: 'success', message: { id: tempMessageId, content: fullText, role: 'assistant', } }
        ]);
        setTempMessage(null);
        await onFinish(fullText);
      } catch (e) {
        showError(e);
      } finally {
        closeLoading();
      }
    }
  }), [langServeUrl, _converseSaver]);
}
