import {pathJoin} from "@peryl/utils/pathJoin";
import './login-page.scss';
import {Button, Checkbox, Form, Input, notification, Tabs, TabsProps} from "antd";
import {useState} from "react";
import UserOutlined from '@ant-design/icons/UserOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import MobileOutlined from '@ant-design/icons/MobileOutlined';
import TaobaoCircleOutlined from '@ant-design/icons/TaobaoCircleOutlined';
import WeiboCircleOutlined from '@ant-design/icons/WeiboCircleOutlined';
import AlipayCircleOutlined from '@ant-design/icons/AlipayCircleOutlined';
import {http} from "../utils/http";
import {router} from "../home/routes";
import {getLocationInfo, TokenInfoSaver} from "../utils/TokenService";
import {showError} from "../utils/showError";
import qs from "qs";


const logo = pathJoin(__webpack_public_path__, "images/reimburse_logo.png");
const backgroundImage = pathJoin(__webpack_public_path__, 'images/login_bg.png');

export default () => {

  const [loginType, setLoginType] = useState<iLoginType>('account');

  return (
    <div className="login-page" style={{ background: `url(${backgroundImage})` }}>
      <div className="login-page-title">
        <img src={logo} alt="logo"/>
        <span>云销智算</span>
      </div>
      <div style={{ display: 'inline-block', marginBottom: '8px' }}>
        <SwitchTabs activeKey={loginType} onChange={setLoginType}/>
      </div>
      {loginType === 'account' ? <AccountLoginForm/> : <VerificationLoginForm/>}
    </div>
  );
}

export type iLoginType = 'account' | 'verification'

const SwitchTabs = (props: { activeKey: iLoginType, onChange: (activate: iLoginType) => void }) => {

  const items: TabsProps['items'] = [
    {
      key: 'account',
      label: '账号密码登录',
      children: '',
    },
    {
      key: 'verification',
      label: '手机验证码登录',
      children: '',
    },
  ];
  return <Tabs defaultActiveKey="1" items={items} onChange={props.onChange as any} activeKey={props.activeKey}/>;
};

const AccountLoginForm = () => {

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);
  const [isLogin, setLogin] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async () => {
    setLogin(true);
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.set('username', values.username);
      formData.set('password', values.password);
      const resp = await http.post<{
        result: any,
        access_token: string,
        refresh_token: string,
        access_expires: number,
        refresh_expires: number,
      }>(
        '/login',
        formData,
        { setToken: false }
      );
      /*
      * layout为private或者pages的时候，可能出现token访问过期自动跳转回登录页面的情况
      * 此时重新登录之后，跳转回对应的path页面
      * 否则没有layout的情况下，跳转回pages的home页面
      */
      const { param } = getLocationInfo();
      const { layout, path, ...leftParam } = param as Record<string, string>;
      if (!!layout && !!path) {
        TokenInfoSaver.saveAccessToken(layout, resp.data.access_token, resp.data.access_expires);
        TokenInfoSaver.saveRefreshToken(layout, resp.data.refresh_token, resp.data.refresh_expires);
        await router.navigate(path + `?${qs.stringify(leftParam)}`);
      } else {
        TokenInfoSaver.saveAccessToken('pages', resp.data.access_token, resp.data.access_expires);
        TokenInfoSaver.saveRefreshToken('pages', resp.data.refresh_token, resp.data.refresh_expires);
        await router.navigate('/pages/home');
      }
    } catch (e: any) {
      showError(e);
    } finally {
      setLogin(false);
    }
  };

  return (
    <Form size="large" form={form}>
      <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
        <Input placeholder="请输入用户名" prefix={<UserOutlined/>}/>
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
        <Input type={isPasswordVisible ? 'text' : 'password'} placeholder="请输入密码" prefix={<LockOutlined/>} suffix={<span onClick={() => setPasswordVisible(!isPasswordVisible)}>{isPasswordVisible ? <EyeInvisibleOutlined/> : <EyeOutlined/>}</span>}/>
      </Form.Item>
      <LoginFormFooter
        autoLogin={autoLogin}
        setAutoLogin={setAutoLogin}
        onLogin={handleLogin}
        isLogin={isLogin}
      />
    </Form>
  );
};

const VerificationLoginForm = () => {
  return (
    <Form size="large">
      <Form.Item name="phonenumber">
        <Input placeholder="请输入手机号码" prefix={<MobileOutlined/>}/>
      </Form.Item>
      <Form.Item name="password">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Input placeholder="请输入验证码" prefix={<LockOutlined/>} style={{ flex: 1, marginRight: '8px' }}/>
          <Button>获取验证码</Button>
        </div>
      </Form.Item>
      <LoginFormFooter/>
    </Form>
  );
};

const LoginFormFooter = (
  props: {
    autoLogin?: boolean,
    setAutoLogin?: (autoLogin: boolean) => void,
    onLogin?: () => void,
    isLogin?: boolean
  }
) => {
  return (
    <>
      <Form.Item>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Checkbox checked={props.autoLogin} onChange={e => props.setAutoLogin?.(e.target.checked)}>自动登录</Checkbox>
          <Button type="link" style={{ padding: 0 }}>忘记密码？</Button>
        </div>
      </Form.Item>
      <Form.Item>
        <Button type="primary" style={{ width: '100%' }} onClick={props.onLogin} loading={props.isLogin}>登录</Button>
      </Form.Item>
      <Form.Item>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span>其他登录方式：</span>
          <div className="external-login-type" onClick={() => notification.warning({ message: '暂未开放...' })}>
            <TaobaoCircleOutlined/>
            <WeiboCircleOutlined/>
            <AlipayCircleOutlined/>
          </div>
        </div>
      </Form.Item>
    </>
  );
};
