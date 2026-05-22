import {iReimburseOtherRecord, iReimburseRecord, iReimburseTravelRecord} from "./reimburse.utils";
import {http} from "../../utils/http";
import Dayjs from 'dayjs';

const projectIds = ['proj015', 'proj014', 'proj013', 'proj012', 'proj011', 'proj010'];

// 报销单标题列表
const titles = [
  '北京出差费用报销',
  '上海项目差旅费',
  '广州会议费用',
  '深圳培训差旅费',
  '杭州调研费用',
  '成都商务洽谈',
  '西安技术交流',
  '重庆项目实施',
  '武汉客户拜访',
  '南京产品演示',
  '长沙市场调研',
  '合肥项目验收',
  '昆明技术支持',
  '贵阳合作伙伴会议',
  '兰州项目启动',
  '西宁客户培训',
  '乌鲁木齐考察费用',
  '拉萨项目调研',
  '呼和浩特技术交流',
  '哈尔滨项目实施',
  '长春客户拜访',
  '沈阳产品展示',
  '大连合作洽谈',
  '青岛项目验收',
  '济南售后支持'
];

// 差旅类型
export const travelTypes = ['火车', '动车', '飞机', '出租车'];
export const otherTypes = ['房租', '水电', '燃气', '酒店宾馆', '话费', '快递', '运输'];

export const recipe_type = ['增值税专用发票', '增值税普通发票', '电子普通发票', '定额发票', '机打发票', '通行费发票', '火车票', '出租车发票'];

// 城市列表
const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '西安', '重庆', '武汉', '南京'];

// 生成随机日期
const generateRandomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return Dayjs(date).format("YYYY-MM-DD HH:mm:ss");
};

// 生成差旅费用项
const generateTravelItem = (reimburseId: string, index: number): iReimburseTravelRecord => {
  const departCity = cities[Math.floor(Math.random() * cities.length)];
  let arriveCity: string;
  do {
    arriveCity = cities[Math.floor(Math.random() * cities.length)];
  } while (arriveCity === departCity);

  const baseDate = new Date();
  const departTime = generateRandomDate(new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1), baseDate);
  const arriveTime = generateRandomDate(new Date(new Date(departTime).getTime() + 24 * 60 * 60 * 1000), new Date(new Date(departTime).getTime() + 5 * 24 * 60 * 60 * 1000));

  return {
    id: `travel_${reimburseId}_${index}`,
    created_at: generateRandomDate(new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1), baseDate),
    created_by: `user${Math.floor(Math.random() * 10) + 1}`,
    updated_at: generateRandomDate(new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1), baseDate),
    updated_by: `user${Math.floor(Math.random() * 10) + 1}`,
    org_code: `org${Math.floor(Math.random() * 5) + 1}`,
    pos_code: `pos${Math.floor(Math.random() * 10) + 1}`,
    title: `${departCity}至${arriveCity}${travelTypes[Math.floor(Math.random() * travelTypes.length)]}费用`,
    type: travelTypes[Math.floor(Math.random() * travelTypes.length)],
    depart_time: departTime,
    arrive_time: arriveTime,
    depart_city: departCity,
    arrive_city: arriveCity,
    amount: parseFloat((Math.random() * 2000 + 100).toFixed(2)),
    reimburse_id: reimburseId
  };
};

// 生成其他费用项
const generateOtherItem = (reimburseId: string, index: number): iReimburseOtherRecord => {
  const otherType = otherTypes[Math.floor(Math.random() * otherTypes.length)];

  return {
    id: `other_${reimburseId}_${index}`,
    created_at: generateRandomDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), new Date()),
    created_by: `user${Math.floor(Math.random() * 10) + 1}`,
    updated_at: generateRandomDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), new Date()),
    updated_by: `user${Math.floor(Math.random() * 10) + 1}`,
    org_code: `org${Math.floor(Math.random() * 5) + 1}`,
    pos_code: `pos${Math.floor(Math.random() * 10) + 1}`,
    title: `${otherType}费用`,
    type: otherType,
    amount: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
    recipe_type: `recipe_type_${Math.floor(Math.random() * 3) + 1}`,
    reimburse_id: reimburseId
  };
};

// 生成25条报销单数据
const generateReimburseRecords = (): iReimburseRecord[] => {
  const records: iReimburseRecord[] = [];

  for (let i = 1; i <= 25; i++) {
    const projectId = projectIds[Math.floor(Math.random() * projectIds.length)];
    const recordId = `reimburse_${i.toString().padStart(3, '0')}`;

    // 生成差旅费用列表 (1-3项)
    const travelList: iReimburseTravelRecord[] = [];
    const travelCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < travelCount; j++) {
      travelList.push(generateTravelItem(recordId, j + 1));
    }

    // 生成其他费用列表 (1-4项)
    const otherList: iReimburseOtherRecord[] = [];
    const otherCount = Math.floor(Math.random() * 4) + 1;
    for (let k = 0; k < otherCount; k++) {
      otherList.push(generateOtherItem(recordId, k + 1));
    }

    records.push({
      id: recordId,
      created_at: generateRandomDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), new Date()),
      created_by: `user${Math.floor(Math.random() * 10) + 1}`,
      updated_at: generateRandomDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), new Date()),
      updated_by: `user${Math.floor(Math.random() * 10) + 1}`,
      org_code: `org${Math.floor(Math.random() * 5) + 1}`,
      pos_code: `pos${Math.floor(Math.random() * 10) + 1}`,
      title: titles[i - 1],
      remarks: `关于${titles[i - 1]}的详细说明`,
      proj_id: projectId,
      travel_list: travelList,
      other_list: otherList,
      amount: Number((travelList.reduce((acc, item) => acc + item.amount, 0) +
        otherList.reduce((acc, item) => acc + item.amount, 0)).toFixed(2)),
    });
  }

  return records;
};

// 生成并导出数据
export const mockReimburseRecords: iReimburseRecord[] = generateReimburseRecords();

// 如果需要查看生成的数据，可以取消下面的注释
console.log(mockReimburseRecords);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function main() {

  const all_travel_list = mockReimburseRecords.map(i => i.travel_list).flat(1);
  const all_other_list = mockReimburseRecords.map(i => i.other_list).flat(1);

  const result = await Promise.all([
    http.post('/reimburse_other/batch_insert', all_other_list),
    http.post('/reimburse_travel/batch_insert', all_travel_list),
    http.post('/reimburse/batch_insert', mockReimburseRecords)
  ]);

  console.log(result);

}
