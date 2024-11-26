
export interface IUserSlice {
    isLoggedIn: boolean;
    user: {
        _id: string;
        name: string;
        email: string;
        connections: {
            _id: string;
            name: string;
        }[];
    } | null;
}
