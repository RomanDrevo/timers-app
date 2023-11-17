import { configureStore } from '@reduxjs/toolkit';
import { timerReducer } from './timerSlice';

export const store = configureStore({
    reducer: {
        timer: timerReducer,
    },
});
