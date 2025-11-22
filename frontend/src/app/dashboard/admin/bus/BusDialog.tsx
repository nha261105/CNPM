"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, use } from "react";
import { busService } from "@/service/bus.service";
import { Bus } from "lucide-react";

interface BusDialogProps {
  open: boolean;
  mode: "add" | "edit" | "read";
  initialData: any;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (bus: Bus) => void;
}

interface Bus {
  license_plate_number: string;
  number_of_seats: number;
  status: string;
}

export default function BusDialog({
  open,
  mode,
  onOpenChange,
  onSuccess,
  initialData
}: BusDialogProps) {
  const isRead = mode === "read";

  const [ formData, setFormData ] = useState<Bus>({
    license_plate_number: '',
    number_of_seats: 0,
    status: 'active'
  });

  useEffect(() => {
    if (open && mode === 'add') {
        setFormData({
            license_plate_number: "",
            number_of_seats: 0,
            status: "active",
        });
    } else if (open && mode === 'edit') {
        setFormData({
            license_plate_number: initialData.license_plate_number,
            number_of_seats: initialData.number_of_seats,
            status: initialData.status,
        });
    }
  }, [open, mode]);

  const handelSubmit = async () => {
    if (mode === "add") {
      try {
        const newBus = await busService.addBus(formData);
        if (onSuccess) {
          onSuccess(newBus);
        }
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to add bus:", error);
      }
    } else if (mode === "edit") {
      try {
        const newBus = await busService.updateBus(initialData.bus_id, formData);
        if (onSuccess) {
          onSuccess(newBus);
        }
        onOpenChange(false);
      } catch(error) {

      }
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" && "Thêm xe bus mới"}
            {mode === "edit" && "Chỉnh sửa thông tin xe bus"}
            {mode === "read" && "Xem thông tin xe bus"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* <div className="flex flex-col gap-2">
            <Label>Bus Id</Label>
            <Input name="busid" placeholder="Bus id" disabled={isRead} />
          </div> */}

          <div className="flex flex-col gap-2">
            <Label>Biển số xe</Label>
            <Input name="type" placeholder="Ví dụ: 51B-123.45" disabled={isRead} value={formData.license_plate_number}
              onChange={(e) => setFormData({...formData, license_plate_number: e.target.value})}/>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Số lượng ghế</Label>
            <Input name="seat_count" placeholder="Số lượng" disabled={isRead} value={formData.number_of_seats}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setFormData({...formData, number_of_seats: isNaN(val) ? 0 : val})}}/>
          </div>
          {/* <div className="flex flex-col gap-2">
            <Label>Driver</Label>
            <Select disabled={isRead}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-100 rounded-lg">
                <SelectValue placeholder="Chọn tài xế" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-100 bg-gray-50"></SelectContent>
            </Select>
          </div> */}
          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <Select disabled={isRead}
              onValueChange={(value) => setFormData({...formData, status: value})}
              value={formData.status}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-100 rounded-lg">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-100 bg-gray-50">
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
                <SelectItem value="maintenance">Bảo trì</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!isRead && (
          <div className="flex justify-end mt-4 gap-2">
            <Button onClick={() => onOpenChange(false)} className="bg-red-500">
              Hủy
            </Button>
            <Button className="bg-green-400"
              onClick={handelSubmit}
            >
              {mode === "add" ? "Thêm" : "Lưu"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
