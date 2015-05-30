export default function convertArgsToOptions(args, argsNames) {
    const obj = {}
    for(let i = 0; i < args.length; i++) {
        obj[argsNames[i]] = args[i]
    }
    return obj
}
