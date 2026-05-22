import {useEffect, useRef} from "react";

/*
* 作用等同于 useEffects(()=>{},[])，只是为了规避 React.StrictMode 导致的多次执行的影响
*/
export function useStrictMounted(initializer: () => any) {

  /*标识只有第一次的时候才执行，规避 React.StrictMode的影响*/
  const isLoaded = useRef(false);
  /*规避编译警告：React Hook useEffect has a missing dependency: 'initializer'.*/
  const initializerRef = useRef(initializer);

  useEffect(() => {
    if (!isLoaded.current) {
      isLoaded.current = true;
      initializerRef.current();
    }
  }, []);
}
