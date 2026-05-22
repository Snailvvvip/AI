import {AutoOptionProvideContext, iAutoTableProps} from "./auto-table.utils";
import './auto-table.scss';
import React from "react";

export const AutoTable = (props: iAutoTableProps) => {


  return (
    <div className="auto-table">
      <AutoOptionProvideContext.Provider value={props.option}>
        {props.option.render}
      </AutoOptionProvideContext.Provider>
    </div>
  );
};

