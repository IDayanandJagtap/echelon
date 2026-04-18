import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BsStars } from "react-icons/bs";
import { FaChartSimple } from "react-icons/fa6";
import { FaTasks, FaFire } from "react-icons/fa";
import PropTypes from "prop-types";
import { UserProfilePopover } from "@/components/layout/user-profile-popover";
import { fetchTodayStreak } from "@/app/pages/tasks/services/day.client";
const navOptions = [
	{ label: "Visualize", path: "/visualize", icon: <FaChartSimple size={24} /> },
	{ label: "Tasks", path: "/tasks", icon: <FaTasks /> },
	{ label: "AI", path: "/ai", icon: <BsStars /> },
];

const Navbar = ({ isMobileView, user }) => {
	const [selectedTab, setSelectedTab] = useState("/");
	const [streak, setStreak] = useState(0);
	const router = useRouter();
	const pathname = usePathname();

	const handleNavLinkClick = (tab) => {
		setSelectedTab(tab);
		router.push(tab);
	};

	const getStreak = async () => {
		try {
			setStreak(await fetchTodayStreak());
		} catch {
			setStreak(0);
		}
	};

	useEffect(() => {
		setSelectedTab(pathname);
	}, [pathname]);

	useEffect(() => {
		getStreak();
	}, []);

	return (
		<div className="h-full flex flex-col justify-between py-4">
			{/* Header */}

			<h1
				className="flex items-center py-2 px-1 text-3xl text-zinc-300 cursor-pointer font-cursive"
				onClick={() => router.push("/")}
			>
				{isMobileView ? "E" : "Echelon"}
			</h1>

			{/* Nav links */}
			<div className="w-full h-full flex flex-col justify-center  px-1">
				<ul className="text-xl  text-zinc-500">
					{navOptions.map((link) => (
						<li
							className={`my-4 py-1 cursor-pointer w-full flex items-center gap-3 ${
								selectedTab === link.path ? "text-zinc-300" : ""
							}`}
							key={link.path}
							onClick={() => handleNavLinkClick(link.path)}
						>
							<p title={link.label}>{link.icon}</p>
							{!isMobileView && <p>{link.label}</p>}
						</li>
					))}
				</ul>
			</div>

			{/* User button */}
			<div className="px-1 flex flex-col items-start gap-6">
				<div className="flex flex-col lg:flex-row items-center gap-2">
					<FaFire className="text-red-500 " size={26} />
					<span className="text-amber-600">{streak}</span>
				</div>
				<UserProfilePopover user={user} />
			</div>
		</div>
	);
};

Navbar.propTypes = {
	isMobileView: PropTypes.bool.isRequired,
	user: PropTypes.object,
};

export default Navbar;
