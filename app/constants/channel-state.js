export default {
    1: {
        text: 'Offline',
        desc: 'Channel is in Offline state.',
    },
    2: {
        text: 'Starting',
        desc: 'Channel is already starting, skipping retry of start.',
    },
    3: {
        text: 'Paused',
        desc: 'Channel is paused, skipping retry of start.Please invoke play().',
    },
    4: {
        text: 'Playing',
        desc: 'Channel is playing, skipping retry of start.',
    },
    5: {
        text: 'Recovering',
        desc: 'Channel tries to recover from some state will retry to reconnect.',
    },
    6: {
        text: 'Reconnecting',
        desc: 'Channel is reconnecting after being disconnected.',
    },
    7: {
        text: 'StandBy',
        desc: 'Channel will try to connect to the stream in StandBy interval(15000ms).',
    },
    8: {
        text: 'Stopped',
        desc: 'Channel is stopped, skipping retry of start.',
    },
    9: {
        text: 'Unauthorized',
        desc: 'Channel is unauthorized, skipping retry of start.Please provide a new token and invoke start().',
    },
    10: {
        text: 'GeoRestricted',
        desc: 'Channel is geo restricted, skipping retry of start.Please provide a new token and invoke start().',
    },
    11: {
        text: 'GeoBlocked',
        desc: 'Channel is geo blocked, skipping retry of start.Please provide a new token and invoke start().',
    },
    12: {
        text: 'Error',
        desc: 'Channel is not able to subscribe to stream due to a general failed subscription.',
    },
    13: {
        text: 'UnsupportedFeature',
        desc: 'Channel is not supporting the requested feature on this browser.This can be due to browser limitations or missing configuration for a player for the requested capability.',
    },
};