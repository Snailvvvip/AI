import {defer} from "@peryl/utils/defer";

/**
 * 通过 useState 返回的set函数来获取最新的值
 * @date    2025-09-01 20:19
 */
export function getNewestValue<T>(setter: (fn: (val: T) => T) => void): Promise<T> {
  const dfd = defer<T>();
  setter((prevValue) => {
    dfd.resolve(prevValue);
    return prevValue;
  });
  return dfd.promise;
}
