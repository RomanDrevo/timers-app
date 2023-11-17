import {createSlice} from "@reduxjs/toolkit";
import {loadTimersFromLocalStorage, saveTimersToLocalStorage} from "../utils";



const timersSlice = createSlice({
    name: 'timers',
    initialState: {
        timers: loadTimersFromLocalStorage()
    },
    reducers: {
        addTimer: (state, action) => {
            // When adding a new timer, include an isRunning flag set to false
            state.timers.push({
                id: Math.random(), // Consider using a more reliable ID generation method
                initialTime: action.payload,
                currentTime: 0,
                isRunning: false,
                isPaused: false
            });
            saveTimersToLocalStorage(state.timers);
        },
        startTimer: (state, action) => {
            const timer = state.timers.find(timer => timer.id === action.payload.id);
            if (timer && timer.initialTime > 0) {
                timer.isRunning = true;
            }
        },
        tickTimer: (state, action) => {
            const timer = state.timers.find(timer => timer.id === action.payload.id);
            if (timer && timer.isRunning && !timer.isPaused) {
                timer.currentTime += 1;
                if (timer.currentTime >= timer.initialTime) {
                    timer.isRunning = false;
                }
            }
        },
        resetTimers: (state) => {
            state.timers.forEach(timer => {
                timer.currentTime = 0;
                timer.initialTime = 0;
                timer.isRunning = false;
            });
            saveTimersToLocalStorage(state.timers);
        },
        updateTimer: (state, action) => {
            const timer = state.timers.find(timer => timer.id === action.payload.id);
            if (timer) {
                timer.initialTime = action.payload.newInitialTime;
                // timer.currentTime = 0;
            }
            saveTimersToLocalStorage(state.timers);
        },
        deleteAllTimers: (state) => {
            state.timers = [];
            localStorage.removeItem('timers');
        },
        pauseTimers: (state, action) => {
            state.timers.forEach(timer => {
                timer.isPaused = true;
                timer.isRunning = false;
            });
        },
        resumeTimers: (state, action) => {
            state.timers.forEach(timer => {
                timer.isRunning = true;
                timer.isPaused = false;
            });
        },
        stopTimers: (state) => {
            state.timers.forEach(timer => {
                timer.isRunning = false;
                timer.currentTime = 0
            });
        },
        resetToInitTimers: (state) => {
            state.timers.forEach(timer => {
                timer.currentTime = 0;
                timer.isRunning = true;
            });

            // state.isPaused = false;
        },
    },
});

export const { deleteAllTimers, updateTimer, addTimer, startTimer, tickTimer, resetTimers, pauseTimers, resetToInitTimers, resumeTimers, stopTimers } = timersSlice.actions;
export const timerReducer = timersSlice.reducer;