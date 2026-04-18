"use client";

import { CHART_CONSTANTS } from "@/app/utils/CHART_CONSTANTS";
import LineChart from "./LineChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getStartAndEndDate } from "@/app/utils/date-utils";
import { useRestSecurityClient } from "@/app/hooks/securityClient";
import Loading from "../../LoadingSpinner";

const LineChartWrapper = () => {
	const [selectedDataRange, setSelectedDataRange] = useState(CHART_CONSTANTS.dataRanges.weekly);
	const [directionDelta, setDirectionDelta] = useState(0);
	const allowedDataRangesForLineChart = CHART_CONSTANTS.lineChartSelectDataRanges;
	const restClient = useRestSecurityClient();
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
			console.log("Data Range :: ", dataRange, " Operation :: ", operation);
			console.log("Requesting data for :: ", startDate);
			console.log(endDate);

			setIsLoading(true);
			const response = await restClient.get(
				`/day/productivity/status/line-chart?startDate=${startDate}&endDate=${endDate}`
			);
			if (response.result) {
				let status = [];
				let labels = [];
				response.result.forEach((item) => {
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
		} catch (error) {
			console.log(error);
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
			{isLoading && <Loading />}
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
