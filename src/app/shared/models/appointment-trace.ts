
export interface CreateTrace{
    userId: string;
    traceName: string;
    traceNotes:string;
    createAt: Date;
    isValid: boolean;
}
export interface Trace{
    id: string;
    userId: string;
    traceName: string;
    traceNotes:string;
}