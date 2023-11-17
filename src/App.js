import React, {useEffect, useState} from 'react';
import './App.css';
import {useDispatch, useSelector} from "react-redux";
import {
    addTimer,
    deleteAllTimers,
    pauseTimers,
    resetTimers, resetToInitTimers, resumeTimers,
    startTimer, stopTimers,
    tickTimer,
    updateTimer
} from "./store/timerSlice";
import './timer.css'
import {TimePicker, Button, Modal} from 'antd';


const format = 'mm:ss';

class TimerClass {
    constructor(callback, delay) {
        this.timerId = null;
        this.start = null;
        this.remaining = delay;
        this.callback = callback;

        this.resume();
    }

    pause() {
        window.clearTimeout(this.timerId);
        this.timerId = null;
        this.remaining -= Date.now() - this.start;
    }

    resume() {
        if (this.timerId) {
            return;
        }

        this.start = Date.now();
        this.timerId = window.setTimeout(this.callback, this.remaining);
    }
}


const Timer = ({id, initialTime, isAnyTimerRunning}) => {
    const dispatch = useDispatch();
    const timer = useSelector(state => state.timer.timers.find(t => t.id === id));
    const {currentTime, isRunning, isPaused} = timer;

    const handleUpdateTimer = (time) => {
        const newInitialTime = time.$m * 60 + time.$s;
        dispatch(updateTimer({id, newInitialTime}));
    };

    useEffect(() => {
        let intervalId;
        if (isRunning && !isPaused) {
            intervalId = setInterval(() => {
                dispatch(tickTimer({ id }));
            }, 1000);
        } else {
            clearInterval(intervalId);
        }
        return () => clearInterval(intervalId);
    }, [dispatch, id, isRunning, isPaused]);


    // Calculate the stroke dashoffset for the progress effect
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = ((initialTime - currentTime) / initialTime) * circumference;

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };


    const timeLeft = formatTime(timer.initialTime - timer.currentTime);


    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <div className='timer-wrapper'>
            <div className="timer">
                <svg width="80" height="80" className="timer-svg">
                    <circle
                        stroke="green"
                        fill="transparent"
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - offset}
                        r={radius}
                        cx="40"
                        cy="40"
                    />
                </svg>
                <div className="timer-text">
                    {timeLeft}
                </div>
            </div>

            <Button disabled={isAnyTimerRunning} type='primary' onClick={showModal}>Update timer</Button>


            <Modal title="Update timer" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <TimePicker
                    onChange={handleUpdateTimer}
                    format={format}
                    showNow={false}
                />

            </Modal>

        </div>

    );
};


const TimerControls = ({
                           onAdd,
                           onReset,
                           onDeleteAll,
                           onStart,
                           onPause,
                           onResume,
                           onStop,
                           onResetToInit,
                           isAnyTimerRunning,
                           areTimersPaused,
                           areAllTimersOver,
                           onTimeChange,
                           timePickerValue
                       }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
        onAdd()
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };


    return (
        <div className='timer-controls'>

            <div className='timer-controls_manage'>
                <Button className='timer-control' type='primary' disabled={isAnyTimerRunning} onClick={showModal}>Add
                    New Timer</Button>

                <Button className='timer-control' type='primary' onClick={onReset}
                        disabled={isAnyTimerRunning}>Reset</Button>
                <Button className='timer-control' type='primary' onClick={onDeleteAll} disabled={isAnyTimerRunning}>Delete
                    All</Button>
                <Button className='timer-control' type='primary' onClick={onStart}
                        disabled={isAnyTimerRunning || areAllTimersOver}>Start</Button>

                {areTimersPaused ? (
                    <Button className='timer-control' type='primary'
                            onClick={onResume}>Resume</Button>
                ) : (
                    <Button className='timer-control' type='primary' onClick={onPause}>Pause</Button>
                )}

                <Button className='timer-control' type='primary' onClick={onStop}
                        disabled={areAllTimersOver || !isAnyTimerRunning}>Stop</Button>
                <Button
                    className='timer-control'
                    type='primary'
                    disabled={!isAnyTimerRunning}
                    onClick={onResetToInit}
                >
                    Reset To Init
                </Button>
            </div>


            <Modal title="Create new timer" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <TimePicker
                    value={timePickerValue}
                    onChange={onTimeChange}
                    format={format}
                    showNow={false}
                    rootClassName='add-timer-input'
                    disabled={isAnyTimerRunning}
                />
            </Modal>

        </div>
    );
};


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


    const onStart = () => {
        const maxTime = Math.max(...timers.map(timer => timer.initialTime));

        timers.forEach(timer => {
            const delay = (maxTime - timer.initialTime) * 1000;
            const timerInstance = new TimerClass(() => dispatch(startTimer({ id: timer.id })), delay);
            setTimerTimeouts(prev => ({ ...prev, [timer.id]: timerInstance }));
        });
    };

    useEffect(() => {
        return () => {
            // Clear all timeouts when the component unmounts
            Object.values(timerTimeouts).forEach(clearTimeout);
        };
    }, [timerTimeouts]);


    const handleStart = () => {
        onStart();
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
            const timerInstance = new TimerClass(() => dispatch(startTimer({ id: timer.id })), delay);
            setTimerTimeouts(prev => ({ ...prev, [timer.id]: timerInstance }));
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
