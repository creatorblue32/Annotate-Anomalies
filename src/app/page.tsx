// src/pages/page.tsx
"use client";

import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BarChart3 } from 'lucide-react';



const TemperaturePlot = dynamic(() => import('../components/TemperaturePlot'), {
  ssr: false
});


// SPEC: should be able to upload channels_log, and plot them.
// THEN, should be able to annotate a section into a timeline, and share the results
// TODO Monday: make annotations prettier, make data table / add events work, switch timeline to milliseconds, work on PDF format, upload CSV




export default function Page() {

  const inputData = [
    { time: '000', temperature: 20 },
    { time: '001', temperature: 20 },
    { time: '002', temperature: 19 },
    { time: '003', temperature: 19 },
    { time: '004', temperature: 20 },
    { time: '005', temperature: 21 },
    { time: '006', temperature: 28 },
    { time: '007', temperature: 32 },
    { time: '008', temperature: 33 },
    { time: '009', temperature: 34 },
    { time: '010', temperature: 33 },
    { time: '011', temperature: 31 },
    { time: '012', temperature: 39 },
    { time: '013', temperature: 42 },
    { time: '014', temperature: 48 },
    { time: '015', temperature: 49 }
  ];

  const channelDataArray = [
    { "time": 0, "temperature": 20, "nozzlePressure": 161, "tankPressure": 89, "enginePressure": 242 },
    { "time": 1, "temperature": 20, "nozzlePressure": 185, "tankPressure": 147, "enginePressure": 297 },
    { "time": 2, "temperature": 19, "nozzlePressure": 119, "tankPressure": 90, "enginePressure": 257 },
    { "time": 3, "temperature": 19, "nozzlePressure": 200, "tankPressure": 110, "enginePressure": 317 },
    { "time": 4, "temperature": 20, "nozzlePressure": 134, "tankPressure": 79, "enginePressure": 308 },
    { "time": 5, "temperature": 21, "nozzlePressure": 178, "tankPressure": 150, "enginePressure": 297 },
    { "time": 6, "temperature": 28, "nozzlePressure": 107, "tankPressure": 69, "enginePressure": 210 },
    { "time": 7, "temperature": 32, "nozzlePressure": 129, "tankPressure": 108, "enginePressure": 346 },
    { "time": 8, "temperature": 33, "nozzlePressure": 130, "tankPressure": 135, "enginePressure": 203 },
    { "time": 9, "temperature": 34, "nozzlePressure": 199, "tankPressure": 91, "enginePressure": 221 },
    { "time": 10, "temperature": 33, "nozzlePressure": 173, "tankPressure": 105, "enginePressure": 391 },
    { "time": 11, "temperature": 31, "nozzlePressure": 198, "tankPressure": 136, "enginePressure": 272 },
    { "time": 12, "temperature": 39, "nozzlePressure": 194, "tankPressure": 135, "enginePressure": 213 },
    { "time": 13, "temperature": 42, "nozzlePressure": 140, "tankPressure": 107, "enginePressure": 293 },
    { "time": 14, "temperature": 48, "nozzlePressure": 111, "tankPressure": 59, "enginePressure": 291 },
    { "time": 15, "temperature": 49, "nozzlePressure": 150, "tankPressure": 62, "enginePressure": 355 }
  ];


  return (
    <div>
      <div className="bg-white w-full h-16 fixed top-0 z-10 shadow-md">
        <h1 className="flex items-center font-semibold  m-4 text-xl">
          <BarChart3 className='mr-1' /><span>AnomalyReport</span></h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>

        <TemperaturePlot channelData={channelDataArray} />
      </div>
      <div className="bg-white w-full h-12 fixed bottom-0 z-10 shadow-md">
        <div className="flex justify-center items-center h-full">
          <h2 className="text-xs text-gray-400">created by: Elyas Masrour</h2>
        </div>
      </div>
    </div>

  );
}

