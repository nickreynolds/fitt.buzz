interface Window {
    readonly createT3TurboElectron: { version: number; doThing: () => void; };
    /**
     * Safe expose node.js API
     * @example
     * window.nodeCrypto('data')
     */
    readonly nodeCrypto: { sha256sum: any; };
}
