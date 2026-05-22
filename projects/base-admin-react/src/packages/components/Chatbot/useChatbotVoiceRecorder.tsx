import {useVoiceRecognise} from "../../uses/useVoiceRecognise";
import {iChatbotInnerProps} from "./chatbot.utils";
import {useStableCallback} from "../../uses/useStableCallback";
import {iVoiceRecogniseParam} from "../../pages/interviewer/utils/createVoiceRecogniseSocket";
import {iChatbotState} from "./useChatbotState";
import {useEffect} from "react";
import {iChatbotRequest} from "./useChatbotRequest";

export function useChatbotVoiceRecorder(
  {
    props: { userId },
    chatbotState: { setInputValue, recording },
    chatbotRequest: { sendMessage }
  }: {
    props: iChatbotInnerProps,
    chatbotState: iChatbotState,
    chatbotRequest: iChatbotRequest,
  }) {

  const voice = useVoiceRecognise({
    userId: userId,
    onSpeechSentenceChange: useStableCallback<Exclude<iVoiceRecogniseParam['onSpeechSentenceChange'], null | undefined>>((sentences) => {
      setInputValue(sentences.join('\n'));
    }),
  });
  const { startRecording, stopRecording } = voice;

  useEffect(
    () => {
      if (recording) {
        startRecording();
      } else {
        stopRecording();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recording]
  );

  return voice;
}

export type iChatbotVoiceRecorder = ReturnType<typeof useChatbotVoiceRecorder>;
