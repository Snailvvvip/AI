import {Alert} from "antd";
import {Link} from "react-router";
import React, {ReactNode} from "react";
import {DirectSubordinates} from "./DirectSubordinates";
import {ProjectList} from "./ProjectList";
import {ProjectCostAnalysis} from "./ProjectCostAnalysis";

export function ToolMessageRender(props: { content: any }) {
  let { content } = props;

  if (content == null) {
    content = "暂无内容";
  }

  if (typeof content === 'string') {
    return <span>{content}</span>;
  }

  if (Array.isArray(content)) {
    const renderConfig = content[1];
    const { component, props } = renderConfig;
    const Component = ComponentsMap[component] as any;
    if (!Component) {
      return <Alert type="error" message={`无法识别的组件：${component}`}/>;
    }
    return <Component {...props}/>;
  }

  return <Alert type="error" message={`无法渲染的工具结果：${JSON.stringify(content)}`}/>;
}

const ComponentsMap: Record<string, (...args: any[]) => ReactNode> = {
  Link,
  DirectSubordinates,
  ProjectList,
  ProjectCostAnalysis,
};
