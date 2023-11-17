import {createSlice} from "@reduxjs/toolkit";
import {loadTimersFromLocalStorage, saveTimersToLocalStorage} from "../utils";



const timersSlice = createSlice({
    name: 'timers',
    initialState: {
        timers: loadTimersFromLocalStorage()
    },
    reducers: {
        addTimer: (state, action) => {
            state.timers.push({
                id: Math.random(),
                initialTime: action.payload,
                currentTime: 0,
                isRunning: false,
                isPaused: false
            });
            saveTimersToLocalStorage(state.timers);
        },
        resetToInitTimers: (state) => {
            state.timers.forEach(timer => {
                timer.currentTime = 0;
                timer.isRunning = false;
                timer.isPaused = false;
            });
            saveTimersToLocalStorage(state.timers);
        },

        startTimer: (state, action) => {
            const timer = state.timers.find(timer => timer.id === action.payload.id);
            if (timer) {
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
            const pauseTime = action.payload;
            state.timers.forEach(timer => {
                if (timer.isRunning && !timer.isPaused) {
                    timer.isPaused = true;
                    // Calculate the remaining time until the timer was supposed to end
                    timer.remainingTime = (timer.initialTime - timer.currentTime) * 1000 - (Date.now() - pauseTime);
                }
            });
        },

        resumeTimers: (state) => {
            state.timers.forEach(timer => {
                if (timer.isPaused) {
                    timer.isRunning = true;
                    timer.isPaused = false;
                }
            });
        },

        stopTimers: (state) => {
            state.timers.forEach(timer => {
                timer.isRunning = false;
                timer.currentTime = 0
            });
        },
    },
});

export const { deleteAllTimers, updateTimer, addTimer, startTimer, tickTimer, resetTimers, pauseTimers, resetToInitTimers, resumeTimers, stopTimers } = timersSlice.actions;
export const timerReducer = timersSlice.reducer;
