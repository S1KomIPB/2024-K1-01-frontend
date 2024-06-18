const loginAndGetToken = async (username: string, password: string): Promise<string> => {
    try {
        const response = await fetch('http://localhost:5067/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ initial: username, password })
        });

        if (response.ok) {
            const responseBody = await response.json();
            return responseBody.data.token;
        } else if (response.status === 401) {
            const responseBody = await response.json();
            throw new Error(`Authentication failed: ${responseBody.message}`);
        } else {
            throw new Error(`Failed to log in with status: ${response.status}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error during login process.');
    }
}

const createUser = async (user: { name: string, initials: string, is_admin: boolean, password: string, is_active: boolean, token: string }, token: string) => {
    try {
        const response = await fetch('http://localhost:5067/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            return;
        } else {
            throw new Error(`Failed to create user: ${user.initials} with status: ${response.status}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error during user creation process.');
    }
}

const createSemester = async (semester: { date: string }, token: string) => {
    try {
        const response = await fetch('http://localhost:5067/semesters', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(semester)
        });

        if (response.ok) {
            return;
        } else {
            throw new Error(`Failed to create semester with status: ${response.status}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error during semester creation process.');
    }
}

const activateSemester = async (semester_id: number, token: string) => {
    try {
        const response = await fetch(`http://localhost:5067/semesters/${semester_id}/activate`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            return;
        } else {
            throw new Error(`Failed to activate semester with status: ${response.status}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error during semester activation process.');
    }
}

const createCourse = async (course: { semester_id: number, name: string, code: string, course_type: { type: number, credit: number, class_count: number }[] }, token: string) => {
    try {
        const response = await fetch('http://localhost:5067/courses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(course)
        });

        if (response.ok) {
            return;
        } else {
            throw new Error(`Failed to create course with status: ${response.status}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error during course creation process.');
    }
}

const fillSchedule = async (schedule_id: number, token: string) => {
    try {
        const response = await fetch(`http://localhost:5067/schedules/${schedule_id}/fill`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            return;
        } else {
            throw new Error(`Failed to fill schedule with status: ${response.status}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error during schedule filling process.');
    }
}

const main = async () => {
    const admin = {
        name: "Admin",
        initials: "ADM",
        is_admin: true,
        password: "secretpassword",
        is_active: true,
        token: ""
    }

    const user1 = {
        name: "Muhammad Asyhar Agmalaro",
        initials: "MAA",
        is_admin: false,
        password: "password",
        is_active: true,
        token: ""
    }
    const user2 = {
        name: "Hari Agung Adrianto",
        initials: "HAA",
        is_admin: false,
        password: "password",
        is_active: true,
        token: ""
    }
    const user3 = {
        name: "Sony Hartono Wijaya",
        initials: "SHW",
        is_admin: false,
        password: "password",
        is_active: true,
        token: ""
    }

    const users = [user1, user2, user3];
    
    try {
        const adminToken = await loginAndGetToken(admin.initials, admin.password);
        admin.token = adminToken;

        for (let i = 0; i < users.length; i++) {
            await createUser(users[i], admin.token);
        }

        for (let i = 0; i < users.length; i++) {
            const userToken = await loginAndGetToken(users[i].initials, users[i].password);
            users[i].token = userToken;
        }

        await createSemester({ date: '2023-08-05' }, admin.token);
        await createSemester({ date: '2024-01-05' }, admin.token);
        await activateSemester(2, admin.token);

        const course1 = {
            semester_id: 1,
            name: "Berpikir Komputasional",
            code: "KOM102",
            course_type: [
                {
                    type: 0,
                    credit: 2,
                    class_count: 26,
                }
            ],
            semesters: 1
        }

        const course2 = {
            semester_id: 1,
            name: "Pengantar Matematika Komputasi",
            code: "KOM120D",
            course_type: [
                {
                    type: 0,
                    credit: 2,
                    class_count: 4,
                },
                {
                    type: 1,
                    credit: 1,
                    class_count: 3,
                }
            ],
            semesters: 3
        }

        const course3 = {
            semester_id: 1,
            name: "Struktur diskret",
            code: "KOM120I",
            course_type: [
                {
                    type: 0,
                    credit: 2,
                    class_count: 4,
                }
            ],
            semesters: 3
        }

        const course4 = {
            semester_id: 2,
            name: "Struktur Data",
            code: "KOM120H",
            course_type: [
                {
                    type: 0,
                    credit: 1,
                    class_count: 4,
                },
                {
                    type: 1,
                    credit: 1,
                    class_count: 3,
                }
            ],
            semesters: 4
        }

        const course5 = {
            semester_id: 2,
            name: "Data Mining",
            code: "KOM1338",
            course_type: [
                {
                    type: 0,
                    credit: 2,
                    class_count: 3,
                },
                {
                    type: 1,
                    credit: 1,
                    class_count: 3,
                }
            ],
            semesters: 6
        }

        const course6 = {
            semester_id: 2,
            name: "Karier dan Etika Ilmu Komputer",
            code: "KOM1306",
            course_type: [
                {
                    type: 0,
                    credit: 2,
                    class_count: 3,
                },
                {
                    type: 1,
                    credit: 1,
                    class_count: 3,
                }
            ],
            semesters: 6
        }

        const course7 = {
            semester_id: 2,
            name: "Pemrograman",
            code: "KOM120C",
            course_type: [
                {
                    type: 0,
                    credit: 1,
                    class_count: 4,
                },
                {
                    type: 1,
                    credit: 1,
                    class_count: 3,
                }
            ],
            semesters: 4
        }

        const course8 = {
            semester_id: 2,
            name: "Metode Penelitian dan Telaah Pustaka",
            code: "KOM1398",
            course_type: [
                {
                    type: 0,
                    credit: 2,
                    class_count: 3,
                },
            ],
            semesters: 6
        }

        let class_count_sum = 0;

        const courses = [course1, course2, course3, course4, course5, course6, course7, course8];

        for (let i = 0; i < courses.length; i++) {
            await createCourse(courses[i], admin.token);
            for (let j = 0; j < courses[i].course_type.length; j++) {
                class_count_sum += courses[i].course_type[j].class_count;
            }
        }

        for (let i = 1; i <= class_count_sum * 14; i++) {
            const probability = i <= 26 ? 0.01 : 0.35;
            const selectedUser = users[Math.floor(Math.random() * users.length)];
            if (Math.random() < probability) {
                await fillSchedule(i, selectedUser.token);
            }
        }

    } catch (error) {
        console.error('Error in main function:', error);
    }
}

main();