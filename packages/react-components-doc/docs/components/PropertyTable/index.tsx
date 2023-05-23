import React, { FC, ReactElement } from "react";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";

interface PropertyType {
  key: string;
  propName: string;
  desc: string;
  type: string | any;
  defaultValue?: any;
}

interface PropertyTableProps {
  data: PropertyType[];
}

const COLUMNS: ColumnsType<PropertyType> = [
  {
    title: "属性",
    dataIndex: "propName",
    key: "propName",
  },
  {
    title: "类型",
    dataIndex: "type",
    key: "type",
    render: (type) => (
      <div>{typeof type === "string" ? type : JSON.stringify(type)}</div>
    ),
  },
  {
    title: "描述",
    dataIndex: "desc",
    key: "desc",
  },
  {
    title: "默认值",
    dataIndex: "defaultValue",
    key: "defaultValue",
    render: (defaultValue) => <div>{defaultValue || "undefined"}</div>,
  },
];

const PropertyTable: FC<PropertyTableProps> = ({ data }): ReactElement => {
  return (
    <Table
      columns={COLUMNS}
      dataSource={data}
      bordered
      pagination={false}
      style={{ width: "fit-content" }}
    ></Table>
  );
};

export default PropertyTable;
