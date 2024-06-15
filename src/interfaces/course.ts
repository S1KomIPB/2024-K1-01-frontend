export interface Schedule {
    id: number;
    meet_number: number;
    teacher_id?: number;
    teacher_initial?: string;
}

export interface CourseClass {
    id: number;
    number: number;
    schedules?: Schedule[];
}

export interface CourseType {
    id: number;
    type: 0 | 1 | 2;
    credit: number;
    course_class?: CourseClass[];
}

export interface Course {
    id: number;
    name: string;
    code: string;
    course_type?: CourseType[];
}

export interface ScheduleCount {
    type: 0 | 1 | 2;
    count: number;
}

export enum CourseTypeNumber {
    Kuliah = 0,
    Praktikum = 1,
    Responsi = 2
}


export interface CourseSummary {
    code: string;
    counts: ScheduleCount[];
}

export interface ProcessedCoursesResult {
    id? : number;
    bkd: number;
    name: string;
    initials: string;
    courses: CourseSummary[];
}
