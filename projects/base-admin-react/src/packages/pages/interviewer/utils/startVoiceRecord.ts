import {pathJoin} from "@peryl/utils/pathJoin";
import {getErrorMessage} from "../../../utils/showError";
import {floatTo16BitPCM} from "./floatTo16BitPCM";
import {createEffects} from "@peryl/utils/createEffects";

/**
 * 录音工具函数
 * 返回值为一个副作用函数，执行函数可以停止录音以及清理各种录音产生的对象
 */
export const startVoiceRecord = async (
  { onRecording, onRecordStop, onRecordStart }: {
    onRecordStart?: () => void,
    onRecordStop?: () => void,
    onRecording: (pcmData: Int16Array) => void,
  }
) => {
  const { effects } = createEffects();

  // 获取麦克风权限并创建音频流
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  console.log("create media stream", mediaStream);
  effects.push(() => {
    mediaStream.getTracks().forEach(track => track.stop());
    console.log("clear media stream", mediaStream);
  });

  // 创建 AudioContext
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  console.log('create audio context');
  effects.push(() => {
    audioContext.close();
    console.log('clear audio context');
  });

  // 将处理器脚本添加到 AudioWorklet
  // 注意：'./audio-processor.js' 需要放在 public 目录下或者可以被正确解析的路径
  try {
    await audioContext.audioWorklet.addModule(pathJoin(__webpack_public_path__, "audio-processor.js"));
  } catch (e) {
    throw new Error(`加载audio-processor.js失败，请检查：` + getErrorMessage(e));
  }

  // 创建 MediaStreamSource
  const mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);

  // 创建 AudioWorkletNode
  const workletNode = new AudioWorkletNode(audioContext, 'audio-data-processor');
  console.log('create audio worklet node');
  effects.push(() => {
    workletNode.disconnect();
    workletNode.port.onmessage = null; // 清除事件监听器
    console.log('clear audio worklet node');
  });

  // 监听来自 AudioWorkletProcessor 的消息
  workletNode.port.onmessage = (event) => {
    const inputData: Float32Array = event.data;
    // 将Float32Array转换为PCM数据
    const pcmData = floatTo16BitPCM(inputData);
    // 发送到后端 这里连接到你的后端WebSocket服务
    // console.log("sendAudioData pcmData length:", pcmData.length);
    onRecording(pcmData);
  };

  // 连接节点
  mediaStreamSource.connect(workletNode);
  workletNode.connect(audioContext.destination); // 可选：连接到输出以监听

  onRecordStart?.();
  effects.push(() => {onRecordStop?.();});

  const stopRecord = () => effects.clear();

  return stopRecord;
};
