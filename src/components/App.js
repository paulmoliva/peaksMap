import React from "react";
import "../App.less";
import { Layout, Modal } from "antd";
import styled from "styled-components";
import MediaQuery from "react-responsive";
import SideBar from "./SideBar";
import MapContainer from "./MapContainer";
import NavBar from "./NavBar";
import asdLocations from "../data/asd";
import alaskaLocations from "../data/alaska";
import { Icon } from "antd";

const { Content } = Layout;

// http://grid.malven.co/
const ContentGrid = styled(Content)`
  display: grid;
  grid-template-columns: 60% 38%;
  grid-column-gap: 2%;

  @media (max-width: 768px) {
    display: block;
  }
`;

const locationCoordinates = {
  asd: asdLocations,
  alaska: alaskaLocations
};

const Marker = styled.div`
  border-radius: 100;
  width: 2000px;
  height: 2000px;
  z-index: 10000;
  /* background: ${props => props.color}; */
  background: "white";
`;

class App extends React.Component {
  state = {
    selectedSchool: null,
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
    const { selectedDataset } = this.state;

    const selectedDistrictCoordinates =
      selectedDataset === "1"
        ? locationCoordinates.asd
        : locationCoordinates.alaska;

    const Markers = Object.keys(selectedDistrictCoordinates).map(marker => (
      <Icon
        lat={selectedDistrictCoordinates[marker].lat}
        lng={selectedDistrictCoordinates[marker].lng}
        type="home"
        theme="twoTone"
        twoToneColor="#eb2f96"
        onClick={() => this.setState({ selectedSchool: marker })}
      />
    ));
    // const Markers = Object.keys(selectedDistrictCoordinates).map(marker => (
    //   <Marker
    //     lat={selectedDistrictCoordinates[marker].lat}
    //     lng={selectedDistrictCoordinates[marker].lng}
    //     color="white"
    //   />
    // ));

    // github.com/google-map-react/old-examples/blob/master/web/flux/components/examples/x_main/main_map_block.jsx
    return (
      <Layout>
        <NavBar
          selectedYear={this.state.selectedYear}
          selectedDataset={this.state.selectedDataset}
          selectedSchool={this.state.selectedSchool}
          onChangeFilter={(filter, key) => this.onChangeFilter(filter, key)}
          onSelectSchool={school => this.setState({ selectedSchool: school })}
          locationKeys={Object.keys(selectedDistrictCoordinates)}
        />
        {/* https://ant.design/components/modal/ */}
        <Modal centered visible>
          <SideBar />
        </Modal>
        {/* {this.state.selectedSchool} */}
        <Layout>
          {/* <Layout style={{ padding: "0 24px 24px" }}> */}
          <ContentGrid
            className="ContentGrid"
            style={{
              background: "#fff",
              // padding: 24,
              margin: 0,
              minHeight: 280
            }}
          >
            <MapContainer>{Markers}</MapContainer>

            <MediaQuery maxWidth={768}>
              <SideBar />
            </MediaQuery>
          </ContentGrid>
          {/* </Layout> */}
        </Layout>
      </Layout>
    );
  }
}

export default App;
