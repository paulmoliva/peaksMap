import React, { useState } from 'react';
import logo from './logo.svg';
import './App.less';
import Map from './components/Map'
import { Layout, Dropdown, Menu, Breadcrumb, Icon } from 'antd';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

function App() {
  const [drawerOpenState, toggleDrawer] = useState(false);
  const districtMenu = (
    <Menu
      theme="dark"
      mode="horizontal"
      defaultSelectedKeys={['2']}
      style={{ lineHeight: '64px' }}
    >
      <Menu.Item key="1">Anchorage School District</Menu.Item>
      <Menu.Item key="2">Alaska Statewide</Menu.Item>
    </Menu>
  )
  const yearMenu = (
    <Menu
      theme="dark"
      mode="horizontal"
      defaultSelectedKeys={['2']}
      style={{ lineHeight: '64px' }}
    >
      <Menu.Item key="1">2018</Menu.Item>
      <Menu.Item key="2">2019</Menu.Item>
    </Menu>
  )
  return (
      <Layout>
        <div
          style={{
            minHeight: '75vh',
            minWidth: '33vh',
            background: 'gray',
            position: "fixed",
            top: '18vh',
            left: drawerOpenState ? '0' : '-33vh',
            zIndex: 3
          }}
        >Data Here</div>
        <Header className="header">
          <div className="logo" />
          <Dropdown overlay={districtMenu} style={{margin: '5px'}}>
            <a className="ant-dropdown-link" href="#">
              Select Dataset <Icon type="down" />
            </a>
          </Dropdown>
          ||||
          <Dropdown overlay={yearMenu}>
            <a className="ant-dropdown-link" href="#">
              Select Year <Icon type="down" />
            </a>
          </Dropdown>
        </Header>
      <Layout>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item><a href='#'>Home</a></Breadcrumb.Item>
            <Breadcrumb.Item><a href='#'>Education</a></Breadcrumb.Item>
            <Breadcrumb.Item><a href='#'>Peaks Data</a></Breadcrumb.Item>
          </Breadcrumb>
          <Content
            style={{
              background: '#fff',
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Map slideOut={() => toggleDrawer(!drawerOpenState)} />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
