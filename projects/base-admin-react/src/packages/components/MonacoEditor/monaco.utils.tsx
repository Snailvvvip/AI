import {SimpleFunction} from "@peryl/react-compose";
import {defer, DFD} from "@peryl/utils/defer";
import {PlainObject} from "@peryl/utils/event";
import {pathJoin} from "@peryl/utils/pathJoin";

interface iMonacoRequireFunction {
  (deps: string[], handler: (modules: any[]) => void): void,

  config: SimpleFunction
}

// const MONACO_LOADER_PATH = "https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.34.1/min/vs/loader.min.js";
// const MONACO_VS_PATH = "https://cdn.bootcdn.net/ajax/libs/monaco-editor/0.34.1/min/vs";

export const MonacoLoader = (() => {

  const MONACO_LOADER_PATH = pathJoin(__webpack_public_path__, "libs/monaco-editor/0.34.1/min/vs/loader.min.js");
  const MONACO_VS_PATH = pathJoin(__webpack_public_path__, "libs/monaco-editor/0.34.1/min/vs");

  /**
   * 加载monaco中的loader函数
   * @author  韦胜健
   * @date    2023/2/10 9:49
   */
  const getMonacoRequire = (() => {
    let monacoRequire = null as null | iMonacoRequireFunction;
    return async (): Promise<iMonacoRequireFunction> => {
      if (!!monacoRequire) {
        return monacoRequire;
      }
      return new Promise((resolve, reject) => {
        const scriptEl = document.createElement('script');
        scriptEl.onload = () => {
          monacoRequire = window.require as any;
          if (!!monacoRequire) {
            resolve(monacoRequire);
          } else {
            alert('加载monaco-editor/loader失败！');
            reject('window.require not exist!');
          }
        };
        scriptEl.onerror = (error) => {
          alert('加载monaco-editor/loader失败！');
          reject(error);
        };
        scriptEl.src = MONACO_LOADER_PATH;
        document.body.appendChild(scriptEl);
      });
    };
  })();

  let getMonacoDefer: DFD<PlainObject> | undefined = undefined;

  const getMonaco = () => {
    if (!getMonacoDefer) {
      getMonacoDefer = defer<PlainObject>();
      getMonacoRequire().then(monacoRequire => {
        monacoRequire.config({ paths: { vs: MONACO_VS_PATH } });
        monacoRequire([
          'vs/editor/editor.main'
        ], (monaco) => {
          if (!!monaco) {
            getMonacoDefer!.resolve(monaco);
          } else {
            alert('load monaco failed!');
            getMonacoDefer!.reject('load monaco failed!');
          }
        });
      });
    }
    return getMonacoDefer.promise;
  };

  return { getMonaco };
})();
