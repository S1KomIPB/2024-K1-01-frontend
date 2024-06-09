import { Course } from "./course";
import { SemesterOfUser } from "./semester";

export interface User {
    id: number;
    name: string;
    initials: string;
    is_admin: boolean;
    is_active: boolean;
    bkd: number;
}

export interface ExtendedUser extends User {
    courses?: Course[];
    semesters?: SemesterOfUser[];
}