let obj={}

document.querySelectorAll('input').forEach(input=>{
    input.addEventListener('input',(e)=>{
        let {name,value}=e.target;
        obj[name]=value
    })
})

document.querySelector('button').addEventListener('click',(e)=>{
    e.preventDefault();
    console.log(obj)
    var url_string = window.location;
    var url = new URL(url_string);
    var admin = url.searchParams.get("admin");
    let urlS = `/login${admin? '?admin=true' : ''}` ;
    fetch(urlS,{
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
           // console.log(data)
          ///  alert('ok')
            if(data.admin){
                window.open(`/admin`, "_self")
            }else {
                window.open(`/dashboard.html`, "_self")
            }
                //console.log(data)
        })
})