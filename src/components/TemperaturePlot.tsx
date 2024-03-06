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

interface Props {
  channelData: Array<ChannelData>;
}



const TemperaturePlot: React.FC<Props> = ({ channelData }) => {

  const [events, setEvents] = useState<ChannelAnnotationsIndex>({});

  const [newEvent, setNewEvent] = useState<{ time: string; event: string }>({ time: '', event: '' });

  const [selectedChannel, setSelectedChannel] = useState<string>('');

  const channels = Object.keys(channelData[0]).filter(key => key !== 'time');

  const plotRef = useRef<any>(null);





  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel]);




  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const addEvent = () => {
    if (newEvent.time && newEvent.event) {
      const updatedEvents = { ...events };
      // get current channel events by indexing events copy with channel name
      const currentChannelEvents = updatedEvents[selectedChannel] || [];
      let channelEvent: ChannelEvent = {
        time: Number(newEvent.time),
        eventName: newEvent.event
      };
      updatedEvents[selectedChannel] = [...currentChannelEvents, channelEvent];
      setEvents(updatedEvents);
      setNewEvent({ time: '', event: '' }); // Reset newEvent state
    } else {
      alert('Please fill in all fields.');
    }
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

      pdf.setFontSize(20);
      pdf.text('Temperature Report', 20, 20);

      pdf.setFontSize(12);
      pdf.text('This report provides an overview of temperature data and events.', 20, 30);

      pdf.addImage(dataUrl, 'PNG', 10, 40, 280, 210);

      pdf.text('Detailed Analysis', 20, 260);
      pdf.setFontSize(10);
      pdf.text('Here you can add more detailed analysis about the temperature trends, observations, and any other relevant information.', 20, 265);

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
      x: channelData.map(data => data.time),
      y: channelData.map(data => data[selectedChannel]),
      name: selectedChannel.charAt(0).toUpperCase() + selectedChannel.slice(1),
    },
  ];

  const annotations = events ? events[selectedChannel]?.map(event => ({
    x: event.time,
    y: interpolateValue(event.time, selectedChannel),
    xref: 'x',
    yref: 'y',
    text: event.eventName,
    showarrow: true,
    arrowhead: 3,
    ax: 0,
    ay: -40,
    bordercolor: '#c7c7c7',
    borderwidth: 1,
    borderpad: 4,
    opacity: 0.8
  })) || [] : [];




  return (
    <div>
      <Card className='mb-3 p-2'>
        <div className="flex justify-between items-center">
          <Button variant="outline">Upload File</Button>
          <div>
            <Popover>
              <PopoverTrigger><Button variant="outline">   Edit Details  <ChevronDown className='ml-1 h-4 w-4' /></Button></PopoverTrigger>
              <PopoverContent className='w-[400px]'>
                <Input placeholder='Company Name' className="m-4"></Input>
                <Input placeholder='Author Name' className="m-4"></Input>
              </PopoverContent>
            </Popover>
            <Button onClick={downloadPdf} className="ml-2 button-class">Download Report</Button>
          </div>
        </div>
      </Card>
      <Card className='p-4'>
        <div className="flex">
          <div>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Channel Plot:</CardTitle>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger><Button variant="outline">{selectedChannel} <ChevronDown className='ml-1 h-4 w-4' /></Button></DropdownMenuTrigger>
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
            <Plot
              data={plotData.map(trace => ({
                ...trace,
                line: { ...trace.line, color: '#3a845e' },
                marker: { ...trace.marker, color: '#3a845e' }
              })) as Data[]}
              layout={{
                xaxis: { type: 'linear' },
                annotations: annotations as Partial<Annotations>[],
                font: {
                  family: "Inter",
                  size: 12,
                  color: "#000"
                },
                margin: { l: 50, r: 20, t: 20, b: 20 }
              }}
              ref={plotRef}
            />
            <Input
              type="string"
              name="time"
              placeholder="Plot Caption"
              className="input-class ml-4 w-[650px] mb-5"
            />
          </div>

          <div className="card-class ml-5 w-[400px]">
            <Tabs defaultValue="account" className="w-[400px] mr-4 mt-6">
              <TabsList className='w-[400px] text-xl'>
                <TabsTrigger value="account" className='w-[200px]'>Critical Events</TabsTrigger>
                <TabsTrigger value="password" className='w-[200px]'>Annotations</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <CardDescription className='ml-3 mt-4 mb-4'>Make channel-specific annotations here:</CardDescription>
                <div>
                  <ScrollArea className="h-72 w-150 rounded-md border-0 mr-5">
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
                                  <Trash2 className='h-4 w-4' />
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
                    />
                    <Input
                      type="text"
                      name="event"
                      placeholder="Event"
                      value={newEvent.event}
                      onChange={handleInputChange}
                      className="input-class w-[200px]"
                    />
                    <Button onClick={addEvent} variant="outline" className="button-class">
                      Add
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="password">Change your password here.</TabsContent>
            </Tabs>

          </div>

        </div>
      </Card>

    </div>

  );
};

export default TemperaturePlot;
