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
import { useEffect, useState } from "react";
import { routeService } from "@/service/route.service";
import { Route as RouteType } from "@/service/route.service";
import { pickupService } from "@/service/pickup_point.service";
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Trash, ArrowUp, ArrowDown, Plus, Route } from "lucide-react";
import { Value } from "@radix-ui/react-select";


interface RouteDialogProps {
  open: boolean;
  mode: "add" | "edit" | "read";
  onOpenChange: (open: boolean) => void;
  onSuccess?: (route: RouteType) => void;
  intialData?: any;
}

export default function RouteDialog({
  open,
  mode,
  onOpenChange,
  onSuccess,
  intialData,
}: RouteDialogProps) {
  const isRead = mode === "read";

  const [ formData, setFormData] = useState<RouteType>({
    route_name: '',
    status: 'active',
    pickup_points: []
  });

  interface PickupPoint {
    pickup_point_id: number,
    description: string
  }

  const [ pickup, setPickup] = useState<PickupPoint[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<PickupPoint[]>([]);
  const [currentPointId, setCurrentPointId] = useState<string>("");

  const fetchData = async () => {
    try {
      const data = await pickupService.getAllPickup();
      console.log(data);
      const formattedData = data.map((item) => ({
          pickup_point_id: item.pickup_point_id,   
          description: item.description
      }));
      setPickup(formattedData);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
    }
  }

  const handelAddPoint = () => {
    if(!currentPointId) return;

    const exists = selectedPoints.find((p) => p.pickup_point_id.toString() === currentPointId);
    if (exists) {
      alert("Điểm này đã có trong lộ trình rồi!");
      return;
    }

    const pointToAdd = pickup.find(
      (p) => p.pickup_point_id.toString() === currentPointId
    );
    
    if (pointToAdd) {
      setSelectedPoints([...selectedPoints, pointToAdd]);
      setCurrentPointId("");
    }
  }

  const handleRemovePoint = (id: number) => {
    setSelectedPoints(selectedPoints.filter((p) => p.pickup_point_id !== id));
  };
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPoints = [...selectedPoints];
    [newPoints[index - 1], newPoints[index]] = [newPoints[index], newPoints[index - 1]];
    setSelectedPoints(newPoints);
  };

  const moveDown = (index: number) => {
    if (index === selectedPoints.length - 1) return;
    const newPoints = [...selectedPoints];
    [newPoints[index + 1], newPoints[index]] = [newPoints[index], newPoints[index + 1]];
    setSelectedPoints(newPoints);
  };

  const handelSubmit = async () => { 
    const payload = {
        route_name: formData.route_name,
        status: formData.status,
        pickup_points: selectedPoints.map(p => p.pickup_point_id) 
    };
    if (mode === "add") {
      try {
        const payload = {
            ...formData,
            pickup_points: selectedPoints.map(p => p.pickup_point_id) 
        };
        const newRoute = await routeService.addRoute(payload);
        
        if (onSuccess) onSuccess(newRoute);
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to add route:", error);
      }
    } else if (mode === "edit") {
      try {
        const newRoute = await routeService.updateRoute(intialData.route_id, payload);
        if (onSuccess) onSuccess(newRoute);
        onOpenChange(false);
      } catch(error) {
        console.error("Failed to edit route:", error);
      }
    }
  }

  useEffect(() => {
    if (mode == "edit") {
      setFormData(intialData);
      const currentPoints = intialData.pickup_points || [];

      setSelectedPoints(
        pickup.filter((p) => currentPoints.includes(p.pickup_point_id))
      );
    } else {
      setFormData({
        route_name: '',
        status: 'active',
        pickup_points: []
      });
      setSelectedPoints([]);
    }
    fetchData();
  }, [open, mode])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" && "Thêm Tuyến mới"}
            {mode === "edit" && "Chỉnh sửa thông tin tuyến"}
            {mode === "read" && "Xem thông tin tuyến"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <div className="flex flex-col gap-2">
            <Label>Route name</Label>
            <Input name="route name" placeholder="Route..." disabled={isRead} onChange={(e) => setFormData({...formData, route_name: e.target.value})}
              value = {formData.route_name}/>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Status </Label>
            <Select disabled={isRead} onValueChange={value => setFormData({...formData, status: value})} value = {formData.status}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-100 rounded-lg">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-100 bg-gray-50">
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Các điểm dừng</Label>
            <div className="flex gap-2 items-end">
              <Select onValueChange={setCurrentPointId}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Chọn điểm đón --" />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-gray-100 bg-gray-50 max-h-[200px] overflow-y-auto">
                  {pickup.map((p) => (
                    <SelectItem key={p.pickup_point_id} value={p.pickup_point_id.toString()}>
                      {p.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handelAddPoint}>
                Thêm điểm
              </Button>
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">TT</TableHead>
                    <TableHead>Tên điểm dừng</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPoints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        Chưa có điểm dừng nào. Hãy thêm điểm ở trên.
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedPoints.map((point, index) => (
                      <TableRow key={point.pickup_point_id}>
                        <TableCell className="font-bold">{index + 1}</TableCell>
                        <TableCell className="text-gray-500 text-sm">{point.description}</TableCell>
                        <TableCell className="text-right flex justify-end gap-1">
                          {/* Nút Lên */}
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>

                          {/* Nút Xuống */}
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => moveDown(index)}
                            disabled={index === selectedPoints.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>

                          {/* Nút Xóa */}
                          <Button
                            variant="ghost" size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemovePoint(point.pickup_point_id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {!isRead && (
          <div className="flex justify-end mt-4 gap-2">
            <Button onClick={() => onOpenChange(false)} className="bg-red-500">
              Hủy
            </Button>
            <Button className="bg-green-400" onClick={handelSubmit}>
              {mode === "add" ? "Thêm" : "Lưu"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
