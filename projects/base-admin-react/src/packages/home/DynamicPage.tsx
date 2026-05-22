import {useParams} from "react-router";
import {useEffect, useState} from "react";
import {Alert, notification} from "antd";
import {PageSpin} from "../components/PageSpin";

export const DynamicPage = (props: { dirname: string }) => {

  const params = useParams();
  // console.log('dynamic route params', params);

  const routeName: string = [params.name, params['*']].filter(i => !!i?.trim().length).join('/');

  // console.log({ routeName });

  const [Component, setComponent] = useState(null as null | ((props: any) => any));

  useEffect(() => {
    if (!!routeName) {
      // console.log(`dynamic page: ${routeName}`);
      (async () => {
        try {
          const PageComponent = await import('../' + props.dirname + '/' + routeName + '-page').then(val => val.default);
          if (!PageComponent) {
            notification.error({ message: 'Missing export default in page.' });
          }
          setComponent(() => PageComponent);
        } catch (e) {
          setComponent(() => {
            return () => (
              <div style={{ padding: '1em' }}>
                <Alert type="error" message={`页面"${routeName}"不存在`}/>
              </div>
            );
          });
        }
      })();
    } else {
      setComponent(() => {
        return () => (
          <div style={{ padding: '1em' }}>
            <Alert type="error" message={`缺少动态路由参数！}`}/>
          </div>
        );
      });
    }
  }, [routeName, props.dirname]);

  return !Component ? <PageSpin/> : <Component {...props as any}/>;
};
