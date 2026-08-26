function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const intervals = [
        [60, 's'],
        [60, 'm'],
        [24, 'hr'],
        [7, 'd'],
        [4.34524, 'w'],
        [12, 'mo'],
        [Number.POSITIVE_INFINITY, 'yr'],
    ];

    let i = 0;
    let count = seconds;
    while (i < intervals.length - 1 && count >= intervals[i][0]) {
        count /= intervals[i][0];
        i++;
    }
    count = Math.floor(count);
    const label = intervals[i][1];
    return count === 1 ? `1${label} ago` : `${count}${label} ago`;
}

export default getTimeAgo;