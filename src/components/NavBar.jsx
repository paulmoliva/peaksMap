import React from "react";
import styled from "styled-components";
import { Layout, Dropdown, Menu,  Icon, AutoComplete, Input } from "antd";
import Logo from './Logo';

const { Header } = Layout;

const districtMenu = (selectedDataset, onChangeDataset) => (
  <Menu
    theme="light"
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
    theme="light"
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

const FilterIcon = styled(Icon)`
  margin-right: 5px;
`;

const FilterNav = styled.div`
  height: 40px;
  background: white;
  display: grid;
  align-items: center;
  padding-left: 70px;
  border-bottom: 1px solid whitesmoke;
  box-shadow: 0 8px 6px -6px black;

  @media (max-width: 768px) {
    padding-left: 20px;
  }
  `;

const MainNav = styled(Header)`
  padding: 0 70px 0 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  @media (max-width: 768px) {
    padding: 0 20px 0 20px;
  }

  @media (max-width: 550px) {
    flex-direction: column-reverse;
    padding: 10px 20px 10px 20px;
    height: 100px;
    justify-content: flex-end;
    
    .ant-select {
      height: 10px;
    }
  }
`;

const LogoWrapperStyle = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 550px) {
    padding-bottom: 10px;
  }
`;

const LogoWrapper = () => (
  <LogoWrapperStyle>
    <Logo />
  </LogoWrapperStyle>
)


export default ({
  selectedYear,
  selectedDataset,
  onChangeFilter,
  onSelectSchool,
  locationKeys
}) => (
  <div>
    <MainNav className="header MainNav">
      <AutoComplete
        dataSource={locationKeys}
        onSelect={onSelectSchool}
        placeholder="Search by school name"
        filterOption={(inputValue, option) =>
          option.props.children
            .toUpperCase()
            .indexOf(inputValue.toUpperCase()) !== -1
        }
      >
        <Input
          suffix={<Icon type="search" className="certain-category-icon" />}
        />
      </AutoComplete>
      <LogoWrapper />
    </MainNav>
    <FilterNav className="FilterNav">
      <div className="filters-container">
        <div
          className="dropdown-container"
          style={{ marginRight: "10px", display: "inline" }}
        >
          <Dropdown
            overlay={districtMenu(selectedDataset, key => {
              onChangeFilter("dataset", key);
            })}
            trigger={["click"]}
          >
            <a className="ant-dropdown-link" href="#">
              <FilterIcon type="down" />
              Select Dataset
            </a>
          </Dropdown>
        </div>

        <Dropdown
          overlay={yearMenu(selectedYear, key => {
            onChangeFilter("year", key);
          })}
          trigger={["click"]}
        >
          <a className="ant-dropdown-link" href="#">
            <FilterIcon type="down" />
            Select Year
          </a>
        </Dropdown>
      </div>
    </FilterNav>
  </div>
);
