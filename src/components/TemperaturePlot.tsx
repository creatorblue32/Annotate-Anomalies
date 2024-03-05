import React, { useRef } from 'react';
import Plot from 'react-plotly.js';
import JsPDF from 'jspdf';

interface TemperatureEvent {
  time: string;
  event: string;
}

interface Props {
  temperatureData: Array<{ time: string; temperature: number }>;
  events: TemperatureEvent[];
}

const TemperaturePlot: React.FC<Props> = ({ temperatureData, events }) => {
  const plotRef = useRef<any>(null);

  const downloadPdf = () => {
    const plotElement = plotRef.current.el;

    window.Plotly.toImage(plotElement, {
      format: 'png',
      width: 800,
      height: 600
    }).then(function(dataUrl: string) {
      const pdf = new JsPDF({
        orientation: 'landscape',
      });
      pdf.addImage(dataUrl, 'PNG', 10, 10, 280, 210);
      pdf.save('plot.pdf');
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
    y: 0,
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
    bgcolor: '#00000',
    opacity: 0.8,
    font: 'Inter'
  }));

  return (
    <div>
      <Plot
        data={plotData}
        layout={{
          title: 'Temperature and Events Over Time',
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
      <button onClick={downloadPdf}>Download as PDF</button>
    </div>
  );
};

export default TemperaturePlot;
