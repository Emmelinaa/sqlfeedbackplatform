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


const NewAreaSelect = () => {
    const { username } = useAuth();
    return (
        <Box>
            <GreetingHeader username={username} />
            {/* <CardContainer /> */}
            <Box sx={{ flexGrow: 1, p: 2 }}>

                <Grid container justifyContent="center" spacing={5}>

                    <Grid item xs={12} md="auto" title="Area NoSQLconcepts">
                        <Box sx={{ width: 350, height: 200, bgcolor: "#1976D2" }} />
                    </Grid>

                    <Grid item xs={12} md="auto" title="Area SQL Beginner">
                        <Box sx={{ width: 350, height: 200, bgcolor: "#388E3C" }} />
                    </Grid>

                </Grid>
            </Box>
        </Box>
    );
}
export default NewAreaSelect;
