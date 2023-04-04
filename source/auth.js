// state

const access_token = window.sessionStorage.getItem('access_token')
const refresh_token = window.localStorage.getItem('refresh_token')

// library
    
async function request({ url, method, headers = {}, body }) {
    if(!headers.authorization && access_token) {
        headers.authorization = `bearer ${access_token}`
    }

    return fetch(`http://localhost:3333${url}`, { method, headers, body })
        .then(res => res.json())
}

if(!access_token && !refresh_token && window.location.pathname !== '/session/login/') {
    window.location.replace('/session/login')
}

if(!access_token && refresh_token) {
    const options = {
        url: '/session',
        method: 'PATCH',
        headers: {
            authorization: `bearer ${refresh_token}`
        }
    }

    request(options)
        .then(session => {
            console.log(session)
            window.sessionStorage.setItem('access_token', session.access_token)
            window.localStorage.setItem('refresh_token', session.refresh_token)        
        })
        .catch(() => {
            window.location.replace('/session/login')       
        })
}