import { writable } from 'svelte/store';
import { BASE_URL } from './urlStore.js';

export const user = writable(null);

export const fetchUser = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/user', {
          credentials: 'include',
        });
        if(!response.ok) {
            user.set(null);
            return;
        }
        const result = await response.json();
        user.set(result.data);
        return result.data;
    } catch (error) {
        user.set(null);
        return false;
    }
};