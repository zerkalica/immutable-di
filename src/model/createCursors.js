export default function createCursors(props: object, path: Array<string>): object {
    const acc = {
        $: {$path: path}
    }
    if (props !== null && typeof props === 'object') {
        const keys = Object.keys(props)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            acc[key] = createCursors(props[key], path.concat(key))
        }
    }
    return acc
}
