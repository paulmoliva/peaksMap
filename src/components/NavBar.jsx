import React from "react";
import { Layout, Dropdown, Menu, Breadcrumb, Icon } from "antd";
const { Header, Content, Sider } = Layout;

const districtMenu = (selectedDataset, onChangeDataset) => (
  <Menu
    theme="dark"
    mode="horizontal"
    selectedKeys={[selectedDataset]}
    style={{ lineHeight: "64px" }}
    onClick={info => {
      onChangeDataset(info.key);
    }}
  >
    <Menu.Item key="1">Anchorage School District</Menu.Item>
    <Menu.Item key="2">Alaska Statewide</Menu.Item>
  </Menu>
);
const yearMenu = (selectedYear, onChangeYear) => (
  <Menu
    theme="dark"
    mode="horizontal"
    selectedKeys={[selectedYear]}
    style={{ lineHeight: "64px" }}
    onClick={info => {
      onChangeYear(info.key);
    }}
  >
    <Menu.Item key="1">2018</Menu.Item>
    <Menu.Item key="2">2017</Menu.Item>
  </Menu>
);

export default ({ selectedYear, selectedDataset, onChangeFilter }) => (
  <Header className="header">
    <div className="logo" />
    <Dropdown
      overlay={districtMenu(selectedDataset, key => {
        onChangeFilter("dataset", key);
      })}
      style={{ margin: "5px" }}
      trigger="click"
    >
      <a className="ant-dropdown-link" href="#">
        <Icon type="down" />
        Select Dataset
      </a>
    </Dropdown>
    ||||
    <Dropdown
      overlay={yearMenu(selectedYear, key => {
        onChangeFilter("year", key);
      })}
      trigger="click"
    >
      <a className="ant-dropdown-link" href="#">
        <Icon type="down" />
        Select Year
      </a>
    </Dropdown>
  </Header>
);
