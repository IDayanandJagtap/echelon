import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const productivityLevels = [
  "Stagnant",
  "Needs Improvement",
  "Average",
  "Good",
  "Productive",
];

// Convert productivity labels to numeric values
const numericData = [0, 2, 3, 4, 3, 1, 2];

const BarChart = () => {
  // Chart data
  const data = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat"],
    datasets: [
      {
        label: "Productivity",
        data: numericData,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(201, 203, 207, 0.2)",
        ], // Bar color
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
          "rgb(201, 203, 207)",
        ],
        borderWidth: 1,
        borrderRadius: 5,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top", // Positioning of the legend
      },
      title: {
        display: true,
        text: "Productivity Chart",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: (value) => productivityLevels[value] || "", // Map numeric values to labels
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default BarChart;
