const wait = delay => new Promise(resolve => setTimeout(resolve, delay));

window.onload = document.querySelector('#dateInput').value = new Date().toISOString().split('T')[0];
window.onload = getCAdata(document.querySelector('#dateInput').value);

async function getCAdata() {
    queryString = `?date=${document.querySelector('#dateInput').value}`;
    const cadata = document.querySelector('#cadata');
    document.querySelector('#loader').classList.add('loader');
    const resp = await fetch('/getcadata/' + queryString, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await resp.text();
    cadata.innerHTML = data;
    document.querySelector('#loader').classList.remove('loader');
    document.querySelectorAll('[data-object]').forEach(e => e.addEventListener('click', openDetails));
    document.querySelector('#searchDate').addEventListener('click', getCAdata);
}


async function openDetails(event) {
    
    document.querySelectorAll('.row-active').forEach(e => e.classList.remove('row-active'));
    let objName = event.currentTarget.getAttribute('data-object');
    const rowClicked = event.currentTarget;
    rowClicked.classList.add('row-active');
    const div = document.querySelector('#object-data');

    document.querySelector('#loader').classList.add('loader');

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

    div.innerHTML = data;

    document.querySelector('#loader').classList.remove('loader');
    
    window.scrollTo({top: 0, behavior: 'smooth'});
}

