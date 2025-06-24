import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Empty } from "antd";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

const ProcessingTimeChart = ({ chartLabel = [], chartData }) => {
  const data = {
    labels: chartLabel,
    datasets: [
      {
        label: "Days",
        data: chartData,
        borderColor: "#6366f1",
        backgroundColor: "#6366f1",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        title: { display: true, text: "Days" },
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };
  if (!chartData || chartData.length === 0) {
    return <Empty description="No data available" />;
  }

  return <Line data={data} options={options} />;
};

export default ProcessingTimeChart;
