import {useRef} from "react";

export function useWatchValueChange<T>(
  {
    value,
    onChange
  }: {
    value: T,
    onChange: (prevValue: T, nextValue: T) => void,
  }
) {
  const valueRef = useRef(value);
  if (valueRef.current !== value) {
    onChange(valueRef.current, value);
  }
}
