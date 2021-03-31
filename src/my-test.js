function component() {
    const element = document.createElement('p');
    element.innerHTML = 'This content called from my-test.js!';
    return element;
}
document.body.appendChild(component());