import {iChatbotBehavior, MsgType2Role} from "../../components/Chatbot/chatbot.utils";
import {RemoteRunnable} from "@langchain/core/runnables/remote";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";
import {notification} from "antd";
import {deepEqual} from "@peryl/utils/deepEqual";
import {showError} from "../../utils/showError";
import {useMemo} from "react";
import {LangGraphConversationSaver} from "../ChatConversationSaver/LangGraphConversationSaver";

export function useChatbotLangGraph(): iChatbotBehavior {
  return useMemo(() => ({
    converseSaver: new LangGraphConversationSaver(),
    /*
    * 调用LangGraph的接口来生成回答
    * 但是LangGraph的PostgreSaver会自动保存检查点的消息，所以调用的时候只需要将用户问题发过去即可，不需要发送完整的消息历史
    */
    sendMessage: async (
      {
        systemPrompt,
        handleAiMessage,
        setMessages,
        setTempMessage,
        setInterruptValue,
        getNewestMessages,
        getNewestTempMessage,
        humanMessage,
        loading,
        token,
        conversationId,
        abortController,
      }) => {
      /*先把用户消息显示到消息列表中*/
      setMessages([
        ...await getNewestMessages(),
        { status: 'local', message: humanMessage }
      ]);

      /*开启输入框的加载状态*/
      const closeLoading = loading();

      try {
        setTempMessage({ status: 'loading', message: { id: 'temp', content: '', role: 'assistant' } });

        const chain = new RemoteRunnable({
          url: pathJoin(env.baseURL, 'langgraph'),
          options: { headers: { Authorization: `Bearer ${token}` }, },
          fetchRequestOptions: {
            signal: abortController.signal,
          }
        });
        for await (const _chunk of await chain.stream(
          { messages: [humanMessage], attr1: 'abc', ...!!systemPrompt ? { system_prompt: systemPrompt } : {} },
          { configurable: { thread_id: conversationId } }
        )) {
          const chunk = _chunk as any;
          const target_chunk = chunk.choices[0].delta.content;

          console.log(chunk, target_chunk);

          /*
          * 后端返回的流式类型（stream_type）有三种类型（LangGraph）
          * messages：llm返回的消息
          * updates：节点执行结果，节点指的是llm，tool
          * interrupt：中断，工具中可能会触发中断消息
          */
          const stream_type = target_chunk.stream_type as 'messages' | 'updates' | 'interrupt';
          /*消息的id*/
          const msg_id = target_chunk.msg_id as string;
          /*
          * 消息的类型：AIMessageChunk，ai，human，tool
          * AIMessageChunk：流式返回的词token；
          * ai：大模型返回的完整消息
          * human：人类消息（这里后端不会返回人类消息）
          * tool：工具执行结果，也就是ToolMessage
          */
          const msg_type = target_chunk.msg_type as string;
          /*消息内容*/
          const msg_content = target_chunk.msg_content as string;
          /*工具调用参数*/
          const tool_calls = target_chunk.tool_calls as any;
          /*调用工具的名称，可能没有值*/
          const tool_name = target_chunk.tool_name as string | undefined;
          /*中断信息*/
          const interrupt = target_chunk.interrupt as any;

          const role = (MsgType2Role as any)[msg_type];
          if (!role) {notification.error({ message: `无法识别的msg_type:` + msg_type });}

          let newestTempMessage = await getNewestTempMessage();
          /*如果newestTempMessage的id是temp，视为没有值*/
          if (newestTempMessage?.message?.id === 'temp') {newestTempMessage = null;}

          const newestMessages = await getNewestMessages();

          if (stream_type === 'messages') {
            /*消息类型为流式输出的词，如果消息id与最新的tempMessage的id相同，则合并消息内容*/
            if (msg_id === newestTempMessage?.message.id) {
              setTempMessage({
                status: 'loading',
                message: {
                  ...newestTempMessage?.message,
                  id: msg_id,
                  content: newestTempMessage.message.content + msg_content, /*这里合并消息内容*/
                  role,
                }
              });
            } else {
              /*消息的id不同，将tempMessage加到messages中*/
              if (!!newestTempMessage) {setMessages([...newestMessages, { ...newestTempMessage, status: 'success' }]);}
              /*然后将流式返回的消息作为tempMessage显示*/
              setTempMessage({
                status: 'loading',
                message: {
                  id: msg_id,
                  content: msg_content,
                  role,
                }
              });
            }
          } else if (stream_type === 'interrupt') {
            /*处理中断消息*/
            setInterruptValue(interrupt);
          } else {
            /*处理节点执行类型的消息*/
            const newMessage = {
              id: msg_id,
              content: msg_content,
              role,
              tool_calls,
              tool_name,
            };
            if (!!newestTempMessage) {
              /*此时如果tempMessage存在*/
              if (newestTempMessage.message.id === msg_id) {
                /*节点执行的消息的id与tempMessage的id相同，则将tempMessage的status标记为success，表示tempMessage已经流式输出完毕*/
                if (!deepEqual(newestTempMessage.message, newMessage)) {
                  setTempMessage({ status: 'success', message: newMessage });
                }
              } else {
                /*节点执行的消息id与tempMessage的id不相同，则将tempMessage加到messages，并且将节点消息作为tempMessage显示，状态为success*/
                setMessages([...newestMessages, newestTempMessage]);
                setTempMessage({ status: 'success', message: newMessage });
              }
            } else {
              /*如果tempMessage不存在，则将节点消息作为tempMessage显示*/
              setTempMessage({ status: 'success', message: newMessage });
            }
            handleAiMessage?.(newMessage.content, humanMessage.content);
          }
        }

        /*历史调用结束之后（也就是for await结束），将tempMessage放到messages末尾，并且将tempMessage变量值清空*/
        setMessages([
          ...await getNewestMessages(),
          { ...(await getNewestTempMessage())!, status: 'success' }
        ]);
        setTempMessage(null);
      } catch (e) {
        showError(e);
      } finally {
        closeLoading();
      }
    },
  }), []);
}
