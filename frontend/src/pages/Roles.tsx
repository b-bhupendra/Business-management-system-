import React, { useEffect, useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, ShieldCheck, Plus } from "lucide-react";

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string;
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/roles')
      .then(res => res.json())
      .then(data => {
        setRoles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch roles:", err);
        // Fallback for demo if backend is not running yet
        setRoles([
          { id: 1, name: 'admin', description: 'Full System Access', permissions: 'all' },
          { id: 2, name: 'manager', description: 'Department Manager', permissions: 'read,write,notify' },
          { id: 3, name: 'staff', description: 'Floor Staff', permissions: 'read,write_reservations' }
        ]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">Manage system roles and their associated permissions.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add New Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Roles</CardTitle>
          <CardDescription>
            These roles define what users can see and do in the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-bold capitalize flex items-center gap-2">
                    {role.name === 'admin' ? <ShieldAlert className="h-4 w-4 text-destructive" /> : 
                     role.name === 'manager' ? <ShieldCheck className="h-4 w-4 text-primary" /> : 
                     <Shield className="h-4 w-4 text-muted-foreground" />}
                    {role.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{role.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.split(',').map((p) => (
                        <Badge key={p} variant="secondary" className="text-[10px] uppercase font-bold">
                          {p.trim()}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600 bg-green-50 dark:bg-green-900/10 border-green-200">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="font-bold text-primary">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
