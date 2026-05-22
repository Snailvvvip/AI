import {useCallback, useRef} from "react";

export function useStableCallback<FN extends ((...args: any) => any)>(fn: FN | null | undefined): FN {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const stableFn = useCallback((...args: any[]) => fnRef.current?.(...args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  return stableFn as FN;
}
