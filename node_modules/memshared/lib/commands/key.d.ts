import { ArrayCallback, Callback } from "../callbacks";
/**
 * DEL key [key ...]
 * Delete a key
 */
export declare function del(key: string, callback?: Callback<string>): string;
/**
 * DUMP key
 * Return a serialized version of the value stored at the specified key.
 */
export declare function dump(): void;
/**
 * EXISTS key [key ...]
 * Determine if a key exists
 */
export declare function exists(key: string, callback: Callback<boolean>): boolean;
/**
 * EXPIRE key seconds
 * Set a key's time to live in seconds
 */
export declare function expire(): void;
/**
 * EXPIREAT key timestamp
 * Set the expiration for a key as a UNIX timestamp
 */
export declare function expireat(): void;
/**
 * KEYS pattern
 * Find all keys matching the given pattern
 */
export declare function keys(pattern: string, callback: ArrayCallback<string>): any[];
/**
 * MIGRATE host port key|"" destination-db timeout [COPY] [REPLACE] [KEYS key [key ...]]
 * Atomically transfer a key from a Redis instance to another one.
 */
export declare function migrate(): void;
/**
 * MOVE key db
 * Move a key to another database
 */
export declare function move(): void;
/**
 * OBJECT subcommand [arguments [arguments ...]]
 * Inspect the internals of Redis objects
 */
export declare function object(): void;
/**
 * PERSIST key
 * Remove the expiration from a key
 */
export declare function persist(): void;
/**
 * PEXPIRE key milliseconds
 * Set a key's time to live in milliseconds
 */
export declare function pexpire(): void;
/**
 * PEXPIREAT key milliseconds-timestamp
 * Set the expiration for a key as a UNIX timestamp specified in milliseconds
 */
export declare function pexpireat(): void;
/**
 * PTTL key
 * Get the time to live for a key in milliseconds
 */
export declare function pttl(): void;
/**
 * RANDOMKEY
 * Return a random key from the keyspace
 */
export declare function randomkey(): void;
/**
 * RENAME key newkey
 * Rename a key
 */
export declare function rename(key: string, newkey: string, callback: Callback<boolean>): boolean;
/**
 * RENAMENX key newkey
 * Rename a key, only if the new key does not exist
 */
export declare function renamenx(): void;
/**
 * RESTORE key ttl serialized-value [REPLACE]
 * Create a key using the provided serialized value, previously obtained using DUMP.
 */
export declare function restore(): void;
/**
 * SORT key [BY pattern] [LIMIT offset count] [GET pattern [GET pattern ...]] [ASC|DESC] [ALPHA] [STORE destination]
 * Sort the elements in a list, set or sorted set
 */
export declare function sort(): void;
/**
 * TOUCH key [key ...]
 * Alters the last access time of a key(s). Returns the number of existing keys specified.
 */
export declare function touch(): void;
/**
 * TTL key
 * Get the time to live for a key
 */
export declare function ttl(): void;
/**
 * TYPE key
 * Determine the type stored at key
 */
export declare function type(key: string, callback: Callback<string>): any;
/**
 * UNLINK key [key ...]
 * Delete a key asynchronously in another thread. Otherwise it is just as DEL, but non blocking.
 */
export declare function unlink(): void;
/**
 * WAIT numslaves timeout
 * Wait for the synchronous replication of all the write commands sent in the context of the current connection
 */
export declare function wait(): void;
/**
 * SCAN cursor [MATCH pattern] [COUNT count]
 * Incrementally iterate the keys space
 */
export declare function scan(): void;
