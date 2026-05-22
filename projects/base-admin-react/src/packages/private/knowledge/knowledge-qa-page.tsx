import {useMemo, useState} from "react";
import {useQuery} from "../../uses/useQuery";
import {Chatbot} from "../../components/Chatbot/Chatbot";
import {Alert} from "antd";
import {iKnowledgeQaBotRecord} from "../../pages/knowledge/knowledge.utils";
import {useStrictMounted} from "../../uses/useStrictMounted";
import {http} from "../../utils/http";
import {showError} from "../../utils/showError";
import {iChatbotProps} from "../../components/Chatbot/chatbot.utils";
import {uuid} from "@peryl/utils/uuid";
import {RemoteRunnable} from "@langchain/core/runnables/remote";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";
import {TokenService} from "../../utils/TokenService";
import {iRecallStreamChunkData} from "../../pages/knowledge/knowledge-recall-page";
import {doNothing} from "@peryl/utils/doNothing";
import {PageSpin} from "../../components/PageSpin";

export default () => {
  // const userInfo = useContext(UserInfoContext)!;

  const qaId = useQuery().id;

  if (!qaId) {
    return <Alert message="缺少机器人编码参数" type="error"/>;
  }
  const [qaRecord, setQaRecord] = useState(null as null | iKnowledgeQaBotRecord);

  useStrictMounted(async () => {
    try {

      const qaBotRecord =
        await http.post<{ result: iKnowledgeQaBotRecord }>(
          '/general/knowledge_qa_bot/item',
          { id: qaId }
        )
          .then(resp => resp.data.result);

      setQaRecord(qaBotRecord);

    } catch (e) {
      showError(e);
    }
  });

  const chatbotMode = useMemo((): iChatbotProps['mode'] => {
    return {
      type: 'LangServe',
      cacheKey: 'knowledge-qa-page / ' + qaId,
    };
  }, [qaId]);

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
          onFinish
        }) => {
        try {
          /*先把用户消息显示到消息列表中*/
          let newestMessages = await getNewestMessages();
          newestMessages = [
            ...newestMessages,
            { status: 'local', message: humanMessage }
          ];
          setMessages(newestMessages);

          const tempMessageId = uuid();
          setTempMessage({ status: 'loading', message: { id: tempMessageId, content: '', role: 'assistant' } });
          const chain = new RemoteRunnable({
            url: pathJoin(env.baseURL, 'knowledge/qa'),
            options: { headers: { Authorization: `Bearer ${await TokenService.getToken()}` }, },
          });
          let fullText = '';
          for await (const _chunk of await chain.stream({
              qaId: qaId,
              question: humanMessage.content,
              messages: newestMessages.map(i => i.message),
            },
          )) {
            const chunk: iRecallStreamChunkData = _chunk as any;
            console.log(_chunk);
            if (chunk.type === "retrieve") {
              // const retrieve_data = JSON.parse(chunk.data);
              // console.log("retrieve_data", retrieve_data);
              // setRetrieveData(retrieve_data);
              doNothing();
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
        } catch (e) {
          showError(e);
        }
      },
    };
  }, [qaId]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {!qaRecord ? (
        <PageSpin/>
      ) : (
        <Chatbot
          style={{ height: '100%' }}
          mode={chatbotMode}
          behavior={chatbotBehavior}
          headerTitle={<div>✨ {qaRecord?.name ?? '...'}</div>}
        />
      )}
    </div>
  );
}
