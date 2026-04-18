import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import PropTypes from "prop-types";
import { useState } from "react";
import { GLOBAL_CONSTANTS } from "@/app/utils/GLOBAL_CONSTANTS";

const defaultInputValues = {
	title: "",
	level: "",
	months: "",
	hoursPerDay: "",
};

const NewAIPlan = ({ onClose, onSubmit }) => {
	const [inputData, setInputData] = useState(defaultInputValues);

	const handleInputChange = (field, value) => {
		setInputData({ ...inputData, [field]: value });
	};

	const handleOnCreate = async () => {
		if (inputData.title && inputData.level != null && inputData.months && inputData.hoursPerDay) {
			await onSubmit(inputData);
			onClose();
		}
	};

	const handleCloseModal = () => {
		setInputData(defaultInputValues);
		onClose();
	};

	return (
		<div className="absolute inset-0 z-10">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleCloseModal} />

			{/* Modal Content */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-2xl mx-auto">
				<div className="bg-[#111] rounded-lg shadow-lg">
					{/* Header */}
					<div className="flex items-center justify-between p-3 border-b border-slate-700">
						<h3 className="text-sm sm:text-base font-semibold text-slate-200">
							Create a New AI Plan
						</h3>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleCloseModal}
							className="text-slate-400 hover:text-white hover:bg-red-600 h-7 w-7 sm:h-8 sm:w-8"
						>
							<X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						</Button>
					</div>

					{/* Form Content */}
					<div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
						{/* Title Input */}
						<div className="space-y-1">
							<Label htmlFor="title" className="text-xs sm:text-sm text-slate-300">
								Name of Skill
							</Label>
							<Input
								id="title"
								className="bg-[#222] border-none h-9 sm:h-10 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500"
								placeholder="Enter skill name"
								onChange={(e) => handleInputChange("title", e.target.value)}
								value={inputData.title}
							/>
						</div>

						{/* Level of Skill */}
						<div className="space-y-1">
							<Label htmlFor="level" className="text-xs sm:text-sm text-slate-300">
								Level of Skill
							</Label>
							<Select
								onValueChange={(value) => handleInputChange("level", value)}
								value={inputData.level}
							>
								<SelectTrigger
									id="level"
									className="bg-[#222] border-none h-9 sm:h-10 text-xs sm:text-sm text-slate-200"
								>
									<SelectValue placeholder="Select level" />
								</SelectTrigger>
								<SelectContent className="bg-[#222] text-white border-slate-700">
									{GLOBAL_CONSTANTS.skillLevelMapping.map((level, index) => {
										return (
											<SelectItem
												value={index}
												key={index}
												className="focus:bg-[#333] focus:text-slate-300 text-xs sm:text-sm"
											>
												{level}
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</div>

						{/* Months Allocated */}
						<div className="space-y-1">
							<Label htmlFor="months" className="text-xs sm:text-sm text-slate-300">
								Months Allocated
							</Label>
							<Input
								id="months"
								type="number"
								className="bg-[#222] border-none h-9 sm:h-10 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500"
								placeholder="Enter number of months"
								onChange={(e) => handleInputChange("months", e.target.value)}
								value={inputData.months}
							/>
						</div>

						{/* Hours per Day */}
						<div className="space-y-1">
							<Label htmlFor="hoursPerDay" className="text-xs sm:text-sm text-slate-300">
								Hours per Day
							</Label>
							<Input
								id="hoursPerDay"
								type="number"
								className="bg-[#222] border-none h-9 sm:h-10 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500"
								placeholder="Enter hours per day"
								onChange={(e) => handleInputChange("hoursPerDay", e.target.value)}
								value={inputData.hoursPerDay}
							/>
						</div>
					</div>

					{/* Footer */}
					<div className="flex justify-end p-3 border-t border-slate-700">
						<Button
							onClick={handleOnCreate}
							className="text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white h-8 sm:h-9"
						>
							Create Plan
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

// Proptypes
NewAIPlan.propTypes = {
	onClose: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired,
};

export default NewAIPlan;
