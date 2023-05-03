
// Find the next reset time, specific to the users timezone
export function getNextTuesday() {

  // Get next tuesday using BST as a baseline
  let targetTime = '17:00:00 GMT+0100';
  let today = new Date();
  let daysUntilTuesday = (9 - today.getDay()) % 7;
  let nextTuesday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilTuesday);

  let targetDate = new Date(`${nextTuesday.toDateString()} ${targetTime}`);
  let targetTimestamp = targetDate.getTime();

  // Get local time offset
  let localOffset = new Date().getTimezoneOffset() * 60 * 1000;
  let adjustedTimestamp = targetTimestamp - localOffset;
  let adjustedDate = new Date(adjustedTimestamp);

  // Check if reset is today
  if (adjustedDate < today) {
    adjustedDate.setDate(adjustedDate.getDate() + 7);
  };

  // Get field data
  let monthString = (adjustedDate.getMonth() + 1).toString().padStart(2, '0');
  let dateString = adjustedDate.getDate().toString().padStart(2, '0');
  let hoursString = adjustedDate.getHours().toString().padStart(2, '0');
  let minutesString = adjustedDate.getMinutes().toString().padStart(2, '0');

  return `${monthString}/${dateString} ${hoursString}:${minutesString}`;
};