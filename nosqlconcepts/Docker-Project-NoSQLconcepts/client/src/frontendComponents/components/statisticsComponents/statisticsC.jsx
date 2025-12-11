
//student project SS2024 

/*This file contains the frontend of the statistics dashboard extension 
ATTENTION: If this code is to be implemented in the main tool, please note the following: 
1. The getData Effects or setData function must be adapted. All 4 database tables are loaded completely as an array and then processed in the filter part. 
2. Replace the User Selection Bar with the Logged in User delete the header "taskleiste" */

import React, { useState, useEffect } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import { Divider } from "@mui/material";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Box,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Alert,
} from "@mui/material";
import { fetchData, fetchTaskData, fetchUserData, fetchAreaData } from "../../api/statApi";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  generateDataSeries,
  generateDif_Series,
  get_dif_ranking,
  get_rank,
} from "./statisticsfunctions";
import { checkAuth } from "../../api/loginApi";
import ImportantMsg from "../otherComponents/importantMsg.jsx";

// Card style for hover effect
let cardStyle = {
  borderRadius: "12px",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
  },
  padding: 1,
  textAlign: "center",
  overflow: "auto",
};

function mapEditStepToCategory(editStep) {

  // Horizontal Type Variations (no \n since the display is in the bar)
  // "Swap arguments / Swap nesting / mirror"
  if (/binary-expression in a select-element expression/i.test(editStep)) return "SELECT";
  if (/binary-expression in a from-element join-condition/i.test(editStep)) return "JOIN-Condition";
  if (/binary-expression in the where-clause/i.test(editStep)) return "WHERE";
  if (/binary-expression in a group-by expression/i.test(editStep)) return "GROUP BY";
  if (/binary-expression in the having-clause/i.test(editStep)) return "HAVING";
  if (/binary-expression in a order-by expression/i.test(editStep)) return "ORDER BY";
  // Swap elements
  if (/Swap elements in the select-clause/i.test(editStep)) return "SELECT";
  if (/Swap elements in the from-clause/i.test(editStep)) return "FROM";
  if (/Swap elements in the group-by-clause/i.test(editStep)) return "GROUP BY";
  // Change position
  if (/Change position of elements in the order-by-clause/i.test(editStep)) return "ORDER BY";
  // Change (incorrect)
  if (/table name on an asterisk in a select-element expression/i.test(editStep)) return "Table Asterisk";
  if (/column-reference column in a select-element expression/i.test(editStep)) return "Column SELECT";
  if (/column-reference table in a select-element expression/i.test(editStep)) return "Table SELECT";
  if (/literal value in a select-element expression/i.test(editStep)) return "Literal value in SELECT";
  if (/aggregation-function aggregation in a select-element expression/i.test(editStep)) return "Agg SELECT";
  if (/binary-expression operator in a select-element expression/i.test(editStep)) return "Operator SELECT";
  if (/explicit alias on a select-element/i.test(editStep)) return "Alias Select";
  if (/from-element join-type/i.test(editStep)) return "JOIN Type";
  if (/column-reference column in a from-element join-condition/i.test(editStep)) return "Column JOIN-Condition";
  if (/column-reference table in a from-element join-condition/i.test(editStep)) return "Table JOIN-Condition";
  if (/literal value in a from-element join-condition/i.test(editStep)) return "Literal Value JOIN";
  if (/binary-expression operator in a from-element join-condition/i.test(editStep)) return "Operator JOIN";
  if (/explicit alias on a from-element/i.test(editStep)) return "Alias FROM";
  if (/column-reference column in the where-clause/i.test(editStep)) return "Column WHERE";
  if (/column-reference table in the where-clause/i.test(editStep)) return "Table WHERE";
  if (/literal value in the where-clause/i.test(editStep)) return "Literal Value WHERE";
  if (/binary-expression operator in the where-clause/i.test(editStep)) return "Operator WHERE";
  if (/column-reference column in a group-by expression/i.test(editStep)) return "Column GROUP BY";
  if (/column-reference table in a group-by expression/i.test(editStep)) return "Table GROUP BY";
  if (/literal value in a group-by expression/i.test(editStep)) return "Literal Value GROUP BY";
  if (/binary-expression operator in a group-by expression/i.test(editStep)) return "Operator GROUP BY";
  if (/column-reference column in the having-clause/i.test(editStep)) return "Column HAVING";
  if (/column-reference table in the having-clause/i.test(editStep)) return "Table HAVING";
  if (/literal value in the having-clause/i.test(editStep)) return "Literal Value HAVING";
  if (/aggregation-function aggregation in the having-clause/i.test(editStep)) return "Agg HAVING";
  if (/binary-expression operator in the having-clause/i.test(editStep)) return "Operator HAVING ";
  if (/column-reference column in a order-by expression/i.test(editStep)) return "Column ORDER BY";
  if (/column-reference table in a order-by expression/i.test(editStep)) return "Table ORDER BY";
  if (/literal value in a order-by expression/i.test(editStep)) return "Literal Value ORDER BY";
  if (/aggregation-function aggregation in a order-by expression/i.test(editStep)) return "Agg ORDER BY";
  if (/binary-expression operator in a order-by expression/i.test(editStep)) return "Operator ORDER BY";

  // ShortCut Type Variation
  if (/law in a select-element expression/i.test(editStep)) return "Apply in SELECT";
  if (/law in a from-element join-condition/i.test(editStep)) return "JOIN-Condition";
  if (/law in the where-clause/i.test(editStep)) return "WHERE";
  if (/law in a group-by expression/i.test(editStep)) return "GROUP BY";
  if (/law in the having-clause/i.test(editStep)) return "HAVING";
  if (/law in a order-by expression/i.test(editStep)) return "ORDER BY";
  if (/Move the join-condition of an INNER JOIN to the where-clause/i.test(editStep)) return "(INNER) JOIN-Condition to WHERE";
  if (/Move expression from the where-clause to the join-condition of an INNER JOIN/i.test(editStep)) return "WHERE-expression to INNER JOIN-Condition";
  if (/Replace an asterisk with the expressions it represents/i.test(editStep)) return "Asterisk -> Expressions";
  if (/Replace a number of expressions with an asterisk representing them/i.test(editStep)) return "Expressions -> Asterisk";

  // Atomic Type Variations (\n for better display as x axis label)
  // SELECT
  if (/element in select-clause/i.test(editStep)) return "Element\nSELECT";
  if (/asterisk-selection (from|to) a select-element expression/i.test(editStep)) return "Asterisk\nSELECT";
  if (/table name on an asterisk in a select-element expression/i.test(editStep)) return "Asterisk\nTable";
  if (/column-reference (from|to) a select-element expression/i.test(editStep)) return "Column\nSELECT";
  if (/table name on a column-reference in a select-element expression/i.test(editStep)) return "Table\nSELECT";
  if (/literal (from|to) a select-element expression/i.test(editStep)) return "Literal\nSELECT";
  if (/NOT (from|to) a select-element expression/i.test(editStep)) return "'NOT'\nSELECT";
  if (/aggregation-function (from|to) a select-element expression/i.test(editStep)) return "Agg\nSELECT";
  if (/distinct-declaration on an aggregation-function in a select-element expression/i.test(editStep)) return "DISTINCT\nAgg\nSELECT";
  if (/binary-expression (from|to) a select-element expression/i.test(editStep)) return "Binary\nSELECT";
  if (/explicit alias on a select-element/i.test(editStep)) return "Alias\nSELECT";
  // DISTINCT
  if (/distinct-declaration/i.test(editStep)) return "DISTINCT";
  // FROM
  if (/element in from-clause/i.test(editStep)) return "Element\nFROM";
  if (/Set (missing) complex join-type on a from-element (change cross join to a complex join)/i.test(editStep)) return "Cross to\nComplex JOIN";
  if (/Unset (excess) complex join-type on a from-element (change complex join to cross join)/i.test(editStep)) return "Complex to\nCross JOIN";
  if (/column-reference (from|to) a from-element join-condition/i.test(editStep)) return "Column\nFROM\nJOIN";
  if (/table name on a column-reference in a from-element join-condition/i.test(editStep)) return "Table\nFROM\nJOIN";
  if (/literal (from|to) a from-element join-condition/i.test(editStep)) return "Literal\nFROM\nJOIN";
  if (/NOT (from|to) a from-element join-condition/i.test(editStep)) return "'NOT'\nFROM\nJOIN";
  if (/binary-expression (from|to) a from-element join-condition/i.test(editStep)) return "Binary\nFROM\nJOIN";
  if (/explicit alias (from|on) from-element/i.test(editStep)) return "Alias\nFROM";
  // WHERE
  if (/column-reference (from|to) the where-clause/i.test(editStep)) return "Column\nWHERE";
  if (/table name on a column-reference in the where-clause/i.test(editStep)) return "Table\nWHERE";
  if (/literal (from|to) the where-clause/i.test(editStep)) return "Literal\nWHERE";
  if (/NOT (from|to) the where-clause/i.test(editStep)) return "'NOT'\nWHERE";
  if (/binary-expression (from|to) the where-clause/i.test(editStep)) return "Binary\nWHERE";
  // GROUP BY
  if (/element in group-by-clause/i.test(editStep)) return "Element\nGROUP BY";
  if (/column-reference (from|to) a group-by expression/i.test(editStep)) return "Column\nGROUP BY";
  if (/table name on a column-reference in a group-by expression/i.test(editStep)) return "Table\nGROUP BY";
  if (/literal (from|to) a group-by expression/i.test(editStep)) return "Literal\nGROUP BY";
  if (/NOT (from|to) a group-by expression/i.test(editStep)) return "'NOT'\nGROUP BY";
  if (/binary-expression (from|to) a group-by expression/i.test(editStep)) return "Binary\nGROUP BY";
  // HAVING
  if (/column-reference (from|to) the having-clause/i.test(editStep)) return "Column\nHAVING";
  if (/table name on a column-reference in the having-clause/i.test(editStep)) return "Table\nHAVING";
  if (/literal (from|to) the having-clause/i.test(editStep)) return "Literal\nHAVING";
  if (/NOT (from|to) the having-clause/i.test(editStep)) return "'NOT'\nHAVING";
  if (/aggregation-function (from|to) the having-clause/i.test(editStep)) return "Agg\nHAVING";
  if (/distinct-declaration on an aggregation function in the having-clause/i.test(editStep)) return "DISTINCT\nAgg\nHAVING";
  if (/binary-expression (from|to) the having-clause/i.test(editStep)) return "Binary\nHAVING";
  // ORDER BY
  if (/element in order-by-clause/i.test(editStep)) return "Element\nORDER BY";
  if (/order of order-by-element from ascending to descending/i.test(editStep)) return "ASC -> DESC";
  if (/order of order-by-element from descending to ascending/i.test(editStep)) return "DESC -> ASC";
  if (/column-reference (from|to) a order-by-element expression/i.test(editStep)) return "Column\nORDER BY";
  if (/table name on a column-reference in a order-by-element expression/i.test(editStep)) return "Table\nORDER BY";
  if (/literal (from|to) a order-by-element expression/i.test(editStep)) return "Literal\nORDER BY";
  if (/NOT (from|to) a order-by-element expression/i.test(editStep)) return "'NOT'\nORDER BY";
  if (/aggregation-function (from|to) a order-by-element expression/i.test(editStep)) return "Agg\nORDER BY";
  if (/distinct-declaration on an aggregation function in an order-by-element expression/i.test(editStep)) return "DISTINCT\nAgg\nORDER BY";
  if (/binary-expression (from|to) a order-by-element expression/i.test(editStep)) return "Binary\nORDER BY";

  return "Other";
}

