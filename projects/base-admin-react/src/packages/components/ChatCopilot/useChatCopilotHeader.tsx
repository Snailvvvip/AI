import {Button, message, Popover, Space, Tooltip} from "antd";
import {CloseOutlined, CommentOutlined, PlusOutlined} from "@ant-design/icons";
import {Conversations} from "@ant-design/x";
import React, {useMemo} from "react";
import {iChatCopilotStyles} from "./useChatCopilotStyles";
import {iChatCopilotProps} from "../ChatPublic/chat-public.utils";
import {iChatbotState} from "../Chatbot/useChatbotState";
import {iChatbotConversation} from "../Chatbot/useChatbotConversation";
import {useStableCallback} from "../../uses/useStableCallback";

export function useChatCopilotHeader(
  {
    copilotStyle: { styles },
    chatbotState: { isLoading },
    chatbotConversation: { setConversationId, conversations, conversationId },
    props: { handleClose, headerTitle },
  }: {
    copilotStyle: iChatCopilotStyles,
    chatbotState: iChatbotState,
    chatbotConversation: iChatbotConversation,
    props: iChatCopilotProps,
  }
) {

  /*处理会话变化的动作*/
  const onConversationChange = useStableCallback(async (val: string) => {
    if (isLoading) {
      message.warning("请等待会话结束或者手动停止会话！");
      return;
    }
    setConversationId(val);
  });

  const chatHeaderContent = useMemo(() => {
    return (
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>{headerTitle ?? '✨ 智能系统助手'}</div>
        <Space size={0}>
          <Tooltip title="新建会话">
            <Button
              type="text"
              icon={<PlusOutlined/>}
              onClick={() => message.warning("即将上线...")}
              className={styles.headerButton}
            />
          </Tooltip>
          <Popover
            placement="bottom"
            styles={{ body: { padding: 0, maxHeight: 600 } }}
            content={
              <Conversations
                items={conversations?.map((i) =>
                  ({ label: `[current] ${i.title}`, key: i.id! })
                )}
                activeKey={conversationId}
                groupable
                onActiveChange={onConversationChange}
                styles={{ item: { padding: '0 8px' } }}
                className={styles.conversations}
              />
            }
          >
            <Button type="text" icon={<CommentOutlined/>} className={styles.headerButton}/>
          </Popover>
          <Button
            type="text"
            icon={<CloseOutlined/>}
            onClick={() => handleClose?.()}
            className={styles.headerButton}
          />
        </Space>
      </div>
    );
  }, [
    conversationId,
    onConversationChange,
    handleClose,
    conversations,
    styles.chatHeader,
    styles.conversations,
    styles.headerButton,
    styles.headerTitle,
    headerTitle,
  ]);

  return { chatHeaderContent };
}

export type iChatCopilotHeader = ReturnType<typeof useChatCopilotHeader>
