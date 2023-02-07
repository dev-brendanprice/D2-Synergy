
// Insert commas into numbers where applicable
// @int {num}
export function InsertSeperators(num) {
    return new Intl.NumberFormat().format(num);
};