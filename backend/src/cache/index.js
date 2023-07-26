import NodeCache from "node-cache"
import moment from "moment";

const cache = new NodeCache({ stdTTL: 100, checkperiod: 3600 });
const ca_get = (key) =>{
    console.log("ca_get :", key)

    return cache.has(key) ? cache.get(key) : {}
}

const ca_save = (key, value) =>{
    console.log("ca_save :", key)

    value = {...value, createdAt: moment().format()}
    return cache.set(key, value)
}

const ca_keys = () =>{
    return cache.keys()
}

const ca_delete = (key) =>{
    console.log("ca_delete :", key)

    return cache.has(key) ? cache.del(key) : false
}

const ca_deletes = (keys) =>{
    console.log("ca_deletes :", keys)

    return cache.del(keys)
}

module.exports = {
    ca_get,
    ca_save,
    ca_keys,
    ca_delete,
    ca_deletes
}