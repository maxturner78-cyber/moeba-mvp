import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Copy, LogOut, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ADMIN_PASSWORD =
  (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ||
  "moeba-admin-2026";
const SESSION_KEY = "moeba_admin_session";

type Role = "graduate" | "manager" | "peer" | "admin";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  job_title: string | null;
  created_at: string;
}

interface ManagerOption {
  id: string;
  full_name: string;
}

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// ---------- Password Gate ----------

const PasswordGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(SESSION_KEY, "true");
      onUnlock();
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAFAFA",
        padding: 16,
      }}
    >
      <Card style={{ width: 400 }}>
        <CardHeader>
          <CardTitle style={{ fontSize: 20 }}>Moeba Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              autoFocus
            />
            {error && (
              <div style={{ fontSize: 13, color: "#DC2626" }}>{error}</div>
            )}
            <Button type="submit" style={{ marginTop: 4 }}>
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Create User Form ----------

const CreateUserPanel: React.FC<{
  managers: ManagerOption[];
  onCreated: () => void;
}> = ({ managers, onCreated }) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("graduate");
  const [jobTitle, setJobTitle] = useState("");
  const [hireDate, setHireDate] = useState<Date | undefined>(undefined);
  const [managerId, setManagerId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const reset = () => {
    setEmail("");
    setFullName("");
    setRole("graduate");
    setJobTitle("");
    setHireDate(undefined);
    setManagerId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (role === "graduate") {
      if (!hireDate) {
        toast.error("Hire date is required for graduates");
        return;
      }
      if (!managerId) {
        toast.error("Manager is required for graduates");
        return;
      }
    }

    setSubmitting(true);
    setTempPassword(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-pilot-user",
        {
          body: {
            admin_password: ADMIN_PASSWORD,
            email: email.trim(),
            full_name: fullName.trim(),
            role,
            job_title: jobTitle.trim() || null,
            hire_date:
              role === "graduate" && hireDate
                ? format(hireDate, "yyyy-MM-dd")
                : null,
            manager_id: role === "graduate" ? managerId : null,
          },
        },
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const pwd: string | undefined = data?.temp_password;
      if (pwd) setTempPassword(pwd);
      toast.success("User created");
      reset();
      onCreated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const copyPassword = async () => {
    if (!tempPassword) return;
    try {
      await navigator.clipboard.writeText(tempPassword);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: 18 }}>Create user</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="graduate">Graduate</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="peer">Peer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="job_title">Job title (optional)</Label>
            <Input
              id="job_title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          {role === "graduate" && (
            <>
              <div>
                <Label>Hire date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !hireDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {hireDate ? format(hireDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={hireDate}
                      onSelect={setHireDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="manager">Manager</Label>
                <Select value={managerId} onValueChange={setManagerId}>
                  <SelectTrigger id="manager">
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.length === 0 ? (
                      <div style={{ padding: 8, fontSize: 13, color: "#6B7280" }}>
                        No managers found
                      </div>
                    ) : (
                      managers.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.full_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button type="submit" disabled={submitting} style={{ marginTop: 4 }}>
            {submitting ? "Creating…" : "Create user"}
          </Button>

          {tempPassword && (
            <div
              style={{
                marginTop: 8,
                padding: 12,
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, color: "#166534" }}>
                Temporary password — share this with the user
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Input
                  readOnly
                  value={tempPassword}
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button type="button" variant="outline" onClick={copyPassword}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

// ---------- Existing Users Panel ----------

const ExistingUsersPanel: React.FC<{
  users: UserRow[];
  onChanged: () => void;
}> = ({ users, onChanged }) => {
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ id: string; password: string } | null>(
    null,
  );

  const handleReset = async (userId: string) => {
    setResettingId(userId);
    setResetResult(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        "reset-pilot-password",
        { body: { admin_password: ADMIN_PASSWORD, user_id: userId } },
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const pwd: string | undefined = data?.temp_password;
      if (pwd) {
        setResetResult({ id: userId, password: pwd });
        try {
          await navigator.clipboard.writeText(pwd);
          toast.success("New password copied to clipboard");
        } catch {
          toast.success("Password reset");
        }
      } else {
        toast.success("Password reset");
      }
      onChanged();
    } catch (err: any) {
      toast.error(err?.message || "Failed to reset password");
    } finally {
      setResettingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ fontSize: 18 }}>Existing users</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ overflowX: "auto" }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Job title</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} style={{ textAlign: "center", color: "#6B7280" }}>
                    No users yet
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <React.Fragment key={u.id}>
                    <TableRow>
                      <TableCell style={{ fontWeight: 500 }}>{u.full_name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell style={{ textTransform: "capitalize" }}>
                        {u.role}
                      </TableCell>
                      <TableCell>{u.job_title || "—"}</TableCell>
                      <TableCell>
                        {format(new Date(u.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={resettingId === u.id}
                          onClick={() => handleReset(u.id)}
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                          {resettingId === u.id ? "Resetting…" : "Reset password"}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {resetResult?.id === u.id && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div
                            style={{
                              padding: 10,
                              background: "#F0FDF4",
                              border: "1px solid #BBF7D0",
                              borderRadius: 6,
                              fontSize: 13,
                              fontFamily: "JetBrains Mono, monospace",
                              color: "#166534",
                            }}
                          >
                            New temporary password: {resetResult.password}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// ---------- Admin Page ----------

const AdminContent: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<UserRow[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, full_name, role, job_title, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as UserRow[];
    },
  });

  const managers: ManagerOption[] = users
    .filter((u) => u.role === "manager")
    .map((u) => ({ id: u.id, full_name: u.full_name }));

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA" }}>
      <header
        style={{
          padding: "16px 32px",
          borderBottom: "1px solid #E5E7EB",
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontWeight: 500,
              color: "#111827",
            }}
          >
            Moeba Admin
          </div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
            Pilot user management
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onSignOut}>
          <LogOut className="h-3.5 w-3.5 mr-1.5" />
          Sign out of admin
        </Button>
      </header>

      <main
        style={{
          padding: 32,
          display: "grid",
          gridTemplateColumns: "minmax(360px, 1fr) minmax(0, 2fr)",
          gap: 24,
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        <CreateUserPanel managers={managers} onCreated={refresh} />
        <ExistingUsersPanel users={users} onChanged={refresh} />
      </main>
    </div>
  );
};

const Admin: React.FC = () => {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SESSION_KEY) === "true";
  });

  useEffect(() => {
    document.title = "Moeba Admin";
  }, []);

  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <AdminContent
      onSignOut={() => {
        localStorage.removeItem(SESSION_KEY);
        setUnlocked(false);
      }}
    />
  );
};

export default Admin;