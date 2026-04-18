"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import NewAIPlan from "@/app/components/ai/NewAIPlan";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import RoadmapDetails from "./RoadmapDetails";
import Loading from "@/app/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { GLOBAL_CONSTANTS } from "@/app/utils/GLOBAL_CONSTANTS";
import { confirmRoadmap, fetchRoadmaps, generateRoadmapPreview } from "@/app/pages/ai/services/roadmaps.client";
const AIPage = ({ userId }) => {
	const [plans, setPlans] = useState([]);
	const [showNewPlan, setShowNewPlan] = useState(false);
	const router = useRouter();
	const [roadmapData, setRoadmapData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const { toast } = useToast();

	const handleCreatePlan = async (inputData) => {
		try {
			setShowNewPlan(false);
			setIsLoading(true);
			const response = await generateRoadmapPreview(inputData);
			if (response.result) {
				setRoadmapData(response.result);
			}
		} catch (error) {
			toast({
				title: "Oops! Something went wrong while creating plan",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const getAllRoadmaps = async () => {
		try {
			setIsLoading(true);
			setPlans(await fetchRoadmaps(userId));
		} catch (error) {
			toast({
				title: "Oops! Something went wrong while fetching plans",
				description: error.message,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handlePlanClick = (id) => {
		router.push(`/ai/roadmap/${id}`);
	};

	const handleConfirmPlan = async (data) => {
		try {
			setIsLoading(true);
			const response = await confirmRoadmap(data);
			if (response.result) {
				setRoadmapData(null);
				toast({
					title: "New Plan created successfully",
				});
				await getAllRoadmaps();
			}
		} catch (err) {
			toast({
				title: "Oops! Something went wrong while creating plan",
				description: err.message,
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancelPlan = () => {
		setRoadmapData(null);
	};

	useEffect(() => {
		getAllRoadmaps();
	}, [userId]);

	return (
		<div className="relative w-full h-full">
			{isLoading && <Loading overlay />}
			{roadmapData ? (
				<RoadmapDetails
					roadmapData={roadmapData}
					onConfirm={handleConfirmPlan}
					onCancel={handleCancelPlan}
				/>
			) : (
				<div className="p-4 w-full h-full mx-auto relative">
					<div className="flex justify-between items-center mb-4">
						<h1 className="text-xl font-medium text-slate-200">Roadmaps by AI</h1>
						<Button
							onClick={() => setShowNewPlan(true)}
							className="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2 rounded-md flex items-center shadow-md"
						>
							<Plus className="" />
							<span>Add AI Plan</span>
						</Button>
					</div>
					<div className="border-b border-gray-700 mb-4"></div>
					<div className="w-full overflow-y-auto h-[80vh]">
						{plans.length === 0 ? (
							<div className="w-full h-full flex justify-center items-center py-12 bg-[#222] rounded-lg">
								<p className="text-gray-400 text-lg">
									No Plans created, let&apos;s create one now.
								</p>
							</div>
						) : (
							<ul className="divide-y divide-gray-700">
								{plans.map((plan) => (
									<li
													key={plan.id}
										className="flex justify-between items-center py-4 px-6 bg-[#222] hover:bg-[#191919] cursor-pointer rounded-md mb-2"
													onClick={() => handlePlanClick(plan.id)}
									>
										<div className="flex items-center">
											<h3 className="text-lg font-semibold text-white mr-3">
												{plan.title}
											</h3>

											<Badge className="bg-purple-500/20 text-purple-300 text-xs rounded-md px-2 py-0.5 w-fit border-none">
															{GLOBAL_CONSTANTS.skillLevelMapping[plan?.skill_level]}
											</Badge>
										</div>
										<span className="text-sm text-gray-400">
														{plan.months_allocated} months • {plan.hours_per_day} hours/day
										</span>
									</li>
								))}
							</ul>
						)}
					</div>
					{showNewPlan && (
						<NewAIPlan onClose={() => setShowNewPlan(false)} onSubmit={handleCreatePlan} />
					)}
				</div>
			)}
		</div>
	);
};

export default AIPage;
