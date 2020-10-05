const PUBLIC_VAPID_KEY = 'BOYBdw5jB3oswgWTszKwLil0d_QZ4gWsQIO4hryKFcpU5fM6OmINY1uBCNAY-WfRC1908dm9Y_F4-jBApKNWYxE';

const API_BASE = 'http://localhost:8089/api';
// const API_BASE = 'http://192.168.1.36:8089/api'; // para pruebas desde el movil
let isSubscribe = false;

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
   
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
   
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


const createWorkerSubscription = async () => {
    if ('serviceWorker' in navigator) {
        const register = await navigator.serviceWorker.register('./worker.js', {
            scope: '/'
        });
    
        const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
        });
    
        return subscription;
    }
}

const subscribe = async () => {

    const api = `${API_BASE}/notifications`

    const workerSubscription = await createWorkerSubscription();

    if (!workerSubscription) alert("el navegador no soporta notificaciones")
    console.log("workerSubscription", workerSubscription);

    
    
    try {
        const data = localStorage.getItem("UserData");
        const userData = JSON.parse( data );
        const token = userData.token;
        const option = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer: ${token}`
            },
            body: JSON.stringify(workerSubscription)
        }

        const response = await fetch(`${api}/subscription`, option);
        if (response.ok) {
            isSubscribe = true;
            const json = await response.json();
            return json;
        }
        else {
            throw new Error("error al establecer la conexión");
        }
        
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const form = document.getElementById("form");
form.addEventListener("submit", async (e) => {

    e.preventDefault();
    const user = document.getElementById("user");
    const password = document.getElementById("password");

    const api = `${API_BASE}/auth/login?provider=local`

    const option = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: user.value,
            password: password.value
        })
    }

    try {
        const response = await fetch(`${api}`, option);
        if (response.ok) {

            const json = await response.json();

            localStorage.setItem('UserData', JSON.stringify( json.data ));

            if (!isSubscribe) subscribe();
        } else {
            throw new Error("error al establecer la conexión")
        }
        
    } catch (error) {
        console.log(error);
    }
})

subscribe()
    .then( res => {
        console.log(res)
        console.log("Subscripto")
    })
    .catch( error => console.log(error))