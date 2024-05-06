import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function BarChart({ filter }) {
  const [dataSample, setDataSample] = useState({
    options: {
      chart: {
        id: 'basic-bar',
      },
      xaxis: {
        categories: ['Month 1', 'Month 2', 'Month 3', 'Month 4'],
      },
    },
    Rata_Rata: [
      {
        name: 'minggu',
        data: [30, 40, 45, 50],
      },
    ],
    Tertinggi: [
      {
        name: 'minggu',
        data: [3000, 400, 454, 550],
      },
    ],
  });

  useEffect(() => {
    if (filter === 'average') {
      setDataSample({
        ...dataSample,
        series: dataSample.Rata_Rata,
      });
    } else if (filter === 'max') {
      setDataSample({
        ...dataSample,
        series: dataSample.Tertinggi,
      });
    }
  }, [filter]);

  return (
    <div>
      <div className="app">
        <div className="row">
          <div className="mixed-chart">
            {dataSample.series && ( // Check if series is defined
              <Chart
                options={dataSample.options}
                series={dataSample.series}
                type="bar"
                width="100%"
              />
            )}
            {!dataSample.series && ( // Optional fallback rendering
              <p>Loading chart data...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
