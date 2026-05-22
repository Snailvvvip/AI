import {ChatMessageFooter, formatChatMessageContent, iChatBubbleMessage, Role2Avatar} from "./chatbot.utils";
import {ChatLoadingMsg} from "../ChatLoadingMsg";
import {ToolMessageRender} from "../ToolMessageRender";
import {ChatInterruptForm, iChatInterruptFormProps} from "./ChatInterruptForm";
import {Bubble} from "@ant-design/x";
import {createStyles} from "antd-style";
import {UserMessage} from "./UserMessage";
import {XMarkdown} from "@ant-design/x-markdown";

export const ChatBubbleList = (props: {
  messages: iChatBubbleMessage[],
  conversationId: string,
  onInterruptChange: iChatInterruptFormProps['handleChange'],
}) => {
  const { messages, conversationId, onInterruptChange } = props;
  const { styles } = useChatLoadingMessageStyles();
  return (
    <Bubble.List
      items={messages?.map((i) => ({
        ...i.message,
        content: formatChatMessageContent(i),
        loading: (typeof i.message.content === "string" && !i.message.content?.trim().length) && !i.message.tool_calls?.length,
        classNames: { content: i.status === 'loading' ? styles.loadingMessage : '', },
        typing: i.status === 'loading' ? { step: 3, interval: 20, suffix: ''/*<>💗</>*/ } : false,
        avatar: Role2Avatar[i.message.role]
      }))}
      style={{ height: '100%', paddingInline: 'calc(calc(100% - 700px) /2)' }}
      roles={{
        assistant: {
          placement: 'start',
          footer: (<ChatMessageFooter/>),
          messageRender: (content: string | null | undefined) => !content?.trim().length ? <ChatLoadingMsg/> : (<XMarkdown content={content}/>),
        },
        tool: {
          placement: 'start',
          footer: (<ChatMessageFooter/>),
          messageRender: (content: string | null | undefined) => <ToolMessageRender content={content}/>
        },
        user: {
          placement: 'end',
          messageRender: (content: any) => <UserMessage content={content}/>
        },
        interrupt: {
          placement: 'start',
          messageRender: (content: any) => {
            return (
              <ChatInterruptForm
                formCode={content.formCode}
                title={content.title}
                conversationId={conversationId!}
                handleChange={onInterruptChange}
              />
            );
          },
        }
      }}
    />
  );
};

const useChatLoadingMessageStyles = createStyles(({ token, css }) => {
  return {
    loadingMessage: css`
      background-image: linear-gradient(90deg, #ff6b23 0%, #af3cb8 31%, #53b6ff 89%);
      background-size: 100% 2px;
      background-repeat: no-repeat;
      background-position: bottom;
    `,
  };
});
