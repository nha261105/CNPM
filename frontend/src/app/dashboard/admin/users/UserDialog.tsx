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
import { use, useEffect, useState } from "react";
import { userService } from "@/service/users.service";
import { CreateUserPayload, User } from "@/service/users.service";

interface UserDialogProps {
  open: boolean;
  mode: "add" | "edit" | "read";
  onOpenChange: (open: boolean) => void;
  onSuccess?: (user: CreateUserPayload) => void;
  initialData?: User;
}

export default function UserDialog({
  open,
  mode,
  onOpenChange,
  onSuccess,
  initialData
}: UserDialogProps) {
  const isRead = mode === "read";
  const [formData, setFormData] = useState<CreateUserPayload>({
    name: '',
    phone_number: '',
    email: '',
    type_user_id: 2
  });

  const handelSubmit = async () => {
    if (mode === "add") {
      try {
        const newUser = await userService.addUser(formData);
        if (onSuccess) {
          onSuccess(newUser);
        }
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to add user:", error);
      }
    } else if (mode === "edit") {
      try {
        const newUser = await userService.updateUser(initialData!.user_id, formData);
        if (onSuccess) {
          onSuccess(newUser);
        }
        onOpenChange(false);
      } catch(error) {
        console.error("Failed to update user:", error);
      }
    }
  }

  useEffect(() => {
    console.log(initialData);
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name,
        phone_number: initialData.phone_number,
        email: initialData.email,
        type_user_id: initialData.type_user_id,
      });
    }
  },[open, mode])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" && "Thêm người dùng mới"}
            {mode === "edit" && "Chỉnh sửa thông tin người dùng"}
            {mode === "read" && "Xem thông tin người dùng"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <div className="flex flex-col gap-2">
            <Label>Full name</Label>
            <Input name="name" onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="full name" disabled={isRead} 
              value={formData.name}/>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input
              name="email"
              placeholder="abcd@gmail.com"
              disabled={isRead}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              value={formData.email}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Phone</Label>
            <Input
              name="phone"
              placeholder="(+84) 019 833 282"
              disabled={isRead}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              value={formData.phone_number}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Role</Label>
            <Select disabled={isRead}
              onValueChange={(value) => setFormData({...formData, type_user_id: value === 'driver' ? 2 : 3})}
              value={formData.type_user_id === 2 ? 'driver' : 'parent'}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-100 rounded-lg">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-100 bg-gray-50">
                <SelectItem value="driver">Tài xế</SelectItem>
                <SelectItem value="parent">Phụ huynh</SelectItem>
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
