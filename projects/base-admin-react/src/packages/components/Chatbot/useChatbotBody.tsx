import {useMemo} from "react";
import {iChatbotStyles} from "./useChatbotStyles";
import {iChatbotMessages} from "./useChatbotMessages";
import {Button, Flex, Space} from "antd";
import {iChatbotRequest} from "./useChatbotRequest";
import {antdxRobot} from "./chatbot.utils";
import {iChatbotConversation} from "./useChatbotConversation";
import {Prompts, Welcome} from "@ant-design/x";
import {EllipsisOutlined, ShareAltOutlined} from "@ant-design/icons";
import {ExampleGuideList, ExampleTopicList} from "./ChatPageExamples";
import {ChatBubbleList} from "./ChatBubbleList";
import {PageSpin} from "../PageSpin";

export function useChatbotBody(
  {
    chatbotStyle: { styles },
    chatbotMessages: { isLoadingMessage, messages, onInterruptChange },
    chatbotConversation: { conversationId },
    chatbotRequest: { sendMessage },
  }: {
    chatbotStyle: iChatbotStyles,
    chatbotMessages: iChatbotMessages,
    chatbotRequest: iChatbotRequest,
    chatbotConversation: iChatbotConversation,
  }
) {

  const messageListContent = useMemo(() => (
    <div className={styles.chatList}>
      {isLoadingMessage && <div className={styles.chatLoading}><PageSpin/></div>}
      {messages?.length ? (
        /* 🌟 消息列表 */
        <ChatBubbleList
          messages={messages}
          conversationId={conversationId!}
          onInterruptChange={onInterruptChange}
        />
      ) : (
        <Space
          direction="vertical"
          size={16}
          style={{ paddingInline: 'calc(calc(100% - 700px) /2)' }}
          className={styles.placeholder}
        >
          <Welcome
            style={{ width: '700px' }}
            variant="borderless"
            icon={<img src={antdxRobot} alt="antdx-robot"/>}
            title="你好，我是智能报销管家"
            description="是基于@ant-design/x设计的AGI产品接口解决方案，打造更好的智能交互体验~"
            extra={
              <Space>
                <Button icon={<ShareAltOutlined/>}/>
                <Button icon={<EllipsisOutlined/>}/>
              </Space>
            }
          />
          <Flex gap={16} style={{ display: 'flex' }}>
            <Prompts
              style={{ flex: 3 }}
              items={[ExampleTopicList]}
              styles={{
                list: { height: '100%' },
                item: {
                  flex: 1,
                  backgroundImage: 'linear-gradient(123deg, #e5f4ff 0%, #efe7ff 100%)',
                  borderRadius: 12,
                  border: 'none',
                },
                subItem: { padding: 0, background: 'transparent' },
              }}
              onItemClick={(info) => {
                sendMessage(info.data.description as string);
              }}
              className={styles.chatPrompt}
            />

            <Prompts
              style={{ flex: 4 }}
              items={[ExampleGuideList]}
              styles={{
                item: {
                  flex: 1,
                  backgroundImage: 'linear-gradient(123deg, #e5f4ff 0%, #efe7ff 100%)',
                  borderRadius: 12,
                  border: 'none',
                },
                subItem: { background: '#ffffffa6' },
              }}
              onItemClick={(info) => {
                sendMessage(info.data.description as string);
              }}
              className={styles.chatPrompt}
            />
          </Flex>
        </Space>
      )}
    </div>
  ), [conversationId, isLoadingMessage, messages, onInterruptChange, sendMessage, styles]);

  return {
    messageListContent,
  };
}

export type iChatbotBody = ReturnType<typeof useChatbotBody>;
