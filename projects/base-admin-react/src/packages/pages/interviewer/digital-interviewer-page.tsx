import {Button, Card, message, Segmented, Space} from "antd";
import video_01_mute from './videos/interviewer01_mute.mp4';
import video_01_sound from './videos/interviewer01_sound.mp4';
import React, {useContext, useMemo, useRef, useState} from "react";
import {DigitalVideo, DigitalVideoInstance} from "./DigitalVideo";
import {SegmentedOptions} from "antd/es/segmented";
import AudioOutlined from '@ant-design/icons/AudioOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';
import {UserInfoContext} from "../user/user.utils";
import {useVoiceRecognise} from "../../uses/useVoiceRecognise";
import {useStableCallback} from "../../uses/useStableCallback";
import {http} from "../../utils/http";
import {useLoadingState} from "../../uses/useLoadingState";
import {showError} from "../../utils/showError";
import {iFileRecord} from "../file/file.utils";
import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../../env/env";

export default () => {

  const userInfo = useContext(UserInfoContext)!;

  const muteVideo = useRef(null as null | DigitalVideoInstance);
  const soundVideo = useRef(null as null | DigitalVideoInstance);

  const segmentOptions = useMemo((): SegmentedOptions => [
    { label: '说话', value: 'say' },
    { label: '聆听', value: 'listen' },
    { label: '停止', value: 'stop' },
  ], []);

  const [segmentVal, setSegmentVal] = useState('stop');

  const {
    isRecording,
    startRecording,
    stopRecording,
    voiceRecogniseRecordList,
    speechSentence,
  } = useVoiceRecognise({ userId: userInfo.id });

  return (
    <div style={{ padding: '1em' }}>
      <Space direction="vertical" style={{ display: 'flex' }}>
        <Card>
          {/*<Space>
          <Button type="primary">
            <PlayCircleOutlined/>
            <span>播放</span>
          </Button>
          <Button>
            <StopOutlined/>
            <span>暂停</span>
          </Button>
        </Space>*/}
          <Segmented
            options={segmentOptions}
            value={segmentVal}
            onChange={(val: any) => setSegmentVal(val)}
          />
          {/*segmentVal::{JSON.stringify(segmentVal)}*/}
        </Card>
        <Card>
          <DigitalVideo
            src={video_01_sound}
            ref={soundVideo}
            muted
            style={{
              border: 'solid 2px blue',
              width: '500px',
              ...segmentVal !== 'say' ? { display: 'none' } : {}
            }}
            tag="有声视频"
            play={segmentVal === 'say'}
          />
          <DigitalVideo
            src={video_01_mute}
            ref={muteVideo}
            muted
            style={{
              border: 'solid 2px red',
              width: '500px',
              ...segmentVal !== 'say' ? {} : { display: 'none' }
            }}
            tag="无声视频"
            play={segmentVal === 'listen'}
          />
        </Card>
        <Card>
          <p>
            不同类型的经典小说里，有很多直击人心、流传甚广的语句，涵盖对生命、爱情、命运、社会等多方面的思考，以下按国内外小说分类整理，方便你品读：
          </p>
          <Space.Compact>
            <Button onClick={startRecording} type="primary" disabled={isRecording}>
              <AudioOutlined/>
              <span>开始录音</span>
            </Button>
            <Button onClick={stopRecording} disabled={!isRecording}>
              <StopOutlined/>
              <span>停止录音</span>
            </Button>
          </Space.Compact>
          {isRecording && (
            <table>
              <tbody>
              <tr>
                <td>当前句子：</td>
                <td>{speechSentence}</td>
              </tr>
              <tr>
                <td>完整句子：</td>
                <td>
                  <ol>
                    {voiceRecogniseRecordList.map((item) => (
                      <li key={item.id}>{item.content}</li>
                    ))}
                  </ol>
                </td>
              </tr>
              </tbody>
            </table>
          )}
        </Card>
        <DemoVoiceGenerate/>
      </Space>
    </div>
  );
}

export const DemoVoiceGenerate = () => {

  const { loading, isLoading } = useLoadingState();

  function playAudio(url: string) {
    const audio = new Audio(url);

    // 监听播放事件
    audio.addEventListener('play', () => {
      message.info('音频开始播放');
    });

    // 监听结束事件
    audio.addEventListener('ended', () => {
      message.info('音频播放完毕');
    });

    // 播放音频
    audio.play().catch(error => {
      message.info('播放失败:', error);
    });
  }

  const generateVoice = useStableCallback(async () => {
    const closeLoading = loading();
    try {
      const resp = await http.post<{ result: iFileRecord }>('/voice_generate', {
        text: "由于无法确定其他文明的善意或恶意，文明之间会陷入持续的相互猜疑"
      });
      console.log(pathJoin(env.assetsPrefix, resp.data.result.path));
      playAudio(pathJoin(env.assetsPrefix, resp.data.result.path));
    } catch (e) {
      showError(e);
    } finally {
      closeLoading();
    }
  });

  return (
    <Card title="语音生成">
      <Button onClick={generateVoice} type="primary" loading={isLoading}>生成语音</Button>
    </Card>
  );

};
