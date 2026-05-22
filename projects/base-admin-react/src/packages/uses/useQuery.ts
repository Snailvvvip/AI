import qs from "qs";
import {useLocation} from "react-router";
import {useMemo, useState} from "react";

export function useQuery() {

  const _location = useLocation();
  /*参数不要变，在切换页面额度时候location会发生变化，可能会导致页面拿到不匹配的参数，这里使用useState定义不需要变化*/
  const [location] = useState(_location);

  return useMemo(() => {
    const search = location.search.charAt(0) === '?' ? location.search.slice(1) : location.search;
    return qs.parse(search) as Record<string, string | undefined>;
  }, [location]);

}
