import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Link } from "react-router";

const labels = ["Protein", "Carbohydrates", "Fat Mass"];
const values = [16.4, 5.9, 8.7];
const colors = ["#465FFF", "#9CB9FF", "#0BA5EC"];

export default function SolidsCompositionChart() {
  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Outfit, sans-serif",
    },
    labels,
    colors,
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Solids",
              fontSize: "12px",
              color: "#98A2B3",
              formatter: (w) =>
                `${w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toFixed(1)}%`,
            },
            value: {
              fontSize: "18px",
              fontWeight: 600,
              color: "#1D2939",
            },
          },
        },
      },
    },
    tooltip: {
      y: { formatter: (val) => `${val}%` },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Composition of Solids
        </h3>
        <Link
          to="/documents"
          className="text-xs font-medium text-brand-500 hover:text-brand-600"
        >
          View Report
        </Link>
      </div>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Atomic, and molecular</p>

      <div className="mt-2">
        <Chart options={options} series={values} type="donut" height={220} />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
        {labels.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span className="size-2 rounded-full" style={{ backgroundColor: colors[i] }} />
            {label} <span className="font-medium text-gray-700 dark:text-gray-300">{values[i]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
