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
            navigate("/dashboard?area=nosqlconcepts");
        } else {
            setNosqlError("Wrong Password!");
        }
    };

    // SQL-Beginner Login
    const handleSQLLogin = () => {
        if (sqlPassword === rightSQLPassword) {
            navigate("/dashboard?area=sql-beginner");
        } else {
            setSQLError("Wrong Password!");
        }
    };

    const handleTestArea = () => {
        navigate("/testingArea")
    }

    return (
        <Box>
            <GreetingHeader username={username} />
            <Box sx={ { flexGrow: 1, p: 2 } }>

                <Box sx={ { textAlign: "center", mb: 3 } }>
                    <h2>Course Selection</h2>
                    <p>Select a course area. You can find the corresponding password on your course page.</p>
                </Box>

                {/*NoSQLconcepts*/}
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
                                label="Password"
                                type="password"
                                value={nosqlPassword}
                                onChange={e => setNosqlPassword(e.target.value) }
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
                                Select
                            </button>
                            {nosqlError && <div style={ { color: "red", marginTop: "8px" } }>{nosqlError}</div>}
                        </Box>  
                    </Grid>

                    {/*SQL-Beginner*/}
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
                                label="Password"
                                type="password"
                                value={sqlPassword}
                                onChange={e => setSQLPassword(e.target.value) }
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
                                Select
                            </button>
                            {sqlError && <div style={ { color: "red", marginTop: "8px" } }>{sqlError}</div>}
                        </Box>
                    </Grid>

                    {/*Testing Area*/}
                    <Grid item xs={12} title="SQL-Test-Area">
                        <Box sx={ {
                            width: 400,
                            height: 190,
                            bgcolor: "#F7F9FC",
                            borderRadius: 3,
                            border: "solid 2px #E4E9F0",
                            p: 2.5,

                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto",
                            } }
                        >
                            <span style={ { color: "#d80073ff", fontSize: "21px", marginTop: "10px" } }>
                                SQL Testing Area
                            </span>

                            <Box sx={ {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            margin: "4px",
                            width: "100%",
                            alignItems: "center",
                            p: 1.5,
                            } }
                            >
                                <p style={ { margin: 0, paddingLeft: "5px" } }>
                                    Here you can test your<br></br>
                                    SQL queries anytime,<br></br>
                                    without any exercises.
                                </p>
                                
                                <button
                                    type="button"
                                    id="test_area"
                                    style={ {
                                        color: "black",
                                        borderRadius: 5,
                                        backgroundColor: "#e21e87ff",
                                        color: "white",
                                        border: "2px solid #e6007bae",
                                        cursor: "pointer",
                                        padding: "5px 15px",
                                        marginRight: "25px",
                                    } }
                                    onClick={ () => {
                                        handleTestArea();
                                        console.log("Test Area SQL Button has been clicked");
                                    } }
                                    >
                                    Select
                                </button>
                            </Box>
                        </Box> 
                    </Grid>

                    <Grid item xs={12}>
                        <hr style={ { width: "750px", margin: "20px auto", border: "1px solid #b1b6bbff" } } />
                    </Grid>

                </Grid>

                <Box sx={ { textAlign: "center", mb: 3 } }>
                    <p>You can switch at any time later.</p>
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