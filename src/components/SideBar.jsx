import React from "react";
import styled from "styled-components";
import { Typography, Tabs, Divider, Spin } from "antd";
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const SideBarContainer = styled.div`
  right: 0;
  z-index: 1100;
  height: 100%;
`;

const SideBarContent = styled.div`
  box-sizing: border-box;
  overflow: auto;
  height: ${props => props.maxHeight};
`;

const WelcomeDetailsStyle = styled.div`
  padding: 5px;
`;

const WelcomeDetails = () => (
  <WelcomeDetailsStyle>
    <Title>PEAKS Data Map</Title>
    <Paragraph>
      Welcome to the Alaska Policy Forum Interactive Performance Evaluation for
      Alaska's Schools (PEAKS) Data Map.
    </Paragraph>
    <Paragraph>
      Click a pin on the map to view test scores for that school.
    </Paragraph>
    <Paragraph>Click the + or - on the map to zoom in and out.</Paragraph>
    <Paragraph>
      Alternatively, type a school name into the search bar and select the
      corresponding search result.
    </Paragraph>
  </WelcomeDetailsStyle>
);

const TabPaneContent = styled.div`
  display: ${props => (props.loading ? "flex" : "block")};
  padding-top: ${props => (props.loading ? "30px" : "0")};
  justify-content: center;
`;

const createTabPane = (subject, key, schoolData, loadingSchool) => {
  const subjectGradeData = schoolData.filter(
    school => school.Subject === subject
  );

  let prettySchoolData = subjectGradeData.map(data => {
    let percentageFormatted;
    const percentage = parseInt(data.NotProficientPercent.split("%")[0]);

    if (Number.isInteger(percentage)) {
      percentageFormatted = `${Math.floor(percentage)}%`;
    } else {
      percentageFormatted = "Unknown";
    }
    
    const proficiencyDescription = "below proficient";

    const getGradeHeader = grade =>
      grade === "All Grades" ? (
        <Paragraph strong>All Grades:</Paragraph>
      ) : (
        <Paragraph>Grade {grade}:</Paragraph>
      );

    return (
      <div key={`${data.grade}`}>
        {getGradeHeader(data.grade)}
        <Paragraph>
          <Text strong> {percentageFormatted} </Text>
          <Text>{proficiencyDescription}</Text>
        </Paragraph>
      </div>
    );
  });

  if (!prettySchoolData.length && !loadingSchool) {
    prettySchoolData = (
      <div>
        <Paragraph>No data found.</Paragraph>
      </div>
    );
  }

  return (
    <TabPane tab={subject} key={key}>
      <TabPaneContent loading={loadingSchool}>
        {loadingSchool ? <Spin /> : prettySchoolData}
      </TabPaneContent>
    </TabPane>
  );
};

const SchoolDetails = ({
  selectedSchool,
  selectedYear,
  schoolData,
  loadingSchool,
  setActiveKey,
  activeKey
}) => (
  <WelcomeDetailsStyle>
    <Title>{selectedSchool}</Title>
    <Paragraph> Year: {selectedYear} </Paragraph>
    <Divider />
    <Tabs
      animated={false}
      activeKey={activeKey}
      onTabClick={key => setActiveKey(key)}
    >
      {createTabPane("ELA", "1", schoolData, loadingSchool)}
      {createTabPane("Math", "2", schoolData, loadingSchool)}
      {createTabPane("Science", "3", schoolData, loadingSchool)}
    </Tabs>
  </WelcomeDetailsStyle>
);

export default class extends React.Component {
  state = {
    activeKey: "1"
  };

  componentDidUpdate(prevProps) {
    const prevSchool = prevProps.selectedSchool;
    const { selectedSchool } = this.props;
    if (selectedSchool !== prevSchool) {
      this.setState({ activeKey: "1" });
    }
  }

  render() {
    const {
      schoolData,
      selectedSchool,
      selectedYear,
      loadingSchool,
      height,
      forceShowWelcome
    } = this.props;
    return (
      <SideBarContainer>
        <SideBarContent maxHeight={height}>
          {selectedSchool && !forceShowWelcome ? (
            <SchoolDetails
              schoolData={schoolData}
              loadingSchool={loadingSchool}
              selectedSchool={selectedSchool}
              selectedYear={selectedYear}
              setActiveKey={activeKey => this.setState({ activeKey })}
              activeKey={this.state.activeKey}
            />
          ) : (
            <WelcomeDetails />
          )}
        </SideBarContent>
      </SideBarContainer>
    );
  }
}
