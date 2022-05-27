let nav = document.querySelector('nav');
let id = null;
let name = null
fetch('/nav').then(d=>d.json()).then(r=>nav.innerHTML = r.html);

(async ()=>{
    //debugger
    let respond = await fetch('/user')
    let result = await respond.json()

    id = result.user.id;
    name = result.user.name
})();//IIFE
