import React, {useState} from "react";
import {Button, Modal, TimePicker} from "antd";
import {format} from "../utils";

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
                           timePickerValue,
                           timersCount
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


    const isTimerListEmpty = timersCount === 0;
    const canModifyTimers = !isAnyTimerRunning && !isTimerListEmpty;

    return (
        <div className='timer-controls'>

            <div className='timer-controls_manage'>
                <Button className='timer-control' type='primary' disabled={isAnyTimerRunning} onClick={showModal}>Add
                    New Timer</Button>

                <Button className='timer-control' type='primary' onClick={onReset}
                        disabled={!canModifyTimers}>Reset</Button>
                <Button className='timer-control' type='primary' onClick={onDeleteAll} disabled={!canModifyTimers}>Delete
                    All</Button>
                <Button disabled={isTimerListEmpty} className='timer-control' type='primary' onClick={onStart}>Start</Button>

                {areTimersPaused ? (
                    <Button className='timer-control' type='primary'
                            onClick={onResume}>Resume</Button>
                ) : (
                    <Button disabled={areAllTimersOver || !isAnyTimerRunning} className='timer-control' type='primary' onClick={onPause}>Pause</Button>
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

export default TimerControls