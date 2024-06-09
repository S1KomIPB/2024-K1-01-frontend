import { Course, ProcessedCoursesResult } from "./course";

export interface Semester {
    id: number;
    date: string;
    is_active: boolean;
    courses?: Course[];
}

export interface SemesterOfUser {
    id: number;
    date: string;
    is_active: boolean;
    bkd: number;
    courses?: Course[];
}


export interface ProcessedUserWithSemesters {
    id: number;
    name: string;
    initials: string;
    is_admin: boolean;
    is_active: boolean;
    semesters?: ProcessedCoursesResult[];
}
