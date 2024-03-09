"use client";

import React, { useState, useRef, useEffect } from 'react';
import Plot from 'react-plotly.js';
import JsPDF from 'jspdf';
import Plotly, { Annotations } from 'plotly.js-basic-dist';
import autoTable from 'jspdf-autotable';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDown } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Channel } from 'diagnostics_channel';
import { select } from 'd3';
import { Check } from 'lucide-react';
import Papa from 'papaparse';
import { ScatterData } from 'plotly.js';
import { HelpCircle } from 'lucide-react';





interface ChannelData {
  time: number;
  [key: string]: number;
}

interface ChannelEvent {
  time: number;
  eventName: string;
}

interface ChannelAnnotationsIndex {
  [key: string]: ChannelEvent[]
}




export default function PlotComponent() {
  const [channelData, setChannelData] = useState<ChannelData[]>([{
    time: 0,
    "No file": 0,
  }]);
  const [events, setEvents] = useState<ChannelAnnotationsIndex>({});
  const [globalEvents, setGlobalEvents] = useState<ChannelEvent[]>([]);
  const [newEvent, setNewEvent] = useState<{ time: string; event: string }>({ time: '', event: '' });
  const [profile, setProfile] = useState<{ reportName: string; authorName: string }>({ reportName: '', authorName: '' });
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const channels = Object.keys(channelData[0]).filter(key => key !== 'time');
  const plotRef = useRef<any>(null);
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  const [captions, setCaptions] = useState<{ [channel: string]: string }>({});





  const plotData: Partial<ScatterData>[] = [
    {
      type: 'scatter',
      mode: 'lines+markers',
      x: channelData.map(data => data.time),
      y: channelData.map(data => data[selectedChannel]),
      name: selectedChannel.charAt(0).toUpperCase() + selectedChannel.slice(1),
      line: { color: '#5f7897' },
      marker: { color: '#5f7897' }
    }
  ];

  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setChannelData([{
      time: 0,
      "No file": 0,
    }]);

    Papa.parse<ChannelData>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data;
        const fields = result.meta.fields;

        // Check if "time" is the first column
        const isTimeFirstColumn = fields && fields[0] === 'time';

        // Check for more than 500 rows
        const isRowLimitExceeded = data.length > 150;

        // Check for more than 18 columns
        const isColumnLimitExceeded = fields && fields.length > 18;

        // Ensure every entry after the header can be parsed to a number
        const isDataValid = data.every(d =>
          Object.keys(d).every(key =>
            !isNaN(Number(d[key]))
          )
        );

        if (isTimeFirstColumn && !isRowLimitExceeded && !isColumnLimitExceeded && isDataValid) {
          const firstNonTimeField = fields?.find(field => field !== 'time');
          if (firstNonTimeField) {
            setSelectedChannel(firstNonTimeField);
          }
          setIsFileUploaded(true); // Set to true if file is successfully processed
          setChannelData(data);
          setEvents({});
          setGlobalEvents([]);
          setCaptions({});
        } else {
          setChannelData([{
            time: 0,
            "No file": 0,
          }]);
          setIsFileUploaded(false);
          alert('Invalid CSV format. Ensure the file meets the specified criteria. For more information, click the Help button (?)');
        }
      },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const addChannelEvent = () => {
    if (newEvent.time && newEvent.event) {
      if (Number.isNaN(Number(newEvent.time))) {
        alert('Time field is not a number.');
        return;
      }
      const updatedEvents = { ...events };
      // get current channel events by indexing events copy with channel name
      const currentChannelEvents = updatedEvents[selectedChannel] || [];
      let channelEvent: ChannelEvent = {
        time: Number(newEvent.time),
        eventName: newEvent.event
      };
      updatedEvents[selectedChannel] = [...currentChannelEvents, channelEvent];
      setEvents(updatedEvents);
      setNewEvent({ time: '', event: '' });
    } else {
      alert('Time field is not a number.');
    }
  };


  const addGlobalEvent = () => {
    if (newEvent.time && newEvent.event) {
      if (Number.isNaN(Number(newEvent.time))) {
        alert('Please fill in all fields.');
        return;
      }
      let channelEvent = {
        time: Number(newEvent.time),
        eventName: newEvent.event
      };
      const updatedGlobalEvents = [...globalEvents, channelEvent];
      setGlobalEvents(updatedGlobalEvents);
      setNewEvent({ time: '', event: '' });
    } else {
      alert('Please fill in all fields.');
    }
  };

  const deleteChannelEvent = (eventNameToDelete: string) => {
    if (events[selectedChannel]) {
      const updatedChannelEvents = events[selectedChannel].filter(event => event.eventName !== eventNameToDelete);
      const updatedEvents = { ...events, [selectedChannel]: updatedChannelEvents };
      setEvents(updatedEvents);
    } else {
    }
  };

  const deleteGlobalEvent = (eventNameToDelete: string) => {
    console.log(`Attempting to delete global event with name: ${eventNameToDelete}`);
    const updatedGlobalEvents = globalEvents.filter(event => event.eventName !== eventNameToDelete);
    setGlobalEvents(updatedGlobalEvents);
    console.log(`Global event deleted successfully. Updated global events: `, updatedGlobalEvents);
  };



  function interpolateValue(time: number, channel: string): number {
    const times = channelData.map(data => data.time);
    const values = channelData.map(data => data[channel as keyof typeof data]);
    const timeIndex = times.findIndex(t => t === time);
    if (timeIndex !== -1) {
      return values[timeIndex];
    }
    let beforeTimeIndex = -1;
    let afterTimeIndex = -1;
    for (let i = 0; i < times.length; i++) {
      if (times[i] < time) {
        beforeTimeIndex = i;
      } else if (times[i] > time && afterTimeIndex === -1) {
        afterTimeIndex = i;
        break;
      }
    }
    if (beforeTimeIndex !== -1 && afterTimeIndex !== -1) {
      const beforeTime = times[beforeTimeIndex];
      const afterTime = times[afterTimeIndex];
      const beforeValue = values[beforeTimeIndex];
      const afterValue = values[afterTimeIndex];
      const proportion = (time - beforeTime) / (afterTime - beforeTime);
      return beforeValue + (proportion * (afterValue - beforeValue));
    }
    return Math.min(...values);
  }

  const downloadPdf = () => {
    if (channelData.length === 0 || !channelData[0]) {
      console.error('Channel data is empty or contains null/undefined values.');
      return;
    }

    const channels = Object.keys(channelData[0]).filter(key => key !== 'time');

    const getAnnotations = (channel: string): Partial<Annotations>[] => {
      const annotations = events ? events[channel]?.map(event => ({
        x: event.time,
        y: interpolateValue(event.time, channel),
        text: event.eventName,
        showarrow: true,
        arrowhead: 3,
        ax: 0,
        ay: -80,
        bordercolor: '#64748b',
        bgcolor: '#64748b',
        font: {
          family: 'Inter',
          size: 20,
          color: 'white',
        },
        borderwidth: 2,
        borderpad: 4,
        opacity: 1.0
      })) || [] : [];


      const criticalAnnotations = globalEvents?.map(event => ({
        x: event.time,
        y: interpolateValue(event.time, channel),
        text: event.eventName,
        showarrow: true,
        arrowhead: 3,
        ax: 0,
        ay: -80,
        bordercolor: '#fa7316',
        bgcolor: '#fa7316',
        font: {
          family: 'Inter',
          size: 20,
          color: 'white',
        },
        borderwidth: 2,
        borderpad: 4,
        opacity: 1.0
      })) || [];

      const total = [...annotations, ...criticalAnnotations];

      return total
    }

    const plotsData: Plotly.Data[] = channels.map((channel: string) => {
      return {
        x: channelData.map(data => data.time),
        y: channelData.map(data => data[channel]),
        type: 'scatter',
        mode: 'lines+markers',
        name: channel,
        line: { color: '#5f7897', width: 6 },
        marker: { color: '#5f7897', size: 12 },
      };
    });

    const plotWidth = 1200;
    const plotHeight = 800;

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const yGap = 20;
    const scaleDown = .075;

    const plotsLayout = (channelName: string | undefined) => ({
      font: {
        family: "Inter",
        size: 24,
      },
      margin: { l: 50, r: 20, t: 20, b: 40 },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      annotations: channelName ? getAnnotations(channelName) : []
    });

    const plotPromises = plotsData.map((data, index) => {
      const plotId = `hidden-plot-${index}`;
      const plotDiv = document.createElement('div');
      plotDiv.id = plotId;
      plotDiv.style.display = 'none';
      document.body.appendChild(plotDiv);


      return Plotly.newPlot(plotId, [data], plotsLayout(data.name), { displayModeBar: false })
        .then(() => Plotly.toImage(plotId, { format: 'png', width: plotWidth, height: plotHeight }))
        .then((dataUrl: string) => {
          plotDiv.remove();
          return { imageUrl: dataUrl, title: data.name };
        });
    });

    Promise.all(plotPromises)
      .then(imageDataArray => {
        const pdf = new JsPDF({
          orientation: 'portrait',
        });
        let yOffset = margin + 30;
        let page = 1;
        imageDataArray.forEach(({ imageUrl, title }, index) => {
          if (index > 0 && index % 2 === 0) {
            yOffset += (plotHeight * scaleDown) + yGap;
          }

          if (yOffset + (plotHeight * scaleDown) + yGap > pageHeight - margin) {
            pdf.addPage();
            yOffset = margin + 30;
            page++;
          }


          const xOffset = margin + (index % 2) * ((plotWidth * scaleDown) + margin);
          pdf.addImage(imageUrl, 'PNG', xOffset, yOffset, (plotWidth * scaleDown), plotHeight * (scaleDown)); // Resize image to fit on the page

          pdf.setFontSize(14);
          pdf.text(`${title}`, xOffset, yOffset - 2);

          pdf.setFontSize(6);
          pdf.text(title ? (captions[title] || "") : "", xOffset, yOffset + 6 + (plotHeight * scaleDown));

          if (index === 0) {
            pdf.setFontSize(24);
            pdf.text(`${profile.reportName ? profile.reportName : "Anomaly Report:"}`, margin, margin + 5);
            pdf.setFontSize(12);
            if (profile.authorName != "") {
              pdf.text("Report Prepared by: " + `${profile.authorName}`, margin, margin + 12);
            }
          }
        });
        pdf.save(`anomaly-report.pdf`);
      })
      .catch((error: any) => {
        console.error('Error generating plot images:', error);
      });
  };

  const channelAnnotations = events ? events[selectedChannel]?.map(event => ({
    x: event.time,
    y: interpolateValue(event.time, selectedChannel),
    xref: 'x',
    yref: 'y',
    text: event.eventName,
    showarrow: true,
    arrowhead: 3,
    ax: 0,
    ay: -40,
    bordercolor: '#64748b',
    bgcolor: '#64748b',
    font: {
      family: 'Inter',
      size: 10,
      color: 'white',
    },
    borderwidth: 1,
    borderpad: 4,
    opacity: 1.0
  })) || [] : [];


  const globalAnnotations = globalEvents?.map(event => ({
    x: event.time,
    y: interpolateValue(event.time, selectedChannel),
    xref: 'x',
    yref: 'y',
    text: event.eventName,
    showarrow: true,
    arrowhead: 3,
    ax: 0,
    ay: -40,
    bordercolor: '#fa7316',
    bgcolor: '#fa7316',
    font: {
      family: 'Inter',
      size: 10,
      color: 'white',
    },
    borderwidth: 1,
    borderpad: 4,
    opacity: 1.0
  })) || [];

  const combinedAnnotations = [...channelAnnotations, ...globalAnnotations];

  const handleReportNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, reportName: event.target.value });
  };

  const handleAuthorNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, authorName: event.target.value });
  };

  const handleCaptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Update the captions object with the new caption for the selected channel
    setCaptions({ ...captions, [selectedChannel]: event.target.value });
  };



  return (
    <div>
      <Card className='mb-3 p-2'>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Input type="file" className='w-[250px]' accept=".csv" onChange={handleFileUpload} />
          </div>

          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger><Button variant="outline">   Edit Details  <ChevronDown className='ml-1 h-4 w-4' /></Button></PopoverTrigger>
              <PopoverContent className='w-[400px] p-4'>
                <div className='mr-8'>
                  <h1 className='ml-2 font-semibold text-xl mb-3'>Report Details:</h1>
                  <h1 className='ml-2 font-semibold'>Report Name:</h1>
                  <Input
                    value={profile.reportName}
                    onChange={handleReportNameChange}
                    placeholder='Report Name' className="ml-2 mt-2 mb-2 mr-4"></Input>
                  <h1 className='ml-2 font-semibold'>Report Author:</h1>
                  <Input
                    value={profile.authorName}
                    onChange={handleAuthorNameChange}
                    placeholder='Author Name' className="ml-2 mt-2 mb-2 mr-4"></Input></div>
              </PopoverContent>
            </Popover>
            <Button onClick={downloadPdf} disabled={!isFileUploaded} className="ml-2 mr-2 button-class">Download Report</Button>
            <div className=''>
              <Popover>
                <PopoverTrigger><Button variant="outline" className=''>    <HelpCircle className='h-4 w-4' /></Button></PopoverTrigger>
                <PopoverContent className='w-[400px] p-4'>
                  <div className='mr-8'>
                    <h1 className='ml-4 mb-2 text-xl font-semibold'>Help/FAQs:</h1>
                    <h2 className='ml-4 font-semibold'>What is this?</h2>
                    <h3 className='ml-4 mb-4 text-sm'>This is a webapp to help you build PDF reports to explain or examine anomalies.</h3>
                    <h1 className='ml-4 font-semibold'>How do I use it?</h1>
                    <h3 className='ml-4 mb-4 text-sm'>First, upload a .csv file. Then, you can add annotations to specific channels, or label events that are important on all channels. Finally, you can download a pdf report with all of the plots and labels you added.  </h3>
                    <h1 className='ml-4 font-semibold'>What should my data look like?</h1>
                    <h3 className='ml-4 mb-4 text-sm'>Your .csv file should have a first column called times and up to 9 additional columns / 100 additional rows of data. All column data must be numbers, except for the first row, which will be the channel name. </h3>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </Card>
      <Card className='p-4'>
        <div className="flex">
          <div className='h-[550px]'>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Channel Plot:</CardTitle>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger disabled={!isFileUploaded}><Button variant="outline" disabled={!isFileUploaded} >{selectedChannel} <ChevronDown className='ml-1 h-4 w-4' /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {channels.map(channel => (
                        <DropdownMenuItem key={channel} onSelect={() => setSelectedChannel(channel)}>
                          {channel}
                          {selectedChannel === channel && <Check className='h-4 w-4 ml-1' />
                          }
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>


                </div>

              </div>

            </CardHeader>
            {
              isFileUploaded ? (
                <Plot
                  data={plotData.map(trace => ({
                    ...trace,
                    line: { ...trace.line, color: '#415368' },
                    marker: { ...trace.marker, color: '#415368' }
                  }))}
                  layout={{
                    xaxis: { type: 'linear' },
                    annotations: combinedAnnotations as Partial<Annotations>[],
                    font: {
                      family: "Inter",
                      size: 12,
                    },
                    margin: { l: 50, r: 20, t: 20, b: 20 },
                  }}
                  config={{ displayModeBar: false }}
                  ref={plotRef}
                  className="w-[600px] h-[400px]"
                />
              ) : (
                <div className="flex justify-center items-center ml-7 w-[600px] h-[400px]" style={{ backgroundColor: '#f2f5f9' }}>
                  <span className="text-gray-500">Upload a CSV file to begin annotating.</span>
                </div>
              )
            }

            <Input
              type="text" // The correct type for text inputs is "text", not "string"
              name="time"
              placeholder="Plot Caption"
              className="input-class ml-7 mt-2 w-[600px] mb-5"
              disabled={!isFileUploaded}
              value={captions[selectedChannel] || ''} // Display the current caption if available
              onChange={handleCaptionChange}
            />

          </div>

          <div className="card-class flex ml-5 w-[400px] h-[550px]">
            <Tabs defaultValue="events" className="w-[400px] mr-4 mt-6">
              <TabsList className='w-[400px] text-xl'>
                <TabsTrigger value="events" className='w-[200px]'><div className='w-5 h-2.5 bg-[#fa7316] mr-2 rounded-sm'></div>Global Events</TabsTrigger>
                <TabsTrigger value="annotations" className='w-[200px]'><div className='w-5 h-2.5 bg-[#64748b] mr-2 rounded-sm'></div>Channel Events</TabsTrigger>
              </TabsList>
              <TabsContent value="events">
                <CardDescription className='ml-3 mt-4 mb-4'>Label global events here. These annotations will be visible on all channel plots.</CardDescription>
                <div className="">
                  <ScrollArea className=" w-150 h-[354px] rounded-md border-0 mr-5">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Time</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead className="w-[50px]">Options</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {
                          globalEvents?.map((event, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{event.time}</TableCell>
                              <TableCell>{event.eventName}</TableCell>
                              <TableCell>
                                <Button variant="outline" className='m-1'>
                                  <Trash2 className='h-4 w-4' onClick={() => deleteGlobalEvent(event.eventName)} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  <div className="flex items-center space-x-2 p-3">
                    <Input
                      type="number"
                      name="time"
                      placeholder="Time"
                      value={newEvent.time}
                      onChange={handleInputChange}
                      className="input-class w-[100px]"
                      disabled={!isFileUploaded}
                    />
                    <Input
                      type="text"
                      name="event"
                      placeholder="Event"
                      value={newEvent.event}
                      onChange={handleInputChange}
                      className="input-class w-[200px]"
                      disabled={!isFileUploaded}
                    />
                    <Button onClick={addGlobalEvent} disabled={!isFileUploaded} variant="outline" className="button-class">
                      Add
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="annotations">
                <CardDescription className='ml-3 mt-4 mb-4'>Add annotations to specific channels here. These labels will only appear on the {isFileUploaded ? `${selectedChannel}` : "selected"} plot.</CardDescription>
                <div className="">
                  <ScrollArea className=" w-150 h-[354px] rounded-md border-0 mr-5">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Time</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead className="w-[50px]">Options</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {
                          events[selectedChannel]?.map((event, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{event.time}</TableCell>
                              <TableCell>{event.eventName}</TableCell>
                              <TableCell>
                                <Button variant="outline" className='m-1'>
                                  <Trash2 className='h-4 w-4' onClick={() => deleteChannelEvent(event.eventName)} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  <div className="flex items-center space-x-2 p-3">
                    <Input
                      type="text"
                      name="time"
                      placeholder="Time"
                      value={newEvent.time}
                      onChange={handleInputChange}
                      className="input-class w-[100px]"
                      disabled={!isFileUploaded}
                    />
                    <Input
                      type="text"
                      name="event"
                      placeholder="Event"
                      value={newEvent.event}
                      onChange={handleInputChange}
                      className="input-class w-[200px]"
                      disabled={!isFileUploaded}
                    />
                    <Button onClick={addChannelEvent} disabled={!isFileUploaded} variant="outline" className="button-class">
                      Add
                    </Button>
                  </div>
                </div>

              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>

  );
};