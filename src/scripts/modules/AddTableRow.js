
// Add a new row to a defined table
// @object {table}, @array {data}
export function AddTableRow(table, data = ['', '', '']) {

    // data param
    // 0, Item Name / 1, Category / 2, Relation

    // Insert new row using data parameter
    const row = table.insertRow(-1);

    // Insert data into cells
    for (let i=0; i<data.length; i++) {
        row.insertCell(i).innerHTML = data[i];
    };
};