import {useMemo, useState} from "react";
import {createStyles} from "antd-style";
import {Alert, Card, Table} from "antd";
import {ColInput} from "../../components/Columns";
import {iChatbotProps} from "../../components/Chatbot/chatbot.utils";
import {RemoteRunnable} from "@langchain/core/runnables/remote";
import {uuid} from "@peryl/utils/uuid";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";
import {TokenService} from "../../utils/TokenService";
import {useQuery} from "../../uses/useQuery";
import {iKnowledgeBaseRecord} from "./knowledge.utils";
import {useStrictMounted} from "../../uses/useStrictMounted";
import {showError} from "../../utils/showError";
import {http} from "../../utils/http";
import {ChatCopilot} from "../../components/ChatCopilot/ChatCopilot";


export default function () {

  const pageParam = useQuery();
  const kb_code = pageParam.kb_code;

  if (!kb_code) {
    return <Alert message="缺少知识库编码参数" type="error"/>;
  }

  const [kbRecord, setKbRecord] = useState(null as null | iKnowledgeBaseRecord);

  useStrictMounted(async () => {
    try {
      const resp = await http.post<{ result: iKnowledgeBaseRecord }>('/knowledge_base/item', { code: kb_code });
      setKbRecord(resp.data.result);
    } catch (e) {
      showError(e);
    }
  });

  const { styles: workAreaStyles } = useWorkAreaStyle();

  const [retrieveData, setRetrieveData] = useState(null as null | iMilvusSearchResponse);

  const chatbotMode = useMemo((): iChatbotProps['mode'] => {
    return {
      type: 'StaticFront',
      cacheKey: false,
    };
  }, []);

  const chatbotBehavior = useMemo((): Partial<iChatbotProps['behavior']> => {
    return {
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

        const tempMessageId = uuid();
        setTempMessage({ status: 'loading', message: { id: tempMessageId, content: '', role: 'assistant' } });
        const chain = new RemoteRunnable({
          url: pathJoin(env.baseURL, 'knowledge/recall'),
          options: { headers: { Authorization: `Bearer ${await TokenService.getToken()}` }, },
        });
        let fullText = '';
        for await (const _chunk of await chain.stream({ kb_code, question: humanMessage.content },)) {
          const chunk: iRecallStreamChunkData = _chunk as any;
          console.log(_chunk);
          if (chunk.type === "retrieve") {
            const retrieve_data = JSON.parse(chunk.data);
            console.log("retrieve_data", retrieve_data);
            setRetrieveData(retrieve_data);
          } else {
            fullText += chunk.data;
            setTempMessage({ status: 'loading', message: { id: tempMessageId, content: fullText, role: 'assistant', } });
          }
        }
        setMessages(prevMessages => [
          ...prevMessages,
          { status: 'success', message: { id: tempMessageId, content: fullText, role: 'assistant', } }
        ]);
        setTempMessage(null);
        await onFinish(fullText);
      },
    };
  }, [kb_code]);

  return (
    <div className={workAreaStyles.copilotWrapper}>
      <div style={{
        flex: 1,
        overflow: 'auto',
        position: 'relative',
        padding: '1em',
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(0, 0, 0, 0.45) transparent",
      }}>
        {!!retrieveData && <>
          <Card title="召回回复内容" style={{ marginBottom: '1em' }}>
            {retrieveData.answer}
          </Card>
          <Card title="召回文档列表">
            <Table
              rowKey="id"
              dataSource={retrieveData.nodes ?? []}
              pagination={false}
              columns={[
                ColInput("所属文件名", ["metadata", "name"]),
                ColInput("文档内容", "text"),
                ColInput("相似度分数", "score"),
              ]}
            />
          </Card>
        </>}
      </div>
      <div className={workAreaStyles.chatCopilot}>
        <ChatCopilot
          mode={chatbotMode}
          behavior={chatbotBehavior}
          headerTitle={<div>✨ 召回测试{!!kbRecord?.name ? ` - ${kbRecord.name}` : ''}</div>}
        />
      </div>
    </div>
  );
};

export type iRecallStreamChunkData = {
  type: "message",
  data: string
} | {
  type: "retrieve",
  data: string
}

interface iMilvusSearchNode {
  text: string,
  metadata: Record<string, any>,
  score: number,
}

interface iMilvusSearchResponse {
  answer: string,
  nodes: iMilvusSearchNode[],
}

const useWorkAreaStyle = createStyles(({ token, css }) => {
  return {
    copilotWrapper: css`
      min-width: 1000px;
      height: calc(100vh - var(--app-header-szie));
      display: flex;
    `,
    workarea: css`
      flex: 1;
      background: ${token.colorBgLayout};
      display: flex;
      flex-direction: column;
    `,
    workareaHeader: css`
      box-sizing: border-box;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 48px 0 28px;
      border-bottom: 1px solid ${token.colorBorder};
    `,
    headerTitle: css`
      font-weight: 600;
      font-size: 15px;
      color: ${token.colorText};
      display: flex;
      align-items: center;
      gap: 8px;
    `,
    headerButton: css`
      background-image: linear-gradient(78deg, #8054f2 7%, #3895da 95%);
      border-radius: 12px;
      height: 24px;
      width: 93px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.3s;

      &:hover {
        opacity: 0.8;
      }
    `,
    workareaBody: css`
      flex: 1;
      padding: 16px;
      background: ${token.colorBgContainer};
      border-radius: 16px;
      min-height: 0;
    `,
    bodyContent: css`
      overflow: auto;
      height: 100%;
      padding-right: 10px;
    `,
    bodyText: css`
      color: ${token.colorText};
      padding: 8px;
    `,
    chatCopilot: css`
      width: 400px;
    `
  };
});