function filterEditStepsByType_atomic(editSteps, type) {
  return editSteps.filter(step => 
    type === "Excess" ? /excess/i.test(step) : /missing/i.test(step)
  );
}
function filterEditStepsByType_horizontal(editSteps, type) {
  type = type.trim();
  if (type === "Swap arguments") {
    return editSteps.filter(step => /swap arguments/i.test(step));
  }
  if (type === "Swap nesting") {
    return editSteps.filter(step => /swap nesting/i.test(step));
  }
  if (type === "Mirror") {
    return editSteps.filter(step => /mirror/i.test(step));
  }
  if (type === "Swap elements") {
    return editSteps.filter(step => /swap elements/i.test(step));
  }
  if (type === "Change position") {
    return editSteps.filter(step => /change position/i.test(step));
  }
  if (type === "Change incorrect") {
    return editSteps.filter(step => /change incorrect/i.test(step));
  }
}
function filterEditStepsByType_shortcut(editSteps, type) {
  type = type.trim();
  if (type === "tautology law") {
    return editSteps.filter(step => /tautology law/i.test(step));
  }
  if (type === "double negation law") {
    return editSteps.filter(step => /double negation law/i.test(step));
  }
  if (type === "distributive law") {
    return editSteps.filter(step => /distributive law/i.test(step));
  }
  if (type === "De Morgan's law") {
    return editSteps.filter(step => /de morgan's law/i.test(step));
  }
  if (type === "absorption law") {
    return editSteps.filter(step => /absorption law/i.test(step));
  }
  if (type === "Move") {
    return editSteps.filter(step => /move/i.test(step));
  }
  if (type === "Replace") {
    return editSteps.filter(step => /replace/i.test(step));
  }
}

function countEditStepCategories(editSteps) {
  if (!Array.isArray(editSteps)) return {};
  const categoryFreq = {};
  editSteps.forEach(step => {
    const categoryName = mapEditStepToCategory(step);
    categoryFreq[categoryName] = (categoryFreq[categoryName] || 0) + 1;
  } );
  return categoryFreq;
}

function StatisticsC() {
  //Defintions for the data, selection bars and theme

  /*In this part the 4 arrays for each of the postgresql database tables are initialized, 
  to insert them into the NoSQLConcepts main tool the correct set data function must be referenced here*/
  const [data, setData] = useState([]); // State for main data
  const [taskData, setTaskData] = useState([]); // State for task-related data
  const [userData, setUserData] = useState([]); // State for user-related data
  const [areaData, setAreaData] = useState([]); // State for area-related data

  const [selectedStatementId, setSelectedStatementId] = useState(""); // State for selected task ID
  const [selectedUserId, setSelectedUserId] = useState(""); // State for selected user ID
  const [selectedAreaId, setSelectedAreaId] = useState(""); // State for selected area ID
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [username, setUsername] = useState("");

  const [areaID_selected_area, setAreaID_SelectedArea] = useState("");
  const [splitSelected_area, setSelected_area] = useState("");

  const [exerciseMaxPoints, setExerciseMaxPoints] = useState(null);
  const [averageReceivedPoints, setAverageReceivedPoints] = useState(null);

  const isTestingArea = splitSelected_area === "testing_area";
  const isSQL = splitSelected_area === "sql-beginner";

  // Effect to set document title on component mount
  useEffect(() => {
    document.title = "NoSQLconcepts";
    const verifyAuth = async () => {
      const authData = await checkAuth();
      setIsAuthenticated(authData !== null);
      if (authData) {
        setIsAdmin(authData.role === "admin");
      }
    };

    verifyAuth();
    const fetchUser = async () => {
      const user = await checkAuth();
      if (user) {
        setUsername(user.username);
      }
    };

    fetchUser();
  }, []);

  /* To integrate into the main tool, either adapt these 4 functions so that they receive the correct data
   or delete the functions and describe them correctly in the setData definitions above */
  const getTaskData = async (area, selected_area) => {
    try {
      const result = await fetchTaskData(area, selected_area); // Fetching task-related data from API
      setTaskData(result); // Setting task data state
    } catch (error) {
      console.error("Error fetching task data:", error);
    }
  };
  const getData = async () => {
    try {
      const result = await fetchData(); // Fetching data
      setData(result); // Setting main data state
      console.log(
        result.filter(
          (item) =>
            String(item.statement_id).trim() === String(selectedStatementId).trim() &&
            String(item.task_area_id).trim() === String(selectedAreaId).trim() &&
            String(item.selected_area).trim() === String(splitSelected_area).trim()
        )
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    const getUserData = async () => {
      try {
        const result = await fetchUserData(); // Fetching user-related data from API
        setUserData(result); // Setting user data state
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    const getAreaData = async () => {
      try {
        const result = await fetchAreaData(); // Fetching area-related data from API
        setAreaData(result); // Setting area data state
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getUserData(); // Fetch user data
    getAreaData(); // Fetch area data
    //getTaskData(); // Fetch task data on initial render
    getData(); // Fetch main data on initial render
  }, []);

  // Event handler for selecting task
  const handleStatementIdChange = (event) => {
    setSelectedStatementId(String(event.target.value));
  };

  // Event handler for selecting user
  const handleUserIdChange = (event) => {
    setSelectedUserId(event.target.value);
  };

  // Event handler for selecting area
  const handleAreaIdChange = (event) => {
    const selectedValue = event.target.value;
    const firstHyphenIndex = selectedValue.indexOf('-');
    const area_id = selectedValue.substring(0, firstHyphenIndex);
    const selected_area = selectedValue.substring(firstHyphenIndex + 1);
    setAreaID_SelectedArea(selectedValue);
    setSelectedAreaId(area_id);
    setSelected_area(selected_area);
    getTaskData(area_id, selected_area);

    if (selected_area === "testing_area") {
      setSelectedStatementId(1);
    }
  };

  // CSV download function
  const downloadCSV = (data, filename) => {
    const csvContent =
      "data:text/csv;charset=utf-8," + data.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
  };

  const downloadTaskData = () => {
    const csvData = [
      ["Time ranges in minutes", "Frequency"],
      ["below 30min", timedata[0].data[0]],
      ["30-60min", timedata[0].data[1]],
      ["60-90min", timedata[0].data[2]],
      ["over 90min", timedata[0].data[3]],
    ];
    downloadCSV(csvData, "task_data.csv");
  };

  const downloadAreaData = () => {
    const csvData = [
      ["Time ranges in minutes", "Frequency"],
      ["below 30min", areatimedata[0].data[0]],
      ["30-60min", areatimedata[0].data[1]],
      ["60-90min", areatimedata[0].data[2]],
      ["over 90min", areatimedata[0].data[3]],
    ];
    downloadCSV(csvData, "area_data.csv");
  };
  // CSV download function for Task Difficulty Data
  const downloadTaskDifficultyData = () => {
    const csvData = [
      ["Difficulty Level", "Frequency"],
      ["Very Easy", difdata[0].data[0]],
      ["Easy", difdata[0].data[1]],
      ["Moderate", difdata[0].data[2]],
      ["Hard", difdata[0].data[3]],
      ["Very Hard", difdata[0].data[4]],
    ];
    downloadCSV(csvData, "task_difficulty_data.csv");
  };

  // CSV download function for Area Difficulty Data
  const downloadAreaDifficultyData = () => {
    const csvData = [
      ["Difficulty Level", "Frequency"],
      ["Very Easy", areadifdata[0].data[0]],
      ["Easy", areadifdata[0].data[1]],
      ["Moderate", areadifdata[0].data[2]],
      ["Hard", areadifdata[0].data[3]],
      ["Very Hard", areadifdata[0].data[4]],
    ];
    downloadCSV(csvData, "area_difficulty_data.csv");
  };

  /*In this part the filtered arrays are defined, all 4 Postgresql tables are available as arrays and are filtered here accordingly,
   e.g. to save only the time values in an array */

  // Filtered data based on selected task
  const filteredData = data.filter(
    (item) =>
      String(item.statement_id).trim() === String(selectedStatementId).trim() &&
      String(item.task_area_id).trim() === String(selectedAreaId).trim() &&
      String(item.selected_area).trim() === String(splitSelected_area).trim()
  ); //Filters by selected task (Statement ID)
  const processingTimes = filteredData.map((item) => item.processing_time / 60); //Filters the data of the selected task, so that only the time values remain
  const dif_data = filteredData.map((item) => item.difficulty_level); //Filters for dif values only
  const timedata = generateDataSeries(processingTimes); //Generate a times series of the filtered time data
  const difdata = generateDif_Series(dif_data).dataSeries; //This saves the data from all users grouped by difficulty e.g. very easy = 3, easy = 5....
  const avgdiffi = generateDif_Series(dif_data).resultavgdif; //This just saves the average dif e.g. 3.4
  const meanProcessingTime =
    filteredData.length > 0 //Gets mean processing time
      ? (
          filteredData.reduce(
            (acc, item) => acc + item.processing_time / 60,
            0
          ) / filteredData.length
        ).toFixed(0)
      : null;

  // Filtered data based on selected area ('paper')
  const filteredAreaData = data.filter(
    (item) => String(item.task_area_id).trim() === String(selectedAreaId).trim() &&
              String(item.selected_area).trim() === String(splitSelected_area).trim()
  ); //Same as for the statement tasks but with the area filter now

  // --------------------------------------------------------------------------------------------------
  // ----------------  Collect and sort all edit steps from the filtered area data --------------------
  const collectedEditSteps = filteredAreaData
    .map(item => item.edit_steps_list || [])
    .flat();

  // Filter editSteps by type (atomicEdits)
  const excessEditSteps = filterEditStepsByType_atomic(collectedEditSteps || [], "Excess");
  const missingEditSteps = filterEditStepsByType_atomic(collectedEditSteps || [], "Missing");
  // Filter editSteps by type (horizontalEdits)
  const argu_HorEditSteps = filterEditStepsByType_horizontal(collectedEditSteps || [], "Swap arguments");
  const nest_HorEditSteps = filterEditStepsByType_horizontal(collectedEditSteps || [], "Swap nesting");
  const mirror_HorEditSteps = filterEditStepsByType_horizontal(collectedEditSteps || [], "Mirror");
  const elem_HorEditSteps = filterEditStepsByType_horizontal(collectedEditSteps || [], "Swap elements");
  const pos_HorEditSteps = filterEditStepsByType_horizontal(collectedEditSteps || [], "Change position");
  const incorr_HorEditSteps = filterEditStepsByType_horizontal(collectedEditSteps || [], "Change (incorrect)");
  // Filter editSteps by type (shortcutEdits)
  const tautology_shortEditSteps = filterEditStepsByType_shortcut(collectedEditSteps || [], "tautology law");
  const double_shortEditSteps = filterEditStepsByType_shortcut(collectedEditSteps || [], "double negation law");
  const distributive_shortEditSteps = filterEditStepsByType_shortcut(collectedEditSteps || [], "distributive law");
  const morgan_shortEditSteps = filterEditStepsByType_shortcut(collectedEditSteps || [], "De Morgan's law");
  const absorption_shortEditSteps = filterEditStepsByType_shortcut(collectedEditSteps || [], "absorption law");
  const move_shortEditSteps = filterEditStepsByType_shortcut(collectedEditSteps || [], "Move");
  const replace_shortEditSteps = filterEditStepsByType_shortcut(collectedEditSteps || [], "Replace");

  // Frequency count (atomicEdits)
  const excessEditStepFreq = countEditStepCategories(excessEditSteps);
  const missingEditStepFreq = countEditStepCategories(missingEditSteps);
  // Frequency count (horizontalEdits)
  const argu_HorEditStepsFreq = countEditStepCategories(argu_HorEditSteps);
  const nest_HorEditStepsFreq = countEditStepCategories(nest_HorEditSteps);
  const mirror_HorEditStepsFreq = countEditStepCategories(mirror_HorEditSteps);
  const elem_HorEditStepsFreq = countEditStepCategories(elem_HorEditSteps);
  const pos_HorEditStepsFreq = countEditStepCategories(pos_HorEditSteps);
  const incorr_HorEditStepsFreq = countEditStepCategories(incorr_HorEditSteps);
  const horizontalCount = [
    argu_HorEditStepsFreq, nest_HorEditStepsFreq, mirror_HorEditStepsFreq,
    elem_HorEditStepsFreq, pos_HorEditStepsFreq, incorr_HorEditStepsFreq
  ].flatMap(obj => Object.values(obj)).reduce((a, b) => a + b, 0);
  // Frequency count (shortcutEdits)
  const tautology_shortEditStepsFreq = countEditStepCategories(tautology_shortEditSteps);
  const double_shortEditStepsFreq = countEditStepCategories(double_shortEditSteps);
  const distributive_shortEditStepsFreq = countEditStepCategories(distributive_shortEditSteps);
  const morgan_shortEditStepsFreq = countEditStepCategories(morgan_shortEditSteps);
  const absorption_shortEditStepsFreq = countEditStepCategories(absorption_shortEditSteps);
  const move_shortEditStepsFreq = countEditStepCategories(move_shortEditSteps);
  const replace_shortEditStepsFreq = countEditStepCategories(replace_shortEditSteps);
  const shortcutCount = [
    tautology_shortEditStepsFreq, double_shortEditStepsFreq,
    distributive_shortEditStepsFreq, morgan_shortEditStepsFreq,
    absorption_shortEditStepsFreq, move_shortEditStepsFreq,
    replace_shortEditStepsFreq
  ].flatMap(obj => Object.values(obj)).reduce((a, b) => a + b, 0);

  // Data for charts (atomicEdits)
  const excessEditStepCategories = Object.keys(excessEditStepFreq);
  const excessEditStepCounts = Object.values(excessEditStepFreq);
  const missingEditStepCategories = Object.keys(missingEditStepFreq);
  const missingEditStepCounts = Object.values(missingEditStepFreq);

  // Data for chart (horizontalEdits)
  const horizontalTypes = [
    "Swap\narguments", "Swap\nnesting", "Mirror", "Swap\nelements", "Change\npositions", "Change\n(incorrect)"
  ];
  const getHorizontalVariants = [
  ...new Set(
    Object.keys(argu_HorEditStepsFreq)
      .concat(Object.keys(nest_HorEditStepsFreq))
      .concat(Object.keys(mirror_HorEditStepsFreq))
      .concat(Object.keys(elem_HorEditStepsFreq))
      .concat(Object.keys(pos_HorEditStepsFreq))
      .concat(Object.keys(incorr_HorEditStepsFreq))
    )
  ];
  const horizontalSeries = getHorizontalVariants.map(variant => ( {
  label: variant,
  data: [
    argu_HorEditStepsFreq[variant] || 0,
    nest_HorEditStepsFreq[variant] || 0,
    mirror_HorEditStepsFreq[variant] || 0,
    elem_HorEditStepsFreq[variant] || 0,
    pos_HorEditStepsFreq[variant] || 0,
    incorr_HorEditStepsFreq[variant] || 0
    ]
  } ) );

  // Data for charts (shortcutEdits)
  const shortCutTypes = [
    "Tautology\nlaw", "Double\nnegation\nlaw", "Distributive\nlaw", "De\nMorgan\nlaw", "Absorption\nlaw",
    "Move", "Replace"
  ];
  const getShortCutVariants = [
  ...new Set(
    Object.keys(tautology_shortEditStepsFreq)
      .concat(Object.keys(double_shortEditStepsFreq) )
      .concat(Object.keys(distributive_shortEditStepsFreq) )
      .concat(Object.keys(morgan_shortEditStepsFreq) )
      .concat(Object.keys(absorption_shortEditStepsFreq) )
      .concat(Object.keys(move_shortEditStepsFreq) )
      .concat(Object.keys(replace_shortEditStepsFreq) )
    )
  ];
  const shortCutSeries = getShortCutVariants.map(variant => ( {
  label: variant,
  data: [
    tautology_shortEditStepsFreq[variant] || 0,
    double_shortEditStepsFreq[variant] || 0,
    distributive_shortEditStepsFreq[variant] || 0,
    morgan_shortEditStepsFreq[variant] || 0,
    absorption_shortEditStepsFreq[variant] || 0,
    move_shortEditStepsFreq[variant] || 0,
    replace_shortEditStepsFreq[variant] || 0
    ]
  } ) );
  // ---------------------------------------------------------------------------------------------------------
  // ---------------- Collect and sort all edit steps from the filtered data based on selected task ----------
  const collectedTaskEditSteps = filteredData
    .map(item => item.edit_steps_list || [])
    .flat();

  // Filter editSteps by type (atomicEdits)
  const excessES_Task= filterEditStepsByType_atomic(collectedTaskEditSteps || [], "Excess");
  const missingES_Task = filterEditStepsByType_atomic(collectedTaskEditSteps || [], "Missing");
  // >> Filter editSteps by type (horizontalEdits)
  const argu_HorES_Task = filterEditStepsByType_horizontal(collectedTaskEditSteps || [], " Swap arguments");
  const nest_HorES_Task = filterEditStepsByType_horizontal(collectedTaskEditSteps || [], "Swap nesting");
  const mirror_HorES_Task = filterEditStepsByType_horizontal(collectedTaskEditSteps || [], "Mirror");
  const elem_HorES_Task = filterEditStepsByType_horizontal(collectedTaskEditSteps || [], "Swap elements");
  const pos_HorES_Task = filterEditStepsByType_horizontal(collectedTaskEditSteps || [], "Change position");
  const incorr_HorES_Task = filterEditStepsByType_horizontal(collectedTaskEditSteps || [], "Change (incorrect)");
  // Filter editSteps by type (shortcutEdits)
  const tautology_shortES_Task = filterEditStepsByType_shortcut(collectedTaskEditSteps || [], "tautology law");
  const double_shortES_Task = filterEditStepsByType_shortcut(collectedTaskEditSteps || [], "double negation law");
  const distributive_shortES_Task = filterEditStepsByType_shortcut(collectedTaskEditSteps || [], "distributive law");
  const morgan_shortES_Task = filterEditStepsByType_shortcut(collectedTaskEditSteps || [], "De Morgan's law");
  const absorption_shortES_Task = filterEditStepsByType_shortcut(collectedTaskEditSteps || [], "absorption law");
  const move_shortES_Task = filterEditStepsByType_shortcut(collectedTaskEditSteps || [], "Move");
  const replace_shortES_Task = filterEditStepsByType_shortcut(collectedTaskEditSteps || [], "Replace");

  // Frequency count (atomicEdits)
  const excessES_TaskFreq = countEditStepCategories(excessES_Task);
  const missingES_TaskFreq = countEditStepCategories(missingES_Task);
  // Frequency count (horizontalEdits)
  const argu_HorES_TaskFreq = countEditStepCategories(argu_HorES_Task);
  const nest_HorES_TaskFreq = countEditStepCategories(nest_HorES_Task);
  const mirror_HorES_TaskFreq = countEditStepCategories(mirror_HorES_Task);
  const elem_HorES_TaskFreq = countEditStepCategories(elem_HorES_Task);
  const pos_HorES_TaskFreq = countEditStepCategories(pos_HorES_Task);
  const incorr_HorES_TaskFreq = countEditStepCategories(incorr_HorES_Task);
  const horizontalCount_Task = [
    argu_HorES_TaskFreq, nest_HorES_TaskFreq, mirror_HorES_TaskFreq,
    elem_HorES_TaskFreq, pos_HorES_TaskFreq, incorr_HorES_TaskFreq
  ].flatMap(obj => Object.values(obj)).reduce((a, b) => a + b, 0);
  // Frequency count (shortcutEdits)
  const tautology_shortES_TaskFreq = countEditStepCategories(tautology_shortES_Task);
  const double_shortES_TaskFreq = countEditStepCategories(double_shortES_Task);
  const distributive_shortES_TaskFreq = countEditStepCategories(distributive_shortES_Task);
  const morgan_shortES_TaskFreq = countEditStepCategories(morgan_shortES_Task);
  const absorption_shortES_TaskFreq = countEditStepCategories(absorption_shortES_Task);
  const move_shortES_TaskFreq = countEditStepCategories(move_shortES_Task);
  const replace_shortES_TaskFreq = countEditStepCategories(replace_shortES_Task);
  const shortcutCount_Task = [
    tautology_shortES_TaskFreq, double_shortES_TaskFreq,
    distributive_shortES_TaskFreq, morgan_shortES_TaskFreq,
    absorption_shortES_TaskFreq, move_shortES_TaskFreq, replace_shortES_TaskFreq
  ].flatMap(obj => Object.values(obj)).reduce((a, b) => a + b, 0);

  // Data for charts (atomicEdits)
  const excessES_TaskCategories = Object.keys(excessES_TaskFreq);
  const excessES_TaskCounts = Object.values(excessES_TaskFreq);
  const missingES_TaskCategories = Object.keys(missingES_TaskFreq);
  const missingES_TaskCounts = Object.values(missingES_TaskFreq);

  // Data for chart (horizontalEdits)
  const getHorizontalVariants_Task = [
  ...new Set(
    Object.keys(argu_HorES_TaskFreq)
      .concat(Object.keys(nest_HorES_TaskFreq))
      .concat(Object.keys(mirror_HorES_TaskFreq))
      .concat(Object.keys(elem_HorES_TaskFreq))
      .concat(Object.keys(pos_HorES_TaskFreq))
      .concat(Object.keys(incorr_HorES_TaskFreq))
    )
  ];
  const horizontalSeries_Task = getHorizontalVariants_Task.map(variant => ( {
  label: variant,
  data: [
    argu_HorES_TaskFreq[variant] || 0,
    nest_HorES_TaskFreq[variant] || 0,
    mirror_HorES_TaskFreq[variant] || 0,
    elem_HorES_TaskFreq[variant] || 0,
    pos_HorES_TaskFreq[variant] || 0,
    incorr_HorES_TaskFreq[variant] || 0
    ]
  } ) );

  // Data for charts (shortcutEdits)
  const getShortCutVariants_Task = [
  ...new Set(
    Object.keys(tautology_shortES_TaskFreq)
      .concat(Object.keys(double_shortES_TaskFreq))
      .concat(Object.keys(distributive_shortES_TaskFreq))
      .concat(Object.keys(morgan_shortES_TaskFreq))
      .concat(Object.keys(absorption_shortES_TaskFreq))
      .concat(Object.keys(move_shortES_TaskFreq))
      .concat(Object.keys(replace_shortES_TaskFreq))
    )
  ];
  const shortCutSeries_Task = getShortCutVariants_Task.map(variant => ( {
  label: variant,
  data: [
    tautology_shortES_TaskFreq[variant] || 0,
    double_shortES_TaskFreq[variant] || 0,
    distributive_shortES_TaskFreq[variant] || 0,
    morgan_shortES_TaskFreq[variant] || 0,
    absorption_shortES_TaskFreq[variant] || 0,
    move_shortES_TaskFreq[variant] || 0,
    replace_shortES_TaskFreq[variant] || 0
    ]
  } ) );
  // ---------------------------------------------------------------------------------------------------------

  const processingAreaTimes = filteredAreaData.map(
    (item) => item.processing_time / 60
  );
  const area_dif_data = filteredAreaData.map((item) => item.difficulty_level);
  const areatimedata = generateDataSeries(processingAreaTimes);
  const areadifdata = generateDif_Series(area_dif_data).dataSeries;
  const areaavgdiffi = generateDif_Series(area_dif_data).resultavgdif;
  const AreameanProcessingTime =
    filteredAreaData.length > 0
      ? (
          filteredAreaData.reduce(
            (acc, item) => acc + item.processing_time / 60,
            0
          ) / filteredAreaData.length
        ).toFixed(0)
      : null;

  // Filtered data based on selected user
  const filteredUserData = data.filter(
    (item) => item.username === selectedUserId &&
               item.selected_area === splitSelected_area
  ); //Same as for the statement task but with user, area and statement filter now
  const filteredUserTaskData = filteredUserData.filter(
    (item) =>
      String(item.statement_id).trim() === String(selectedStatementId).trim() &&
      String(item.task_area_id).trim() === String(selectedAreaId).trim() &&
      String(item.selected_area).trim() === String(splitSelected_area).trim()
  );
  const UserTaskprocessingTimes = filteredUserTaskData.map((item) =>
    (item.processing_time / 60).toFixed(0)
  );
  const UserTaskdifdata = filteredUserTaskData.map(
    (item) => item.difficulty_level
  );
  const filteredUserAreaData = filteredUserData.filter(
    (item) => item.task_area_id === selectedAreaId
  );
  const UserAreadifdata = filteredUserAreaData.map(
    (item) => item.difficulty_level
  );
  const userareaavgdiffi = generateDif_Series(UserAreadifdata).resultavgdif;
  const AreameanProcessingTimeUser =
    filteredUserAreaData.length > 0
      ? (
          filteredUserAreaData.reduce(
            (acc, item) => acc + item.processing_time / 60,
            0
          ) / filteredUserAreaData.length
        ).toFixed(0)
      : null;

  const filteredTaskData = taskData.filter(
    (item) =>
      String(item.area_id).trim() === String(selectedAreaId).trim() &&
      String(item.selected_area).trim() === String(splitSelected_area).trim()
  );

  // Max SQL Points and Average received Points for selected SQL Exercise
  useEffect(() => {
    if (isSQL) {
      if (!selectedStatementId) { setExerciseMaxPoints(null); return; }

      const filteredTD = taskData.filter(
        (item) =>
          String(item.statement_id).trim() === String(selectedStatementId).trim() &&
          String(item.area_id).trim() === String(selectedAreaId).trim() &&
          String(item.selected_area).trim() === String(splitSelected_area).trim()
      );
      const maxSQLPointsTD = filteredTD[0]?.maxsql_points ?? null;
      setExerciseMaxPoints(maxSQLPointsTD);
      console.log("Max Points (exercise):", maxSQLPointsTD);

      const filteredDataNotTesting = filteredData.filter(
        (item) =>
          item.selected_area !== "testing_area"
      );

      const allSqlPoints = filteredDataNotTesting.flatMap((item) =>
        Array.isArray(item.sql_point_list) ? item.sql_point_list : []
      );
      const avgPoints =
        allSqlPoints.length
          ? (allSqlPoints.reduce((s, n) => s + Number(n || 0), 0) / allSqlPoints.length).toFixed(2)
          : null;
      setAverageReceivedPoints(avgPoints);
      console.log("Avg SQL points (all users):", avgPoints);
    }
  }, [filteredData]);

  return (
    <Grid container spacing={2} alignItems="center">
      {/* 1. Task selection section */}
      <Grid item xs={12} md={12}>
        <Typography>Choose Area and Task for detailed statistics:</Typography>{" "}
        <InputLabel id="area-label">Select Area</InputLabel>
        <Select
          labelId="area-label"
          id="area-select"
          value={areaID_selected_area}
          onChange={handleAreaIdChange}
          style={{ width: "100%" }}
        >
          {areaData.map((item) => (
            <MenuItem key={item.area_id + "-" + item.selected_area} value={item.area_id + "-" + item.selected_area}>
              {item.area_name} - Bereich: {item.selected_area}
            </MenuItem>
          ))}
        </Select>
        <InputLabel id="statement-label">Select Task</InputLabel>
        <Select
          labelId="statement-label"
          id="statement-select"
          value={selectedStatementId}
          onChange={handleStatementIdChange}
          style={{ width: "100%" }}
        >
          {filteredTaskData.map((item) => (
            <MenuItem key={item.data_id} value={item.statement_id}>
              {item.subtasknumber}
            </MenuItem>
          ))}
        </Select>
      </Grid>

      {isSQL && (
        <Grid item xs={12} md={12} sx={{ display: "flex", justifyContent: "center" }}>
          <ImportantMsg
            message={`The maximum points for this task are: ${exerciseMaxPoints ?? "-"} and on the average the received points are: ${averageReceivedPoints ?? "-"}`}
            type="info"
          />
        </Grid>
      )}

      {/* TOP 1/3 - Needed Time & Difficulty */}
      {filteredData.length > 0 && (
        <>
          <Grid item xs={12} md={6}>
            <Box
              height="100%"
              /*  backgroundColor={colors.primary[400]} */
              sx={cardStyle}
            >
              <Typography>Needed Time for Selected Task:</Typography>
              <Typography>
                Mean Processing Time by all users: {meanProcessingTime} Minutes
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: ["below 30min", "30-60min", "60-90min", "over 90min"],
                    label: "Time ranges in minutes",
                  },
                ]}
                yAxis={[
                  {
                    scaleType: "linear",
                    label: "frequency",
                  },
                ]}
                series={timedata}
                /* colors={[colors.custom01[400], colors.greenAccent[700]]} */
                width={500}
                height={300}
              />
              <Button
                onClick={downloadTaskData}
                
              >
                Download  CSV <DownloadIcon></DownloadIcon>
              </Button>
            </Box>
          </Grid>
        {!isTestingArea && (
          <Grid item xs={12} md={6}>
            <Box
              height="100%"
              /* backgroundColor={colors.primary[400]} */
              sx={cardStyle}
            >
              <Typography>Difficulty for Selected Task:</Typography>
              <Typography>
                Mean Difficulty Rating by all users: {avgdiffi}/5
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: [
                      "Very Easy",
                      "Easy",
                      "Medium",
                      "Difficult",
                      "Very Difficult",
                    ],
                    label: "Difficulty",
                  },
                ]}
                yAxis={[
                  {
                    scaleType: "linear",
                    label: "frequency",
                  },
                ]}
                series={difdata}
                /* colors={[colors.custom01[400], colors.greenAccent[700]]} */
                width={500}
                height={300}
              />
              <Button
                onClick={downloadTaskDifficultyData}
              
              >
                Download CSV <DownloadIcon></DownloadIcon>
              </Button>
            </Box>
          </Grid>
        )}
        </>
      )}

      {/* Message when no task is selected */}
      {/* {selectedStatementId == 0 && (
        <Grid container spacing={2} justify="flex-start">
          <Grid item xs={6} md={6}>
            <p style={{ marginLeft: "0px" }}>Please select a task </p>
          </Grid>
        </Grid>
      )} */}
      {/* Message when no data is available for selected task */}
      {selectedStatementId && filteredData.length == 0 && (
        <Grid container spacing={0} justify="flex-start">
          <Grid item xs={6} md={6}>
            <p style={{ marginLeft: "0px" }}>
              No Data available for this task, please select another{" "}
            </p>
          </Grid>
        </Grid>
      )}
      {/* Placeholder when no task is selected */}
      {filteredData.length == 0 && (
        <>
          <Grid item xs={12} md={6} />
        </>
      )}

      {/* TOP 2/3 - Excess & Missing */}
      {filteredAreaData.length > 0 && isSQL && isAdmin && !isTestingArea && ( 
        <>
          <Grid item xs={12} md={6}>
            <Box
              height="100%" 
              /* backgroundColor={colors.primary[400]} */
              sx={cardStyle}
            >
              <Typography>User Error Excess Types for Selected Task:</Typography>
              <Typography>
                Not Needed Input(s): {excessES_Task.length} {" "}
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: excessES_TaskCategories,
                    label: "",
                  },
                ]}
                yAxis={[
                  {
                    scaleType: "linear",
                    label: "frequency",
                  },
                ]}
                series={[{ data: excessES_TaskCounts }]}
                /* colors={[colors.blueAccent[400], colors.greenAccent[400]]} */
                padding={0.3}
                width={500}
                height={300}
              />
              <Typography
                align="center"
                variant="subtitle1"
                sx={{ fontWeight: 390, color: "#000000ff", fontSize: 14 }}
                >
                Error Excess Types
              </Typography>
              <br></br>
              <Button
                onClick={() =>
                  downloadCSV(
                    [
                      ["Type", "Frequency"],
                      ...excessES_TaskCategories.map((categoryName, i) => [
                        categoryName,
                        excessES_TaskCounts[i],
                      ]),
                    ],
                    "excess_editsteps.csv"
                  )
                }
              >
                Download CSV <DownloadIcon></DownloadIcon>
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              height="100%"
              /* backgroundColor={colors.primary[400]} */
              sx={cardStyle}
            >
              <Typography>User Error Missing Types for Selected Task:</Typography>
              <Typography>
                Missing Input(s): {missingES_Task.length} {" "}
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: missingES_TaskCategories,
                    label: "",
                  },
                ]}
                yAxis={[
                  {
                    scaleType: "linear",
                    label: "frequency",
                  },
                ]}
                series={[{ data: missingES_TaskCounts }]}
                /* colors={[colors.blueAccent[400], colors.greenAccent[400]]} */
                padding={0.3}
                width={500}
                height={300}
              />
              <Typography
                align="center"
                variant="subtitle1"
                sx={{ fontWeight: 390, color: "#000000ff", fontSize: 14 }}
                >
                Error Missing Types
              </Typography>
              <Button
                onClick={downloadAreaData}
              >
                Download CSV <DownloadIcon></DownloadIcon>
              </Button>
            </Box>
          </Grid>

        </>
      )}

      {/* TOP 3/3 - Horizontal & Shortcut */}
      {filteredAreaData.length > 0 && isSQL && isAdmin && !isTestingArea && (
        <>
          <Grid item xs={12} md={6}>
            <Box
              height="100%" 
              /* backgroundColor={colors.primary[400]} */
              sx={cardStyle}
            >
              <Typography>User Error Horizontal-Edit Types for Selected Task:</Typography>
              <Typography>
                Horizontal-Edit(s): {horizontalCount_Task} {" "}
              </Typography>
              <BarChart     
                xAxis={[
                  {
                    scaleType: "band",
                    data: horizontalTypes,
                    label: "",
                  },
                ]}
                yAxis={[
                  {
                    scaleType: "linear",
                    label: "frequency",
                  },
                ]}
                series={horizontalSeries_Task} 
                /* colors={[colors.blueAccent[400], colors.greenAccent[400]]} */
                stacking="normal"
                padding={0.3}
                width={500}
                height={300}
              />
              <Typography
                align="center"
                variant="subtitle1"
                sx={{ fontWeight: 390, color: "#000000ff", fontSize: 14 }}
                >
                Error horizontalEdit Types
              </Typography>
              <Button
                onClick={() =>
                  downloadCSV(
                    [
                      ["Type", "Frequency"],
                      ...excessES_TaskCategories.map((categoryName, i) => [
                        categoryName,
                        excessES_TaskCounts[i],
                      ]),
                    ],
                    "excess_editsteps.csv"
                  )
                }
              >
                Download CSV <DownloadIcon></DownloadIcon>
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              height="100%"
              /* backgroundColor={colors.primary[400]} */
              sx={cardStyle}
            >
              <Typography>User Error Shortcut-Edit Types for Selected Task:</Typography>
              <Typography>
                Shortcut-Edit Input(s): {shortcutCount_Task} {" "}
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: shortCutTypes,
                    label: "",
                  },
                ]}
                yAxis={[
                  {
                    scaleType: "linear",
                    label: "frequency",
                  },
                ]}
                series={shortCutSeries_Task}
                /* colors={[colors.blueAccent[400], colors.greenAccent[400]]} */
                stacking="normal"
                padding={0.3}
                width={500}
                height={300}
              />
              <Typography
                align="center"
                variant="subtitle1"
                sx={{ fontWeight: 390, color: "#000000ff", fontSize: 14 }}
                >
                Error Shortcut-Edit Types
              </Typography>
              <Button
                onClick={downloadAreaData}
              >
                Download CSV <DownloadIcon></DownloadIcon>
              </Button>
            </Box>
          </Grid>

        </>
      )}

      <Grid item xs={12}>
        <Divider sx={ { my: 1, backgroundColor: "black", height: "2px" } } />
      </Grid>

      {/* BOTTOM 1/3 - Needed Time & Difficulty */}
      {filteredAreaData.length > 0 && isSQL && isAdmin && (
        <>
        
          <Grid item xs={12} md={6}>
            <Box
              height="100%"
              /* backgroundColor={colors.primary[400]} */
              sx={cardStyle}
            >
              <Typography>Needed Time for Selected Area:</Typography>
              <Typography>
                Mean Processing Time by all users: {AreameanProcessingTime}{" "}
                Minutes
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: ["below 30min", "30-60min", "60-90min", "over 90min"],
                    label: "Time ranges in minutes",
                  },
                ]}
                yAxis={[
                  {
                    scaleType: "linear",
                    label: "frequency",
                  },
                ]}
                series={areatimedata}
                /* colors={[colors.blueAccent[400], colors.greenAccent[400]]} */
                padding={0.3}
                width={500}
                height={300}
              />
              <Button
                onClick={downloadAreaData}
            
              >
                Download CSV <DownloadIcon></DownloadIcon>
              </Button>
            </Box>
          </Grid>
          {!isTestingArea &&(
          <Grid item xs={12} md={6}>
            <Box
              height="100%"
              /* backgroundColor={colors.primary[400]} */
              sx={cardStyle}
            >
              <Typography>Difficulty for Selected Area:</Typography>
              <Typography>
                Mean Difficulty Rating by all users: {areaavgdiffi}/5
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: [
                      "Very Easy",
                      "Easy",
                      "Medium",
                      "Difficult",
                      "Very Difficult",
                    ],
                    label: "Difficulty",
                  },
                ]}
                yAxis={[
                  {
                    scaleType: "linear",
                    label: "frequency",
                  },
                ]}
                series={areadifdata}
                /*  colors={[colors.blueAccent[400], colors.greenAccent[400]]} */
                width={500}
                height={300}
              />
              <Button
                onClick={downloadAreaDifficultyData}
            
              >
                Download CSV <DownloadIcon></DownloadIcon>
              </Button>
            </Box>
          </Grid>
          )}
        </>
      )}


      {/* BOTTOM 2/3 - Excess & Missing */}
      {filteredAreaData.length > 0 && isAdmin && !isTestingArea && ( 
        <>

          <Grid item xs={12} md={6}>
            <Box
              height="100%"
              /* backgroundColor={colors.primary[400]} */
              sx={cardStyle}
            >
              <Typography>User Error Excess Types for Selected Area:</Typography>
              <Typography>
                Not Needed Input(s): {excessEditSteps.length} {" "}
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: excessEditStepCategories,
                    label: "",
                  },
                ]}
                yAxis={[
                  {
                    scaleType: "linear",
                    label: "frequency",
                  },
                ]}
                series={[{ data: excessEditStepCounts }]}
                /* colors={[colors.blueAccent[400], colors.greenAccent[400]]} */
                padding={0.3}
                width={500}
                height={300}
              />
              <Typography
                align="center"
                variant="subtitle1"
                sx={{ fontWeight: 390, color: "#000000ff", fontSize: 14 }}
                >
                Error Excess Types
              </Typography>
              <Button
                onClick={() =>
                  downloadCSV(
                    [
                      ["Type", "Frequency"],
                      ...excessEditStepCategories.map((categoryName, i) => [
                        categoryName,
                        excessEditStepCounts[i],
                      ]),
                    ],
                    "excess_editsteps.csv"
                  )
                }
              >
                Download CSV <DownloadIcon></DownloadIcon>
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              height="100%"
              /* backgroundColor={colors.primary[400]} */
              sx={cardStyle}
            >
              <Typography>User Error Missing Types for Selected Area:</Typography>
              <Typography>
                Missing Input(s): {missingEditSteps.length} {" "}
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: missingEditStepCategories,
                    label: "",
                  },
                ]}
                yAxis={[
                  {
                    scaleType: "linear",
                    label: "frequency",
                  },
                ]}
                series={[{ data: missingEditStepCounts }]}
                /* colors={[colors.blueAccent[400], colors.greenAccent[400]]} */
                padding={0.3}
                width={500}
                height={300}
              />
              <Typography
                align="center"
                variant="subtitle1"
                sx={{ fontWeight: 390, color: "#000000ff", fontSize: 14 }}
                >
                Error Missing Types
              </Typography>
              <Button
                onClick={downloadAreaData}
              >
                Download CSV <DownloadIcon></DownloadIcon>
              </Button>
            </Box>
          </Grid>

        </>
      )}

      {/* BOTTOM 3/3 - horizontalEdit & shortcutEdit */}
      {filteredAreaData.length > 0 && isSQL && isAdmin && !isTestingArea && ( 
        <>

          <Grid item xs={12} md={6}>
            <Box
              height="100%" 
              /* backgroundColor={colors.primary[400]} */
              sx={cardStyle}
            >
              <Typography>User Error Horizontal-Edit Types for Selected Task:</Typography>
              <Typography>
                Horizontal-Edit(s): {horizontalCount} {" "}
              </Typography>
              <BarChart     
                xAxis={[
                  {
                    scaleType: "band",
                    data: horizontalTypes,
                    label: "",
                  },
                ]}
                yAxis={[
                  {
                    scaleType: "linear",
                    label: "frequency",
                  },
                ]}
                series={horizontalSeries} 
                /* colors={[colors.blueAccent[400], colors.greenAccent[400]]} */
                stacking="normal"
                padding={0.3}
                width={500}
                height={300}
              />
              <Typography
                align="center"
                variant="subtitle1"
                sx={{ fontWeight: 390, color: "#000000ff", fontSize: 14 }}
                >
                Error horizontalEdit Types
              </Typography>
              <Button
                onClick={() =>
                  downloadCSV(
                    [
                      ["Type", "Frequency"],
                      ...excessES_TaskCategories.map((categoryName, i) => [
                        categoryName,
                        excessES_TaskCounts[i],
                      ]),
                    ],
                    "excess_editsteps.csv"
                  )
                }
              >
                Download CSV <DownloadIcon></DownloadIcon>
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              height="100%"
              /* backgroundColor={colors.primary[400]} */
              sx={cardStyle}
            >
              <Typography>User Error Shortcut-Edit Types for Selected Task:</Typography>
              <Typography>
                Shortcut-Edit Input(s): {shortcutCount} {" "}
              </Typography>
              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: shortCutTypes,
                    label: "",
                  },
                ]}
                yAxis={[
                  {
                    scaleType: "linear",
                    label: "frequency",
                  },
                ]}
                series={shortCutSeries}
                /* colors={[colors.blueAccent[400], colors.greenAccent[400]]} */
                stacking="normal"
                padding={0.3}
                width={500}
                height={300}
              />
              <Typography
                align="center"
                variant="subtitle1"
                sx={{ fontWeight: 390, color: "#000000ff", fontSize: 14 }}
                >
                Error Shortcut-Edit Types
              </Typography>
              <Button
                onClick={downloadAreaData}
              >
                Download CSV <DownloadIcon></DownloadIcon>
              </Button>
            </Box>
          </Grid>

        </>
      )}

      {/* Message when no area is selected */}
      {/* {selectedAreaId == 0 && (
        <Grid container spacing={50} justify="flex-end">
          <Grid item xs={10} md={10}>
            <p
              style={{
                marginLeft: "0px",
                textAlign: "right",
                marginTop: "-66px",
              }}
            >
              Please select an area
            </p>
          </Grid>
        </Grid>
      )} */}
      {/* Message when no data is available for selected area (areaId) */}
      {selectedAreaId && filteredAreaData.length == 0 && (
        <Grid container spacing={0} justify="flex-end">
          <Grid item xs={11} md={11}>
            <p
              style={{
                marginLeft: "0px",
                textAlign: "right",
                marginTop: "-66px",
              }}
            >
              No Data available for this area, please select another
            </p>
          </Grid>
        </Grid>
      )}

      {isAdmin ? (
        <Grid item xs={12}>
          <Typography>
            Choose User for User specific task and area statistics:
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="user-label">Select User</InputLabel>
            <Select
              labelId="user-label"
              id="user-select"
              value={selectedUserId}
              onChange={handleUserIdChange}
              style={{ width: "100%" }}
            >
              {userData.map((item) => (
                <MenuItem key={item.username} value={item.username}>
                  {item.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      ) : (
        <Grid item xs={12}>
          <Typography>
            Choose User for User specific task and area statistics:
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="user-label">Select User</InputLabel>
            <Select
              labelId="user-label"
              id="user-select"
              value={selectedUserId}
              onChange={handleUserIdChange}
              style={{ width: "100%" }}
            >
              <MenuItem key={username} value={username}>
                {username}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      )}
      <Grid item xs={12} md={12}>
        <Box component="section">
          {" "}
          <Alert severity="info" sx={{ marginBottom: 2 }}>
            Note: The ranking is intended only as gamification and not as a
            rating for passing or failing the course.
          </Alert>
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <Box sx={{ ...cardStyle, padding: 3, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            User performance by task
          </Typography>

          {(selectedStatementId == 0 || selectedUserId == 0) && (
            <Typography variant="body1" color="textSecondary">
              Please select a task and a user to see these statistics
            </Typography>
          )}
          {selectedStatementId != 0 &&
            selectedUserId != 0 &&
            filteredUserTaskData.length > 0 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell>User Data</TableCell>
                      <TableCell>All Users Data</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Time for this task</TableCell>
                      <TableCell style={{ color: "blue" }}>
                        {UserTaskprocessingTimes} minutes
                      </TableCell>
                      <TableCell style={{ color: "purple" }}>
                        {meanProcessingTime} minutes
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Difficulty ranking for this task</TableCell>
                      <TableCell style={{ color: "blue" }}>
                        {UserTaskdifdata}
                      </TableCell>
                      <TableCell style={{ color: "purple" }}>
                        {avgdiffi}/5 - {get_dif_ranking(avgdiffi)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography
                          variant="h4"
                          color="primary"
                          style={{ marginTop: "1rem" }}
                        >
                          User Rank:{" "}
                          {get_rank(
                            UserTaskprocessingTimes,
                            meanProcessingTime,
                            UserTaskdifdata,
                            avgdiffi
                          )}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          {selectedStatementId != 0 &&
            selectedUserId != 0 &&
            filteredUserTaskData.length == 0 && (
              <Typography variant="body1" color="textSecondary">
                No statistics for this user and task available
              </Typography>
            )}
        </Box>
      </Grid>

      {/* 5. User performance by area */}
      <Grid item xs={12} md={6}>
        <Box sx={{ ...cardStyle, padding: 3, borderRadius: 2, boxShadow: 3 }}>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            User performance by area
          </Typography>
          {(selectedAreaId == 0 || selectedUserId == 0) && (
            <Typography variant="body1" color="textSecondary">
              Please select an area and a user to see these statistics
            </Typography>
          )}
          {selectedAreaId != 0 &&
            selectedUserId != 0 &&
            filteredUserAreaData.length > 0 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell>User Data</TableCell>
                      <TableCell>All Users Data</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        Mean time for exercises in this area
                      </TableCell>
                      <TableCell style={{ color: "blue" }}>
                        {AreameanProcessingTimeUser} minutes
                      </TableCell>
                      <TableCell style={{ color: "purple" }}>
                        {AreameanProcessingTime} minutes
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        Difficulty ranking for tasks in this area
                      </TableCell>
                      <TableCell style={{ color: "blue" }}>
                        {userareaavgdiffi}/5 -{" "}
                        {get_dif_ranking(userareaavgdiffi)}
                      </TableCell>
                      <TableCell style={{ color: "purple" }}>
                        {areaavgdiffi}/5 - {get_dif_ranking(areaavgdiffi)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography
                          variant="h4"
                          color="primary"
                          style={{ marginTop: "1rem" }}
                        >
                          User Rank:{" "}
                          {get_rank(
                            AreameanProcessingTimeUser,
                            AreameanProcessingTime,
                            get_dif_ranking(userareaavgdiffi),
                            areaavgdiffi
                          )}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          {selectedAreaId != 0 &&
            selectedUserId != 0 &&
            filteredUserAreaData.length == 0 && (
              <Typography variant="body1" color="textSecondary">
                No statistics for this user and area available
              </Typography>
            )}
        </Box>
      </Grid>
    </Grid>
  );
}

export default StatisticsC;
