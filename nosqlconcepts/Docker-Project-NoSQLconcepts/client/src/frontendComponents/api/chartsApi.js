import axios from "axios";

const API_URL = "/api";

export const fetchTaskChartData = async (selectedArea) => {
  try {
    const response = await axios.post(`${API_URL}/solved-tasks-count`, {  selected_area: selectedArea  });
    return response.data;
  } catch (error) {
    console.error("Error fetching user chart data:", error);
    throw error;
  }
};

export const fetchUserTaskChartData = async (username, selectedArea) => {
  try {
    const response = await axios.post(`${API_URL}/user-solved-tasks-count`, {
      username,
      selected_area: selectedArea,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user chart data:", error);
    throw error;
  }
};

export const fetchTimeChartData = async (selectedArea) => {
  try {
    const response = await axios.post(`${API_URL}/avg-processing-time`, { selected_area: selectedArea });
    return response.data;
  } catch (error) {
    console.error("Error fetching time chart data:", error);
    throw error;
  }
};
export const fetchUserTimeChartData = async (username, selectedArea) => {
  try {
    const response = await axios.post(`${API_URL}/user-avg-processing-time`, {
      username,
      selected_area: selectedArea,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching time chart data:", error);
    throw error;
  }
};
export const fetchLineChartData = async (username, limit, selectedArea) => {
  try {
    const response = await axios.post(`${API_URL}/get-history-data`, {
      username,
      limit,
      selected_area: selectedArea,
    });

    const data = response.data.map(item => ({
      ...item,
      x: new Date(item.x).toISOString(), 
    }));
    return [
      { id: "queryHistory", data: data.reverse() },
    ];
  } catch (error) {
    console.error("Error fetching time chart data:", error);
    throw error;
  }
};
export const fetchRankingData = async (selectedArea) => {
  try {
    const response1 = await axios.get(`${API_URL}/difficulty-rating-easy`, {
      params: { selected_area: selectedArea },
    });
    const response2 = await axios.get(`${API_URL}/difficulty-rating-difficult`, {
      params: { selected_area: selectedArea },
    });
    return {
      easy: response1.data,
      difficult: response2.data
    };
  } catch (error) {
    console.error("Error fetching rating data:", error);
    throw error;
  }
};
export const fetchTotalUsersData = async () => {
  try {
    const response = await axios.get(`${API_URL}/total-users`);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching rating data:", error);
    throw error;
  }
};
export const fetchPieChartData = async () => {
  try {
    const response = await axios.get(`${API_URL}/difficulty-level`);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching rating data:", error);
    throw error;
  }
};