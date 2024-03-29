"use strict";

window.addEventListener(
  "load",
  async () => {
    // Plug in current date to date selector
    document.querySelector("#dateInput").value = new Date()
      .toISOString()
      .split("T")[0];
    document.querySelector("#searchDate").addEventListener("click", getCAdata);
    // Load data for today on page load
    await getCAdata();
  },
  { once: true }
);

function sortTable(e) {
  const colNum = e.target.cellIndex;
  const tbody = document.querySelector(".table__body");

  const rowsArray = []; // regular rows
  const rowsDetailsArray = []; // rows with details
  Array.from(tbody.rows).forEach((row) =>
    row.dataset.objectDetails ? rowsDetailsArray.push(row) : rowsArray.push(row)
  );

  const sortFunc = (colNum) => {
    switch (colNum) {
      // Sort by date
      case 1:
        return (a, b) =>
          +a.cells[colNum].dataset.jd - +b.cells[colNum].dataset.jd;
      // Sort by distance
      case 2:
        return (a, b) =>
          +a.cells[colNum].dataset.distance - +b.cells[colNum].dataset.distance;
      // Sort by velocity
      case 3:
        return (a, b) =>
          +a.cells[colNum + 1].textContent.trim() -
          +b.cells[colNum + 1].textContent.trim();
    }
  };

  rowsArray.sort(sortFunc(colNum));

  const nodes = [];
  rowsArray.forEach((row) => {
    nodes.push(row);
    const details = rowsDetailsArray.find((e) => {
      return e.dataset.objectDetails === row.dataset.object;
    });
    if (details) {
      nodes.push(details);
    }
  });
  // Appending existing rows removes them from old places
  tbody.append(...nodes);
}

function addSpinner() {
  const backdrop = document.createElement("div");
  document.querySelector("body").appendChild(backdrop);
  const spinner = document.createElement("div");
  backdrop.appendChild(spinner);

  spinner.id = "spinner";
  backdrop.id = "backdrop";
  spinner.classList.add("spinner");
  backdrop.classList.add("backdrop");
  document.querySelector("body").style.overflow = "hidden";
}
function removeSpinner() {
  document.querySelector("#backdrop").remove();
  document.querySelector("body").style.removeProperty("overflow");
}

async function getCAdata() {
  const queryString = `?date=${document.querySelector("#dateInput").value}`;
  const cadata = document.querySelector("#cadata");
  addSpinner();
  const resp = await fetch("/getcadata/" + queryString, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!resp.ok) {
    cadata.innerHTML = `<div class="container">
                          <div class="error">
                            <h3>Houston, we have a problem</h3>
                            <h4>500. Unexpected Error...</h4>
                          </div>
                        </div>`;

    removeSpinner();
    return;
  }
  const data = await resp.text();
  cadata.innerHTML = data;
  removeSpinner();
  document
    .querySelectorAll("[data-object]")
    .forEach((e) => e.addEventListener("click", openDetails));
  // Add event listener for table head
  document.querySelector(".table__head").addEventListener("click", sortTable);
}

async function openDetails(event) {
  const objName = event.currentTarget.getAttribute("data-object");

  const objectDetails = document.querySelector(
    `[data-object-details="${objName}"]`
  );

  const selectedRow = event.currentTarget;

  if (objectDetails) {
    if (event.target.tagName !== "A") {
      selectedRow.classList.toggle("table__row-active");
      objectDetails.style.display =
        objectDetails.style.display === "none" ? "table-row" : "none";
    }
  } else {
    selectedRow.classList.toggle("table__row-active");
    addSpinner();
    const resp = await fetch("/getobjectdata", {
      method: "POST",
      body: JSON.stringify({
        name: objName,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    let data;
    if (!resp.ok) {
      data = `<tr class="object-details" data-object-details=${objName}>
                <td colspan="6">An error occured while fetching data</td>
              </tr>`;
    } else {
      data = await resp.text();
    }
    removeSpinner();
    selectedRow.insertAdjacentHTML("afterend", data);
  }
}
