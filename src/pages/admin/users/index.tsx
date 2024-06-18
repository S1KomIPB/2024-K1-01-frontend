import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Inter } from "next/font/google";
import React, { useEffect, useState } from "react";
import { removeToken, useCheckToken } from "@/utils/cookie";
import { ProcessedCoursesResult } from "@/interfaces/course";
import { fetchDataAuthenticated, fetchDataAuthenticatedWithBody } from "@/utils/http";
import { useRouter } from "next/navigation";
import { NewUser, User } from "@/interfaces/user";
import { processUserSemesters } from "@/utils/semester";
import { ProcessedUserWithSemesters } from "@/interfaces/semester";
import Link from "next/link";
import { DialogHeader, DialogFooter, Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const courseTypeNames = {
    0: "K",
    1: "P",
    2: "R",
  };
  useCheckToken();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<ProcessedUserWithSemesters | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<ProcessedCoursesResult | null>(null);
  const [processedUserData, setProcessedUserData] = useState<ProcessedCoursesResult>();
  const [updatedSchedules, setUpdatedSchedules] = useState({});
  const [newUser, setNewUser] = useState<NewUser | null>(null);
  const [createUserError, setCreateUserError] = useState("");
  const [createUserSuccess, setCreateUserSuccess] = useState("");

  const logout = () => {
    removeToken();
    router.push("/login");
  }

  const createUser = async () => {
    try {
      if (newUser.initials.length !== 3) {
        throw new Error("Initials must be 3 characters long");
      }
      await fetchDataAuthenticatedWithBody(
        "http://localhost:5067/users",
        { 
          method: "POST",
          body: JSON.stringify(newUser)
        }
      );
      setCreateUserSuccess("User created successfully");
    } catch (error) {
      console.error(error);
      setCreateUserError(error.message);
    }
  }

  const fetchUserSemesters = async (id: number) => {
    try {
      const response = await fetchDataAuthenticated(
        `http://localhost:5067/users/${id}/semesters`,
        { method: "GET" }
      );
      const user = processUserSemesters(response);
      setSelectedUser(user);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetchDataAuthenticated(
          "http://localhost:5067/users",
          { method: "GET" }
        );
        setUsers(response.data as User[]);
      } catch (error) {
        console.error(error);
      }
    }
    fetchInitialData();
  }, []);

  return (
    <main
      className={`flex flex-col items-center justify-between p-6 ${inter.className}`}
    >
      <div className="w-full flex justify-between items-center mb-5">
        <span className="flex items-center">
          <h1 className="text-3xl font-semibold">Admin Page</h1>
          <Link href="/admin/users"><Button variant="outline" className="ml-4">User</Button></Link>
          <Link href="/admin/semesters"><Button variant="outline" className="ml-4">Semester</Button></Link>
        </span>
        <span className="text-lg">
          Logged in as {processedUserData?.name}
          <Button onClick={logout} variant="outline" className="ml-4">Logout</Button>
        </span>
      </div>
      <div className="grid grid-cols-3 w-full gap-5">
        <ScrollArea className="h-[80vh] rounded-md border p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Users</h4>
          <div className="grid grid-cols-1 gap-2">
          <Dialog>
              <DialogTrigger asChild>
                <div>
                  <Button variant="outline">Create user</Button>
                </div>
              </DialogTrigger>
                
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create user</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="name" className="col-span-2 text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      className="col-span-3"
                      type="text"
                      onChange={(e) => {
                        setNewUser({ ...newUser, name: e.target.value });
                        setCreateUserError("");
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="initials" className="col-span-2 text-right">
                      Initials
                    </Label>
                    <Input
                      id="initials"
                      name="initials"
                      className="col-span-3"
                      type="text"
                      onChange={(e) => {
                        setNewUser({ ...newUser, initials: e.target.value.toUpperCase() });
                        setCreateUserError("");
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="password" className="col-span-2 text-right">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      className="col-span-3"
                      type="password"
                      onChange={(e) => {
                        setNewUser({ ...newUser, password: e.target.value });
                        setCreateUserError("");
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="is_admin" className="col-span-2 text-right">
                      Admin
                    </Label>
                    <Input
                      id="is_admin"
                      name="is_admin"
                      className="col-span-3"
                      type="checkbox"
                      onChange={(e) => {
                        setNewUser({ ...newUser, is_admin: e.target.checked });
                        setCreateUserError("");
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="is_active" className="col-span-2 text-right">
                      Active
                    </Label>
                    <Input
                      id="is_active"
                      name="is_active"
                      className="col-span-3"
                      type="checkbox"
                      onChange={(e) => {
                        setNewUser({ ...newUser, is_active: e.target.checked });
                        setCreateUserError("");
                      }}
                    />
                  </div>
                  {createUserError && (
                    <div className="text-red-500">{createUserError}</div>
                  )}
                  {createUserSuccess && (
                    <div className="text-green-500">User created successfully</div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    onClick={createUser}
                    className="grid-cols-3"
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {users &&
              users.map((user) => (
                <React.Fragment key={user.id}>
                  <Button
                    onClick={() => fetchUserSemesters(user.id)}
                    variant={user.bkd < 4 ? "destructive" : "outline"}
                    className="text-sm my-1"
                  >
                    {user.name} : BKD {user.bkd}
                  </Button>
                </React.Fragment>
              ))}
          </div>
        </ScrollArea>
        <ScrollArea className="h-[80vh] rounded-md border p-4">
          {selectedUser && (
            <h4 className="mb-4 text-sm font-medium leading-none">
              Semester of {selectedUser.name}
            </h4>
          )}
          <div className="grid grid-cols-1 gap-2">
            {selectedUser &&
              selectedUser.semesters &&
              selectedUser.semesters
                .map(
                  (semester) =>
                  <React.Fragment key={semester.id}>
                    <Button
                      onClick={() => setSelectedSemester(semester)}
                      variant={semester.bkd < 4 ? "destructive" : "outline"}
                      className="text-sm my-1"
                    >
                      {semester.name} : BKD {semester.bkd}
                    </Button>
                  </React.Fragment>
                )}
          </div>
        </ScrollArea>
        <ScrollArea className="h-[80vh] rounded-md border p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">
            {selectedSemester?.name && `Courses of ${selectedSemester?.name} of ${selectedUser?.name}`}
          </h4>
          <div className="grid grid-cols-3 gap-4">
            {selectedSemester &&
              selectedSemester.courses &&
              selectedSemester.courses.map((course) => (
                <React.Fragment key={course.code}>
                  <div className="text-sm">
                    {course.code}{" "}
                    {course.counts
                      .map(
                        (count) =>
                          `${courseTypeNames[count.type]}: ${count.count}`
                      )
                      .join(", ")}
                  </div>
                </React.Fragment>
              ))}
          </div>
        </ScrollArea>
      </div>
    </main>
  );
}
