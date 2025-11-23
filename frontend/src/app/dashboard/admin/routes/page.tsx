"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Route, Trash, PenBoxIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import RouteDialog from "./RouteDialog";
import { routeService } from "@/service/route.service";

export default function ManagerRoutes() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  const fetchRoutes = async () => {
    try {
      const data = await routeService.getRoutes();
      console.log(data);
      setRoutes(data);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
    }
  };

  const [dialog, setDialog] = useState<{
    open: boolean;
    mode: "add" | "edit" | "read";
  }>({ open: false, mode: "add" });
  const handleOpen = (mode: "add" | "edit" | "read", route?: any) => {
    setSelectedRoute(route);
    setDialog({ open: true, mode });
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleClose = (open: boolean) => {
    setDialog((prev) => ({ ...prev, open }));
  };

  const handleDelete = async (route_id: number) => {
      try {
        await routeService.deleteRoute(route_id);
        fetchRoutes();
      } catch (error) {
        console.error("Failed to delete route:", error);
      }
    }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="space-y-6">
        <Card className="rounded-xl border border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Routes</CardTitle>
              <Button
                variant={"secondary"}
                className="bg-blue-500 hover:bg-blue-700 hover:text-white"
                onClick={() => handleOpen("add")}
              >
                <Route />
                Add new routes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roude ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Thời gian dự kiến</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.route_id}>
                    <TableCell>{route.route_id}</TableCell>
                    <TableCell>{route.route_name}</TableCell>
                    <TableCell>{route.total_points}</TableCell>
                    <TableCell>{route.total_students}</TableCell>
                    <TableCell>{route.duration}</TableCell>
                    <TableCell>
                      <Badge
                        variant={"secondary"}
                        className={cn(
                          "text-white cursor-pointer",
                          route.status
                            ? "bg-green-500 hover:bg-green-400"
                            : "bg-gray-500 hover:bg-gray-400"
                        )}
                      >
                        {route.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="flex gap-2">
                      <Button
                        variant={"secondary"}
                        className="hover:bg-orange-400 border border-gray-300"
                        onClick={() => handleOpen("edit", route)}
                      >
                        <PenBoxIcon />
                      </Button>

                      <Button
                        variant={"secondary"}
                        className="hover:bg-red-500 border border-gray-300"
                        onClick={() => handleDelete(route.route_id)}
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
      <RouteDialog
        open={dialog.open}
        mode={dialog.mode}
        onOpenChange={handleClose}
        onSuccess={fetchRoutes}
        intialData={selectedRoute}
      />
    </div>
  );
}
