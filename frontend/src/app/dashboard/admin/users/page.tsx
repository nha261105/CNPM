"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, UserRoundPen, Trash } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserDialog from "./UserDialog";
import { useEffect, useState } from "react";
// import { User } from "@/types/auth";
import { userService } from "@/service/users.service";
import { User as UserType } from "@/service/users.service";

export default function ManagerUsers() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null); 

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const getConvertedStatus = (status: string) => {
    return status == "active" ? "Active" : "Inactive";
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "add" | "edit" | "read";
  }>({ open: false, mode: "add" });
  const handleOpen = (mode: "add" | "edit" | "read", user?: UserType) => {
    setSelectedUser(user || null);
    setDialog({ open: true, mode });
  };
  const handleClose = (open: boolean) => {
    setDialog((prev) => ({ ...prev, open }));
  };
  const handelDelete = async (id: number) => {
    try {
      await userService.deleteUser(id);
      fetchUsers();
    } catch(error) {
      console.error("Failed to delete user:", error);
    }
  }

  const filteredUsers = users.filter((user) => {
    const user_name = user.name ? user.name.toLowerCase() : '';
    const user_email = user.email ? user.email.toLowerCase() : '';
    const matchesSearch = user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user_email.toLowerCase().includes(searchTerm.toLowerCase()); 
    const matchesType = searchType === 'all' || user.type_user_name === searchType;
    return matchesSearch && matchesType;
  })

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="space-y-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center-safe">
                <CardTitle>User</CardTitle>
                <InputGroup className="border-gray-300 ">
                  <InputGroupInput
                    placeholder="Tìm kiếm theo...."
                    className="focus:outline-none focus:border-none w-96"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <InputGroupAddon align={"inline-end"}>
                    <InputGroupButton
                      variant={"secondary"}
                      className="bg-gray-300"
                    >
                      tìm kiếm
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                <div>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-[180px] bg-gray-50 border-gray-100 rounded-lg shadow-sm transition-all duration-200 hover:border-gray-200">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg shadow-xl border-gray-100 bg-gray-50">
                      <SelectItem value="all">Chọn vai trò</SelectItem>
                      <SelectItem value="driver">Tài xế</SelectItem>
                      <SelectItem value="parent">Phụ huynh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                variant={"secondary"}
                className="bg-blue-500 hover:text-white hover:bg-blue-700 hover:shadow-xl"
                onClick={() => handleOpen("add")}
              >
                <User /> Add new User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Chức vụ</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.type_user_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={"secondary"}
                        className={getConvertedStatus(user.account_status) ? "bg-green-400" : "bg-gray-400"}
                      >
                        {getConvertedStatus(user.account_status) ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant={"secondary"}
                        className="hover:bg-orange-300 border border-gray-300"
                        onClick={() => handleOpen("edit", user)}
                      >
                        <UserRoundPen />
                      </Button>
                      <Button
                        variant={"secondary"}
                        className="hover:bg-red-500 border border-gray-300"
                        onClick={() => handelDelete(user.user_id)}
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

      {/* Dialog */}
      <UserDialog
        open={dialog.open}
        mode={dialog.mode}
        onOpenChange={handleClose}
        onSuccess={fetchUsers}
        initialData={selectedUser}
      />
    </div>
  );
}
