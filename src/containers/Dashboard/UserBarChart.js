import React from "react";
import Chart from "react-apexcharts";

const UserBarChart = ({data}) => {    
    // Map data to chart format
    const categories = data.map((item) => `Month ${item._id.month}`);
    const seriesData = data.map((item) => item.count);

    const options = {
        chart: {
            type: "bar"
        },
        xaxis: {
            categories: categories
        },
    };

    const series = [
        {
            name: "Count",
            data: seriesData
        }
    ];

    return (

        <React.Fragment>
            <div className='f_dashboard-bg'>
                <div className='f_dashboard-header f_flex f_align-center f_content-between'>
                    <div className='f_flex f_align-center'>
                        <h6 className='f_mr-5'>Users </h6>
                    </div>
                </div>
                <div className='f_dashboard-content f_p-10'>
                    <Chart options={options} series={series} type="bar" height={350} />
                </div>
            </div>
        </React.Fragment>
    )
};

export default UserBarChart;