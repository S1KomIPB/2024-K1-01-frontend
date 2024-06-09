import { ProcessedCoursesResult } from "@/interfaces/course";

export const extractUserData = (data: any) : ProcessedCoursesResult => {
    const result: ProcessedCoursesResult = {
        courses: [],
        bkd: data.data.bkd,
        name: data.data.name,
        initials: data.data.initials
    };
    data.data.courses.forEach((course: any) => {
        const courseCode = course.code;
        const scheduleCounts: { [key: number]: number } = {};

        course.course_type.forEach((ctype: any) => {
            ctype.course_classes.forEach((cclass: any) => {
                const count = cclass.schedules.length;
                if (scheduleCounts[ctype.type] !== undefined) {
                    scheduleCounts[ctype.type] += count;
                } else {
                    scheduleCounts[ctype.type] = count;
                }
            });
        });

        const counts = Object.entries(scheduleCounts)
            .filter(([, count]) => count > 0)
            .map(([key, count]) => ({
                type: parseInt(key),
                count
            }));

        result.courses.push({
            code: courseCode,
            // @ts-ignore
            counts
        });
    });

    return result;
}