import {
    CreateObservableOptions,
    invariant,
    isObservableMap,
    AnnotationsMap,
    makeProperty,
    startBatch,
    endBatch,
    asObservableObject,
    isPlainObject,
    asCreateObservableOptions,
    getEnhancerFromOption
} from "../internal"

export function extendObservable<A extends Object, B extends Object>(
    target: A,
    properties?: B,
    annotations?: AnnotationsMap<B>,
    options?: CreateObservableOptions
): A & B {
    if (process.env.NODE_ENV !== "production") {
        invariant(
            arguments.length >= 2 && arguments.length <= 4,
            "'extendObservable' expected 2-4 arguments"
        )
        invariant(
            typeof target === "object",
            "'extendObservable' expects an object as first argument"
        )
        invariant(
            !isObservableMap(target),
            "'extendObservable' should not be used on maps, use map.merge instead"
        )
        invariant(
            isPlainObject(properties),
            `'extendObservabe' only accepts plain objects as second argument`
        )
        if (annotations && properties)
            Object.keys(annotations).forEach(prop => {
                invariant(
                    prop in properties,
                    `Trying to declare a decorator for unspecified property '${prop}'`
                )
            })
    }
    const o = asCreateObservableOptions(options)
    const adm = asObservableObject(target, o.name, getEnhancerFromOption(o))
    startBatch()
    try {
        const descs = Object.getOwnPropertyDescriptors(properties)
        Object.keys(descs).forEach(key => {
            makeProperty(
                adm,
                properties || target /* TODO or target? */,
                key,
                descs[key],
                !annotations ? true : key in annotations ? annotations[key] : true,
                true
            )
        })
    } finally {
        endBatch()
    }
    return target as any
}
