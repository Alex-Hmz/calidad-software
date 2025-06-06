
export interface CreateTrace{
    userId: string;
    traceName: string;
    traceNotes:string;
    isValid: boolean;
}
export interface Trace{
    id: string;
    userId: string;
    traceName: string;
    traceNotes:string;
}