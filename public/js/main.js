window.onload = getCAdata();

async function getCAdata(date) {
    date = date ? `?date=${date}` : '';
    console.log('/getcadata/' + date);
    const cadata = document.querySelector('#cadata');
    const resp = await fetch('/getcadata/' + date, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await resp.text();
    console.log(data);
    cadata.innerHTML = data;

    document.querySelectorAll('[data-object]').forEach(e => e.addEventListener('click', openDetails));

    document.querySelector('#searchDate').addEventListener('click', formHandler);
}


async function formHandler(event) {
    const date = document.querySelector('#dateInput').value;
    await getCAdata(date);
}

async function openDetails(event) {
    document.querySelectorAll('.row-active').forEach(e => e.classList.remove('row-active'));
    let objName = event.currentTarget.getAttribute('data-object');
    console.log(objName);
    const rowClicked = event.currentTarget;
    rowClicked.classList.add('row-active');
    const resp = await fetch('/getobjectdata', {
        method: 'POST',
        body: JSON.stringify({
            'name': objName
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await resp.text();

    const div = document.querySelector('#object-data');
    div.innerHTML = data;
    window.scrollTo({top: 0, behavior: 'smooth'});
}

