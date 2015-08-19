import Dep from '../utils/Dep'

// Dep used instead of define/Class to prevent cross-dependencies
@Dep({isClass: true})
export default class BaseDiff {
    diff(from: object, to: object): object {
        return {}
    }

    invert(patch: object): object {
        return patch
    }
}
