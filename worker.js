
self.addEventListener('push', event => {
    const data = event.data.json();
    console.log(data);
    console.log("Notificación recibida");
    // mostrar notificación
    self.registration.showNotification(data.title, {
        body: data.message,
        icon: 'http://digichanges.com/digichanges-logo.png'
    })
})