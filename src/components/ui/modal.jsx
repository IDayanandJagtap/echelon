import PropTypes from "prop-types";
import { cn } from "@/lib/utils";

const Modal = ({ children, isOpen, onClose, className, isFullScreen = false }) => {
	if (!isOpen) return null;

	return (
		<div className={cn("z-50", isFullScreen ? "fixed inset-0" : "absolute inset-0")}>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

			{/* Modal Content */}
			<div
				className={cn(
					"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-2xl mx-auto",
					className
				)}
			>
				{children}
			</div>
		</div>
	);
};

Modal.propTypes = {
	children: PropTypes.node.isRequired,
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	className: PropTypes.string,
	isFullScreen: PropTypes.bool,
};

export { Modal };
