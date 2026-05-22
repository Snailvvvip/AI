import {iChatbotBehavior} from "../Chatbot/chatbot.utils";
import {useChatbotLangServe} from "../ChatbotLangServe/useChatbotLangServe";
import {chatStream, iAiConfig} from "../../utils/chatStream";
import {showError} from "../../utils/showError";
import {uuid} from "@peryl/utils/uuid";
import {useMemo} from "react";

export function useChatbotStaticFront(
  {
    cacheKey, aiConfig,
  }: {
    cacheKey: string | false,
    aiConfig?: iAiConfig,
  }
): iChatbotBehavior {
  const _behavior = useChatbotLangServe({ cacheKey: cacheKey, langServeUrl: '' });
  return useMemo((): iChatbotBehavior => ({
    ..._behavior,
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
        await chatStream({
          abortController,
          messages: [
            ...!!systemPrompt ? [{ role: 'system', content: systemPrompt }] : [],
            ...newestMessages.filter(i => i.message.role === 'user' || i.message.role === 'assistant').map(i => i.message) as any,
            humanMessage
          ],
          aiConfig: aiConfig ?? {
            base_url: 'https://api.siliconflow.cn/v1/chat/completions',
            api_key: 'Bearer sk-cfdkoqcakgzptslbhdndlmmoqxagluwkojaktfnrvprmqkkl',
            model: 'Qwen/Qwen2.5-7B-Instruct',
          },
          onReceiving: ({ fullText }) => {
            setTempMessage({ status: 'loading', message: { id: tempMessageId, content: fullText, role: 'assistant', } });
          },
          onFinish: async (fullText) => {
            setMessages(prevMessages => [
              ...prevMessages,
              { status: 'success', message: { id: tempMessageId, content: fullText, role: 'assistant', } }
            ]);
            setTempMessage(null);
            await onFinish(fullText);
          },
        });
      } catch (e) {
        showError(e);
      } finally {
        closeLoading();
      }
    }
  }), [_behavior, aiConfig]);
}
