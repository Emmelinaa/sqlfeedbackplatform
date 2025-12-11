import axios from 'axios';

const API_URL = '/api';

export const sendToExecute = async (apiRoute,  execQuery, taskNumber, taskAreaId, selected_area, selectedSchema) => {
    try {
      console.log("API URL:", `${API_URL}${apiRoute}`);
      const response = await axios.post(`${API_URL}${apiRoute}`, {
        execQuery, taskNumber, taskAreaId, selected_area, selectedSchema
      });
      console.log("Response data:", response.data);
      console.log("Full response:", response);
  
      return response;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };