export const isNumber = (val: any) => typeof val === "string" && /^\d+$/.test(val);

export const JsonStreamHandler = (() => {
  const setValueByPath = (proxyData: any, path: string, value: any) => {
    const pathList = path.split('.').filter(i => !!i.trim().length);

    let pathItem = pathList.shift();
    let parentValue = proxyData;

    while (pathItem != null) {

      try {
        /*先初始化parentValue*/
        if (isNumber(pathItem)) {
          /*是数字，说明 prevPathItem 是一个数组*/
          if (parentValue == null) {parentValue = [];}
          if (proxyData == null) {proxyData = parentValue;}
        } else {
          /*不是数字，说明 prevPathItem 是对象*/
          if (parentValue == null) {parentValue = {};}
          if (proxyData == null) {proxyData = parentValue;}
        }

        if (!pathList.length) {
          /*是最后一个*/
          parentValue[pathItem] = value;
        } else {
          /*不是最后一个*/
          if (parentValue[pathItem] == null) {
            if (isNumber(pathList[0])) {
              /*下一个是数字*/
              parentValue[pathItem] = [];
            } else {
              /*下一个不是数字*/
              parentValue[pathItem] = {};
            }
          }
          parentValue = parentValue[pathItem];
        }
      } catch (e) {
        console.log({
          path,
          value,
          parentValue,
          pathItem,
          proxyData,
        });
        console.error(e);
      }
      pathItem = pathList.shift();
    }
  };
  const handleFullText = (proxyData: any, fullText: string,) => {
    /*只处理最后两条数据*/
    const list = fullText.split('\n');
    list.forEach(item => {
      const separatorIndex = item.indexOf('=');
      if (separatorIndex === -1) {return;}
      const path = item.slice(0, separatorIndex);
      const value = item.slice(separatorIndex + 1);
      setValueByPath(proxyData, path, value);
    });
    return { list: list.slice(-2) };
  };
  return { setValueByPath, handleFullText };
})();
