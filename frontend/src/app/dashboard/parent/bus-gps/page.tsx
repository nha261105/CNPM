import { Navigation, Clock, Bus, Phone, Send, CircleX } from "lucide-react";

export default function BusGp() {
  return (
    <div className="flex flex-row flex-wrap justify-center items-start w-full min-h-full p-[30px] bg-[#f9fafb] gap-5">
      {/* Select Child ----------------------------------------------------------------------------- */}
      <div className="w-full flex flex-col gap-5 p-[20px_30px] bg-[#ffffff] rounded-xl border border-solid border-[#e5e5e5]">
        <div className="text-lg">
          <p>Select Child</p>
        </div>
        <div className="w-full flex flex-row gap-5 flex-wrap">
          <div className="flex flex-col bg-blue-600 rounded-xl min-w-[200px] py-3 justify-center items-center cursor-pointer hover:bg-blue-500">
            <div className="">
              <p className="text-white text-sm">Emma Johnson</p>
              <p className="text-gray-300 text-xs">Grade 5</p>
            </div>
          </div>
          <div className="flex flex-col bg-white border border-gray-300 rounded-xl min-w-[200px] py-3 justify-center items-center cursor-pointer hover:bg-green-500 group">
            <div className="">
              <p className="text-black text-sm group-hover:text-white">Oliver Johnson</p>
              <p className="text-gray-600 text-xs group-hover:text-gray-300">Grade 3</p>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-row justify-start items-center gap-3">
          <div className="w-fit bg-green-600 px-3 py-1 rounded-lg border border-green-600">
            <div className="text-white text-xs font-medium">In Transit</div>
          </div>
          <div className="w-fit bg-white px-3 py-1 rounded-lg border border-[#f0b100]">
            <div className="text-[#a66200] text-xs font-medium">ETA: 3 minutes</div>
          </div>
        </div>
      </div>



      {/* Active Trip ----------------------------------------------------------------------------- */}
      <div className="w-full flex flex-col gap-5 p-[20px_30px] bg-[#ffffff] rounded-xl border border-solid border-[#e5e5e5] border-l-4 border-l-[#155dfc]">
        <div className="text-lg">
          <p>Active Trip - Emma Johnson</p>
        </div>

        <div className="w-full flex flex-row">
          <div className="w-[50%] flex flex-col justify-between gap-2.5">
            <div className="">
              <div className="text-sm text-gray-500">Student</div>
              <div className="text-base">Emma Johnson</div>
            </div>
            <div className="">
              <div className="text-sm text-gray-500">Class</div>
              <div className="text-base">Grade 5, Section A</div>
            </div>
            <div className="">
              <div className="text-sm text-gray-500">Bus Details</div>
              <div className="text-base">BUS001 - Route A</div>
            </div>
          </div>
          <div className="w-[50%] flex flex-col justify-between gap-2.5">
            <div className="">
              <div className="text-sm text-gray-500">Driver</div>
              <div className="text-base">John Smith</div>
            </div>
            <div className="">
              <div className="text-sm text-gray-500">License Number</div>
              <div className="text-base">DL-12345</div>
            </div>
            <div className="">
              <div className="text-sm text-gray-500">Vehicle Number</div>
              <div className="text-base">ABC-1234</div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-row justify-start items-center gap-3">
          <div className="w-fit bg-green-600 px-3 py-1 rounded-lg border border-green-600">
            <div className="text-white text-xs font-medium">In Transit</div>
          </div>
          <div className="w-fit bg-white px-3 py-1 rounded-lg border border-[#f0b100]">
            <div className="text-[#a66200] text-xs font-medium">ETA: 3 minutes</div>
          </div>
        </div>
      </div>

      {/* Real-Time Bus Location ----------------------------------------------------------------------------- */}
      <div className="w-full p-[20px_30px] bg-[#ffffff] rounded-xl border border-solid border-[#e5e5e5] flex flex-col gap-5">
        <div className="text-lg">Real-Time Bus Location</div>
        <div className="rounded-xl border border-dashed border-[#9e9d9d] bg-[#eff7fe]">
          <div className="flex flex-col justify-center items-center gap-5 w-full h-full p-[40px_20px]">
            <div className="">
              <Navigation size="50px" className="text-[#1b61fc]" />
            </div>
            <div className="text-base text-muted-foreground">
              Real-Time GPS Tracking
            </div>
            <div className="text-sm text-muted-foreground max-w-[40%] text-center">
              Track your child&apos;s bus location in real-time with live updates every 10 seconds.
            </div>
            <div className="p-[15px_15px] bg-[#ffffff] flex flex-col gap-[5px] rounded-lg shadow-[rgba(0, 0, 0, 0.24)] shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-[13px] h-[13px] bg-[#1b61fc] rounded-[100%]">
                  <br />
                </div>
                <div className="text-sm">Current: 456 Main Street (Approaching Pine Road)</div>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock color="#1b61fc" className="w-[15px] h-[15px]" />
                <div className="text-sm text-muted-foreground">ETA at your stop: 3 minutes</div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Route Progress ----------------------------------------------------------------------------- */}
      <div className="w-full p-[20px_30px] bg-[#ffffff] rounded-xl border border-solid border-[#e5e5e5] flex flex-col gap-5">
        <div className="text-lg">Route Progress</div>
        <div className="flex flex-col gap-2.5">
          {/* Progress 1 -------------------------------- */}
          <div className="rounded-lg border border-green-500 bg-green-50 p-[15px] flex justify-between items-center gap-[15px]">
            <div className="flex justify-center items-center gap-4.5">
              <div className="flex justify-center items-center rounded-full bg-green-500">
                <div className="w-[45px] h-[45px] flex justify-center items-center text-white text-base">1</div> 
              </div>
              <div className="">
                <div className="text-base">Home - Oak Street</div>
                <div className="text-gray-500 text-sm">07:15 AM</div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="flex justify-center items-center flex-row border border-gray-200 rounded-xl hover:bg-green-500 cursor-pointer group">
                <div className="w-fit bg-green-600 px-3 py-1 rounded-lg border border-green-600">
                  <div className="text-white text-xs font-medium">Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress 2 -------------------------------- */}
          <div className="rounded-lg border border-green-500 bg-green-50 p-[15px] flex justify-between items-center gap-[15px]">
            <div className="flex justify-center items-center gap-4.5">
              <div className="flex justify-center items-center rounded-full bg-green-500">
                <div className="w-[45px] h-[45px] flex justify-center items-center text-white text-base">2</div> 
              </div>
              <div className="">
                <div className="text-base">Maple Avenue</div>
                <div className="text-gray-500 text-sm">07:22 AM</div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="flex justify-center items-center flex-row border border-gray-200 rounded-xl hover:bg-green-500 cursor-pointer group">
                <div className="w-fit bg-green-600 px-3 py-1 rounded-lg border border-green-600">
                  <div className="text-white text-xs font-medium">Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress 3 -------------------------------- */}
          <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-[15px] flex justify-between items-center gap-[15px]">
            <div className="flex justify-center items-center gap-4.5">
              <div className="flex justify-center items-center rounded-full bg-yellow-500">
                <div className="w-[45px] h-[45px] flex justify-center items-center text-white text-base">3</div> 
              </div>
              <div className="">
                <div className="text-base">Pine Road</div>
                <div className="text-gray-500 text-sm">07:28 AM</div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="flex justify-center items-center flex-row border border-gray-200 rounded-xl hover:bg-yellow-500 cursor-pointer group">
                <div className="w-fit bg-yellow-600 px-3 py-1 rounded-lg border border-yellow-600">
                  <div className="text-white text-xs font-medium">Approaching</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress 4 -------------------------------- */}
          <div className="rounded-lg border border-gray-300 bg-white p-[15px] flex justify-between items-center gap-[15px]">
            <div className="flex justify-center items-center gap-4.5">
              <div className="flex justify-center items-center rounded-full bg-gray-300">
                <div className="w-[45px] h-[45px] flex justify-center items-center text-white text-base">4</div> 
              </div>
              <div className="">
                <div className="text-base">Elm Street</div>
                <div className="text-gray-500 text-sm">07:35 AM</div>
              </div>
            </div>
          </div>

          {/* Progress 5 -------------------------------- */}
          <div className="rounded-lg border border-gray-300 bg-white p-[15px] flex justify-between items-center gap-[15px]">
            <div className="flex justify-center items-center gap-4.5">
              <div className="flex justify-center items-center rounded-full bg-gray-300">
                <div className="w-[45px] h-[45px] flex justify-center items-center text-white text-base">1</div> 
              </div>
              <div className="">
                <div className="text-base">School</div>
                <div className="text-gray-500 text-sm">08:00 AM</div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Function ----------------------------------------------------------------------------- */}
      <div className="w-full flex flex-row gap-5">
        <div className="w-full flex flex-row gap-5 flex-wrap">
          {/* Send function */}
          <div className="flex flex-row justify-start items-center flex-1 gap-5 bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:bg-gray-50">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Send 
                className="text-blue-600"
              />
            </div>
            <div className="">
              <p className="text-base">Send Message to Admin</p>
              <p className="text-sm text-gray-500">Request changes or report issues</p>
            </div>
          </div>

          {/* Report function */}
          <div className="flex flex-row justify-start items-center flex-1 gap-5 bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:bg-gray-50">
            <div className="p-3 bg-red-50 rounded-xl">
              <CircleX 
                className="text-red-600"
              />
            </div>
            <div className="">
              <p className="text-base">Report Child Absence</p>
              <p className="text-sm text-gray-500">Remove from today&apos;s route</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contacts ----------------------------------------------------------------------------- */}
      <div className="w-full p-[20px_30px] bg-[#ffffff] rounded-xl border border-solid border-[#e5e5e5] flex flex-col gap-5">
        <div className="text-lg">Emergency Contacts</div>
        <div className="flex flex-col gap-2.5">
          {/* Contact 1 -------------------------------- */}
          <div className="rounded-lg border border-gray-200 bg-white p-[15px] flex justify-between items-center gap-[15px] hover:bg-gray-50">
            <div className="flex justify-center items-center gap-4.5">
              <div className="flex justify-center items-center rounded-full bg-blue-50">
                <Phone 
                  strokeWidth={2}
                  className="text-blue-600 w-[45px] h-[45px] p-3"
                /> 
              </div>
              <div className="">
                <div className="text-base">School Admin Office</div>
                <div className="text-muted-foreground text-sm">Administrator</div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="flex justify-center items-center flex-row border border-gray-200 rounded-xl hover:bg-green-500 cursor-pointer group">
                <div className="flex flex-row justify-center items-center p-2 gap-2">
                  <Phone
                    strokeWidth={2}
                    size={17}
                    className="text-black group-hover:text-white"
                  /> 
                  <div className="text-sm font-medium group-hover:text-white">+1 (555) 123-4567</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact 2 -------------------------------- */}
          <div className="rounded-lg border border-gray-200 bg-white p-[15px] flex justify-between items-center gap-[15px] hover:bg-gray-50">
            <div className="flex justify-center items-center gap-4.5">
              <div className="flex justify-center items-center rounded-full bg-blue-50">
                <Phone 
                  strokeWidth={2}
                  className="text-blue-600 w-[45px] h-[45px] p-3"
                /> 
              </div>
              <div className="">
                <div className="text-base">Transport Coordinator</div>
                <div className="text-muted-foreground text-sm">Coordinator</div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="flex justify-center items-center flex-row border border-gray-200 rounded-xl hover:bg-green-500 cursor-pointer group">
                <div className="flex flex-row justify-center items-center p-2 gap-2">
                  <Phone
                    strokeWidth={2}
                    size={17}
                    className="text-black group-hover:text-white"
                  /> 
                  <div className="text-sm font-medium group-hover:text-white">+1 (555) 234-5678</div>
                </div>
              </div>
            </div>
          </div>

          
          {/* Contact 3 -------------------------------- */}
          <div className="rounded-lg border border-gray-200 bg-white p-[15px] flex justify-between items-center gap-[15px] hover:bg-gray-50">
            <div className="flex justify-center items-center gap-4.5">
              <div className="flex justify-center items-center rounded-full bg-blue-50">
                <Phone 
                  strokeWidth={2}
                  className="text-blue-600 w-[45px] h-[45px] p-3"
                /> 
              </div>
              <div className="">
                <div className="text-base">Emergency Hotline</div>
                <div className="text-muted-foreground text-sm">Emergency</div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <div className="flex justify-center items-center flex-row border border-gray-200 rounded-xl hover:bg-green-500 cursor-pointer group">
                <div className="flex flex-row justify-center items-center p-2 gap-2">
                  <Phone
                    strokeWidth={2}
                    size={17}
                    className="text-black group-hover:text-white"
                  /> 
                  <div className="text-sm font-medium group-hover:text-white">+1 (555) 911-0000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}