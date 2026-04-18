"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Plus, Sparkles } from "lucide-react";
import Task from "@/app/components/Task";
import NewTask from "@/app/components/NewTask";
import { useRestSecurityClient } from "@/app/hooks/securityClient";
import Loading from "@/app/components/LoadingSpinner";
import { GLOBAL_CONSTANTS } from "@/app/utils/GLOBAL_CONSTANTS";
import { useToast } from "@/hooks/use-toast";

const TaskDashboard = ({ userId }) => {
	const [date, setDate] = useState(new Date());
	const [taskList, setTaskList] = useState([]);
	const [statusOfDay, setStatusOfDay] = useState("");
	const [selectedFilters, setSelectedFilters] = useState({});
	const [showNewTask, setShowNewTask] = useState(false);
	const restClient = useRestSecurityClient();
	const [isLoading, setIsLoading] = useState(false);
	const [quote, setQuote] = useState("");
	const { toast } = useToast();

	const handleDropdownChange = (dropdown, newValue) => {
		setSelectedFilters({ ...selectedFilters, [dropdown]: newValue });
		handleDayUpdate(newValue);
	};
	const handleChangeDateByOne = (date, type) => {
		if (type === "next") {
			setDate(new Date(date.setDate(date.getDate() + 1)));
		} else if (type === "previous") {
			setDate(new Date(date.setDate(date.getDate() - 1)));
		}
	};

	// Dumy userid and date : user_12345, 2025-03-31
	const getTasks = async (date, userId) => {
		try {
			if (!date || !userId) {
				// This will work when we remove default parameter values.
				return;
			}
			setIsLoading(true);
			const response = await restClient.get(`/tasks/?date=${date}&userId=${userId}`);
			setTaskList(response?.result?.tasks || []);
			setStatusOfDay(response?.result?.statusOfDay);
		} catch (error) {
			console.log(error);
		} finally {
			setTimeout(() => {
				setIsLoading(false);
			}, 2000);
		}
	};

	const productivityLevels = {
		0: "Idle",
		1: "Improving",
		2: "Moderate",
		3: "Efficient",
		4: "Peak",
	};

	const createNewTask = async (inputData) => {
		try {
			return await restClient.post(`/tasks`, inputData);
		} catch (error) {
			console.log(error);
		} finally {
			const dateInRequiredFormat = new Date(date).toISOString().split("T")[0];
			getTasks(dateInRequiredFormat, userId);
		}
	};

	const handleTaskUpdate = async (taskId, updatedData) => {
		// If error show toast, do nothing on successfull response.
		try {
			if (!taskId || !updatedData) {
				throw new Error("Task Id or updated data is missing");
			}
			setIsLoading(true);
			await restClient.put(`/tasks`, { taskId, updateData: updatedData });
		} catch (error) {
			toast({
				title: "Oops! Something went wrong while updating the task data",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			const dateInRequiredFormat = new Date(date).toISOString().split("T")[0];
			await getTasks(dateInRequiredFormat, userId);
			setIsLoading(false);
		}
	};

	const handleTaskDelete = async (taskId) => {
		try {
			if (!taskId) {
				throw new Error("Task Id is missing");
			}
			setIsLoading(true);
			await restClient.delete(`/tasks?taskId=${taskId}`);
			toast({ title: "Deleted the task successfully" });
		} catch (error) {
			toast({
				title: "Oops! Something went wrong while deleting the task",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			const dateInRequiredFormat = new Date(date).toISOString().split("T")[0];
			await getTasks(dateInRequiredFormat, userId);
			setIsLoading(false);
		}
	};

	const handleDayUpdate = async (status) => {
		try {
			const requestBody = {
				date: date,
				statusOfDay: status,
			};
			setIsLoading(true);
			await restClient.put(`/day`, requestBody);
			toast({ title: "Updated the status successfully" });
		} catch (error) {
			toast({
				title: "Oops! Something went wrong while updating the status of Day",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			// const dateInRequiredFormat = new Date(date).toISOString().split("T")[0];
			// await getTasks(dateInRequiredFormat, auth.userId);
			setIsLoading(false);
		}
	};

	const getQuote = async () => {
		try {
			const response = await restClient.get(`/quote`);
			console.log(response);
			setQuote(response?.quote || "");
		} catch (error) {
			console.log(error);
		}
	};
	useEffect(() => {
		if (date) {
			try {
				const dateInRequiredFormat = new Date(date).toISOString().split("T")[0];
				getTasks(dateInRequiredFormat, userId);
			} catch (error) {
				console.log(error);
			}
		}
	}, [date, userId]);

	useEffect(() => {
		getQuote();
		setStatusOfDay(0);
	}, []);

	return (
		<div className="w-full h-full p-4 relative">
			{isLoading && <Loading />}
			{!showNewTask && (
				<div className="w-full h-full flex flex-col gap-4">
					{/* Header Section */}

					<div className="flex items-center justify-between gap-4 border-b-[1px] border-slate-500 pb-4">
						<h1 className="hidden lg:block text-xl font-medium text-slate-200">
							Tasks Dashboard
						</h1>

						<div className="flex items-center gap-2 w-[100px] lg:w-fit">
							<Button
								variant="ghost"
								size="icon"
								className="hover:bg-[#222] hover:text-white"
								onClick={() => handleChangeDateByOne(date, "previous")}
							>
								<ChevronLeft className="h-5 w-5" />
							</Button>
							<DatePicker date={date} setDate={setDate} />
							<Button
								variant="ghost"
								size="icon"
								className="hover:bg-[#222] hover:text-white"
								onClick={() => handleChangeDateByOne(date, "next")}
							>
								<ChevronRight className="h-5 w-5" />
							</Button>
						</div>

						<Button
							className="bg-sky-600 hover:bg-sky-700 w-[100px] lg:w-fit"
							onClick={() => setShowNewTask(true)}
						>
							<Plus className="h-5 w-5" />
							<span className="hidden  lg:block">Add New Task</span>
							<span className="text-xs lg:text-base lg:hidden">New Task</span>
						</Button>
					</div>

					{/* Status Section */}
					<div className="flex ">
						<Select onValueChange={(value) => handleDropdownChange("statusOfDay", value)}>
							<SelectTrigger className="w-[150px] bg-[#222] border-slate-700">
								<SelectValue placeholder={productivityLevels[statusOfDay || 0]} />
							</SelectTrigger>
							<SelectContent className="bg-[#222] border-slate-700">
								{GLOBAL_CONSTANTS.productivityLevels.map((item) => (
									<SelectItem
										value={item.value}
										key={item.value}
										className="text-white focus:bg-[#333] focus:text-slate-300"
									>
										{item.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Tasks Section */}
					<div className="w-full h-full flex flex-col justify-between overflow-hidden">
						<div className="flex-1 overflow-auto min-h-[60dvh] max-h-[70dvh]">
							{Array.isArray(taskList) && taskList.length > 0 ? (
								<div className="space-y-3">
									{taskList.toReversed().map((task) => (
										<Task
											key={task?.id || task?.title}
											id={task?.id}
											title={task?.title}
											description={task?.description}
											status={task?.status}
											category={task?.category}
											onTaskUpdate={handleTaskUpdate}
											onDelete={handleTaskDelete}
										/>
									))}
								</div>
							) : (
								<div className="flex justify-center items-center h-[60dvh] text-slate-400">
									<p>No tasks available!</p>
								</div>
							)}
						</div>

						{/* Quotes Section */}
						<div className="flex justify-center">
							<div className="flex items-center gap-2">
								<Sparkles className="w-4 h-4 text-blue-400" />
								<p className=" text-xs lg:text-sm italic text-slate-400">
									&ldquo;{quote}&rdquo;
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* Modal Container */}
			{showNewTask && <NewTask onClose={() => setShowNewTask(false)} onSubmit={createNewTask} />}
		</div>
	);
};

export default TaskDashboard;
