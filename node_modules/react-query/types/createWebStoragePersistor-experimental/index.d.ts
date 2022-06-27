import { Persistor } from '../persistQueryClient-experimental';
interface CreateWebStoragePersistorOptions {
    /** The storage client used for setting an retrieving items from cache */
    storage: Storage;
    /** The key to use when storing the cache */
    key?: string;
    /** To avoid spamming,
     * pass a time in ms to throttle saving the cache to disk */
    throttleTime?: number;
}
export declare function createWebStoragePersistor({ storage, key, throttleTime, }: CreateWebStoragePersistorOptions): Persistor;
export {};
