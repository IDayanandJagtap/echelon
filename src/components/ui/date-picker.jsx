"use client";

import PropTypes from "prop-types";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { formatDateString } from "@/utils/format-date";

function formatLocalDateInput(value) {
	if (!value) {
		return "";
	}

	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "";
	}

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function parseLocalDateInput(value) {
	if (!value) {
		return null;
	}

	const [year, month, day] = value.split("-").map(Number);
	if (!year || !month || !day) {
		return null;
	}

	return new Date(year, month - 1, day);
}

// Define prop types, similar to interface.
DatePicker.propTypes = {
	date: PropTypes.instanceOf(Date).isRequired,
	setDate: PropTypes.func.isRequired,
	className: PropTypes.string,
	colorScheme: PropTypes.oneOf(["dark", "light", "auto"]),
	id: PropTypes.string,
	name: PropTypes.string,
	disabled: PropTypes.bool,
};
export function DatePicker({
	date,
	setDate,
	className,
	colorScheme = "dark",
	id,
	name,
	disabled = false,
}) {
	const inputRef = useRef(null);
	const inputValue = formatLocalDateInput(date);
	const inputColorScheme = colorScheme === "auto" ? "light dark" : colorScheme;

	const openNativePicker = () => {
		if (typeof inputRef.current?.showPicker === "function") {
			try {
				inputRef.current.showPicker();
			} catch {
				// Ignore when browser blocks programmatic picker opening.
			}
		}
	};

	return (
		<input
			ref={inputRef}
			id={id}
			name={name}
			disabled={disabled}
			type="date"
			value={inputValue}
			onClick={openNativePicker}
			onChange={(event) => {
				const nextDate = parseLocalDateInput(event.target.value);
				if (nextDate) {
					setDate(nextDate);
				}
			}}
			aria-label={date ? formatDateString(date) : "Pick a date"}
			className={cn(
				"w-[280px] h-9 rounded-md px-3 py-2 text-sm bg-[#222] text-zinc-300 hover:bg-[#111] hover:text-zinc-100 border-none outline-none cursor-pointer",
				className
			)}
			style={{ colorScheme: inputColorScheme }}
		/>
	);
}
