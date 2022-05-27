let obj={}

document.querySelectorAll('input').forEach(input=>{
    input.addEventListener('input',(e)=>{
        let {name,value}=e.target;
        obj[name]=value
    })
})

let requestTokenBtn = document.querySelector('#requestToken')

requestTokenBtn.onclick = function(){
    if(obj.login){
        fetch(`/generateToken?name=${obj.login}`)
            .then(res=>res.json())
            .then(data=>{
                let container = requestTokenBtn.closest('.col-12')
                let input = container.querySelector('input')
                requestTokenBtn.classList.add('d-none')
                input.classList.remove('d-none')
                input.value = data.invitationToken
                obj.token = data.invitationToken
            })
    }else{
        alert('input login first')
    }
}