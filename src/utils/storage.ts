interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

export const storage = {
  setToken: (token: string) => {
    localStorage.setItem('access_token', token);
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },
  
  removeToken: () => {
    localStorage.removeItem('access_token');
  },
  
  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  removeUser: () => {
    localStorage.removeItem('user');
  },
  
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }
};