"use client";

import { CHART_CONSTANTS } from "@/app/utils/CHART_CONSTANTS";
import LineChart from "./LineChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, getStartAndEndDate } from "@/app/utils/date-utils";
import Loading from "../../LoadingSpinner";
import { fetchLineChartProductivity } from "@/app/pages/charts/services/productivity.client";

const LineChartWrapper = () => {
	const [selectedDataRange, setSelectedDataRange] = useState(CHART_CONSTANTS.dataRanges.weekly);
	const [directionDelta, setDirectionDelta] = useState(0);
	const allowedDataRangesForLineChart = CHART_CONSTANTS.lineChartSelectDataRanges;
	const [productivityStatusInNumbers, setProductivityStatusInNumbers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const productivityLevels = CHART_CONSTANTS.productivityLevels;

	const [xAxisLabels, setXAxisLabels] = useState(CHART_CONSTANTS.weekdaysInShort); //

	const handleOnDataRangeChange = (value) => {
		setSelectedDataRange(value);
		getLineChartData(value, 0);
	};

	const handleChangeDateRangeByOne = (direction) => {
		let newDelta = directionDelta;
		if (direction === "previous") newDelta -= 1;
		else if (direction === "next") newDelta += 1;
		setDirectionDelta(newDelta);

		getLineChartData(selectedDataRange, newDelta);
	};

	const getLineChartData = async (dataRange, operation) => {
		try {
			const { startDate, endDate } = getStartAndEndDate(new Date(), dataRange, operation);
			const formattedStartDate = formatDate(startDate);
			const formattedEndDate = formatDate(endDate);

			setIsLoading(true);
			const response = await fetchLineChartProductivity(formattedStartDate, formattedEndDate);
			if (response) {
				let status = [];
				let labels = [];
				response.forEach((item) => {
					if (String(dataRange).toLowerCase() == "monthly") labels.push(item.date);
					else {
						labels.push(new Date(item.date).toDateString());
					}
					status.push(item.status);
				});

				setXAxisLabels(labels);
				setProductivityStatusInNumbers(status);
			}

			// Set the response.
		} catch {
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getLineChartData(selectedDataRange, 0);
	}, []);
	return (
		<div className="w-full h-full flex-1 flex flex-col bg-[#111] gap-8 p-4 rounded-md mb-6 relative">
			<div className="flex justify-between">
				<h3 className="text-xl font-bold text-slate-300">Productivity Status</h3>
				<div className="flex gap-2 items-center">
					<Button
						variant="ghost"
						size="icon"
						className="bg-[#222] hover:bg-[#333] hover:text-white"
						onClick={() => handleChangeDateRangeByOne("previous")}
					>
						<ChevronLeft className="h-5 w-5" />
					</Button>

					<Select onValueChange={(value) => handleOnDataRangeChange(value)}>
						<SelectTrigger
							className={`w-[110px] h-[35px] bg-[#222] border-none text-white rounded-md`}
						>
							<SelectValue placeholder={selectedDataRange} />
						</SelectTrigger>
						<SelectContent className="bg-[#222] border-none text-white">
							{allowedDataRangesForLineChart.map((item) => (
								<SelectItem
									value={item.value}
									key={item.value}
									className="hover:bg-[#333] focus:bg-[#444] text-white focus:text-white"
								>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="ghost"
						size="icon"
						className="bg-[#222] hover:bg-[#333] hover:text-white"
						onClick={() => handleChangeDateRangeByOne("next")}
					>
						<ChevronRight className="h-5 w-5" />
					</Button>
				</div>
			</div>
			{isLoading && <Loading overlay />}
			{!productivityStatusInNumbers.length && !xAxisLabels.length ? (
				<div className="w-full h-full flex justify-center items-center">
					{/* {Add a relatable emoji here} */}
					<p className="text-slate-400">Oops! No data to share! 🙁 </p>
				</div>
			) : (
				<LineChart
					yAxisLabels={productivityLevels}
					xAxisLabels={xAxisLabels}
					productivityData={productivityStatusInNumbers}
				/>
			)}
		</div>
	);
};

export default LineChartWrapper;
