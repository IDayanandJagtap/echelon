"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { CHART_CONSTANTS } from "@/app/utils/CHART_CONSTANTS";
import PropTypes from "prop-types";

// Register required components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ productivityData, labels, onPieClick }) => {
	/**
	 * Handles a click on a pie chart segment.
	 * @param {Object} event - The event object passed by Chart.js.
	 * @param {Array} elements - The array of elements at the clicked position.
	 * @private
	 */
	const handlePieChartClick = (event, elements) => {
		if (elements.length > 0 && onPieClick) {
			const weekdayIndex = elements[0]?.index;
			onPieClick(weekdayIndex);
		}
	};

	const data = {
		labels: labels,
		datasets: [
			{
				data: productivityData, // Add cumulative value
				backgroundColor: CHART_CONSTANTS.pieChartColors,
				borderColor: "#111",
				borderWidth: 2,
			},
		],
	};

	const options = { ...CHART_CONSTANTS.pieChartOptions, onClick: handlePieChartClick }; // Register onclick handler for pie

	return (
		<div className="w-full h-[80%] flex justify-center items-center">
			<Pie data={data} options={options} />
		</div>
	);
};

// Define prop types, similar to interface.
PieChart.propTypes = {
	productivityData: PropTypes.arrayOf(PropTypes.number).isRequired,
	labels: PropTypes.arrayOf(PropTypes.string).isRequired,
	onPieClick: PropTypes.func,
};

export default PieChart;
