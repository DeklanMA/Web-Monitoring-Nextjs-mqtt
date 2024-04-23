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
        categories: [], // Gunakan array ini untuk menyimpan label waktu
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
    timestamps: [], // Array untuk menyimpan data waktu
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
          setDataSample((prevData) => {
            let updatedData = [
              ...prevData.series[0].data,
              { x: timestamp, y: level },
            ];
            let updatedTimestamps = [...prevData.timestamps, timestamp]; // Simpan timestamp

            // Hapus data lama jika sudah lebih dari 4 label waktu
            if (prevData.timestamps.length > 4) {
              updatedData = updatedData.slice(1);
              updatedTimestamps = updatedTimestamps.slice(1);
            }

            return {
              ...prevData,
              series: [
                {
                  name: 'Real-time Jarak',
                  data: updatedData,
                },
              ],
              timestamps: updatedTimestamps, // Simpan array timestamp yang diperbarui
            };
          });
        }
      });
    }
  }, [mqttClient]);


 

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
