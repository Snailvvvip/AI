import {iEffects} from "@peryl/utils/createEffects";
import {doNothing} from "@peryl/utils/doNothing";

/**
 * 流式调用
 * @date    2025/5/20 19:27
 */
export const chatStream = async (
  {
    aiConfig,
    messages,
    onReceiving,
    onFinish,
    onThinking,
    onThinkEnd,
    onThinkStart,
    abortEffects,
    abortController: _abortController
  }: iAiChatStreamParameter
) => {

  const controller = _abortController ?? new AbortController();
  !!abortEffects && abortEffects.push(() => {controller.abort('abort stream.');});
  // 发送请求
  const response = await fetch(aiConfig.base_url, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json',
      "Authorization": aiConfig.api_key.startsWith('Bearer ') ? aiConfig.api_key : `Bearer ${aiConfig.api_key}`
    },
    body: JSON.stringify({
      "messages": messages,
      "model": aiConfig.model,
      stream: true, // 请求流式响应
    }),
    signal: controller.signal,
  });

  if (!response.ok || !response.body) {throw response;}

  // 创建一个解码器来处理UTF-8文本
  const decoder = new TextDecoder("utf-8");

  let isThinking = false;
  let thinkText = '';
  let fullText = '';

  // 读取响应流
  const reader = response.body.getReader();
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (done) {
      console.log('Chat stream done...');
      let message = fullText;
      if (message.slice(0, 7) === '```json' && message.slice(-3) === '```') {
        message = message.slice(7, -3).trim();
      }
      onReceiving({ fullText: fullText, chunkText: '' });
      onFinish?.(message);
    }
    if (!value?.length) {continue;}

    let currentThinking = false;

    let chunk = decoder.decode(value, { stream: true });
    const strList = chunk.split(/(^|\n)data:\s+/g).map(i => i.trim()).filter(i => !!i.length);

    let chunkText = '';
    let thinkChunkText = '';

    for (let item of strList) {
      if (item === '[DONE]') {
        doNothing();
      } else {
        const obj = JSON.parse(item.trim());
        const objChoiceDelta = obj.choices[0].delta;
        currentThinking = 'reasoning_content' in objChoiceDelta && objChoiceDelta.objChoiceDelta != null;
        let { content, reasoning_content } = objChoiceDelta;
        if (currentThinking) {
          thinkChunkText += reasoning_content ?? '';
        } else {
          chunkText += content ?? '';
        }
        if (!isThinking && currentThinking) {
          isThinking = true;
          thinkText += reasoning_content;
          onThinkStart?.();
          onThinking?.(thinkText);
        } else if (isThinking && !currentThinking) {
          isThinking = false;
          thinkText += reasoning_content;
          onThinkEnd?.();
          onThinking?.(thinkText);
        }
      }
    }

    if (isThinking) {
      thinkText += thinkChunkText;
      onThinking?.(thinkText);
    } else {
      fullText += chunkText;
      onReceiving({ fullText: fullText, chunkText: chunkText });
    }
  }

  return response;
};

export interface iAiConfig {
  base_url: string,
  api_key: string,
  model: string
}

export interface iAiChatStreamParameter {
  aiConfig: iAiConfig,
  messages: { role: 'user' | 'assistant' | 'system' | 'tool', content: string }[],
  onReceiving: (data: { fullText: string, chunkText: string }) => void,
  onFinish?: (fullText: string) => void,
  onThinking?: (thinkText: string) => void,
  onThinkStart?: () => void,
  onThinkEnd?: () => void,
  abortEffects?: iEffects,
  abortController?: AbortController,
}
