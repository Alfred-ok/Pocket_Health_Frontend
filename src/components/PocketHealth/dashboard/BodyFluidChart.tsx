import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import Badge from "../../ui/badge/Badge";

const categories = ["Extracellular", "Intracellular", "Mineral"];
const values = [20, 30, 10];
const colors = ["#9CB9FF", "#465FFF", "#C2D6FF"];

export default function BodyFluidChart() {
  const series = [{ name: "Composition", data: values }];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 6,
        distributed: true,
      },
    },
    colors,
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: {
      borderColor: "#F2F4F7",
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#98A2B3", fontSize: "11px" } },
    },
    yaxis: {
      labels: {
        formatter: (val) => `${val}%`,
        style: { colors: "#98A2B3", fontSize: "11px" },
      },
    },
    tooltip: {
      y: { formatter: (val) => `${val}%` },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Body Fluid Composition
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">60% of the total</p>
        </div>
        <Badge color="success" size="sm">
          +3.15%
        </Badge>
      </div>

      <div className="mt-4">
        <Chart options={options} series={series} type="bar" height={220} />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
        {categories.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="size-2 rounded-full" style={{ backgroundColor: colors[i] }} />
            {label} <span className="font-medium text-gray-700 dark:text-gray-300">{values[i]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
