import React from "react";
import Chart from "react-apexcharts";

const MultiLineChart = ({data}) => {    
  const series = data.map((game) => ({
    name: game.game,
    data: game.data.map((d) => ({ x: `${d._id.year}-${d._id.month}`, y: d.count })),
  }));

  const options = {
    chart: {
      type: "line",
      height: 350,
      zoom: { enabled: false },
    },
    xaxis: {
      type: "category",
      categories: Array.from(new Set(data.flatMap((g) => g.data.map((d) => `${d._id.year}-${d._id.month}`)))).sort(),
    },
    stroke: {
      curve: "smooth",
    },
    markers: {
      size: 4,
    },
  };

  return (

    <React.Fragment>
        <div className='f_dashboard-bg'>
            <div className='f_dashboard-header f_flex f_align-center f_content-between'>
                <div className='f_flex f_align-center'>
                    <h6 className='f_mr-5'>Game Playes </h6>
                </div>
            </div>
            <div className='f_dashboard-content f_p-10'>
            <Chart options={options} series={series} type="line" height={350} />
            </div>
        </div>
    </React.Fragment>
)
};

export default MultiLineChart;
