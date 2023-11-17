import React, {useEffect, useState} from 'react';
import './App.css';
import {useDispatch, useSelector} from "react-redux";
import {
    addTimer,
    deleteAllTimers,
    pauseTimers,
    resetTimers,
    resetToInitTimers,
    resumeTimers,
    startTimer,
    stopTimers,
} from "./store/timerSlice";
import './timer.css'
import Timer from "./components/Timer";
import {TimerClass} from "./TimerClass";
import TimerControls from "./components/TimerControls";


function App() {

    const dispatch = useDispatch();

    const timers = useSelector((state) => state.timer.timers);


    const [timerTimeouts, setTimerTimeouts] = useState({});

    const [timePickerValue, setTimePickerValue] = useState(null);

    const handleAddTimer = () => {
        if (timePickerValue) {
            const initialTime = timePickerValue.minute() * 60 + timePickerValue.second();
            dispatch(addTimer(initialTime));
            setTimePickerValue(null); // Reset TimePicker
        }
    };

    const handleDeleteAll = () => {
        dispatch(deleteAllTimers());
    };

    useEffect(() => {
        return () => {
            // Clear all timeouts when the component unmounts
            Object.values(timerTimeouts).forEach(clearTimeout);
        };
    }, [timerTimeouts]);


    const handleStart = () => {
        handleResetToInit()
    };

    const handleReset = () => {
        dispatch(resetTimers());
    };

    const isAnyTimerRunning = timers.some(timer => timer.isRunning);

    const areTimersPaused = timers.some(timer => timer.isPaused);

    const areAllTimersOver = timers.every(timer => timer.currentTime >= timer.initialTime);


    const handlePause = () => {
        dispatch(pauseTimers());
        Object.values(timerTimeouts).forEach(timerInstance => {
            if (timerInstance) timerInstance.pause();
        });
    };

    const handleResume = () => {
        dispatch(resumeTimers());
        Object.values(timerTimeouts).forEach(timerInstance => {
            if (timerInstance) timerInstance.resume();
        });
    };


    const handleStop = () => {
        dispatch(stopTimers());
        Object.values(timerTimeouts).forEach(timerInstance => {
            if (timerInstance) timerInstance.pause();
        });

        setTimerTimeouts({});
    };


    const handleResetToInit = () => {
        Object.values(timerTimeouts).forEach(timerInstance => {
            if (timerInstance) timerInstance.pause();
        });

        dispatch(resetToInitTimers());
        const maxTime = Math.max(...timers.map(timer => timer.initialTime));

        timers.forEach(timer => {
            const delay = (maxTime - timer.initialTime) * 1000;
            const timerInstance = new TimerClass(() => dispatch(startTimer({id: timer.id})), delay);
            setTimerTimeouts(prev => ({...prev, [timer.id]: timerInstance}));
        });
    };


    return (
        <div className="App">
            <TimerControls
                onAdd={() => handleAddTimer('')}
                onStart={handleStart}
                onReset={handleReset}
                isAnyTimerRunning={isAnyTimerRunning}
                onDeleteAll={handleDeleteAll}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
                onResetToInit={handleResetToInit}
                areTimersPaused={areTimersPaused}
                areAllTimersOver={areAllTimersOver}
                onTimeChange={setTimePickerValue}
                timePickerValue={timePickerValue}
            />


            <div className="timers-container">
                {timers.map(timer => (
                    <Timer isAnyTimerRunning={isAnyTimerRunning} key={timer.id} id={timer.id}
                           initialTime={timer.initialTime} currentTime={timer.currentTime}/>
                ))}
            </div>


        </div>
    );
}

export default App;
