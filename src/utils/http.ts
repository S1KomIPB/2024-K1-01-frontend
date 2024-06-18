import { getAuthorizationHeader } from "./cookie";

export const fetchDataAuthenticated = async (url: string | URL | Request, options: { method: string, headers?: { [key: string]: string } }) => {
    const headers = getAuthorizationHeader();
    options = {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    };
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }
    return response.json();
};

export const fetchDataAuthenticatedWithBody = async (url: string | URL | Request, options: { method: string, body: string, headers?: { [key: string]: string } }) => {
    const headers = getAuthorizationHeader();
    options = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...headers,
            ...options.headers
        }
    };
    const response = await fetch(url, options);
    if (!response.ok) {
        if (response.body) {
            const error = await response.json();
            throw new Error(error.message);
        } else {
            throw new Error('Failed to fetch data');
        }
    }
    return response.json();
}