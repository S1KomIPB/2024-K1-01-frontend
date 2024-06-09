export interface JWTPayload {
    id: number;
    initial: string;
    role: string;
    exp: number;
}