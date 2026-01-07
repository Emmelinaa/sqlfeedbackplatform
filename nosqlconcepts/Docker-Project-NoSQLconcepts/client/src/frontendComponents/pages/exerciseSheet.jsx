
import React, { useState, useEffect } from "react";
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
  TextField,
  InputLabel,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
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

import OptTimer from "../components/exerciseSheetComponents/timer.jsx";
import ResultGraph from "../components/exerciseSheetComponents/ResultGraph.jsx";
import ResultTable from "../components/exerciseSheetComponents/ResultTable.jsx";
import {
  fetchTaskFormData,
  fetchTasksData,
  postHistoryData,
  postTaskFormData,
  fetchLLMFeedback,
} from "../api/mainApi.js";
import DbAccordion from "../components/exerciseSheetComponents/dbAccordion.jsx";
import { sendToExecute } from "../api/queryApi.js";
import { useAuth } from "../App.js";
import PgDatabaseSchema from "../components/exerciseSheetComponents/pgSchema.jsx";
import CasDataModelTable from "../components/exerciseSheetComponents/cassandraSchema.jsx";
import NeoGraphC from "../components/exerciseSheetComponents/graph.jsx";
import MongoSchema from "../components/exerciseSheetComponents/mongoSchema.jsx";
import GradientButton from "../components/exerciseSheetComponents/gradientButton.jsx";
const Item = styled(Paper)(({ theme }) => ({
  backgroundCoor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  overflow: "auto",
}));
function ExerciseSheetC({ area_id, area_name, endpoint, feedback_on, selected_area }) {
  const { username } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [taskNumber, setTaskNumber] = useState(1);
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
  const [receivedTime, setReceivedTime] = useState(null);

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

  const [queryFeedback_new, setQueryFeedback_new] = useState("");
  const [totalDistance, setTotalDistance] = useState("");
  const [noCalculation, setNoCalculation] = useState("");
  const [feedbackOutput, setFeedbackOutput] = useState([]);
  const [collectedEditSteps, setCollectedEditSteps] = useState([]);
  const [hasSolutionQuery, setHasSolutionQuery] = useState(false);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [errorCount, setErrorCount] = useState(0);

  const [maxPoints_SQL, setMaxPoints_SQL] = useState(0);

  const [llmError, setLlmError] = useState("");
  const [llmTip, setLlmTip] = useState("");
  const [showLLMTip, setShowLLMTip] = useState(false);
  const [solutionSQL, setSolutionSQL] = useState("");

  const sqlSchema = "students";

  useEffect(() => {
    const { totalDistance, noCalculation, feedbackOutput, errorCount } = sqlDistanceHandling(queryFeedback_new || "");
    setTotalDistance(totalDistance);
    setNoCalculation(noCalculation);
    setFeedbackOutput(feedbackOutput);
    setErrorCount(errorCount);
  }, [queryFeedback_new]);

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
      setMaxPoints_SQL(data[taskNumber - 1]?.maxsql_points || 0);
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
        setPointsHistory(response[0].sql_point_list || []);
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
        setPointsHistory([]);
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

  const sendDataToDb = async (overridePoints, overrideEditSteps) => {
    const sqlPointsList = Array.isArray(overridePoints) ? overridePoints : pointsHistory;
    const editStepsToSave = Array.isArray(overrideEditSteps) ? overrideEditSteps : collectedEditSteps;

    if (hasStarted) {
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
        processingTime: receivedTime,
        isFinished: formData.isFinished || false,
        editStepsList: editStepsToSave,
        sqlPointsList,

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
    sendDataToHistory();
    setQueryResult("");
    setShowLLMTip(false);
    const execQuery = formData.query_text;
    let apiRoute = "";
    if (endpoint === "PostgreSQL") {
      apiRoute = "/execute-sql";
    }
    if (endpoint === "Cassandra") {
      apiRoute = "/execute-cql";
    }
    if (endpoint === "Neo4J") {
      apiRoute = "/execute-cypher";
    }
    if (endpoint === "MongoDB") {
      apiRoute = "/execute-mql";
    }

    try {
      const response = await sendToExecute(
        apiRoute,
        execQuery,
        taskNumber,
        area_id,
        selected_area,
        sqlSchema,
        maxPoints_SQL,
      );
      console.log("SQL query of the student: ", execQuery);
      console.log("Correct SQL query: ", response.data.solutionQuery);
      setSolutionSQL(response.data.solutionQuery || "");
      console.log("queryFeedback_new: ", response.data.queryFeedback_new);

      setHasSolutionQuery(Boolean(response.data.solutionQuery));
      setQueryFeedback_new(response.data.queryFeedback_new || "");

      const { feedbackOutput } = sqlDistanceHandling(response.data.queryFeedback_new || "");
      const isSQLOutputEqual = JSON.stringify(response.data.userQueryResult) === JSON.stringify(response.data.expectedResult);
      const currentSQLPoints = isSQLOutputEqual ? maxPoints_SQL : calculatedPoints(maxPoints_SQL, feedbackOutput);

      const newSteps = feedbackOutput.map(item => item.editStep).filter(Boolean);
      const mergedSteps = [...collectedEditSteps, ...newSteps];
      setCollectedEditSteps(mergedSteps);
      
      const nextPoints = [...pointsHistory, currentSQLPoints];
      setPointsHistory(nextPoints);
      sendDataToDb(nextPoints, mergedSteps);

      if (typeof response.data.userQueryResult === "string") {
        setQueryResult([{ output: response.data.userQueryResult }]);
      } else {
        setQueryResult(response.data.userQueryResult);
      }
      setSolutionResult(response.data.expectedResult);

      if (typeof response.data.userQueryResult === "string") {
        setFormData((prev) => ({
          ...prev,
          query_text: execQuery,
          resultSize: 1,
          isExecutable: "Yes",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          query_text: execQuery,
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
        setFeedback(
          "Your output does not match the expected output (if there is an expected output). Please try again, if you think that this task is solvable with a query. You can also write a comment in the partial solution textfield, explaining why your solution is correct. In some cases this message occurs because there is no expected output."
        );

        setFeedbackType("error");
      }
      setError("");
    } catch (error) {
      setQueryFeedback_new("");
      const backendMessage =
        error.response?.data?.error || error.message || "Unexpected error";
      setError(
        `Error: ${backendMessage}. Note: Please try again, if you think that this task is solvable with a query. You can also write a comment in the partial solution textfield, explaining why your solution is correct. In some cases this message occurs because there is no solution query (use the textfield for your solution then).`
      );
      setQueryResult("");
      setFormData((prev) => ({
        ...prev,
        query_text: execQuery,
        resultSize: 0,
        isExecutable: "No",
      }));
    }
  };
  //###########
  useEffect(() => {
    if (endpoint === "Cassandra") {
      setSyntaxMode("pgsql"); //Todo error handling cql-mode
    }
    if (endpoint === "Neo4J") {
      setSyntaxMode("cypher");
    }
    if (endpoint === "MongoDB") {
      setSyntaxMode("mongodb");
    }
    if (endpoint === "PostgreSQL") {
      setSyntaxMode("pgsql");
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
  }, [taskNumber]);

  const startTimer = () => {
    setIsRunning(true);
    setHasStarted(true);
    setIsSaved(false);
    setButtonState("Idle");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
    setButtonState("Idle");
    if (name === "is-finished-checkbox") {
      setFormData((prev) => ({ ...prev, isFinished: event.target.checked }));
    }
  };

  const updateTaskAndFormData = (newTaskNumber) => {
    let newTaskIndex = newTaskNumber - 1;
    setTask(tasksArray[newTaskIndex]);
    setTaskNumber(newTaskNumber);
    setMaxPoints_SQL(tasksArray[newTaskIndex]?.maxsql_points || 0);
    setQueryResult("");
    setError("");
    getDataFromDB(newTaskNumber, username, selected_area);
    setIsRunning(false);
    setHasStarted(false);
    sendDataToDb();
  };
  const handleNextTask = () => {
    openConfirmationDialog(() => {
      if (taskNumber === tasksArray.length) {
        alert("This is the last task");
      } else {
        updateTaskAndFormData(taskNumber + 1);
      }
    });
  };

  const handlePrevTask = () => {
    openConfirmationDialog(() => {
      if (taskNumber > 1) {
        updateTaskAndFormData(taskNumber - 1);
      }
    });
  };

  const handleTaskChange = (event) => {
    const { value } = event.target;
    openConfirmationDialog(() => {
      setIsSaved(false);
      updateTaskAndFormData(value);
    });
  };
  const handleSave = () => {
    openConfirmationDialog(() => {
      sendDataToDb();
    });
  };
  const handleDownload = () => {
    openConfirmationDialog(() => {
      sendDataToDb();
      const dataToSend = { title: area_name, areaId: area_id, selected_area: selected_area };
      setIsSaved(false);
      navigate(
        `/download?title=${dataToSend.title}&areaId=${dataToSend.areaId}&courseArea=${dataToSend.selected_area}`
      );
    });
  };

  const handleTimerUpdate = (time) => {
    setReceivedTime(time);
  };

  const handleEditorChange = (newContent) => {
    setFormData({ ...formData, query_text: newContent });
    setButtonState("Idle");
  };
  const handleGetNodeAndEdgeCount = (nodes, edges) => {
    setNumNodes(nodes);
    setNumEdges(edges);
  };

  function sqlDistanceHandling(queryFeedback_new) {
    let totalDistance = "";
    let noCalculation = "";
    let feedbackOutput = [];
    let errorCount = 0;
    // console.log("Query Feedback New: ", queryFeedback_new);

    if (/^\s*ERROR:\s*/.test(queryFeedback_new)) {
      noCalculation = queryFeedback_new.replace(/^\s*ERROR:\s*/, "").trim();

    } else {
      totalDistance = queryFeedback_new.split("\n")[0].split(":").slice(1).join(":").trim();

      const outputSplitter = queryFeedback_new.split(">>>").map( a => a.trim() ).filter( Boolean ).slice(1);

      feedbackOutput = outputSplitter.map( a => {
        const lines = a.split("\n");
        const editStep = (lines.shift() || "").trim();
        let solution = lines.join("\n").trim();
        solution = solution.replace(/,{2,}$/gm, m => m.slice(0,1));
      return { editStep, solution };
      });
      errorCount = feedbackOutput.length;
    }

    return { totalDistance, noCalculation, feedbackOutput, errorCount };
  }

  function calculatedPoints(maxPoints_SQL, feedbackOutput) {
    let minusPoints = 0;
    feedbackOutput.forEach( a => {
      const match = a.editStep.match(/Cost\s*([\d.,]+):/i);
      if (match) {
        minusPoints += parseFloat(match[1].replace(",", "."));
      }
    });
    return Math.max(0, parseFloat(maxPoints_SQL) - parseFloat(minusPoints));
  }

  const isCorrectOptions = ["I don't know", "Yes", "No"];
  const difficultyOptions = [
    "No answer",
    "Very easy",
    "Easy",
    "Normal",
    "Difficult",
    "Very difficult",
  ];
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

  // take the exersice description, editsteps
  const llmFeedback = async (feedbackOutput) => {
    setShowLLMTip(true);
    setLlmTip("Loading LLM learning tip...");
    console.log("LLM Feedback Function");

    try {
      console.log("1");
      // Task Question Data
      const questionData = [
        task.topic ? "Topic: " + task.topic + ", " : "",
        task.description ? "Description: " + task.description + ", " : "",
        task.hint ? "Hint: " + task.hint : ""
      ].filter(Boolean).join(" ");
      console.log("questionData: ", questionData);

      // Student Answer Data
      const studentAnswer = formData.query_text;
      console.log("studentAnswer: ", studentAnswer);

      // Correct Answer Data
      const correctAnswer = solutionSQL;
      console.log("correctAnswer: ", correctAnswer);

      // Tool Feedback Data
      const toolFeedback = feedbackOutput.map((e, i) => `${i + 1}. ${e.editStep}: ${e.solution}`).join('\n');
      console.log("Tool Feedback: ", toolFeedback);

      // API Call
      const response = await fetchLLMFeedback(questionData, studentAnswer, correctAnswer, toolFeedback);
      console.log("Response: ", response);
      setLlmError("");
      setLlmTip(response.learning_tips);

    } catch (error) {
      console.log("error");
      console.error("Error:", error);
      setLlmError("Failed to get answer from LLM.");
      setLlmTip("No LLM Tip available.");
    }

  }

  return (
    <Container>
     
      <Typography variant="h4" sx={{p:2}}>{area_name}</Typography>
      {task && (
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Item sx={{ bgcolor: "rgb(247, 250, 250)" }}>
                <Typography paragraph>
                  <WarningAmberIcon></WarningAmberIcon> Always make sure to save
                  the data of the current task before leaving
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
            <Grid item xs={12} md={4}>
              <Item sx={{ bgcolor: "rgb(247, 250, 250)" }}>
                {" "}
                <Box>
                  <InputLabel id="task-number-label">
                    Select another task you want to jump to:
                  </InputLabel>

                  <TextField
                    select
                    name="taskNumber"
                    id="task-number-label"
                    fullWidth
                    value={taskNumber}
                    onChange={handleTaskChange}
                    aria-labelledby="Jump to task"
                  >
                    {tasksArray.map((task, index) => (
                      <MenuItem
                        key={index}
                        value={index + 1}
                        aria-label={task.subtasknumber}
                      >
                        {task.subtasknumber}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Item>
            </Grid>
            <Grid item xs={12} md={8}>
              <Item>
                {" "}
                <Box aria-labelledby="Task topic, description and maximum time to solve the task">
               
                   <Typography variant="h4">{task.topic}</Typography>
                  <Typography variant="h5">{task.subtasknumber}</Typography>
                  <Typography variant="h6" >
                    {task.maxtime}
                  </Typography>
                  <Typography >
                    {task.description}
                  </Typography>
                  <hr></hr>
                  <Typography>{task.hint}</Typography>
                </Box>
                <Box p={0} aria-labelledby="Input Elements to solve the task">
                  {hasStarted ? (
                    <form>
                      <Box>
                        <InputLabel id="query-input-label">
                          Type and run your query if you think this task is
                          solvable with a query.
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

                        {feedback_on && (
                          <ImportantMsg
                            message="Note that the feedback functionality is a work in progress. It is possible that a message will appear stating that your result does not match the expected result. Your solution may still be correct. We are working on improving this functionality in the future so that your individual solution is evaluated with regard to the task description."
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

                        {queryResult && feedback_on && (
                          <ImportantMsg
                            message={feedback}
                            type={feedbackType}
                          />
                        )}

                        {endpoint === "Neo4J" && queryResult && (
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

                      {feedback_on && endpoint === "PostgreSQL" && queryResult && (
                        <>
                          <Typography variant="h6" gutterBottom>
                            See Your SQL Feedback
                          </Typography>
                          {maxPoints_SQL && (
                            <Typography variant="h7" gutterBottom>
                              {feedback.includes("Your query output is equal to the expected output")
                                ? `There are ${maxPoints_SQL} points and you received ${maxPoints_SQL} points.`
                                : `There are ${maxPoints_SQL} points and you received ${calculatedPoints(maxPoints_SQL, feedbackOutput)} points.`
                              }
                            </Typography>
                          )}
                          {feedback.includes("Your query output is equal to the expected output") && (
                                <ImportantMsg
                                  message={
                                    <>
                                      Your query produces the correct output table! Full points are awarded.
                                      <br />
                                      Note that structurally different queries with the same output may still result in edit steps with (not weighted) cost
                                      when compared to the expected solution.
                                      </>
                                  }
                                  type="success"
                                />
                              )}
                          <ImportantMsg
                                message={
                                  <>
                                    You can see an overview of the errors below and click any item to view more details.
                                    <br />
                                    If an error has 'Cost: 0' then it's a mathematical or logical transformation that does not change the meaning of the SQL query.
                                    There are some operator types (like <code>LIKE</code>) that cannot be parsed yet,
                                    so no detailed feedback is available for them at the moment.
                                    </>
                                    }
                                type="info"
                          />

                          <Box
                              sx={ {
                                padding: "10px",
                                borderRadius: "5px",
                                border: "1px solid #cac9c9ff",
                                minHeight: 150,
                                whiteSpace: "pre-wrap",
                              } }
                            >
                              {totalDistance
                                ? "These are the " + errorCount + " suggested changes to your query:"
                                : ""}

                              {totalDistance === ""
                                ? (
                                    <div
                                      style={{
                                        minHeight: 150,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center",
                                        fontSize: "15.5px",
                                      }}
                                    >
                                      {noCalculation}
                                    </div>
                                  )
                                : 
                                feedbackOutput.map((entry, i) => (
                                  <details key={i}
                                    style={ {
                                      border: "1px solid #bdbdbdff",
                                      borderRadius: "5px",
                                      marginTop: "10px",
                                      overflow: "hidden"
                                    } }
                                  >
                                    <summary
                                    style={ {
                                      justifyContent: "flex-start",
                                      padding: "10px 15px",
                                      listStyle: "none",
                                      display: "flex",
                                      fontWeight: "bold",
                                      cursor: "pointer",
                                    } }
                                    >
                                      { entry.editStep }
                                      </summary>
                                    <div
                                    style={ {
                                      justifyContent: "flex-start",
                                      padding: "10px 45px",
                                      listStyle: "none",
                                      display: "flex",
                                    } }
                                    >
                                    { entry.solution }
                                    </div>
                                  </details>
                                  
                                ))
                                }
                          </Box>
                        </>
                      )}
                      <hr></hr>
                      {feedback_on && endpoint === "PostgreSQL" && queryResult && (
                        <>
                        <Typography variant="h6" gutterBottom>
                            LLM learning tip
                          </Typography>
                          <ImportantMsg
                                message={
                                  <>
                                    You can click on the button below to get a personalized learning tip based on the exersice description, your solution and the SQL feedback.
                                    <br />
                                    Note that this functionality is a work in progress and may take some time to respond.
                                  </>
                                  }
                                type="info"
                          />
                              
                        <button
                          type="button"
                          id="test_area"
                          style={ {
                            color: "black",
                            borderRadius: 5,
                            backgroundColor: "#388E3C",
                            color: "white",
                            border: "2px solid #388E3C",
                            cursor: "pointer",
                            padding: "5px 15px",
                            marginLeft: "auto",
                            marginRight: "20px",
                          } }
                          onClick={() => llmFeedback(feedbackOutput)}
                        >
                          LLM learning tip
                        </button>
                        <Box sx={{mt: 2}} />
                        {showLLMTip && (
                          <Box
                              sx={ {
                                padding: "10px",
                                borderRadius: "5px",
                                border: "1px solid #cac9c9ff",
                                minHeight: 150,
                                whiteSpace: "pre-wrap",
                              } }
                            >{llmTip}</Box>
                        )}

                        {/*No available LLM learning tip.
                        <button
                          type="button"
                          id="test_area"
                          style={ {
                            color: "black",
                            borderRadius: 5,
                            backgroundColor: "#9c9c9cff",
                            color: "white",
                            border: "2px solid #939393ff",
                            cursor: "pointer",
                            padding: "5px 15px",
                            marginLeft: "auto",
                            marginRight: "20px",
                          } }
                          onClick={ () => {
                            console.log("No available LLM learning tip");
                          } }
                        >
                          No available LLM learning tip
                        </button>*/}

                        </>
                      )}

                      <hr></hr>
                      <InputLabel id="partial-solution-label">
                        Your partial solution/further comments:
                      </InputLabel>
                      <TextField
                        name="partialSolution"
                        id="partial-solution-label"
                        fullWidth
                        multiline
                        rows={6}
                        value={formData.partialSolution}
                        onChange={handleChange}
                        aria-labelledby="Textfield for partial solution or comments"
                      />
                      <hr></hr>
                      <InputLabel id="isCorrect-radiogroup">
                        Do you think that your answer is correct?
                      </InputLabel>
                      <RadioGroup
                        name="isCorrect"
                        row
                        id="isCorrect-radiogroup"
                        value={formData.isCorrect}
                        onChange={handleChange}
                        aria-labelledby="Radiogroup to select if the input query returns a correct result"
                      >
                        {isCorrectOptions.map((item, index) => (
                          <FormControlLabel
                            key={index}
                            value={item}
                            control={<Radio />}
                            label={item}
                            aria-label={item}
                          />
                        ))}
                      </RadioGroup>
                      <hr></hr>
                      <InputLabel id="difficulty-level-radiogroup">
                        How difficult was this task for you?
                      </InputLabel>
                      <RadioGroup
                        name="difficulty"
                        row
                        id="difficulty-level-radiogroup"
                        defaultValue={"No answer"}
                        value={formData.difficulty}
                        onChange={handleChange}
                        aria-labelledby="Radiogroup to select the perceived difficulty of the task"
                      >
                        {difficultyOptions.map((item, index) => (
                          <FormControlLabel
                            key={index}
                            value={item}
                            control={<Radio />}
                            label={item}
                            aria-label={item}
                          />
                        ))}
                      </RadioGroup>
                      <br />
                      <hr></hr>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="is-finished-checkbox"
                              checked={formData.isFinished}
                              onChange={handleChange}
                            />
                          }
                          label="Check if you finished this exercise to see your progress on the dashboard assignment card"
                        />
                      </FormGroup>
                      <br />
                      <hr></hr>
                      {taskNumber === tasksArray.length ? (
                        <div>
                          {" "}
                          <OptTimer
                            run={isRunning}
                            taskNumber={taskNumber}
                            area_id={area_id}
                            username={username}
                            onTimeUpdate={handleTimerUpdate}
                            selected_area={selected_area}
                          />
                          <hr></hr>
                          {taskNumber !== 1 && (
                            <GradientButton
                              aria-label="Save current entries and navigate to previous task"
                              onClick={handlePrevTask}
                            >
                              Back{" "}
                              <NavigateBeforeIcon></NavigateBeforeIcon>
                            </GradientButton>
                          )}{" "}
                          <GradientButton
                            aria-label="Save current entries and navigate to download page"
                            onClick={handleDownload}
                          >
                            Finish <NavigateNextIcon></NavigateNextIcon>
                          </GradientButton>
                        </div>
                      ) : (
                        <div>
                          <hr></hr>

                          <OptTimer
                            run={isRunning}
                            taskNumber={taskNumber}
                            area_id={area_id}
                            username={username}
                            onTimeUpdate={handleTimerUpdate}
                            selected_area={selected_area}
                          />

                          <hr></hr>
                          {taskNumber !== 1 && (
                            <GradientButton
                              aria-label="Save current entries of the task and navigate to previous task"
                              onClick={handlePrevTask}
                            >
                              Back{" "}
                              <NavigateBeforeIcon></NavigateBeforeIcon>
                            </GradientButton>
                          )}

                          <GradientButton
                            aria-label="Save current entries of this task and navigate to next task"
                            onClick={handleNextTask}
                          >
                            Next <NavigateNextIcon></NavigateNextIcon>
                          </GradientButton>
                          <Box>
                            <Typography paragraph>
                              <WarningAmberIcon></WarningAmberIcon> Always make
                              sure to save the data of the current task before
                              leaving
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
                      )}{" "}
                    </form>
                  ) : (
                    <div>
                      <GradientButton
                        aria-label="Start the task to open all task fields"
                        onClick={startTimer}
                      >
                        Start task
                        <HourglassEmptyIcon></HourglassEmptyIcon>
                      </GradientButton>
                      <p>{""}</p>

                      <ImportantMsg
                        message="Note: A timer will start, when you start the task. You can stop
                and continue the timer if needed. Also make sure to save your
                data."
                        type="info"
                      />
                      <ImportantMsg
                        message="Please do not work longer than the specified time on a task! If you
        think that you will not be able to finish the task in the given maximum
        time, stop working on it 15 minutes before the end, and provide an
        explanation containing the following information: Whether you think that
        the task is solvable with the current system at all, and why? If you
        think that is solvable with more time: which approach, would you try out
        next? - Please also have a look at known issues regarding query execution (open menu -> Information)"
                        type="info"
                      />
                    </div>
                  )}
                </Box>{" "}
              </Item>
            </Grid>
            <Grid item xs={12} md={4}>
              {endpoint === "PostgreSQL" ? (
                <DbAccordion
                  endpoint={endpoint}
                  selectedSchema={sqlSchema}
                  selectedArea={selected_area}
                />
              ) : (
                <DbAccordion
                  endpoint={endpoint}
                  selectedArea={selected_area}
                />
              )}
              <hr></hr>
          {/*     <Box
                sx={{
                  maxHeight: "800px",
                  overflowY: "auto",
                }}
              >
                {endpoint === "PostgreSQL" && <PgDatabaseSchema />}
                {endpoint === "Cassandra" && <CasDataModelTable />}
                {endpoint === "Neo4J" && <NeoGraphC />}
                {endpoint === "MongoDB" && <MongoSchema />}
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

export default ExerciseSheetC;
