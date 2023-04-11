
// Add a new row to a defined table
// @object {table}, @array {data}
export function AddTableRow(table, data = ['', '']) {

    // "data" parameter
    // 0, Item name
    // 1, Item relation count

    // Insert new row using data parameter
    const row = table.insertRow(-1);

    // Iterate over data array and insert each item into a row. Push row to DOM
    for (let i=0; i < data.length; i++) {
        row.insertCell(i).innerHTML = data[i];
    };
};