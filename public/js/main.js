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
  queryString = `?date=${document.querySelector("#dateInput").value}`;
  const cadata = document.querySelector("#cadata");
  addSpinner();
  const resp = await fetch("/getcadata/" + queryString, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await resp.text();
  cadata.innerHTML = data;
  removeSpinner();
  document
    .querySelectorAll("[data-object]")
    .forEach((e) => e.addEventListener("click", openDetails));
}

async function openDetails(event) {
  let objName = event.currentTarget.getAttribute("data-object");

  const objectDetails = document.querySelector(
    `[data-object-details="${objName}"]`
  );

  const selectedRow = event.currentTarget;

  selectedRow.classList.toggle("table__row-active");

  if (objectDetails) {
    if (event.target.tagName !== "A") {
      objectDetails.style.display =
        objectDetails.style.display === "none" ? "table-row" : "none";
    }
  } else {
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
    const data = await resp.text();
    removeSpinner();
    selectedRow.insertAdjacentHTML("afterend", data);
  }
}
