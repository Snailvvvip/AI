import {bindSaverMethods, iConversationSaver} from "./iConversationSaver";
import {http} from "../../utils/http";
import {convertGraphMessageToChatMessage, iChatBubbleMessage, iChatGraphState, iConversationRecord} from "../Chatbot/chatbot.utils";
import {doNothing} from "@peryl/utils/doNothing";

export class LangGraphConversationSaver implements iConversationSaver {

  constructor() {
    bindSaverMethods(this);
  }

  async generateConversationTitle(question: string): Promise<string> {
    const resp = await http.post<{ output: string }>('/doubao/invoke', {
      input: {
        messages: [
          { role: 'system', content: `给用户的问题生成一个不超过10个字的摘要文本` },
          { role: 'user', content: question }
        ]
      },
      config: {},
      kwargs: {},
    });
    return resp.data.output;
  }

  async insertConversation(param: { userId: string; conversationId: string; title: string }): Promise<iConversationRecord> {
    const resp = await http.post<{ result: iConversationRecord }>('/conversation/insert', { id: param.conversationId, title: param.title, created_by: param.userId });
    return resp.data.result;
  }

  async queryConversationList(param: { userId: string }): Promise<iConversationRecord[]> {
    const resp = await http.post<{ list: iConversationRecord[] }>('/conversation/list', { all: true, filters: { created_by: param.userId } });
    return resp.data.list;
  }

  async queryConversationMessages(param: { userId: string; conversationId: string }): Promise<{ messages: iChatBubbleMessage[]; interrupts: Record<string, any> | null }> {
    const resp = await http.get<iChatGraphState>(`/langgraph/chat_state/${param.conversationId}`);
    return {
      messages: resp.data.messages.map(convertGraphMessageToChatMessage),
      interrupts: resp.data.__interrupt__?.[0]?.value,
    };
  }

  async removeConversation(param: { userId: string; conversationId: string }): Promise<void | boolean> {
    await http.post(`/langgraph/chat_remove/${param.conversationId}`);
  }

  async saveConversationMessages(param: { userId: string; conversationId: string; messages: iChatBubbleMessage[]; interrupts: Record<string, any> | null }): Promise<void> {
    /*LangGraph会自动在后端工作流中将检查点数据，也就是对话历史存储到postgres中，这里不需要手动处理*/
    doNothing();
  }

}
