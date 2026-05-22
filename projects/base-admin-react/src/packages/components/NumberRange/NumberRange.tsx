import {Input, InputNumber, Space} from "antd";
import {useModelState} from "../../uses/useModelState";
import React, {useCallback} from "react";
import './number-range.scss';

export function NumberRange(
  props: {
    start?: number | null,
    end?: number | null,
    onUpdateStart?: (newValue?: number | null) => void,
    onUpdateEnd?: (newValue?: number | null) => void,
    hidden?: React.ReactNode,
  }
) {

  const [startModel, setStartModel] = useModelState(props.start, props.onUpdateStart);
  const [endModel, setEndModel] = useModelState(props.end, props.onUpdateEnd);

  const checkRange = useCallback(() => {
    let start = startModel;
    let end = endModel;
    let startNum = Number(start);
    let endNum = Number(end);
    if (start == null || end == null || isNaN(startNum) || isNaN(endNum)) {
      return;
    }
    if (startNum > endNum) {
      [startNum, endNum] = [endNum, startNum];
      setStartModel(startNum);
      setEndModel(endNum);
    }
  }, [startModel, setStartModel, endModel, setEndModel]);

  return (
    <Space.Compact className="number-range">
      <InputNumber value={startModel} onChange={setStartModel} onBlur={checkRange}/>
      <Input style={{ width: '1em', paddingLeft: '0', paddingRight: '0', textAlign: 'center' }} readOnly placeholder="~" allowClear={false} prefix={props.hidden}/>
      <InputNumber value={endModel} onChange={setEndModel} onBlur={checkRange}/>
    </Space.Compact>
  );
}
