import React, { useState, useRef } from 'react';
import Plot from 'react-plotly.js';
import JsPDF from 'jspdf';
import Plotly from 'plotly.js-basic-dist';
import autoTable from 'jspdf-autotable';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


interface TemperatureEvent {
  time: string;
  event: string;
}

interface Props {
  temperatureData: Array<{ time: string; temperature: number }>;
  events: TemperatureEvent[];
}

const TemperaturePlot: React.FC<Props> = ({ temperatureData, events: initialEvents }) => {
  const plotRef = useRef<any>(null);
  const [events, setEvents] = useState<TemperatureEvent[]>(initialEvents);
  const [newEvent, setNewEvent] = useState<TemperatureEvent>({ time: '', event: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const addEvent = () => {
    if (newEvent.time && newEvent.event) {
      setEvents([...events, newEvent]);
      setNewEvent({ time: '', event: '' });
    } else {
      alert('Please fill in all fields.');
    }
  };

  const interpolateTemperature = (time: string) => {
    const times = temperatureData.map(data => data.time);
    const temperatures = temperatureData.map(data => data.temperature);
    const timeIndex = times.findIndex(t => t === time);

    if (timeIndex !== -1) {
      return temperatures[timeIndex];
    }

    const sortedTimes = times.sort();
    let beforeTimeIndex = -1;
    let afterTimeIndex = -1;

    for (let i = 0; i < sortedTimes.length; i++) {
      if (sortedTimes[i] < time) {
        beforeTimeIndex = i;
      } else if (sortedTimes[i] > time && afterTimeIndex === -1) {
        afterTimeIndex = i;
        break;
      }
    }

    if (beforeTimeIndex !== -1 && afterTimeIndex !== -1) {
      const beforeTime = sortedTimes[beforeTimeIndex];
      const afterTime = sortedTimes[afterTimeIndex];
      const beforeTemp = temperatures[times.indexOf(beforeTime)];
      const afterTemp = temperatures[times.indexOf(afterTime)];

      const proportion = (Date.parse(time) - Date.parse(beforeTime)) / (Date.parse(afterTime) - Date.parse(beforeTime));
      return beforeTemp + proportion * (afterTemp - beforeTemp);
    }

    return 0;
  };


  const downloadPdf = () => {
    if (!plotRef.current) {
      console.error('Plotly component reference is not available.');
      return;
    }

    Plotly.toImage(plotRef.current.el, {
      format: 'png',
      width: 800,
      height: 600
    }).then(function (dataUrl: string) {
      const pdf = new JsPDF({
        orientation: 'portrait',
      });

      // Add a title to the report
      pdf.setFontSize(20);
      pdf.text('Temperature Report', 20, 20);

      // Add a subtitle or description
      pdf.setFontSize(12);
      pdf.text('This report provides an overview of temperature data and events.', 20, 30);

      // Insert the plot image
      pdf.addImage(dataUrl, 'PNG', 10, 40, 280, 210);

      // Add additional text below the image
      pdf.text('Detailed Analysis', 20, 260);
      pdf.setFontSize(10);
      pdf.text('Here you can add more detailed analysis about the temperature trends, observations, and any other relevant information.', 20, 265);

      // Optionally, add a table of data/events
      autoTable(pdf, {
        head: [['Time', 'Temperature', 'Event']],
        body: temperatureData.map((data, index) => [
          data.time,
          data.temperature.toString(),
          events[index] ? events[index].event : 'N/A'
        ]),
        startY: 270,
      });

      pdf.save('temperature-report.pdf');
    }).catch((error: any) => {
      console.error('Error generating plot image:', error);
    });
  };


  const plotData = [
    {
      type: 'scatter',
      mode: 'lines+markers',
      x: temperatureData.map(data => data.time),
      y: temperatureData.map(data => data.temperature),
      name: 'Temperature',
    },
  ];

  const annotations = events.map(event => ({
    x: event.time,
    y: interpolateTemperature(event.time),
    xref: 'x',
    yref: 'y',
    text: event.event,
    showarrow: true,
    arrowhead: 2,
    ax: 0,
    ay: -40,
    bordercolor: '#c7c7c7',
    borderwidth: 2,
    borderpad: 4,
    bgcolor: '#ff7f0e',
    opacity: 0.8
  }));



  return (
    <div className="flex justify-between">
      <Card>
        <CardHeader><CardTitle>Channel Plot:</CardTitle></CardHeader>
        <Plot
          data={plotData}
          layout={{
            xaxis: { type: 'date' },
            annotations: annotations,
            font: {
              family: "Inter",
              size: 12,
              color: "#000"
            }
          }}
          ref={plotRef}
        />
        <Input
          type="string"
          name="time"
          placeholder="Plot Caption"
          value={newEvent.time}
          onChange={handleInputChange}
          className="input-class"
        />
      </Card>
      <Card className="card-class ml-5"><CardHeader><CardTitle>Event Annotations:</CardTitle></CardHeader>
        <div>
          <Input
            type="text"
            name="time"
            placeholder="Time"
            value={newEvent.time}
            onChange={handleInputChange}
            className="input-class"
          />
          <Input
            type="text"
            name="event"
            placeholder="Event"
            value={newEvent.event}
            onChange={handleInputChange}
            className="input-class"
          />
          <Button onClick={addEvent} className="button-class">Add Event</Button>
        </div>
        <Button onClick={downloadPdf} className="button-class">Download as PDF</Button>

      </Card>
    </div>

  );
};

export default TemperaturePlot;
