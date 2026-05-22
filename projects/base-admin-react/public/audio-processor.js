class AudioDataProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0 && input[0].length > 0) {
      // 获取左声道数据
      const inputData = input[0];
      // 将 Float32Array 数据发送到主线程
      this.port.postMessage(inputData);
    }
    // 返回 true 表示继续处理
    return true;
  }
}

registerProcessor('audio-data-processor', AudioDataProcessor);
