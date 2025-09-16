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
            <Box sx={{ flexGrow: 1, p: 2 }}>

                <Box sx={{ textAlign: "center", mb: 3 }}>
                    <h2>Kursauswahl</h2>
                    <p>Wählen Sie einen Bereich</p>
                </Box>

                <Grid container justifyContent="center" spacing={5}>
                    <Grid item xs={12} md="auto" title="NoSQLconcepts">
                        <Box sx={{
                            width: 350,
                            height: 200,
                            bgcolor: "#F7F9FC",
                            borderRadius: 3,
                            border: "solid 2px #E4E9F0",
                            p: 2,

                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            } }
                        >
                            <span style={{ color: "#1976D2", fontSize: "21px" }}>
                                NoSQLconcepts
                            </span>
                            <br />
                            <button
                                type="button"
                                id="NoSQL-login"
                                style={ {
                                    backgroundColor: "#1976D2",
                                    color: "white",
                                    borderRadius: 5,
                                    border: "2px solid #1976D2",
                                    cursor: "pointer",
                                    padding: "5px 15px",
                                    marginTop: "20px" } } >
                                Auswählen
                            </button>
                        </Box>  
                    </Grid>

                    <Grid item xs={12} md="auto" title="SQL-Beginner">
                        <Box sx={{
                            width: 350,
                            height: 200,
                            bgcolor: "#F7F9FC",
                            borderRadius: 3,
                            border: "solid 2px #E4E9F0",
                            p: 2,

                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            } }
                        >
                            <span style={{ color: "#388E3C", fontSize: "21px" }}>
                                SQL-Beginner
                            </span>
                            <br />
                            <button
                                type="button"
                                id="SQL-login"
                                style={ {
                                    backgroundColor: "#388E3C",
                                    color: "white",
                                    border: "2px solid #388E3C",
                                    borderRadius: 5,
                                    cursor: "pointer",
                                    padding: "5px 15px",
                                    marginTop: "20px" } } >
                                Auswählen
                            </button>
                        </Box>
                    </Grid>

                </Grid>

            </Box>
        </Box>
    );
}
export default NewAreaSelect;

// Main colors
// bgcolor: "#F7F9FC"
// bgcolor: "#1976D2"
// bgcolor: "#388E3C"