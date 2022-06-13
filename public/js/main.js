document.querySelectorAll('[data-object]').forEach(e => e.addEventListener('click', openDetails));

// async function openAnimation(event) {
//     let objName = event.target.getAttribute('data-object');
//     if (!objName) return;
//     const resp = await fetch('/animation', {
//         method: 'POST',
//         body: JSON.stringify({
//             'name': objName
//         }),
//         headers: {
//             'Content-Type': 'application/json',
//             'Access-Control-Allow-Origin': '*'
//         },
//     })
//     const data = await resp.json();
//     console.log(data);

//     window.open(data.url, '_blank')
// }


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