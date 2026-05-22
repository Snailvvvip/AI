import {pathJoin} from "@peryl/utils/pathJoin";
import env from "../../env/env";

/*
* 纠正静态资源的访问路径
*/
export const assetsPathUtils = {
  /*将静态资源文件的路径拼上公共资源路径前缀*/
  /*如果当前启用https协议，并且origin为ip地址，则将https协议改为http，不然由于IP地址的https证书不合规的问题导致多模态模型无法下载文件*/
  buildForLLM: (fileAccessPath: string) => {
    if (!(/^https?/.test(fileAccessPath))) {
      fileAccessPath = pathJoin(env.assetsPrefix, fileAccessPath);
    }
    if (isIPAddress(window.location.host) && fileAccessPath.startsWith('https')) {
      /*如果启用https协议，并且使用IP地址而不是域名，则将文件地址的协议从https改为http*/
      /*如果使用https协议并且使用IP地址，说明是自签名证书，自签名证书下代理的文件无法用于调用多模态模型，这里改成使用普通协议http来调用*/
      fileAccessPath = fileAccessPath.replace('https:', 'http:');
    }
    return fileAccessPath;
  },
  /*调整静态资源的访问路径，使得在web中能够访问这个静态资源*/
  /*比如静态资源的协议与当前页面的协议不同，则访问路径协议使得与页面访问协议相同*/
  /*
  * 比如如果图片的host与当前页面的host相同，但是图片的protocol与当前页面的protocol不同，
  * 则修改图片的protocol为当前页面的protocol
  */
  buildForWeb: (fileAccessPath: string) => {
    if (!(/^https?/.test(fileAccessPath))) {
      fileAccessPath = pathJoin(env.assetsPrefix, fileAccessPath);
    }
    const imageUri = new URL(fileAccessPath);
    if (imageUri.host === window.location.host && imageUri.protocol !== window.location.protocol) {
      imageUri.protocol = window.location.protocol;
    }
    return imageUri.href;
  },
};

function isIPAddress(str: string) {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(str)) return false;

  // 进一步验证每个数字范围是否在 0-255 之间
  const parts = str.split('.');
  return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
}
