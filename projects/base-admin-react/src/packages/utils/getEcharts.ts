import {loadFile} from '@peryl/utils/loadFile';
import {pathJoin} from "@peryl/utils/pathJoin";

let echarts: any = undefined;
export const getEcharts = async () => {
  if (!echarts) {
    // @ts-ignore
    echarts = await loadFile(pathJoin(__webpack_public_path__, '/libs/echarts.min.js'), 'echarts');
  }
  return echarts;
};
