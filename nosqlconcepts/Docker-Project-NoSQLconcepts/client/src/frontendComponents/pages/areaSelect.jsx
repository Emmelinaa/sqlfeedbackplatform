// import React from "react";
import React, { useState } from "react";
import { Box } from "@mui/material";
import CardContainer from "../components/dashboardComponents/cardContainer";
import GreetingHeader from "../components/dashboardComponents/greetingHeader";
import BarChartC from "../components/dashboardComponents/barChart";
import LineChartC from "../components/dashboardComponents/lineChart";
import RankingList from "../components/dashboardComponents/rankingList";
import Grid from "@mui/material/Grid";
import { useAuth } from '../App';
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import SurveyLink from "../components/surveyComponents/surveyLink";


const NewAreaSelect = () => {
    const { username } = useAuth();

    // Just for testing, it's going to the backend later
    const rightNoSQLPassword = "NoSQLGoethe";
    const rightSQLPassword = "GoetheSQL";

    const [nosqlPassword, setNosqlPassword] = useState("");
    const [nosqlError, setNosqlError] = useState("");
    const [sqlPassword, setSQLPassword] = useState("");
    const [sqlError, setSQLError] = useState("");
    const navigate = useNavigate();

    // NoSQLconcepts Login
    const handleNosqlLogin = () => {
        if (nosqlPassword === rightNoSQLPassword) {
            navigate("/sql-nosql-dashboard");
        } else {
            setNosqlError("Falsches Passwort!");
        }
    };

    // SQL-Beginner Login
    // TODO: /dashboard-sql is not created yet
    const handleSQLLogin = () => {
        if (sqlPassword === rightSQLPassword) {
            navigate("/dashboard-sql");
        } else {
            setSQLError("Falsches Passwort!");
        }
    };

    return (
        <Box>
            <GreetingHeader username={username} />
            <Box sx={ { flexGrow: 1, p: 2 } }>

                <Box sx={ { textAlign: "center", mb: 3 } }>
                    <h2>Kursauswahl</h2>
                    <p>Wählen Sie einen Bereich aus. Das zugehörige Passwort finden Sie auf Ihrer Kursseite.</p>
                </Box>

                <Grid container justifyContent="center" spacing={5}>
                    <Grid item xs={12} md="auto" title="NoSQLconcepts">
                        <Box sx={ {
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
                            <span style={ { color: "#1976D2", fontSize: "21px" } }>
                                NoSQLconcepts
                            </span>

                            <TextField
                                label="Passwort"
                                type="password"
                                // placeholder="Passwort"
                                value={nosqlPassword}
                                onChange={e => setNosqlPassword(e.target.value)}
                                sx={ { mt: "15px", p: "5px", width: "80%" } }
                                InputProps={ { style: { backgroundColor: "#fff" } } }
                            />

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
                                    marginTop: "20px" } }
                                onClick={handleNosqlLogin}
                                >
                                Auswählen
                            </button>
                            {nosqlError && <div style={ { color: "red", marginTop: "8px" } }>{nosqlError}</div>}
                        </Box>  
                    </Grid>

                    <Grid item xs={12} md="auto" title="SQL-Beginner">
                        <Box sx={ {
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
                            <span style={ { color: "#388E3C", fontSize: "21px" } }>
                                SQL-Beginner
                            </span>
                            
                            <TextField
                                label="Passwort"
                                type="password"
                                // placeholder="Passwort"
                                value={sqlPassword}
                                onChange={e => setSQLPassword(e.target.value)}
                                sx={ { mt: "15px", p: "5px", width: "80%" } }
                                InputProps={ { style: { backgroundColor: "#fff" } } }
                            />

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
                                    marginTop: "20px" } }
                                onClick={handleSQLLogin}
                                >
                                Auswählen
                            </button>
                            {sqlError && <div style={ { color: "red", marginTop: "8px" } }>{sqlError}</div>}
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <hr style={ { width: "750px", margin: "20px auto", border: "1px solid #b1b6bbff" } } />
                    </Grid>

                </Grid>

                <Box sx={ { textAlign: "center", mb: 3 } }>
                    <p>Sie können später jederzeit wechseln.</p>
                </Box>

            </Box>
        </Box>
    );
}
export default NewAreaSelect;

// Main colors
// bgcolor: "#F7F9FC"
// bgcolor: "#1976D2"
// bgcolor: "#388E3C"