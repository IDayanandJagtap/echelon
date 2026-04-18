"use client";

import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { X, RefreshCw, Edit, Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Loading from "@/app/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";

const RoadmapDetails = ({ roadmapData = null, onConfirm, onCancel, roadmapId = null, userId }) => {
	const id = roadmapId;
	const [data, setRoadmapData] = useState(roadmapData);
	const [expandedStep, setExpandedStep] = useState(null);
	const [isLoading, setIsLoading] = useState(!data);
	const { toast } = useToast();
	const router = useRouter();

	const apiFetch = async (path, options = {}) => {
		const response = await fetch(`/api${path}`, {
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				...(options.headers || {}),
			},
			...options,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
		}

		if (response.status === 204) return null;

		return response.json();
	};

	useEffect(() => {
		const fetchRoadmapDetails = async () => {
			if (!id || roadmapData) return;
			try {
				setIsLoading(true);
				const response = await apiFetch(`/ai/roadmap/get/${userId}/${id}`);
				if (response?.result) {
					const formattedData = response.result[0];
					formattedData.plan = formattedData.ai_response;
					delete formattedData.ai_response;
					formattedData.monthsAllocated = formattedData.months_allocated;
					formattedData.hoursPerDay = formattedData.hours_per_day;
					setRoadmapData(formattedData);
				}
			} catch (err) {
				toast({
					title: "Oops! Something went wrong while fetching roadmap details",
					description: err.message,
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};
		fetchRoadmapDetails();
	}, [id, roadmapData, userId]);

	const toggleStep = (index) => {
		setExpandedStep((prev) => (prev === index ? null : index));
	};

	const handleCancel = () => {
		onCancel();
	};
	const handleRecreate = () => {};
	const handleEdit = () => {};

	const handleConfirm = () => {
		onConfirm(data);
	};

	const handleDelete = async () => {
		try {
			setIsLoading(true);
			const response = await apiFetch(`/ai/roadmap/delete/${userId}/${id}`, { method: "DELETE" });
			if (response.message) {
				setRoadmapData(null);
				toast({
					title: "Plan deleted successfully",
				});
			}
		} catch (err) {
			toast({
				title: "Oops! Something went wrong while deleting plan",
				description: err.message,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
			router.push("/ai");
		}
	};

	return (
		<div className="p-4 w-full h-full mx-auto relative">
			{isLoading && <Loading overlay />}
			{/* Top Navigation */}
			<div className="flex justify-between items-center border-b border-slate-600 pb-6 px-2">
				<div className="flex-col flex items-start space-y-2 lg:items-center lg:flex-row lg:space-y-0 lg:space-x-4">
					<h1 className="text-base lg:text-xl font-medium text-slate-200">
						{data?.title || "Loading..."}
					</h1>
					{data?.level && (
						<Badge className="bg-purple-500/20 text-purple-300 text-xs rounded-md px-2 py-0.5 border-none">
							{data.level}
						</Badge>
					)}
				</div>
				{data && (
					<div className="text-sm text-gray-400 flex flex-col lg:flex-row gap-1 lg:gap-2">
						{data.monthsAllocated && <span>{data.monthsAllocated} months •</span>}
						{data.hoursPerDay && <span>{data.hoursPerDay} hrs/day</span>}
					</div>
				)}
			</div>

			{/* Content */}
			{isLoading ? (
				<div className="flex justify-center items-center h-[75dvh] lg:h-[80dvh]">
					<p className="text-sm text-gray-400">Loading roadmap details...</p>
				</div>
			) : data?.isFeasible || id ? (
				<div className="px-4 py-4 overflow-y-auto h-[75dvh] lg:h-[80dvh]">
					<h2 className="text-lg font-medium text-gray-400 mb-6">Steps</h2>
					<div className="space-y-1">
						{Array.isArray(data.plan) &&
							data.plan.map(({ date, topic, tasks }, index) => (
								<div key={date} className="border-l-2 border-gray-800 relative pl-8 pb-6">
									<div
										className="flex items-center cursor-pointer group"
										onClick={() => toggleStep(index)}
									>
										<div className="absolute -left-[17px] w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-700 group-hover:border-purple-500 flex items-center justify-center">
											<span className="text-xs text-gray-400 group-hover:text-purple-400">
												{index + 1}
											</span>
										</div>
										<div className="w-full flex justify-between text-white text-sm lg:text-base group-hover:text-purple-400">
											<span>{topic} </span>
											<span>{new Date(date).toDateString()}</span>
										</div>
									</div>

									{expandedStep === index && (
										<div className="mt-4 ml-4 space-y-3 text-sm text-gray-400">
											{Array.isArray(tasks) &&
												tasks.map((topic, topicIndex) => (
													<div
														className="flex items-center space-x-2"
														key={topicIndex}
													>
														<div className="w-1 h-1 rounded-full bg-gray-600" />
														<span>{topic}</span>
													</div>
												))}
										</div>
									)}
								</div>
							))}
					</div>
				</div>
			) : (
				<div className="flex justify-center items-center h-[75dvh] lg:h-[80dvh]">
					<p className="text-sm text-gray-400">
						{data?.reason || "Oops! Roadmap details not available!"}
					</p>
				</div>
			)}

			{/* Bottom Action Bar */}
			<div className="absolute bottom-0 left-0 right-0 px-6">
				{id ? (
					// If id is present, which means it is a saved roadmap which can be deleted and doesn't need other actions.
					<div className="py-4 flex justify-end items-center space-x-3">
						<Button
							onClick={handleDelete}
							className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
						>
							<Trash2 />
							<span className="hidden lg:inline">Delete</span>
						</Button>
					</div>
				) : (
					<div className="py-4 flex justify-end items-center space-x-3">
						<Button onClick={handleCancel} variant="ghost">
							<X />
							<span className="hidden lg:inline">Cancel</span>
						</Button>
						<Button onClick={handleRecreate} variant="ghost" disabled>
							<RefreshCw />
							<span className="hidden lg:inline">Recreate</span>
						</Button>
						<Button onClick={handleEdit} variant="ghost" disabled>
							<Edit />
							<span className="hidden lg:inline">Edit</span>
						</Button>
						<Button
							onClick={handleConfirm}
							className="bg-purple-600 hover:bg-purple-700 text-white ml-2"
						>
							<Check />
							<span className="hidden lg:inline">Confirm</span>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

RoadmapDetails.propTypes = {
	roadmapData: PropTypes.shape({
		id: PropTypes.string,
		title: PropTypes.string,
		level: PropTypes.string,
		months: PropTypes.number,
		hoursPerDay: PropTypes.number,
		isFeasible: PropTypes.bool,
		plan: PropTypes.array,
		reason: PropTypes.string,
	}),
	onConfirm: PropTypes.func,
	onCancel: PropTypes.func,
};

export default RoadmapDetails;
