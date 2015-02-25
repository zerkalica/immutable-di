/**
 * Di service definition - any factory function or class with static __factory or __class property
 */
declare type Definition = () => any;

/**
 * Definition mappable id
 */
declare type DefinitionId = string;

/**
 * Definition meta info dependency interface
 */
declare type DefinitionDepMeta = {
    /**
     * If service factory returns promise - pass it through promise handler to add catch, etc
     */
    promiseHandler: ?(p: Promise) => Promise;
    /**
     * Used, if dependency is a path in state object
     */
    path: string[];
    /**
     * Used, if dependency is a path in state object
     */
    definition: ?Definition;
}

/**
 * Definition meta info
 */
declare type DefinitionMeta = {
    id: DefinitionId;
    /**
     * Name for debugging
     */
    name: string;
    /**
     * Factory function to initialize new object from clas or call factory function
     */
    handler: () => any;
    /**
     * Used for method invoker
     * When invoked handle method invoke this definitions first:
     */
    waitFor: DefinitionDepMeta[];
    /**
     * Dependencies declaration list
     */
    deps: DefinitionDepMeta[];
}

/**
 * State adapter interface - gets part of state by array path
 */
declare interface IStateAdapter {
    /**
     * Get state part by path array
     */
    getIn(path: string[]): any;
}

/**
 * Definition adapter interface: extract meta info from definition
 */
declare interface IDefinitionAdapter {
    idFromDefinition(definition: Definition): DefinitionId;
    extractMetaInfo(definition: Definition): DefinitionMeta;
}

/**
 * Definitions meta info store and cache
 */
declare class MetaInfoCache {
    constructor(definitionAdapter: IDefinitionAdapter);
    get(definition: Definition): DefinitionMeta;
}

/**
 * Provide get object part by array path for raw object
 */
declare class NativeAdapter implements IStateAdapter {
    getIn(path: string[]): any;
}

/**
 * Di-container
 * Create new object by definition
 */
declare class Container {
    constructor(options: {
        state: IStateAdapter;
        globalCache: Map;
        metaInfoCache: MetaInfoCache;
    });
    clear(scope: string): void;
    get(definition: Definition): Promise;
}

/**
 * Invoker
 * Call handle method in definition with tracking deps and waitFor
 */
declare class Invoker {
    constructor(options: {
        actionType: string;
        payload: any;
        container: Container;
        metaInfoCache: MetaInfoCache;
    })

    /**
     * @return Promise - result of handle method in definition
     */
    handle(definition: Definition): Promise;
}

/**
 * Public interface wrapper to container and invoker
 */
declare class ImmutableDi {
    constructor(options: {
        state: IStateAdapter;
        globalCache: Map;
        metaInfoCache: MetaInfoCache;
    });

    /**
     * Clear state cache in di by scope name
     *
     * @param {string} scope Available scopes: 'state', 'global'
     */
    clear(scope: string): void;

    /**
     * Get Promise with definition data by definition prototype
     *
     * @param  {Definition} definition Definition prototyp
     * @return {Promise}               Promise with factory definition data or object
     */
    get(definition: Definition): Promise;

    /**
     * Create invoker instance
     *
     * @param  {string}  actionType action type string
     * @param  {any}     payload    data object to handler
     * @return {Invoker}            method invoker instance
     */
    createMethod(actionType: string, payload: any): Invoker;
}

/**
 * Public di builder factory
 * Creating container
 */
declare function Builder(): (state: IStateAdapter) => ImmutableDi;
