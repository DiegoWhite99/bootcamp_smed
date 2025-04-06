/* --------------------------->inicio de apartado de mision y vision<----------------------- */
document.getElementById('leftSide').addEventListener('click', function () {
    document.getElementById('leftSide').classList.add('hide-side-left');
    document.getElementById('rightSide').classList.add('hide-side-right');
    document.getElementById('content').classList.add('show-content');
    document.getElementById('contentText').textContent = 'Contenido de Misión';
});

document.getElementById('rightSide').addEventListener('click', function () {
    document.getElementById('leftSide').classList.add('hide-side-left');
    document.getElementById('rightSide').classList.add('hide-side-right');
    document.getElementById('content').classList.add('show-content');
    document.getElementById('contentText').textContent = 'Contenido de Visión';
});
