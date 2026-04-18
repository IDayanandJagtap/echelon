"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import PropTypes from "prop-types";

const DateList = ({ dates = [], selectedDay }) => {
	const [expandedDate, setExpandedDate] = useState(null);

	const toggleDate = (date) => {
		setExpandedDate(expandedDate === date ? null : date);
	};

	const getCompletionPercentage = (completed, total) => {
		return Math.round((completed / total) * 100);
	};

	return (
		<div className="w-full h-full flex flex-col bg-[#222] rounded-md overflow-hidden">
			<div className="p-4 border-b border-[#444] flex-shrink-0">
				<h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
					<CheckCircle2 className="h-5 w-5 text-blue-400" />
					Tasks for {selectedDay}
				</h3>
			</div>
			<div className="flex-1 min-h-0 overflow-y-auto">
				<div className="p-4 space-y-3">
					{dates.length > 0 ? (
						dates.map((date) => {
							const completionPercentage = getCompletionPercentage(
								date.completedTasks,
								date.totalTasks
							);
							return (
								<div
									key={date.id}
									className="border border-[#333] rounded-md overflow-hidden transition-all duration-200 hover:border-[#444]"
								>
									<button
										onClick={() => toggleDate(date.id)}
										className="w-full flex items-center justify-between p-3 hover:bg-[#333] transition-colors group"
									>
										<div className="flex items-center gap-3">
											<div className="relative">
												<Circle className="h-8 w-8 text-[#444]" />
												<div className="absolute inset-0 flex items-center justify-center">
													<span className="text-xs font-medium text-slate-300">
														{completionPercentage}%
													</span>
												</div>
											</div>
											<div className="flex flex-col items-start">
												<span className="text-slate-300 font-medium">
													{date.date}
												</span>
												<span className="text-xs text-slate-400">
													{date.completedTasks} of {date.totalTasks} tasks
												</span>
											</div>
										</div>
										{expandedDate === date.id ? (
											<ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200" />
										) : (
											<ChevronRight className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-1" />
										)}
									</button>
									{expandedDate === date.id && (
										<div className="p-3 bg-[#333] border-t border-[#444] animate-in fade-in slide-in-from-top-2">
											<div className="space-y-3">
												<div className="flex justify-between items-center">
													<span className="text-slate-300">Completion Rate</span>
													<div className="w-24 h-2 bg-[#444] rounded-full overflow-hidden">
														<div
															className="h-full bg-blue-500 transition-all duration-500"
															style={{ width: `${completionPercentage}%` }}
														></div>
													</div>
												</div>
												<div className="grid grid-cols-2 gap-4">
													<div className="bg-[#444] p-2 rounded-md">
														<span className="text-xs text-slate-400 block">
															Completed
														</span>
														<span className="text-slate-300 font-medium">
															{date.completedTasks}
														</span>
													</div>
													<div className="bg-[#444] p-2 rounded-md">
														<span className="text-xs text-slate-400 block">
															Total
														</span>
														<span className="text-slate-300 font-medium">
															{date.totalTasks}
														</span>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							);
						})
					) : (
						<div className="text-center text-slate-400 py-4">
							No tasks found for {selectedDay}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

DateList.propTypes = {
	dates: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.number.isRequired,
			date: PropTypes.string.isRequired,
			completedTasks: PropTypes.number.isRequired,
			totalTasks: PropTypes.number.isRequired,
		})
	).isRequired,
	selectedDay: PropTypes.string.isRequired,
};

export default DateList;
