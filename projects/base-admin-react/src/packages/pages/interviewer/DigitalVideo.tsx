import React, {CSSProperties, MutableRefObject, useEffect, useImperativeHandle, useMemo, useRef} from "react";
import {useStrictMounted} from "../../uses/useStrictMounted";
import './digital-video.scss';

export const DigitalVideo = React.forwardRef<DigitalVideoInstance, DigitalVideoProps>((props, ref) => {
  const propsMuted = useMemo(() => props.muted ?? true, [props.muted]);
  const propsDisablePictureInPicture = useMemo(() => props.disablePictureInPicture ?? true, [props.disablePictureInPicture]);
  const propsLoop = useMemo(() => props.loop ?? true, [props.loop]);

  const videoRef = useRef(null as null | HTMLVideoElement);

  useImperativeHandle(ref, () => ({ videoRef }));

  useStrictMounted(() => {
    if (!videoRef.current) {return;}
    videoRef.current.volume = 0;
  });

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {return;}
    if (props.play) {
      videoElement.play();
      console.log('play', props.tag);
    } else {
      videoElement.currentTime = 0;
      videoElement.pause();
      console.log('pause', props.tag);
    }
  }, [props.play, props.tag]);

  return (
    <div className="digital-video" style={props.style}>
      <video
        src={props.src}
        ref={videoRef}
        muted={propsMuted}
        disablePictureInPicture={propsDisablePictureInPicture}
        loop={propsLoop}
      />
      <div className="digital-video-status-bar">
        {props.tag ? `${props.tag} / ` : ''}
        {props.play ? '播放中' : '已暂停'}
      </div>
    </div>
  );
});

export interface DigitalVideoProps {
  src: string;
  muted?: boolean;
  style?: CSSProperties,
  play?: boolean,
  tag?: string,
  disablePictureInPicture?: boolean,
  loop?: boolean,
}

export interface DigitalVideoInstance {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
}
