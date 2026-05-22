import {Prompts, Welcome} from "@ant-design/x";
import React, {useMemo} from "react";
import {iChatCopilotStyles} from "./useChatCopilotStyles";
import {DEMO_CHAT_QUESTIONS, iChatCopilotProps} from "../ChatPublic/chat-public.utils";
import {iChatbotMessages} from "../Chatbot/useChatbotMessages";
import {iChatbotRequest} from "../Chatbot/useChatbotRequest";
import {ChatBubbleList} from "../Chatbot/ChatBubbleList";
import {iChatbotConversation} from "../Chatbot/useChatbotConversation";

export function useChatCopilotBody(
  {
    copilotStyle: { styles },
    chatbotMessages: { messages, onInterruptChange },
    chatbotRequest: { sendMessage },
    chatbotConversation: { conversationId },
    props: { fastQuestions: propsFastQuestions }
  }: {
    copilotStyle: iChatCopilotStyles,
    chatbotMessages: iChatbotMessages,
    chatbotRequest: iChatbotRequest,
    chatbotConversation: iChatbotConversation,
    props: iChatCopilotProps
  }
) {

  const fastQuestions: iChatCopilotProps['fastQuestions'] = propsFastQuestions === undefined ? DEMO_CHAT_QUESTIONS : propsFastQuestions;

  const messageListContent = useMemo(() => (
    <div className={styles.chatList}>
      {messages?.length && !!conversationId ? (
        /** 消息列表 */
        <ChatBubbleList
          messages={messages}
          conversationId={conversationId}
          onInterruptChange={onInterruptChange}
        />
      ) : (
        /** 没有消息时的 welcome */
        <>
          <Welcome
            style={{ borderTopLeftRadius: 12 }}
            variant="borderless"
            title="👋 欢迎使用智能系统助手"
            description="基于AntDesignX的AGI产品接口解决方案，打造更好的智能视觉~"
            className={styles.chatWelcome}
          />

          {!!fastQuestions?.length && (
            <Prompts
              vertical
              title="我可以提供如下帮助："
              items={fastQuestions.map((i) => ({ key: i, description: i }))}
              onItemClick={(info) => sendMessage(info?.data?.description as string)}
              style={{
                marginInline: 16,
              }}
              styles={{
                title: { fontSize: 14 },
              }}
            />
          )}
        </>
      )}
    </div>
  ), [
    fastQuestions,
    sendMessage,
    messages,
    styles.chatList,
    styles.chatWelcome,
    conversationId,
    onInterruptChange,
  ]);

  return {
    messageListContent,
  };
}

export type iChatCopilotBody = ReturnType<typeof useChatCopilotBody>;
