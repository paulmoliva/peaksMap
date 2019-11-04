import React from "react";
import "../App.less";
import { Layout, Modal } from "antd";
import styled from "styled-components";
import MediaQuery from "react-responsive";
import { addUrlProps, UrlQueryParamTypes } from "react-url-query";

import SideBar from "./SideBar";
import MapContainer from "./MapContainer";
import NavBar from "./NavBar";
import { asdLocations } from "../data/asd";
import { alaskaLocations } from "../data/alaska";
import scores from "../data/scores"

const qs = require("qs");
const BASE_API_URL =
  "http://payroll-env2.d3mfd6heik.us-west-2.elasticbeanstalk.com/peaks?";

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

const urlPropsQueryConfig = {
  selectedYear: { type: UrlQueryParamTypes.number, queryParam: "year" },
  selectedDataset: { type: UrlQueryParamTypes.string, queryParam: "dataset" }
};

class App extends React.PureComponent {
  state = Object.freeze({
    selectedSchool: null,
    // selectedYear: "1", // || 1: 2018 - 2: 2017
    // selectedDataset: "1", // || 1: 'asd' - 2: 'statewide'
    schoolData: [],
    loadingSchool: false,
    modalOpen: false,
    forceShowWelcome: false,
    places: {
      asd: [],
      alaska: []
    }
  });

  static defaultProps = {
    selectedYear: 2018,
    selectedDataset: "asd"
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
    const { onChangeUrlQueryParams } = this.props;
    if (filter === "year") {
      onChangeUrlQueryParams({
        selectedYear: key
      });
      this.fetchSchoolData(key);
      // this.setState({ selectedYear: key }, () => {
      // });
    } else {
      // switch district
      onChangeUrlQueryParams({
        selectedDataset: key
      });

      this.closeAllInfowindows(key);
      // this.setState({ selectedDataset: key }, () => {
      //   this.closeAllInfowindows();
      // });
    }
  }

  getSelectedDatasetKey() {
    return this.props.selectedDataset === 'asd' ? "1"  : "2";
  }

  getSelectedYearKey() {
    return this.props.selectedYear === 2018 ? "1" : "2";
  }

  // TODO: UPDATE THIS BROKEN SHIT
  closeAllInfowindows(selectedDataset) {
    this.setState(state => {
      // get the old open one too

      const selectedPlaces = this.getSelectedPlaces(selectedDataset);
      const showResetPlaces = selectedPlaces.map(place => ({
        ...place,
        show: false
      }));

      if (selectedDataset === "asd") {
        return { places: { ...this.state.places, asd: showResetPlaces } };
      } else {
        return { places: { ...this.state.places, alaska: showResetPlaces } };
      }
    });
  }

  async fetchSchoolData(barelyUpdatedYear) {
    // http://payroll.alaskapolicyforum.net/peaks/?school_name=Susitna%20Elementary&year=2018

    const { selectedYear } = this.props;
    const { selectedSchool } = this.state;
    const year = barelyUpdatedYear ? barelyUpdatedYear : selectedYear;
    
    const queryStr = qs.stringify({ school_name: selectedSchool, year });
    const urlStr = `${BASE_API_URL}${queryStr}`;

    this.setState({ loadingSchool: true });
    const response = await fetch(urlStr);
    const schoolData = await response.json();
    this.setState({ schoolData, loadingSchool: false });
  }

  switchSchoolAndFetch(school) {
    this.setState({ selectedSchool: school, modalOpen: true }, () => {
      this.fetchSchoolData();
    });
  }

  getSelectedPlaces(barelyUpdatedDataSet) {
    const { places } = this.state;
    const { selectedDataset } = this.props;
    const finalDataset = barelyUpdatedDataSet
      ? barelyUpdatedDataSet
      : selectedDataset;

    if (finalDataset === "asd") {
      return places.asd;
    } else {
      return places.alaska;
    }
  }

  toggleShowInfo(key) {
    this.setState(state => {
      // get the old open one too

      const selectedPlaces = this.getSelectedPlaces();
      const lastOpenIndex = selectedPlaces.findIndex(e => e.show);

      const index = selectedPlaces.findIndex(e => e.name === key);

      // selectedPlaces[index].show = !selectedPlaces[index].show; // eslint-disable-line no-param-reassign
      selectedPlaces[index].show = true; // eslint-disable-line no-param-reassign
      if (lastOpenIndex !== -1) {
        selectedPlaces[lastOpenIndex].show = false;
      }

      if (this.props.selectedDataset === "asd") {
        return { places: { ...this.state.places, asd: selectedPlaces } };
      } else {
        return { places: { ...this.state.places, alaska: selectedPlaces } };
      }
    });
  }

  render() {
    const { places } = this.state;

    const { selectedDataset } = this.props;

    const selectedDistrictCoordinates =
      selectedDataset === "asd"
        ? locationCoordinates.asd
        : locationCoordinates.alaska;
    console.log(selectedDataset, this.props)
    const selectedScores = scores[selectedDataset][this.props.selectedYear];

    const selectedSchoolCoordinates =
      selectedDistrictCoordinates[this.state.selectedSchool];

    const selectedDatasetKey = this.getSelectedDatasetKey();

    return (
      <Layout>
        <NavBar
          selectedYear={this.getSelectedYearKey()}
          selectedDatasetKey={selectedDatasetKey}
          selectedSchool={this.state.selectedSchool}
          onChangeFilter={(filter, key) => this.onChangeFilter(filter, key)}
          onSelectSchool={school => {
            this.switchSchoolAndFetch(school);
            this.toggleShowInfo(school);
          }}
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
              selectedYear={this.props.selectedYear}
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
              height={window.innerHeight < 768 ? "72vh" : "85vh"}
              places={places}
              selectedPlaces={this.getSelectedPlaces()}
              selectedScores={selectedScores}
              selectedDistrictCoordinates={selectedDistrictCoordinates}
              switchSchoolAndFetch={school => this.switchSchoolAndFetch(school)}
              selectedDataset={selectedDataset}
              selectedSchoolCoordinates={selectedSchoolCoordinates}
              toggleShowInfo={key => this.toggleShowInfo(key)}
              openModal={() =>
                this.setState({ modalOpen: true, forceShowWelcome: true })
              }
            />

            <MediaQuery minWidth={769}>
              <SideBar
                selectedYear={this.props.selectedYear}
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

export default addUrlProps({ urlPropsQueryConfig })(App);
