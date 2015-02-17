import {testFuncMeta, testFunc} from '../../__mocks__/fixture-definition'
export default class GenericAdapter {
    static extractMetaInfo(definition) {
        return testFuncMeta
    }
    static idFromDefinition(definition) {
        return testFunc
    }
}
