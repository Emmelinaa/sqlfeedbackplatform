import React from "react";
import { Box } from "@mui/material";
import CardContainer from "../components/dashboardComponents/cardContainer";
import GreetingHeader from "../components/dashboardComponents/greetingHeader";
import BarChartC from "../components/dashboardComponents/barChart";
import LineChartC from "../components/dashboardComponents/lineChart";
import RankingList from "../components/dashboardComponents/rankingList";
import Grid from "@mui/material/Grid";
import { useAuth } from '../App';
import SurveyLink from "../components/surveyComponents/surveyLink";
import { useLocation, useNavigate } from "react-router-dom";


const NewDashboard = () => {
  const { username } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to /area-select if no valid area is entered
  if (location.pathname === "/dashboard" 
    || ( !location.pathname.includes("?area=sql-beginner")
        && !location.pathname.includes("?area=nosqlconcepts") ) ) {
    navigate ("/area-select");
  } 
  
  const courseParams = new URLSearchParams(location.search);
  const courseArea = courseParams.get("area");

  return (
    <Box>
      <GreetingHeader username={username} />

      {/* Filter the dashboard content based on the selected course area */}
      <CardContainer area={courseArea} />

      <Box sx={{ flexGrow: 1, p:2 }}>
        <Grid container spacing={2}>
         
          <Grid item xs={12} md={6} title="Average Time to Solve a Task (in Minutes)">
            <BarChartC isUser={true} isTimeChart={true} />
          </Grid>
          <Grid item xs={12} md={6} title="Task Overview">
            <BarChartC isUser={true} isTimeChart={false} />
          </Grid>
          <Grid item xs={12} md={8} title="Query Execution Timeline">
            <LineChartC />
          </Grid>
          <Grid item xs={12} md={4} title="Course Summary">
            <RankingList />
          </Grid>
          <Grid item xs={12} md={4} title="Evaluation Survey">
            <SurveyLink />
          </Grid> 
        </Grid>
      </Box>
    </Box>
  );
};



export default NewDashboard;
