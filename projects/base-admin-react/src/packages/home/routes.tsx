import {createBrowserRouter, Navigate, RouteObject} from "react-router";
import {DynamicPage} from "./DynamicPage";
import {LayoutPages} from "../layouts/LayoutPages";
import {LayoutPrivate} from "../layouts/LayoutPrivate";
import {LayoutPublic} from "../layouts/LayoutPublic";

export const routes: RouteObject[] = [
  {
    index: true,
    element: <Navigate to="/pages/home" replace/>,
  },
  {
    path: '/pages/:name/*',
    element: <LayoutPages><DynamicPage dirname="pages"/></LayoutPages>,
  },
  {
    path: '/private/:name/*',
    element: <LayoutPrivate><DynamicPage dirname="private"/></LayoutPrivate>,
  },
  {
    path: '/public/:name/*',
    element: <LayoutPublic><DynamicPage dirname="public"/></LayoutPublic>,
  },
];

/*function lazy<Props>(getComponentAsync: () => Promise<(props?: Props) => any>) {
  const AsyncComponent: any = (props: Props) => {
    const [Component, setComponent] = useState(null as null | ((props: Props) => any));
    /!*立即执行异步加载页面组件，但是值需要加载一次*!/
    useStrictMounted(() => {
      getComponentAsync().then(val => {
        setComponent(() => val);
      });
    });
    return !Component ? <Spin/> : <Component {...props}/>;
  };
  return <AsyncComponent/>;
}*/

const publicPath = __webpack_public_path__;
export const router = createBrowserRouter(routes, { basename: publicPath.endsWith('/') ? publicPath.slice(0, -1) : publicPath });
