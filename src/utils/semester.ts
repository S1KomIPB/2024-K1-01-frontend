import { ProcessedUserWithSemesters } from "@/interfaces/semester";

export const properSemester = (semester: string) => {
    const date = new Date(semester);
    const year = date.getFullYear();
    const parity = date.getMonth() < 6 ? "Genap" : "Ganjil";
    return `${year} ${parity}`;
}


export const processUserSemesters = (data: any): ProcessedUserWithSemesters =>{
    const userData = data.data;
    const result: ProcessedUserWithSemesters = {
        id: userData.id,
        name: userData.name,
        initials: userData.initials,
        is_admin: userData.is_admin,
        is_active: userData.is_active,
        semesters: userData.semesters?.map((semester: any) => ({
            id: semester.id,
            bkd: semester.bkd,
            name: properSemester(semester.date),
            initials: userData.initials,
            courses: semester.courses.map((course: any) => {
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
                        type: parseInt(key) as 0 | 1 | 2,
                        count
                    }));

                return {
                    code: course.code,
                    counts
                };
            })
        }))
    };

    return result;
}