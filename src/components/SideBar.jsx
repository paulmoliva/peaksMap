import React from "react";
import styled from "styled-components";
import { Typography, Tabs, Divider, Spin } from "antd";
import MediaQuery from "react-responsive";
import {COLORS} from "../data/constants";
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const SideBarContainer = styled.div`
  right: 0;
  z-index: 900;
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

const Legend = styled.div`
  width: 300px;
  height: 200px;
  position: absolute;
  bottom: 0;
  left: 0;
  background: rgba(121, 121, 121, 0.66);
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
`;

const LegendItemStyle = styled.div`
  color: white;
  display: flex;
  padding-left: 20px;
`;

const ColorSquare = styled.div`
  background: ${props => props.color};
  width: 30px;
  height: 20px;
  margin-right: 10px;
`;

const LegendItem = ({ initialRange, finalRange }) => {
    let color;
    if (initialRange === 0) {
        color = COLORS.GREEN;
    } else if (initialRange === 31) {
        color = COLORS.YELLOW;
    } else {
        color = COLORS.RED;
    }

    return (
        <LegendItemStyle className="LegendItemStyle">
            <ColorSquare color={color} className="ColorSquare" />
            <Paragraph style={{ color: "black" }}>
                {initialRange}% - {finalRange}% below proficiency
            </Paragraph>
        </LegendItemStyle>
    );
};

const WelcomeDetails = () => (
  <WelcomeDetailsStyle>
    <Title>Public School Performance Map</Title>
    <Paragraph>
      Welcome to the Alaska Policy Forum Interactive Public School Performance Data Map.
    </Paragraph>
    <Paragraph>
      Click a pin on the map to view test scores for that school.
    </Paragraph>
    <Paragraph>Click the + or - on the map to zoom in and out.</Paragraph>
    <Paragraph>
      Alternatively, type a school name into the search bar and select the
      corresponding search result.
    </Paragraph>
    <Paragraph>
      The Performance Evaluation for Alaska's Schools (PEAKS) examination was in effect from 2018 to 2021. The Alaska
      Department of Education switched to the Alaska System of Academic Readiness (AK STAR) examination in 2022.
      All results may be found <a style={{ color: "lightblue"}} href src="https://education.alaska.gov/assessments/results">here</a>.
    </Paragraph>
    <MediaQuery maxWidth={768}>
        <LegendItem initialRange={0} finalRange={30}>Below 50%</LegendItem>
        <LegendItem initialRange={31} finalRange={50}></LegendItem>
        <LegendItem initialRange={51} finalRange={100}></LegendItem>
    </MediaQuery>
  </WelcomeDetailsStyle>
);

const TabPaneContent = styled.div`
  display: ${props => (props.loading ? "flex" : "block")};
  padding-top: ${props => (props.loading ? "30px" : "0")};
  justify-content: center;
`;

const SubjectGradeView = styled.div`
  text-align: ${props => props.isGradeSummary ? 'center' : 'default'};
  font-size: ${props => props.isGradeSummary ? '16px' : 'inherit'};
`;

const createTabPane = (subject, key, schoolData, loadingSchool) => {
  const subjectGradeData = schoolData.filter(
    school => school.Subject === subject
  );

  // const sortedSubjectGradeData = subjectGradeData.sort();

  

  let prettySchoolData = subjectGradeData.sort((a, b) => {
      console.log(a, b);
      let gradeA = a.grade;
      let gradeB = b.grade;
      if (a.grade === 'All Grades') gradeA = 99;
      if (b.grade === 'All Grades') gradeB = 99;
      return gradeA - gradeB;
  }).map(data => {
    let percentageFormatted;
    const percentage = parseInt(data.NotProficientPercent.split("%")[0]);

    if (Number.isInteger(percentage)) {
      percentageFormatted = `${Math.floor(percentage)}%`;
    } else {
      percentageFormatted = "Unknown";
    }
    
    const proficiencyDescription = "below proficient";

    const isGradeSummary = data.grade === "All Grades";
    const gradeText = isGradeSummary ? 'All Grades' : `Grade ${data.grade}`;
    return (
      <SubjectGradeView key={`${data.grade}`} isGradeSummary={isGradeSummary}>
        <Paragraph className="grade-header">{gradeText}:</Paragraph>
        <Paragraph className="grade-data">
          <Text strong> {percentageFormatted} </Text>
          <Text>{proficiencyDescription}</Text>
        </Paragraph>
      </SubjectGradeView>
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
