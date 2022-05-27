let members_container = document.querySelector('.Mcontainer .row')

fetch('/members')
.then(d=>d.json())
.then(d=> renderList(d))

function deleteRecord(id,card){
    fetch(`/dashboard/${id}`,{
        method: 'DELETE'
    })
        .then(d=>{
            if(d.status == 200){
                members_container.removeChild(card)
            }else{
                alert('operation is not allowed')
            }
        })
}
function blobtoBase64(blob){
    return new Promise((res,rej)=>{
        const reader = new FileReader();
        reader.onloaded = () =>res(reader.result)
        reader.readAsDataURL((blob))
    })
}
function bin2String(array) {
    var result = "";
    for (var i = 0; i < array.length; i++) {
        //debugger
        result += String.fromCharCode(array[i]);
    }
    return result;
}
function renderList(list){
    list.forEach(async girl=>{
    let card = document.createElement('div')
        card.className = 'card m-3'
        card.style.width = '18rem'

        card.innerHTML= `
          <img src="data:image/jpeg;base64,${bin2String(girl.img.data)}" class="card-img-top" alt="${girl.name}">
          <div class="card-body">
            <h5 class="card-title">${girl.name}</h5>
            <p class="card-text">${girl.hobbies}</p>
            <p class="card-text">${girl.favbook}</p>
            <p class="card-text">${girl.surpfacts}</p>
            <p class="card-text">${girl.extra}</p>
          </div>
    `
            if(girl.id){
                let button = document.createElement('button')
                button.className = 'btn btn-danger'
                button.innerText = 'Delete'
                button.onclick= function(){
                    deleteRecord(girl.id,card)
                }
                card.append(button)
            }

        members_container.append(card)


    })
}