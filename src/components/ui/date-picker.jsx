"use client";

import PropTypes from "prop-types";
import { cn } from "@/lib/utils";
import { formatDateString } from "@/utils/format-date";

// Define prop types, similar to interface.
DatePicker.propTypes = {
	date: PropTypes.instanceOf(Date).isRequired,
	setDate: PropTypes.func.isRequired,
	className: PropTypes.string,
};
export function DatePicker({ date, setDate, className }) {
	const inputValue = date ? new Date(date).toISOString().split("T")[0] : "";

	return (
		<input
			type="date"
			value={inputValue}
			onChange={(event) => setDate(new Date(event.target.value))}
			aria-label={date ? formatDateString(date) : "Pick a date"}
			className={cn(
				"w-[280px] h-9 rounded-md px-3 py-2 text-sm bg-[#222] text-zinc-300 hover:bg-[#111] hover:text-zinc-100 border-none outline-none",
				className
			)}
		/>
	);
}
