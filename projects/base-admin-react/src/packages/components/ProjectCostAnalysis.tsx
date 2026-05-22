import {useStrictMounted} from "../uses/useStrictMounted";
import {getEcharts} from "../utils/getEcharts";
import {useRef} from "react";

export const ProjectCostAnalysis = (props: {
  member_amount: Record<string, string>,
  cost_amount: Record<string, string>,
  spent: string,
  balance: string,
}) => {
  console.log(props.member_amount, props.cost_amount);

  const domRef = useRef(null as null | HTMLDivElement);

  useStrictMounted(async () => {
    const echarts = await getEcharts();

    const chartInstance = echarts.init(domRef.current!);

    const datas = [
      Object.entries(props.member_amount).map(([k, v]) => {return { name: k, value: v };}),
      Object.entries(props.cost_amount).map(([k, v]) => {return { name: k, value: v };}),
      [
        { name: '项目费用金额', value: props.spent },
        { name: '项目预算余额', value: props.balance },
      ]
    ];
    const option = {
      title: {
        text: '项目成本分析',
        left: 'center',
        textStyle: {
          color: '#999',
          fontWeight: 'normal',
          fontSize: 14
        }
      },
      series: datas.map(function (data, idx) {
        const top = idx * 33.3;
        return {
          type: 'pie',
          radius: [20, 60],
          top: top + '%',
          height: '33.33%',
          left: 'center',
          width: 400,
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          label: {
            alignTo: 'edge',
            formatter: '{name|{b}}\n{time|{c}}',
            minMargin: 5,
            edgeDistance: 10,
            lineHeight: 15,
            rich: {
              time: {
                fontSize: 10,
                color: '#999'
              }
            }
          },
          labelLine: {
            length: 15,
            length2: 0,
            maxSurfaceAngle: 80
          },
          labelLayout: function (params: any) {
            const isLeft = params.labelRect.x < chartInstance.getWidth() / 2;
            const points = params.labelLinePoints;
            // Update the end point.
            points[2][0] = isLeft
              ? params.labelRect.x
              : params.labelRect.x + params.labelRect.width;
            return {
              labelLinePoints: points
            };
          },
          data: data
        };
      })
    };

    chartInstance.setOption(option);
  });

  return (
    <div ref={domRef} style={{ width: '700px', aspectRatio: '1' }}>
    </div>
  );
};
