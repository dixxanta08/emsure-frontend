import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Empty } from "antd";

ChartJS.register(ArcElement, Tooltip, Legend);

const ClaimsDistributionChart = ({ chartData, chartLabel = [] }) => {
  const data = {
    labels: chartLabel,
    datasets: [
      {
        label: "Claims Distribution",
        data: chartData,
        backgroundColor: ["#564dfb", "#ff4a4a", "#f59e0b"],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
    },
    cutout: "70%",
  };

  if (!chartData || chartData.length === 0) {
    return <Empty description="No data available" />;
  }
  return (
    <div className="w-full h-full">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default ClaimsDistributionChart;
