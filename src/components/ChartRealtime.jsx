import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import useMQTTConnection from '@/lib/mqtt';
import moment from 'moment-timezone';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function RealtimeChart() {
  const [dataSample, setDataSample] = useState({
    options: {
      chart: {
        id: 'realtime-chart',
        animations: {
          enabled: true,
          easing: 'linear',
          dynamicAnimation: {
            speed: 1000,
          },
        },
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        type: 'category',
        labels: {
          formatter: function (val) {
            return moment(val).format('HH:mm'); // Mengambil jam dan menit dari waktu
          },
        },
      },
      yaxis: {
        max: 120, // Sesuaikan dengan skala yang sesuai
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
    },
    series: [{ name: 'Real-time Jarak', data: [] }],
  });

  const mqttClient = useMQTTConnection();

  useEffect(() => {
    if (mqttClient) {
      mqttClient.subscribe('ione/jarak');

      mqttClient.on('message', (topic, message) => {
        if (topic === 'ione/jarak') {
          const level = parseInt(message.toString(), 10);
          const timestamp = moment().tz('Asia/Jakarta').format(); // Waktu penerimaan pesan

          // Perbarui data series dengan data yang baru
          setDataSample((prevData) => ({
            ...prevData,
            series: [
              {
                name: 'Real-time Jarak',
                data: [...prevData.series[0].data, { x: timestamp, y: level }],
              },
            ],
          }));
        }
      });
    }
  }, [mqttClient]);

  // Jika tidak ada data, tambahkan data 0 ke series Real-time
  useEffect(() => {
    const timer = setInterval(() => {
      const timestamp = moment().tz('Asia/Jakarta').format(); // Waktu penerimaan pesan
      setDataSample((prevData) => ({
        ...prevData,
        series: prevData.series.map((serie, index) => {
          if (index === 0 && serie.data.length === 0) {
            return { ...serie, data: [{ x: timestamp, y: 0 }] };
          }
          return serie;
        }),
      }));
    }, 5000); // Frekuensi pengecekan, misalnya setiap 5 detik
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <div className="app">
        <div className="row">
          <div className="mixed-chart">
            <Chart
              options={dataSample.options}
              series={dataSample.series}
              type="line"
              width="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
