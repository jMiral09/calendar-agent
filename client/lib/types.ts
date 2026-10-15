export type Role = "user" | "assistant";
export interface ChatEntry{
    role: Role;
    text: string;
}

export interface ChatRequestBody {
    message: string;
}

export interface ChatResponseBody {
    reply: string
}