document.querySelector('#ca-data').addEventListener('click', openAnimation);

async function openAnimation(event) {
    let objName = event.target.getAttribute('data-object');
    if (!objName) return;
    const resp = await fetch('/animation', {
        method: 'POST',
        body: JSON.stringify({
            'name': objName
        }),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
    })
    const data = await resp.json();
    console.log(data);

    window.open(data.url, '_blank')
}