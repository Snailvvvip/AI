import {useLocation} from "react-router";
import React, {useState} from "react";
import {Button, Dropdown, Menu, MenuProps, Space} from "antd";
import {menus} from "../home/menus";
import './LayoutPages.scss';
import RightOutlined from '@ant-design/icons/RightOutlined';
import LeftOutlined from '@ant-design/icons/LeftOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import {pathJoin} from "@peryl/utils/pathJoin";
import {router} from "../home/routes";
import {iUserRecord, TokenContext, UserInfoContext} from "../pages/user/user.utils";
import {useStrictMounted} from "../uses/useStrictMounted";
import {TokenInfoSaver, TokenService, UserService} from "../utils/TokenService";
import {doNothing} from "@peryl/utils/doNothing";
import {RootRenderContext, useRootRender} from "../uses/useRootRender";
import {PageSpin} from "../components/PageSpin";

const logo = pathJoin(__webpack_public_path__, "images/reimburse_logo.png");
const user = pathJoin(__webpack_public_path__, "images/user.png");

export const LayoutPages = (props: { children: any }) => {

  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<null | iUserRecord>(null);
  const [token, setToken] = useState<null | string>(null);

  useStrictMounted(async () => {
    TokenInfoSaver.init('pages');
    setLoading(true);
    try {
      const userInfo = await UserService.getUserInfo();
      setUserInfo(userInfo);
      setToken(await TokenService.getToken());
    } catch (e) {
      // showError(e);
      doNothing(e);
    } finally {
      setLoading(false);
    }
  });

  const location = useLocation();

  const [collapse, _setCollapse] = useState(() => {
    const str = localStorage.getItem('collapse');
    return str == null ? false : JSON.parse(str);
  });
  const setCollapse = (flag: boolean) => {
    localStorage.setItem('collapse', JSON.stringify(flag));
    _setCollapse(flag);
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <Space>
          <LogoutOutlined/>
          <span>退出登录</span>
        </Space>
      ),
      onClick: () => {
        router.navigate("/public/login");
      }
    },
  ];

  const { rootRenderContextValue, content } = useRootRender();

  return (
    <RootRenderContext.Provider value={rootRenderContextValue}>
      <TokenContext.Provider value={token}>
        <UserInfoContext.Provider value={userInfo}>
          <div className="app-home" data-collapse={String(collapse)}>
            <div className="app-home-header app-home-header-target">
              <div className="app-home-header-left">
                <img src={logo} className="App-logo" alt="logo"/>
                <span>云销智算</span>
              </div>
              <div className="app-home-header-center"></div>
              <div className="app-home-header-right">

                <Dropdown menu={{ items }} placement="bottomLeft">
                  <Button type="text">
                    <img src={user} alt="user_avatar"/>
                    {loading && <PageSpin/>}
                    {!!userInfo && <>
                      <span>{userInfo.full_name}</span>&nbsp;@&nbsp;
                      <span>{userInfo.pos?.name}</span>
                    </>}
                  </Button>
                </Dropdown>
              </div>
            </div>
            <div className="app-home-header app-home-header-placeholder"/>
            <div className="app-home-menus">
              <div className="app-home-menus-collapse" onClick={() => setCollapse(!collapse)}>
                {collapse ? <RightOutlined/> : <LeftOutlined/>}
              </div>
              <Menu
                style={{ overflowY: 'auto' }}
                selectedKeys={[location.pathname]}
                mode="inline"
                items={menus}
                inlineCollapsed={collapse}
              />
            </div>
            <div className="app-home-body">
              {!!userInfo && props.children}
            </div>
          </div>
          {content}
        </UserInfoContext.Provider>
      </TokenContext.Provider>
    </RootRenderContext.Provider>
  );
};
