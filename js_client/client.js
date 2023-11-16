const contentContainer = document.getElementById('content-container')
const loginForm = document.getElementById('login-form')
const searchForm = document.getElementById('search-form')
const baseEndpoint = "http://localhost:8000/api"
if (loginForm){
    loginForm.addEventListener('submit',handleLogin)
}
if (searchForm){
    searchForm.addEventListener('submit',handleSearch)
}
function handleLogin(event){
    event.preventDefault()
    let loginFormData = new FormData(loginForm)
    let loginObjectData = Object.fromEntries(loginFormData)
    const loginEndpoint = `${baseEndpoint}/token/`
    let bodyStr = JSON.stringify(loginObjectData)
    const options = {
        method : "POST" ,
        headers : {
            "Content-Type" : "application/json"
        } ,
        body:bodyStr ,
    }
    fetch(loginEndpoint , options)
    .then(response => {
        console.log(response)
        return response.json()
    })
    .then(authData => {
        handleAuthData(authData , getProductList)
    })
    .catch(err => {
        console.log(err)
    })
}
function handleSearch(event){
    event.preventDefault()
    let formData = new FormData(searchForm)
    let data = Object.fromEntries(formData)
    let searchParams = new URLSearchParams(data)
    const endpoint = `${baseEndpoint}/search/?${searchParams}/`
    const headers = {
        "Content-Type" : "application/json" ,
    }
    const authToken = localStorage.getItem('access')
    if (authToken){
        headers['Authorization'] = `Bearer ${authToken}`
    }
    const options = {
        method : "GET" ,
        headers : headers ,
    }
    fetch(endpoint , options)
    .then(response => {
        console.log(response)
        return response.json()
    })
    .then(data => {
        const validData = !!isTokenValid(data)
        if (validData && contentContainer){
            contentContainer.innerHTML = ""
            if (data && data.hits){
                let htmlStr = ""
                for (let result of data.hits){
                    htmlStr += "<li>" + result.title + "</li>"
                }
                contentContainer.innerHTML = htmlStr
                if (data.hits.length === 0) {
                    contentContainer.innerHTML = "<p>No results found</p>"
                }
            }
            else {
                contentContainer.innerHTML = "<p>No results found</p>"
            }
        }
    })
    .catch(err => {
        console.log(err)
    })
}
function handleAuthData(authData , callback){
    localStorage.setItem('access' , authData.access)
    localStorage.setItem('refresh' , authData.refresh)
    if (callback){
        callback()
    }
}
function refresh(){
    const refreshEndpoint = `${baseEndpoint}/token/refresh/`
    const options = {
        method : "POST" ,
        headers : {
            "Content-Type" : "application/json"
        } ,
        body : JSON.stringify({
            'refresh' : localStorage.getItem('refresh')
        }) ,
    }
    fetch(refreshEndpoint , options)
    .then(response => {
        return response.json()
    })
    .then(authData => {
        localStorage.removeItem('access')
        localStorage.setItem('access' , authData.access)
    })
    .catch(err => {
        console.log(err)
    })
}
function writeToContainer(data){
    if (contentContainer){
        contentContainer.innerHTML = "<pre>" + JSON.stringify(data , null , 4) + "</pre>"
    }
}
function getFetchOptions(method , body){
    return {
        method : method === null ? "GET" : method ,
        headers : {
            "Content-Type":"application/json" ,
            "Authorization":`Bearer ${localStorage.getItem('access')}`
        } ,
        body : body ? body : null ,
    }
}
function isTokenValid(jsonData){
    if (jsonData.code && jsonData.code === "token_not_valid"){
        alert("Please login again")
        return false
    }
    return true
}
function validateJWTToken(){
    const  endpoint = `${baseEndpoint}/token/verify/`
    const options = {
        method : "POST" ,
        headers : {
            "Content-Type" : "application/json" ,
        } ,
        body : JSON.stringify ({
            token : localStorage.getItem('access')
        })
    }
    fetch(endpoint , options)
    .then (response => response.json())
    .then (refresh())
}
function getProductList(){
    const endpoint = `${baseEndpoint}/products/`
    const options = getFetchOptions()
    fetch(endpoint , options)
    .then(response => {
        return response.json()
    })
    .then(data => {
        const validData = isTokenValid(data)
        if (validData){
            writeToContainer(data)
        }
    })
}
validateJWTToken()
const searchClient = algoliasearch('OY3J22D44B', '8f0a1a61a0038a6bbd371313cada2584')
const search = instantsearch({
    indexName : 'cfe_Product' ,
    searchClient ,
})
search.addWidgets([
    instantsearch.widgets.searchBox({
        container : '#searchbox' ,
    }) ,
    instantsearch.widgets.clearRefinements({
    container : "#clear-refinements" ,
}) ,
instantsearch.widgets.refinementList({
    container : "#user-list" ,
    attribute : 'user' ,
}) ,
instantsearch.widgets.refinementList({
    container : "#public-list" ,
    attribute : 'public' ,
}) ,
    instantsearch.widgets.hits({
        container : '#hits',
        templates : {
            item : `<div>
                        <div>{{#helpers.highlight}}{ "attribute": "title" }{{/helpers.highlight}}</div>
                        <div>{{#helpers.highlight}}{ "attribute": "body" }{{/helpers.highlight}}</div>
                        <p>{{ user }}</p>
                        <p>\${{ price }}
                    </div>`
        }
    })
])
search.start()