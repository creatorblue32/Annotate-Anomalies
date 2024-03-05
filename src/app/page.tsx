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

  const temperatureData = [
    { time: '2024-03-04T10:00:00.000Z', temperature: 20 },
    { time: '2024-03-04T10:05:00.000Z', temperature: 30 },
    { time: '2024-03-04T10:10:00.000Z', temperature: 40 },
    { time: '2024-03-04T10:15:00.000Z', temperature: 30 },
    { time: '2024-03-04T10:20:00.000Z', temperature: 25 }
  ];

  const events = [
    { time: '2024-03-04T10:15:00.000Z', event: 'Hey wait!' },
  ];


  return (
    <div>
      <div className="bg-white w-full h-16 fixed top-0 z-10 shadow-md">
       <h1 className="font-semibold m-4 text-xl">     <BarChart3 /> AnomalyReport</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <TemperaturePlot temperatureData={temperatureData} events={events} />
      </div>

      {/* Footer */}
      <div className="bg-white w-full h-12 fixed bottom-0 z-10 shadow-md">
        <div className="flex justify-center items-center h-full">
          <h2 className="text-xs text-gray-400">created by: creatorblue32</h2>
        </div>
      </div>
    </div>

  );
}

