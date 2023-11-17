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
import { TimePicker, Button } from 'antd';



const format = 'mm:ss';


const Timer = ({ id, initialTime, isAnyTimerRunning }) => {
    const dispatch = useDispatch();
    const timer = useSelector(state => state.timer.timers.find(t => t.id === id));
    const { currentTime, isRunning, isPaused } = timer;

    const handleUpdateTimer = (time) => {
        const newInitialTime = time.$m * 60 + time.$s;
        dispatch(updateTimer({ id, newInitialTime }));
    };

    useEffect(() => {
        let intervalId;

        if (isRunning && !isPaused) {
            intervalId = setInterval(() => {
                dispatch(tickTimer({ id }));
            }, 1000);
        }

        // Clean up the interval
        return () => clearInterval(intervalId);
    }, [dispatch, id, isRunning, isPaused]);

    // Calculate the stroke dashoffset for the progress effect
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = ((initialTime - currentTime) / initialTime) * circumference;

    // Format timeLeft as MM:SS
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };



    const timeLeft = formatTime(timer.initialTime - timer.currentTime);

    return (
        <div>
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

            <div className='update-timer'>
                <TimePicker disabled={isAnyTimerRunning} onChange={handleUpdateTimer} format={format} showNow={false} />
            </div>
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
    return (
        <div className='timer-controls'>

            <TimePicker
                value={timePickerValue}
                onChange={onTimeChange}
                format={format}
                showNow={false}
                rootClassName='add-timer-input'
                disabled={isAnyTimerRunning}
            />

            <Button type='primary' disabled={isAnyTimerRunning} onClick={onAdd}>Add New Timer</Button>
            <Button type='primary' onClick={onReset} disabled={isAnyTimerRunning}>Reset</Button>
            <Button type='primary' onClick={onDeleteAll} disabled={isAnyTimerRunning}>Delete All</Button>
            <Button type='primary' onClick={onStart} disabled={isAnyTimerRunning || areAllTimersOver}>Start</Button>

            {areTimersPaused ? (
                <Button type='primary' onClick={onResume}>Resume</Button>
            ) : (
                <Button type='primary' onClick={onPause} disabled={areAllTimersOver}>Pause</Button>
            )}

            <Button type='primary' onClick={onStop} disabled={areAllTimersOver}>Stop</Button>
            <Button type='primary' onClick={onResetToInit}>Reset To Init</Button>
        </div>
    );
};


function App() {

  const dispatch = useDispatch();

  const timers = useSelector((state) => state.timer.timers);


    const [timePickerValue, setTimePickerValue] = useState(null);

    const handleAddTimer = () => {
        if (timePickerValue) {
            const initialTime = timePickerValue.minute() * 60 + timePickerValue.second();
            dispatch(addTimer(initialTime));
            setTimePickerValue(null); // Reset TimePicker
        }
    };





  const [initialTimeInput, setInitialTimeInput] = useState('');


    const handleDeleteAll = () => {
        dispatch(deleteAllTimers());
    };



  const onStart = () => {
    const maxTime = Math.max(...timers.map(timer => timer.initialTime));

    timers.forEach(timer => {
      const delay = (maxTime - timer.initialTime) * 1000; // convert to milliseconds

      setTimeout(() => {
        dispatch(startTimer({ id: timer.id }));
      }, delay);
    });
  };


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
    };

    const handleResume = () => {
        dispatch(resumeTimers());
    };

    const handleStop = () => {
        dispatch(stopTimers());
    };

    const handleResetToInit = () => {
        dispatch(resetToInitTimers());
    };


    return (
      <div className="App">
          <div className='add-timer'>

              {/*<TimePicker*/}
              {/*    value={timePickerValue}*/}
              {/*    onChange={setTimePickerValue}*/}
              {/*    format={format}*/}
              {/*    showNow={false}*/}
              {/*    rootClassName='add-timer-input'*/}
              {/*/>*/}

              <TimerControls
                  onAdd={() => handleAddTimer(initialTimeInput)}
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
          </div>


          <div className="timers-container">
          {timers.map(timer => (
              <Timer isAnyTimerRunning={isAnyTimerRunning} key={timer.id} id={timer.id} initialTime={timer.initialTime} currentTime={timer.currentTime} />
          ))}
        </div>
      </div>
  );
}

export default App;
