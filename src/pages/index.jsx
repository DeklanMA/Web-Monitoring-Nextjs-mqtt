'use client';
import React, { Suspense, useState,useEffect,useRef } from 'react';
import Layout from './layout';
import { MdOutlineWaterDrop } from 'react-icons/md';
import { FaArrowUpFromWaterPump } from 'react-icons/fa6';
import { BsCamera } from 'react-icons/bs';
import BarChart from '@/components/BarChart';
import useMQTTConnection from '@/lib/mqtt';
import { Button } from '@/components/ui/button';
import RealtimeChart from '@/components/ChartRealtime';

export default function Page() {
 const [filter, setFilter] = useState('average');
 const [isOn, setIsOn] = useState(false);
 const mqttClient = useMQTTConnection();
 const [activityLog, setActivityLog] = useState([]);
 const [waterLevel, setWaterLevel] = useState(0);

 // Tambahkan useRef untuk menyimpan status pompa sebelumnya
 const prevPumpStatusRef = useRef(null);

 useEffect(() => {
   if (mqttClient) {
     mqttClient.subscribe('ione/jarak');
     mqttClient.subscribe('ione/pompa');

     mqttClient.on('connect', () => {
       // Tambahkan log saat berhasil terhubung ke broker MQTT
       const timestamp = new Date().toLocaleTimeString('en-US', {
         hour: 'numeric',
         minute: 'numeric',
         hour12: true,
       });
       const logEntry = {
         timestamp,
         event: 'MQTT Status',
         description: 'Successfully connected to MQTT broker',
       };
       setActivityLog((prevLog) => [...prevLog, logEntry]);
     });

     mqttClient.on('close', () => {
       // Tambahkan log saat terputus dari broker MQTT
       const timestamp = new Date().toLocaleTimeString('en-US', {
         hour: 'numeric',
         minute: 'numeric',
         hour12: true,
       });
       const logEntry = {
         timestamp,
         event: 'MQTT Status',
         description: 'Disconnected from MQTT broker',
       };
       setActivityLog((prevLog) => [...prevLog, logEntry]);
     });

     mqttClient.on('message', (topic, message) => {
       if (topic === 'ione/pompa') {
         const status = message.toString();
         setIsOn(status === 'on');

         // Cek apakah status pompa telah berubah sebelum menambahkan log
         if (status !== prevPumpStatusRef.current) {
           const timestamp = new Date().toLocaleTimeString('en-US', {
             hour: 'numeric',
             minute: 'numeric',
             hour12: true,
           });
           const activity =
             status === 'on' ? 'Pump turned on' : 'Pump turned off';
           const logEntry = {
             timestamp,
             event: 'Pump Status',
             description: activity,
           };
           setActivityLog((prevLog) => [...prevLog, logEntry]);
         }

         // Update status pompa sebelumnya
         prevPumpStatusRef.current = status;
       } else if (topic === 'ione/jarak') {
         const level = parseInt(message.toString(), 10);
         setWaterLevel(level);
       }
     });
   }
 }, [mqttClient]);

 const handleButtonClick = () => {
   if (mqttClient) {
     const newStatus = isOn ? 'off' : 'on';
     mqttClient.publish('ione/pompa', newStatus);
     console.log(`Published message to topic 'ione/pompa': ${newStatus}`);
   }
 };

 

  return (
    <Layout>
      <div className="container mx-auto no-scrollbar grid-flow-col col-end-1 justify-center ">
        <div className="flex flex-col">
          <h1 className="font-bold text-xl pt-7 pl-3 pb-2 text-black">
            Dashboard
          </h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 pb-8 gap-4">
          <div className="card w-full col-span-2 bg-slate-50 shadow-xl row-span-2 h-full">
            <div className="card-body">
              <h2 className="card-title text-black pl-5 border-b-2 ">
                <BsCamera />
                <span> Camera</span>
               
              </h2>
              <div className="items-center justify-center flex">
                <div className="content-border w-72 h-72 bg-gray-200 flex items-center justify-center">
                  <div className="camera-icon w-16 h-16 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="card w-full  bg-slate-50 shadow-xl h-full ">
            <div className="card-body">
              <h2 className="card-title text-black border-b-2">
                <MdOutlineWaterDrop color="blue" size={30} />
                <span className="size-auto">Water level</span>
              </h2>
              <p className="text-xl">{waterLevel} cm</p>
            </div>
          </div>
          <div className="card w-full bg-slate-50 shadow-xl h-full ">
            <div className="card-body">
              <h2 className="card-title text-black border-b-2">
                <FaArrowUpFromWaterPump color="blue" size={30} />
                <span className="size-auto">Water Pump</span>
              </h2>
              <p className="text-base">Pompa {isOn ? 'On' : 'Off'}</p>
              <div className="flex justify-end">
                <Button onClick={handleButtonClick}>
                  {isOn ? 'Turn Off' : 'Turn On'}
                </Button>
              </div>
            </div>
          </div>
          <div className="card w-full col-span-2  bg-slate-50 shadow-xl  ">
            <div className="card-body">
              <div className="w-full">
                <h2 className="card-title text-black pl-5 ">Log aktifity</h2>
              </div>
              <div className="items-center justify-center flex">
                <table className="table-auto w-full ">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2">Timestamp</th>
                      <th className="border px-4 py-2">Event</th>
                      <th className="border px-4 py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLog.map((log, index) => (
                      <tr key={index} className="border ">
                        <td className=" px-4 flex justify-center">
                          {log.timestamp}
                        </td>
                        <td className="border px-4">{log.event}</td>
                        <td className="border px-4">{log.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="card w-full col-span-2 bg-slate-50 shadow-xl mb-">
            <div className="card-body ">
              <div className="border-b-2 flex flex-grow">
                <h2 className="card-title text-black pl-5 ">Grafik</h2>
                <div className="mt-4 bg-white ml-auto pb-2">
                  <label htmlFor="filterDropdown ">Filter:</label>
                  <select
                    id="filterDropdown"
                    className="ml-2 border bg-white rounded-md px-2 py-1"
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="average">Rata-rata</option>
                    <option value="max">Tertinggi</option>
                  </select>
                </div>
              </div>
              <div>
                <Suspense>
                  <BarChart filter={filter} />
                </Suspense>
              </div>
            </div>
          </div>
          <div className="card w-full col-span-2 bg-slate-50 shadow-xl mb-">
            <div className="card-body ">
              <div className="border-b-2 flex flex-col">
                <h2 className="card-title text-black pl-5 ">Grafik</h2>
                <h2 className=" pl-5 pb- ">Real-Time Chart</h2>
              </div>
              <div>
                <Suspense>
                  <RealtimeChart />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />
      <br />
    </Layout>
  );
}
