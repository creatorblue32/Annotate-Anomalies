// src/pages/page.tsx

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
import { Metadata } from 'next';



const TemperaturePlot = dynamic(() => import('../components/TemperaturePlot'), {
  ssr: false
});


export const metadata: Metadata = {
  title: 'AnomalyReport',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};






export default function Page() {


  return (
    <div>
      <div className="bg-white w-full h-16 fixed top-0 z-10 shadow-md">
        <h1 className="flex items-center font-semibold  m-4 text-xl">
          <BarChart3 className='mr-1' /><span>AnomalyReport</span></h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>

        <TemperaturePlot />
      </div>
      <div className="bg-white w-full h-12 fixed bottom-0 z-10 shadow-md">
        <div className="flex justify-center items-center h-full">
          <h2 className="text-xs text-gray-400">created by: Elyas Masrour</h2>
        </div>
      </div>
    </div>

  );
}

