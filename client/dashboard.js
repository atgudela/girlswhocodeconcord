

let header = document.querySelector('form>fieldset>legend');
//debugger
    (async ()=>{
       // debugger
        let respond = await fetch('/user')
        let result = await respond.json()

        id = result.user.id;
        name = result.user.name
        header.innerText = `Hi, ${name}`;
    })();//IIFE

let obj={}

document.querySelectorAll('input,textarea').forEach(input=>{
    input.addEventListener('input',(e)=>{
        if(e.target.name === 'img'){
            let fr = new FileReader();
            fr.onload = function(){
                //if(fr.result.length > 200000){
                  //  alert('too big image')
               // }else {
                    obj.img = fr.result.split('base64,')[1]
                console.log(obj.img.slice(0,10))

                    let img = input.closest('div').querySelector('img');
                    img.src=fr.result
                    img.classList.remove('d-none')
               // }
            }
            if(e.target.files[0]) {
                fr.readAsDataURL(e.target.files[0])
                //fr.readAsBinaryString(e.target.files[0])
                //fr.readAsArrayBuffer(e.target.files[0])
            }
        }else {
            let {name, value} = e.target;
            obj[name] = value
        }
        console.log(obj)
    })
})


document.querySelector('#submit').addEventListener('click',(e)=>{
    e.preventDefault();
    console.log(obj)
    fetch('/dashboard',{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({...obj,userid:id})//spread operator
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
            console.log(data)
        })
})