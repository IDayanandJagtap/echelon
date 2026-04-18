"use client";

import { CHART_CONSTANTS } from "@/app/utils/CHART_CONSTANTS";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import PieChart from "./PieChart";
import DateList from "./DateList";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, getStartAndEndDate } from "@/app/utils/date-utils";
import Loading from "../../LoadingSpinner";
import { fetchPieChartProductivity } from "@/app/pages/charts/services/productivity.client";

const PieChartWrapper = () => {
	const [selectedDataRange, setSelectedDataRange] = useState(CHART_CONSTANTS.dataRanges.monthly);
	const [selectedDayData, setSelectedDayData] = useState(null);
	const [directionDelta, setDirectionDelta] = useState(0);
	const [statusOfDay, setStatusOfDay] = useState(0);
	const allowedDataRangesForLineChart = CHART_CONSTANTS.pieChartSelectDataRanges;
	const pieChartLabels = CHART_CONSTANTS.weekdaysInShort;
	const [productivityData, setProductivityData] = useState([]);
	const [isLoading, setIsLoading] = useState([]);

	// Mock API call to fetch day-specific data
	const fetchDayData = async (day) => {
		// Simulating API delay
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Mock data - in real app, this will come from API
		const mockData = {
			Mon: [
				{ id: 1, date: "2024-03-18", completedTasks: 7, totalTasks: 10 },
				{ id: 2, date: "2024-03-11", completedTasks: 5, totalTasks: 8 },
			],
			Tue: [
				{ id: 3, date: "2024-03-19", completedTasks: 3, totalTasks: 6 },
				{ id: 4, date: "2024-03-12", completedTasks: 4, totalTasks: 7 },
			],
			Wed: [
				{ id: 5, date: "2024-03-20", completedTasks: 5, totalTasks: 8 },
				{ id: 6, date: "2024-03-13", completedTasks: 6, totalTasks: 9 },
			],
			Thu: [{ id: 7, date: "2024-03-14", completedTasks: 2, totalTasks: 4 }],
			Fri: [{ id: 8, date: "2024-03-15", completedTasks: 8, totalTasks: 10 }],
			Sat: [{ id: 9, date: "2024-03-16", completedTasks: 1, totalTasks: 3 }],
			Sun: [{ id: 10, date: "2024-03-17", completedTasks: 0, totalTasks: 2 }],
		};

		return mockData[day] || [];
	};

	const handleOnDataRangeChange = (value) => {
		setSelectedDataRange(value);
	};

	const handleChangeDateRangeByOne = (direction) => {
		let newDelta = directionDelta;
		if (direction === "previous") newDelta -= 1;
		else if (direction === "next") newDelta += 1;
		setDirectionDelta(newDelta);

		getPieChartData(selectedDataRange, newDelta);
	};

	const getPieChartData = async (selectedDataRange, operation) => {
		try {
			const { startDate, endDate } = getStartAndEndDate(new Date(), selectedDataRange, operation);
			const formattedStartDate = formatDate(startDate);
			const formattedEndDate = formatDate(endDate);

			setIsLoading(true);
			const response = await fetchPieChartProductivity(formattedStartDate, formattedEndDate, statusOfDay);

			// transform data:
			let pData = [];
			Object.keys(response).forEach((day) => {
				pData.push(response[day].count);
			});
			setProductivityData(pData);
		} catch {
		} finally {
			setIsLoading(false);
		}
	};
	const handleOnPieClick = async (index) => {
		const selectedDay = pieChartLabels[index];
		const dayData = await fetchDayData(selectedDay);
		setSelectedDayData({
			day: selectedDay,
			tasks: dayData,
		});
	};

	useEffect(() => {
		getPieChartData(selectedDataRange, 0);
	}, []);

	useEffect(() => {
		getPieChartData(selectedDataRange, 0);
	}, [statusOfDay]);

	return (
		<div className="w-full h-full flex-1 flex flex-col bg-[#111] gap-8 p-4 rounded-md">
			{isLoading && <Loading overlay />}
			<div className="flex justify-between">
				<h3 className="text-xl font-bold text-slate-300">Productivity by Days</h3>
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
									className="hover:bg-[#333] focus:bg-[#444] focus:text-white"
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
			<div className="w-full h-full flex flex-col justify-between lg:flex-row gap-4">
				<div className="w-full lg:w-1/2 h-[500px] lg:h-full flex flex-col justify-start items-center gap-6">
					<div className="w-full flex justify-end ">
						<Select onValueChange={(value) => setStatusOfDay(value)}>
							<SelectTrigger
								className={`w-[110px] h-[30px] bg-[#222] border-none text-white rounded-md`}
							>
								<SelectValue placeholder={"Productivity Status"} />
							</SelectTrigger>
							<SelectContent className="bg-[#222] border-none text-white">
								{CHART_CONSTANTS.productivityLevels.map((item, index) => (
									<SelectItem
										value={index}
										key={item}
										className="hover:bg-[#333] focus:bg-[#444] focus:text-slate-200"
									>
										{item}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					{productivityData.length > 0 ? (
						<PieChart
							productivityData={productivityData}
							labels={pieChartLabels}
							onPieClick={handleOnPieClick}
						/>
					) : (
						<div>
							<p>Oops! No data available</p>
						</div>
					)}
				</div>
				{selectedDayData && (
					<div className="w-full lg:w-1/2 h-[500px] lg:h-full">
						<DateList dates={selectedDayData.tasks} selectedDay={selectedDayData.day} />
					</div>
				)}
			</div>
		</div>
	);
};

export default PieChartWrapper;
