import Car from './car.js';
import Rental from './rental.js';

const BASEURL='/api';

//generiche

function applyFilter(cars,bfs,cfs){

    if(bfs.length===0 && cfs.length===0) //no-filters
        return cars;
    return cars.filter((car)=>{
        if(bfs.length>0 && cfs.length>0){ //sia filtri di marca che di categoria
            for(let bf of bfs) 
                for(let cf of cfs)       
                    if(car.brand===bf && car.category===cf) 
                        return true;
        }else if(bfs.length>0 && cfs.length===0){ //solo filtri di marca
            for(let bf of bfs)    
                if(car.brand===bf) 
                    return true;
        }else if(bfs.length===0 && cfs.length>0){ //solo filtri di categoria
            for(let cf of cfs)    
                if(car.category===cf) 
                    return true;
        }
        return false;
});
}




async function getCars(bfs,cfs){
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/cars', {
            method: 'GET',
        }).then((response) => {
            const status = response.status;
            if (response.ok) {
                response.json()
                .then((obj) => { resolve( applyFilter(obj.map((c) => Car.from(c)),bfs,cfs) )}) 
                .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

//
async function checkAvailabilityPrice(categ,kmd,eta,guidAdd,ass,dataI,dataF){
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/rentals/'+categ+'/'+kmd+'/'+eta+'/'+guidAdd+'/'+ass+'/'+dataI+'/'+dataF, {
            method: 'GET',
        }).then((response) => {
            const status = response.status;
            if (response.ok) {
                response.json()
                .then((obj) => { resolve( [obj.nA,obj.price,obj.carID] )}) 
                .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function paymentCheck(payObj,csrfToken){
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
            },
            body: JSON.stringify(payObj),
        }).then((response) => {
            const status = response.status;
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function addRental(rentObj,csrfToken){
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/rentals/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
            },
            body: JSON.stringify(rentObj),
        }).then((response) => {
            const status = response.status;
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function getRentalsByUser(){
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/rentals', {
            method: 'GET',
        }).then((response) => {
            const status = response.status;
            if (response.ok) {
                response.json()
                .then((obj) => { resolve(obj.map((r) => Rental.from(r)))}) 
                .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function deleteRental(rental, csrfToken) {
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/rentals/' + rental.rentalID, {
            method: 'DELETE',
            headers: {
                'X-CSRF-Token': csrfToken,
            },
        }).then((response) => {
            const status = response.status;
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });

}

//login-logout

async function userLogin(username, password) {
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: username, password: password}),
        }).then((response) => {
            if (response.ok) {
                response.json()
                .then((obj) => { resolve(obj); }) 
                .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function getCSRFToken() {
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/csrf-token').then((response) => {
            if (response.ok) {
                response.json()
                    .then((obj) => { resolve(obj); }) 
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function userLogout() {
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                reject(null);
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function getUserInfo() {
    return new Promise((resolve, reject) => {
        fetch(BASEURL + '/user', {
            method: 'GET',
        }).then((response) => {
            const status = response.status;
            if (response.ok) {
                response.json()
                .then((obj) => { resolve(obj) } )
                .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}



const API={getCars,checkAvailabilityPrice,userLogin,getCSRFToken,userLogout,getUserInfo,paymentCheck,addRental,getRentalsByUser,deleteRental};
export default API;

