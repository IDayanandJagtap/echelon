import React, { useEffect } from "react";

const Dialog = ({ children, isOpen, onClose }) => {
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
			<div className="relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">{children}</div>
		</div>
	);
};

const DialogTrigger = ({ children, onClick }) => {
	return <div onClick={onClick}>{children}</div>;
};

const DialogContent = ({ children }) => {
	return <div>{children}</div>;
};

const DialogHeader = ({ children }) => {
	return <div className="mb-4">{children}</div>;
};

const DialogTitle = ({ children }) => {
	return <h2 className="text-xl font-semibold">{children}</h2>;
};

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };
