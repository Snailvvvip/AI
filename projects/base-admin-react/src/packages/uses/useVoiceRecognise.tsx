import {message} from "antd";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {uuid} from "@peryl/utils/uuid";
import {createVoiceRecogniseSocket, iVoiceRecogniseParam} from "../pages/interviewer/utils/createVoiceRecogniseSocket";
import {startVoiceRecord} from "../pages/interviewer/utils/startVoiceRecord";
import {getErrorMessage, showError} from "../utils/showError";
import {getNewestValue} from "./getNewestValue";
import Dayjs from "dayjs";
import {createEffects} from "@peryl/utils/createEffects";
import {useStableCallback} from "./useStableCallback";

/**
 * 语音识别hook函数
 * @date    2025-11-13 18:10
 */
export function useVoiceRecognise(param: iVoiceRecogniseParam) {

  const onLastSpeechSentenceChangeStableFn = useStableCallback(param.onLastSpeechSentenceChange);
  const onSpeechSentenceChangeRefStableFn = useStableCallback(param.onSpeechSentenceChange);

  /*完整的，识别出来的所有句子*/
  const [_voiceRecogniseRecordList, setVoiceRecogniseRecordList] = useState([] as iVoiceRecogniseRecord[]);
  /*每次开始音频识别都会分为好多个句子，这个当前正在说话的句子，说完之后的句子会被移动到list末尾，并且清理掉last*/
  const [lastVoiceRecogniseRecord, setLastVoiceRecogniseRecord] = useState(null as iVoiceRecogniseRecord | null);

  /*所有的句子*/
  const voiceRecogniseRecordList = useMemo(() => {
    return !lastVoiceRecogniseRecord ? _voiceRecogniseRecordList : [..._voiceRecogniseRecordList, lastVoiceRecogniseRecord];
  }, [_voiceRecogniseRecordList, lastVoiceRecogniseRecord]);

  /*当前是否正在说话，用来标记是否显示最后说的内容*/
  const [speechSentence, _setSpeechSentence] = useState(null as null | string);
  const [{ effects: speechSentenceEffects }] = useState(() => createEffects()); // 用于清理延迟定时器

  /*当speechSentence变化时触发onLastSpeechSentenceChange*/
  useEffect(() => {
    onLastSpeechSentenceChangeStableFn(speechSentence);
  }, [speechSentence, onLastSpeechSentenceChangeStableFn]);

  /*当voiceRecogniseRecordList变化时触发onSpeechSentenceChange*/
  useEffect(() => {
    onSpeechSentenceChangeRefStableFn(voiceRecogniseRecordList.map(i => i.content));
  }, [voiceRecogniseRecordList, onSpeechSentenceChangeRefStableFn]);

  /*设置显示文本*/
  const setSpeechSentence = useCallback((speechSentence: string | null) => {
    speechSentenceEffects.clear();
    _setSpeechSentence(speechSentence);
    const timer = setTimeout(() => {_setSpeechSentence(null);}, 2000);
    speechSentenceEffects.push(() => clearTimeout(timer));
  }, [speechSentenceEffects]);

  const [voiceRecogniseSocket] = useState(() => {
    const messageKey = uuid();
    const { send, close } = createVoiceRecogniseSocket({
      userId: param.userId,
      onMessage: async (event) => {
        param.onMessage?.(event);
        console.log(`[${Dayjs().format('HH:mm:ss')}] receive message: `, event.data);
      },
      onCreated: async (ws) => {
        param.onCreated?.(ws);
        message.info({ content: '开始连接websocket', key: messageKey });
      },
      onOpen: async (ws) => {
        param.onOpen?.(ws);
        message.success(`Websocket 连接成功`);
        message.destroy(messageKey);
      },
      onError: async (e) => {
        param.onError?.(e);
        message.destroy(messageKey);
      },

      onSpeechStarted: (item_id) => {
        param.onSpeechStarted?.(item_id);
        console.log(`[${item_id}] 开始说话`);
      },
      onSpeechContent: async (item_id, content) => {
        param.onSpeechContent?.(item_id, content);
        console.log(`[${item_id}] 正在说话：`, content);
        const newestLastVoiceRecogniseRecord = await getNewestValue(setLastVoiceRecogniseRecord);

        /*合并旧的句子以及新识别出来的句子*/
        const speechContent = !newestLastVoiceRecogniseRecord ? content : mergeSentences(newestLastVoiceRecogniseRecord.content, content);
        setSpeechSentence(speechContent);

        if (newestLastVoiceRecogniseRecord?.id === item_id) {
          /*如果说话时的item_id与最后识别的id相同，则直接更新*/
          setLastVoiceRecogniseRecord(prev => ({ ...prev!, content: speechContent }));
        } else {
          /*否则如果不相同的话，就将last添加到list末尾，并且将last更新为新的id对应的record*/
          if (!!newestLastVoiceRecogniseRecord) {
            /*按理说不会走到这个逻辑分支中，因为在onSpeechComplete中，会在讲话结束之后讲last放到list末尾，并且清理掉last*/
            setVoiceRecogniseRecordList(prevList => [...prevList, newestLastVoiceRecogniseRecord]);
          }
          setLastVoiceRecogniseRecord({ id: item_id, content: speechContent });
        }
      },
      onSpeechStoped: (item_id) => {
        param.onSpeechStoped?.(item_id);
        console.log(`[${item_id}] 停止说话`);
      },
      onSpeechCompleted: async (item_id, content) => {
        param.onSpeechCompleted?.(item_id, content);
        console.log(`[${item_id}] 完整内容：`, content);

        const newestLastVoiceRecogniseRecord = await getNewestValue(setLastVoiceRecogniseRecord);
        if (!!newestLastVoiceRecogniseRecord && newestLastVoiceRecogniseRecord.id === item_id) {
          newestLastVoiceRecogniseRecord.content = content;
        }
        if (!!newestLastVoiceRecogniseRecord) {
          setVoiceRecogniseRecordList(prevList => [...prevList, newestLastVoiceRecogniseRecord]);
          setLastVoiceRecogniseRecord(null);
        }

        setSpeechSentence(content);
      },
    });
    return { send, close };
  });

  const [_stopRecord, setStopRecord] = useState<null | (() => void)>(null);

  const isRecording = useMemo(() => !!_stopRecord, [_stopRecord]);

  /*开始录音*/
  const startRecording = useStableCallback(async () => {
    if (isRecording) {
      console.log('已经在录音中...');
      return;
    }
    setLastVoiceRecogniseRecord(null);
    setVoiceRecogniseRecordList([]);
    try {
      const _stopRecord = await startVoiceRecord({
        onRecordStart: () => {
          setStopRecord(() => _stopRecord);
          message.info("录音开始");
        },
        onRecordStop: () => {
          setStopRecord(() => null);
          message.info("录音结束");
        },
        onRecording: (pcmData) => {
          voiceRecogniseSocket.send(pcmData);
        },
      });
    } catch (err) {
      showError('录音启动失败:' + getErrorMessage(err));
      setStopRecord(() => null);
    }
  });
  /*结束录音*/
  const stopRecording = useStableCallback(async () => {
    _stopRecord?.();
    setStopRecord(null);
    await voiceRecogniseSocket.close();
  });

  // 在组件卸载时确保清理资源
  React.useEffect(() => {
    return () => {
      stopRecording();
      speechSentenceEffects.clear();
    };
  }, [stopRecording, speechSentenceEffects]);

  return {
    voiceRecogniseSocket,
    startRecording,
    isRecording,
    stopRecording,
    voiceRecogniseRecordList,
    lastVoiceRecogniseRecord,
    speechSentence,
    setSpeechSentence,
  };
}

export interface iVoiceRecogniseRecord {
  id: string,
  content: string
}

function mergeSentences(sentence1: string, sentence2: string): string {
  // 找出两个句子中最长的公共后缀与前缀重叠部分
  let maxOverlap = 0;
  // 最大可能的重叠长度是较短句子的长度
  const maxPossible = Math.min(sentence1.length, sentence2.length);

  // 从最大可能长度开始检查，找到最长重叠
  for (let i = maxPossible; i > 0; i--) {
    // 取第一句的最后i个字符和第二句的前i个字符比较
    if (sentence1.slice(-i) === sentence2.slice(0, i)) {
      maxOverlap = i;
      break;
    }
  }

  // 合并句子：第一句 + 第二句去除重叠部分的剩余内容
  return sentence1 + sentence2.slice(maxOverlap);
}
