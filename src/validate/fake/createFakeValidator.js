export default function createFakeValidator() {
    return function _createFakeValidator() {
        return function _validate() {
            return []
        }
    }
}
