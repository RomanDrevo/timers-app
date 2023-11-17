import {useDispatch, useSelector} from "react-redux";
import {tickTimer, updateTimer} from "../store/timerSlice";
import React, {useEffect, useState} from "react";
import {Button, Modal, TimePicker} from "antd";
import {format} from '../utils'

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

export default Timer