
const BASE = 'http://localhost:3333'
const PAGE_LOGIN = '/session/login'

let access_token
let refresh_token = window.localStorage.getItem('refresh_token')

export function set_session(session) {
    access_token = session.access_token
    refresh_token = session.refresh_token
    window.localStorage.setItem('refresh_token', session.refresh_token)
    window.localStorage.setItem('user', session.user)    
}

export async function refresh_session() {
    if(!refresh_token) {
        return location.assign(PAGE_LOGIN)
    }
    
    const options = {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${refresh_token}`
        }
    }
    
    const response = await fetch(`${BASE}/session`, options)
    const session = await response.json()

    if(!response.ok) {
        return location.assign(PAGE_LOGIN)
    }

    set_session(session)
}

export async function request ({ url, method, body }) {
    // request options
    
    const options = {
        method,
        headers: {},
    }

    if(access_token) {
        options.headers['Authorization'] = `bearer ${access_token}`
    }
    
    if(body) {
        options.headers['Content-Type'] = 'application/json'
        options.body = JSON.stringify(body)
    }
    
    // fetch call
    
    let response = await fetch(`${BASE}${url}`, options)
    let data = await response.json()

    // request unauthorized => refresh + retry
    
    if(response.status === 401 && refresh_token) {
        // refresh

        const refresh_options = {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${refresh_token}`
            }
        }
        
        const refresh_response = await fetch(`${BASE}/session`, refresh_options)
        const session = await refresh_response.json()
        
        // retry
        if(!refresh_response.ok) {
            return location.assign(PAGE_LOGIN)
        }
        
        set_session(session)
        options.headers['Authorization'] = `bearer ${access_token}`
        response = await fetch(`${BASE}${url}`, options)
        data = await response.json()
    }


    if(!response.ok) {
        throw new Error(data && data.message || response.status)
    }

    return data
}

export default request