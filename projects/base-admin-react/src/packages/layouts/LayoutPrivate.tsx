import React, {useState} from "react";
import {getLocationInfo, login, TokenInfoSaver, TokenService, UserService} from "../utils/TokenService";
import {iUserRecord, TokenContext, UserInfoContext} from "../pages/user/user.utils";
import {useStrictMounted} from "../uses/useStrictMounted";
import {RootRenderContext, useRootRender} from "../uses/useRootRender";
import {showError} from "../utils/showError";
import {useNavigate} from "react-router";
import qs from "qs";
import {PageSpin} from "../components/PageSpin";

/*
* 在访问private页面的时候，可带token可不带，不带会自动跳转到登录页面，登录完毕之后会跳转回原来的private页面；
* 带token的时候，会自动缓存token；使用这个token来处理请求；
* token无效或者token过期，仍旧走登录逻辑；
*/
export const LayoutPrivate = (props: { children: any }) => {

  const [userInfo, setUserInfo] = useState<null | iUserRecord>(null);
  const [token, setToken] = useState<null | string>(null);
  const navigation = useNavigate();

  useStrictMounted(async () => {

    TokenInfoSaver.init('private');

    /*先处理地址栏参数中的token*/
    const { token: searchParamToken, ...leftParam } = getLocationInfo().param;
    console.log("searchParamToken", searchParamToken);

    if (!!searchParamToken) {
      /*地址参数中存在token，这个token前端判断2小时内有效，如果token无效或者后端主动主动失效该token，则会自动重新登录*/
      TokenInfoSaver.saveAccessToken('private', searchParamToken as string, 1000 * 60 * 60 * 2);  /*保存access token*/
      // TokenInfoSaver.saveAccessToken('private', searchParamToken as string, 1000 * 10);  /*保存access token*/
      TokenInfoSaver.saveRefreshToken('private', '_', 0); /*此时没有refresh token*/
      /*将地址栏中的token移除*/
      navigation(getLocationInfo().path + `?${qs.stringify(leftParam)}`, { replace: true });
    }

    /*检查token信息是否已经存在*/
    const tokenInfo = TokenInfoSaver.get();
    if (!tokenInfo || tokenInfo.isAccessExpired()) {
      showError("登录已经过期，重新登录 (0x04)");
      await login({ ...getLocationInfo(), layout: 'private' });
      return;
    }
    try {
      const userInfo = await UserService.getUserInfo();
      setUserInfo(userInfo);
      setToken(await TokenService.getToken());
    } catch (e) {
      showError(e);
    }
  });

  const { rootRenderContextValue, content } = useRootRender();

  return (
    <RootRenderContext.Provider value={rootRenderContextValue}>
      <TokenContext.Provider value={token}>
        <UserInfoContext.Provider value={userInfo}>
          <div className="app-home" data-collapse={String(true)}>
            <div className="app-home-body" style={{ marginLeft: 0, width: '100%' }}>
              {!userInfo ? <PageSpin/> : props.children}
            </div>
          </div>
          {content}
        </UserInfoContext.Provider>
      </TokenContext.Provider>
    </RootRenderContext.Provider>
  );
};
