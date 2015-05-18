export default function getInPath(obj, bits) {
    for(let i = 0, j = bits.length; i < j; ++i) {
        obj = obj[bits[i]]
    }
    return obj
}
