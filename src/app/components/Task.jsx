import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ChevronDown, ChevronUp, Edit2, Save, Trash2, X } from "lucide-react";

// Constants
const statuses = [
	{ label: "ToDo", value: "toDo" },
	{ label: "Pending", value: "pending" },
	{ label: "In progress", value: "inProgress" },
	{ label: "On hold", value: "onHold" },
	{ label: "Done", value: "done" },
	{ label: "Not Done", value: "notDone" },
];

const statusColorLabel = {
	done: { color: "bg-green-600", label: "Done" },
	inProgress: { color: "bg-yellow-600", label: "In progress" },
	onHold: { color: "bg-blue-600", label: "On hold" },
	notDone: { color: "bg-red-600", label: "Not Done" },
	toDo: { color: "bg-neutral-600", label: "ToDo" },
	todo: { color: "bg-neutral-600", label: "ToDo" },
	pending: { color: "bg-neutral-600", label: "Pending" },
};

const Task = ({
	id,
	title,
	description,
	category,
	status,
	source,
	templateName,
	ruleTitle,
	starLevel,
	onTaskUpdate,
	onDelete,
}) => {
	const [selectedFilters, setSelectedFilters] = useState({});
	const [isEditing, setIsEditing] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [editedTitle, setEditedTitle] = useState(title);
	const [editedDescription, setEditedDescription] = useState(description);
	const isTemplateTask = source === "template";

	const handleDropdownChange = (dropdown, newValue) => {
		setSelectedFilters({ ...selectedFilters, [dropdown]: newValue });
		onTaskUpdate(id, { status: newValue });
	};

	const handleEditClick = () => {
		if (isTemplateTask) {
			return;
		}
		setIsEditing(true);
	};

	const handleSaveClick = async () => {
		const updatedData = {
			title: editedTitle,
			description: editedDescription,
		};
		await onTaskUpdate(id, updatedData);
		setIsEditing(false);
	};

	const handleCancelClick = () => {
		setEditedTitle(title);
		setEditedDescription(description);
		setIsEditing(false);
	};

	const handleDeleteClick = () => {
		if (isTemplateTask) {
			return;
		}
		onDelete(id);
	};

	const toggleExpand = () => {
		setIsExpanded((previous) => !previous);
	};

	useEffect(() => {
		setSelectedFilters({ ...selectedFilters, statusOfTask: status });
	}, [status]);

	return (
		<div className="bg-[#222] px-4  my-2 rounded-lg">
			<div className="py-3">
				<div className="flex items-start justify-between gap-3">
					<button
						type="button"
						onClick={toggleExpand}
						className="flex flex-1 items-start gap-3 text-left"
					>
						<div className="pt-0.5 text-slate-400">
							{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
						</div>
						<div className="flex flex-col gap-1">
							{isEditing ? (
								<div className="flex flex-col gap-1 w-full">
									<Label htmlFor="title" className="text-xs text-gray-400">
										Title
									</Label>
									<Input
										id="title"
										value={editedTitle}
										onChange={(e) => setEditedTitle(e.target.value)}
										className="bg-[#181818] border-none w-full"
									/>
								</div>
							) : (
								<>
									<h3 className="text-sm font-medium lg:text-md">{title}</h3>
									<div className="flex flex-wrap items-center gap-1">
										{isTemplateTask ? (
											<>
												{templateName ? (
													<Badge className="bg-cyan-500/20 text-cyan-300 text-xs rounded-md px-2 py-0.5 w-fit border-none">
														{templateName}
													</Badge>
												) : null}
												{starLevel ? (
													<Badge className="bg-orange-500/20 text-orange-300 text-xs rounded-md px-2 py-0.5 w-fit border-none">
														Star {starLevel}
													</Badge>
												) : null}
											</>
										) : category ? (
											<Badge className="bg-purple-500/20 text-purple-300 text-xs rounded-md px-2 py-0.5 w-fit border-none">
												{category}
											</Badge>
										) : null}
									</div>
								</>
							)}
						</div>
					</button>

					{!isEditing && (
						<div className="shrink-0">
							<Select
								value={selectedFilters?.statusOfTask || status}
								onValueChange={(value) => handleDropdownChange("statusOfTask", value)}
							>
								<SelectTrigger
									className={`w-[120px] h-[32px] ${
										statusColorLabel[selectedFilters?.statusOfTask]?.color
									} border-none text-xs`}
								>
									<SelectValue placeholder={statusColorLabel[status]?.label} />
								</SelectTrigger>
								<SelectContent className="bg-[#222] border-slate-700">
									{statuses.map((item) => (
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
					)}
				</div>

				{isExpanded && (
					<div className="mt-4 flex flex-col gap-4">
						<div className="flex flex-col gap-3">
							{isEditing ? (
								<>
									<div className="flex flex-col gap-1">
										<Label htmlFor="category" className="text-xs text-gray-400">
											Category
										</Label>
										<Badge className="bg-purple-500/20 text-purple-300 text-xs rounded-md px-2 py-0.5 w-fit border-none">
											{category}
										</Badge>
									</div>
									<div className="flex flex-col gap-1">
										<Label htmlFor="description" className="text-xs text-gray-400">
											Description
										</Label>
										<Textarea
											id="description"
											value={editedDescription}
											onChange={(e) => setEditedDescription(e.target.value)}
											className="bg-[#181818] border-input border-none min-h-[100px]"
										/>
									</div>
								</>
							) : (
								<p className="text-sm text-gray-300">{description}</p>
							)}
						</div>

						<div className="border-t border-border/10 pt-2">
							<div className="flex justify-end gap-2 items-center">
								{isTemplateTask ? (
									<p className="text-xs text-slate-400">Template task: status only</p>
								) : (
									<>
										<Button
											variant="ghost"
											size="icon"
											className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
											onClick={handleDeleteClick}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
										{isEditing ? (
											<>
												<Button
													variant="ghost"
													size="icon"
													className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
													onClick={handleSaveClick}
												>
													<Save className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="text-gray-500 hover:text-gray-600 hover:bg-gray-500/10"
													onClick={handleCancelClick}
												>
													<X className="h-4 w-4" />
												</Button>
											</>
										) : (
											<Button
												variant="ghost"
												size="icon"
												className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
												onClick={handleEditClick}
											>
												<Edit2 className="h-4 w-4" />
											</Button>
										)}
									</>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

// Proptypes
Task.propTypes = {
	id: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	description: PropTypes.string,
	category: PropTypes.string,
	status: PropTypes.string.isRequired,
	source: PropTypes.oneOf(["direct", "template"]),
	templateName: PropTypes.string,
	ruleTitle: PropTypes.string,
	starLevel: PropTypes.number,
	onTaskUpdate: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
};

export default Task;
