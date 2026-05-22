import {defer, DFD} from "@peryl/utils/defer";
import {router} from "../home/routes";
import {http} from "./http";
import {iUserRecord} from "../pages/user/user.utils";
import qs from "qs";

export const UserService = (() => {

  const getUserInfo = async () => {
    const resp = await http.get<iUserRecord>('/users/me');
    return resp.data;
  };

  return {
    getUserInfo,
  };
})();

export const TokenInfoSaver = (() => {

  let layout_name: string | null = null;
  let access_token: string | null = null;
  let access_expire_timestamp: number = 0;
  let refresh_token: string | null = null;
  let refresh_expire_timestamp: number = 0;

  return {
    init: (_layout: string) => {
      const layout = _layout + "_";
      layout_name = _layout;
      access_token = localStorage.getItem(layout + "access_token");
      access_expire_timestamp = Number(localStorage.getItem(layout + "access_expire_timestamp") ?? 0);
      refresh_token = localStorage.getItem(layout + 'refresh_token');
      refresh_expire_timestamp = Number(localStorage.getItem(layout + 'refresh_expire_timestamp') ?? 0);
    },
    get: () => {
      if (!layout_name || !access_token || !refresh_token) {
        return null;
      }
      return {
        layout: layout_name,
        access_token,
        refresh_token,
        isAccessExpired: () => Date.now() > access_expire_timestamp,
        isRefreshExpired: () => Date.now() > refresh_expire_timestamp,
      };
    },
    saveAccessToken: (_layout: string, _access_token: string, _access_expires: number) => {
      const layout = _layout + '_';
      access_token = _access_token;
      localStorage.setItem(layout + "access_token", _access_token);
      access_expire_timestamp = Date.now() + _access_expires;
      localStorage.setItem(layout + "access_expire_timestamp", String(access_expire_timestamp));
    },
    saveRefreshToken: (_layout: string, _refresh_token: string, _refresh_expires: number) => {
      const layout = _layout + '_';
      refresh_token = _refresh_token;
      localStorage.setItem(layout + 'refresh_token', _refresh_token);
      refresh_expire_timestamp = Date.now() + _refresh_expires;
      localStorage.setItem(layout + 'refresh_expire_timestamp', String(refresh_expire_timestamp));
    },
  };
})();

export const TokenService = (() => {

  /*变量标识，判断当前是否正在刷新token*/
  let refreshing = false;
  const refreshObserverList: DFD<string>[] = [];

  const getToken = async (): Promise<string> => {

    /*当前正在刷新token，进入等待队列*/
    if (refreshing) {
      const dfd = defer<string>();
      refreshObserverList.push(dfd);
      return dfd.promise;
    }

    const tokenInfo = TokenInfoSaver.get();

    /*1、没有token信息的话，重新登录*/
    if (!tokenInfo) {
      await login(getLocationInfo());
      throw new Error("登录已经过期，重新登录 (0x01)");
    }

    /*2、access_token前端判断仍然未过期，直接使用*/
    if (!tokenInfo.isAccessExpired()) {
      return tokenInfo.access_token;
    }

    /*3、access_token已经过期，尝试使用refresh_token刷新，如果refresh_token也已经过期，则返回登录*/
    if (tokenInfo.isRefreshExpired()) {
      await login(getLocationInfo());
      throw new Error("登录已经过期，重新登录 (0x02)");
    }

    refreshing = true;

    /*4、调用refresh接口获取新的access_token*/
    try {
      const resp = await http.post<{ access_token: string, access_expires: number }>('' +
        '/refresh',
        { "refresh_token": tokenInfo.refresh_token },
        { setToken: false, }
      );
      TokenInfoSaver.saveAccessToken(tokenInfo.layout, resp.data.access_token, resp.data.access_expires);
      refreshObserverList.forEach(i => i.resolve(resp.data.access_token));
      return resp.data.access_token;
    } catch (e) {
      console.error(e);
      refreshObserverList.forEach(i => i.reject(new Error('refresh token failed.')));
      await login(getLocationInfo());
      throw e;
    } finally {
      refreshing = false;
      refreshObserverList.splice(0, refreshObserverList.length);
    }
  };

  return {
    getToken,
  };
})();

export function getLocationInfo() {
  return {
    path: ('/' + window.location.pathname.replace(new RegExp(`^/?${__webpack_public_path__}/?`), '')),
    param: qs.parse(window.location.search.startsWith('?') ? window.location.search.slice(1) : window.location.search),
  };
}

export const login = async (
  { path, param, layout }: {
    path: string,
    param: Record<string, any>,
    layout?: string,
  }
) => {
  console.log('login', { path, param, layout });
  delete param.token;
  const searchString = qs.stringify({
    ...param,
    layout: layout ?? TokenInfoSaver.get()?.layout ?? 'pages',
    path
  });
  return await router.navigate(`/public/login?${searchString}`);
};
