import React from "react";
import "../App.less";
import { Layout, Modal } from "antd";
import styled from "styled-components";
import MediaQuery from "react-responsive";
import { addUrlProps, UrlQueryParamTypes } from "react-url-query";

import SideBar from "./SideBar";
import MapContainer from "./MapContainer";
import NavBar from "./NavBar";
import { asdLocations, asdScores } from "../data/asd";
import { alaskaLocations, alaskaScores } from "../data/alaska";

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

const urlPropsQueryConfig = {
  bar: { type: UrlQueryParamTypes.string },
  foo: { type: UrlQueryParamTypes.number, queryParam: "fooInUrl" }
};

class App extends React.PureComponent {
  state = {
    selectedSchool: null,
    selectedYear: "1", // || 1: 2018 - 2: 2017
    selectedDataset: "1", // || 1: 'asd' - 2: 'statewide'
    schoolData: [],
    loadingSchool: false,
    modalOpen: false,
    forceShowWelcome: false,
    places: {
      asd: [],
      alaska: []
    }
  };

  static defaultProps = {
    foo: 123,
    bar: "bar"
  };

  componentDidMount() {
    const formattedAsdPlaces = Object.keys(asdLocations).map(place => ({
      name: place,
      lat: asdLocations[place].lat,
      lng: asdLocations[place].lng,
      show: false
    }));

    const formattedAlaskaPlaces = Object.keys(alaskaLocations).map(place => ({
      name: place,
      lat: alaskaLocations[place].lat,
      lng: alaskaLocations[place].lng,
      show: false
    }));

    this.setState({
      places: { alaska: formattedAlaskaPlaces, asd: formattedAsdPlaces }
    });
  }

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

  switchSchoolAndFetch(school) {
    this.setState({ selectedSchool: school, modalOpen: true }, () => {
      this.fetchSchoolData(school);
    });
  }

  toggleShowInfo(key) {
    this.setState(state => {
      const selectedPlace =
        this.state.selectedDataset === "1"
          ? this.state.places.asd
          : this.state.places.alaska;

      const index = selectedPlace.findIndex(e => e.name === key);
      debugger;
      selectedPlace[index].show = !selectedPlace[index].show; // eslint-disable-line no-param-reassign
      if (this.state.selectedDataset === "1") {
        return { places: { ...this.state.places, asd: selectedPlace } };
      } else {
        return { places: { ...this.state.places, alaska: selectedPlace } };
      }
    });
  }

  render() {
    const { selectedDataset, places } = this.state;

    const selectedDistrictCoordinates =
      selectedDataset === "1"
        ? locationCoordinates.asd
        : locationCoordinates.alaska;

    const selectedScores = scores.asd;

    const selectedSchoolCoordinates =
      selectedDistrictCoordinates[this.state.selectedSchool];

    const {
      foo,
      bar,
      onChangeFoo,
      onChangeBar,
      onChangeUrlQueryParams
    } = this.props;

    console.log(bar);

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
              places={places}
              selectedScores={selectedScores}
              selectedDistrictCoordinates={selectedDistrictCoordinates}
              switchSchoolAndFetch={school => this.switchSchoolAndFetch(school)}
              selectedDataset={this.state.selectedDataset}
              selectedSchoolCoordinates={selectedSchoolCoordinates}
              toggleShowInfo={key => this.toggleShowInfo(key)}
              openModal={() =>
                this.setState({ modalOpen: true, forceShowWelcome: true })
              }
            />
            {/* {Markers}
            </MapContainer> */}

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

// export default App;

export default addUrlProps({ urlPropsQueryConfig })(App);
