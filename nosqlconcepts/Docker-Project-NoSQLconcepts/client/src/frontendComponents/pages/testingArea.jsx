
import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { useNavigate, useLocation } from "react-router-dom";
import SaveIcon from "@mui/icons-material/Save";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Box,
  Button,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-sql"; // SQL-Syntax-Highlighting
import "../../custom_ace_files/mode-cypher.js";
import "../../custom_ace_files/mode-mongodb.js";
import "../../custom_ace_files/mode-pgsql.js";
import "../../custom_ace_files/theme-goethe.js";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import ImportantMsg from "../components/otherComponents/importantMsg.jsx";
import ResultGraph from "../components/exerciseSheetComponents/ResultGraph.jsx";
import ResultTable from "../components/exerciseSheetComponents/ResultTable.jsx";
import {
  fetchTaskFormData,
  fetchTasksData,
  postHistoryData,
  postTaskFormData,
} from "../api/mainApi.js";
import DbAccordion from "../components/exerciseSheetComponents/dbAccordion.jsx";
import { sendToExecute } from "../api/queryApi.js";
import { useAuth } from "../App.js";
import GradientButton from "../components/exerciseSheetComponents/gradientButton.jsx";
const Item = styled(Paper)(({ theme }) => ({
  backgroundCoor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  overflow: "auto",
}));
function TestingAreaC() {
    const area_id = 1;
    const statement_id = 1;
    const taskNumber = 1;
    const selected_area = "testing_area";
    const endPointChosen = "PostgreSQL";

    let area_name = "";

    const { username } = useAuth();
    const navigate = useNavigate();

    const [task, setTask] = useState("");
    const [isRunning, setIsRunning] = useState(false);

    const [tasksArray, setTasksArray] = useState([]);
    const [buttonState, setButtonState] = useState("idle");

    const [formData, setFormData] = useState({
        query_text: "",
        isExecutable: "No",
        resultSize: 0,
        partialSolution: "test state variable",
        isCorrect: "0",
        difficulty: "0",
        isFinished: false,
    });

    const [isSaved, setIsSaved] = useState(false);

    const [queryResult, setQueryResult] = useState("");
    const [syntaxMode, setSyntaxMode] = useState("");
    const [numNodes, setNumNodes] = useState(0);
    const [numEdges, setNumEdges] = useState(0);
    const [solutionResult, setSolutionResult] = useState("");
    const [feedback, setFeedback] = useState("");
    const [feedbackType, setFeedbackType] = useState("error");
    const [error, setError] = useState("");
    const [fetcherror, setFetchError] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [confirmCallback, setConfirmCallback] = useState(null);

    const [totalDistance, setTotalDistance] = useState("");
    const [noCalculation, setNoCalculation] = useState("");
    const [feedbackOutput, setFeedbackOutput] = useState([]);
    const [collectedEditSteps, setCollectedEditSteps] = useState([]);

    const handleF5 = (event) => {
        if (event.key === "F5") {
        event.preventDefault();

        alert("F5 is not used as a shortcut to execute queries.");
        }
    };

    const getTasks = async (areaId, selected_area) => {;
        try {
        const data = await fetchTasksData(areaId, selected_area);
        setTasksArray(data);

        setTask(data[taskNumber - 1]);
        } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data. Please try again later.");
        }
    };

    const getDataFromDB = async (tasknumber, username, selected_area) => {
        setFetchError("");
        try {
        if (typeof tasknumber === "undefined" || tasknumber === null) {
            throw new Error("Task number is required");
        }

        const response = await fetchTaskFormData(area_id, username, tasknumber, selected_area);

        let formDataObj = {};

        if (response.length !== 0) {
            formDataObj = {
            query_text: response[0].query_text.replace(/''/g, "'") || "",
            resultSize: response[0].result_size || "0",
            isExecutable: response[0].is_executable || "0",
            partialSolution: response[0].partial_solution || "",
            isCorrect: response[0].is_correct || "0",
            difficulty: response[0].difficulty_level || "0",
            isFinished: response[0].is_finished || false,
            };
            setCollectedEditSteps(response[0].edit_steps_list || []);
        } else {
            formDataObj = {
            query_text: "",
            resultSize: 0,
            isExecutable: "No",
            partialSolution: "",
            isCorrect: "I don't know",
            difficulty: "No answer",
            isFinished: false,
            };
        }

        setFormData(formDataObj);
        } catch (error) {
        console.error("Failed to get data from db", error.message);
        setFetchError("Error occured, fetching data failed.");
        }
    };

    //dialog functions before actually saving data
    const openConfirmationDialog = (callback) => {
        setConfirmCallback(() => callback);
        setIsDialogOpen(true);
    };

    const confirmAction = () => {
        if (confirmCallback) {
        confirmCallback(); // Execute the action
        }
        setIsDialogOpen(false); // Close the dialog
    };

    const cancelAction = () => {
        setIsDialogOpen(false); // Close the dialog without executing
    };

    const sendDataToDb = async () => {
        if (true) {
        const dataToSend = {
            username: username,
            statementId: taskNumber,
            taskAreaId: area_id,
            selected_area: selected_area,
            queryText: formData.query_text.replace(/'/g, "''") || "",
            isExecutable: formData.isExecutable || "No",
            resultSize: formData.resultSize || 0,
            isCorrect: formData.isCorrect || "0",
            partialSolution: formData.partialSolution || "",
            difficultyLevel: formData.difficulty || "0",
            isFinished: formData.isFinished || false,
            editStepsList: collectedEditSteps,
        };
        setButtonState("loading");
        try {
            const response = await postTaskFormData(dataToSend);
            if (response.success) {
            setButtonState("success");
            } else {
            console.error("Error occurred:", response.data.error);
            alert("Failed to save data");
            setButtonState("error");
            }
        } catch (error) {
            console.error("Server error:", error);
            alert("Failed to save data");
            setButtonState("error");
        }
        }
    };

    const sendDataToHistory = async () => {
        const dataToSend = {
        username: username,
        statementId: taskNumber,
        taskAreaId: area_id,
        selected_area: selected_area,
        queryText: formData.query_text.replace(/'/g, "''") || "",
        isExecutable: formData.isExecutable || "No",
        resultSize: formData.resultSize || 0,
        isCorrect: formData.isCorrect || "0",
        };

        try {
        const response = await postHistoryData(dataToSend);
        if (response) {
            console.log("Data stored successfully!");
        } else {
            console.error("Error occurred:", response.data.error);
            alert("Failed to save data");
        }
        } catch (error) {
        console.error("Server error:", error);
        alert("Failed to save data");
        }
    };

    //############# in progress

    const executeQuery = async () => {
        console.log("1");
        sendDataToHistory();
        console.log("2");
        sendDataToDb();
        console.log("3");
        setQueryResult("");
        console.log("4");
        const execQuery = formData.query_text;
        console.log("5");
        let apiRoute = "";
        console.log("6");
        if (endPointChosen === "PostgreSQL") {
        console.log("7");
        apiRoute = "/execute-sql";
        }
        if (endPointChosen === "Cassandra" || endPointChosen === "Neo4J" || endPointChosen === "MongoDB") {
        console.log("Error: The " + endPointChosen + " endpoint is unsupported in this SQL testing area.");
        // navigate("/")
        }

        try {
            console.log("8");
            console.log("execQuery: ", execQuery);
            console.log("apiRoute: ", apiRoute, "execQuery: ", execQuery, "taskNumber: ", taskNumber, "area_id: ", area_id, "selected_area: ", selected_area);
            const response = await sendToExecute(
                apiRoute,
                execQuery,
                taskNumber,
                area_id,
                selected_area
            );
            console.log("SQL query of the student: " + execQuery);

            if (typeof response.data.userQueryResult === "string") {
                setQueryResult([{ output: response.data.userQueryResult }]);
            } else {
                setQueryResult(response.data.userQueryResult);
            }
            setSolutionResult(response.data.expectedResult);

            if (typeof response.data.userQueryResult === "string") {
                setFormData((prev) => ({
                ...prev,
                query: execQuery,
                resultSize: 1,
                isExecutable: "Yes",
                }));
            } else {
                setFormData((prev) => ({
                ...prev,
                query: execQuery,
                resultSize: response.data.userQueryResult.length,
                isExecutable: "Yes",
                }));
            }

            if (
                JSON.stringify(response.data.userQueryResult) ===
                JSON.stringify(response.data.expectedResult)
            ) {
                setFeedback(
                "Correct! Your query output is equal to the expected output."
                );

                setFeedbackType("success");
            } else {
                
            }
            setError("");
        } catch (error) {
            setError(
                `Error: ${error.response.data.error}.`
            );
            setQueryResult("");
            setFormData((prev) => ({
                ...prev,
                query: execQuery,
                resultSize: 0,
                isExecutable: "No",
            }));
        }
    };
    //###########
    useEffect(() => {
        if (endPointChosen === "PostgreSQL") {
        setSyntaxMode("pgsql");
        }
        if (endPointChosen === "MongoDB" || endPointChosen === "Neo4J" || endPointChosen === "Cassandra") {
        console.log("Error: The " + endPointChosen + " endpoint is unsupported in this SQL testing area.");
        }

        const fetchUser = async () => {
        if (username) {
            getTasks(area_id, selected_area);
            getDataFromDB(taskNumber, username, selected_area);
        }
        };

        fetchUser();

        window.addEventListener("keydown", handleF5);
        return () => {
        window.removeEventListener("keydown", handleF5);
        };
    }, []);
    
    const handleSave = () => {
        openConfirmationDialog(() => {
        sendDataToDb();
        });
    };
    const handleDownload = () => {
        openConfirmationDialog(() => {
        sendDataToDb();
        const title = "TestSession";
        const dataToSend = { title, areaId: area_id, selected_area: selected_area };
        setIsSaved(false);
        navigate(
            `/download?title=${title}&areaId=${dataToSend.areaId}&courseArea=${dataToSend.selected_area}`
        );
        });
    };

    const handleEditorChange = (newContent) => {
        setFormData({ ...formData, query_text: newContent });
        setButtonState("Idle");
    };
    const handleGetNodeAndEdgeCount = (nodes, edges) => {
    setNumNodes(nodes);
    setNumEdges(edges);
};

    const renderIcon = () => {
        if (buttonState === "loading") {
        return <CircularProgress size={24} color="inherit" />;
        }
        if (buttonState === "success") {
        return <CheckIcon />;
        }
        if (buttonState === "error") {
        return <ErrorIcon />;
        }
        return <SaveIcon />;
    };

    return (
        <Container>
        
        <Typography variant="h4" sx={{p:2}}>{area_name}</Typography>
        {true && (
            <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                <Item sx={{ bgcolor: "rgb(247, 250, 250)" }}>
                    <Typography paragraph>
                    <WarningAmberIcon></WarningAmberIcon> Always make sure to save the data of the current testing before leaving.
                    </Typography>{" "}
                    <Box>
                    {" "}
                    <Button
                        variant="contained"
                        color={
                        buttonState === "success"
                            ? "success"
                            : buttonState === "error"
                            ? "error"
                            : "primary"
                        }
                        onClick={handleSave}
                        startIcon={renderIcon()}
                        disabled={buttonState === "loading"}
                    >
                        {buttonState === "loading" ? "Saving..." : "Save Entries"}
                    </Button>
                    <Button
                        aria-label="Button to go to download section"
                        onClick={handleDownload}
                    >
                        Go to download section <DownloadIcon></DownloadIcon>
                    </Button>{" "}
                    </Box>
                </Item>
                </Grid>

                <Grid item xs={12} md={8}>
                <Item>
                    {" "}
                    <Box aria-labelledby="Task topic, description and maximum time to solve the task">
                
                    <Typography variant="h4"> SQL Testing Area </Typography>
                    {/*<Typography variant="h5"> task.subtasknumber</Typography>*/}
                    <ImportantMsg
                        message={
                            <>
                                Here you can try out SQL queries.
                                On the right side you can see the database schema for the PostgreSQL database.
                                For more information about the schema, try to look into your course materials for ideas.
                            </>
                        } 
                        type="info"
                    />
                    <hr></hr>
                    </Box>
                    <Box p={0} aria-labelledby="Input Elements to solve the task">
                    {true ? (
                        <form>
                        <Box>
                            <InputLabel id="query-input-label">
                            Type and run your query to test it.
                            </InputLabel>
                        
                            <AceEditor
                            id="query-input-label"
                            name="query"
                            mode={syntaxMode}
                            onChange={handleEditorChange}
                            value={formData.query_text}
                            editorProps={{ $blockScrolling: true }}
                            style={{ width: "100%", height: "400px" }}
                            setOptions={{ fontSize: "16px" }}
                            />

                            <GradientButton onClick={executeQuery}>
                            Run query
                            <PlayCircleFilledWhiteIcon></PlayCircleFilledWhiteIcon>
                            </GradientButton>

                            {true && (
                            <ImportantMsg
                                message={
                                    <>
                                        Note that the SQL testing functionality is a work in progress.<br />
                                        We are working on improving this functionality in the future.
                                    </>
                                }
                                type="info"
                            />
                            )}

                            {queryResult && (
                            <ImportantMsg
                                message={
                                <div>
                                    <CheckIcon></CheckIcon> Query was executed
                                    successfully!
                                </div>
                                }
                                type="success"
                            />
                            )}

                            {queryResult && true && (
                            <ImportantMsg
                                message={feedback}
                                type={feedbackType}
                            />
                            )}

                            {endPointChosen === "Neo4J" && queryResult && (
                            <ResultGraph
                                queryResult={queryResult}
                                onGetNodeAndEdgeCount={handleGetNodeAndEdgeCount}
                            />
                            )}{" "}
                            {numNodes === 0 && numEdges === 0 && queryResult && (
                            <ResultTable
                                queryResult={queryResult}
                                resultSize={formData.resultSize}
                                title={area_name}
                            />
                            )}

                            {error && (
                            <ImportantMsg
                                message={
                                <div>
                                    <ErrorIcon></ErrorIcon> {error}
                                </div>
                                }
                                type="error"
                            />
                            )}
                            <Box
                            sx={{
                                padding: "10px",
                                borderRadius: "5px",
                                border: "black",
                            }}
                            >
                            {<p>Result Size: {formData.resultSize}</p>}
                            </Box>
                        </Box>
                        <br />
                        <hr></hr>
                        <div>
                        <Box>
                            <Typography paragraph>
                            <WarningAmberIcon></WarningAmberIcon> Always make sure to save the data of the current testing before leaving.
                            </Typography>
                            <Button
                            variant="contained"
                            color={
                                buttonState === "success"
                                ? "success"
                                : buttonState === "error"
                                ? "error"
                                : "primary"
                            }
                            onClick={handleSave /* sendDataToDb */}
                            startIcon={renderIcon()}
                            disabled={buttonState === "loading"}
                            >
                            {buttonState === "loading"
                                ? "Saving..."
                                : "Save Entries"}
                            </Button>
                            <Button
                            aria-label="Go to the download section"
                            onClick={handleDownload}
                            >
                            Go to download section{" "}
                            <DownloadIcon></DownloadIcon>
                            </Button>
                        </Box>
                        </div>
                    {" "}
                        </form>
                    ) : (
                        <div>
                        <p>{""}</p>
                    
                        </div>
                    )}
                    </Box>{" "}
                </Item>
                </Grid>
    {/* Right side database schema */}
                <Grid item xs={12} md={4}>
                <DbAccordion key={endPointChosen} endpoint={endPointChosen} />
                <hr></hr>
            {/*     <Box
                    sx={{
                    maxHeight: "800px",
                    overflowY: "auto",
                    }}
                >
                    {endPointChosen === "PostgreSQL" && <PgDatabaseSchema />}
                    {endPointChosen === "Cassandra" && <CasDataModelTable />}
                    {endPointChosen === "Neo4J" && <NeoGraphC />}
                    {endPointChosen === "MongoDB" && <MongoSchema />}
                </Box> */}
                </Grid>
            </Grid>
            </Box>
        )}
        <Dialog open={isDialogOpen} onClose={cancelAction}>
            <DialogTitle>Confirm Your Inputs</DialogTitle>
            <DialogContent>
            <DialogContentText>
                Please confirm the data of the current task before saving:
            </DialogContentText>
            <Typography>
                <strong>Query Text:</strong> {formData.query_text}
            </Typography>
            <Typography>
                <strong>Executable:</strong> {formData.isExecutable ? "Yes" : "No"}
            </Typography>
            <Typography>
                <strong>Result Size:</strong> {formData.resultSize}
            </Typography>
            <Typography>
                <strong>Difficulty Level:</strong> {formData.difficulty}
            </Typography>
            <Typography>
                <strong>Is Finished:</strong> {formData.isFinished ? "Yes" : "No"}
            </Typography>
            </DialogContent>
            <DialogActions>
            <Button onClick={cancelAction} color="secondary">
                Cancel
            </Button>
            <Button onClick={confirmAction} color="primary" variant="contained">
                Confirm
            </Button>
            </DialogActions>
        </Dialog>
        </Container>
    );
    }

export default TestingAreaC;