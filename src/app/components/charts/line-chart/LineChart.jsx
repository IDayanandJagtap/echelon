"use client";

import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { CHART_CONSTANTS } from "@/app/utils/CHART_CONSTANTS";
import PropTypes from "prop-types";

// Register the required Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

const LineChart = ({ yAxisLabels, xAxisLabels, productivityData }) => {
	const data = {
		labels: xAxisLabels,
		datasets: [
			{
				data: productivityData,
				borderColor: "#00c8ff",
				backgroundColor: "rgba(0, 200, 255, 0.2)",
				pointBackgroundColor: "#00c8ff",
				pointBorderColor: "#fff",
				pointRadius: 5,
				pointHoverRadius: 8,
				borderWidth: 2,
				tension: 0.4, // Smooth curves
			},
		],
	};

	const options = CHART_CONSTANTS.getLineChartOptions(yAxisLabels);
	return (
		<div className="w-full h-full mx-auto p-4 bg-[#111] rounded-lg">
			<Line data={data} options={options} />
		</div>
	);
};

// Define prop types, similar to interface.
LineChart.propTypes = {
	yAxisLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
	xAxisLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
	productivityData: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default LineChart;
