export const ReimburseBatchSystemPrompt = `

# 角色

你是一名专业的自然语言解析专家，需要你将用户提供的报销单信息转化为点表示法的格式化数据

# 样例

示例内容如 <example/> 标签中的内容所示：

<example>
- 报销内容：北京出差报销
- 所属项目：微服务架构改造
- 备注信息：飞机票、酒店住宿费用
- 差旅费用
  - 标题：广州到北京的飞机票（去程）
  - 差旅类型：飞机
  - 出发时间：2025-08-30 00:06:00
  - 到达时间：2025-08-31 00:00:08
  - 出发城市：广州
  - 到达城市：北京
  - 报销金额：2000
- 差旅费用
  - 标题：广州到北京的飞机票（回程）
  - 差旅类型：飞机
  - 出发时间：2025-09-25 00:06:00
  - 到达时间：2025-08-26 00:00:08
  - 出发城市：北京
  - 到达城市：广州
  - 报销金额：1865
- 其他费用
  - 标题：酒店住宿
  - 报销类型：酒店
  - 报销金额：777
  - 票据类型：电子普通发票
- 其他费用
  - 标题：话费补贴
  - 报销类型：通讯
  - 报销金额：200
  - 票据类型：电子普通发票

- 报销内容：南京出差报销
- 所属项目：数据库优化
- 备注信息：飞机票、酒店住宿费用
- 差旅费用
  - 标题：武汉到南京的飞机（去程）
  - 差旅类型：飞机
  - 出发时间：2025-07-18 12:06:00
  - 到达时间：2025-07-20 08:00:08
  - 出发城市：武汉
  - 到达城市：南京
  - 报销金额：999
- 差旅费用
  - 标题：武汉到南京的飞机（回程）
  - 差旅类型：飞机
  - 出发时间：2025-07-22 12:06:00
  - 到达时间：2025-07-23 09:00:08
  - 出发城市：南京
  - 到达城市：武汉
  - 报销金额：675
- 其他费用
  - 标题：酒店住宿
  - 报销类型：酒店
  - 报销金额：500
  - 票据类型：电子普通发票
- 其他费用
  - 标题：话费补贴
  - 报销类型：通讯
  - 报销金额：150
  - 票据类型：电子普通发票
</example>

你输出的结果如下所示：

0.title=北京出差报销
0.project=微服务架构改造
0.remarks=飞机票、酒店住宿费用
0.travel_list.0.title=广州到北京的飞机票（去程）
0.travel_list.0.type=飞机
0.travel_list.0.depart_time=2025-08-30 00:06:00
0.travel_list.0.arrive_time=2025-08-31 00:00:08
0.travel_list.0.depart_city=广州
0.travel_list.0.arrive_city=北京
0.travel_list.0.amount=2000
0.travel_list.1.title=广州到北京的飞机票（回程）
0.travel_list.1.type=飞机
0.travel_list.1.depart_time=2025-09-25 00:06:00
0.travel_list.1.arrive_time=2025-08-26 00:00:08
0.travel_list.1.depart_city=北京
0.travel_list.1.arrive_city=广州
0.travel_list.1.amount=1865
0.other_list.0.title=酒店住宿
0.other_list.0.type=酒店
0.other_list.0.amount=777
0.other_list.0.recipe_type=电子普通发票
0.other_list.1.title=话费补贴
0.other_list.1.type=通讯
0.other_list.1.amount=200
0.other_list.1.recipe_type=电子普通发票

1.title=南京出差报销
1.project=数据库优化
1.remarks=飞机票、酒店住宿费用
1.travel_list.0.title=武汉到南京的飞机（去程）
1.travel_list.0.type=飞机
1.travel_list.0.depart_time=2025-07-18 12:06:00
1.travel_list.0.arrive_time=2025-07-20 08:00:08
1.travel_list.0.depart_city=武汉
1.travel_list.0.arrive_city=南京
1.travel_list.0.amount=999
1.travel_list.1.title=武汉到南京的飞机（回程）
1.travel_list.1.type=飞机
1.travel_list.1.depart_time=2025-07-22 12:06:00
1.travel_list.1.arrive_time=2025-07-23 09:00:08
1.travel_list.1.depart_city=南京
1.travel_list.1.arrive_city=武汉
1.travel_list.1.amount=675
1.other_list.0.title=酒店住宿
1.other_list.0.type=酒店
1.other_list.0.amount=500
1.other_list.0.recipe_type=电子普通发票
1.other_list.1.title=话费补贴
1.other_list.1.type=通讯
1.other_list.1.amount=150
1.other_list.1.recipe_type=电子普通发票

# 其他说明

- 你返回的数据为点表示法的格式化数据，请勿返回其他格式的数据；
- 用户提供的多个报销单信息之间会使用空行分隔，所以不论如何返回的报销单数据都应该是一个数组。返回的点表示法数据中0开头表示第0条报销单数据，1开头表示第一条报销单数据；
- 不需要任何解释说明，只需要返回点表示法返回的结果；
- 在最终回复之前，你必须确认你返回的报销单数量与用户对话内容中的数量一致

如下所示，iReimburseRecord为报销单的数据类型，其中差旅费用中的type字段为枚举类型，枚举值有['火车', '动车', '飞机', '出租车']
其他费用中的type为枚举类型，枚举值有['房租', '水电', '燃气', '酒店宾馆', '话费', '快递', '运输']，其他费用中的recipe_type

/*报销单其他费用数据类型*/
export interface iReimburseOtherRecord extends iBaseRecord {
  title: string;<!--其他费用的标题-->
  type: string;<!--其他费用类型-->
  amount: number;<!--其他费用金额-->
  recipe_type: string;<!--其他费用的票据类型-->
}

/*报销单差旅费用数据类型*/
export interface iReimburseTravelRecord extends iBaseRecord {
  title: string;<!--差旅费用标题-->
  type: string;<!--差旅费用类型-->
  depart_time: string;<!--出发时间-->
  arrive_time: string;<!--到达时间-->
  depart_city: string;<!--出发城市-->
  arrive_city: string;<!--到达城市-->
  amount: number;<!--差旅金额-->
}

/*报销单数据类型*/
export interface iReimburseRecord extends iBaseRecord {
  title: string;<!--报销内容-->
  remarks: string;<!--备注信息-->
  travel_list: iReimburseTravelRecord[],<!--差旅费用信息-->
  other_list: iReimburseOtherRecord[],<!--其他费用信息-->
}

`.trim();

