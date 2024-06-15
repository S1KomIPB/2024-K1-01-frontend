import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Inter } from "next/font/google";
import React, { useEffect, useState } from "react";
import { getJWTPayload, removeToken, useCheckToken } from "@/utils/cookie";
import {
  Course,
  CourseClass,
  ProcessedCoursesResult,
} from "@/interfaces/course";
import { extractUserData } from "@/utils/user";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchDataAuthenticated } from "@/utils/http";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCourseClass, setSelectedCourseClass] = useState<CourseClass | null>(null);
  const [processedUserData, setProcessedUserData] = useState<ProcessedCoursesResult>();
  const [isAdmin, setIsAdmin] = useState(false);

  const logout = () => {
    removeToken();
    router.push("/login");
  }

  const fillSchedule = async (scheduleId: number) => {
    try {
      await fetchDataAuthenticated(
        `http://localhost:5067/schedules/${scheduleId}/fill`,{ method: "PUT" }
      );
      setSelectedCourseClass(prevClass => {
        if (prevClass && prevClass.schedules) {
          const updatedSchedules = prevClass.schedules.map(schedule => {
            if (schedule.id === scheduleId) {
              return { ...schedule, teacher_initial: processedUserData?.initials, teacher_id: processedUserData?.id };
            }
            return schedule;
          });
          return { ...prevClass, schedules: updatedSchedules };
        }
        return prevClass;
      });
    } catch (error) {
      console.error(error);
    }
  };

  const clearSchedule = async (scheduleId: number) => {
    try {
      await fetchDataAuthenticated(
        `http://localhost:5067/schedules/${scheduleId}/clear`,{ method: "PUT" }
      );
      setSelectedCourseClass(prevClass => {
        if (prevClass && prevClass.schedules) {
          const updatedSchedules = prevClass.schedules.map(schedule => {
            if (schedule.id === scheduleId) {
              return { ...schedule, teacher_initial: null, teacher_id: null };
            }
            return schedule;
          });
          return { ...prevClass, schedules: updatedSchedules };
        }
        return prevClass;
      });
    } catch (error) {
      console.error(error);
    }
  }

  const fetchCourse = async (id: number) => {
    try {
      const response = await fetchDataAuthenticated(
        `http://localhost:5067/courses/${id}`,
        { method: "GET" }
      );
      const course = response.data as Course;
      setSelectedCourse(course);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCourseClass = async (id: number) => {
    try {
      const response = await fetchDataAuthenticated(
        `http://localhost:5067/courses/class/${id}`,
        { method: "GET" }
      );
      const courseClass = response.data as CourseClass;
      setSelectedCourseClass(courseClass);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const courses = await fetchDataAuthenticated(
          "http://localhost:5067/courses",
          { method: "GET" }
        );
        const user = await fetchDataAuthenticated(
          "http://localhost:5067/users/me",
          { method: "GET" }
        );
        setIsAdmin(getJWTPayload("role") === "admin");
        setCourses(courses.data);
        setProcessedUserData(extractUserData(user));
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
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <span className="text-lg">
          Logged in as {processedUserData?.name}
          {isAdmin && <Button onClick={() => router.push("/admin")} variant="outline" className="ml-4">Admin Page</Button>}
          <Button onClick={logout} variant="outline" className="ml-4">Logout</Button>
        </span>
      </div>
      <div className="grid grid-rows-2 grid-cols-3 w-full gap-5">
        <ScrollArea className="h-[80vh] row-span-2 rounded-md border p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Courses</h4>
          <div className="grid grid-cols-1 gap-2">
            {courses &&
              courses.map((course) => (
                <React.Fragment key={course.id}>
                  <Button
                    onClick={() => fetchCourse(course.id)}
                    variant="outline"
                    className="text-sm my-1"
                  >
                    {course.name}
                  </Button>
                </React.Fragment>
              ))}
          </div>
        </ScrollArea>
        <ScrollArea className="h-[40vh] rounded-md border p-4">
          {selectedCourse && (
            <h4 className="mb-4 text-sm font-medium leading-none">
              Classes of {selectedCourse.name}
            </h4>
          )}
          <div className="grid grid-cols-4 gap-2">
            {selectedCourse &&
              selectedCourse.course_type &&
              selectedCourse.course_type
                .sort((a, b) => a.type - b.type)
                .map(
                  (type) =>
                    type.course_class &&
                    type.course_class.map((courseClass) => (
                      <React.Fragment key={courseClass.id}>
                        <Button
                          onClick={() => fetchCourseClass(courseClass.id)}
                          variant="outline"
                          className="text-sm my-1"
                        >
                          {courseTypeNames[type.type]}
                          {courseClass.number}
                        </Button>
                      </React.Fragment>
                    ))
                )}
          </div>
        </ScrollArea>
        <ScrollArea className="h-[40vh] rounded-md border p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Schedule</h4>
          <div className="grid grid-cols-3 gap-4">
            {selectedCourseClass &&
              selectedCourseClass.schedules &&
              selectedCourseClass.schedules.map((schedule) => (
                <React.Fragment key={schedule.id}>
                  {(schedule.teacher_initial ===
                    processedUserData?.initials && (
                      <Popover>
                        <PopoverTrigger>
                            <Button
                              className="text-sm w-full"
                            >
                              {schedule.meet_number} | {schedule.teacher_initial}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Button
                            onClick={() => clearSchedule(schedule.id)}
                            variant="outline"
                            className="text-sm w-full"
                          >
                            Clear
                          </Button>
                        </PopoverContent>
                      </Popover>
                    )) ||
                    (schedule.teacher_initial && (
                      <Button className="text-sm" disabled>
                        {schedule.meet_number} | {schedule.teacher_initial}
                      </Button>
                    )) || (
                      <Popover>
                        <PopoverTrigger>
                            <Button
                              variant="outline"
                              className="text-sm w-full"
                            >
                              {schedule.meet_number}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Button
                            onClick={() => fillSchedule(schedule.id)}
                            variant="outline"
                            className="text-sm w-full"
                          >
                            Fill
                          </Button>
                        </PopoverContent>
                      </Popover>
                    )}
                </React.Fragment>
              ))}
          </div>
        </ScrollArea>
        <Card className="h-[40vh] rounded-md border p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">My Data</h4>
          <div className="grid gap-4">
            <div className="text-sm">Name: {processedUserData?.name}</div>
            <div className="text-sm">
              Initials: {processedUserData?.initials}
            </div>
            <div className="text-sm">BKD: {processedUserData?.bkd}</div>
            <Dialog>
              <DialogTrigger asChild>
                <div>
                  <Button variant="outline">Change Password</Button>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="old-password" className="col-span-2 text-right">
                      Old Password
                    </Label>
                    <Input
                      id="old-password"
                      name="old_password"
                      className="col-span-3"
                      type="password"
                    />
                  </div>
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="new-password" className="col-span-2 text-right">
                      New Password
                    </Label>
                    <Input
                      id="new-password"
                      name="new_password"
                      className="col-span-3"
                      type="password"
                    />
                  </div>
                  <div className="grid grid-cols-5 items-center gap-4">
                    <Label htmlFor="confirm-password" className="col-span-2 text-right">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password"
                      name="confirm_password"
                      className="col-span-3"
                      type="password"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="grid-cols-3">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
        <ScrollArea className="h-[40vh] rounded-md border p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">My Course</h4>
          <div className="grid gap-4">
            {processedUserData &&
              processedUserData.courses.map((course) => (
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
