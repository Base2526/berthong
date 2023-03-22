import NodeCache from "node-cache"

const cache = new NodeCache({ checkperiod: 0 });

const ca_get = (key) =>{
    return cache.has(key) ? cache.get(key) : ""
}

const ca_save = (key, value) =>{
    return cache.set(key, value)
}

const ca_delete = (key) =>{
    return cache.has(key) ? cache.del(key) : false
}

const ca_deletes = (keys) =>{
    return cache.del(keys)
}

module.exports = {
    ca_get,
    ca_save,
    ca_delete,
    ca_deletes
}