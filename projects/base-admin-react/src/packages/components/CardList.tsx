import chunk from "lodash/chunk";
import {Image} from "antd";
import React from "react";
import './CardList.scss';
import {CheckOutlined} from '@ant-design/icons';

export function CardList<T extends { image?: string, checked?: boolean }>(props: {
  data: ((() => React.ReactElement) | T)[],
  col?: number,
  cover?: (item: T, index: number) => React.ReactElement,
  onClickItem?: (data: { item: T, index: number, e: React.MouseEvent }) => void,
  onDoubleClickItem?: (data: { item: T, index: number, e: React.MouseEvent }) => void,
}) {
  const col = props.col ?? 7;
  return (
    <div className="card-list" style={{ '--col': col } as any}>
      {chunk(props.data, col).map((subList, subListIndex) => (
        <div className="card-list-row" key={subListIndex}>
          {subList.map((item, index) => {
            const checked = String(typeof item !== "function" && !!item.checked);
            // const checked = true;
            return (
              <div
                key={index}
                className="card-list-col"
                data-checked={String(checked)}
                onClick={e => typeof item !== "function" && props.onClickItem?.({ item, index, e })}
                onDoubleClick={e => typeof item !== "function" && props.onDoubleClickItem?.({ item, index, e })}
              >
                {(() => {
                  if (typeof item === "function") {
                    return item();
                  } else {
                    return <>
                      <Image src={item.image} alt="" preview={false}/>
                      {props.cover?.(item, subListIndex * col + index)}
                    </>;
                  }
                })()}
                {checked && (
                  <div className="card-list-check-icon">
                    <CheckOutlined/>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
