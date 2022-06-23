// Plug in current date to date selector
window.onload = document.querySelector('#dateInput').value = new Date().toISOString().split('T')[0];
// Load data for today on page load
window.onload = getCAdata();

function addLoader() {
    const loader = document.createElement('div')
    document.querySelector('body').appendChild(loader)
    loader.id = 'loader';
    loader.classList.add('loader');
    loader.style.position = 'fixed';
    loader.style.top = '50%';
    loader.style.left = '50%';
    loader.style.transform = 'translate(-40%, -50%)';
    loader.style.width = '100px';
    loader.style.height = '100px';
    loader.style.background = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHN0cm9rZT0iI2RkZCIgZmlsbD0iI2RkZCI+PGNpcmNsZSBjeD0iNCIgY3k9IjEyIiByPSIzIj48YW5pbWF0ZSBpZD0iYSIgYmVnaW49IjA7Yi5lbmQtMC4yNXMiIGF0dHJpYnV0ZU5hbWU9InIiIGR1cj0iMC43NXMiIHZhbHVlcz0iMzsuMjszIi8+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyI+PGFuaW1hdGUgYmVnaW49ImEuZW5kLTAuNnMiIGF0dHJpYnV0ZU5hbWU9InIiIGR1cj0iMC43NXMiIHZhbHVlcz0iMzsuMjszIi8+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMjAiIGN5PSIxMiIgcj0iMyI+PGFuaW1hdGUgaWQ9ImIiIGJlZ2luPSJhLmVuZC0wLjQ1cyIgYXR0cmlidXRlTmFtZT0iciIgZHVyPSIwLjc1cyIgdmFsdWVzPSIzOy4yOzMiLz48L2NpcmNsZT48L3N2Zz4=') no-repeat";
}
function removeLoader() {
    document.querySelector('#loader').remove();
}

async function getCAdata() {
    queryString = `?date=${document.querySelector('#dateInput').value}`;
    const cadata = document.querySelector('#cadata');
    addLoader();
    const resp = await fetch('/getcadata/' + queryString, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await resp.text();
    cadata.innerHTML = data;
    removeLoader();
    document.querySelectorAll('[data-object]').forEach(e => e.addEventListener('click', openDetails));
    document.querySelector('#searchDate').addEventListener('click', getCAdata);
}

async function openDetails(event) {
    document.querySelectorAll('.row-active').forEach(e => e.classList.remove('row-active'));
    let objName = event.currentTarget.getAttribute('data-object');
    const rowClicked = event.currentTarget;
    rowClicked.classList.add('row-active');
    const div = document.querySelector('#object-data');
    addLoader();
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
    removeLoader();
    window.scrollTo({top: 0, behavior: 'smooth'});
}
