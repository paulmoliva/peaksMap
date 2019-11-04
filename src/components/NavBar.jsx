import React from "react";
import styled from "styled-components";
import { Layout, Dropdown, Menu,  Icon, AutoComplete, Input } from "antd";
import Logo from './Logo';
import scores from '../data/scores'

const { Header } = Layout;

const districtMenu = (selectedDatasetKey, onChangeDataset) => (
  <Menu
    theme="light"
    mode="horizontal"
    selectedKeys={[selectedDatasetKey]}
    style={{ lineHeight: "64px" }}
    onClick={info => {
      const newDataset = info.key === '1' ? 'asd' : 'alaska';
      const center = info.key !== '1' ? {
            lat: 61.19,
            lng: -149.93
      } : {
          lat: 61.2077052,
          lng: -149.7516999
      };
        window.g_map.panTo(center);

        // eslint-disable-next-line no-unused-expressions
        info.key !== '1' ? window.g_map.setZoom(4) : window.g_map.setZoom(10);

        onChangeDataset(newDataset);
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
      const newYear = info.key === "1" ? 2018 : 2017;
      onChangeYear(newYear);
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
    height: 120px;
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
);

const AutoCompleteContainer = styled.div`
  width: 300px;
  @media (max-width: 550px) {
    max-width: 90%;
  }
`;


export default ({
  selectedYear,
  selectedDatasetKey,
  onChangeFilter,
  onSelectSchool,
  locationKeys
}) => (
  <div>
    <MainNav className="header MainNav">
      <AutoCompleteContainer className="AutoCompleteContainer">
        <AutoComplete
          style={{ width: "100%", zIndex: 100 }}
          dataSource={Object.keys(scores[[null, 'asd', 'alaska'][selectedDatasetKey]][[null, '2018', '2017'][selectedYear]])}
          onSelect={onSelectSchool}
          placeholder="Search by school name"
          filterOption={(inputValue, option) =>
            option.props.children
              .toUpperCase()
              .indexOf(inputValue.toUpperCase()) !== -1
          }
        >
          <Input
            style={{ zIndex: 100 }}
            suffix={<Icon type="search" className="certain-category-icon" />}
          />
        </AutoComplete>
      </AutoCompleteContainer>
      <LogoWrapper />
    </MainNav>
    <FilterNav className="FilterNav">
      <div className="filters-container">
        <div
          className="dropdown-container"
          style={{ marginRight: "10px", display: "inline" }}
        >
          <Dropdown
            overlay={districtMenu(selectedDatasetKey, key => {
              onChangeFilter("dataset", key);
            })}
            trigger={["click"]}
          >
            <a className="ant-dropdown-link" href="#">
              <FilterIcon type="down" />
              Select Dataset ({[null, 'ASD', 'Alaska Statewide'][selectedDatasetKey]})
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
            Select Year ({[null, 2018, 2017][selectedYear]})
          </a>
        </Dropdown>
      </div>
    </FilterNav>
  </div>
);
