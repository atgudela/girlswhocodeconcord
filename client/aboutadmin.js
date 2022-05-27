let members_container = document.querySelector('.Acontainer .row')

fetch('/admins')
.then(d=>d.json())
.then(d=> renderList(d))


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
    list.forEach(async admin=>{
    let card = document.createElement('div')
        card.className = 'card m-3'
        card.style.width = '18rem'

        card.innerHTML= `
          <img src="data:image/jpeg;base64,${bin2String(admin.img.data)}" class="card-img-top" alt="${admin.name}">
          <div class="card-body">
            <h5 class="card-title">${admin.name}</h5>
            <p class="card-text">${admin.role}</p>
            <p class="card-text">${admin.description}</p>
            <p class="card-text">${admin.contact}</p>
          </div>
    `
            if(admin.id){
                let button = document.createElement('button')
                button.className = 'btn btn-danger'
                button.innerText = 'Delete'
                button.onclick= function(){
                    deleteRecord(admin.id,card)
                }
                card.append(button)
            }

        members_container.append(card)


    })
}