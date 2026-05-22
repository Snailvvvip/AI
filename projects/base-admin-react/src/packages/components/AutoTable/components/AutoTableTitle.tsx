import {AutoOptionProvideContext} from "../auto-table.utils";
import {iAutoColumnType} from '../columns/auto-table.columns';
import {isElement} from 'react-is';
import CaretUpOutlined from '@ant-design/icons/CaretUpOutlined';
import CaretDownOutlined from '@ant-design/icons/CaretDownOutlined';
import React, {useCallback, useContext, useMemo} from "react";

export function AutoTableTitle(props: { column: iAutoColumnType, originTitle: any } & Record<string, any>) {

  const option = useContext(AutoOptionProvideContext)!;

  const { state: { stateSortData }, hooks } = option;

  const { column, ...leftProps } = props;

  const activateSortData = useMemo(() => !column.sortable ? null : stateSortData.find(i => i.field === column.dataIndex), [stateSortData, column]);

  const onClick = useCallback((e: React.MouseEvent) => {hooks.onClickTitle.exec({ column: column, e });}, [hooks, column]);

  return (
    <div
      className="auto-table-title"
      data-active={String(!!activateSortData)}
      data-desc={String(!!activateSortData?.desc)}
      onClick={onClick}
    >
      {(() => {
        const Title = props.originTitle;
        if (Title == null) {
          return Title;
        }
        if (typeof Title === "string" || typeof Title === "number" || typeof Title === "boolean") {
          return <span>{Title}</span>;
        } else {
          if (isElement(Title)) {return Title;}
          // @ts-ignore
          return <Title {...leftProps}/>;
        }
      })()}
      <div className="auto-table-title-sorter">
        <CaretUpOutlined/>
        <CaretDownOutlined/>
      </div>
    </div>
  );
}
