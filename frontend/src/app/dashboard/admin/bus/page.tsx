"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash, UserRoundPen, User, Bus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { busService } from "@/service/bus.service";
import BusDialog from "./BusDialog";
export default function ManagerBus() {
  const [buses, setBuses] = useState<any[]>([]);
  const [dialog, setDialog] = useState<{ open: boolean; mode: "add" | "edit" | "read" }>({ open: false, mode: "add" });
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const handleOpen = (mode: "add" | "edit" | "read", bus?: any) => {
    setSelectedBus(bus || null);
    setDialog({ open: true, mode });
  };
  const handleClose = (open: boolean) => {
    setDialog((prev) => ({ ...prev, open }));
  };
  const fetchBuses = async () => {
    try {
      const response = await busService.getBuses();
      setBuses(response);
    } catch (error) {
      console.error("Failed to fetch buses:", error);
    }
  };

  const handleDelete = async (busId: number) => {
    try {
      await busService.deleteBus(busId);
      fetchBuses();
    } catch (error) {
      console.error("Failed to delete bus:", error);
    }
  }

  useEffect(() => {
    fetchBuses();
  }, []);

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
      <div className="space-y-6">
        <Card className="rounded-xl border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>List Bus</CardTitle>
              <Button
                variant={"secondary"}
                className="bg-blue-500 hover:bg-blue-700 hover:text-white"
                onClick={() => handleOpen("add")}
              >
                <Bus />
                Add new Bus
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã Bus</TableHead>
                  <TableHead>Biển số</TableHead>
                  <TableHead>Số lượng ghế</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hoạt động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.map((bus) => (
                  <TableRow key={bus.bus_id}>
                    <TableCell>{bus.bus_id}</TableCell>
                    <TableCell>{bus.license_plate_number}</TableCell>
                    <TableCell className="text-left">
                      {bus.number_of_seats}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={"secondary"}
                        className={cn(
                          "text-white cursor-pointer",
                          bus.status
                            ? "bg-green-500 hover:bg-green-400"
                            : "bg-gray-500 hover:bg-gray-400"
                        )}
                      >
                        {bus.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant={"secondary"}
                        className="hover:bg-orange-400"
                        onClick={() => {handleOpen("edit", bus)}}
                      >
                        <UserRoundPen />
                      </Button>
                      <Button
                        variant={"secondary"}
                        className="hover:bg-red-500"
                        onClick={() => {handleDelete(bus.bus_id)}}
                      >
                        <Trash />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    <BusDialog open={dialog.open} mode={dialog.mode} initialData = {selectedBus} onOpenChange={handleClose} onSuccess={fetchBuses}/>
    </div>
  );
}
