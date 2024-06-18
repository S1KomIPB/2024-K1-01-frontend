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

export interface NewUser {
    name: string;
    initials: string;
    is_admin: boolean;
    password: string;
    is_active: boolean;
}

export interface ExtendedUser extends User {
    courses?: Course[];
    semesters?: SemesterOfUser[];
}