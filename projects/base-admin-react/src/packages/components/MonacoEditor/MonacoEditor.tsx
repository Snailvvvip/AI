import './MonacoEditor.scss';
import {useEffect, useRef, useState} from "react";
import {classnames} from "antd-style/es/utils";
import {useModelState} from "../../uses/useModelState";
import {useStrictMounted} from "../../uses/useStrictMounted";
import {MonacoLoader} from './monaco.utils';
import {createEffects} from "@peryl/utils/createEffects";
import {PageSpin} from "../PageSpin";

export const MonacoEditor = (
  props: {
    value?: string,
    language: 'javascript' | 'css' | 'html' | 'json' | 'typescript',
    theme?: 'vs' | 'vs-dark' | 'hc-black',
    fullHeight?: boolean,
    readonly?: boolean,

    onChange?: (value?: string) => void,
    onKeydown?: (e: any) => void,
  }
) => {

  const elRef = useRef<null | HTMLDivElement>(null);

  const monacoInstanceRef = useRef(null as null | Record<string, any>);

  const [modelValue, updateModelValue] = useModelState(props.value, props.onChange, {
    onPropsValueChange: val => {
      !!monacoInstanceRef.current && monacoInstanceRef.current.setValue(val || '');
    }
  });

  const [isReady, setReady] = useState(false);

  const [{ effects }] = useState(() => createEffects());

  useStrictMounted(async () => {
    const monaco = await MonacoLoader.getMonaco(/*props.publicPath*/);

    setReady(true);

    monacoInstanceRef.current = monaco.editor.create(elRef.current!, {
      value: modelValue,
      language: props.language,
      theme: props.theme ?? 'cs',
      fontSize: '14px',
      fontFamily: 'unset',
      readOnly: props.readonly,
    });

    monacoInstanceRef.current!.onDidChangeModelContent(() => {
      updateModelValue(monacoInstanceRef.current!.getValue());
    });

    !!props.onKeydown && monacoInstanceRef.current!.onKeyDown(props.onKeydown);
    effects.push(() => {monacoInstanceRef.current!.dispose();});

  });

  useEffect(() => {
    return () => {
      effects.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classnames([
      'mlf-monaco-editor',
      { 'monaco-editor-full-height': props.fullHeight }
    ])}>
      {!isReady && (
        <PageSpin/>
      )}
      <div ref={elRef} className="monaco-editor-ele"/>
    </div>
  );

};
