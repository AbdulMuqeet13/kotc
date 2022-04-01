export function getUser() {
    const token = localStorage.getItem('auth_token');
    return token ? JSON.parse(localStorage.getItem('auth_user')) : null;
}

export function getBannerPage(item) {
    switch (item) {
        case 1:
            return 'Friends'
        case 2:
            return 'Matches'
        case 3:
            return 'Question Page'
        case 4:
            return 'Multiplayer Menu'
        case 5:
            return 'Single Player Menu'
        case 6:
            return 'My Stats'
        case 7:
            return 'Your Answer'
        case 8:
            return 'Endless Menu'
        case 9:
            return 'Home Page'
        case 10:
            return 'Adaptive bank Menu'
        case 11:
            return 'Game over'
        case 12:
            return 'Review Mode Menu'
        default:
            return 'Invalid Page'
    }
}

export function getBannerPosition(item) {
    switch (item) {
        case 1:
            return 'Top'
        case 2:
            return 'Bottom'
        default:
            return 'Invalid Position'
    }
}

export function getBannerAction(item) {
    switch (item) {
        case 1:
            return 'Show Subscription Packages'
        case 2:
            return 'Play Endless Mode'
        case 3:
            return 'Play Adaptive Qbank'
        case 4:
            return 'Spin to get Random Discount'
        case 5:
            return 'Play Multiplayer'
        case 6:
            return 'Play Review Mode'
        case 7:
            return 'Link Institution'
        case 8:
            return 'Play Timed Mode'
        case 9:
            return 'Share Feedback'
        case 10:
            return 'Open Link'
        default:
            return 'Invalid Action'
    }
}

export function getDays(item) {
    switch (item) {
        case 0:
            return 'Sunday'
        case 1:
            return 'Monday'
        case 2:
            return 'Tuesday'
        case 3:
            return 'Wednesday'
        case 4:
            return 'Thursday'
        case 5:
            return 'Friday'
        case 6:
            return 'Saturday'
        default:
            return 'Invalid Day'
    }
}

