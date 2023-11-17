export const saveTimersToLocalStorage = (timers) => {
    localStorage.setItem('timers', JSON.stringify(timers));
};

export const loadTimersFromLocalStorage = () => {
    const savedTimers = localStorage.getItem('timers');
    return savedTimers ? JSON.parse(savedTimers) : [];
};

export const format = 'mm:ss';
