import {iChatbotStyles} from "./useChatbotStyles";
import {antdxLogo, iChatbotProps} from "./chatbot.utils";
import {iChatbotConversation} from "./useChatbotConversation";
import {Avatar, Button, message} from "antd";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import {Conversations} from "@ant-design/x";
import {iChatbotState} from "./useChatbotState";
import EditOutlined from "@ant-design/icons/EditOutlined";
import {DeleteOutlined, QuestionCircleOutlined} from "@ant-design/icons";
import {useMemo} from "react";

export function useChatbotSide(
  {
    chatbotStyle: { styles },
    chatbotConversation: {
      createConversation,
      conversationItems,
      conversationId,
      setConversationId,
      removeConversation,
    },
    chatbotState: {
      isLoading,
    },
    props: { headerTitle }
  }: {
    chatbotStyle: iChatbotStyles,
    chatbotConversation: iChatbotConversation,
    chatbotState: iChatbotState,
    props: iChatbotProps,
  }
) {
  const sideContent = useMemo(() => (
    <div className={styles.sider}>
      {/* 🌟 Logo */}
      <div className={styles.logo}>
        <img
          src={antdxLogo}
          draggable={false}
          alt="logo"
          width={24}
          height={24}
        />
        {headerTitle ?? <span>智能报销管家</span>}
      </div>

      {/* 🌟 添加会话 */}
      <Button
        onClick={createConversation}
        type="link"
        className={styles.addBtn}
        icon={<PlusOutlined/>}>
        <span>新建会话</span>
      </Button>

      {/* 🌟 会话管理 */}
      <Conversations
        items={conversationItems}
        className={styles.conversations}
        activeKey={conversationId}
        onActiveChange={async (val) => {
          if (isLoading) {
            message.warning("请等待会话结束或者手动停止会话！");
            return;
          }
          setConversationId(val);
        }}
        groupable
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.15) transparent"
        }}
        styles={{ item: { padding: '0 8px' }, }}
        menu={(conversation) => ({
          items: [
            {
              label: '重命名',
              key: 'rename',
              icon: <EditOutlined/>,
            },
            {
              label: '删除',
              key: 'delete',
              icon: <DeleteOutlined/>,
              danger: true,
              onClick: () => {removeConversation(conversation.id!);},
            },
          ],
        })}
      />

      <div className={styles.siderFooter}>
        <Avatar size={24}/>
        <Button type="text" icon={<QuestionCircleOutlined/>}/>
      </div>
    </div>
  ), [
    conversationId,
    conversationItems,
    createConversation,
    removeConversation,
    setConversationId,
    styles,
    isLoading,
    headerTitle,
  ]);

  return {
    sideContent,
  };
}

export type iChatbotSide = ReturnType<typeof useChatbotSide>;
