import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Inter } from "next/font/google";
import React, { useEffect, useState } from "react";
import { removeToken, useCheckToken } from "@/utils/cookie";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchDataAuthenticated, fetchDataAuthenticatedWithBody } from "@/utils/http";
import { useRouter } from "next/navigation";
import { properSemester } from "@/utils/semester";
import { Semester} from "@/interfaces/semester";
import Link from "next/link";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, TrashIcon } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDanger,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import BarChartComponent from "@/components/barchart";
const inter = Inter({ subsets: ["latin"] });

const SemesterFormSchema = z.object({
  startdate: z.date({
    required_error: "A date is required.",
  }),
})

const CourseFormSchema = z.object({
  code: z.string().max(7, {
    message: "Code must be at most 7 characters.",
  }),
  name: z.string().max(50, {
    message: "Name must be at most 50 characters.",
  }),
  kuliah_credit: z.string(),
  praktikum_credit: z.string(),
  responsi_credit: z.string(),
  kuliah_class_count: z.string(),
  praktikum_class_count: z.string(),
  responsi_class_count: z.string(),
  semesters: z.string()
})

export default function Home() {
  const semesterForm = useForm<z.infer<typeof SemesterFormSchema>>({
    resolver: zodResolver(SemesterFormSchema),
  })

  const courseForm = useForm<z.infer<typeof CourseFormSchema>>({
    resolver: zodResolver(CourseFormSchema),
  })

  function onSubmitSemester(data: z.infer<typeof SemesterFormSchema>) {
    const date = data.startdate.toISOString().slice(0, 10);
    const payload = {
      date,
    };
    const createSemester = async () => {
      try {
        await fetchDataAuthenticatedWithBody(
          "http://localhost:5067/semesters",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
        setSemesters((prev) => [...prev, { id: 0, date, is_active: false}]);
        } catch (error) {
          console.error(error);
          }
          };
    createSemester();
  }

  function onSubmitCourse(data: z.infer<typeof CourseFormSchema>) {
    const course_types = [
      {
          type: 0,
          credit: data.kuliah_credit,
          class_count: data.kuliah_class_count
      },
      {
          type: 1,
          credit: data.praktikum_credit,
          class_count: data.praktikum_class_count
      },
      {
          type: 2,
          credit: data.responsi_credit,
          class_count: data.responsi_class_count
      }
  ];
  const filtered_course_types = course_types.filter(course =>
    (course.credit && parseInt(course.credit) > 0) && (course.class_count && parseInt(course.class_count) > 0)
  );
    const payload = {
      semester_id: selectedSemester?.id,
      code: data.code,
      name: data.name,
      course_type: filtered_course_types,
      semesters: data.semesters,
    };
    const createCourse = async () => {
      try {
        await fetchDataAuthenticatedWithBody(
          "http://localhost:5067/courses",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
        console.log("Course created");
      } catch (error) {
        console.error(error);
      }
    };
    createCourse();
  }


  useCheckToken();
  const router = useRouter();
  
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSemesterBKD, setSelectedSemesterBKD] = useState([]);

  const logout = () => {
    removeToken();
    router.push("/login");
  }
  
  const setActive = (id: number) => async () => {
    try {
      await fetchDataAuthenticated(
        `http://localhost:5067/semesters/${id}/activate`,
        { method: "PUT" }
      );
      setSemesters((prev) =>
        prev.map((semester) => ({
          ...semester,
          is_active: semester.id === id,
        }))
      );
      setSelectedSemester((prev) => prev && { ...prev, is_active: true });
    } catch (error) {
      console.error(error);
    }
  }

  const deleteSemester = (id: number) => async () => {
    try {
      await fetchDataAuthenticated(
        `http://localhost:5067/semesters/${id}`,
        { method: "DELETE" }
      );
      setSemesters((prev) => prev.filter((semester) => semester.id !== id));
      setSelectedSemester(null);
    } catch (error) {
      console.error(error);
    }
  }

  const deleteCourse = (id: number) => async () => {
    try {
      await fetchDataAuthenticated(
        `http://localhost:5067/courses/${id}`,
        { method: "DELETE" }
      );
      setSelectedSemester((prev) => prev && {
        ...prev,
        courses: prev.courses.filter((course) => course.id !== id),
      });
    } catch (error) {
      console.error(error);
    }
  }

  const fetchSemesters = async (id: number) => {
    try {
      const response = await fetchDataAuthenticated(
        `http://localhost:5067/semesters/${id}`,
        { method: "GET" }
      );
      setSelectedSemester(response.data as Semester);
      const bkdresponse = await fetchDataAuthenticated(
        `http://localhost:5067/users/semesters/${id}`,
        { method: "GET" }
      );
      setSelectedSemesterBKD(bkdresponse.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetchDataAuthenticated(
          "http://localhost:5067/semesters",
          { method: "GET" }
        );
        setSemesters(response.data as Semester[]);
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
          <Button onClick={logout} variant="outline" className="ml-4">Logout</Button>
        </span>
      </div>
      <div className="grid grid-rows-2 grid-cols-3 w-full gap-5">
        <ScrollArea className="h-[80vh] row-span-2 rounded-md border p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Semesters</h4>
          <div className="grid grid-cols-1 gap-2">
          <Form {...semesterForm}>
            <form onSubmit={semesterForm.handleSubmit(onSubmitSemester)} className="space-y-8">
              <FormField
                control={semesterForm.control}
                name="startdate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Semester start date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Create new semester</Button>
            </form>
          </Form>
            {semesters &&
              semesters.sort((a, b) => b.date.localeCompare(a.date))
              .map((semester) => (
                <React.Fragment key={semester.id}>
                  <Button
                    onClick={() => fetchSemesters(semester.id)}
                    variant="outline"
                    className="text-sm my-1"
                  >
                    {properSemester(semester.date)}{semester.is_active ? "✅" : ""}
                  </Button>
                </React.Fragment>
              ))}
          </div>
        </ScrollArea>
        <ScrollArea className="h-[40vh] rounded-md border p-4">
          {selectedSemester && (
            <div>
              <h4 className="mb-4 text-sm font-medium leading-none">
                Courses of {properSemester(selectedSemester.date)}
              </h4>
              {!selectedSemester.is_active && (
                <div>
                  <Button
                    onClick={setActive(selectedSemester.id)}
                    variant="outline"
                    className="text-sm my-1 me-1"
                  >
                    Activate
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the <code><strong>{properSemester(selectedSemester.date)}</strong></code> semester.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogDanger onClick={deleteSemester(selectedSemester.id)}>Delete</AlertDialogDanger>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-8 gap-2">
            {selectedSemester &&
              selectedSemester.courses &&
              selectedSemester.courses
                .map(
                  (course) =>
                  <React.Fragment key={course.id}>
                    <Button
                      variant="outline"
                      className="text-sm my-1 col-span-7"
                    >
                      {course.code} - {course.name} - SKS({
                            course.course_type.find(ct => ct.type === 0) ? course.course_type.find(ct => ct.type === 0).credit : 0
                        }/{
                            course.course_type.find(ct => ct.type === 1) ? course.course_type.find(ct => ct.type === 1).credit : 0
                        }/{
                            course.course_type.find(ct => ct.type === 2) ? course.course_type.find(ct => ct.type === 2).credit : 0
                        })
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                        variant="destructive"
                        className="text-sm my-1"
                      >
                        <TrashIcon />
                      </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the <code><strong>{course.code} - {course.name}</strong></code> course.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogDanger onClick={deleteCourse(course.id)}>Delete</AlertDialogDanger>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </React.Fragment>
                )}
          </div>
        </ScrollArea>
        <ScrollArea className="h-[40vh] rounded-md border p-4">
          {selectedSemester && (
            <div>
              <h4 className="mb-4 text-sm font-medium leading-none">
                Create a new course for {properSemester(selectedSemester.date)}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                <Form {...courseForm}>
                  <form onSubmit={courseForm.handleSubmit(onSubmitCourse)} className="w-2/3 space-y-6">
                    <FormField
                      control={courseForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code</FormLabel>
                          <FormControl>
                            <Input placeholder="CS101" {...field}  />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={courseForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Introduction to Computer Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={courseForm.control}
                      name="kuliah_credit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kuliah Credit</FormLabel>
                          <FormControl>
                            <Input placeholder="3" {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={courseForm.control}
                      name="praktikum_credit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Praktikum Credit</FormLabel>
                          <FormControl>
                            <Input placeholder="1" {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={courseForm.control}
                      name="responsi_credit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsi Credit</FormLabel>
                          <FormControl>
                            <Input placeholder="1" {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={courseForm.control}
                      name="kuliah_class_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kuliah Class Count</FormLabel>
                          <FormControl>
                            <Input placeholder="2" {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={courseForm.control}
                      name="praktikum_class_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Praktikum Class Count</FormLabel>
                          <FormControl>
                            <Input placeholder="1" {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={courseForm.control}
                      name="responsi_class_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsi Class Count</FormLabel>
                          <FormControl>
                            <Input placeholder="1" {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={courseForm.control}
                      name="semesters"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Semesters</FormLabel>
                          <FormControl>
                            <Input placeholder="1" {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Submit</Button>
                  </form>
                </Form>
              </div>
            </div>
          )}
          
        </ScrollArea>
        <Card className="h-[40vh] col-span-2 rounded-md border p-4">
          {selectedSemester && (
            <div>
              <h4 className="mb-4 text-sm font-medium leading-none">BKD Graph for {properSemester(selectedSemester.date)}</h4>
              <BarChartComponent data={selectedSemesterBKD} />
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
