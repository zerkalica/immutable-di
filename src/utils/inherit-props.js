export default function inheritProps(srcProps, destProps) {
    Object.keys(srcProps || {}).forEach(propName => 
        destProps[propName] = srcProps[propName]
    )
}
