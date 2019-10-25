import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.less";
import Map from "./components/Map";
import NavBar from "./components/NavBar";
import { Layout, Dropdown, Menu, Breadcrumb, Icon } from "antd";

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

class App extends React.Component {
  state = {
    selectedYear: "1", // || 1: 2018 - 2: 2017
    selectedDataset: "1" // || 1: 'asd' - 2: 'statewide'
  };

  onChangeFilter(filter, key) {
    if (filter === "year") {
      this.setState({ selectedYear: key });
    } else {
      this.setState({ selectedDataset: key });
    }
  }

  render() {
    // const [drawerOpenState, toggleDrawer] = useState(false);
    const drawerOpenState = false;
    return (
      <Layout>
        <div
          style={{
            minHeight: "75vh",
            minWidth: "33vh",
            background: "gray",
            position: "fixed",
            top: "18vh",
            left: drawerOpenState ? "0" : "-33vh",
            zIndex: 3
          }}
        >
          Data Here
        </div>
        <NavBar
          selectedYear={this.state.selectedYear}
          selectedDataset={this.state.selectedDataset}
          onChangeFilter={(filter, key) => this.onChangeFilter(filter, key)}
        />
        <Layout>
          <Layout style={{ padding: "0 24px 24px" }}>
            <Breadcrumb style={{ margin: "16px 0" }}>
              <Breadcrumb.Item>
                <a href="#">Home</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <a href="#">Education</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <a href="#">Peaks Data</a>
              </Breadcrumb.Item>
            </Breadcrumb>
            <Content
              style={{
                background: "#fff",
                padding: 24,
                margin: 0,
                minHeight: 280
              }}
            >
              {/* <Map slideOut={() => toggleDrawer(!drawerOpenState)} /> */}
              <Map />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

export default App;
