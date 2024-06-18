import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const getCookies = (name: string) => {
    const cookies = document.cookie.split("; ");
    const cookie = cookies.find((cookie) => cookie.startsWith(name));
    return cookie?.split("=")[1];
}

export const setCookies = (name: string, value: string) => {
    document.cookie = `${name}=${value}; path=/`;
}

export const useCheckToken = () => {
    const router = useRouter();
    useEffect(() => {
        const jwt = getCookies('token');
        if (!jwt){
            router.push('/login');
        }
        if (jwt){
            const payload = jwt.split('.')[1];
            const decodedPayload = atob(payload);
            const parsedPayload = JSON.parse(decodedPayload);
            if (parsedPayload.exp < Date.now() / 1000){
                removeToken();
                router.push('/login');
            }
        }
    }, [router]);
}

export const getAuthorizationHeader = () => {
    const token = getCookies("token");
    return { Authorization: `Bearer ${token}` };
};

export const removeToken = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export const getJWTPayload = (key: string) => {
    const jwt = getCookies('token');
    if (!jwt) return null;
    const payload = jwt.split('.')[1];
    const decodedPayload = atob(payload);
    const parsedPayload = JSON.parse(decodedPayload);
    return parsedPayload[key];
}