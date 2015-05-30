export default function getDebugPath(args) {
    const [debugPath, name] = args || []
    return (debugPath ? (debugPath + '.') : '') + (name ? name : 'unk')
}
