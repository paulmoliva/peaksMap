import React from "react";
import "../App.less";
import { Layout, Modal } from "antd";
import styled from "styled-components";
import MediaQuery from "react-responsive";
import SideBar from "./SideBar";
import MapContainer from "./MapContainer";
import NavBar from "./NavBar";
import { asdLocations, asdScores } from "../data/asd";
import { alaskaLocations, alaskaScores } from "../data/alaska";
import { Icon } from "antd";

const qs = require("qs");

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

const scores = {
  asd: asdScores,
  alaska: alaskaScores
};

class App extends React.Component {
  state = {
    selectedSchool: null,
    selectedYear: "1", // || 1: 2018 - 2: 2017
    selectedDataset: "1", // || 1: 'asd' - 2: 'statewide'
    schoolData: [],
    loadingSchool: false,
    modalOpen: false,
    forceShowWelcome: false
  };

  onChangeFilter(filter, key) {
    if (filter === "year") {
      this.setState({ selectedYear: key }, () => {
        this.fetchSchoolData();
      });
    } else {
      this.setState({ selectedDataset: key });
    }
  }

  async fetchSchoolData() {
    // http://payroll.alaskapolicyforum.net/peaks/?school_name=Susitna%20Elementary&year=2018

    const { selectedSchool, selectedYear } = this.state;
    const baseUrl =
      "http://payroll-env2.d3mfd6heik.us-west-2.elasticbeanstalk.com/peaks?";
    const year = selectedYear === "1" ? 2018 : 2017;
    const queryStr = qs.stringify({ school_name: selectedSchool, year });
    const urlStr = `${baseUrl}${queryStr}`;

    this.setState({ loadingSchool: true });
    const response = await fetch(urlStr);
    const schoolData = await response.json();
    this.setState({ schoolData, loadingSchool: false });
  }

  makeMarkers(selectedDistrictCoordinates, selectedScores) {
    const determineFillColor = marker => {
      const currentScores = selectedScores[marker];
      if (!currentScores) {
        return "white";
      } else {
        const averageScore =
          (parseInt(currentScores["Math"]) + parseInt(currentScores["ELA"])) /
          2;

        if (averageScore < 31) {
          return "green";
        } else if (averageScore < 51) {
          return "yellow";
        } else {
          return "red";
        }
      }
    };

    return Object.keys(selectedDistrictCoordinates).map(marker => (
      <Icon
        lat={selectedDistrictCoordinates[marker].lat}
        lng={selectedDistrictCoordinates[marker].lng}
        type="home"
        theme="twoTone"
        twoToneColor={determineFillColor(marker)}
        // twoToneColor="#eb2f96"
        onClick={() => {
          this.switchSchoolAndFetch(marker);
        }}
      />
    ));
  }

  switchSchoolAndFetch(school) {
    this.setState({ selectedSchool: school, modalOpen: true }, () => {
      this.fetchSchoolData(school);
    });
  }

  render() {
    const { selectedDataset } = this.state;

    const selectedDistrictCoordinates =
      selectedDataset === "1"
        ? locationCoordinates.asd
        : locationCoordinates.alaska;

    // const selectedScores = selectedDataset === "1" ? scores.asd : scores.alaska;
    const selectedScores = scores.asd;

    const Markers = this.makeMarkers(
      selectedDistrictCoordinates,
      selectedScores
    );

    return (
      <Layout>
        <NavBar
          selectedYear={this.state.selectedYear}
          selectedDataset={this.state.selectedDataset}
          selectedSchool={this.state.selectedSchool}
          onChangeFilter={(filter, key) => this.onChangeFilter(filter, key)}
          onSelectSchool={school => this.switchSchoolAndFetch(school)}
          locationKeys={Object.keys(selectedDistrictCoordinates)}
        />
        {/* https://ant.design/components/modal/ */}
        <MediaQuery maxWidth={768}>
          <Modal
            centered
            visible={this.state.modalOpen}
            footer={null}
            onCancel={() => {
              this.setState({ modalOpen: false });
              // add a timeout so that the screen doesn't flicker when switching from welcome page
              // to school data
              setTimeout(() => {
                this.setState({ forceShowWelcome: false });
              }, 200);
            }}
          >
            <SideBar
              selectedYear={this.state.selectedYear === "1" ? 2018 : 2017}
              selectedSchool={this.state.selectedSchool}
              forceShowWelcome={this.state.forceShowWelcome}
              schoolData={this.state.schoolData}
              loadingSchool={this.state.loadingSchool}
              height="76vh"
            />
          </Modal>
        </MediaQuery>
        <Layout>
          <ContentGrid
            className="ContentGrid"
            style={{
              background: "#fff",
              margin: 0,
              minHeight: 280
            }}
          >
            <MapContainer
              height="85vh"
              selectedDataset={this.state.selectedDataset}
              openModal={() =>
                this.setState({ modalOpen: true, forceShowWelcome: true })
              }
            >
              {Markers}
            </MapContainer>

            <MediaQuery minWidth={769}>
              <SideBar
                selectedYear={this.state.selectedYear === "1" ? 2018 : 2017}
                selectedSchool={this.state.selectedSchool}
                schoolData={this.state.schoolData}
                loadingSchool={this.state.loadingSchool}
                height="76vh"
              />
            </MediaQuery>
          </ContentGrid>
        </Layout>
      </Layout>
    );
  }
}

export default App;
