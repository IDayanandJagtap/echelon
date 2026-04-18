import LineChartWrapper from "@/app/components/charts/line-chart/LineChartWrapper";
import PieChartWrapper from "@/app/components/charts/pie-chart/PieChartWrapper";

const VisualizeLayout = () => {
	return (
		<div className="flex w-full h-full justify-center items-center overflow-hidden">
			{/* Line chart */}
			<div className="w-full h-full p-4 m-auto overflow-y-auto">
				<LineChartWrapper />
				<PieChartWrapper />
			</div>
		</div>
	);
};

export default VisualizeLayout;
