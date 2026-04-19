"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Plus, Sparkles, WandSparkles } from "lucide-react";
import Task from "@/app/components/Task";
import NewTask from "@/app/components/NewTask";
import Loading from "@/app/components/LoadingSpinner";
import { GLOBAL_CONSTANTS } from "@/app/utils/GLOBAL_CONSTANTS";
import { useToast } from "@/hooks/use-toast";
import {
	createTask,
	deleteTask,
	fetchTasksForDate,
	generateTemplateTasks,
	updateTask,
} from "@/app/pages/tasks/services/tasks.client";
import { fetchRandomQuote } from "@/app/pages/tasks/services/quotes.client";

const TaskDashboard = ({ userId }) => {
	const [date, setDate] = useState(new Date());
	const [taskList, setTaskList] = useState([]);
	const [statusOfDay, setStatusOfDay] = useState("");
	const [showNewTask, setShowNewTask] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [quote, setQuote] = useState("");
	const [starRating, setStarRating] = useState(0);
	const [hasActiveTemplate, setHasActiveTemplate] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const handleChangeDateByOne = (date, type) => {
		const nextDate = new Date(date);
		if (type === "next") {
			nextDate.setDate(nextDate.getDate() + 1);
			setDate(nextDate);
		} else if (type === "previous") {
			nextDate.setDate(nextDate.getDate() - 1);
			setDate(nextDate);
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
			const response = await fetchTasksForDate(date, userId);
			setTaskList(response.tasks || []);
			setStatusOfDay(response.statusOfDay);
			setStarRating(response.starRating || 0);
			setHasActiveTemplate(Boolean(response.hasActiveTemplate));
		} catch (error) {
			toast({
				title: "Oops! Something went wrong while fetching tasks",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
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
			return await createTask(inputData);
		} catch (error) {
			toast({
				title: "Oops! Something went wrong while creating task",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			getTasks(date, userId);
		}
	};

	const handleTaskUpdate = async (taskId, updatedData) => {
		// If error show toast, do nothing on successfull response.
		try {
			if (!taskId || !updatedData) {
				throw new Error("Task Id or updated data is missing");
			}
			setIsLoading(true);
			await updateTask(taskId, updatedData);
		} catch (error) {
			toast({
				title: "Oops! Something went wrong while updating the task data",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			await getTasks(date, userId);
			setIsLoading(false);
		}
	};

	const handleGenerateTemplateTasks = async () => {
		try {
			setIsLoading(true);
			await generateTemplateTasks(date);
			toast({ title: "Template tasks generated for this date" });
		} catch (error) {
			toast({
				title: "Could not generate template tasks",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			await getTasks(date, userId);
			setIsLoading(false);
		}
	};

	const directTasks = taskList.filter((task) => task?.source !== "template");
	const templateTasks = taskList.filter((task) => task?.source === "template");
	const showTemplateAction = templateTasks.length === 0;

	const handleTaskDelete = async (taskId) => {
		try {
			if (!taskId) {
				throw new Error("Task Id is missing");
			}
			setIsLoading(true);
			await deleteTask(taskId);
			toast({ title: "Deleted the task successfully" });
		} catch (error) {
			toast({
				title: "Oops! Something went wrong while deleting the task",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			await getTasks(date, userId);
			setIsLoading(false);
		}
	};

	const getQuote = async () => {
		try {
			setQuote(await fetchRandomQuote());
		} catch (error) {
			setQuote("");
		}
	};
	useEffect(() => {
		if (date) {
			getTasks(date, userId);
		}
	}, [date, userId]);

	useEffect(() => {
		getQuote();
		setStatusOfDay(0);
	}, []);

	return (
		<div className="w-full h-full p-4 relative">
			{isLoading && <Loading overlay />}
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

						<div className="flex items-center gap-2">
							{showTemplateAction && hasActiveTemplate ? (
								<Button
									variant="outline"
									className="border-sky-500 text-sky-300 hover:bg-sky-900/30"
									onClick={handleGenerateTemplateTasks}
								>
									<WandSparkles className="h-4 w-4 mr-1" />
									Generate Template Tasks
								</Button>
							) : showTemplateAction ? (
								<Button
									variant="outline"
									className="border-amber-500 text-amber-300 hover:bg-amber-900/30"
									onClick={() => router.push("/templates")}
								>
									Enable a template
								</Button>
							) : null}
							<Button
								className="bg-sky-600 hover:bg-sky-700 w-[100px] lg:w-fit"
								onClick={() => setShowNewTask(true)}
							>
								<Plus className="h-5 w-5" />
								<span className="hidden  lg:block">Add New Task</span>
								<span className="text-xs lg:text-base lg:hidden">New Task</span>
							</Button>
						</div>
					</div>

					{/* Status Section */}
					<div className="flex items-center gap-2 flex-wrap">
						<span className="rounded-full border border-slate-700 bg-[#222] px-3 py-2 text-sm text-slate-200">
							Day Status: {productivityLevels[statusOfDay || 0]}
						</span>
						<span className="text-sm text-amber-300">Stars: {starRating}/5</span>
					</div>

					{/* Tasks Section */}
					<div className="w-full h-full flex flex-col justify-between overflow-hidden">
						<div className="flex-1 overflow-auto min-h-[60dvh] max-h-[70dvh]">
							<div className="flex flex-col gap-5 md:flex-row md:items-stretch md:gap-0">
								<div className="flex-1">
										<h2 className="text-sm font-semibold text-sky-300 mb-2">Template Tasks</h2>
										{templateTasks.length > 0 ? (
											<div className="space-y-3">
												{templateTasks.toReversed().map((task) => (
													<Task
														key={task?.id || task?.title}
														id={task?.id}
														title={task?.title}
														description={task?.description}
														status={task?.status}
														category={task?.category || "Template"}
														source={task?.source}
														templateName={task?.template_name}
														ruleTitle={task?.template_rule_title}
														starLevel={task?.template_star_level}
														onTaskUpdate={handleTaskUpdate}
														onDelete={handleTaskDelete}
													/>
												))}
											</div>
										) : (
											<div className="rounded-lg border border-dashed border-slate-700 p-3 text-xs text-slate-400">
												No template tasks for this date.
											</div>
										)}
								</div>

								<div className="hidden md:block w-px bg-slate-700/80 mx-4 self-stretch" />

								<div className="flex-1">
										<h2 className="text-sm font-semibold text-emerald-300 mb-2">Direct Tasks</h2>
										{directTasks.length > 0 ? (
											<div className="space-y-3">
												{directTasks.toReversed().map((task) => (
													<Task
														key={task?.id || task?.title}
														id={task?.id}
														title={task?.title}
														description={task?.description}
														status={task?.status}
														category={task?.category}
														source={task?.source}
														onTaskUpdate={handleTaskUpdate}
														onDelete={handleTaskDelete}
													/>
												))}
											</div>
										) : (
											<div className="rounded-lg border border-dashed border-slate-700 p-3 text-xs text-slate-400">
												No direct tasks yet.
											</div>
										)}
									</div>
								</div>
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
			{showNewTask && <NewTask onClose={() => setShowNewTask(false)} onSubmit={createNewTask} />}
		</div>
	);
};

export default TaskDashboard;
