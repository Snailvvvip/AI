import {useEffect, useState} from "react";

export function useModelState<T>(propsValue: T, propsEmit?: (value: T) => void, config?: { onPropsValueChange?: (newPropsValue: T) => void }) {

  const [modelValue, setModelValue] = useState(propsValue);

  useEffect(() => {
      if (propsValue === modelValue) {return;}
      setModelValue(propsValue);
      config?.onPropsValueChange?.(propsValue);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [propsValue]
  );

  return [
    modelValue,
    (newValue: T) => {
      if (newValue === modelValue) {return;}
      setModelValue(newValue);
      propsEmit?.(newValue);
    }
  ] as const;
}
