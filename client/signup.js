let obj={}

document.querySelectorAll('input').forEach(input=>{
    input.addEventListener('input',(e)=>{
        let {name,value}=e.target;
        obj[name]=value
    })
})


document.querySelector('#signup').addEventListener('click',(e)=>{
    e.preventDefault();
    console.log(obj)
    fetch('/signup',{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(obj)
    })
        .then(respond=>{
            if(respond.status ===400){
                alert('please fullfil all fields')
            }else if(respond.status ===401){
                alert('wrong credentials')
            }else if(respond.status === 200){
                return respond.json()
            }
        })
        .then(data=>{
            window.open(`/dashboard.html`, "_self")
            console.log(data)
        })
})