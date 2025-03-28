import Cookies from 'universal-cookie';

const cookies = new Cookies('checkpoint', { path: '/' });

export const setCookie = ( name, value ) => {
    const currentDate= new Date("2100-01-01")
    
    cookies.set(name, value, { expires: currentDate})
}

export const getCookie = ( name ) => {
    return cookies.get(name)
}

export const removeCookie = ( name ) => {
    cookies.remove(name, { path: '/' })
}

