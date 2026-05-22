// 用户ID列表
import {iApproveProjRecord} from "./approve.utils";

const userIds = [
  '5ab312a0-7fd0-11f0-bb5a-0242ac120002',
  '7a507e71-7f3f-11f0-bb5a-0242ac120002',
  'c42c051f-7f27-11f0-bb5a-0242ac120002'
];

// 项目ID列表
const projectIds = ['proj015', 'proj014', 'proj013', 'proj012'];

// 审批状态选项
const statuses = ['approving', 'approved', 'rejected'];

// 审批标题列表
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
  '南京产品演示'
];

// 审批描述信息列表
const descriptions = [
  '关于北京出差费用报销的详细说明',
  '上海项目实施期间产生的差旅费用',
  '参加广州行业会议的相关费用',
  '深圳新员工培训期间的费用',
  '杭州市场调研活动费用',
  '与成都合作伙伴商务洽谈费用',
  '西安技术交流会议相关费用',
  '重庆项目现场实施费用',
  '拜访武汉重要客户产生的费用',
  '南京产品展示会相关费用'
];

// 生成10条审批数据
export const mockApproveRecords: iApproveProjRecord[] = Array.from({ length: 10 }, (_, index) => {
  const userId = userIds[Math.floor(Math.random() * userIds.length)];
  const projId = projectIds[Math.floor(Math.random() * projectIds.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    title: titles[index],
    description: descriptions[index],
    status: status,
    amount: parseFloat((Math.random() * 5000 + 500).toFixed(2)), // 500-5500之间的随机金额
    logs: '[]',
    user_id: userId,
    proj_id: projId,
  };
});
