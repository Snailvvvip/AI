import {useCallback, useState} from "react";

export function useCacheState<T>(
  {
    initialValue,
    cacheKey,
    jsonConvert,
  }: {
    initialValue: T,
    cacheKey: string,
    jsonConvert?: boolean,
  }
) {

  const [val, _setVal] = useState(() => {
    const cacheString = localStorage.getItem(cacheKey);
    try {
      const cacheValue = jsonConvert ? JSON.parse(cacheString ?? "") : cacheString;
      return cacheValue ?? initialValue;
    } catch (e) {
      console.error(e);
      return initialValue;
    }
  });

  const setVal = useCallback((newValue: T) => {
    localStorage.setItem(cacheKey, jsonConvert ? JSON.stringify(newValue) : String(newValue));
    _setVal(newValue);
  }, [cacheKey, jsonConvert]);

  return [val, setVal];
}
