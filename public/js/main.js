const socket = io()


// Elements
const form =  document.getElementById("message-form")
const formInputButton =  document.querySelector("#sendMsg")
const formInputMsg =  document.getElementById("msg")
const formButton =  document.getElementById("send-location")
const message =  document.getElementById("messages")
const message_template =  document.getElementById("message-template").innerHTML
const location_template =  document.getElementById("location-template").innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML





//options
const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix : true})



const autoscroll = () => {
    // New message element
    const $newMessage = message.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = message.offsetHeight

    // Height of messages container
    const containerHeight = message.scrollHeight

    // How far have I scrolled?
    const scrollOffset = message.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        message.scrollTop = message.scrollHeight
    }
}




socket.emit("join",{username,room} , (error) => {

     if(error){
        alert(error)
        location.href = "/"
    }
 

})


socket.on('message' ,(msg) => {
    const html =  Mustache.render(message_template, {
        message : msg.text,
        username : msg.username ,
        createdAt : moment(msg.createdAt).format('h:mm a')
    })
    message.insertAdjacentHTML("beforeend",html)

    autoscroll()
})


socket.on('locationMessage',(location) => {

    const html =  Mustache.render(location_template, {
        location : location.url ,
        username : location.username,
        createdAt : moment(location.createdAt).format('h:mm a')
    })
    message.insertAdjacentHTML("beforeend",html)

    autoscroll()


})



socket.on('roomData', ({ room, users }) => {


    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})



form.addEventListener("submit" , (ev) => {
    
    ev.preventDefault()

    const msg =  document.querySelector("input[name='msg']").value
    formInputButton.setAttribute("disabled","disabled")

    socket.emit("sendMessage",msg ,(msg) => {
        //event acknowledgement
        formInputButton.removeAttribute("disabled")
        formInputMsg.value="";
        formInputMsg.focus()

        console.log(`the message was delivred ${msg}`)
    })


});

document.getElementById("send-location").addEventListener("click" , (ev) => {
    ev.preventDefault()


    if(!navigator.geolocation){
        return true;
    }

    formButton.setAttribute("disabled","disabled")

    navigator.geolocation.getCurrentPosition((position) => {

     socket.emit("sendLocation" , { latitude :position.coords.latitude  ,longitude :position.coords.longitude },(msg) => {
        // to ensure that all passed successfully
        formButton.removeAttribute("disabled")
        console.log(`Location shared! ${msg} `)
     })



        
    })


});

