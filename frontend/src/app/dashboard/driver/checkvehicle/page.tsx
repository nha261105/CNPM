"use client";
import { timeStamp } from "console";
import { CircleCheck, CircleCheckBig, TriangleAlert } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
const dataCheck = [
  {
    mission: "Check tire pressure",
  },
  {
    mission: "Check brake functionality",
  },
  {
    mission: "Check lights and signals",
  },
  {
    mission: "Check fuel level",
  },
  {
    mission: "Check mirrors and windows",
  },
  {
    mission: "Check first aid kit",
  },
  {
    mission: "Check fire extinguisher",
  },
];
const VEHICLE_CHECK_KEY = "vehicle_check_completed";
const CheckVehicle = () => {
  //const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    new Array(dataCheck.length).fill(false)
  );
  useEffect(() => {
    const saved = localStorage.getItem(VEHICLE_CHECK_KEY);
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        if (savedData.completed && savedData.items) {
          setCheckedItems(savedData.items);
        }
      } catch (error) {
        console.log("khongo load duoc check xe");
      }
    }
  }, []);
  const handleCheckboxChange = (index: number) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);

    localStorage.setItem(
      VEHICLE_CHECK_KEY,
      JSON.stringify({
        items: newCheckedItems,
        completed: newCheckedItems.every((item) => item),
        timeStamp: new Date().toISOString(),
      })
    );
  };

  const handleCompleteCheck = () => {
    if (allCompleted) {
      localStorage.setItem(
        VEHICLE_CHECK_KEY,
        JSON.stringify({
          items: checkedItems,
          completed: true,
          timeStamp: new Date().toISOString(),
        })
      );
      alert(
        "Kiểm tra xe thành công có thể về lịch trình hiện tại để tiến hành chạy"
      );
    }
  };

  const countCompleted = checkedItems.filter((item) => item).length;
  const allCompleted = countCompleted === dataCheck.length;
  return (
    <section className="flex-1 overflow-y-auto p-8 ">
      <div className="space-y-6 border border-gray-200 rounded-lg bg-white">
        <div className="flex flex-col gap-7 p-6">
          <p className="text-xl font-medium">Pre-Trip Vehicle Verification</p>
          <div className="bg-yellow-50 flex flex-row gap-4 items-center rounded-xl p-5 border border-l-5 border-l-yellow-500 border-yellow-50">
            <TriangleAlert className="text-yellow-600" />
            <p className="text-xl">
              Vehicle check must be completed before starting route
            </p>
          </div>
          <div className="flex flex-col gap-6 justify-start">
            {dataCheck.map((item, index) => (
              <div
                key={index}
                className="border border-gray-300 p-4 flex flex-row gap-3 rounded-xl items-center hover:bg-gray-50 transition-all cursor-pointer group"
                onClick={() => handleCheckboxChange(index)}
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checkedItems[index]}
                    onChange={() => handleCheckboxChange(index)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                      checkedItems[index]
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300 group-hover:border-blue-400"
                    }`}
                  >
                    {checkedItems[index] && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center w-full">
                  <p
                    className={`text-lg font-normal ${
                      checkedItems[index]
                        ? "line-through text-gray-400"
                        : "text-gray-900"
                    }`}
                  >
                    {item.mission}
                  </p>
                  {checkedItems[index] ? (
                    <CircleCheck size={24} className="text-green-600" />
                  ) : (
                    ""
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            className={`rounded-xl transition-all ${
              allCompleted
                ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            disabled={!allCompleted}
          >
            <div className="flex flex-row justify-center items-center gap-4 p-2 ">
              <CircleCheckBig color="white" />
              <p className="text-lg text-white font-semibold">
                Complete Vehicle Check
              </p>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CheckVehicle;
