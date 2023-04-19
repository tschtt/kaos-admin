
// const BASE = 'http://api.kaosrave.com'
const BASE = 'http://localhost:3333'

// errors

class RequestError extends Error {
  constructor(response, data = {}) {
    super(data.message || response.statusText)
    this.name = response.statusText
    this.status = response.status
    this.data = data
    if(Error.captureStackTrace) {
      Error.captureStackTrace(this, RequestError)
    }
  }
}

class UnauthorizedError extends RequestError {
  constructor(message) {
    super({ status: 401, statusText: 'Unauthorized' }, { message: message || 'Unauthorized' })
    if(Error.captureStackTrace) {
      Error.captureStackTrace(this, UnauthorizedError)
    }
  }
}

let access_token
let refresh_token = window.localStorage.getItem('refresh_token')

export function set_session(session) {
    access_token = session.access_token
    refresh_token = session.refresh_token
    window.localStorage.setItem('refresh_token', session.refresh_token)
    window.localStorage.setItem('user', session.user)

    switch (session.user.role.name) {
        case 'producer':
            document.body.querySelectorAll('[only=admin]').forEach(element => element.remove())
            break;
        case 'staff':
            document.body.querySelectorAll('[only=admin]').forEach(element => element.remove())
            document.body.querySelectorAll('[only=producer]').forEach(element => element.remove())
            break;
        default:
            break;
    }
}

export async function refresh_session() {
    if(!refresh_token) {
        throw new UnauthorizedError()
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
        throw new RequestError(response, session)
    }

    set_session(session)
    return session
}

export async function request ({ url, method, headers = {}, body }) {
    // request options
    
    const options = {
        method,
        headers,
    }

    if(access_token) {
        options.headers['Authorization'] = `bearer ${access_token}`
    }

    if(body && body instanceof FormData) {
        options.body = body
    }
    else if(body) {
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
            throw new RequestError(response, data)
        }
        
        set_session(session)
        options.headers['Authorization'] = `bearer ${access_token}`
        response = await fetch(`${BASE}${url}`, options)
        data = await response.json()
    }


    if(!response.ok) {
        console.log(response)
        console.log(data)
        throw new RequestError(response, data)
    }

    return data
}

export function wrapper(listener) {
    return async function (event) {
        try {
            await listener(event)
        } catch (error) {
            if(error.name === 'Unauthorized') {
                return location.href = '/sesion/iniciar'
            }
            if(error.name === 'Forbidden' && error.data.reset_token) {
                return location.href = `/sesion/contraseña/?token=${error.data.reset_token}`
            }
            alert(error)
        }
    }
}

export default request