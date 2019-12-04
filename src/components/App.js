import React from "react";
import "../App.less";
import {Layout, Modal, Spin} from "antd";
import styled from "styled-components";
import MediaQuery from "react-responsive";
import { addUrlProps, UrlQueryParamTypes } from "react-url-query";

import SideBar from "./SideBar";
import MapContainer from "./MapContainer";
import NavBar from "./NavBar";
import allLocations from "../data/allLocations";
import scores from "../data/scores"
import {Fetch} from "react-request";
import filterFactory, {textFilter, numberFilter, Comparator, multiSelectFilter} from 'react-bootstrap-table2-filter';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import paginationFactory from 'react-bootstrap-table2-paginator';

const asdLocations = allLocations;
const alaskaLocations = allLocations;

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
  selectedDataset: { type: UrlQueryParamTypes.string, queryParam: "dataset" },
  selectedView: { type: UrlQueryParamTypes.string, queryParam: "view" }
};

class App extends React.PureComponent {
  state = Object.freeze({
    selectedSchool: null,
    // selectedYear: "1", // || 1: 2019 - 2: 2018
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
    selectedYear: 2019,
    selectedDataset: "asd",
    selectedView: 'Map'
  };

  componentDidMount() {
    const selectedYear = this.props.selectedYear === 1 ? '2019' : '2018';
    const formattedAsdPlaces = Object.keys(scores['asd'][selectedYear]).filter(it => Boolean(asdLocations[it])).map(place => {
      return ({
        name: place,
        lat: asdLocations[place].lat,
        lng: asdLocations[place].lng,
        show: false
      })
    });

    const formattedAlaskaPlaces = Object.keys(scores['alaska'][selectedYear]).filter(it => Boolean(alaskaLocations[it])).map(place => {
      return ({
        name: place,
        lat: alaskaLocations[place].lat,
        lng: alaskaLocations[place].lng,
        show: false
      })
    });

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
    } else if (filter === 'view') {
      onChangeUrlQueryParams({
        selectedView: key
      });
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
    return this.props.selectedYear === 2019 ? "1" : "2";
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
    // http://payroll.alaskapolicyforum.net/peaks/?school_name=Susitna%20Elementary&year=2019

    const { selectedYear } = this.props;
    const { selectedSchool } = this.state;
    const year = barelyUpdatedYear ? barelyUpdatedYear : selectedYear;



    // NOTE! this year does not agree with the API's year, so we will subtract 1
    const queryStr = qs.stringify({ school_name: selectedSchool, year: (year - 1) });
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
      if (index < 0) return state;
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
    const { selectedYear } = this.props;
    const year = selectedYear;
    const queryStr = qs.stringify({ year });
    const urlStr = `${BASE_API_URL}${queryStr}`;
    return (
      <Layout>
        <NavBar
          selectedYear={this.getSelectedYearKey()}
          selectedDatasetKey={selectedDatasetKey}
          selectedView={this.props.selectedView}
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
          {this.props.selectedView === 'Map' && <ContentGrid
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
          </ContentGrid>}
          {this.props.selectedView === 'Table' && <Fetch url={urlStr}>
              {({ fetching, failed, data }) => {
                if (fetching) {
                  return <div style={{display: 'flex', justifyContent: 'center', padding: '40px'}}><Spin size={'large'} tip="Loading Data..." /></div>;
                }

                if (failed) {
                  return <div>The request did not succeed.</div>;
                }

                if (data) {
                  const selectOptions = {
                    3: '3',
                    4: '4',
                    5: '5',
                    6: '6',
                    7: '7',
                    8: '8',
                    9: '9',
                    'All Grades': 'All Grades',
                  };
                  const columns = [{
                    dataField: 'District_Name',
                    text: 'District Names',
                    sort: true,
                    filter: multiSelectFilter({
                      options: data.filter(Boolean).sort((a, b) => (a.District_Name > b.District_Name) ? 1 : -1 ).reduce((acc, el) => {
                        console.log(el.District_Name)
                        if (!el) return acc
                        return {
                          ...acc,
                          [el.District_Name]: el.District_Name
                        }
                      }, {})
                    }),
                }, {
                    dataField: 'school_name',
                    text: 'School Name',
                    filter: textFilter(),
                    sort: true,
                }, {
                    dataField: 'grade',
                    sort: true,
                    text: 'Grades',
                    filter: multiSelectFilter({
                    options: selectOptions,
                    defaultValue: ['All Grades'],
                  })}, {
                    dataField: 'Subject',
                    text: 'Subjects',
                    sort: true,
                    filter: multiSelectFilter({
                    options: {'ELA': 'ELA', 'Math': 'Math', 'Science': 'Science'},
                  }),
                  }, {
                    dataField: 'NotProficientPercent',
                    text: '% Not Proficient',
                    filter: numberFilter({
                      defaultValue: { number: -0.01, comparator: Comparator.GT }
                    }),
                    formatter: cell => cell.replace(/(?!\.)(\D)/g, '') || '*',
                    sortValue: cell => parseInt(cell.replace(/(?!\.)(\D)/g, '') || '*'),
                    sort: true
                  }];

                  const defaultSorted = [{
                    dataField: 'school_name',
                    order: 'asc'
                  }];

                  const rowClasses = (row, rowIndex) => {
                    let classes = null;
                    console.log(row)
                    if (parseInt(row.ProficientPercent) > 70) {
                      classes = 'green';
                    } else if (parseInt(row.ProficientPercent) > 50) {
                      classes = 'yellow';
                    } else if (parseInt(row.ProficientPercent) > 0) {
                      classes = 'red'
                    } else {
                      classes = 'nodata';
                    }
                    return classes;
                  };
                  const options = {
                    paginationSize: 50,
                    pageStartIndex: 0,
                    // alwaysShowAllBtns: true, // Always show next and previous button
                    // withFirstAndLast: false, // Hide the going to First and Last page button
                    // hideSizePerPage: true, // Hide the sizePerPage dropdown always
                    // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
                    firstPageText: 'First',
                    prePageText: 'Back',
                    nextPageText: 'Next',
                    lastPageText: 'Last',
                    nextPageTitle: 'First page',
                    prePageTitle: 'Pre page',
                    firstPageTitle: 'Next page',
                    lastPageTitle: 'Last page',
                    showTotal: true,
                    sizePerPageList: [{
                      text: '50', value: 50
                    }, {
                      text: '100', value: 100
                    }, {
                      text: 'All', value: data.length
                    }] // A numeric array is also available. the purpose of above example is custom the text
                  };
                  return (
                      <div style={{padding: '40px'}}>
                        {/*{JSON.stringify(data)}*/}
                        <BootstrapTable
                            condensed
                            bootstrap4
                            rowClasses={ rowClasses }
                            defaultSorted={defaultSorted}
                            keyField='id'
                            data={data.map(el => ({...el, ProficientPercent: el.ProficientPercent.replace(/(?!\.)(\D)/g, '') || ''}))}
                            columns={ columns }
                            filter={ filterFactory() }
                            pagination={paginationFactory(options)}
                            so />
                      </div>
                  );
                }

                return null;
              }}
            </Fetch>}
        </Layout>
      </Layout>
    );
  }
}

export default addUrlProps({ urlPropsQueryConfig })(App);