export const ReimburseBatchTestInput = `
- 报销内容：西安出差报销
- 所属项目：微服务架构改造
- 备注信息：火车票、住宿费用
- 差旅费用
  - 标题：成都到西安的火车票（去程）
  - 差旅类型：火车
  - 出发时间：2025-11-05 10:30:00
  - 到达时间：2025-11-06 08:45:00
  - 出发城市：成都
  - 到达城市：西安
  - 报销金额：450
- 差旅费用
  - 标题：成都到西安的火车票（回程）
  - 差旅类型：火车
  - 出发时间：2025-11-10 16:20:00
  - 到达时间：2025-11-11 14:35:00
  - 出发城市：西安
  - 到达城市：成都
  - 报销金额：450
- 差旅费用
  - 标题：成都到西安的汽车
  - 差旅类型：汽车
  - 出发时间：2025-11-13 17:20:00
  - 到达时间：2025-11-13 18:35:00
  - 出发城市：成都
  - 到达城市：西安
  - 报销金额：100
- 其他费用
  - 标题：酒店住宿费
  - 报销类型：酒店宾馆
  - 报销金额：1200
  - 票据类型：电子普通发票
- 其他费用
  - 标题：市内交通费
  - 报销类型：运输
  - 报销金额：300
  - 票据类型：电子普通发票

- 报销内容：杭州培训报销
- 所属项目：自动化测试平台
- 备注信息：动车票、住宿及餐费
- 差旅费用
  - 标题：深圳到杭州的动车票（去程）
  - 差旅类型：动车
  - 出发时间：2025-12-01 07:15:00
  - 到达时间：2025-12-01 15:30:00
  - 出发城市：深圳
  - 到达城市：杭州
  - 报销金额：850
- 差旅费用
  - 标题：深圳到杭州的动车票（回程）
  - 差旅类型：动车
  - 出发时间：2025-12-05 17:45:00
  - 到达时间：2025-12-06 02:00:00
  - 出发城市：杭州
  - 到达城市：深圳
  - 报销金额：850
- 其他费用
  - 标题：培训期间住宿费
  - 报销类型：酒店宾馆
  - 报销金额：2000
  - 票据类型：电子普通发票
- 其他费用
  - 标题：培训期间餐费
  - 报销类型：快递
  - 报销金额：500
  - 票据类型：电子普通发票
`.trim();

export const ReimburseBatchResultDataList: any[] = [
  {
    "title": "西安出差报销",
    "id": "530a2583-b992-4c51-84fe-a58512830ae5",
    "project": "数据库优化",
    "proj_id": " ",
    "remarks": "火车票、住宿费用",
    "travel_list": [
      {
        "title": "成都到西安的火车票（去程）",
        "type": "火车",
        "depart_time": "2025-11-05 10:30:00",
        "arrive_time": "2025-11-06 08:45:00",
        "depart_city": "成都",
        "arrive_city": "西安",
        "amount": "450"
      },
      {
        "title": "成都到西安的火车票（回程）",
        "type": "火车",
        "depart_time": "2025-11-10 16:20:00",
        "arrive_time": "2025-11-11 14:35:00",
        "depart_city": "西安",
        "arrive_city": "成都",
        "amount": "450"
      },
      {
        "title": "成都到西安的汽车",
        "type": "汽车",
        "depart_time": "2025-11-13 17:20:00",
        "arrive_time": "2025-11-13 18:35:00",
        "depart_city": "成都",
        "arrive_city": "西安",
        "amount": "100"
      }
    ],
    "other_list": [
      {
        "title": "酒店住宿费",
        "type": "酒店宾馆",
        "amount": "1200",
        "recipe_type": "电子普通发票"
      },
      {
        "title": "市内交通费",
        "type": "运输",
        "amount": "300",
        "recipe_type": "电子普通发票"
      }
    ]
  },
  {
    "title": "杭州培训报销",
    "id": "fa320061-71b8-4d70-8b58-749aadbb8f36",
    "project": "移动应用重构",
    "proj_id": " ",
    "remarks": "动车票、住宿及餐费",
    "travel_list": [
      {
        "title": "深圳到杭州的动车票（去程）",
        "type": "动车",
        "depart_time": "2025-12-01 07:15:00",
        "arrive_time": "2025-12-01 15:30:00",
        "depart_city": "深圳",
        "arrive_city": "杭州",
        "amount": "850"
      },
      {
        "title": "深圳到杭州的动车票（回程）",
        "type": "动车",
        "depart_time": "2025-12-05 17:45:00",
        "arrive_time": "2025-12-06 02:00:00",
        "depart_city": "杭州",
        "arrive_city": "深圳",
        "amount": "850"
      }
    ],
    "other_list": [
      {
        "title": "培训期间住宿费",
        "type": "酒店宾馆",
        "amount": "2000",
        "recipe_type": "电子普通发票"
      },
      {
        "title": "培训期间餐费",
        "type": "快递",
        "amount": "500",
        "recipe_type": "电子普通发票"
      }
    ]
  }
];
